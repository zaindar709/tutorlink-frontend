# TutorLink Admin Dashboard — Backend API Specification

This document is for **backend developers**. It defines the REST APIs required to power the TutorLink web admin dashboard and enable **tutor verification** so approved tutors appear in the student mobile app.

---

## Base URL

```
https://tutorlink-backend-fxb9.onrender.com
```

All admin routes are prefixed with `/api/admin`.

---

## Authentication

Every admin request must include a Firebase ID token:

```http
Authorization: Bearer <firebaseIdToken>
```

### Requirements

| Rule | Detail |
|------|--------|
| Token source | Same Firebase Auth used by the mobile app |
| Role check | User must have `role: "admin"` in the database |
| 401 | Invalid/expired token → `{ "success": false, "message": "Unauthorized" }` |
| 403 | Valid token but not admin → `{ "success": false, "message": "Forbidden" }` |

### Recommended middleware

```js
// Pseudocode
async function requireAdmin(req, res, next) {
  const decoded = await verifyFirebaseToken(req.headers.authorization);
  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  req.adminUser = user;
  next();
}
```

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "message": "Human readable error",
  "code": "OPTIONAL_ERROR_CODE"
}
```

---

## Tutor Verification Flow (Critical)

This is the core flow that connects admin dashboard → student app.

### Mobile app behaviour (already implemented)

1. Tutor signs up on mobile → account + tutor profile created
2. Tutor uploads CNIC + degree on `DocumentUploadScreen`
3. Tutor profile is saved with **`isVerified: false`**
4. Student app searches tutors via:

```http
POST /api/tutors/search
```

with optional filter `isVerified: true` (recommended default for student-facing search).

### Admin approval behaviour

| Admin action | Backend must set | Student search result |
|--------------|------------------|----------------------|
| **Approve** | `isVerified: true`, `verificationStatus: "approved"` | Tutor **appears** in search |
| **Schedule Interview** | `verificationStatus: "interview_scheduled"`, `isVerified: false` | Tutor **hidden** from search |
| **Reject** | `verificationStatus: "rejected"`, `isVerified: false` | Tutor **hidden** from search |

> **Important:** `POST /api/tutors/search` must filter `isVerified: true` (or equivalent) for student results. Unverified tutors must never appear to students.

---

## Database Schema Recommendations

### User collection (existing)

```js
{
  _id: ObjectId,
  firebaseUid: String,
  name: String,
  email: String,
  phoneNumber: String,
  role: "student" | "tutor" | "parent" | "admin",
  createdAt: Date
}
```

### TutorProfile collection (extend existing)

```js
{
  _id: ObjectId,
  user: ObjectId,              // ref User
  subjects: [String],          // e.g. ["Physics"]
  grades: [String],            // e.g. ["Grade 10", "Grade 11"]
  experienceYears: Number,
  hourlyRate: Number,
  isVerified: Boolean,         // DEFAULT false on signup
  verificationStatus: String,  // "pending" | "interview_scheduled" | "approved" | "rejected"
  interviewDate: Date,         // optional
  rejectionReason: String,     // optional
  adminNotes: String,          // optional
  documents: [
    {
      type: "cnic_front" | "cnic_back" | "degree",
      label: String,
      url: String,             // cloud storage URL
      uploadedAt: Date
    }
  ],
  submittedAt: Date,           // when documents submitted
  verifiedAt: Date,            // when admin approved
  verifiedBy: ObjectId         // ref admin User
}
```

### On tutor document upload (mobile)

When tutor completes document upload screen, backend should:

```js
tutorProfile.verificationStatus = "pending";
tutorProfile.isVerified = false;
tutorProfile.submittedAt = new Date();
// save document URLs from upload
```

---

## API Endpoints

### 1. Dashboard Overview

```http
GET /api/admin/dashboard
```

Returns all data needed for the admin home screen.

**Response `data`:**

```json
{
  "stats": {
    "pendingTutors": 14,
    "escrowBalance": 145000,
    "linkedParents": 312,
    "liveClassrooms": 42,
    "approvedTutors": 128,
    "totalStudents": 1840
  },
  "pendingTutors": [ /* PendingTutor[] — see below */ ],
  "aiHealth": {
    "summarySpeedMs": 1240,
    "tokenHealth": 94,
    "uptime": 99.8,
    "lastSync": "2026-06-27T10:00:00.000Z",
    "notesGeneratedToday": 156,
    "failedSummaries": 3,
    "avgTokensPerSummary": 1050
  },
  "disputes": [ /* EscrowDispute[] */ ],
  "parentLinks": [ /* ParentStudentLink[] */ ],
  "escrowTransactions": [ /* EscrowTransaction[] */ ],
  "aiNotes": [ /* AiNoteLog[] — last 20 */ ],
  "settings": { /* AdminSettings */ }
}
```

---

### 2. List Pending Tutors

```http
GET /api/admin/tutors/pending
```

**Query params (optional):**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`, `interview_scheduled`, or omit for both |
| `page` | number | Default 1 |
| `limit` | number | Default 20 |

**Response `data`:** `PendingTutor[]`

```json
{
  "id": "tutorProfileId",
  "userId": "userId",
  "name": "Prof. Ali Ahmed",
  "email": "ali.ahmed@tutorlink.com",
  "phone": "+92 300 1234567",
  "expertise": "Physics",
  "grades": ["Grade 10", "Grade 11"],
  "documents": [
    { "id": "doc1", "label": "CNIC Front", "type": "cnic_front", "url": "https://..." },
    { "id": "doc2", "label": "CNIC Back", "type": "cnic_back", "url": "https://..." },
    { "id": "doc3", "label": "Degree PDF", "type": "degree", "url": "https://..." }
  ],
  "status": "pending",
  "submittedAt": "2026-06-25T10:30:00.000Z",
  "interviewDate": null
}
```

---

### 3. Approve Tutor (Direct — No Interview)

```http
PATCH /api/admin/tutors/:tutorProfileId/verify
```

**Request body:**

```json
{
  "isVerified": true,
  "verificationStatus": "approved",
  "adminNotes": "Documents verified. Approved for listing."
}
```

**Backend actions:**

1. Set `isVerified: true`
2. Set `verificationStatus: "approved"`
3. Set `verifiedAt: new Date()`
4. Set `verifiedBy: req.adminUser._id`
5. Optionally send push/email to tutor: "Your profile is now live"

**Response:**

```json
{
  "success": true,
  "message": "Tutor approved and visible to students",
  "data": {
    "tutorProfileId": "...",
    "isVerified": true,
    "verificationStatus": "approved"
  }
}
```

**Student app effect:** Tutor immediately appears in `POST /api/tutors/search` when `isVerified: true` filter is applied.

---

### 4. Schedule Interview (Hold Listing)

```http
PATCH /api/admin/tutors/:tutorProfileId/interview
```

**Request body:**

```json
{
  "verificationStatus": "interview_scheduled",
  "interviewDate": "2026-06-28T15:00:00.000Z",
  "adminNotes": "Video interview scheduled"
}
```

**Backend actions:**

1. Set `verificationStatus: "interview_scheduled"`
2. Set `interviewDate` from body
3. Keep `isVerified: false`
4. Notify tutor with interview date/time

**Response:** Same shape as approve, with `isVerified: false`.

> After interview, admin calls **Approve** endpoint to make tutor visible.

---

### 5. Reject Tutor Application

```http
PATCH /api/admin/tutors/:tutorProfileId/reject
```

**Request body:**

```json
{
  "isVerified": false,
  "verificationStatus": "rejected",
  "rejectionReason": "CNIC document is unclear. Please re-upload."
}
```

**Backend actions:**

1. Set `verificationStatus: "rejected"`
2. Set `isVerified: false`
3. Save `rejectionReason`
4. Notify tutor with reason (optional: allow re-submission)

---

### 6. Get Tutor Document Download URL

```http
GET /api/admin/tutors/:tutorProfileId/documents/:documentId
```

Returns a signed URL for secure document download (CNIC, degree).

```json
{
  "success": true,
  "data": {
    "url": "https://storage.googleapis.com/...",
    "expiresIn": 3600
  }
}
```

---

### 7. Parent-Student Links

```http
GET /api/admin/parent-links
```

**Response `data`:** `ParentStudentLink[]`

```json
{
  "id": "linkId",
  "parentName": "Mr. Aslam",
  "parentEmail": "aslam@email.com",
  "studentName": "Ahmed Aslam",
  "studentEmail": "ahmed@student.com",
  "studentGrade": "Grade 10",
  "linkedAt": "2026-06-20T08:00:00.000Z",
  "status": "active",
  "linkCode": null
}
```

```http
PATCH /api/admin/parent-links/:linkId/revoke
```

Revokes an active parent-student connection.

---

### 8. Escrow & Disputes

```http
GET /api/admin/escrow/summary
```

```json
{
  "data": {
    "totalEscrowBalance": 145000,
    "pendingRefunds": 2,
    "openDisputes": 3
  }
}
```

```http
GET /api/admin/escrow/transactions?page=1&limit=20
```

```http
GET /api/admin/escrow/disputes
```

```http
PATCH /api/admin/escrow/disputes/:disputeId/resolve
```

**Request body:**

```json
{
  "resolution": "refund" | "release" | "dismiss",
  "adminNotes": "Session completed, releasing funds to tutor"
}
```

---

### 9. AI System Health

```http
GET /api/admin/ai/health
```

```json
{
  "data": {
    "summarySpeedMs": 1240,
    "tokenHealth": 94,
    "uptime": 99.8,
    "lastSync": "2026-06-27T10:00:00.000Z",
    "notesGeneratedToday": 156,
    "failedSummaries": 3,
    "avgTokensPerSummary": 1050
  }
}
```

```http
GET /api/admin/ai/notes?page=1&limit=20
```

Returns recent AI session summary logs.

---

### 10. Admin Settings

```http
GET /api/admin/settings
PATCH /api/admin/settings
```

**Settings object:**

```json
{
  "platformName": "TutorLink",
  "supportEmail": "admin@tutorlink.com",
  "autoApproveTutors": false,
  "interviewRequired": true,
  "escrowHoldDays": 3,
  "notifyOnNewTutor": true,
  "notifyOnDispute": true
}
```

---

## Mobile App Integration Checklist

Backend developer + mobile team should verify:

- [ ] Tutor signup creates profile with `isVerified: false`
- [ ] Document upload sets `verificationStatus: "pending"`
- [ ] `POST /api/tutors/search` used by student app filters `isVerified: true`
- [ ] Admin approve sets `isVerified: true`
- [ ] Approved tutor appears in student Home + Search screens
- [ ] Interview-scheduled tutors stay hidden until approved
- [ ] Rejected tutors stay hidden

### Existing mobile search endpoint

```http
POST /api/tutors/search
Authorization: Bearer <studentFirebaseToken>
```

**Request (student app):**

```json
{
  "subject": "Physics",
  "grade": "Grade 10",
  "isVerified": true
}
```

**Backend must:** Only return tutors where `tutorProfile.isVerified === true`.

---

## Document Upload (Mobile → Backend)

When tutor submits documents on mobile, implement:

```http
POST /api/tutors/documents
Authorization: Bearer <tutorFirebaseToken>
Content-Type: multipart/form-data
```

**Fields:**

| Field | Type |
|-------|------|
| `cnicFront` | file (image) |
| `cnicBack` | file (image) |
| `degree` | file (pdf or image) |

**Backend actions:**

1. Upload files to cloud storage (Firebase Storage / S3)
2. Save URLs in `tutorProfile.documents[]`
3. Set `verificationStatus: "pending"`, `isVerified: false`, `submittedAt: now`
4. Optionally notify admin (webhook / email)

---

## Implementation Priority

| Priority | Endpoint | Why |
|----------|----------|-----|
| P0 | `PATCH /api/admin/tutors/:id/verify` | Approve tutors → student visibility |
| P0 | `GET /api/admin/tutors/pending` | Admin review queue |
| P0 | `POST /api/tutors/documents` | Tutor uploads on mobile |
| P0 | Filter `isVerified` in `/api/tutors/search` | Student only sees approved tutors |
| P1 | `PATCH /api/admin/tutors/:id/interview` | Interview workflow |
| P1 | `PATCH /api/admin/tutors/:id/reject` | Reject bad applications |
| P1 | `GET /api/admin/dashboard` | Full dashboard data |
| P2 | Escrow, parent links, AI health endpoints | Secondary admin features |

---

## Environment Variables (Backend)

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
STORAGE_BUCKET=...
ADMIN_NOTIFICATION_EMAIL=admin@tutorlink.com
```

## Environment Variables (Admin Dashboard)

```env
VITE_API_BASE_URL=https://tutorlink-backend-fxb9.onrender.com
```

---

## Testing Approval End-to-End

1. Register tutor on mobile app
2. Upload CNIC + degree documents
3. Confirm tutor has `isVerified: false` in database
4. Confirm tutor does **not** appear in student search
5. Open admin dashboard → Tutor Verification → click **Approve**
6. Confirm `isVerified: true` in database
7. Open student app → Search/Home → tutor **appears**

---

## Contact

For frontend integration questions, refer to:

- Admin dashboard: `admin-dashboard/src/api/admin.api.ts`
- Mobile tutor search: `src/api/tutors.api.ts`
- Mobile types: `src/types/api.types.ts` → `TutorProfile.isVerified`
