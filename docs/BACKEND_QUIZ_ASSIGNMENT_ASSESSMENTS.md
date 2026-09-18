# Backend: Quizzes, Tests & Assignments

**For:** Backend developer  
**Frontend:** React Native TutorLink app (already wired)

**Auth:** `Authorization: Bearer <firebaseIdToken>`  
Identity, role, `tutorId`, and `studentId` come from the **authenticated session only**. Never trust those fields (or score / remaining time) from the request body.

Envelope:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Human readable error", "code": "FORBIDDEN" }
```

Base path: `/api/assessments`

This replaces the placeholder list routes in `docs/BACKEND_STUDENT_HOME_DASHBOARD.md` §4.2 (`GET /api/student/assignments|quizzes|tests`). Use **one** assessment module with a `type` field.

---

## 1. Why this exists

Tutors create **quiz**, **test**, or **assignment** work for students they already teach. Students start an attempt, autosave answers, submit, and later see a score / feedback. The **server** is authoritative for:

- assignment access
- attempt validity
- deadline / duration / remaining attempts
- submission lock
- score and percentage
- whether correct answers are visible

The client timer and any client-calculated score are display-only. Ignore them if sent.

---

## 2. Eligibility (booking relationship)

A tutor may assign an assessment only to students with an **existing booking/session relationship** with that tutor (accepted / active / completed package or session — same rule as chat/bookings).

Do **not** allow arbitrary `studentIds`.

Recommended eligible set:

```
Booking.tutorId = req.user._id
AND status IN ['accepted', 'active', 'completed']
```

Deduplicate by student. Frontend also falls back to `GET /api/bookings?tab=active` if `GET /api/assessments/tutor/eligible-students` is missing — still enforce the same rule on **assign / publish**.

---

## 3. Models (Mongo / Mongoose)

Reuse existing `User` (`role: tutor | student`) and `Booking`. Do not duplicate those collections.

### 3.1 `Assessment`

| Field | Type | Notes |
|---|---|---|
| tutorId | ObjectId | From token on create. Immutable owner. |
| type | `quiz` \| `test` \| `assignment` | Required |
| title | string | Required |
| description | string | |
| instructions | string | |
| subject | string | |
| totalMarks | number | >= 0. For quiz/test, should equal sum of question marks. |
| passingMarks | number | 0..totalMarks |
| durationMinutes | number | Required for quiz/test. Optional for assignment. |
| startAt | Date | Optional. Before this, students cannot start. |
| dueAt | Date | Required. Deadline. |
| attemptsAllowed | number | Default 1, min 1 |
| shuffleQuestions | boolean | Default false |
| showResultImmediately | boolean | Default true (objective-only results) |
| showCorrectAnswers | boolean | After graded / visibility rules |
| latePolicy | `reject` \| `allow` \| `allow_with_penalty` | Default `reject` |
| status | `draft` \| `published` \| `closed` \| `archived` | Default `draft` |
| questions | [Question] | Empty allowed for assignment |
| assignedStudentIds | [ObjectId] | Denormalized convenience; source of truth can be AssessmentAssignment |
| createdAt / updatedAt | Date | |

**Question subdocument**

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| type | `mcq` \| `true_false` \| `short_answer` \| `long_answer` | |
| prompt | string | Required |
| marks | number | >= 0 |
| order | number | |
| options | [{ _id, text, isCorrect }] | MCQ: ≥2 options, exactly one `isCorrect: true` |
| correctTrueFalse | boolean | true/false questions |
| answerKey | string | Optional short-answer key |
| explanation | string | Optional, tutor-only until visibility allows |
| rubric | string | Long answer / assignment guidance |

**Never** send `isCorrect`, `correctTrueFalse`, `answerKey`, or `explanation` to students until the attempt is graded **and** `showCorrectAnswers` (or equivalent visibility) allows it.

### 3.2 `AssessmentAssignment`

| Field | Type | Notes |
|---|---|---|
| assessmentId | ObjectId | |
| studentId | ObjectId | |
| assignedAt | Date | |
| assignedBy | ObjectId | tutorId from token |

Unique index `(assessmentId, studentId)`.

### 3.3 `AssessmentAttempt`

| Field | Type | Notes |
|---|---|---|
| assessmentId | ObjectId | |
| studentId | ObjectId | From token |
| attemptNumber | number | 1..attemptsAllowed |
| status | `in_progress` \| `submitted` \| `grading` \| `graded` \| `expired` | |
| startedAt | Date | |
| expiresAt | Date | `startedAt + durationMinutes` for quiz/test. Null for assignment. |
| submittedAt | Date | |
| late | boolean | submittedAt > dueAt |
| answers | [{ questionId, selectedOptionId?, trueFalse?, text? }] | |
| files | [{ name, url, mimeType, size, uploadedAt }] | Assignment uploads |
| score | number | Awarded marks. Server-computed. |
| percentage | number | `score / maxScore * 100` |
| maxScore | number | Snapshot of assessment.totalMarks |
| needsManualGrading | boolean | |
| feedback | string | Tutor overall comment |
| questionResults | [{ questionId, awardedMarks, maxMarks, feedback? }] | After auto/manual grade |
| locked | boolean | True after submit |

Autosave **must not** create a new attempt. Same `_id` until submit.

### 3.4 Files

Reuse the existing TutorLink upload/storage used for chat media / tutor documents (same bucket / disk / Cloudinary / S3 — whatever the backend already uses). Store only metadata on the attempt. Do not invent a second storage stack.

Allowed: PDF + images (frontend picker). Reject other MIME types.

---

## 4. Auto vs manual grading

On **submit** (and only then for objective items):

| Type | Grading |
|---|---|
| MCQ | Auto: selected option `isCorrect` → full question marks, else 0 |
| True/False | Auto: matches `correctTrueFalse` |
| Short answer | Manual unless you optionally auto-match `answerKey` (trim + case-insensitive). If no key or no match → `needsManualGrading` |
| Long answer | Always manual |
| Assignment | Always manual (text + files) |

```
score = sum(awardedMarks)
percentage = maxScore > 0 ? score / maxScore * 100 : 0
```

If any question still needs a tutor, set `status: grading` (or `submitted` + `needsManualGrading: true`). Do **not** publish a final student result until those marks exist, unless the assessment is 100% auto-graded and `showResultImmediately` is true.

Tutor grade PATCH:

- `0 <= awardedMarks <= question.marks`
- sum of awarded marks **must not** exceed `assessment.totalMarks`
- For assignment with no questions, accept body `awardedMarks` in `0..totalMarks` (tutor-entered, not student-trusted)

After publish: `status: graded`, notify student.

---

## 5. Start-attempt checks (all required)

`POST /api/assessments/:id/attempts`

1. Authenticated **student**
2. Assessment exists and `status === published`
3. Student is assigned (`AssessmentAssignment`)
4. `now >= startAt` if startAt set
5. Deadline: if `now > dueAt` and `latePolicy === reject` → `DEADLINE_PASSED`
6. Attempts used `< attemptsAllowed`. If an `in_progress` attempt exists, **return it** (do not create another)
7. Create attempt: snapshot `maxScore`, set `expiresAt` for timed quiz/test

If duration elapsed while `in_progress`, lock as `expired` (or auto-submit saved answers — pick one and document it). Frontend shows `expiresAt` only.

---

## 6. Submit checks

`POST /api/assessments/:id/attempts/:attemptId/submit`

1. Attempt belongs to `req.user._id`
2. Status is `in_progress` (not already submitted) → else `ALREADY_SUBMITTED` / `ATTEMPT_LOCKED`
3. Deadline / latePolicy
4. Lock attempt, set `submittedAt`, `late`
5. Auto-grade objective questions from **stored** answers (ignore any client `score`)
6. Set `needsManualGrading` if short/long/assignment remain
7. Notify **tutor** (`assessment_submitted`)

Autosave PATCH must refuse locked attempts (`ATTEMPT_LOCKED`).

---

## 7. Student GET sanitization

`GET /api/assessments/:id` as student:

- Include instructions, marks, duration, due dates, `attemptsUsed`, `remainingAttempts`, `studentStatus`, `lastAttemptId`
- Include question prompts, options **without** `isCorrect`
- Strip `correctTrueFalse`, `answerKey`, `explanation` until allowed

`GET .../results/:attemptId`:

- Own attempt only
- Score / percentage / feedback only when graded (or immediate auto-result is allowed)
- `correctAnswer` / explanations only if `showCorrectAnswers` and status is `graded`

Tutor GET of the same assessment **does** include keys and correct options.

---

## 8. API

All routes: Bearer token. Role noted per route.

### Tutor

| Method | Path | Notes |
|---|---|---|
| POST | `/api/assessments` | Create. `tutorId` from token. Body may include `status: draft`. |
| GET | `/api/assessments/tutor` | Query: `type`, `status`, `page`, `limit`. Include `pendingGradingCount` per item. |
| GET | `/api/assessments/tutor/eligible-students` | `{ _id, name, avatarUrl, subject, bookingId }[]` |
| GET | `/api/assessments/:id` | Owner only |
| PATCH | `/api/assessments/:id` | Owner. Restrict edits after submissions exist (questions locked or new version — at minimum block changing correct answers of in-flight attempts). |
| DELETE | `/api/assessments/:id` | Owner. Prefer **archive** (`status: archived`) if any submissions exist; hard-delete drafts OK. |
| POST | `/api/assessments/:id/publish` | `draft → published`. Require title, subject, dueAt, ≥1 eligible assigned student. Quiz/test require ≥1 question. |
| POST | `/api/assessments/:id/assign` | Body `{ studentIds: string[] }`. Verify each student is eligible. Upsert assignments. Notify each new student. |
| GET | `/api/assessments/:id/submissions` | Attempts (latest per student is fine). Fields below. |
| GET | `/api/assessments/:id/results` | Graded subset or same shape as submissions. |
| GET | `/api/assessments/:id/submissions/:attemptId` | Full answers, files, keys, questionResults |
| PATCH | `/api/assessments/:id/submissions/:attemptId/grade` | Body `{ questions?: [{ questionId, awardedMarks, feedback? }], awardedMarks?, feedback?, publish?: boolean }` |

**List / submissions item**

```json
{
  "_id": "attemptId",
  "student": { "_id": "", "name": "", "avatarUrl": "" },
  "status": "submitted",
  "submittedAt": "",
  "late": false,
  "score": 12,
  "percentage": 80,
  "gradingStatus": "pending"
}
```

`gradingStatus`: `pending` until tutor published (or fully auto-graded and visible).

### Student

| Method | Path | Notes |
|---|---|---|
| GET | `/api/assessments/student` | Assigned to this student. Query `type`, `status`, `page`, `limit`. |
| GET | `/api/assessments/:id` | Sanitized. 403 if not assigned. |
| POST | `/api/assessments/:id/attempts` | Start or resume in-progress |
| GET | `/api/assessments/:id/attempts/:attemptId` | Own in-progress (no keys) |
| PATCH | `/api/assessments/:id/attempts/:attemptId` | Body `{ answers: [...] }`. Autosave. Same attempt. |
| POST | `/api/assessments/:id/attempts/:attemptId/submit` | Lock + grade |
| POST | `/api/assessments/:id/attempts/:attemptId/files` | `multipart/form-data` field `file` |
| GET | `/api/assessments/:id/results/:attemptId` | Own result, sanitized |

Frontend also calls student result first, then falls back to GET attempt if 404 (in-progress).

---

## 9. Student list item extras

```json
{
  "_id": "",
  "type": "quiz",
  "title": "",
  "subject": "",
  "totalMarks": 20,
  "passingMarks": 10,
  "durationMinutes": 30,
  "startAt": "",
  "dueAt": "",
  "attemptsAllowed": 1,
  "attemptsUsed": 0,
  "remainingAttempts": 1,
  "studentStatus": "not_started",
  "lastAttemptId": null,
  "tutor": { "_id": "", "name": "" },
  "status": "published"
}
```

`studentStatus`: `not_started` | `in_progress` | `submitted` | `grading` | `graded` | `overdue`

---

## 10. Dashboard counts (no extra chatty calls)

Update existing:

`GET /api/home/dashboard` → `quickAccess`

| Key | Count meaning |
|---|---|
| `assignments` | Incomplete assigned assignments (not submitted / not graded overdue still counts as pending unless archived) |
| `quizzes` | Assigned quizzes not yet submitted (or in progress) |
| `tests` | Assigned tests not yet submitted / upcoming before dueAt |

Labels e.g. `"3 new"`, `"2 pending"`, `"1 upcoming"`.

Tutor list should include `pendingGradingCount` so the tutor home strip can highlight work to grade. Prefer computing that in `GET /api/assessments/tutor` rather than N+1 submission fetches.

---

## 11. Notifications (existing FCM / Notifee system)

Reuse `docs/BACKEND_PUSH_NOTIFICATIONS.md`. Do **not** add a second notification product.

FCM `data` (all string values):

| Event | `type` | Recipients | Extra data | App screen |
|---|---|---|---|---|
| Assigned / published to student | `assessment_assigned` | each assigned student | `assessmentId` | `StudentAssessmentDetailScreen` |
| Student submitted | `assessment_submitted` | tutor owner | `assessmentId`, `attemptId` | `TutorGradeAttemptScreen` |
| Tutor published grade | `assessment_graded` | that student | `assessmentId`, `attemptId` | `StudentAssessmentResultScreen` |
| Optional due reminder | `assessment_reminder` | student | `assessmentId` | `StudentAssessmentDetailScreen` |

Also persist to the existing notification inbox if you already store server notifications.

---

## 12. Error codes (frontend maps these)

| `code` | HTTP | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Wrong role / not owner / not assignee |
| `NOT_ASSIGNED` | 403 | Student not on the assessment |
| `NOT_ACTIVE` | 403 | Draft, archived, or before `startAt` |
| `DEADLINE_PASSED` | 403 | Late + `reject` |
| `NO_ATTEMPTS_LEFT` | 403 | attemptsUsed >= attemptsAllowed |
| `ALREADY_SUBMITTED` | 409 | Submit twice |
| `ATTEMPT_LOCKED` | 409 | Autosave/submit after lock |
| `INVALID_MARKS` | 400 | awardedMarks out of range |
| `VALIDATION_ERROR` | 400 | Missing title / questions / students |
| `ASSESSMENT_NOT_FOUND` | 404 | Unknown id |

---

## 13. Security checklist

- [ ] Ignore body `tutorId`, `studentId`, `role`, `score`, `percentage`, `expiresAt`
- [ ] Tutor can only mutate / grade own assessments
- [ ] Student can only read own assignments and own attempts
- [ ] Student A cannot `GET` student B’s attempt or result
- [ ] Correct answers never leak on start / autosave / in-progress GET
- [ ] Validate every `questionId` belongs to that assessment
- [ ] Assign only eligible booked students
- [ ] File upload: auth + ownership + size/MIME limits
- [ ] Publish requires assigned students + valid questions (quiz/test)

---

## 14. Suggested indexes

```
assessments: { tutorId: 1, status: 1, createdAt: -1 }
assessmentassignments: unique { assessmentId: 1, studentId: 1 }
assessmentassignments: { studentId: 1, assessmentId: 1 }
assessmentattempts: unique { assessmentId: 1, studentId: 1, attemptNumber: 1 }
assessmentattempts: { assessmentId: 1, status: 1 }
```

---

## 15. Migration

New collections (or equivalent). No change to existing User/Booking schemas required beyond using their `_id`s.

No new frontend environment variables. Use the existing API base URL.

Ship order:

1. Models + tutor CRUD + eligible students + assign/publish  
2. Student list/detail + start + autosave + submit + auto-grade  
3. File upload for assignments  
4. Tutor submissions + grade + notify  
5. Dashboard `quickAccess` real counts + `pendingGradingCount`

Until these routes exist, the app shows empty/error with retry (404 message: assessments not on the server yet).
