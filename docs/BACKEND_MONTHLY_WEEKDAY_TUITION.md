# Backend: Monthly Mon–Fri tuition packages

Real-life tuition model: student enrolls with a tutor for ~1 month. Classes run **every weekday (Mon–Fri)** at a fixed time. **Sat / Sun = no class**.

## Goals

- One student request → tutor accept → many weekday **session** bookings.
- Student **Active** tab always shows the **next upcoming** accepted session (`endTime > now`).
- Ended sessions move to **Past**.
- **Reminders** (~15 min before start) to **student and tutor**.

## Create booking

```http
POST /api/bookings
Authorization: Bearer <Firebase ID token>
Content-Type: application/json
```

```json
{
  "tutor": "<tutorUserId>",
  "tutorId": "<tutorUserId>",
  "subject": "Computer Science",
  "date": "2026-08-11",
  "startTime": "6:00 PM",
  "endTime": "7:30 PM",
  "mode": "monthly_weekdays",
  "durationDays": 30
}
```

| Field | Notes |
|-------|--------|
| `date` | First preferred class day (should be a weekday; skip weekends) |
| `startTime` / `endTime` | Fixed daily class window |
| `mode` | `"monthly_weekdays"` = generate Mon–Fri sessions for ~`durationDays` |
| `durationDays` | Default `30` (calendar days from `date`) |

**Success `201`:** create a **pending package** (or first pending session with `packageId`). Do **not** spam the tutor with 20 separate pending rows — one request is enough.

Suggested package fields:

- `packageId` (same as package `_id` or shared UUID)
- `mode: "monthly_weekdays"`
- `durationDays`
- `status: "pending"` until confirm

## Confirm (tutor accept)

```http
PATCH /api/bookings/:packageId/confirm
```

On accept:

1. Generate one **accepted** booking per Mon–Fri date from `date` through `date + durationDays` (inclusive window), same `startTime`/`endTime`/`subject`/`student`/`tutor`.
2. Skip Saturday and Sunday.
3. Set shared `packageId` / `parentBookingId` on every session.
4. Mark **exactly one** soonest future session with `isNextSession: true` for that student–tutor pair (clear the flag on others).
5. Optional: keep the original package doc as `status: "accepted"` with `kind: "package"`, or convert the first session and attach siblings.

Example generated dates if `date=2026-08-11` (Tue) and `durationDays=30`: all Mon–Fri from Aug 11 through ~Sep 10.

## List tabs (unchanged semantics)

```http
GET /api/bookings?date=YYYY-MM-DD&tab=active|pending|past
```

- `pending` → `status === pending`
- `active` → `status === accepted` **and** session end > now
- `past` → completed/cancelled/missed, **or** accepted but session already ended

`date` = **session calendar day** (YYYY-MM-DD), not “today only”.

## Reminders (FCM)

Reuse [BACKEND_PUSH_NOTIFICATIONS.md](./BACKEND_PUSH_NOTIFICATIONS.md).

**When:** ~15 minutes before each session `startTime` (local timezone of the booking date).

**Who:** student device tokens **and** tutor device tokens.

```js
{
  notification: {
    title: 'Class at 6:00 PM',
    body: 'Your Computer Science class starts at 6:00 PM',
  },
  data: {
    notificationId: `session-reminder-${bookingId}`,
    type: 'reminder',
    bookingId: String(bookingId),
    screen: 'Bookings',
    createdAt: new Date().toISOString(),
  },
}
```

Suggested implementation: cron every minute, find sessions where `startAt - 15m` is in the last tick window and `reminderSentAt` is null, then send and stamp `reminderSentAt`.

## Wallet / escrow

Month package fee can remain “escrow on confirm for first session / existing rules” until product defines a full-month price. Document any month-total formula separately when ready.

## Frontend expectations

App sends `mode: "monthly_weekdays"` and `durationDays: 30` on create. After accept, it loads Active by session dates and schedules a **local inbox reminder backup** on the student device. Tray pushes for both roles still depend on this backend FCM schedule.
