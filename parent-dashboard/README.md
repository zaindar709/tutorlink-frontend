# TutorLink Parent Dashboard

Web dashboard for parents to monitor linked children, sessions, progress, and payments.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Lucide icons
- Mock data only (no API yet)

## Run locally

```bash
cd parent-dashboard
npm install
npm run dev
```

Opens at **http://localhost:5175**

## Features

| Section | Description |
|---------|-------------|
| **Overview** | Stats, upcoming sessions, children snapshot, progress |
| **My Children** | Linked student cards with attendance & scores |
| **Sessions** | Filterable session list |
| **Progress** | Per-subject progress with trend indicators |
| **Payments** | Monthly spend + payment history table |
| **Notifications** | Full page with filters, mark read, delete |
| **Settings** | Hub + 7 sub-pages (profile, security, privacy, etc.) |

## Theme

- **Light / Dark / System** — toggle via moon/sun icon (top right) or Settings → Appearance
- Persists in `localStorage` (`tl-parent-theme`)

## Project structure

```
src/
  components/
    layout/       Sidebar, TopBar
    pages/        Main dashboard pages
    settings/     Settings hub + sub-pages
    shared/       GlassCard, StatCard, Toggle, etc.
  constants/      mockData, nav
  hooks/          useTheme, useParentDashboard
```

## Backend integration (later)

Replace `MOCK_PARENT_DASHBOARD` in `src/constants/mockData.ts` with API calls when parent endpoints are ready.
