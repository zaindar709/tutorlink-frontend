# TutorLink — Backend API Spec (Admin Dashboard + Tutor Verification)

**Audience:** Backend developer  
**Purpose:** Implement APIs and database schema so the **TutorLink Admin Dashboard** can sign in, list pending tutors from the mobile app, approve/reject them, and make approved tutors visible to students.

> **Urdu summary:** Admin dashboard ke liye backend par `role: admin` wala user chahiye, tutor verification APIs (`GET pending`, `PATCH verify/reject/interview`), aur mobile app se document upload hone par tutor queue mein aana chahiye. Neeche poori API list, schema, aur priority di hui hai.

---

## Base URL

```
https://tutorlink-backend-fxb9.onrender.com
```

Firebase project (mobile + admin): **`tutor-link-62ed9`**

Admin dashboard env:

```env
VITE_API_BASE_URL=https://tutorlink-backend-fxb9.onrender.com
```

---

## 1. Admin Authentication (Missing Today — Must Implement)

Admin dashboard **does not use a separate login API**. Flow:

1. **Firebase Auth** — email/password sign-in or sign-up (same Firebase project as mobile app)
2. **Backend profile** — register/login stores user in MongoDB with `role: "admin"`
3. **Every admin API call** — `Authorization: Bearer <firebaseIdToken>`

### 1.1 Create first admin (one-time)

Admin UI tab: **"Create admin (first time)"** calls:

#### `POST /api/auth/register`

```http
POST /api/auth/register
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json
```

**Request body (admin dashboard sends):**

```json
{
  "firebaseUid": "firebase-local-id-from-token",
  "name": "TutorLink Admin",
  "email": "admin@tutorlink.com",
  "role": "admin"
}
```

**Backend must:**

| Step | Action |
|------|--------|
| 1 | Verify Firebase ID token from `Authorization` header |
| 2 | Ensure `firebaseUid` in body matches token `uid` |
| 3 | Create `User` document with **`role: "admin"`** |
| 4 | Return `{ success: true, data: { user } }` |

**Security recommendation:** Allow `role: "admin"` only if:

- No admin exists yet (first-user bootstrap), **OR**
- Caller email is in `ADMIN_BOOTSTRAP_EMAILS` env var, **OR**
- Manual MongoDB update after Firebase signup

If register rejects `role: "admin"`, admin can still create Firebase account; then run in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@tutorlink.com" },
  { $set: { role: "admin" } }
)
```

#### `POST /api/auth/login`

```http
POST /api/auth/login
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json
```

**Request body:**

```json
{
  "email": "admin@tutorlink.com",
  "firebaseUid": "firebase-local-id"
}
```

**Response `data.user` must include:**

```json
{
  "_id": "...",
  "firebaseUid": "...",
  "name": "TutorLink Admin",
  "email": "admin@tutorlink.com",
  "role": "admin"
}
```

### 1.2 Admin middleware (required on all `/api/admin/*`)

```js
// Pseudocode
async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const decoded = await admin.auth().verifyIdToken(token);
  const user = await User.findOne({ firebaseUid: decoded.uid });

  if (!user) return res.status(401).json({ success: false, message: 'User not found' });
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden — admin role required' });
  }

  req.adminUser = user;
  next();
}
```

| HTTP | When |
|------|------|
| **401** | Missing/invalid/expired token, user not in DB |
| **403** | Valid token but `role !== "admin"` |

---

## 2. Database Schema

### 2.1 `User` collection

```js
{
  _id: ObjectId,
  firebaseUid: String,       // required, unique
  name: String,
  email: String,             // required, unique
  phoneNumber: String,
  role: "student" | "tutor" | "parent" | "admin",  // ADD "admin"
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ firebaseUid: 1 }` unique, `{ email: 1 }` unique

### 2.2 `TutorProfile` collection (extend for verification)

Mobile app uses `/api/tutor/onboarding/*`. Admin reads this profile for the verification queue.

```js
{
  _id: ObjectId,
  user: ObjectId,                    // ref User

  // Expertise (from onboarding step-1)
  subjects: [String],                // e.g. ["Physics"]
  grades: [String],                  // e.g. ["Grade 10", "Grade 11"]
  experienceYears: Number,
  hourlyRate: Number,

  // Verification — CRITICAL for admin + student search
  isVerified: { type: Boolean, default: false },
  onboardingStep: Number,          // 1 = basic, 2 = docs uploaded, etc.
  onboardingStatus: String,        // see status enum below
  verificationStatus: String,      // alias used by admin dashboard (keep in sync)

  // Document URLs (set on POST /api/tutor/onboarding/documents)
  cnicFrontUrl: String,
  cnicBackUrl: String,
  degreeCertificateUrl: String,
  documentsSubmittedAt: Date,

  // Admin actions
  interviewScheduledAt: Date,
  rejectionReason: String,
  adminNotes: String,
  verifiedAt: Date,
  verifiedBy: ObjectId,            // ref User (admin)

  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 Status enum (keep both fields aligned)

Mobile app (`TutorOnboardingStatus`):

```
basic_info → documents_uploaded → under_review → interview_scheduled → approved | rejected
```

Admin dashboard maps these to its UI status:

| Backend value | Admin UI status | `isVerified` | Visible in student search |
|---------------|-----------------|--------------|---------------------------|
| `basic_info` | pending | false | No |
| `documents_uploaded` | pending | false | No |
| `under_review` | pending | false | No |
| `pending` | pending | false | No |
| `interview_scheduled` | interview_scheduled | false | No |
| `approved` | approved | **true** | **Yes** |
| `rejected` | rejected | false | No |

**On document upload (mobile):** set `onboardingStatus` + `verificationStatus` to `"under_review"` or `"documents_uploaded"`, `isVerified: false`, `documentsSubmittedAt: now`.

**On admin approve:** set `isVerified: true`, `verificationStatus: "approved"`, `onboardingStatus: "approved"`, `verifiedAt`, `verifiedBy`.

---

## 3. Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

List endpoints may return:

```json
{ "success": true, "data": [ /* items */ ] }
```

or paginated:

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "limit": 50,
    "total": 12
  }
}
```

Admin dashboard also accepts `data.tutors[]` or root `tutors[]` for tutor lists.

### Error

```json
{
  "success": false,
  "message": "Human readable error",
  "code": "OPTIONAL_ERROR_CODE"
}
```

---

## 4. Complete API List — Admin Dashboard

Below is **every endpoint the admin dashboard calls or expects**. Paths match `admin-dashboard/src/api/admin.api.ts`.

### Priority legend

| Priority | Meaning |
|----------|---------|
| **P0** | Required for tutor to show on admin dashboard |
| **P1** | Required for full admin workflow |
| **P2** | Secondary screens (escrow, links, AI, settings) |

---

### 4.1 Auth (shared with mobile) — P0

| Method | Endpoint | Auth | Used by |
|--------|----------|------|---------|
| `POST` | `/api/auth/register` | Bearer Firebase token | Admin create account |
| `POST` | `/api/auth/login` | Bearer Firebase token | Admin sign-in |
| `GET` | `/api/auth/profile/:id` | Bearer token | Optional profile load |

---

### 4.2 Dashboard stats — P1

```http
GET /api/admin/dashboard/stats
Authorization: Bearer <adminFirebaseToken>
```

**Response `data`:**

```json
{
  "pendingTutors": 5,
  "totalEscrowBalance": 145000,
  "verifiedTutors": 128,
  "totalStudents": 1840,
  "linkedParents": 312,
  "liveClassrooms": 0
}
```

Admin dashboard maps:

- `pendingTutors` → stats card
- `totalEscrowBalance` → Active Escrow Balance
- `verifiedTutors` → approved tutors count
- `totalStudents` → total students

---

### 4.3 Tutor verification queue — P0

#### List pending tutors

```http
GET /api/admin/tutors/pending?page=1&limit=50
Authorization: Bearer <adminFirebaseToken>
```

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default `1` |
| `limit` | number | Default `50` |
| `status` | string | Optional: `pending`, `interview_scheduled` |

**Who appears in this list:**

Tutors where `isVerified === false` AND status is one of:

- `under_review`, `documents_uploaded`, `pending`, `interview_scheduled`

**Response — preferred shape (flat):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "tutorProfileId",
      "user": {
        "_id": "userId",
        "name": "Prof. Ali Ahmed",
        "email": "ali@example.com",
        "phoneNumber": "+923001234567"
      },
      "subjects": ["Physics"],
      "grades": ["Grade 10", "Grade 11"],
      "onboardingStatus": "under_review",
      "verificationStatus": "under_review",
      "isVerified": false,
      "cnicFrontUrl": "/uploads/cnic-front.jpg",
      "cnicBackUrl": "/uploads/cnic-back.jpg",
      "degreeCertificateUrl": "/uploads/degree.pdf",
      "documentsSubmittedAt": "2026-07-21T10:00:00.000Z",
      "interviewScheduledAt": null,
      "rejectionReason": null
    }
  ]
}
```

**Alternative shape (also supported by frontend mapper):**

```json
{
  "success": true,
  "data": {
    "tutors": [ /* same objects */ ]
  }
}
```

Document URLs can be full URLs or paths; dashboard prefixes with `API_BASE_URL` if relative.

---

#### Approve tutor — P0

```http
PATCH /api/admin/tutors/:tutorProfileId/verify
Authorization: Bearer <adminFirebaseToken>
Content-Type: application/json
```

**Request body (admin dashboard sends):**

```json
{
  "isVerified": true,
  "verificationStatus": "approved",
  "adminNotes": "Verified by admin"
}
```

**Backend must set:**

```js
tutorProfile.isVerified = true;
tutorProfile.verificationStatus = 'approved';
tutorProfile.onboardingStatus = 'approved';
tutorProfile.verifiedAt = new Date();
tutorProfile.verifiedBy = req.adminUser._id;
tutorProfile.adminNotes = body.adminNotes;
```

**Effect:** Tutor appears in `POST /api/tutors/search` when student filters `isVerified: true`.

---

#### Reject tutor — P1

```http
PATCH /api/admin/tutors/:tutorProfileId/reject
Authorization: Bearer <adminFirebaseToken>
```

**Request body:**

```json
{
  "verificationStatus": "rejected",
  "rejectionReason": "CNIC document is unclear. Please re-upload."
}
```

**Backend must set:** `isVerified: false`, `verificationStatus: "rejected"`, `onboardingStatus: "rejected"`, save `rejectionReason`.

---

#### Schedule interview — P1

```http
PATCH /api/admin/tutors/:tutorProfileId/interview
Authorization: Bearer <adminFirebaseToken>
```

**Request body (admin dashboard sends):**

```json
{
  "verificationStatus": "interview_scheduled",
  "interviewScheduledAt": "2026-07-23T15:00:00.000Z",
  "adminNotes": "Interview scheduled by admin"
}
```

**Backend must set:** `verificationStatus` + `onboardingStatus` to `"interview_scheduled"`, `interviewScheduledAt`, keep `isVerified: false`.

---

#### Download tutor document (optional) — P2

```http
GET /api/admin/tutors/:tutorProfileId/documents/:documentId
Authorization: Bearer <adminFirebaseToken>
```

Return signed URL for CNIC/degree if files are private in storage.

---

### 4.4 Parent–student links — P2

```http
GET /api/admin/links?page=1&limit=20
Authorization: Bearer <adminFirebaseToken>
```

**Response `data[]`:**

```json
{
  "_id": "linkId",
  "linkId": "linkId",
  "parent": { "name": "Mr. Aslam", "email": "aslam@email.com" },
  "student": { "name": "Ahmed", "email": "ahmed@student.com", "grade": "Grade 10" },
  "linkedAt": "2026-06-20T08:00:00.000Z",
  "status": "active"
}
```

```http
DELETE /api/admin/links/:linkId/revoke
Authorization: Bearer <adminFirebaseToken>
```

Revoke link; return `{ success: true }`.

---

### 4.5 Escrow & billing — P2

```http
GET /api/admin/billing/escrow?page=1&limit=20
Authorization: Bearer <adminFirebaseToken>
```

**Response `data[]` — transaction objects:**

```json
{
  "_id": "...",
  "transactionId": "TXN-001",
  "type": "escrow_hold" | "escrow_release" | "escrow_refund",
  "amount": 5000,
  "escrowStatus": "held" | "disputed" | "released",
  "status": "completed" | "pending",
  "student": { "name": "Student Name" },
  "tutor": { "name": "Tutor Name" },
  "bookingId": "...",
  "disputeReason": "Session not completed",
  "createdAt": "2026-07-21T10:00:00.000Z"
}
```

Dashboard treats rows with `escrowStatus === "disputed"` as disputes.

```http
PATCH /api/admin/billing/disputes/:transactionId/resolve
Authorization: Bearer <adminFirebaseToken>
```

**Request body (admin dashboard sends):**

```json
{
  "action": "refund" | "release",
  "notes": "Resolved from admin dashboard"
}
```

---

### 4.6 AI system health — P2 (not wired yet; UI shows mock)

```http
GET /api/admin/ai/health
GET /api/admin/ai/notes?page=1&limit=20
```

**Health `data`:**

```json
{
  "summarySpeedMs": 1240,
  "tokenHealth": 94,
  "uptime": 99.8,
  "lastSync": "2026-07-21T10:00:00.000Z",
  "notesGeneratedToday": 156,
  "failedSummaries": 3,
  "avgTokensPerSummary": 1050
}
```

---

### 4.7 Admin settings — P2 (not wired yet; UI saves locally)

```http
GET /api/admin/settings
PATCH /api/admin/settings
Authorization: Bearer <adminFirebaseToken>
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

## 5. Mobile App APIs (Feed Admin Queue)

These are **not admin routes** but backend must implement them so tutors appear on the admin dashboard.

| Priority | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| **P0** | `GET` | `/api/tutor/onboarding/status` | Tutor checks approval status |
| **P0** | `PATCH` | `/api/tutor/onboarding/step-1` | Subject + grades |
| **P0** | `POST` | `/api/tutor/onboarding/documents` | Upload CNIC + degree (multipart) |
| **P1** | `POST` | `/api/tutor/onboarding/interview` | Tutor requests interview slot |
| **P0** | `POST` | `/api/tutors/search` | Student search — **filter `isVerified: true`** |

### 5.1 Upload documents (mobile)

```http
POST /api/tutor/onboarding/documents
Authorization: Bearer <tutorFirebaseToken>
Content-Type: multipart/form-data
```

**Form fields:** `cnicFront`, `cnicBack`, `degree` (files)

**After success, backend must:**

1. Save file URLs on `TutorProfile`
2. Set `onboardingStep: 2` (or higher)
3. Set `onboardingStatus` + `verificationStatus` to `"under_review"` or `"documents_uploaded"`
4. Set `isVerified: false`
5. Set `documentsSubmittedAt: new Date()`

→ Tutor should now appear in `GET /api/admin/tutors/pending`.

### 5.2 Tutor onboarding status response

```json
{
  "success": true,
  "data": {
    "onboardingStep": 2,
    "onboardingStatus": "under_review",
    "verificationStatus": "under_review",
    "isVerified": false,
    "subjects": ["Physics"],
    "grades": ["Grade 10"],
    "documentsSubmittedAt": "2026-07-21T10:00:00.000Z",
    "interviewScheduledAt": null,
    "rejectionReason": null,
    "cnicFrontUrl": "...",
    "cnicBackUrl": "...",
    "degreeCertificateUrl": "..."
  }
}
```

### 5.3 Student tutor search

```http
POST /api/tutors/search
Authorization: Bearer <studentFirebaseToken>
```

```json
{
  "subject": "Physics",
  "grade": "Grade 10",
  "isVerified": true
}
```

**Backend must:** return only tutors where `TutorProfile.isVerified === true`.

---

## 6. API Summary Table (Quick Reference)

| # | Priority | Method | Endpoint | Admin screen |
|---|----------|--------|----------|--------------|
| 1 | P0 | POST | `/api/auth/register` | Login — create admin |
| 2 | P0 | POST | `/api/auth/login` | Login — sign in |
| 3 | P0 | GET | `/api/admin/tutors/pending` | Overview, Tutor Verification |
| 4 | P0 | PATCH | `/api/admin/tutors/:id/verify` | Approve tutor |
| 5 | P1 | PATCH | `/api/admin/tutors/:id/reject` | Reject tutor |
| 6 | P1 | PATCH | `/api/admin/tutors/:id/interview` | Schedule interview |
| 7 | P1 | GET | `/api/admin/dashboard/stats` | Overview stats cards |
| 8 | P2 | GET | `/api/admin/links` | Parent-Student Links |
| 9 | P2 | DELETE | `/api/admin/links/:id/revoke` | Revoke link |
| 10 | P2 | GET | `/api/admin/billing/escrow` | Escrow Management |
| 11 | P2 | PATCH | `/api/admin/billing/disputes/:id/resolve` | Resolve dispute |
| 12 | P2 | GET | `/api/admin/tutors/:id/documents/:docId` | Document download |
| 13 | P2 | GET | `/api/admin/ai/health` | AI System Health |
| 14 | P2 | GET | `/api/admin/ai/notes` | AI notes log |
| 15 | P2 | GET/PATCH | `/api/admin/settings` | Settings |

**Mobile (required for queue to populate):**

| # | Priority | Method | Endpoint |
|---|----------|--------|----------|
| M1 | P0 | PATCH | `/api/tutor/onboarding/step-1` |
| M2 | P0 | POST | `/api/tutor/onboarding/documents` |
| M3 | P0 | GET | `/api/tutor/onboarding/status` |
| M4 | P0 | POST | `/api/tutors/search` (with `isVerified` filter) |

---

## 7. End-to-End Test Checklist

1. [ ] Create Firebase admin user via admin dashboard **Create admin (first time)**
2. [ ] Confirm MongoDB user has `role: "admin"`
3. [ ] Sign in on admin dashboard — preview banners disappear
4. [ ] Register tutor on mobile app + complete step-1 (subject/grades)
5. [ ] Upload CNIC + degree on mobile
6. [ ] Confirm tutor in DB: `isVerified: false`, status `under_review` / `documents_uploaded`
7. [ ] `GET /api/admin/tutors/pending` returns that tutor (with admin token)
8. [ ] Admin dashboard **Tutor Verification** table shows the tutor
9. [ ] Admin clicks **Approve** → `PATCH .../verify`
10. [ ] DB: `isVerified: true`, `verificationStatus: "approved"`
11. [ ] Student app search returns the tutor
12. [ ] Tutor app **Check Approval Status** shows approved → **Go to Dashboard**

---

## 8. Backend Environment Variables

```env
MONGODB_URI=...
FIREBASE_PROJECT_ID=tutor-link-62ed9
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
STORAGE_BUCKET=...
ADMIN_BOOTSTRAP_EMAILS=admin@tutorlink.com
```

---

## 9. Frontend Reference Files

| Area | File |
|------|------|
| Admin API client | `admin-dashboard/src/api/admin.api.ts` |
| Admin auth (Firebase + register) | `admin-dashboard/src/services/adminAuth.ts` |
| Admin types | `admin-dashboard/src/types/admin.types.ts` |
| Mobile tutor onboarding | `src/api/tutorOnboarding.api.ts` |
| Mobile auth register/login | `src/api/auth.api.ts` |
| Mobile tutor search | `src/api/tutors.api.ts` |
| Onboarding status types | `src/types/api.types.ts` → `TutorOnboardingStatusData` |

---

## 10. Minimum MVP for “Tutor shows on admin dashboard”

If time is limited, implement **only these** first:

1. **`User.role`** supports `"admin"` + admin middleware on `/api/admin/*`
2. **`POST /api/auth/register`** accepts `role: "admin"` (bootstrap or manual MongoDB)
3. **`POST /api/auth/login`** returns user with role
4. **`POST /api/tutor/onboarding/documents`** saves docs + sets status to `under_review`
5. **`GET /api/admin/tutors/pending`** returns those tutors (admin auth)
6. **`PATCH /api/admin/tutors/:id/verify`** sets `isVerified: true`
7. **`POST /api/tutors/search`** filters by `isVerified: true`

Everything else (escrow, links, AI, settings) can follow in phase 2.
