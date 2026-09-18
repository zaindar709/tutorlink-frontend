# TutorLink Parent Dashboard

Web dashboard for parents to monitor linked children, sessions, progress, and payments.

Live API: `https://tutorlink-backend-fxb9.onrender.com`

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Lucide icons
- Firebase Auth (email/password) + parent APIs

## Run locally

```bash
cd parent-dashboard
npm install
npm run dev
```

Opens at **http://localhost:5175**

Optional `.env`:

```
VITE_API_BASE_URL=https://tutorlink-backend-fxb9.onrender.com
VITE_FIREBASE_API_KEY=your-firebase-web-key
```

## How it works

1. Student generates a link code in the mobile app (Profile → Link Parent).
2. Parent opens this site and **pastes the code** — no sign in.
3. Dashboard loads that student’s data via `POST /api/parent/access-by-code` (or `GET /api/parent/dashboard?code=`).
4. Use **Add child** to paste another code. Switch children from the top chips.

## Features

| Section | Description |
|---------|-------------|
| **Overview** | Stats, weekly progress, AI insights, upcoming sessions |
| **My Children** | Linked student cards with attendance & scores |
| **Sessions** | Filterable session list |
| **Progress** | Per-subject progress with trend indicators |
| **Payments** | Monthly spend + payment history |
| **Notifications** | Mark read, mark all, delete |
| **Settings** | Profile, security, prefs, privacy, linked students, appearance, language |
