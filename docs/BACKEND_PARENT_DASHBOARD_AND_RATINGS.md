# TutorLink — Parent + Rating APIs (Backend ko ye banana hai)

**Kis ke liye:** Backend developer  
**Kya chahiye:** Neeche listed APIs **banao aur deploy karo**. Frontend ab mock / localStorage pe chal raha hai. Jab ye APIs live hon gi, hum unhe integrate karenge taake Parent Dashboard aur Rating **real data** pe chalein.

**Base URL:** `https://tutorlink-backend-fxb9.onrender.com`  
**Firebase:** `tutor-link-62ed9`  
**Har protected call:** `Authorization: Bearer <firebaseIdToken>`

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Human readable error" }
```

| App | Ab kya chal raha hai | APIs ke baad |
|-----|----------------------|--------------|
| Parent web (`parent-dashboard/`, port 5175) | Demo code + fake 0% dashboard | Real parent login, real linked student, real sessions/progress |
| Student app | Rating kabhi API, kabhi local save | Har completed class ki rating Mongo pe save |
| Admin (`admin-dashboard/`) | Ratings Vite file se | Ratings Mongo + admin list/moderate |

---

# Backend: pehle ye 2 lists complete karo

Neeche **exact paths** hain jo frontend call karega. Request/response detail is file ke Part 1 (Parent) aur Part 2 (Rating) mein hai. Pehle **P0** banao — uske baghair integrate nahi ho sakta.

---

## A) Parent ke liye APIs (ye banao)

Parent **web dashboard** ke liye hain. Role: `parent` (auth register/login pe `role: "parent"` already support hona chahiye).

### P0 — bina in ke dashboard real nahi chalega

| # | Method | Path | Frontend kahan use karega |
|---|--------|------|---------------------------|
| 1 | `POST` | `/api/auth/register` | Parent signup (`role: "parent"`) — **existing, parent role confirm karo** |
| 2 | `POST` | `/api/auth/login` | Parent login |
| 3 | `POST` | `/api/auth/google-login` | Parent Google login |
| 4 | `GET` | `/api/parent/me` | Top bar + Settings → Profile |
| 5 | `POST` | `/api/profile/link-code/generate` | **Student app** — Profile → Link Parent (code generate) |
| 6 | `POST` | `/api/parent/link-code/redeem` | Parent web — code paste karke child link. Alias: `POST /api/profile/link-code/redeem` |
| 7 | `GET` | `/api/parent/children` | My Children + Settings → Linked Students |
| 8 | `GET` | `/api/parent/dashboard` | **Main API** — Overview + baaki tabs ka data (profile, stats, children, sessions, progress, weeklyProgress, ai, notifications, settings) |
| 9 | `GET` | `/api/profile/linked-parents` | **Student app** — kaun se parents linked hain |
| 10 | `DELETE` | `/api/parent/children/:studentId` | Parent unlink child |
| 11 | `DELETE` | `/api/profile/linked-parents/:linkId` | **Student app** — parent unlink |

### P1 — tabs real karne ke liye

| # | Method | Path | Frontend kahan use karega |
|---|--------|------|---------------------------|
| 12 | `GET` | `/api/parent/sessions` | Sessions page (filter: all / upcoming / live / completed / cancelled) |
| 13 | `GET` | `/api/parent/progress` | Progress page + Overview charts |
| 14 | `GET` | `/api/parent/notifications` | Notifications list + unread badge |
| 15 | `PATCH` | `/api/parent/notifications/:id/read` | Mark one read |
| 16 | `PATCH` | `/api/parent/notifications/read-all` | Mark all read |
| 17 | `DELETE` | `/api/parent/notifications/:id` | Delete notification |
| 18 | `PATCH` | `/api/parent/me` | Save profile (name, phone) |
| 19 | `GET` | `/api/parent/settings` | Settings load |
| 20 | `PATCH` | `/api/parent/settings` | Notification prefs, privacy, language, theme |

### P2 — baad mein, lekin shape abhi fix karo

| # | Method | Path | Frontend kahan use karega |
|---|--------|------|---------------------------|
| 21 | `GET` | `/api/parent/payments` | Payments page (monthly spend + history) |
| 22 | `GET` | `/api/parent/ai-insights` | Overview → AI Learning Insights |
| 23 | `POST` | `/api/parent/me/avatar` | Change photo |
| 24 | `GET` | `/api/parent/security/sessions` | Active devices |
| 25 | `POST` | `/api/parent/security/sign-out-others` | Sign out other devices |
| 26 | `POST` | `/api/parent/data-export` | Download my data |
| 27 | `GET` | `/api/admin/links` | **Admin** parent–student links |
| 28 | `DELETE` | `/api/admin/links/:linkId/revoke` | **Admin** unlink |

**Parent rule:** parent sirf **linked** student ka data dekh sake. Unlink ke baad `403`. Naya link → progress **0%** jab tak koi completed session na ho.

---

## B) Rating / Review ke liye APIs (ye banao)

Student **completed session** ke baad tutor ko rate karta hai. Ye data tutor profile, search, parent, aur admin pe dikhna chahiye — **Mongo mein save**, Vite `live-ratings.json` production ke liye nahi.

### P0 — bina in ke rating real nahi chalegi

| # | Method | Path | Frontend kahan use karega |
|---|--------|------|---------------------------|
| 1 | `POST` | `/api/student/sessions/:bookingId/rate` | **Student app** RateTutorModal + Booking Review — submit stars + optional review + like |
| 2 | `GET` | `/api/tutors/:tutorId/reviews` | Tutor details → “Student reviews” list + avg |
| 3 | `GET` | `/api/tutors/:tutorId` | Tutor card: `rating` + `totalReviews` (search/details) |
| 4 | `GET` | `/api/admin/tutors/ratings` | **Admin** Tutor Ratings page |

Submit ke saath backend **khud** kare:

- Booking pe `studentRating`, `studentReview`, `ratedAt` set
- Tutor pe average + `totalReviews` + `likeCount` update
- Ek booking = ek rating (`409` if already rated)

### P1 — edit, moderate, keep/remove

| # | Method | Path | Frontend kahan use karega |
|---|--------|------|---------------------------|
| 5 | `PATCH` | `/api/ratings/:ratingId` | Student 7 din ke andar rating/review update |
| 6 | `GET` | `/api/student/sessions/:bookingId/rate` | Is booking ki rating already hai ya nahi |
| 7 | `GET` | `/api/student/ratings` | Student ki apni ratings list |
| 8 | `PATCH` | `/api/admin/ratings/:ratingId` | Admin hide / restore (`status: hidden \| visible`) |
| 9 | `PATCH` | `/api/admin/tutors/:tutorId/rating-decision` | Admin **Keep** (`active`) / **Remove** (`removed`) |

### P2

| # | Method | Path | Frontend kahan use karega |
|---|--------|------|---------------------------|
| 10 | `DELETE` | `/api/ratings/:ratingId` | Student retract (7 din) ya admin remove |
| 11 | `GET` | `/api/tutor/reviews` | Tutor apni received reviews |
| 12 | `GET` | `/api/parent/children/:studentId/ratings` | Parent dekhe child ne kya rate kiya |

**Rating body (submit/update):**

```json
{
  "rating": 5,
  "review": "Optional, max 400 characters",
  "liked": true
}
```

`rating` integer 1–5 required. Sirf **completed** booking. Doosra POST same booking pe → `409` (update ke liye PATCH).

---

## Hum (frontend) kab integrate karenge

1. Backend P0 Parent APIs Postman/live pe kaam karen (`dashboard` + link code).  
2. Backend P0 Rating APIs kaam karen (submit + tutor avg + admin list).  
3. Frontend mock hata kar inhi paths se wire karega.  
4. Tab Parent Dashboard aur Rate Tutor **real** chalenge.

Detail (models, JSON examples, errors, rules) neeche Part 1 aur Part 2 mein hai — implement karte waqt wahi shapes follow karo taake integrate ke time mismatch na ho.

---

## Auth (all protected routes)

```http
Authorization: Bearer <firebaseIdToken>
```

1. Verify Firebase ID token.
2. Resolve `User` by `firebaseUid`.
3. Enforce `role`. Never take a user id from the path when the token already identifies the caller.
4. Parents may **only** read data for **linked children** (`ParentStudentLink.status === 'active'`).

**Standard success envelope:**

```json
{
  "success": true,
  "data": {}
}
```

**Standard error:**

```json
{
  "success": false,
  "message": "Human readable error"
}
```


| HTTP  | When                                                         |
| ----- | ------------------------------------------------------------ |
| `400` | Validation (bad code, rating out of range, missing fields)   |
| `401` | Missing / invalid token                                      |
| `403` | Wrong role, or parent accessing an unlinked student          |
| `404` | Resource not found                                           |
| `409` | Duplicate (already linked, already rated, code already used) |


---



# Part 1 — Parent Dashboard



## 1.1 Product overview

The Parent Dashboard is a **web app**, not a React Native tab. Parents monitor linked students: attendance, sessions, learning progress, AI insights, payments, and notifications.

**Current frontend status:** no parent APIs are called. A student generates a demo code (`TL7K2M~Afifa`). The parent pastes it (or opens `?code=&student=`). The dashboard then builds a **fresh 0%** local snapshot. Settings, profile, and notification read/delete are local only.

**Target after this spec:**

1. Parent signs in (Firebase + `role: "parent"`).
2. Parent redeems a real link code issued by a student.
3. Dashboard loads live children, sessions, progress, payments, notifications.
4. Newly linked children still **start at 0%** until real completed sessions exist.



## 1.2 User journeys



### A. Parent account (P0)

Mobile already supports `role: "parent"` on register / login / Google. After parent auth, the mobile app **opens the web dashboard** and does not keep a parent session in RN.

The **web dashboard must also authenticate**. Today it has no login screen — only a link-code gate. Backend APIs assume a parent token.

Reuse existing:


| Method | Path                     | Role                  |
| ------ | ------------------------ | --------------------- |
| `POST` | `/api/auth/register`     | body `role: "parent"` |
| `POST` | `/api/auth/login`        | parent Firebase user  |
| `POST` | `/api/auth/google-login` | body `role: "parent"` |


`User.role` enum must include `"parent"`.

### B. Link a student (P0)

1. Student opens Profile → **Link Parent Account** and generates a code.
2. Student shares code + URL (`?code=...&student=...`).
3. Parent (authenticated) redeems the code.
4. A `ParentStudentLink` is created (`status: "active"`).
5. Parent dashboard opens for that child. Progress is **0** until sessions complete.
6. Student’s linked-parents list shows the parent.
7. Admin **Parent-Student Links** page shows the same link.



### C. Day-to-day monitoring

Parent sees stats, upcoming sessions, weekly progress, AI tips, per-subject syllabus coverage, payment history, and alerts (session / payment / progress / system / alert).

### D. Unlink

Either side can revoke:

- Parent: Settings → Linked Students → Unlink.  
- Student: Link Parent Account → Unlink.  
- Admin: revoke link.

After unlink, parent loses access immediately (`403` on that child’s data).

## 1.3 Screens the APIs must feed

Navigation in `parent-dashboard` (current):


| Nav id          | Screen                     | What the UI renders                                                                                           |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `overview`      | Overview                   | 4 stat cards, weekly progress wave, AI insights, next 3 upcoming sessions, children snapshot                  |
| `children`      | My Children                | Card per child: name, grade, board, avg score, sessions this month, attendance, subjects, linked date         |
| `sessions`      | Sessions                   | Tabs: All / Upcoming / Completed / Cancelled. Card: subject, child, tutor, date, time, status, **PKR amount** |
| `progress`      | Learning Progress          | Per subject: letter grade, syllabus %, 5 weekly bars, trend delta                                             |
| `notifications` | Notifications              | Filters All / Unread / Sessions / Payments / Progress. Mark read, mark all, delete                            |
| `settings`      | Settings hub + 7 sub-pages | Profile, security, notification prefs, privacy, linked students, appearance, language                         |


**Payments page exists** (`PaymentsPage.tsx`) and is listed in the Parent README, but it is **not wired into nav yet**. Backend should still ship payment APIs so the frontend can attach the page.

**Link-student gate** (shown when no children are linked): parent pastes a code and opens the dashboard.

### Overview stats


| Card              | Source                                          |
| ----------------- | ----------------------------------------------- |
| Linked Children   | Count of active links                           |
| Upcoming Sessions | Count of upcoming/live sessions across children |
| Overall Progress  | Mean of latest weekly scores (0 if none)        |
| Avg Attendance    | Mean attendance % across children (0 if none)   |




### Session status mapping (Booking → parent UI)


| Booking `status`                                    | Parent session `status`                       |
| --------------------------------------------------- | --------------------------------------------- |
| `accepted` and session is currently in progress     | `live`                                        |
| `accepted` / `confirmed` and start is in the future | `upcoming`                                    |
| `completed`                                         | `completed`                                   |
| `cancelled`                                         | `cancelled`                                   |
| `missed`                                            | treat as `cancelled` (or omit from Upcoming)  |
| `pending`                                           | **do not show** to parent until tutor accepts |


`amount` = session fee in PKR (`hourlyRateAtBooking` × duration, or stored session amount). Currency display is PKR.

### Progress rules

- **Just linked, no completed sessions:** scores `0`, grade `"—"`, syllabus `0`, trend `"stable"`, `trendDelta: 0`, weekly bars `[0,0,0,0,0]`.  
- After completed sessions: derive score / syllabus from summaries, quizzes, or a documented formula (see §1.5).  
- Letter grade (if backend omits `grade`, FE computes it): A+ ≥ 90, A ≥ 85, B+ ≥ 80, B ≥ 75, C+ ≥ 70, else C.  
- Weekly series: last **4–6** weeks, labels like `"Jul 14"` or `"W1"`.  
- `trendDelta` = latest week − previous week (percentage points).



### Notifications


| `type`     | UI filter | Examples                                        |
| ---------- | --------- | ----------------------------------------------- |
| `session`  | Sessions  | Starting soon, completed, cancelled, tutor note |
| `payment`  | Payments  | Paid, pending, refunded                         |
| `progress` | Progress  | Weekly report ready, score change               |
| `system`   | All       | Welcome / linked successfully, platform updates |
| `alert`    | All       | Urgent issues, tutor messages                   |


Parent UI also has an **Unread** filter (`read === false`).

### Settings the backend must persist


| Setting                   | Type                              | Default                                |
| ------------------------- | --------------------------------- | -------------------------------------- |
| `emailAlerts`             | boolean                           | `true`                                 |
| `smsAlerts`               | boolean                           | `false`                                |
| `sessionReminders`        | boolean                           | `true`                                 |
| `paymentAlerts`           | boolean                           | `true`                                 |
| `progressReports`         | boolean                           | `true`                                 |
| `weeklyDigest`            | boolean                           | `false`                                |
| `profileVisible`          | boolean                           | `true` (tutors may see parent contact) |
| `shareProgressWithTutors` | boolean                           | `true`                                 |
| `language`                | `"en"` | `"ur"`                   | `"en"`                                 |
| `theme`                   | `"light"` | `"dark"` | `"system"` | `"system"`                             |
| `timezone`                | IANA string                       | `"Asia/Karachi"`                       |
| `currency`                | `"PKR"` | `"USD"`                 | `"PKR"`                                |
| `twoFactorEnabled`        | boolean                           | `false`                                |
| `loginAlerts`             | boolean                           | `true`                                 |


Theme can stay client-side (`localStorage`), but storing it on the parent profile lets it sync across devices.

## 1.4 Suggested MongoDB models



### `User` (`role: "parent"`)

```js
{
  firebaseUid: String,       // unique
  name: String,
  email: String,
  phoneNumber: String,
  role: 'parent',
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```



### `ParentSettings` (one per parent)

```js
{
  userId: ObjectId,          // unique, ref User
  emailAlerts: Boolean,
  smsAlerts: Boolean,
  sessionReminders: Boolean,
  paymentAlerts: Boolean,
  progressReports: Boolean,
  weeklyDigest: Boolean,
  profileVisible: Boolean,
  shareProgressWithTutors: Boolean,
  language: String,          // en | ur
  theme: String,             // light | dark | system
  timezone: String,
  currency: String,          // PKR | USD
  twoFactorEnabled: Boolean,
  loginAlerts: Boolean,
  updatedAt: Date
}
```



### `ParentLinkCode`

Student already has stubs for this in `src/api/profile.api.ts`.

```js
{
  code: String,              // unique, uppercase, e.g. TL7K2M or TL-XK9P-4821
  studentId: ObjectId,
  studentName: String,       // denormalized for share / redeem UX
  expiresAt: Date,
  status: 'active' | 'used' | 'expired',
  usedByParentId: ObjectId,
  usedAt: Date,
  createdAt: Date
}
```

**Rules:** unique code; expire after 30–60 minutes (or 7 days — pick one and document it); one active unused code per student; generating a new code expires the previous unused one.

### `ParentStudentLink`

```js
{
  parentId: ObjectId,
  studentId: ObjectId,
  linkedAt: Date,
  status: 'active' | 'pending' | 'revoked',
  revokedAt: Date,
  revokedBy: 'parent' | 'student' | 'admin',
  linkCode: String           // the code that created this link
}
```

Unique index: `{ parentId, studentId }` where `status: 'active'`.

### Progress (derive, don’t duplicate unless needed)

Prefer computing from:

- `Booking` (completed / cancelled / upcoming)  
- Session summaries / scores if they exist  
- Attendance = completed / (completed + missed + cancelled-after-start)

Optional cache collection `StudentProgressSnapshot` if aggregation is slow; refresh on session complete.

### `ParentNotification`

Reuse the existing notifications collection if `recipientUserId` is the parent. Parent UI needs `type` in `{ session, payment, progress, system, alert }`.

```js
{
  userId: ObjectId,          // parent
  title: String,
  message: String,
  type: 'session' | 'payment' | 'progress' | 'system' | 'alert',
  read: Boolean,
  studentId: ObjectId,       // optional
  bookingId: ObjectId,       // optional
  createdAt: Date
}
```



### Payments

Derive from wallet / escrow / booking payments. Parent history is **read-only**.

```js
// Response shape — may be a view over WalletTransaction + Booking
{
  id: String,
  childId: ObjectId,
  childName: String,
  description: String,       // e.g. "Mathematics session — Prof. Ali Ahmed"
  amount: Number,            // PKR
  status: 'completed' | 'pending' | 'refunded',
  date: String,              // ISO date
  bookingId: ObjectId
}
```



## 1.5 How to compute child stats

Document the formula so FE and BE match.


| Field                  | Formula                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attendanceRate`       | `round(100 * completed / max(completed + missed, 1))` for the last 30 days (or all time if none)                                                          |
| `sessionsThisMonth`    | Count of sessions with status `completed` or `upcoming`/`live` in current calendar month                                                                  |
| `avgScore`             | Mean of latest per-subject scores (0 if none)                                                                                                             |
| `subjects`             | Distinct subjects from student’s interests **or** booked subjects                                                                                         |
| `grade` / `board`      | From student profile                                                                                                                                      |
| Per-subject `score`    | Mean of quiz/summary scores for that subject; if none, `min(100, completedSessions * 8)` is acceptable until assessments exist — **state which you ship** |
| `syllabusCovered`      | Optional tutor-entered %; else approximate from completed sessions vs planned package sessions                                                            |
| `weeklyProgress.weeks` | One point per ISO week, score = avg subject score that week (0 if no sessions)                                                                            |


**Fresh link:** if the student has historical sessions, you **may** show real history. Product currently shows 0% on first link for the FYP demo. Preferred production rule: show **real** history; if the student has never completed a session, everything is 0.

## 1.6 Parent APIs

Prefix: `/api/parent/...` for parent-only “me” routes.  
Link-code generate/list on the **student** side stay under `/api/profile/...` (already stubbed).

---



### P0 — Auth (existing)

Same as mobile. Parent web must send Firebase token on every call.

---



### 1. `GET /api/parent/me`

**Role:** parent  

Returns profile used by Settings → Profile and the top bar.

**Response** `data`**:**

```json
{
  "_id": "parentObjectId",
  "name": "Aslam Khan",
  "email": "aslam.khan@email.com",
  "phone": "+92 321 5551234",
  "avatarUrl": "https://.../avatars/parent.jpg",
  "avatarInitials": "AK",
  "role": "parent",
  "linkedChildrenCount": 2
}
```

`avatarInitials`: first letters of first two name parts (FE can also compute this).

---



### 2. `PATCH /api/parent/me`

**Role:** parent  

```json
{
  "name": "Aslam Khan",
  "phone": "+92 321 5551234"
}
```

- Do not change `email` here (Firebase is source of truth) unless you also sync Firebase.  
- Return the updated profile.

---



### 3. `POST /api/parent/me/avatar`

**Role:** parent  
`Content-Type: multipart/form-data`  
Field: `avatar` (jpeg/png, max ~5MB)

```json
{ "avatarUrl": "https://.../uploads/avatars/..." }
```

---



### 4. Student: `POST /api/profile/link-code/generate`

**Role:** student  

Already stubbed on the mobile client.

**Response** `data`**:**

```json
{
  "code": "TL7K2M",
  "expiresAt": "2026-08-28T18:00:00.000Z",
  "expiresInMinutes": 60,
  "status": "active",
  "studentName": "Ahmed Khan",
  "shareUrl": "https://tutor-link-62ed9.web.app?code=TL7K2M&student=Ahmed%20Khan"
}
```

Optional packed format used by the current demo: `TL7K2M~Ahmed Khan`. Backend may accept **either** the raw code or `CODE~Name` on redeem (strip after `~`).

---



### 5. Parent: `POST /api/parent/link-code/redeem`

**Role:** parent  

Also implement (or alias) existing stub `POST /api/profile/link-code/redeem` so mobile and web share one path. **Prefer one canonical path** and keep the other as an alias.

```json
{ "code": "TL7K2M~Ahmed Khan" }
```

**Success** `data`**:**

```json
{
  "linkId": "linkObjectId",
  "student": {
    "id": "studentObjectId",
    "name": "Ahmed Khan",
    "grade": "Class 10",
    "board": "Federal Board",
    "subjects": ["Mathematics", "Physics"]
  },
  "linkedAt": "2026-08-28T16:05:00.000Z"
}
```

**Errors:**


| Condition                      | HTTP | Message                                                       |
| ------------------------------ | ---- | ------------------------------------------------------------- |
| Invalid / unknown code         | 400  | Invalid code                                                  |
| Expired                        | 400  | This code has expired. Ask the student to generate a new one. |
| Already used by another parent | 409  | This code was already used                                    |
| Already linked to this parent  | 409  | This student is already linked                                |
| Student unlinked / deleted     | 404  | Student not found                                             |


On success:

- Mark code `used`.  
- Create `ParentStudentLink` `active`.  
- Create a parent notification: type `system`, title `Student linked successfully`.  
- Create a student notification that a parent linked.

---



### 6. `GET /api/parent/children`

**Role:** parent  

List active linked students for **My Children** and Settings → Linked Students.

```json
{
  "items": [
    {
      "id": "studentObjectId",
      "name": "Ahmed Khan",
      "grade": "Class 10",
      "board": "Federal Board",
      "avatarUrl": "https://...",
      "avatarInitials": "AK",
      "subjects": ["Mathematics", "Physics"],
      "attendanceRate": 96,
      "sessionsThisMonth": 8,
      "avgScore": 88,
      "linkedAt": "2026-01-15"
    }
  ]
}
```

Empty list → web shows the link-code gate (or Settings with “no children”).

---



### 7. `DELETE /api/parent/children/:studentId`

**Role:** parent — unlink this child.

**Response:** `{ "id": "studentId", "unlinked": true }`

Student-side counterpart (already stubbed):

`DELETE /api/profile/linked-parents/:linkId`

Admin: `DELETE /api/admin/links/:linkId/revoke`

All three set `status: "revoked"` and deny further parent reads.

---



### 8. Student: `GET /api/profile/linked-parents`

Already stubbed. Must return real parents after redeem.

```json
{
  "items": [
    {
      "id": "linkId",
      "name": "Aslam Khan",
      "email": "aslam.khan@email.com",
      "linkedAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---



### 9. `GET /api/parent/dashboard`

**Role:** parent  
**P0 — primary payload** for Overview + enough to hydrate other tabs in one round trip.

Optional query: `?studentId=` to scope to one child (default: all linked).

**Response** `data` — matches `ParentDashboardData` in `parent-dashboard/src/types/parent.types.ts`:

```json
{
  "profile": {
    "name": "Aslam Khan",
    "email": "aslam.khan@email.com",
    "phone": "+92 321 5551234",
    "avatarInitials": "AK",
    "avatarUrl": "https://..."
  },
  "stats": {
    "linkedChildren": 2,
    "upcomingSessions": 3,
    "avgAttendance": 94,
    "overallProgress": 90
  },
  "children": [ ],
  "sessions": [ ],
  "notifications": [ ],
  "progress": [ ],
  "weeklyProgress": [ ],
  "aiRecommendation": {
    "summary": "Both children are on an upward trajectory.",
    "tips": [
      "Schedule an extra Physics revision session for Ahmed."
    ],
    "forecasts": [
      {
        "week": "Jul 21 – Jul 27",
        "childName": "Ahmed Khan",
        "projectedScore": 90,
        "focus": "Physics — Electromagnetic waves",
        "confidence": 87
      }
    ]
  },
  "settings": {
    "emailAlerts": true,
    "smsAlerts": false,
    "sessionReminders": true,
    "paymentAlerts": true,
    "progressReports": true,
    "weeklyDigest": false,
    "profileVisible": true,
    "shareProgressWithTutors": true,
    "language": "en",
    "theme": "system"
  }
}
```

`sessions[]` **item:**

```json
{
  "id": "bookingObjectId",
  "childId": "studentObjectId",
  "childName": "Ahmed Khan",
  "tutorId": "tutorUserId",
  "tutorName": "Prof. Ali Ahmed",
  "subject": "Physics",
  "date": "Jul 22, 2026",
  "time": "4:00 PM",
  "status": "upcoming",
  "amount": 2500
}
```

`date` / `time` should be formatted in the parent’s timezone (`ParentSettings.timezone`). Also include ISO fields for sorting:

```json
{
  "startsAt": "2026-07-22T11:00:00.000Z",
  "endsAt": "2026-07-22T12:00:00.000Z"
}
```

`progress[]` **item:**

```json
{
  "childId": "studentObjectId",
  "childName": "Ahmed Khan",
  "subject": "Mathematics",
  "score": 85,
  "grade": "A",
  "syllabusCovered": 65,
  "trend": "up",
  "trendDelta": 5,
  "weeklyBars": [35, 48, 55, 62, 70],
  "sessionsCompleted": 10,
  "lastUpdated": "Jul 19, 2026"
}
```

`trend`: `"up"` | `"down"` | `"stable"`.  
`weeklyBars`: exactly **5** numbers 0–100.

`weeklyProgress[]` **item** (Overview chart):

```json
{
  "childId": "studentObjectId",
  "childName": "Ahmed Khan",
  "avatarInitials": "AK",
  "subject": "Physics & Math",
  "weeks": [
    { "label": "Jun 9", "score": 72 },
    { "label": "Jun 16", "score": 76 },
    { "label": "Jul 14", "score": 88 }
  ]
}
```

`aiRecommendation`**:** if no session history, return the empty-state copy:

- summary: `"{name} was just linked. No session history yet — progress is at 0%."`  
- tips: book first class, charts fill after classes, alerts on book/complete  
- `forecasts: []`

If you cannot run an LLM yet, return a **rule-based** summary from scores/trends. Do not block the dashboard on AI failure — fall back to the empty or heuristic payload.

---



### 10. `GET /api/parent/sessions`

**Role:** parent  

Query:


| Param       | Values                                                            |
| ----------- | ----------------------------------------------------------------- |
| `status`    | `all` (default) | `upcoming` | `live` | `completed` | `cancelled` |
| `studentId` | optional                                                          |
| `page`      | default 1                                                         |
| `limit`     | default 20                                                        |


`upcoming` includes `live`. Sort by `startsAt` ascending for upcoming, descending for completed.

**Response:**

```json
{
  "items": [ ],
  "pagination": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 }
}
```

---



### 11. `GET /api/parent/progress`

**Role:** parent  
Query: `studentId` optional.

```json
{
  "progress": [ ],
  "weeklyProgress": [ ]
}
```

Same item shapes as dashboard. Use this when FE splits Overview vs Progress into two fetches.

---



### 12. `GET /api/parent/ai-insights`

**Role:** parent  
Query: `studentId` optional.

Returns `AiRecommendation` only. Cache 6–24 hours; regenerate after a session completes.

---



### 13. `GET /api/parent/payments`

**Role:** parent  

```json
{
  "monthlySpend": 12500,
  "currency": "PKR",
  "items": [
    {
      "id": "txnObjectId",
      "childId": "studentObjectId",
      "childName": "Ahmed Khan",
      "description": "Mathematics session — Sara Malik",
      "amount": 2500,
      "status": "completed",
      "date": "2026-07-18",
      "bookingId": "bookingObjectId"
    }
  ]
}
```

`monthlySpend` = sum of `completed` amounts in the current calendar month.  
Statuses: `completed` | `pending` | `refunded`.

---



### 14. Notifications

Reuse inbox APIs **if** they filter by the authenticated parent and return parent `type` values. Otherwise ship parent-scoped routes.


| Method   | Path                                                                                   | Purpose       |
| -------- | -------------------------------------------------------------------------------------- | ------------- |
| `GET`    | `/api/parent/notifications?filter=all|unread|session|payment|progress&page=1&limit=30` | List          |
| `PATCH`  | `/api/parent/notifications/:id/read`                                                   | Mark one read |
| `PATCH`  | `/api/parent/notifications/read-all`                                                   | Mark all read |
| `DELETE` | `/api/parent/notifications/:id`                                                        | Delete one    |


Existing mobile inbox (optional alias for the same store):

- `GET /api/notifications`  
- `PATCH /api/notifications/:id/read`  
- `PATCH /api/notifications/read-all`

Add `DELETE /api/notifications/:id` (parent UI requires delete).

**List item:**

```json
{
  "id": "notifObjectId",
  "title": "Session starting soon",
  "message": "Ahmed has Physics with Prof. Ali Ahmed in 1 hour.",
  "type": "session",
  "read": false,
  "createdAt": "2026-07-22T14:00:00.000Z",
  "studentId": "studentObjectId",
  "bookingId": "bookingObjectId"
}
```

Also return `unreadCount` on list (top-bar badge).

**Events that must create a parent notification** (respect settings):


| Event                                             | `type`     | Setting gate                  |
| ------------------------------------------------- | ---------- | ----------------------------- |
| Student linked                                    | `system`   | always                        |
| Booking accepted / upcoming reminder (~1h before) | `session`  | `sessionReminders`            |
| Session live / completed / cancelled              | `session`  | `sessionReminders`            |
| Payment captured / refunded                       | `payment`  | `paymentAlerts`               |
| Weekly progress snapshot ready                    | `progress` | `progressReports`             |
| Weekly digest email                               | `progress` | `weeklyDigest`                |
| Tutor important note                              | `alert`    | `emailAlerts` / in-app always |


Delivery:

- In-app inbox: always (if that type is enabled).  
- Email: if `emailAlerts`.  
- SMS: if `smsAlerts` (urgent session only is enough for v1).

---



### 15. Settings


| Method  | Path                   |
| ------- | ---------------------- |
| `GET`   | `/api/parent/settings` |
| `PATCH` | `/api/parent/settings` |


PATCH accepts a partial object of the settings fields in §1.3. Return the full saved object.

---



### 16. Account & security


| Method  | Path                                   | Notes                             |
| ------- | -------------------------------------- | --------------------------------- |
| `GET`   | `/api/parent/security/sessions`        | Active devices                    |
| `POST`  | `/api/parent/security/sign-out-others` | Revoke all except current         |
| `PATCH` | `/api/parent/settings`                 | `twoFactorEnabled`, `loginAlerts` |


**Sessions item:**

```json
{
  "id": "sessionId",
  "device": "Chrome on Windows",
  "location": "Islamabad, PK",
  "current": true,
  "lastActiveAt": "2026-08-28T15:00:00.000Z"
}
```

**Change password:** Firebase client (`updatePassword` / reset email). Backend optional: audit log + `loginAlerts` email.

**2FA:** if you cannot ship real TOTP yet, persist the flag and return `501` or a “coming soon” message — do not silently ignore the toggle.

---



### 17. Privacy export

`POST /api/parent/data-export`  
Queue a JSON/ZIP of profile, links, notifications prefs. Email a download link. Settings UI has **Download my data**.

---



### 18. Admin (already expected)


| Method   | Path                              | Parent dashboard impact    |
| -------- | --------------------------------- | -------------------------- |
| `GET`    | `/api/admin/links`                | Lists parent–student links |
| `DELETE` | `/api/admin/links/:linkId/revoke` | Revokes access             |


Link row shape already used by admin UI:

```json
{
  "id": "linkId",
  "parentName": "Aslam Khan",
  "parentEmail": "aslam.khan@email.com",
  "studentName": "Ahmed Khan",
  "studentEmail": "ahmed@email.com",
  "studentGrade": "Class 10",
  "linkedAt": "2026-01-15T10:00:00.000Z",
  "status": "active",
  "linkCode": "TL7K2M"
}
```



## 1.7 Authorization matrix


| Resource                      | Parent    | Student   | Tutor                             | Admin             |
| ----------------------------- | --------- | --------- | --------------------------------- | ----------------- |
| Parent profile / settings     | own       | —         | —                                 | read/revoke links |
| Linked child profile snapshot | if linked | own       | only if `shareProgressWithTutors` | yes               |
| Child bookings / payments     | if linked | own       | own sessions                      | yes               |
| Child progress                | if linked | own       | if sharing enabled                | yes               |
| Generate link code            | —         | own       | —                                 | —                 |
| Redeem link code              | yes       | —         | —                                 | —                 |
| Unlink                        | own links | own links | —                                 | revoke            |


Parents **cannot** join classrooms, chat as the student, book, or pay on behalf of the student in v1 unless you explicitly add that later.

## 1.8 Parent API priority


| Priority | Endpoint                                | Unlocks                    |
| -------- | --------------------------------------- | -------------------------- |
| **P0**   | Auth `role: parent`                     | Login on web               |
| **P0**   | Generate + redeem link code             | Link-student gate          |
| **P0**   | `GET /api/parent/dashboard`             | Entire dashboard           |
| **P0**   | `GET /api/parent/children` + unlink     | My Children / Settings     |
| **P1**   | Sessions list (or dashboard.sessions)   | Sessions tab               |
| **P1**   | Progress + weekly series                | Progress + Overview charts |
| **P1**   | Notifications CRUD                      | Notifications tab + badge  |
| **P1**   | `PATCH /api/parent/me` + settings       | Profile / prefs            |
| **P2**   | Payments                                | Payments page              |
| **P2**   | AI insights (non-blocking)              | Overview AI card           |
| **P2**   | Avatar, sessions list, data export, 2FA | Settings extras            |




## 1.9 Parent acceptance checklist

1. Parent Firebase login → `GET /api/parent/me` returns that parent.
2. Student generates code → parent redeems → both lists update; admin links page shows the pair.
3. Dashboard for a child with no completed sessions shows **0%** stats, empty upcoming sessions, welcome notification.
4. After a completed booking, sessions, progress, attendance, and (if enabled) a notification update without a manual DB edit.
5. Parent cannot fetch another student’s dashboard (`403`).
6. Unlink (parent, student, or admin) immediately blocks access.
7. Mark read / mark all / delete persist after refresh.
8. Settings PATCH survives logout/login.
9. Expired or reused codes fail with a clear message.
10. `GET /api/parent/dashboard` stays usable if AI generation fails.

---



# Part 2 — Rating & Review System



## 2.1 Product overview

Students rate a **tutor for a completed booking** (1–5 stars, optional written review, optional like). That rating:

1. Stores on the booking (`studentRating`, `studentReview`, `ratedAt`).
2. Feeds the tutor’s public profile (average, count, review list on Hire/Book details).
3. Feeds tutor search (`minRating`, sort).
4. Feeds Admin → **Tutor Ratings** (avg, likes, recent comments, Keep / Remove tutor).
5. Should be visible to a linked parent (child’s completed sessions).

**Current frontend status:**


| Surface                    | Behavior today                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `RateTutorModal`           | After live class ends: 1–5 stars, thumb like, optional review (max 400 chars), skip allowed                         |
| `BookingReviewScreen`      | Same idea from booking past tab; stars + comment                                                                    |
| Mobile API call            | `POST /api/student/sessions/:bookingId/rate` `{ rating, review }`                                                   |
| Fallback                   | If API fails, save locally + POST to admin Vite `POST /api/live-ratings` (dev-only, **not production**)             |
| Tutor details              | `tutor.rating`, `tutor.totalReviews`, `tutor.reviews[]`                                                             |
| Admin                      | Polls live file or `GET /api/admin/tutors/ratings`; Keep = local; Remove calls `PATCH /api/admin/tutors/:id/reject` |
| Update / delete by student | **Not implemented** — `canRate` is true only if `completed && !studentRating && !ratedAt`                           |


This spec requires a **real ratings collection**, aggregation on the tutor, student update/delete, parent visibility, and admin moderation — so the Vite live-ratings file can be retired.

## 2.2 Business rules

1. **Who can rate:** authenticated **student** who owns the booking.
2. **When:** booking `status === "completed"` only. Not pending, accepted, cancelled, or missed.
3. **One rating per booking** (unique index `{ bookingId }`).
4. **Stars:** integer `1`–`5` (required).
5. **Review text:** optional, trim, max **400** characters, empty string → store `null`.
6. **Liked:** boolean, default `false`. UI default is liked when the modal opens; send the actual toggle value. If omitted, treat `liked = rating >= 4`.
7. **Skip:** allowed. Do not create a rating. Student may rate later from Booking Review.
8. **Update:** student may `PATCH` their rating within **7 days** of `ratedAt` (change stars, like, and/or text). After that, `403` with “Edit window closed”.
9. **Delete:** student may delete within 7 days; booking becomes unrated again (`studentRating` cleared) so they could re-submit. After 7 days, only admin hide/delete.
10. **Tutor cannot** rate students in v1 (no student-rating UI).
11. **Parents cannot** submit ratings. They may **read** linked children’s ratings.
12. **Hidden / removed** ratings are excluded from public average and tutor profile, but remain in admin tools.
13. **Aggregation** (denormalize on `TutorProfile` / User tutor):
  ```
    rating (avg)     = mean of visible ratings, 1 decimal
    totalReviews     = count of visible ratings
    likeCount        = count of visible ratings where liked === true
  ```
    Recalculate on create / update / delete / admin hide.
14. **Low rating flag:** if tutor `avgRating < 3.5` and `totalReviews >= 3`, set admin `decision` suggestion to `flagged` (do not auto-remove).
15. **Idempotent submit:** second POST for the same booking → `409` (use PATCH to edit).
16. **Public reviews** show `studentName` (or “Student” if they later opt out — not in UI today). Include `studentAvatar` when available.



## 2.3 Suggested model `Rating`

```js
{
  _id: ObjectId,
  bookingId: ObjectId,       // unique
  studentId: ObjectId,
  tutorId: ObjectId,         // User._id of tutor
  subject: String,
  rating: Number,            // 1–5
  liked: Boolean,
  review: String,            // max 400, optional
  status: 'visible' | 'hidden' | 'removed',
  hiddenReason: String,
  ratedAt: Date,
  updatedAt: Date,
  editedAt: Date             // set on student PATCH
}
```

Indexes:

- unique `bookingId`  
- `{ tutorId, status, ratedAt: -1 }`  
- `{ studentId, ratedAt: -1 }`

Mirror on `Booking`:

```js
studentRating: Number,
studentReview: String,
studentLiked: Boolean,
ratedAt: Date,
ratingId: ObjectId
```

Mirror on tutor profile:

```js
rating: Number,              // average
totalReviews: Number,
likeCount: Number
```

Admin decision (can live on tutor profile):

```js
ratingDecision: 'active' | 'flagged' | 'removed'
```



## 2.4 Rating & review APIs



### A. Create / submit — `POST /api/student/sessions/:bookingId/rate`

**Role:** student  
**Already called** by `src/api/profile.api.ts` → `rateSessionAPI`.

**Request:**

```json
{
  "rating": 5,
  "review": "Clear explanations, very helpful.",
  "liked": true
}
```

`review` and `liked` optional.

**Response** `data`**:**

```json
{
  "id": "ratingObjectId",
  "bookingId": "bookingObjectId",
  "tutorId": "tutorUserId",
  "tutorName": "Ammar",
  "studentId": "studentUserId",
  "studentName": "Afifa",
  "subject": "Mathematics",
  "rating": 5,
  "liked": true,
  "review": "Clear explanations, very helpful.",
  "ratedAt": "2026-08-28T16:40:00.000Z",
  "status": "visible"
}
```

Also update the booking document so `GET /api/bookings/:id` returns `studentRating`, `studentReview`, `ratedAt`.

**Errors:**


| Case                           | HTTP |
| ------------------------------ | ---- |
| Booking not completed          | 400  |
| Not the student on the booking | 403  |
| Already rated                  | 409  |
| `rating` not 1–5               | 400  |
| `review` > 400                 | 400  |


---



### B. Update — `PATCH /api/ratings/:ratingId`

**Role:** student (owner)  

```json
{
  "rating": 4,
  "review": "Updated after thinking it over.",
  "liked": false
}
```

All fields optional; at least one required.

**Response:** full rating object with `updatedAt` / `editedAt`.

Re-aggregate tutor stats. If the 7-day window expired: `403`.

Alias (optional): `PATCH /api/student/sessions/:bookingId/rate` with the same body.

---



### C. Delete / retract — `DELETE /api/ratings/:ratingId`

**Role:** student (owner, within 7 days) or admin  

Soft-delete preferred: `status: "removed"`. Clear booking `studentRating` / `studentReview` / `ratedAt` if the student retracted. Recalculate tutor aggregates.

---



### D. Get rating for a booking — `GET /api/student/sessions/:bookingId/rate`

**Role:** student (owner) or parent (if child linked) or tutor (own booking) or admin  

```json
{
  "rated": true,
  "rating": { }
}
```

If not rated: `{ "rated": false, "rating": null }`.

---



### E. Student’s own ratings — `GET /api/student/ratings`

**Role:** student  

Query: `page`, `limit` (default 20).

```json
{
  "items": [ ],
  "pagination": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 }
}
```

---



### F. Public tutor reviews — `GET /api/tutors/:tutorId/reviews`

**Role:** any authenticated user (student needs this on Hire/Book details). Optional public without auth if search is public.

Query: `page`, `limit` (default 10), `sort=recent|highest|lowest`.

**Response** `data`**:**

```json
{
  "tutorId": "tutorUserId",
  "rating": 4.8,
  "totalReviews": 128,
  "likeCount": 96,
  "items": [
    {
      "id": "ratingObjectId",
      "studentName": "Ahmed Khan",
      "studentAvatar": "https://...",
      "rating": 5,
      "comment": "Excellent Physics teacher.",
      "subject": "Physics",
      "createdAt": "2026-07-18T15:00:00.000Z",
      "liked": true
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 128, "totalPages": 13 }
}
```

Field names `comment` + `createdAt` match `TutorReview` in `src/types/bookingFlow.types.ts`. You may also send `review` / `ratedAt` as aliases.

Only `status: "visible"`.

**Also include aggregates on:**

- `GET /api/tutors/:tutorId`  
- `POST /api/tutors/search`

```json
{
  "rating": 4.8,
  "totalReviews": 128
}
```

---



### G. Tutor’s received reviews (private) — `GET /api/tutor/reviews`

**Role:** tutor  

Same list as public, plus `status` so the tutor can see hidden items as “removed by admin” without the hidden reason if you prefer to hide reasons.

---



### H. Parent: child’s ratings — `GET /api/parent/children/:studentId/ratings`

**Role:** parent, active link only  

```json
{
  "items": [
    {
      "id": "ratingObjectId",
      "bookingId": "bookingObjectId",
      "tutorName": "Prof. Ali Ahmed",
      "subject": "Physics",
      "rating": 5,
      "liked": true,
      "review": "Great class",
      "ratedAt": "2026-07-18T15:00:00.000Z"
    }
  ]
}
```

---



### I. Admin list — `GET /api/admin/tutors/ratings`

**Role:** admin  
**Already called** by `admin-dashboard/src/api/admin.api.ts`.

Query: `page`, `limit`, optional `decision=active|flagged|removed`.

Each row (**must match** `TutorRatingRow`):

```json
{
  "tutorId": "tutorUserId",
  "tutorName": "Ammar",
  "email": "ammar@tutorlink.com",
  "expertise": "Mathematics",
  "avgRating": 4.6,
  "reviewCount": 12,
  "likeCount": 9,
  "decision": "active",
  "recentReviews": [
    {
      "id": "ratingObjectId",
      "studentName": "Afifa",
      "subject": "Mathematics",
      "rating": 5,
      "liked": true,
      "review": "Loved this class",
      "ratedAt": "2026-08-28T16:40:00.000Z"
    }
  ]
}
```

`recentReviews`: last 2–5 visible ratings, newest first.  
Sort rows by `reviewCount` desc (admin UI does this).

Optional raw dump (replaces Vite `GET /api/live-ratings`):

`GET /api/admin/ratings?page=1&limit=50`

---



### J. Admin: rating moderation


| Method   | Path                           | Body                                        | Effect                  |
| -------- | ------------------------------ | ------------------------------------------- | ----------------------- |
| `PATCH`  | `/api/admin/ratings/:ratingId` | `{ "status": "hidden", "reason": "Abuse" }` | Exclude from public avg |
| `PATCH`  | `/api/admin/ratings/:ratingId` | `{ "status": "visible" }`                   | Restore                 |
| `DELETE` | `/api/admin/ratings/:ratingId` | —                                           | `status: "removed"`     |


Always recalculate tutor aggregates.

---



### K. Admin: keep / remove tutor (ratings page)

Admin UI:

- **Keep tutor** → decision `active`  
- **Remove tutor** → currently `PATCH /api/admin/tutors/:id/reject`

Add an explicit ratings-decision endpoint so Keep is not local-only:

`PATCH /api/admin/tutors/:tutorId/rating-decision`

```json
{ "decision": "active" }
```

or `{ "decision": "removed", "reason": "Removed by admin due to student ratings" }`.

When `removed`:

- Set `ratingDecision: "removed"`.  
- Hide tutor from student search (`isVerified: false` or `availability: false` — pick one and document).  
- Reuse reject flow if that already deactivates the tutor.

When `flagged`: tutor stays searchable; admin list highlights them (`avg < 3.5`).

---



## 2.5 Side effects on submit / update / delete

1. Upsert `Rating`.
2. Patch `Booking.studentRating`, `studentReview`, `ratedAt`, `studentLiked`.
3. Recompute tutor `rating`, `totalReviews`, `likeCount`.
4. If `progressReports` / parent linked: optional parent notification `alert` or `session` — “Ahmed rated Physics 5★” is nice-to-have, not P0.
5. If new avg `< 3.5` with ≥ 3 reviews, set `ratingDecision` to `flagged` unless admin already chose `removed`.

Do **not** depend on the admin Vite server (`localhost:5174/api/live-ratings`) in production.

## 2.6 Rating API priority


| Priority | Endpoint                                                               | Unlocks                                                  |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| **P0**   | `POST /api/student/sessions/:bookingId/rate`                           | Rate modal + Booking Review (stop using local-only save) |
| **P0**   | Persist + aggregate on tutor                                           | Search + tutor details stars                             |
| **P0**   | `GET /api/tutors/:tutorId/reviews` (or embed on `GET /api/tutors/:id`) | “Student reviews” on booking details                     |
| **P0**   | `GET /api/admin/tutors/ratings`                                        | Admin Tutor Ratings (replace live JSON file)             |
| **P1**   | `PATCH /api/ratings/:id`                                               | Edit within 7 days                                       |
| **P1**   | Admin hide/remove rating + rating-decision                             | Moderation / Keep tutor                                  |
| **P1**   | `GET /api/student/ratings`                                             | Student history (optional UI)                            |
| **P2**   | `GET /api/parent/children/:id/ratings`                                 | Parent visibility                                        |
| **P2**   | `DELETE` by student                                                    | Retract                                                  |
| **P2**   | `GET /api/tutor/reviews`                                               | Tutor inbox of feedback                                  |




## 2.7 Rating acceptance checklist

1. Student completes a session → POST rate → booking shows `studentRating`; second POST returns 409.
2. Incomplete / cancelled booking cannot be rated (400).
3. Another student cannot rate that booking (403).
4. `GET /api/tutors/:id` average and `totalReviews` match visible ratings (1 decimal).
5. Tutor details reviews list shows name, avatar, stars, comment, subject.
6. PATCH within 7 days updates stars/text/like and refreshes aggregates.
7. PATCH after 7 days fails.
8. Hidden rating disappears from public list and no longer affects average; admin can still see it.
9. Admin ratings table shows live Mongo data (not `live-ratings.json`).
10. Keep / Remove persist `decision`; Remove hides tutor from student search.
11. Linked parent can list the child’s ratings; unlinked parent cannot.
12. `liked` counts toward `likeCount` independently of star value.

---



# Part 3 — Implementation notes for backend



## 3.1 Existing stubs to honor (do not rename without an alias)


| Client                                 | Path                                                             |
| -------------------------------------- | ---------------------------------------------------------------- |
| `src/api/profile.api.ts`               | `POST /api/profile/link-code/generate`                           |
|                                        | `POST /api/profile/link-code/redeem`                             |
|                                        | `GET /api/profile/linked-parents`                                |
|                                        | `DELETE /api/profile/linked-parents/:linkId`                     |
|                                        | `POST /api/student/sessions/:bookingId/rate`                     |
| `admin-dashboard/src/api/admin.api.ts` | `GET /api/admin/tutors/ratings`                                  |
|                                        | `GET /api/admin/links`                                           |
|                                        | `DELETE /api/admin/links/:linkId/revoke`                         |
|                                        | `PATCH /api/admin/tutors/:id/reject`                             |
| `src/api/notifications.api.ts`         | `GET /api/notifications`, `PATCH .../read`, `PATCH .../read-all` |


New parent-dashboard client will call `/api/parent/*` once wired.

## 3.2 Code format for link codes

Current demo codes are 6-char `TL` + alphanumeric (e.g. `TL7K2M`). Packed share string: `CODE~StudentName`.

Production recommendation:

- Generate `TLxxxxxx` (6–8 chars, unambiguous alphabet: no `0/O/1/I`).  
- Accept redeem of `CODE` or `CODE~anything`.  
- Normalize: trim, collapse spaces, uppercase the code segment only.



## 3.3 Deep link

Parent web already reads:

```
https://<parent-app>?code=TL7K2M&student=Ahmed%20Khan
```

Redeem should work with `code` query even if `student` is omitted (name comes from the student record).

## 3.4 Suggested build order

1. `ParentLinkCode` + `ParentStudentLink` + generate/redeem/list/unlink.
2. `GET /api/parent/dashboard` (children + sessions from bookings; progress zeros OK).
3. Ratings collection + POST rate + tutor aggregates + admin GET ratings.
4. Notifications for parents.
5. Settings / profile PATCH.
6. Real progress + AI + payments.
7. Rating PATCH/DELETE + parent ratings list + admin moderation.

---



## Urdu summary (backend team)

**Parent Dashboard**

- Parent web app ab mock pe hai. Backend par `role: parent` wala user, link code (student generate, parent redeem), aur `/api/parent/dashboard` chahiye.  
- Linked child ki sessions, attendance, progress (shuru mein 0%), payments, notifications, settings save honi chahiye.  
- Parent sirf **linked** students ka data dekh sakta hai. Unlink ke baad access band.

**Ratings**

- Student completed session ke baad 1–5 stars + optional review (400 chars) + like.  
- Ek booking = ek rating. 7 din tak edit.  
- Tutor profile average + reviews list, search, aur Admin Tutor Ratings sab **Mongo** se aayein — `live-ratings.json` production ke liye nahi.  
- Admin rating hide kar sake, tutor keep/remove persist ho.

