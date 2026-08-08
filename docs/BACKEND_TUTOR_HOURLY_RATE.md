# Backend: Tutor Hourly Rate + Student Booking Flow

**Repo / API base:** `https://tutorlink-backend-fxb9.onrender.com`  
**Mobile app:** TutorLink frontend (student books tutor → tutor Requests → accept → class at chosen time)

This doc is the **backend checklist** so booking stops failing with:

> `TUTOR_UNAVAILABLE` / `Tutor has no hourly rate configured`

Frontend already sends `hourlyRate` and reads it from search/details. The gap is **server persistence + response fields**.

---

## 1. Why it fails today (confirmed from app)

| Step | What happens | Result |
|------|----------------|--------|
| Tutor Edit Profile → Save | App tries `PATCH /api/tutor/profile`, `PATCH /api/tutor/me`, then `PATCH /api/tutor/onboarding/step-1` with `hourlyRate` | `step-1` returns **HTTP 200** |
| Verify | App calls student APIs / tutor details | Still **`hourlyRate = 0` / missing** |
| Student books | `POST /api/bookings` | **400** `TUTOR_UNAVAILABLE` — *"Tutor has no hourly rate configured"* |

**Root cause:** `hourlyRate` is **not persisted** on `TutorProfile` (or not returned by search/details).  
Local phone storage showing `2000` is **not** the source of truth for booking.

`PATCH /api/profile/me` is **student-scoped** → tutors get **403**. Do not rely on it for fee sync.

---

## 2. Booking create rules (server-enforced)

`POST /api/bookings` must require:

1. Tutor `User.role === 'tutor'`
2. Linked `TutorProfile` exists
3. **`TutorProfile.hourlyRate > 0`**
4. **`TutorProfile.availability === true`** (or equivalent flag)
5. **`isVerified === true`** AND **`verificationStatus === 'approved'`**

If any fail → `400` with code `TUTOR_UNAVAILABLE` and a clear `message`.

Body field for tutor id (current mobile contract):

```json
{
  "tutor": "<Tutor User _id>",
  "subject": "Mathematics",
  "date": "2026-08-05",
  "startTime": "2:00 PM",
  "endTime": "3:00 PM"
}
```

Times may be `"2:00 PM"` or `"14:00"`. Date = preferred class time (not “slot lock” at create). Status after create = `pending`.

---

## 3. What backend must CHECK (existing system)

### 3.1 Schema — `TutorProfile`

Confirm these fields exist and are saved:

| Field | Type | Required for booking |
|-------|------|----------------------|
| `user` | ObjectId → User | Yes |
| `hourlyRate` | Number | **Yes (`> 0`)** |
| `availability` | Boolean | **Yes (`true`)** |
| `isVerified` | Boolean | Yes (`true`) |
| `verificationStatus` | String | Yes (`'approved'`) |
| `subjects` / `grades` | arrays | Onboarding |
| `qualification`, `experienceYears`, `bio` | optional | Nice to have |

**Check in DB** for a tutor who “set fee on phone”:

```js
db.tutorprofiles.findOne(
  { user: ObjectId("<tutorUserId>") },
  { hourlyRate: 1, availability: 1, isVerified: 1, verificationStatus: 1 }
)
```

If `hourlyRate` is `null` / `0` / missing → booking will keep failing.

### 3.2 `PATCH /api/tutor/onboarding/step-1`

Today mobile falls back here. Confirm whether handler:

- Only updates `subjects` + `grades`, **or**
- Also updates `hourlyRate` / `availability` when sent

If it ignores unknown fields → **that is the bug** when app sends:

```json
{
  "subject": "Mathematics",
  "grades": ["Grade 10"],
  "hourlyRate": 2000,
  "availability": true
}
```

### 3.3 Student search — `POST /api/tutors/search`

Inspect one returned tutor object. Must include:

```json
{
  "_id": "<TutorProfileId>",
  "user": { "_id": "<UserId>", "name": "...", "avatarUrl": "..." },
  "hourlyRate": 2000,
  "availability": true,
  "isVerified": true,
  "subjects": ["..."]
}
```

If `hourlyRate` is omitted, student UI shows **PKR 0** even when DB has a rate (projection/select bug).

### 3.4 Tutor details — `GET /api/tutors/:id`

Accept **profile `_id` or user `_id`** (mobile tries both). Response `data` must include `hourlyRate`.

### 3.5 Role routing

| Endpoint | Who |
|----------|-----|
| `PATCH /api/profile/me` | Student (tutor → 403 is expected) |
| Tutor fee update | **Tutor-only** route (see §4) |

---

## 4. What backend must ADD (if missing)

### 4.1 P0 — Tutor profile update endpoint

**Add:**

```http
PATCH /api/tutor/profile
Authorization: Bearer <Firebase ID token>
Content-Type: application/json
```

**Auth:** logged-in user with `role: 'tutor'`. Resolve `TutorProfile` by `req.user._id`.

**Body (accept any subset):**

```json
{
  "hourlyRate": 2000,
  "availability": true,
  "qualification": "MSc Mathematics",
  "experienceYears": 5,
  "bio": "...",
  "name": "Yamna",
  "phoneNumber": "+92..."
}
```

**Handler must:**

```js
// pseudo
const profile = await TutorProfile.findOne({ user: req.user._id });
if (!profile) return 404;

if (body.hourlyRate != null) {
  const rate = Number(body.hourlyRate);
  if (!Number.isFinite(rate) || rate <= 0) return 400 VALIDATION_ERROR;
  profile.hourlyRate = Math.round(rate);
}
if (body.availability != null) profile.availability = Boolean(body.availability);
// optional: qualification, experienceYears, bio...
await profile.save();

// optional: sync User.name / phoneNumber

return 200 { success: true, data: profilePopulated };
```

**Also useful aliases (optional):** `PATCH /api/tutor/me` same handler.

### 4.2 P0 — Persist rate in step-1 (compat)

Until mobile fully switches to `/api/tutor/profile`, update step-1:

```js
// PATCH /api/tutor/onboarding/step-1
if (req.body.hourlyRate != null) {
  profile.hourlyRate = Math.round(Number(req.body.hourlyRate));
}
if (req.body.availability != null) {
  profile.availability = Boolean(req.body.availability);
}
// keep existing subject + grades logic
await profile.save();
```

Returning `200` **without** writing `hourlyRate` causes a false “saved” UX.

### 4.3 P0 — Search + details return `hourlyRate`

- `POST /api/tutors/search` — include `hourlyRate` (and `availability`) on every tutor in `data`
- `GET /api/tutors/:id` — same fields; resolve by profile id **or** user id

Example search item:

```json
{
  "_id": "66f...",
  "user": { "_id": "66e...", "name": "Yamna", "email": "yamna@gmail.com" },
  "hourlyRate": 2000,
  "availability": true,
  "isVerified": true,
  "verificationStatus": "approved",
  "subjects": ["Mathematics"],
  "qualification": "lisat",
  "rating": 0
}
```

### 4.4 P1 — Default `availability: true` on approve

On admin verify (`PATCH /api/admin/tutors/:id/verify`), if `availability` is unset, set `availability: true` so approved tutors are bookable once rate is set.

### 4.5 P1 — Clear error messages

Keep code `TUTOR_UNAVAILABLE`, but message should distinguish:

- no rate → `"Tutor has no hourly rate configured"`
- availability off → `"Tutor is not available for booking"`
- not verified → `"Tutor is not verified/approved"`

---

## 5. End-to-end test plan (backend + Postman / app)

Use one **approved** tutor and one **student**.

### A. Tutor sets fee

1. Login as tutor → get Firebase token  
2. `PATCH /api/tutor/profile`  
   ```json
   { "hourlyRate": 2000, "availability": true }
   ```  
3. Expect `200`  
4. DB check: `hourlyRate === 2000`, `availability === true`

### B. Student sees fee

5. Login as student  
6. `POST /api/tutors/search` `{}`  
7. Find that tutor → **`hourlyRate` must be `2000`** (not missing/0)  
8. `GET /api/tutors/<profileId>` and/or `<userId>` → same rate

### C. Student books

9. `POST /api/bookings`  
   ```json
   {
     "tutor": "<tutor User _id>",
     "subject": "Mathematics",
     "date": "2026-08-06",
     "startTime": "2:00 PM",
     "endTime": "3:00 PM"
   }
   ```  
10. Expect `201`, `status: "pending"`  
11. Tutor `GET /api/bookings?date=2026-08-06&tab=pending` → request listed with **student name**

### D. Negative checks

12. Set `hourlyRate: 0` → book → `TUTOR_UNAVAILABLE`  
13. Tutor calls `PATCH /api/profile/me` with rate → may stay **403** (OK); fee path is `/api/tutor/profile`

---

## 6. Minimal “done” definition

Flow works when **all** are true:

- [ ] `PATCH /api/tutor/profile` exists and saves `hourlyRate` + `availability`
- [ ] OR `step-1` actually persists `hourlyRate` when provided
- [ ] DB shows `hourlyRate > 0` after save
- [ ] `POST /api/tutors/search` returns `hourlyRate`
- [ ] `GET /api/tutors/:id` returns `hourlyRate`
- [ ] `POST /api/bookings` succeeds for verified tutor with rate + availability
- [ ] Tutor Requests list shows the new pending booking

---

## 7. Frontend behaviour (for backend context only)

Mobile app will:

1. Prefer `PATCH /api/tutor/profile` / `PATCH /api/tutor/me`
2. Fall back to `PATCH /api/tutor/onboarding/step-1` with `hourlyRate`
3. Verify via `GET /api/tutors/:id` / search rate
4. Block student book UI if rate still `0`
5. Create booking with field **`tutor`** = User `_id` (not only profile id)

If backend implements §4 correctly, **no further frontend change is required** for fee sync.

---

## 8. Suggested implementation order

1. **Persist** `hourlyRate` on `TutorProfile` (profile PATCH + step-1 compat)  
2. **Return** `hourlyRate` on search + GET by id  
3. **Re-test** booking create  
4. Optional: set `availability: true` on admin approve  

---

*Last updated for TutorLink booking/hourly-rate debugging (tutor local draft vs server TutorProfile).*
