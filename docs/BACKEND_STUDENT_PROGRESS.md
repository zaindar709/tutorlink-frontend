# Backend: Student Progress & Analytics

**For:** Backend developer  
**Frontend:** Student app — **My Progress** (`StudentProgressScreen`)  
Profile → Learning → My Progress, and Home (after hire) → My Progress tile.

**Base URL:** `https://tutorlink-backend-fxb9.onrender.com`  
**Auth:** `Authorization: Bearer <firebaseIdToken>`  
**Role:** `student` only. Always load **the logged-in student’s** bookings. Never take `studentId` from the query.

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Human readable error" }
```

---

## 1. Why this API

Parents already get child progress on the web dashboard. Students with **booked / live / completed sessions** need the **same numbers in the app**, so they can see:

- overall progress %
- attendance
- sessions this month
- per-subject score, grade, syllabus %, weekly bars
- weekly trend chart

Frontend is already calling:

```http
GET /api/student/progress
```

Until this route exists, the app falls back to session history counts (scores stay 0%). Ship this endpoint so scores are real.

**Reuse the same formulas as** `docs/BACKEND_PARENT_CHILD_SCOPED_DASHBOARD.md` §6 — just scoped to `req.user._id`.

---

## 2. Endpoint (P0)

`GET /api/student/progress`

**Auth:** student token.

### Response `data`

```json
{
  "overallProgress": 82,
  "attendanceRate": 96,
  "sessionsThisMonth": 8,
  "completedSessions": 24,
  "upcomingSessions": 3,
  "summary": "You are improving in Physics this month.",
  "tips": [
    "Revise electromagnetic waves before Thursday’s class.",
    "Your Math attendance is strong — keep the streak."
  ],
  "weeklyProgress": [
    { "label": "Jun 9", "score": 72 },
    { "label": "Jun 16", "score": 76 },
    { "label": "Jul 14", "score": 88 }
  ],
  "subjects": [
    {
      "subject": "Mathematics",
      "score": 85,
      "grade": "A",
      "syllabusCovered": 65,
      "trend": "up",
      "trendDelta": 5,
      "weeklyBars": [35, 48, 55, 62, 70],
      "sessionsCompleted": 10,
      "lastUpdated": "Sep 1, 2026"
    }
  ]
}
```

| Field | Notes |
| ----- | ----- |
| `overallProgress` | Mean of latest per-subject `score`. `0` if none |
| `attendanceRate` | `round(100 * completed / max(completed + missed, 1))` last 30 days (else all-time) |
| `sessionsThisMonth` | completed + upcoming + live in current calendar month |
| `completedSessions` | all-time `status: completed` |
| `upcomingSessions` | `accepted` / `confirmed` with start in the future, plus `live` |
| `weeklyProgress` | last 4–6 ISO weeks, `score` 0–100 |
| `subjects[].trend` | `"up"` \| `"down"` \| `"stable"` |
| `subjects[].weeklyBars` | exactly **5** numbers 0–100 |
| `subjects[].grade` | A+ ≥ 90, A ≥ 85, B+ ≥ 80, B ≥ 75, C+ ≥ 70, else C. `"—"` if score is 0 |
| `summary` / `tips` | Rule-based is fine. Do not block the API on AI |

Do **not** show `pending` bookings in upcoming counts.

---

## 3. Empty / just-booked rules

**No bookings at all**

```json
{
  "overallProgress": 0,
  "attendanceRate": 0,
  "sessionsThisMonth": 0,
  "completedSessions": 0,
  "upcomingSessions": 0,
  "summary": "Book a class to start tracking your learning progress.",
  "tips": [
    "Complete sessions to fill subject scores.",
    "Attendance and weekly charts update after each class."
  ],
  "weeklyProgress": [],
  "subjects": []
}
```

HTTP **200** with this payload — not 404.

**Has bookings, no completed sessions:** same zeros, `upcomingSessions` > 0, summary like `"No completed classes yet. Progress stays at 0% until you finish a session."`

**Has completed sessions:** real scores. If there are no quizzes/summaries yet, you may use `min(100, completedSessions * 8)` for a subject **only if you document that**. Prefer real quiz/summary averages when they exist.

---

## 4. How to compute (same student as token)

```
studentId = req.user._id
bookings = Booking.find({ studentId })
```

| Source | Use |
| ------ | --- |
| `Booking` | counts, attendance, subjects, upcoming |
| Session summaries / quizzes | per-subject `score`, `weeklyBars`, `weeklyProgress` |
| Student `interests` | subject list if they have no bookings yet (still 0 scores) |

Do not mix another student’s data. Parents are **not** this route (they use `/api/parent/...`).

---

## 5. Errors

| HTTP | When |
| ---- | ---- |
| 401 | Missing / invalid token |
| 403 | Token is not role `student` |
| 200 + empty payload | No history (preferred over 404) |

---

## 6. Optional later

`GET /api/student/progress?subject=Physics` — one subject only. Not required for v1.

---

## 7. Acceptance checklist

1. Logged-in student with completed Math sessions sees Math on `subjects[]` with `sessionsCompleted` matching bookings.
2. Student with only upcoming sessions: `overallProgress: 0`, `upcomingSessions > 0`.
3. Student with no bookings: 200 + empty payload, not 404.
4. Tutor / parent token → 403.
5. `weeklyBars` length is 5.
6. Numbers match the parent dashboard for the same child (same formulas).
