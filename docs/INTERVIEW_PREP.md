# TutorLink — FYP Technical Interview Notes

Yeh file **is project ke real code** par based hai. Interview mein generic textbook nahi — **humne kya use kiya aur kyun**.

Short pitch (30 sec):

> TutorLink ek tuition marketplace hai. Students tutors search/book karte hain, live 1:1 class WebRTC se hoti hai, payments escrow mein rehte hain, session ke baad AI summary generate hoti hai. Parent web portal student code se dashboard kholta hai — parent ka alag login nahi. Auth Firebase se hai, app state Redux se, local persistence AsyncStorage se, live class Socket.io signaling + WebRTC se, alerts FCM + Notifee se.

---

## 1. High-level architecture

```
Student / Tutor App (React Native)
        │
        │  HTTPS + Bearer Firebase ID token
        ▼
Backend REST  (Render)  ── MongoDB
        │
        ├── Socket.io  (chat + classroom signaling)
        ├── Firebase Admin (verify token, send FCM)
        └── AI summary worker

Parent Web (Vite) ── same REST, NO parent login
        └── student link code in localStorage

Admin Web ── admin APIs
```

**Roles:** `student` | `tutor` | `parent`  
Parent **mobile auth hataya hua hai** — parent sirf web par code paste karta hai.

**Stack (app):** React Native 0.84, React Navigation, Redux Toolkit, Axios, `@react-native-firebase/auth` + `messaging`, `@react-native-async-storage/async-storage`, `react-native-webrtc`, `socket.io-client`, `@notifee/react-native`.

---

## 2. AsyncStorage

### Kya hai?

AsyncStorage React Native ka **key–value local disk store** hai (small JSON strings). Async hai — UI thread block nahi karta. Ye **database nahi** (no queries, no relations). Sensitive secrets ke liye production mein encrypted storage better hoti hai; FYP mein session yahan save hota hai.

**API:** `setItem(key, string)` · `getItem(key)` · `removeItem(key)`

### Hum kahan use karte hain?

| Key / store | File | Kyun |
|---|---|---|
| `@TutorLink:authSession` + `@TutorLink:authToken` | `src/services/storage.ts` | App kill ke baad login restore |
| `@TutorLink:fcmDeviceToken` | `pushNotificationService.ts` | Same FCM token dobara register na ho |
| Tutor editable profile | `tutorProfileLocalStore.ts` | Bio, fee draft phone par |
| Tutor onboarding cache | `tutorOnboardingCache.ts` | Document flow resume |
| Profile hint / suggestions | `profileCompletionHintStore.ts` | Tooltip ek baar |
| Ratings cache | `ratingSlice.ts` | Offline-ish rating list |
| Booking watch ids | `studentBookingWatchStore.ts` | Accept/reject poll |
| Local inquiry chat | `localInquiryChat.ts` | Pre-booking chat fallback |
| Notification inbox | inbox store | Tray + in-app center |

Parent **web** par AsyncStorage nahi — wahan `localStorage` (`tutorlink_parent_children_v1`).

### Interview answers

**Q. Redux kyun nahi kaafi? AsyncStorage kyun?**  
Redux RAM mein hai. App band → Redux empty. Session, “hint already shown”, FCM token disk par chahiye.

**Q. AsyncStorage vs Redux?**  
- Redux = **current session UI state** (fast, in-memory)  
- AsyncStorage = **survive restart**  
Login: Firebase + backend → Redux `setUser` **aur** `saveAuthSession()`.  
Splash: `getAuthSession()` → agar Firebase user bhi hai to Redux hydrate.

**Q. Security?**  
AsyncStorage plaintext. FYP tradeoff. Production: Keychain / EncryptedStorage, short-lived tokens, logout par `clearAuthSession()`.

**Q. Large data?**  
Nahi. Media/files yahan nahi. Sirf JSON flags + session.

---

## 3. Redux Toolkit

### Kya hai?

Global in-memory store. TutorLink **Redux Toolkit** use karta hai (`configureStore`, `createSlice`, `createAsyncThunk`). Classic `switch` reducers nahi.

Store: `src/store/store.ts`

```
auth       → user, token, role, isLoggedIn
booking    → booking lists / flow
chat       → conversations, messages
summary    → AI class summaries + statusBySession
rating     → rate-tutor modal + entries
```

Typed hooks: `useAppDispatch`, `useAppSelector` (`src/store/hooks.ts`).

### Auth slice (example)

`setUser({ user, token, role })` login par.  
`logout` → memory clear. Disk alag `clearAuthSession()` + Firebase `signOut`.

### Thunks kahan?

API side-effects slices ke thunks mein:

- `summarySlice` — end session, poll status, publish  
- `chatSlice` — conversations / send  
- `ratingSlice` — submit rating  

Simple REST lists aksar **hooks** mein hain (`useProfile`, `useBookings`) — har cheez Redux mein nahi. Interview mein yeh strength hai: **global shared state Redux, screen-local data hooks**.

### Interview answers

**Q. Context API kyun nahi?**  
Auth + chat unread + summary sockets + rating modal kai screens share karte hain. Context har update par bade trees re-render karta hai; RTK slices isolated hain, DevTools + thunks milte hain.

**Q. Redux persist kyun nahi?**  
Humne **manual persist** ki: sirf auth session AsyncStorage. Poori chat/summary persist karna stale + complex. Splash par session restore kaafi hai.

**Q. Reducer pure kyun hona chahiye?**  
RTK Immer use karta hai — “mutate” dikhta hai, internally copy. Side effects thunks / listeners mein.

**Q. Token Redux aur AsyncStorage dono mein kyun?**  
Redux: Axios interceptor / sockets turant padhein.  
Storage: process death ke baad. Interceptor pehle Firebase live token, phir cache, phir storage, phir Redux.

---

## 4. Firebase

### Hum kya use karte hain?

| Product | Package | Kaam |
|---|---|---|
| **Authentication** | `@react-native-firebase/auth` | Email/password + Google |
| **Cloud Messaging** | `@react-native-firebase/messaging` | Device token + push |
| **Admin (backend)** | Firebase Admin | ID token verify, FCM send |

**Firestore/Realtime DB app se nahi** — business data Mongo + REST.

### Auth flow (bolna yeh)

1. Student/Tutor email+password → `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` (`firebaseAuthService.ts`).  
2. `user.getIdToken()` → JWT (Firebase ID token).  
3. Axios `Authorization: Bearer <idToken>`.  
4. Backend Admin SDK se token verify karta hai, Mongo `User` nikalta hai (`firebaseUid`).  
5. Pehli baar: `POST /api/auth/register` (role student/tutor). Dobara: `POST /api/auth/login`.  
6. Response user + role → Redux + AsyncStorage.

Google: `@react-native-google-signin` → Google `idToken` → Firebase credential → same backend login.

**Timeouts:** Firebase hang ho sakta hai (`unexpected end of stream`) — `withTimeout` (signup ~20s, token ~10s).

**Splash restore (`bootstrapAuth.ts`):**  
AsyncStorage session + Firebase `onAuthStateChanged`.  
Agar storage hai Firebase nahi → clear (stale).  
Firebase hai storage nahi → sign out.  
Dono hain → token refresh, Redux `setUser`.

### Interview answers

**Q. Firebase Auth vs apna JWT?**  
Password hashing, Google, refresh, device persistence Firebase handle karta hai. Humara backend **source of truth for role/profile/bookings** hai. Token = identity; Mongo = product data.

**Q. Token expire?**  
ID tokens ~1 hour. `getIdToken(false)` cached; interceptor 401 par refresh try. Token resolve timeout 2.5s taake API hang na ho.

**Q. Parent Firebase account?**  
Nahi. Parent web **code-only**: `POST /api/parent/access-by-code`. `Authorization` nahi. Codes `localStorage` mein.

**Q. Security rules?**  
Auth + FCM. Database rules nahi kyunki Firestore nahi.

---

## 5. Axios / API layer (integration glue)

`src/api/client.ts` — ek Axios instance, `baseURL` Render backend.

**Request interceptor**

1. Firebase current user → ID token (memory cache ~8 min).  
2. Nahi mila to AsyncStorage token.  
3. `Authorization: Bearer …`  
4. FormData par `Content-Type` hatao (boundary).

**Response interceptor**

- 401 + had Bearer → session clear, logout, auth stack.  
- Kuch 404 “soft” (linked-parents missing) — crash nahi.

**Pattern:** `*.api.ts` raw HTTP → `*Service.ts` normalize → hook/thunk.

Yeh interviewer ko dikhao: **UI → hook → service → axios → Firebase token → backend**.

---

## 6. WebRTC (live class)

### Kya hai?

WebRTC **peer-to-peer** audio/video. Media phones ke beech jati hai; server **signaling** karta hai (offer/answer/ICE), media proxy nahi (TURN alag topic).

### Humara stack

- `react-native-webrtc` — `getUserMedia`, `RTCPeerConnection`  
- `socket.io-client` — signaling (`src/services/webrtc/socketService.ts`)  
- `useWebRTC` hook + `VideoSessionScreen`  
- Signaling host: **same backend** (`SIGNALING_BASE_URL = API_BASE_URL`), path `/socket.io`  
- `sessionId` = **accepted booking `_id`**

Standalone `signaling-server/` demo hai; production Render par mounted handlers.

### Call flow (board par draw karo)

```
1. Join Room (booking accepted, time window)
2. Camera/mic permission
3. Socket connect (Firebase token)
4. emit join-session { sessionId }
5. getUserMedia → local preview
6. Peer join
7. Tutor (ya jo offer create kare) createOffer → emit offer (SDP)
8. Other setRemoteDescription, createAnswer → emit answer
9. ICE candidates dono tarf trickle
10. ontrack → remote video
11. End → emit call-ended, PC.close(), AI summary POST /api/summaries/session/:id/end
```

In-class chat bhi isi classroom socket par (`session-chat`). End par chat chunks summary ko transcript ke taur par ja sakte hain.

Permissions: `react-native-permissions`. Audio route: `react-native-incall-manager`.

Dev mein native module missing ho to **JS shim** UI toote nahi — real media nahi.

### Interview answers

**Q. Signaling kyun zaroori?**  
Peers ko IP/SDP exchange chahiye. HTTP request-response se ICE trickle mushkil. Socket.io rooms = ek booking ka classroom.

**Q. STUN vs TURN?**  
STUN: public ICE candidates. Symmetric NAT / campus firewall → **TURN relay**. Interview mein bolo: FYP P2P + STUN; production TURN (coturn) add karenge.

**Q. Security?**  
Join se pehle backend booking check: sirf us student + tutor. Token socket `auth` mein. Random `sessionId` guess se join nahi.

**Q. SFU/Mes?**  
1:1 class — **mesh P2P** kaafi. Group class ke liye SFU (mediasoup/livekit).

**Q. Offer collision?**  
Server `shouldCreateOffer` / tutor role se ek side offer bhejti hai.

---

## 7. Push notifications

### Do layers

1. **FCM** (`messaging`) — Google se device tak message. Background/quit par OS tray **agar** payload mein `notification` block ho.  
2. **Notifee** — **foreground** (FCM khud tray nahi dikhata jab app open ho) aur **data-only** background messages.

### Register flow

Login/restore ke baad `BookingNotificationsBridge`:

1. Android 13+ permission  
2. `messaging().getToken()`  
3. Token AsyncStorage  
4. `POST /api/notifications/device-token` `{ token, platform, role }`  
5. `onTokenRefresh` → dubara POST  

Logout: `deleteToken` + `DELETE /api/notifications/device-token`.

Permission Alert ke saath race se Hermes crash ho sakta tha — register **delayed** (`InteractionManager` / timer).

### App states

| State | Who shows tray |
|---|---|
| Foreground | Notifee (`onMessage`) |
| Background + `notification`+`data` | OS (FCM) — Notifee duplicate nahi |
| Background data-only | Notifee in `setBackgroundMessageHandler` |
| Tap | `onNotificationOpenedApp` / `getInitialNotification` → deep link (booking, summary, chat) |

In-app **Notification Center** bhi: FCM + `GET /api/notifications` sync.

Types: booking accept/reject, session reminder, chat, `ai_summary`, `ai_summary_review`.

### Interview answers

**Q. FCM vs local notification?**  
FCM server-triggered (dusra user / cron). Local = is device par schedule. Reminders: backend FCM preferred; inbox local merge.

**Q. Duplicate notification?**  
Agar FCM ne pehle tray dikha di, background handler Notifee skip karta hai.

**Q. Data vs notification payload?**  
`notification` = OS display. `data` = screen, ids (sab **strings**). Hum dono bhejte hain.

---

## 8. End-to-end: kaise integrate hai

### A) Login → Home

```
Firebase Auth → ID token → Axios login/register → Mongo user
     → Redux setUser + AsyncStorage session
     → FCM token register
     → Tabs by role (student vs tutor)
```

### B) Book → Class → Summary

```
Search tutors (REST)
  → Create booking (escrow hold on backend)
  → Tutor accept (student FCM)
  → Join Room → WebRTC + signaling
  → End class → POST summaries/session/:id/end
  → Socket events summary-generated / published
  → Student FCM “AI summary ready”
```

### C) Chat

Alag Socket.io (same host): conversations REST, live `new-message`. Unread Redux `chat` slice. Classroom chat alag events.

### D) Parent

Student `POST /api/profile/link-code/generate` (Bearer).  
Parent web code → `POST /api/parent/access-by-code` → dashboard GET `?code=`.  
Web `localStorage` children list. RN AsyncStorage nahi.

---

## 9. Navigation / UI (short)

- `@react-navigation/native-stack` + bottom tabs  
- Role se **do alag tab sets**  
- Profile tab: auth/cache se pehle paint, profile API background (spinner nahi)  
- Glass UI: LinearGradient + shared `GLASS` theme  

**Q. Native vs React Navigation?**  
Cross-platform JS navigation; native screens (`react-native-screens`) performance ke liye.

---

## 10. Aur sawaal jo poochhe ja sakte hain

### Architecture / FYP

**MVC / layers?**  
Screens → hooks → services → api. Signaling/FCM services alag. Backend alag repo (Mongo + Express typically).

**Monorepo?**  
RN app + `parent-dashboard` + `admin-dashboard` + `signaling-server` ek frontend repo mein.

**Env?**  
`API_BASE_URL` Render. Parent Vite `.env`. Firebase `google-services.json`.

### State / data

**Optimistic UI?**  
Chat/rating local pehle, fail par toast. Bookings server status.

**Pagination?**  
Summaries/chat lists page+limit. Dashboard ek shot.

**Offline?**  
Poora offline nahi. Session + kuch caches. Live class/booking online.

### Security

- HTTPS  
- Bearer on REST + sockets  
- Classroom join booking-gated  
- Parent code: no Bearer; backend code strip `~`; rate limit  
- 401 → hard logout  
- Generate new parent code = purana disconnect  

**Q. XSS parent web?**  
React escapes. Code input trim/normalize, raw HTML nahi.

### Performance

- Axios token memory cache  
- Profile in-memory cache ~20s  
- Tabs `detachInactiveScreens={false}` taake Profile remount na ho  
- Render cold start: parent fetch 90s timeout; loading ≠ invalid code  

### WebRTC extra

**ICE restart?** Service mein `restartIce` weak network par.  
**getStats?** Quality sampling → `connection-quality` event.  
**Screen share:** tutor `getDisplayMedia`-style RN API.

### Testing / quality

Jest setup hai; FYP mein zyada **manual device testing** (permissions, FCM, WebRTC). Interview mein bolo: unit tests services ke liye, E2E Detox future.

### Tradeoffs (impress karega)

| Choice | Why | Cost |
|---|---|---|
| Firebase Auth | Fast, Google | Vendor + token plumbing |
| Mongo identity vs Firebase uid | Product data flexible | Do IDs map (`firebaseUid` → `_id`) |
| P2P WebRTC | Low server cost 1:1 | NAT/TURN |
| Code-only parent | No parent signup | Code leak = dashboard access until regenerate |
| Redux + hooks mix | Kam boilerplate | Do patterns seekhni padti hain |
| FCM + Notifee | Foreground tray | Duplicate handling |

### Weak spots (honest)

- AsyncStorage unencrypted  
- No TURN yet  
- Render free tier cold start  
- AI summary backend par depend  
- Tutor fee kabhi local-only sync miss → student rate 0  

Yeh admit + “agar time milta to…” = mature answer.

---

## 11. 60-second answers (rat lo)

**AsyncStorage:** Key-value disk. Session, FCM token, hints. Redux nahi bachaata restart.

**Redux:** Global UI — auth, chat, summaries, ratings. RTK slices + thunks. Persist sirf auth manually.

**Firebase:** Identity + push. Data Mongo. Axios har request par ID token.

**WebRTC:** P2P class. Socket signaling. `sessionId` = booking id. End → AI summary.

**Push:** FCM deliver, Notifee foreground display, backend token register, tap → deep link.

**Parent:** No Firebase parent user. Link code. Web localStorage.

---

## 12. Unlikely but possible extras

- **Hermes** — RN JS engine; Alert + FCM permission race pe crash dekha, isliye delay.  
- **Reanimated** — tab button spring, summary processing pulse.  
- **Escrow** — book par hold, complete par tutor, cancel par refund (backend).  
- **Maps** — MapLibre/Maps tutor search area (agar poochhein).  
- **AI** — Gemini tutor recommend; class summary backend LLM + tutor publish gate.

---

## 13. Demo script (viva)

1. Student login (Firebase) → Home schedule  
2. Book tutor → pending → tutor accept → FCM student  
3. Join Room → 2 devices video  
4. End class → processing screen (bina Debug/Sync)  
5. Tutor review/publish → student summary list  
6. Profile tab **instant**  
7. Parent site: paste code → us child ka dashboard  

Agar WebRTC lab NAT fail ho: signaling join-ack + local preview dikhao, TURN limitation explain.

---

*Code refs: `src/services/storage.ts`, `src/store/store.ts`, `src/services/auth/`, `src/api/client.ts`, `src/hooks/useWebRTC.ts`, `src/services/notifications/pushNotificationService.ts`, `parent-dashboard/src/services/codeAccessStore.ts`.*
