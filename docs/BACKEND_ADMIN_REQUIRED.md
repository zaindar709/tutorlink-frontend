# Backend — Admin Dashboard Ke Liye Kya Add Karna Hai

**Ye file backend developer ke liye hai.**  
Poori API detail ke liye dekho: [`admin-dashboard/docs/BACKEND_API.md`](../admin-dashboard/docs/BACKEND_API.md)

**Problem abhi:** Admin dashboard **Preview mode** mein hai — tutors list empty hai kyunki backend par admin role, admin routes, aur tutor verification APIs abhi complete nahi hain.

**Firebase project:** `tutor-link-62ed9`  
**Base URL:** `https://tutorlink-backend-fxb9.onrender.com`

---

## Phase 1 — Pehle Ye 7 Cheezein Banao (MVP)

Inke bina admin dashboard par koi tutor nahi dikhega.

### 1. User schema mein `admin` role

```js
role: {
  type: String,
  enum: ['student', 'tutor', 'parent', 'admin'],  // "admin" add karo
  default: 'student'
}
```

MongoDB index (recommended):

```js
db.users.createIndex({ firebaseUid: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

### 2. Admin account register + login

Admin dashboard **Create admin (first time)** tab ye call karta hai:

#### `POST /api/auth/register`

```http
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json
```

```json
{
  "firebaseUid": "from-firebase-token",
  "name": "TutorLink Admin",
  "email": "admin@tutorlink.com",
  "role": "admin"
}
```

**Karna hai:**
- Firebase token verify karo
- User create karo with `role: "admin"`
- Agar `role: admin` allow nahi karna chahte → pehla admin manually MongoDB se set karo:

```javascript
db.users.updateOne(
  { email: "admin@tutorlink.com" },
  { $set: { role: "admin" } }
)
```

#### `POST /api/auth/login`

```json
{
  "email": "admin@tutorlink.com",
  "firebaseUid": "from-firebase-token"
}
```

Response mein `user.role` return karo — admin dashboard is se check karta hai.

---

### 3. Admin middleware — har `/api/admin/*` route par

```js
async function requireAdmin(req, res, next) {
  // 1. Bearer token se Firebase verify
  // 2. User DB se load (firebaseUid se)
  // 3. user.role === 'admin' ? next() : 403 Forbidden
}
```

| Status | Matlab |
|--------|--------|
| 401 | Token missing / invalid |
| 403 | Token valid lekin `role !== "admin"` |

---

### 4. Tutor document upload ke baad queue mein daalo

Mobile app ye endpoint use karti hai:

#### `POST /api/tutor/onboarding/documents`

`multipart/form-data` — fields: `cnicFront`, `cnicBack`, `degree`

**Upload ke baad TutorProfile update karo:**

```js
{
  cnicFrontUrl: "...",
  cnicBackUrl: "...",
  degreeCertificateUrl: "...",
  onboardingStep: 2,
  onboardingStatus: "under_review",      // ya "documents_uploaded"
  verificationStatus: "under_review",    // same rakho
  isVerified: false,
  documentsSubmittedAt: new Date()
}
```

> Jab tak ye fields set nahi hongi, admin dashboard par tutor **nahi dikhega**.

---

### 5. Pending tutors list — admin dashboard ka main API

#### `GET /api/admin/tutors/pending?page=1&limit=50`

**Auth:** `requireAdmin` middleware

**Return karo:** jin tutors ka `isVerified === false` aur status in mein se ho:
- `under_review`
- `documents_uploaded`
- `pending`
- `interview_scheduled`

**Sample response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "tutorProfileId",
      "user": {
        "_id": "userId",
        "name": "Ali Ahmed",
        "email": "ali@example.com",
        "phoneNumber": "+923001234567"
      },
      "subjects": ["Physics"],
      "grades": ["Grade 10"],
      "onboardingStatus": "under_review",
      "verificationStatus": "under_review",
      "isVerified": false,
      "cnicFrontUrl": "/uploads/cnic-front.jpg",
      "cnicBackUrl": "/uploads/cnic-back.jpg",
      "degreeCertificateUrl": "/uploads/degree.pdf",
      "documentsSubmittedAt": "2026-07-21T10:00:00.000Z"
    }
  ]
}
```

---

### 6. Tutor approve karo

#### `PATCH /api/admin/tutors/:tutorProfileId/verify`

**Auth:** `requireAdmin`

**Request body (admin dashboard bhejta hai):**

```json
{
  "isVerified": true,
  "verificationStatus": "approved",
  "adminNotes": "Verified by admin"
}
```

**Backend set kare:**

```js
isVerified = true
verificationStatus = "approved"
onboardingStatus = "approved"
verifiedAt = new Date()
verifiedBy = req.adminUser._id
```

Iske baad tutor mobile app mein **Check Approval Status** par approved dikhega aur student search mein aa sakta hai.

---

### 7. Student search mein sirf verified tutors

#### `POST /api/tutors/search`

Jab request mein `isVerified: true` ho (student app bhejti hai):

```js
// Sirf ye tutors return karo
TutorProfile.find({ isVerified: true, ...otherFilters })
```

Unverified tutors students ko **kabhi nahi** dikhne chahiye.

---

## Phase 2 — Admin Workflow Complete Karne Ke Liye

| # | Method | Endpoint | Kaam |
|---|--------|----------|------|
| 1 | `PATCH` | `/api/admin/tutors/:id/reject` | Reject + `rejectionReason` save |
| 2 | `PATCH` | `/api/admin/tutors/:id/interview` | Interview schedule (`interviewScheduledAt`) |
| 3 | `GET` | `/api/admin/dashboard/stats` | Overview cards (pending count, escrow, etc.) |
| 4 | `GET` | `/api/tutor/onboarding/status` | Tutor app status check (agar missing ho) |
| 5 | `PATCH` | `/api/tutor/onboarding/step-1` | Subject + grades save (agar missing ho) |

### Reject body

```json
{
  "verificationStatus": "rejected",
  "rejectionReason": "CNIC unclear — re-upload please"
}
```

### Interview body

```json
{
  "verificationStatus": "interview_scheduled",
  "interviewScheduledAt": "2026-07-23T15:00:00.000Z",
  "adminNotes": "Video call scheduled"
}
```

### Dashboard stats response

```json
{
  "success": true,
  "data": {
    "pendingTutors": 5,
    "totalEscrowBalance": 0,
    "verifiedTutors": 10,
    "totalStudents": 100,
    "linkedParents": 0,
    "liveClassrooms": 0
  }
}
```

---

## Phase 3 — Baqi Admin Screens (Baad Mein)

Ye endpoints admin dashboard call karta hai lekin abhi UI mock/local data use karti hai:

| Method | Endpoint | Screen |
|--------|----------|--------|
| `GET` | `/api/admin/links?page=1&limit=20` | Parent-Student Links |
| `DELETE` | `/api/admin/links/:linkId/revoke` | Link revoke |
| `GET` | `/api/admin/billing/escrow?page=1&limit=20` | Escrow Management |
| `PATCH` | `/api/admin/billing/disputes/:transactionId/resolve` | Dispute resolve |
| `GET` | `/api/admin/ai/health` | AI System Health |
| `GET` | `/api/admin/ai/notes?page=1&limit=20` | AI notes log |
| `GET/PATCH` | `/api/admin/settings` | Settings page |
| `GET` | `/api/admin/tutors/:id/documents/:docId` | Secure document download |

---

## TutorProfile — Zaroori Fields (Summary)

```js
{
  user: ObjectId,
  subjects: [String],
  grades: [String],
  isVerified: Boolean,              // default false
  onboardingStep: Number,
  onboardingStatus: String,
  verificationStatus: String,       // onboardingStatus ke sath sync rakho
  cnicFrontUrl: String,
  cnicBackUrl: String,
  degreeCertificateUrl: String,
  documentsSubmittedAt: Date,
  interviewScheduledAt: Date,
  rejectionReason: String,
  adminNotes: String,
  verifiedAt: Date,
  verifiedBy: ObjectId
}
```

### Status flow

```
basic_info
  → documents_uploaded / under_review   (mobile upload ke baad)
  → interview_scheduled                 (admin interview schedule)
  → approved                            (admin approve → isVerified: true)
  → rejected                            (admin reject)
```

---

## Test Kaise Karein

1. Admin dashboard → **Create admin (first time)** → email/password
2. Agar 403 aaye → MongoDB mein `role: "admin"` set karo
3. Sign in → preview banner hat jana chahiye
4. Mobile se tutor signup + documents upload karo
5. Postman se test karo:

```http
GET /api/admin/tutors/pending
Authorization: Bearer <admin-firebase-token>
```

6. Tutor list mein entry aani chahiye
7. Admin dashboard se **Approve** dabao
8. DB check: `isVerified: true`
9. Student app search mein tutor dikhe

---

## Quick Checklist (Copy for Backend Dev)

```
[ ] User schema: role "admin" supported
[ ] POST /api/auth/register — accepts role: "admin"
[ ] POST /api/auth/login — returns user.role
[ ] requireAdmin middleware on /api/admin/*
[ ] POST /api/tutor/onboarding/documents — sets under_review + doc URLs
[ ] GET /api/admin/tutors/pending — returns unverified tutors
[ ] PATCH /api/admin/tutors/:id/verify — sets isVerified: true
[ ] POST /api/tutors/search — filters isVerified: true for students
[ ] PATCH /api/admin/tutors/:id/reject (phase 2)
[ ] PATCH /api/admin/tutors/:id/interview (phase 2)
[ ] GET /api/admin/dashboard/stats (phase 2)
```

---

## Frontend Reference

| File | Kaam |
|------|------|
| `admin-dashboard/src/api/admin.api.ts` | Admin API calls |
| `admin-dashboard/src/services/adminAuth.ts` | Admin register/login |
| `src/api/tutorOnboarding.api.ts` | Mobile tutor upload |
| `src/api/tutors.api.ts` | Student tutor search |

**Full spec:** [`admin-dashboard/docs/BACKEND_API.md`](../admin-dashboard/docs/BACKEND_API.md)
