# TutorLink Classroom Signaling Server

Standalone Socket.io signaling for TutorLink 1:1 WebRTC classrooms.

## Quick start

```bash
cd signaling-server
npm install
# Point at the same MongoDB as your TutorLink backend
set MONGODB_URI=mongodb://127.0.0.1:27017/tutorlink
set ALLOW_DEV_AUTH=true
set ALLOW_UNVERIFIED_SESSIONS=true
npm start
```

Server listens on `http://localhost:4001` by default.

## Production env

| Variable | Purpose |
|---|---|
| `PORT` | HTTP / Socket port (default `4001`) |
| `MONGODB_URI` | Same DB as TutorLink bookings |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin credentials JSON |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternate Firebase credential path |
| `ALLOW_DEV_AUTH` | `true` to accept bearer tokens without Firebase (dev only) |
| `ALLOW_UNVERIFIED_SESSIONS` | `true` to skip booking lookup (local demos) |
| `CLIENT_ORIGIN` | CORS origin |

## Mount into existing Express backend

```js
const { registerClassroomHandlers } = require('./signaling');
// after creating Socket.io `io` on your main server:
io.on('connection', socket => {
  registerClassroomHandlers(io, socket);
});
```

Use the same Mongo booking collection so `assertCanJoinSession` validates
that only the booked student + tutor can join `sessionId` (= `bookingId`).

## Socket events

Client → Server: `join-session`, `leave-session`, `offer`, `answer`, `ice-candidate`,
`toggle-camera`, `toggle-mic`, `screen-share-started`, `screen-share-stopped`,
`connection-quality`, `session-chat`, `call-ended`

Server → Client: `join-ack`, `peer-joined`, `peer-left`, `offer`, `answer`,
`ice-candidate`, `call-ended`, `session-error`, plus relayed media/chat events

## Mobile app config

In `src/config/signaling.ts`, set `SIGNALING_BASE_URL` to this server
(or keep `API_BASE_URL` if you mount signaling on the main backend).
