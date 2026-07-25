# TutorLink Booking Flow — Backend API Specification

This document defines the complete backend contract for the Hire Tutor / Book Now booking system. Frontend currently uses mock data shaped to match these APIs so they can be swapped in without redesigning screens.

---

## 1. Booking lifecycle

```
Student taps Hire Tutor / Book Now
  → GET tutor details + availability
  → Student selects subject, slot, mode
  → POST create booking (status: pending, payment held/authorized)
  → Push notification to Tutor (type: booking_request)
  → Tutor opens request details
  → Tutor Accept | Reject | Unavailable | Suggest slot
  → Push notification to Student (status update)
  → If accepted: session proceeds
  → POST complete session
  → Student submits rating + review
  → Tutor rating aggregates updated
```

### Status enum

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting tutor response |
| `accepted` | Tutor confirmed |
| `rejected` | Tutor declined |
| `unavailable` | Tutor marked slot unavailable / suggested alternative |
| `cancelled` | Cancelled by student or system |
| `completed` | Session finished |

---

## 2. Authentication

All endpoints require:

```http
Authorization: Bearer <Firebase ID token>
```

Role checks:

- Student endpoints: authenticated user `role === student`
- Tutor endpoints: authenticated user `role === tutor`
- Shared: either role, but must be a participant of the booking

Unauthorized → `401`  
Forbidden → `403`

---

## 3. Database collections / fields

### `tutor_profiles`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId / Firebase UID | ref users |
| `subjects` | string[] | |
| `hourlyRate` | number | PKR |
| `experienceYears` | number | |
| `qualification` | string | |
| `bio` | string | |
| `languages` | string[] | |
| `teachingModes` | `online\|physical\|hybrid`[] | |
| `location` | GeoJSON Point + address string | |
| `isVerified` | boolean | |
| `responseTimeMinutes` | number | avg |
| `completedSessions` | number | |
| `successRate` | number | 0–100 |
| `ratingAvg` | number | |
| `ratingCount` | number | |
| `certificates` | `{ title, issuer, year, fileUrl? }[]` | |
| `availability` | weekly slots (see below) | |
| `createdAt` / `updatedAt` | Date | |

### `availability_slots`

| Field | Type |
|-------|------|
| `_id` | ObjectId |
| `tutorId` | ObjectId |
| `date` | `YYYY-MM-DD` |
| `startTime` | `HH:mm` |
| `endTime` | `HH:mm` |
| `isBooked` | boolean |
| `bookingId` | ObjectId? |

### `bookings`

| Field | Type |
|-------|------|
| `_id` | ObjectId |
| `studentId` | ObjectId |
| `tutorId` | ObjectId |
| `subject` | string |
| `date` | `YYYY-MM-DD` |
| `startTime` / `endTime` | `HH:mm` |
| `durationHours` | number |
| `hourlyRateAtBooking` | number |
| `totalAmount` | number |
| `teachingMode` | `online\|physical` |
| `location` | string |
| `meetingLink` | string? |
| `status` | enum above |
| `paymentMethod` | string |
| `paymentStatus` | `pending\|held\|paid\|refunded` |
| `notes` | string? |
| `suggestedSlot` | string? |
| `timeline` | `{ status, at, by, note? }[]` |
| `createdAt` / `updatedAt` | Date |

### `reviews`

| Field | Type |
|-------|------|
| `_id` | ObjectId |
| `bookingId` | ObjectId |
| `studentId` | ObjectId |
| `tutorId` | ObjectId |
| `rating` | 1–5 |
| `comment` | string |
| `createdAt` | Date |

### `notifications` (optional inbox)

| Field | Type |
|-------|------|
| `_id` | ObjectId |
| `userId` | ObjectId |
| `title` / `body` | string |
| `type` | `booking\|reminder\|payment\|…` |
| `data` | map (bookingId, screen, …) |
| `read` | boolean |
| `createdAt` | Date |

---

## 4. Student APIs

### 4.1 Get Tutor Details

`GET /api/tutors/:tutorId`

**Auth:** required (student or public authenticated)

**Success `200`**

```json
{
  "success": true,
  "data": {
    "id": "…",
    "name": "Sara Ahmed",
    "avatarUrl": "…",
    "rating": 4.9,
    "totalReviews": 128,
    "hourlyRate": 2500,
    "availabilityStatus": "available",
    "subjects": ["Mathematics", "Physics"],
    "experienceYears": 6,
    "qualification": "MSc Physics — LUMS",
    "bio": "…",
    "languages": ["English", "Urdu"],
    "teachingMode": "hybrid",
    "location": "Lahore",
    "isVerified": true,
    "responseTime": "Usually replies in 20 min",
    "completedSessions": 340,
    "successRate": 96,
    "accountSummary": {
      "memberSince": "2023-03-01",
      "teachingStyle": "Interactive",
      "preferredGrades": ["9th", "A-Level"]
    },
    "certificates": [],
    "reviews": []
  }
}
```

**Errors:** `404` tutor not found · `401` unauthorized

**Validation:** `tutorId` must be valid ObjectId / UUID

---

### 4.2 Get Tutor Availability

`GET /api/tutors/:tutorId/availability?date=YYYY-MM-DD`

**Auth:** required

**Success `200`**

```json
{
  "success": true,
  "data": {
    "date": "2026-07-28",
    "slots": [
      { "id": "…", "startTime": "17:00", "endTime": "18:00", "available": true }
    ]
  }
}
```

**Errors:** `400` invalid date · `404` tutor not found

**Rules:** Do not return slots overlapping accepted bookings; mark booked slots `available: false`

---

### 4.3 Create Booking Request

`POST /api/bookings`

**Auth:** student

**Body**

```json
{
  "tutorId": "…",
  "subject": "Mathematics",
  "date": "2026-07-28",
  "startTime": "17:00",
  "endTime": "18:00",
  "teachingMode": "online",
  "notes": "Need past papers help",
  "paymentMethodId": "wallet"
}
```

**Validation**

- `tutorId`, `subject`, `date`, `startTime`, `endTime` required
- `endTime` > `startTime`
- Slot must be available
- Student must have sufficient wallet/auth payment method (business rule)
- Cannot double-book same student overlapping time

**Success `201`**

```json
{
  "success": true,
  "message": "Booking request created",
  "data": {
    "id": "…",
    "status": "pending",
    "totalAmount": 2500,
    "paymentStatus": "held",
    "estimatedResponseMinutes": 25,
    "timeline": [{ "status": "pending", "at": "…", "by": "student" }]
  }
}
```

**Side effects**

- Reserve slot (`isBooked=true` soft hold)
- Hold payment escrow if applicable
- FCM to tutor: `type=booking`, `bookingId`, title/body
- Append notification inbox row for tutor

**Errors:** `400` validation · `409` slot unavailable · `402` payment failed · `401/403`

---

### 4.4 Cancel Booking Request

`PATCH /api/bookings/:bookingId/cancel`

**Auth:** student (owner) or tutor (participant)

**Body (optional)**

```json
{ "reason": "Schedule conflict" }
```

**Rules:** Only `pending` or `accepted` (with policy window) can cancel

**Success `200`**

```json
{ "success": true, "data": { "id": "…", "status": "cancelled" } }
```

**Side effects:** release slot, refund/release hold, notify other party

**Errors:** `404` · `409` invalid status transition · `403`

---

### 4.5 Get Student Bookings

`GET /api/bookings?tab=active|pending|past&date=YYYY-MM-DD`

**Auth:** student

**Success `200`**

```json
{
  "success": true,
  "results": 3,
  "data": [ { "_id": "…", "status": "pending", "subject": "…", "tutor": {}, "date": "…", "startTime": "…", "endTime": "…" } ]
}
```

*(Compatible with existing frontend `Booking` type.)*

---

### 4.6 Get Booking Details

`GET /api/bookings/:bookingId`

**Auth:** participant

**Success `200`** — full booking + student/tutor public profiles + timeline + payment summary

**Errors:** `404` · `403`

---

### 4.7 Submit Rating & Review

`POST /api/bookings/:bookingId/reviews`

**Auth:** student who owns completed booking

**Body**

```json
{ "rating": 5, "comment": "Excellent session" }
```

**Validation:** rating 1–5 integer; comment 10–1000 chars; booking `completed`; one review per booking

**Success `201`**

```json
{ "success": true, "data": { "id": "…", "rating": 5, "comment": "…" } }
```

**Side effects:** update tutor `ratingAvg` / `ratingCount`

**Errors:** `400` · `409` already reviewed · `403`

Alias (existing pattern): `POST /api/student/sessions/:bookingId/rate`

---

## 5. Tutor APIs

### 5.1 Get Booking Requests

`GET /api/tutor/bookings?status=pending|accepted|rejected|completed|cancelled`

**Auth:** tutor

**Success `200`** — list of bookings where `tutorId = me`

---

### 5.2 Get Booking Details

`GET /api/tutor/bookings/:bookingId`  
(or shared `GET /api/bookings/:bookingId`)

Must include student public profile: name, avatar, grade, subjects, optional rating, notes.

---

### 5.3 Accept Booking

`PATCH /api/bookings/:bookingId/confirm`

**Auth:** tutor

**Body**

```json
{ "meetingLink": "https://meet.google.com/xxx" }
```

**Rules:** status must be `pending`; slot still free

**Success `200`** — status `accepted`

**Side effects:** FCM to student `Booking accepted`; finalize payment hold; confirm slot

*(Matches existing frontend `confirmBooking`.)*

---

### 5.4 Reject Booking

`PATCH /api/bookings/:bookingId/reject`

**Body**

```json
{ "reason": "Not available that day" }
```

**Success `200`** — status `rejected`  
**Side effects:** release slot/payment; notify student

---

### 5.5 Mark Unavailable

`PATCH /api/bookings/:bookingId/unavailable`

**Body**

```json
{ "reason": "Emergency", "suggestedSlot": "2026-07-29 18:00-19:00" }
```

**Success `200`** — status `unavailable`  
**Side effects:** notify student with optional suggested slot

---

### 5.6 Suggest New Time Slot

`POST /api/bookings/:bookingId/suggest-slot`

**Body**

```json
{
  "date": "2026-07-29",
  "startTime": "18:00",
  "endTime": "19:00",
  "message": "I can do this instead"
}
```

**Success `201`** — creates suggestion record; may set status `unavailable` or keep `pending` with suggestion  
**Notify student**

---

### 5.7 Tutor Booking History

`GET /api/tutor/bookings/history?page=1&limit=20`

Completed / cancelled / rejected archive.

---

### 5.8 Update Booking Status (generic)

`PATCH /api/bookings/:bookingId/status`

**Body**

```json
{ "status": "completed", "note": "Session finished" }
```

**Allowed transitions**

```
pending → accepted | rejected | unavailable | cancelled
accepted → completed | cancelled
completed → (terminal)
```

**Errors:** `409` illegal transition

*(Existing: `PATCH /api/bookings/:id/complete`)*

---

## 6. Shared APIs

### 6.1 Booking Notifications (list)

`GET /api/notifications?type=booking&page=1&limit=30`

### 6.2 Booking Timeline

`GET /api/bookings/:bookingId/timeline`

```json
{
  "success": true,
  "data": [
    { "status": "pending", "at": "…", "by": "student" },
    { "status": "accepted", "at": "…", "by": "tutor" }
  ]
}
```

### 6.3 Real-time status (optional Socket.IO)

Event: `booking:status`  
Payload: `{ bookingId, status, at }`  
Rooms: `user:{userId}`

### 6.4 Session Details

`GET /api/bookings/:bookingId/session`

Meeting link, materials, attendance flags.

### 6.5 Availability Management (tutor)

- `GET /api/tutor/availability`
- `PUT /api/tutor/availability` — replace weekly template
- `POST /api/tutor/availability/slots` — add date-specific slots
- `DELETE /api/tutor/availability/slots/:slotId`

### 6.6 Time Slot Management

- Soft-hold on create booking (TTL e.g. 15–30 min if unpaid)
- Hard-book on accept
- Release on reject/cancel/expire

---

## 7. Push notification contracts (FCM)

Always send `notification` + `data` (string values only):

```json
{
  "notification": { "title": "New booking request", "body": "Zain requested Mathematics" },
  "data": {
    "notificationId": "…",
    "type": "booking",
    "bookingId": "…",
    "screen": "TutorBookingRequestDetailsScreen",
    "createdAt": "ISO-8601"
  }
}
```

| Event | Recipient | `data.screen` suggestion |
|-------|-----------|--------------------------|
| Request created | Tutor | `TutorBookingRequestDetailsScreen` |
| Accepted | Student | `BookingPendingScreen` / Bookings |
| Rejected / Unavailable | Student | `BookingPendingScreen` |
| Reminder (T-30) | Both | Bookings / Chat |
| Completed | Student | `BookingReviewScreen` |

Android channel: `tutorlink_default`

---

## 8. Standard error shape

```json
{
  "success": false,
  "message": "Slot is no longer available",
  "code": "SLOT_UNAVAILABLE"
}
```

| Code | HTTP |
|------|------|
| validation | 400 |
| unauthorized | 401 |
| forbidden | 403 |
| not_found | 404 |
| conflict | 409 |
| payment | 402 |
| server | 500 |

---

## 9. Idempotency & concurrency

- Create booking: unique index on `(tutorId, date, startTime, endTime)` where status ∈ (`pending`,`accepted`)
- Accept/reject: use transactional status check
- Payment hold/release must be idempotent by `bookingId`

---

## 10. Frontend swap notes

Mock service: `src/services/bookings/bookingFlowService.ts`  
Mock data: `src/constants/bookingFlowMockData.ts`

Replace service methods with Axios calls to the endpoints above; keep response mapping in one place so UI screens stay unchanged.

Existing live endpoints already used elsewhere:

- `POST /api/bookings`
- `GET /api/bookings`
- `PATCH /api/bookings/:id/confirm|cancel|complete`

Extend these rather than inventing parallel paths when possible.
