# TutorLink — AI Class Summary Backend Requirements

**Audience:** Node.js / Express / MongoDB backend developer  
**Product:** TutorLink (1:1 tutoring)  
**Frontend:** React Native CLI (consumes REST + Socket.io only)  
**Date:** August 2026  
**Base URL (production):** `https://tutorlink-backend-fxb9.onrender.com`  
**Auth:** `Authorization: Bearer <Firebase ID token>` on all protected routes  

---

## 0. Non‑negotiables

1. **AI provider API keys MUST NOT exist in the mobile app.** Keys live only in backend env.
2. Mobile app **never** calls OpenAI / Gemini / Whisper / etc. directly.
3. Backend is authoritative for ownership, status, publish, and content.
4. Client may edit draft fields **only as a tutor** via review APIs; forged published content must be rejected.
5. Summary generation runs **after session end**, asynchronously (job queue / worker). Do not block HTTP on LLM latency.

---

## 1. Architecture

```
React Native (TutorLink)
        │  REST + Socket.io (Firebase Bearer)
        ▼
Node.js / Express (existing TutorLink API + Socket.io)
        │
        ├─ Session / Booking service (existing)
        ├─ Classroom signaling (existing Socket.io)
        │
        ▼
Summary Controller / Routes
        │
        ▼
Session end → enqueue Summary Job
        │
        ▼
Speech-to-Text Service  (optional if transcript already exists)
        │
        ▼
Transcript (cleaned, persisted)
        │
        ▼
AI Summary Service → LLM Provider (OpenAI / Gemini / …)
        │
        ▼
Validate structured JSON → MongoDB Summary (status: generated)
        │
        ▼
Notify tutor (FCM + Socket) → Tutor review/edit → Publish
        │
        ▼
Notify student (and linked parent) → Student/Parent UI
```

### Recommended folders (adapt to existing backend layout)

```
services/
  ai/
    summaryService.js
    speechToTextService.js
    promptBuilder.js
    schemaValidator.js
workers/
  summaryWorker.js
models/
  Transcript.js
  Summary.js
controllers/
  summaryController.js
routes/
  summaryRoutes.js
```

Mount routes under `/api/summaries` on the existing Express app.  
Reuse existing Firebase auth middleware and User / Booking models.

---

## 2. Database models

### 2.1 Booking / Session (existing — extend)

Session identity for classroom + summary is the **accepted weekday session Booking `_id`** (same as WebRTC `sessionId`).

Add optional fields (or keep separate Summary docs only):

| Field | Type | Notes |
|---|---|---|
| `summaryStatus` | enum | Mirror of latest summary status (denormalized for list speed) |
| `summaryId` | ObjectId | Ref to Summary |
| `endedAt` | Date | Set when classroom ends / tutor marks complete |
| `durationMinutes` | Number | Computed from start/end or wall clock |

Do **not** break existing booking/package contracts.

### 2.2 Transcript

```js
{
  _id,
  sessionId: ObjectId,      // Booking._id
  bookingId: ObjectId,      // same as sessionId if 1:1
  studentId: ObjectId,
  tutorId: ObjectId,
  source: 'stt' | 'live_chunks' | 'manual_upload',
  language: String,         // e.g. 'en'
  rawText: String,
  cleanedText: String,
  chunks: [{ text, at, speaker? }],
  audioUrl: String,         // optional storage URL
  sttProvider: String,
  sttMeta: Object,
  status: 'pending' | 'ready' | 'failed',
  error: String,
  createdAt, updatedAt
}
```

Unique index: `{ sessionId: 1 }` (one transcript per session).

### 2.3 Summary (AI Summary)

```js
{
  _id,
  sessionId: ObjectId,      // Booking session
  bookingId: ObjectId,
  packageId: ObjectId,      // optional monthly package
  studentId: ObjectId,
  tutorId: ObjectId,
  subject: String,
  sessionDate: String,      // YYYY-MM-DD
  startTime: String,
  endTime: String,
  durationMinutes: Number,

  status: 'not_started' | 'processing' | 'generated' | 'under_review' | 'published' | 'failed',

  // Structured AI content (editable by tutor before publish)
  title: String,
  overview: String,
  topicsCovered: [{ title: String, detail: String }],
  keyPoints: [String],
  importantConcepts: [{ name: String, explanation: String }],
  questionsDiscussed: [String],
  homework: [{ title: String, description: String, dueHint: String }],
  studentStrengths: [String],
  areasToImprove: [String],
  nextSteps: [String],

  // Tutor review
  tutorReview: {
    reviewed: Boolean,
    reviewedAt: Date,
    reviewedBy: ObjectId,
    note: String,           // short public note to student
    privateNotes: String    // NEVER send to student/parent
  },

  // Generation meta (internal — never expose raw to student)
  ai: {
    provider: String,
    model: String,
    promptVersion: String,
    tokensIn: Number,
    tokensOut: Number,
    generatedAt: Date,
    transcriptId: ObjectId,
    attempts: Number,
    lastError: String
  },

  publishedAt: Date,
  createdAt, updatedAt
}
```

Indexes:

- `{ sessionId: 1 }` unique  
- `{ studentId: 1, status: 1, publishedAt: -1 }`  
- `{ tutorId: 1, status: 1, updatedAt: -1 }`  
- `{ packageId: 1 }`  

---

## 3. Session changes

When a WebRTC class ends (tutor or both leave / `classroom-call-ended` / optional `POST .../end`):

1. Verify participant is tutor or student of that booking.
2. Set `endedAt` if not set.
3. If no Summary exists → create with `status: processing` (or `not_started` then immediately enqueue).
4. Enqueue background job `{ type: 'GENERATE_SUMMARY', sessionId }`.
5. Emit Socket `summary-processing`.
6. Return quickly from HTTP (do not await LLM).

Idempotent: if summary already `published`, do not regenerate unless admin/force retry.

---

## 4. Transcript model

See §2.2.

Preferred FYP path:

1. Class ends.  
2. If audio uploaded → STT → `cleanedText`.  
3. Else if live caption chunks exist → merge → `cleanedText`.  
4. Else mark transcript `failed` and summary `failed` with clear error (or allow tutor to paste notes later — optional).

---

## 5. AI Summary model

See §2.3. Status lifecycle in §10.

---

## 6. REST APIs

All under `/api/summaries` unless noted.  
Auth: Firebase Bearer → resolve Mongo `User`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| `POST` | `/api/summaries/session/:sessionId/end` | tutor, student | Mark session ended; enqueue processing |
| `GET` | `/api/summaries/session/:sessionId` | tutor, student, parent* | Get summary for session |
| `GET` | `/api/summaries/session/:sessionId/status` | tutor, student, parent* | Lightweight status poll |
| `GET` | `/api/summaries/:summaryId` | tutor, student, parent* | Get by id |
| `GET` | `/api/summaries/student` | student, parent* | List for student |
| `GET` | `/api/summaries/tutor` | tutor | List for tutor |
| `PATCH` | `/api/summaries/:summaryId/review` | tutor | Save edits; set `under_review` |
| `POST` | `/api/summaries/:summaryId/publish` | tutor | Publish |
| `POST` | `/api/summaries/session/:sessionId/retry` | tutor | Retry failed generation |

\*Parent: only if linked to student; **published only**.

Also extend existing:

```http
GET /api/home/dashboard
```

Include latest **published** summaries in `aiSummaries[]` (student/parent) and optionally tutor pending counts.

---

## 7. Request / response JSON

### 7.1 End session (trigger)

```http
POST /api/summaries/session/:sessionId/end
```

```json
{ "reason": "call_ended", "endedBy": "tutor" }
```

**201/200**

```json
{
  "success": true,
  "message": "Summary processing started",
  "data": {
    "sessionId": "...",
    "summaryId": "...",
    "status": "processing"
  }
}
```

### 7.2 Status

```http
GET /api/summaries/session/:sessionId/status
```

```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "summaryId": "...",
    "status": "under_review",
    "updatedAt": "2026-08-09T12:00:00.000Z"
  }
}
```

### 7.3 Get summary

```http
GET /api/summaries/:summaryId
```

Student/parent response **must omit** `ai.*` internals and `tutorReview.privateNotes`.

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "sessionId": "...",
    "subject": "Mathematics",
    "title": "Linear Equations",
    "overview": "...",
    "topicsCovered": [{ "title": "Slope", "detail": "..." }],
    "keyPoints": ["..."],
    "importantConcepts": [{ "name": "y = mx + b", "explanation": "..." }],
    "questionsDiscussed": ["..."],
    "homework": [{ "title": "Worksheet 3", "description": "...", "dueHint": "Before next class" }],
    "studentStrengths": ["..."],
    "areasToImprove": ["..."],
    "nextSteps": ["..."],
    "status": "published",
    "durationMinutes": 45,
    "sessionDate": "2026-08-09",
    "startTime": "2:00 PM",
    "endTime": "2:45 PM",
    "tutor": { "_id": "...", "name": "Dr. Sarah", "avatarUrl": "..." },
    "student": { "_id": "...", "name": "Ali", "avatarUrl": "..." },
    "tutorReview": {
      "reviewed": true,
      "reviewedAt": "...",
      "note": "Great effort today."
    },
    "publishedAt": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 7.4 Tutor review (edit)

```http
PATCH /api/summaries/:summaryId/review
```

```json
{
  "title": "...",
  "overview": "...",
  "topicsCovered": [{ "title": "...", "detail": "..." }],
  "keyPoints": ["..."],
  "importantConcepts": [{ "name": "...", "explanation": "..." }],
  "questionsDiscussed": ["..."],
  "homework": [{ "title": "...", "description": "...", "dueHint": "..." }],
  "studentStrengths": ["..."],
  "areasToImprove": ["..."],
  "nextSteps": ["..."],
  "tutorNote": "Optional short note for student",
  "privateNotes": "Internal only"
}
```

Sets `status` → `under_review` (if was `generated` / `under_review`).  
Immutable: `sessionId`, `studentId`, `tutorId`, `generatedAt`, `ai.*`.

### 7.5 Publish

```http
POST /api/summaries/:summaryId/publish
```

```json
{ "confirm": true }
```

**200** → `status: published`, `publishedAt`, notify student + linked parent, emit `summary-published`.

### 7.6 Lists

```http
GET /api/summaries/student?page=1&limit=20&status=published
GET /api/summaries/tutor?page=1&limit=20&status=generated,under_review
```

```json
{
  "success": true,
  "data": {
    "items": [ /* summary cards */ ],
    "pagination": { "page": 1, "limit": 20, "total": 42, "hasMore": true }
  }
}
```

Card fields: `_id`, `title`, `subject`, `sessionDate`, `durationMinutes`, `status`, `tutor`/`student`, `tutorReview.reviewed`, short `overview`.

---

## 8. Authentication

- Verify Firebase ID token (existing middleware).
- Load `User` by `firebaseUid`.
- Attach `req.user` with Mongo `_id` and `role` (`student` | `tutor` | `parent`).

---

## 9. Authorization rules

| Action | Allowed |
|---|---|
| End session / trigger | Participant tutor or student of booking |
| View while `processing`/`generated`/`under_review`/`failed` | **Tutor** of session; student sees limited processing UI only (no draft body) |
| View full content | Tutor always (own); student/parent only if `published` |
| Review/edit | Tutor owner only |
| Publish | Tutor owner only |
| Retry | Tutor owner only |
| Parent | Linked parent of student; **published only** |

Return `403` on violation. Never trust client-supplied `studentId` / `tutorId` for ownership.

---

## 10. Summary status lifecycle

```
not_started
    → processing          (job started)
    → generated           (LLM success, awaiting tutor)
    → under_review        (tutor opened/saved edits)
    → published           (visible to student/parent)

Any active state may → failed on STT/LLM/validation error
failed → processing       (retry)
```

Frontend displays copy based on these exact strings.

---

## 11. Socket.io events

Reuse **existing** Socket.io instance (same as chat).  
Emit to user rooms: `user:{userId}`.

| Event | Payload | Recipients |
|---|---|---|
| `summary-processing` | `{ sessionId, summaryId, status }` | tutor, student |
| `summary-generated` | `{ sessionId, summaryId, status }` | tutor |
| `summary-under-review` | `{ sessionId, summaryId, status }` | tutor |
| `summary-published` | `{ sessionId, summaryId, status, title?, subject? }` | student, parent, tutor |
| `summary-failed` | `{ sessionId, summaryId, status, code?, message? }` | tutor (student: generic fail ok) |

REST remains source of truth; sockets are realtime hints. Clients re-fetch on event / app resume.

---

## 12. Tutor review workflow

1. Receive `summary-generated` + FCM.  
2. Open review screen → `GET /api/summaries/:id`.  
3. Edit content → `PATCH .../review`.  
4. Confirm publish → `POST .../publish`.  
5. Student notified.

---

## 13. Student workflow

1. Class ends → processing screen.  
2. Poll/socket until published (or show “waiting for tutor review”).  
3. Notification → Summaries list / detail.  
4. Dashboard “Latest Learning Summary” shows latest published.

Student **cannot** edit or publish.

---

## 14. Parent workflow

1. Linked parent account.  
2. Dashboard / Summaries list: **published only**.  
3. Detail same as student public view.  
4. Never: drafts, failed internals, `privateNotes`, raw AI meta.

---

## 15. Notification requirements

| Event | Who | Title / body (suggested) | `data.type` |
|---|---|---|---|
| Generated | Tutor | “AI summary ready for review” | `ai_summary_review` |
| Published | Student | “Your learning summary is ready.” | `ai_summary` |
| Published | Parent | “New learning summary for {student}.” | `ai_summary` |
| Failed | Tutor | “Summary generation failed — retry?” | `ai_summary_failed` |

`data` should include: `summaryId`, `sessionId`, `screen` (`TutorSummaryReviewScreen` / `StudentSummaryDetailScreen` / `Home`).

Respect user notification preferences if present.

---

## 16. Error responses

Standard envelope:

```json
{ "success": false, "code": "SUMMARY_NOT_FOUND", "message": "..." }
```

| HTTP | Code | When |
|---|---|---|
| 401 | `UNAUTHORIZED` | Bad/missing token |
| 403 | `FORBIDDEN` | Not owner / wrong role |
| 404 | `SUMMARY_NOT_FOUND` | Missing |
| 409 | `ALREADY_PUBLISHED` | Publish twice / edit published without unpublish |
| 422 | `VALIDATION_ERROR` | Bad body / schema |
| 429 | `AI_RATE_LIMIT` | Provider throttle |
| 500 | `INTERNAL_ERROR` | Unexpected |
| 503 | `AI_UNAVAILABLE` | Provider down |

---

## 17. Pagination

Query: `page` (1-based), `limit` (default 20, max 50).  
Response: `{ items, pagination: { page, limit, total, hasMore } }`.

---

## 18. Security

- No AI keys in FE.  
- Sanitize HTML in edited fields.  
- Rate-limit end/retry/publish.  
- Strip `ai` + `privateNotes` for student/parent serializers.  
- Audit log publish/retry.  
- Validate session participants against Booking.

---

## 19. AI integration architecture

```
summaryService.generate(sessionId)
  → load transcript.cleanedText
  → buildPrompt(transcript, subject, studentName?)
  → llm.chat({ model, messages, response_format: json })
  → schemaValidator.validate(json)
  → persist Summary status=generated
  → notify tutor + emit summary-generated
```

Provider-agnostic interface:

```js
async function completeStructuredJson({ system, user, schema }) { /* OpenAI or Gemini */ }
```

---

## 20. Speech-to-text architecture

**Preferred (FYP):**

```
Class ends → finalize audio/transcript → STT → cleaned transcript → AI
```

**Alternative:**

```
Live caption chunks during class → merge on end → AI
```

STT provider configured via env (`STT_PROVIDER`, `STT_API_KEY`). Never expose to mobile.

---

## 21. AI prompt requirements

System prompt must include:

- You are an educational assistant for TutorLink.  
- Use **only** information present in the transcript.  
- **Do not fabricate** topics, homework, questions, weaknesses, or recommendations.  
- If transcript is thin, say so in overview and leave arrays empty rather than inventing.  
- Output **valid JSON only** matching the schema.  
- Keep language clear for students/parents.

---

## 22. Structured JSON schema expected from AI

```json
{
  "title": "string",
  "overview": "string",
  "topicsCovered": [{ "title": "string", "detail": "string" }],
  "keyPoints": ["string"],
  "importantConcepts": [{ "name": "string", "explanation": "string" }],
  "questionsDiscussed": ["string"],
  "homework": [{ "title": "string", "description": "string", "dueHint": "string" }],
  "studentStrengths": ["string"],
  "areasToImprove": ["string"],
  "nextSteps": ["string"]
}
```

Reject / retry if schema invalid.

---

## 23. Background job requirements

**Recommended:** BullMQ + Redis.

**Simple alternative:** in-process queue with `setImmediate` / `Agenda` / Mongo job collection if Redis unavailable.

Flow:

1. `POST .../end` enqueues job, returns `{ status: processing }`.  
2. Worker runs STT → AI → save → socket + FCM.  
3. Concurrency limit (e.g. 2) to protect provider quotas.

---

## 24. Retry / failure handling

- Max attempts (e.g. 3) with exponential backoff.  
- On final failure: `status: failed`, `ai.lastError`, notify tutor.  
- `POST .../retry` resets to `processing` and re-enqueues.  
- Do not auto-retry forever.

---

## 25. Environment variables

```
AI_PROVIDER=openai|gemini|...
AI_API_KEY=
AI_MODEL=
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.3
AI_PROMPT_VERSION=v1

STT_PROVIDER=
STT_API_KEY=
STT_LANGUAGE=en

REDIS_URL=                 # if BullMQ
SUMMARY_JOB_CONCURRENCY=2
SUMMARY_MAX_ATTEMPTS=3

# Existing
MONGODB_URI=
FIREBASE_...=
CLIENT_ORIGIN=
```

---

## 26. Logging

Log (no raw secrets / full transcripts in production logs if PII-sensitive):

- job start/end, sessionId, attempt  
- provider, model, token usage  
- validation failures  
- publish actor + summaryId  

---

## 27. Testing requirements

1. End session → processing status.  
2. Stub LLM → generated → tutor notified.  
3. Tutor edit + publish → student sees content.  
4. Parent cannot see draft.  
5. Student cannot publish.  
6. 403 cross-user access.  
7. Idempotent end.  
8. Retry from failed.  
9. Socket events received.  
10. Dashboard `aiSummaries` only published.

---

## Frontend contract summary (for FE already building against this)

| FE function | Method / path |
|---|---|
| `endSessionForSummary(sessionId)` | `POST /api/summaries/session/:sessionId/end` |
| `getSessionSummary(sessionId)` | `GET /api/summaries/session/:sessionId` |
| `getSummaryStatus(sessionId)` | `GET /api/summaries/session/:sessionId/status` |
| `getSummaryById(summaryId)` | `GET /api/summaries/:summaryId` |
| `getStudentSummaries(params)` | `GET /api/summaries/student` |
| `getTutorSummaries(params)` | `GET /api/summaries/tutor` |
| `reviewSummary(summaryId, data)` | `PATCH /api/summaries/:summaryId/review` |
| `publishSummary(summaryId)` | `POST /api/summaries/:summaryId/publish` |
| `retrySummary(sessionId)` | `POST /api/summaries/session/:sessionId/retry` |

Socket events: `summary-processing` | `summary-generated` | `summary-under-review` | `summary-published` | `summary-failed`.

---

— End of document —  
Backend owns STT + LLM. Mobile consumes TutorLink APIs only.
