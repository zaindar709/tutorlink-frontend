# TutorLink promotional video

Cinematic **86-second** advertisement player for TutorLink.

Format: **1920×1080 · 16:9 · 30 FPS**  
Brand color: **#7548F5**  
Tagline: **Learn with Ease**

This package does not redesign the mobile app. Phone and desktop frames recreate the **implemented** TutorLink UI (student tabs, booking flow, WebRTC classroom, AI summaries, wallet + JazzCash/Easypaisa, chat, tutor requests/earnings, parent dashboard, admin verification).

## Run

```bash
cd promo-video
npm install
npm run dev
```

Open **http://localhost:5177**

Preview any second of the film with `http://localhost:5177/?t=16` (search), `?t=31` (classroom), `?t=60` (parent dashboard), `?t=82` (outro).

1. Click **Play advertisement** (required so the soundtrack can start).
2. Space = play/pause · `H` = hide controls · `M` = mute.
3. **Download full video** records the 86s film from this tab (Chrome), mixes in the song, and saves `TutorLink-Learn-with-Ease.webm` automatically. Share **this tab** when Chrome asks.

For a website hero, play the composition muted on loop (`Mute` then `Play`).

### Export to MP4

Chrome **Download full video** saves `TutorLink-Learn-with-Ease.webm`. Convert with FFmpeg if installed:

```bash
ffmpeg -i TutorLink-Learn-with-Ease.webm -c:v libx264 -pix_fmt yuv420p -c:a aac -r 30 TutorLink-Learn-with-Ease.mp4
```

Later crops: **9:16** Reels and **1:1** social — the scene list below is the same; only the camera framing changes.

---

## Screen assets

Copied from the React Native app into `public/images/`:

| File | Source |
| --- | --- |
| `TutorLinkLogo.png` | `src/assets/images/TutorLinkLogo.png` |
| Tab icons | `search.png`, `booking.png`, `home.png`, `request.png`, `add-group.png` |
| Onboarding stills | `OneOnOne.jpeg`, `aipowerd.jpeg`, `trackprogress.jpeg` |

UI recreation files:

- `src/ui/screens.tsx` — student/tutor phone screens
- `src/ui/desktops.tsx` — parent + admin dashboards
- `src/ui/chrome.tsx` — device frame, glass tab bar, captions

Demo people (Sara Ahmed, Ayesha, rates, JazzCash) match `src/constants/bookingFlowMockData.ts` and the parent dashboard mock profile.

---

## Animation sequence

1. Logo scale-in → **TutorLink / Learn with Ease** → *Learning. Teaching. Connecting.*
2. Problem cards (find / lessons / schedule / chat / pay / progress) → student home
3. Tap **Search** → type **Physics** → tutor cards → select Sara Ahmed
4. Profile scroll (rating, subjects, experience, slots) → **Hire Tutor**
5. Date → time → confirm (wallet escrow copy from the real booking modal)
6. Join **TutorLink Classroom** (mic, camera, PiP, End)
7. AI processing card → published **Learning Summary** (overview + key points)
8. Bookings week strip → wallet (JazzCash / Easypaisa) → in-app chat send
9. Split to tutor: dashboard → Accept request → earnings / JazzCash withdraw
10. Parent web overview (linked children, sessions, progress)
11. Session rating stars
12. Admin overview + tutor verification queue
13. Stack actually in this repo: React Native, Firebase, WebRTC, Socket.io, Gemini, Express, MongoDB, REST
14. Fast montage of the strongest screens
15. Logo resolve

Tap ripples fire on Search, tutor card, Hire Tutor, date/time, confirm, join, send, Accept, and stars.

---

## Scene timing (seconds)

| Time | Scene | On-screen line |
| --- | --- | --- |
| 0.0–5.4 | Intro | TutorLink · Learn with Ease |
| 5.2–9.6 | Problem | Finding the right tutor shouldn’t be complicated. |
| 9.3–13.6 | Student home | TutorLink brings it all together. |
| 13.3–18.6 | Search | Find the right tutor for your learning goals. |
| 18.3–23.1 | Profile | Choose tutors based on skills, experience and availability. |
| 22.8–28.1 | Booking | Book one-on-one learning sessions with ease. |
| 27.8–33.6 | Live classroom | Learn face-to-face with live one-on-one sessions. |
| 33.3–40.2 | AI summary | AI-powered summaries turn every session into useful learning insights. |
| 39.9–43.6 | Bookings | Stay organized with simple scheduling and bookings. |
| 43.3–47.2 | Wallet | Simple and transparent in-app payments. |
| 46.9–51.2 | Chat | Stay connected with secure in-app communication. |
| 50.9–57.6 | Tutor | Manage requests, schedules and earnings from one place. |
| 57.3–62.8 | Parent | Parents stay connected with their child’s learning journey. |
| 62.5–65.8 | Rating | Every session helps build a better learning experience. |
| 65.5–70.4 | Admin | Powerful tools for managing the entire learning ecosystem. |
| 70.1–73.8 | Technology | Built with modern technologies for a connected learning experience. |
| 73.5–78.4 | Montage | Feature flash (1–2s each) |
| 78.1–86.0 | Outro | Learn smarter. Teach better. Connect easier. |

Edit `src/timeline.ts` to retune.

---

## Music

File: `public/audio/education.mp3`

**Wholesome** by Kevin MacLeod (incompetech.com), licensed CC BY 3.0.

There is **no AI voiceover**. UI taps stay quiet under the song.

To swap the bed, replace `public/audio/education.mp3`.

---

## Sound effects

Triggered from `SFX_CUES` in `src/timeline.ts`:

| Kind | Use |
| --- | --- |
| `tap` / `click` | UI presses |
| `whoosh` | Scene transitions |
| `success` | Confirm / accept / send |
| `notify` | AI summary ready |

Kept quieter than the song.

---

## Transitions

Cross-fades (~0.38s), phone `rotateY` / scale, search → profile zoom, booking → classroom, mobile → laptop for parent/admin, faster cuts in the montage.

---

## What is not claimed

Only features that exist in this repo are shown: map search, hire/book + escrow wallet, WebRTC classroom, Gemini-backed summaries after tutor publish, JazzCash/Easypaisa, chat, tutor accept/decline, parent web app, admin verification/ratings/escrow/AI health. Assignments/quizzes tiles appear as they do on student home (including the in-app “coming soon” set).

---

## Code map

```
promo-video/
  public/audio/education.mp3  # Wholesome — Kevin MacLeod
  public/images/          # real TutorLink assets
  src/timeline.ts         # clock, captions, SFX
  src/PromoFilm.tsx       # scene camera
  src/audio/engine.ts     # music + SFX + VO
  src/ui/                 # device frames + screens
```
