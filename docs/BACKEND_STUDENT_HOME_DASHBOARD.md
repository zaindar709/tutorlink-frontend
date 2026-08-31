# Backend: Student Home Dashboard (post–hire)

Audience: Backend / API team  
Frontend: TutorLink React Native student Home tab  
Base URL: `https://tutorlink-backend-fxb9.onrender.com`  
Auth: `Authorization: Bearer <Firebase ID token>`  
Related FE: `StudentHome` switches **FirstTimeHome** → **StudentDashboardHome** when the student has an active tutor relationship.

---

## 1. Product behavior (FE already implemented)

| Student state | Home UI |
|---|---|
| No accepted booking / package | Discovery home (`FirstTimeHome`) — find tutors, AI recommend |
| Has accepted session **or** `hasActiveTutor: true` | Schedule dashboard — greeting with student name, current lesson + Join Room, Quick Access, Daily AI Summaries |

FE also treats these as “hired”:

- `dashboard.hasActiveTutor === true`
- `dashboard.upcomingSessionCount > 0`
- `todaySchedule.currentLessons.length > 0`
- Any Redux booking with `status: accepted|confirmed`

---

## 2. Primary endpoint (extend existing)

```http
GET /api/home/dashboard
Authorization: Bearer <token>
```

Role: **student** (or parent acting for student).

### 2.1 Required response shape

```json
{
  "success": true,
  "data": {
    "hasActiveTutor": true,
    "upcomingSessionCount": 12,
    "todaySchedule": {
      "title": "Today's Schedule",
      "sectionTitle": "Current Lessons",
      "date": "2026-08-09",
      "results": 1,
      "currentLessons": [
        {
          "_id": "<sessionBookingId>",
          "subject": "Calculus",
          "date": "2026-08-09",
          "startTime": "2:00 PM",
          "endTime": "3:00 PM",
          "status": "accepted",
          "isNextSession": true,
          "canJoinRoom": true,
          "packageId": "<packageId>",
          "mode": "monthly_weekdays",
          "meetingLink": null,
          "tutor": {
            "_id": "<tutorUserId>",
            "name": "Dr. Sarah Johnson",
            "avatarUrl": "https://..."
          }
        }
      ]
    },
    "quickAccess": {
      "assignments": { "count": 3, "label": "3 new" },
      "quizzes": { "count": 2, "label": "2 pending" },
      "tests": { "count": 1, "label": "1 upcoming" }
    },
    "aiSummaries": [
      {
        "_id": "<summaryId>",
        "title": "Quadratic Equations - Key Points",
        "subject": "Mathematics",
        "excerpt": "Master the discriminant formula and understand how it...",
        "createdAt": "2026-08-09T10:00:00.000Z",
        "icon": "ruler-square",
        "bookingId": "<sessionBookingId>",
        "sessionId": "<sessionBookingId>"
      }
    ],
    "notifications": {
      "unreadCount": 2,
      "hasUnread": true
    }
  }
}
```

### 2.2 Field rules

| Field | Rules |
|---|---|
| `hasActiveTutor` | `true` if student has ≥1 **accepted** package/session that is not fully past (or any upcoming accepted weekday session). Drives FE home switch. |
| `upcomingSessionCount` | Count of accepted sessions with `endTime > now`. |
| `currentLessons` | Prefer **today’s** upcoming accepted sessions; if none today, include the **global next** session (`isNextSession: true`) so Join Room still shows. |
| `currentLessons[]._id` | Must be the **session Booking `_id`** (classroom `sessionId` / complete / cancel-one-day). Not the package parent id. |
| `isNextSession` | Exactly one soonest upcoming session across tutors (same rule as bookings list). |
| `canJoinRoom` | `true` when booking is accepted and session has not ended (align with classroom join rules). |
| `tutor` | Populated User `_id`, display `name`, optional `avatarUrl`. |
| `quickAccess.*.count` | Integer ≥ 0. |
| `quickAccess.*.label` | Short UI string (e.g. `"3 new"`, `"2 pending"`). |
| `aiSummaries` | Newest first. Empty array `[]` is OK (FE shows empty state). |
| `notifications` | Prefer server unread inbox count; FE also merges local inbox. |

### 2.3 When student has no tutor yet

```json
{
  "success": true,
  "data": {
    "hasActiveTutor": false,
    "upcomingSessionCount": 0,
    "todaySchedule": {
      "title": "Today's Schedule",
      "sectionTitle": "Current Lessons",
      "date": "YYYY-MM-DD",
      "results": 0,
      "currentLessons": []
    },
    "quickAccess": {
      "assignments": { "count": 0, "label": "0 new" },
      "quizzes": { "count": 0, "label": "0 pending" },
      "tests": { "count": 0, "label": "0 upcoming" }
    },
    "aiSummaries": [],
    "notifications": { "unreadCount": 0, "hasUnread": false }
  }
}
```

Do **not** omit `todaySchedule` / `quickAccess` / `aiSummaries` — FE expects objects/arrays.

---

## 3. Monthly package integration

After tutor confirms `monthly_weekdays` package:

1. Generate weekday **session** bookings (existing package flow).
2. Dashboard `currentLessons` must list those **session** docs (not the pending package parent).
3. `hasActiveTutor` becomes `true` as soon as sessions are `accepted`.
4. Join classroom / complete / reminder `bookingId` = session `_id`.

---

## 4. Quick Access (assignments / quizzes / tests)

FE currently opens a “coming soon” alert until real APIs exist. Backend should design:

### 4.1 Counts on dashboard (minimum for v1)

Compute `quickAccess` counts for the authenticated student:

| Key | Suggested meaning |
|---|---|
| `assignments` | Incomplete / newly posted assignments across active tutors |
| `quizzes` | Pending / not-yet-submitted quizzes |
| `tests` | Upcoming scheduled tests |

Until content modules ship, return `count: 0` and labels `"0 new"` / `"0 pending"` / `"0 upcoming"`.

### 4.2 Future list endpoints (recommended)

```http
GET /api/student/assignments?status=new|pending|done
GET /api/student/quizzes?status=pending|completed
GET /api/student/tests?status=upcoming|past
```

Each item should include: `_id`, `title`, `subject`, `tutor`, `dueAt` / `scheduledAt`, `status`, `bookingId` / `packageId`.

Not required for the Home UI shell to render — only counts are required on `/api/home/dashboard` for now.

---

## 5. Daily AI Summaries

### 5.1 Data model (suggested)

Collection or embedded docs, e.g. `AiSessionSummary`:

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `student` | ObjectId → User | |
| `tutor` | ObjectId → User | |
| `booking` / `sessionId` | ObjectId → Booking | Session that was summarized |
| `subject` | string | |
| `title` | string | Short headline |
| `excerpt` | string | 1–2 sentence teaser for Home card |
| `body` | string (optional) | Full markdown/text for detail screen later |
| `icon` | string (optional) | Material icon name hint |
| `createdAt` | Date | |

### 5.2 Generation trigger

After a session is **completed** (or ~N minutes after `endTime`):

1. Gather session context (subject, optional chat/notes if available).
2. Call AI provider → produce `title` + `excerpt` (+ optional `body`).
3. Persist summary linked to student + session.
4. Optional FCM: `type: ai_summary`, `screen: Home`.

### 5.3 Dashboard inclusion

`GET /api/home/dashboard` → `aiSummaries`: latest **3–5** for this student, newest first.

Optional later:

```http
GET /api/student/ai-summaries?limit=20
GET /api/student/ai-summaries/:id
```

---

## 6. Notifications unread

`notifications.unreadCount` should match the student notification inbox (same source as push/inbox sync). If a dedicated count endpoint already exists, reuse it inside the dashboard aggregator.

---

## 7. Auth / errors

| Code | When |
|---|---|
| `401` | Missing/invalid Firebase token |
| `403` | Tutor token hitting student dashboard |
| `500` | Unexpected — still prefer empty sections over hard fail when possible |

---

## 8. Implementation checklist (backend)

- [ ] Extend `GET /api/home/dashboard` with `hasActiveTutor`, `upcomingSessionCount`
- [ ] Populate `currentLessons` from **accepted session** bookings (monthly children)
- [ ] Set `isNextSession` / `canJoinRoom` correctly
- [ ] Populate tutor `{ _id, name, avatarUrl }` on each lesson
- [ ] Return stable `quickAccess` counts/labels (zeros OK until content APIs)
- [ ] Return typed `aiSummaries[]` (empty OK)
- [ ] Wire AI summary creation on session complete (or scheduled job)
- [ ] Keep response compatible with students who have not hired anyone yet

---

## 9. Out of scope (frontend later)

- Full Assignments / Quizzes / Tests screens (need list APIs in §4.2)
- AI summary detail screen (needs `GET .../ai-summaries/:id`)
- Month-total escrow pricing (separate package doc)

---

— End — Frontend Home switch + UI are ready; this doc is the contract for dashboard payload completeness.
