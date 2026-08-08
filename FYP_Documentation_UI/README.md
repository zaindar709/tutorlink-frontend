# TutorLink — FYP Documentation UI

Independent HTML/CSS replicas and high-resolution PNG screenshots of TutorLink application screens for BSCS Final Year Project documentation.

This folder is **completely separate** from the React Native app. It does not import or modify any files under `src/`.

## Folder structure

```
FYP_Documentation_UI/
├── html/              # Mobile HTML/CSS screen replicas
├── screenshots/       # High-resolution PNG exports (print-ready)
├── assets/            # Shared CSS + logo
├── generate-screens.mjs
├── capture.mjs
├── package.json
└── README.md
```

## Screenshots (17)

| # | File | Source in project |
|---|------|-------------------|
| 01 | `01_Login.png` | Student Login (`StudentLogin`) |
| 02 | `02_Register.png` | Student Sign Up (`StudentSignUp`) |
| 03 | `03_OTP_Verification.png` | Verify Code (`VerifyCodeScreen`) |
| 04 | `04_Student_Dashboard.png` | Student Home (`FirstTimeHome`) |
| 05 | `05_Tutor_Dashboard.png` | Tutor Home |
| 06 | `06_Parent_Dashboard.png` | Parent web dashboard (mobile-framed) |
| 07 | `07_Admin_Dashboard.png` | Admin web dashboard (mobile-framed) |
| 08 | `08_Search_Tutors.png` | Search Screen (map + nearby sheet) |
| 09 | `09_Tutor_Profile.png` | Tutor Booking Details |
| 10 | `10_Booking.png` | Student Bookings |
| 11 | `11_Payment.png` | Wallet / Deposit (JazzCash, Easypaisa) |
| 12 | `12_Chat.png` | Chat thread |
| 13 | `13_Live_Video_Session.png` | **Designed for FYP** (in-app video UI not shipped yet; join currently opens external meeting link) |
| 14 | `14_AI_Summary.png` | **Designed for FYP** (AI summary exists as chat system card / recommendations; dedicated screen planned) |
| 15 | `15_Notifications.png` | Notification Inbox |
| 16 | `16_Rating_Review.png` | Booking Review |
| 17 | `17_Settings.png` | Student Profile / Settings |

### Notes on screens 13 & 14

These UIs are **not implemented as dedicated React Native screens** in the current codebase. They were designed to match TutorLink branding (`#7548F5` glass theme) for documentation and future implementation. Existing app behavior today:

- **Live video:** sessions join via external `meetingLink` (`Linking.openURL`)
- **AI:** home AI tutor recommendation + chat `ai_summary` system cards

## Brand tokens used

From `src/theme/glass/tokens.ts` / `AUTH_GLASS`:

- Primary: `#7548F5` → `#5B2FD6` → `#4C1D95`
- Screen background: `#f6f7fc`
- Text: `#0F172A` / `#64748B` / `#94A3B8`

## Image specs

- Layout: mobile portrait **430 × 932** (app design frame)
- Export: **deviceScaleFactor 3.35** → approximately **1440 × 3122** PNG
- No Android status bar / navigation chrome
- No watermarks or browser UI

## Regenerate

```bash
cd FYP_Documentation_UI
npm install
npx playwright install chromium
npm run build
```

Or separately:

```bash
npm run generate   # rewrite HTML from generator
npm run capture    # HTML → PNG via Playwright
```

## Dummy data

Realistic sample content from project mocks: Ahmed Khan (student), Sara Ahmed (tutor), Prof. Ali Ahmed (chat), Mr. Aslam Khan / children (parent), JazzCash/Easypaisa wallet flows, PKR pricing.
