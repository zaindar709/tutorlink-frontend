# TutorLink — Student Profile Sub-Screens API Spec

**Audience:** Backend developer  
**Purpose:** Mobile app ke **Student Profile** sub-screens abhi AsyncStorage / mock data pe chal rahe hain. Neeche woh APIs hain jo frontend wire kar sake — taake Edit Profile, Interests, Certificates, Session History, Notifications, App Settings, Privacy, aur Parent Link **user id ke against** save / load hon.

**Base URL:** `https://tutorlink-backend-fxb9.onrender.com`  
**Firebase project:** `tutor-link-62ed9`  
**Auth (har protected route):**

```http
Authorization: Bearer <firebaseIdToken>
```

Backend token se user resolve kare (`firebaseUid` → `User._id`). **Kabhi path mein student id mat maango** jab token se identify ho sakta ho — preferred pattern: `/api/student/...` ya `/api/profile/...` for “me”.

**Standard success envelope (preferred):**

```json
{
  "success": true,
  "data": { }
}
```

**Standard error:**

```json
{
  "success": false,
  "message": "Human readable error"
}
```

---

## Current frontend status

| Screen | UI file | Data today | Needs backend? |
|--------|---------|------------|----------------|
| Edit Profile | `.../EditProfile/index.tsx` | AsyncStorage local | **P0 — Yes** |
| My Interests | `.../MyInterests/index.tsx` | AsyncStorage local | **P0 — Yes** |
| Certificates | `.../Certificates/index.tsx` | Mock constant | **P1 — Yes** |
| Session History | `.../SessionHistory/index.tsx` | Mock constant | **P1 — Yes** (bookings se derive) |
| Notifications prefs | `.../Notifications/index.tsx` | Mock constant | **P1 — Yes** |
| App Settings | `.../AppSettings/index.tsx` | Local state only | **P2 — Yes** |
| Privacy & Security | `.../PrivacySecurity/index.tsx` | Local state | **P2 — Partial** |
| Link Parent | `.../LinkParentAccount/index.tsx` | Mock code | **P0 — Yes** (stubs already in `profile.api.ts`) |
| Help & Support | `.../HelpSupport/index.tsx` | Static FAQs | Optional CMS later |
| Terms & Policies | `.../TermsPolicies/index.tsx` | Static | Optional CMS later |

Frontend already has stubs in `src/api/profile.api.ts`:

- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `PUT /api/profile/interests`
- `POST /api/profile/link-code/generate`
- `POST /api/profile/link-code/redeem`

---

## Suggested MongoDB models

### 1. Extend `User` (role: student)

```js
{
  firebaseUid: String,      // unique
  name: String,
  email: String,
  phoneNumber: String,
  role: 'student',
  avatarUrl: String,        // uploaded file URL
  // student-specific (can live on User or StudentProfile)
  grade: String,            // "Class 9" | "Class 10" | "Class 11" | "Class 12"
  board: String,            // "Federal Board" | "Punjab Board" | "Sindh Board" | "Cambridge"
  bio: String,
  publicId: String,         // e.g. "TL-STU-20481" — generate on register
  interests: [String],      // subjects
  createdAt, updatedAt
}
```

### 2. `StudentSettings` (one doc per student)

```js
{
  userId: ObjectId,         // ref User, unique
  notifications: {
    booking: Boolean,       // default true
    messages: Boolean,      // default true
    promotions: Boolean,    // default false
    parent: Boolean,        // default true
    quietHoursEnabled: Boolean, // default false
    quietHoursStart: String,    // "22:00" optional
    quietHoursEnd: String,      // "07:00" optional
  },
  app: {
    language: String,       // "en" | "ur" — default "en"
    appearance: String,     // "system" | "light" | "dark" — default "system"
    soundEnabled: Boolean,  // default true
    hapticsEnabled: Boolean,// default true
    autoPlayPreviews: Boolean // default false
  },
  privacy: {
    twoFactorEnabled: Boolean,   // default false (UI shows toggle)
    loginAlerts: Boolean,        // default true
    profileVisibleToTutors: Boolean // default true
  },
  updatedAt: Date
}
```

### 3. `Certificate`

```js
{
  _id: ObjectId,
  studentId: ObjectId,      // ref User
  tutorId: ObjectId,        // ref User (tutor)
  bookingId: ObjectId,      // optional
  title: String,
  subject: String,
  tutorName: String,        // denormalized for fast list
  grade: String,            // "A", "A+", "B+"
  issuedAt: Date,
  fileUrl: String,          // PDF/image download URL (optional)
  createdAt: Date
}
```

### 4. Session history

**Prefer derive from existing `Booking` collection** (status: `completed` | `cancelled` | `missed`).  
Alag collection tabhi banao agar denormalized history chahiye.

### 5. `ParentLink` / link codes

```js
{
  code: String,             // unique, e.g. "TL-AB12-4567"
  studentId: ObjectId,
  expiresAt: Date,
  status: 'active' | 'used' | 'expired',
  usedByParentId: ObjectId, // set on redeem
  createdAt: Date
}
```

```js
// Linked relationship
{
  studentId: ObjectId,
  parentId: ObjectId,
  linkedAt: Date,
  status: 'active' | 'revoked'
}
```

---

## Auth rule (all student profile APIs)

1. Verify Firebase ID token  
2. Load `User` by `firebaseUid`  
3. Ensure `role === "student"` (except parent redeem may be parent role)  
4. Read/write **only that user’s** documents  

---

# APIs by screen

## 1. Edit Profile — **P0**

**UI fields today:** `name`, `email`, `phone`, `grade`, `board`, `bio`, `avatarUri`

### `GET /api/profile/me`

Returns logged-in student profile for Edit Profile + Profile tab.

**Response `data`:**

```json
{
  "_id": "userObjectId",
  "name": "Ahmed Khan",
  "email": "ahmed.khan@student.com",
  "phoneNumber": "+92 300 9876543",
  "grade": "Class 10",
  "board": "Federal Board",
  "bio": "Focused on Physics and Mathematics.",
  "avatarUrl": "https://.../uploads/avatars/xyz.jpg",
  "publicId": "TL-STU-20481",
  "interests": ["Physics", "Mathematics", "Chemistry"],
  "role": "student"
}
```

### `PATCH /api/profile/me`

Save profile against authenticated user id.

**Request:**

```json
{
  "name": "Ahmed Khan",
  "phoneNumber": "+92 300 9876543",
  "grade": "Class 10",
  "board": "Federal Board",
  "bio": "Preparing for board exams.",
  "avatarUrl": "https://.../uploads/avatars/xyz.jpg"
}
```

**Notes:**
- `email` change optional — usually keep Firebase email as source of truth; if allow change, sync carefully  
- Validate `grade` ∈ `Class 9|10|11|12`  
- Validate `board` ∈ `Federal Board|Punjab Board|Sindh Board|Cambridge`  
- Return updated profile in `data`

### `POST /api/profile/avatar` (multipart) — **P0**

Avatar upload from image picker.

```http
Content-Type: multipart/form-data
```

| Field | Type |
|-------|------|
| `avatar` | file (image/jpeg, image/png, max ~5MB) |

**Response `data`:**

```json
{
  "avatarUrl": "https://tutorlink-backend-fxb9.onrender.com/uploads/avatars/..."
}
```

Frontend then calls `PATCH /api/profile/me` with that URL (or backend can set `User.avatarUrl` in same request).

---

## 2. My Interests — **P0**

**UI fields:** `interests: string[]`, `grade` (class)

Subject options used in app:

```
Mathematics, Physics, Chemistry, Biology, Programming, English,
Economics, History, Geography, Art, Music, Business, Psychology, Philosophy
```

### `PUT /api/profile/interests`

**Request:**

```json
{
  "interests": ["Physics", "Mathematics"],
  "grade": "Class 10"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "interests": ["Physics", "Mathematics"],
    "grade": "Class 10",
    "interestsCount": 2
  }
}
```

**Rules:**
- Min 1 interest  
- Max ~20  
- Persist on `User` / `StudentProfile` by authenticated `userId`  
- `grade` update yahan bhi allow (UI class + subjects ek saath save karti hai)

### `GET /api/profile/interests` (optional)

```json
{
  "interests": ["Physics", "Mathematics"],
  "grade": "Class 10"
}
```

(Ya ye fields `GET /api/profile/me` mein already aa jayein — preferred.)

---

## 3. Certificates — **P1**

### `GET /api/student/certificates?filter=all|recent&page=1&limit=20`

**Response `data`:**

```json
{
  "items": [
    {
      "id": "certObjectId",
      "title": "Physics Mastery",
      "subject": "Physics",
      "tutorName": "Prof. Ali Ahmed",
      "issuedAt": "2026-06-12",
      "grade": "A",
      "fileUrl": "https://.../certificates/cert1.pdf"
    }
  ],
  "total": 3
}
```

`filter=recent` → last 30 days (or last 2 items — document your choice).

### `GET /api/student/certificates/:id/download`

Redirect / signed URL for PDF. Frontend shows download icon.

**Who creates certificates?** Tutor/admin after milestone — out of student UI scope, but student only **lists/downloads**.

---

## 4. Session History — **P1**

### `GET /api/student/sessions/history?status=all|completed|cancelled|missed&page=1&limit=20`

Derive from bookings where `studentId = me` and status is past.

**Response `data`:**

```json
{
  "items": [
    {
      "id": "bookingObjectId",
      "tutorName": "Prof. Ali Ahmed",
      "subject": "Physics — Waves",
      "date": "2026-07-18",
      "time": "4:00 PM – 5:00 PM",
      "duration": "60 min",
      "status": "completed",
      "rating": 5
    }
  ],
  "total": 12
}
```

**Mapping tips:**
- `status`: `completed` | `cancelled` | `missed`  
- `rating`: student-given rating if exists, else omit  
- Format `date` / `time` / `duration` server-side for display OR return ISO + let frontend format (ISO preferred long-term)

### Optional: `POST /api/student/sessions/:bookingId/rate`

```json
{ "rating": 5, "review": "Great session" }
```

---

## 5. Notifications preferences — **P1**

### `GET /api/student/settings/notifications`

```json
{
  "booking": true,
  "messages": true,
  "promotions": false,
  "parent": true,
  "quietHoursEnabled": false,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "07:00"
}
```

### `PATCH /api/student/settings/notifications`

```json
{
  "booking": true,
  "messages": false,
  "promotions": false,
  "parent": true,
  "quietHoursEnabled": true
}
```

Upsert `StudentSettings` for authenticated user. Partial update OK.

**Keys frontend expects (ids):** `booking`, `messages`, `promotions`, `parent`

---

## 6. App Settings — **P2**

### `GET /api/student/settings/app`

```json
{
  "language": "en",
  "appearance": "system",
  "soundEnabled": true,
  "hapticsEnabled": true,
  "autoPlayPreviews": false
}
```

### `PATCH /api/student/settings/app`

```json
{
  "language": "en",
  "appearance": "light",
  "soundEnabled": true,
  "hapticsEnabled": false,
  "autoPlayPreviews": true
}
```

**Note:** “Clear cache” client-side only — no API needed.

---

## 7. Privacy & Security — **P2**

### `GET /api/student/settings/privacy`

```json
{
  "twoFactorEnabled": false,
  "loginAlerts": true,
  "profileVisibleToTutors": true
}
```

### `PATCH /api/student/settings/privacy`

```json
{
  "twoFactorEnabled": true,
  "loginAlerts": true,
  "profileVisibleToTutors": false
}
```

### Password change

Use **Firebase Auth** client-side (`updatePassword` / reset email). Backend optional: log security event.

### `POST /api/student/security/sign-out-all` (optional)

Invalidate refresh sessions / mark `tokenVersion++` if you track sessions.

### `POST /api/student/data-export` (optional / later)

Queue export job; email download link.

---

## 8. Link Parent Account — **P0**

Frontend stubs already call these.

### `POST /api/profile/link-code/generate`

Student-only. Create short-lived code.

**Response `data`:**

```json
{
  "code": "TL-XK9P-4821",
  "expiresAt": "2026-07-22T12:00:00.000Z",
  "expiresInMinutes": 30,
  "status": "active"
}
```

### `POST /api/profile/link-code/redeem`

Parent role. Body:

```json
{ "code": "TL-XK9P-4821" }
```

Creates parent↔student link; marks code `used`.

### `GET /api/profile/linked-parents`

Student list of linked parents:

```json
{
  "items": [
    {
      "id": "linkId",
      "name": "Parent Name",
      "email": "parent@email.com",
      "linkedAt": "2026-07-01T10:00:00.000Z"
    }
  ]
}
```

### `DELETE /api/profile/linked-parents/:linkId`

Unlink / revoke.

---

## Combined settings (optional convenience)

Instead of three settings endpoints, one is fine:

### `GET /api/student/settings`  
### `PATCH /api/student/settings`

```json
{
  "notifications": { "booking": true, "messages": true, "promotions": false, "parent": true, "quietHoursEnabled": false },
  "app": { "language": "en", "appearance": "system", "soundEnabled": true, "hapticsEnabled": true, "autoPlayPreviews": false },
  "privacy": { "twoFactorEnabled": false, "loginAlerts": true, "profileVisibleToTutors": true }
}
```

Frontend can split later; either style works.

---

## Priority order for backend

| Priority | Endpoint | Unlocks screen |
|----------|----------|----------------|
| **P0** | `GET/PATCH /api/profile/me` | Edit Profile |
| **P0** | `POST /api/profile/avatar` | Edit Profile photo |
| **P0** | `PUT /api/profile/interests` | My Interests |
| **P0** | Link code generate / redeem / list | Link Parent |
| **P1** | `GET /api/student/sessions/history` | Session History |
| **P1** | `GET /api/student/certificates` | Certificates |
| **P1** | Notifications settings GET/PATCH | Notifications |
| **P2** | App + Privacy settings | App Settings / Privacy |

---

## Acceptance checklist

1. [ ] Student logs in → `GET /api/profile/me` returns their profile (not another user)  
2. [ ] Edit Profile save → `PATCH /api/profile/me` → reload shows same values  
3. [ ] Avatar upload → URL persisted on user  
4. [ ] Interests save → stored against same user id; Home/Search recommendations can use later  
5. [ ] Session history lists only that student’s past bookings  
6. [ ] Certificates list only that student’s certs  
7. [ ] Notification toggles persist after app restart  
8. [ ] App settings persist after app restart  
9. [ ] Parent link code works student → parent redeem → linked list shows parent  
10. [ ] Unauthorized access to another student’s id returns **403**

---

## Frontend wiring plan (after APIs ready)

| Layer | Path |
|-------|------|
| API | `src/api/profile.api.ts` (extend) + new `src/api/studentSettings.api.ts` |
| Types | `src/types/api.types.ts` — already has `StudentProfile`, `UpdateProfilePayload`, `UpdateInterestsPayload` |
| Replace local store | `src/services/profile/studentProfileLocalStore.ts` → call APIs |
| Hook | `src/hooks/ui/useStudentProfileLocal.ts` → rename/refactor to server-backed hook |

---

## Urdu summary (backend team)

- Har student ki profile **us ke Firebase login / user id** pe save honi chahiye.  
- Edit Profile: name, phone, grade, board, bio, avatar.  
- Interests: subjects array + class.  
- Certificates & Session History: sirf **read** student ke liye (create tutor/admin / bookings se).  
- Notifications + App Settings + Privacy: ek `StudentSettings` document per user, GET/PATCH.  
- Parent link: generate code (student), redeem (parent), list linked parents.

Pehle **P0** (profile + interests + parent link) complete karo — uske baad frontend in screens ko mock se API pe switch kar dega.
