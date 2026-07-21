# TutorLink In-App Chat — Backend API Specification

This document is for **backend developers**. It defines REST + realtime APIs required to power the TutorLink mobile **Messages** feature (student ↔ tutor chat).

The mobile UI is already implemented with mock data. Wire these endpoints (and sockets) so the app can replace mocks.

---

## Base URL

```
https://tutorlink-backend-fxb9.onrender.com
```

All chat routes are prefixed with:

```
/api/chat
```

---

## Authentication

Every request must include a Firebase ID token:

```http
Authorization: Bearer <firebaseIdToken>
```

| Rule | Detail |
|------|--------|
| Token source | **Same Firebase project** as the mobile app (`tutor-link-62ed9`) |
| Identity | Resolve `User` via `firebaseUid` from verified token |
| Roles allowed | `student`, `tutor` (and optionally `parent` later) |
| 401 | Missing/invalid/expired token |
| 403 | User not a participant of the conversation |

> **Critical:** Backend Firebase Admin credentials must match the mobile app Firebase project, or all chat auth will fail with 401.

### Middleware (recommended)

```js
async function requireAuth(req, res, next) {
  const decoded = await verifyFirebaseToken(req.headers.authorization);
  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.user = user;
  next();
}

async function requireChatParticipant(req, res, next) {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
  const uid = String(req.user._id);
  const isParticipant = conversation.participants.some(p => String(p) === uid);
  if (!isParticipant) return res.status(403).json({ success: false, message: 'Forbidden' });
  req.conversation = conversation;
  next();
}
```

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### List

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Human readable error",
  "code": "OPTIONAL_ERROR_CODE"
}
```

---

## Product Rules (Must Enforce)

1. Chat is only between a **student** and a **tutor** (1:1). No group chat in v1.
2. Prefer creating a conversation only when:
   - a **booking exists** between them, OR
   - an admin/system allows “message tutor” after booking request.
3. Tutors in chat list should expose `isVerified` from tutor profile.
4. Messages are soft-deleted for “delete for me”; hard-delete only for own unsent/failed if needed.
5. File uploads go to cloud storage (S3 / Cloudinary / Firebase Storage); DB stores URLs + metadata.
6. System / AI cards are created by **backend jobs**, not by the client forging types freely (client may request actions; server emits system messages).

---

## Data Models

### Conversation

```js
{
  _id: ObjectId,
  participants: [ObjectId],          // [studentUserId, tutorUserId]
  student: ObjectId,                 // ref User
  tutor: ObjectId,                   // ref User
  booking: ObjectId | null,          // ref Booking (optional but recommended)
  subject: String,                   // e.g. "Mathematics"
  lastMessage: {
    text: String,
    type: String,
    sender: ObjectId,
    createdAt: Date,
    status: String                   // for sender's last outbound status summary
  },
  lastMessageAt: Date,
  pinnedBy: [ObjectId],              // users who pinned
  archivedBy: [ObjectId],            // users who archived
  deletedFor: [ObjectId],            // hide conversation for user
  createdAt: Date,
  updatedAt: Date
}
```

### Message

```js
{
  _id: ObjectId,
  conversation: ObjectId,
  sender: ObjectId,
  type: "text" | "image" | "pdf" | "document" | "voice" | "location" | "homework" | "system" | "session",
  text: String | null,
  status: "sending" | "sent" | "delivered" | "seen" | "failed",
  // delivery tracking
  deliveredTo: [ObjectId],
  seenBy: [ObjectId],
  edited: Boolean,
  editedAt: Date | null,
  deletedFor: [ObjectId],
  deletedForEveryone: Boolean,
  replyTo: ObjectId | null,          // ref Message
  reaction: {
    user: ObjectId,
    emoji: String
  } | null,                          // v1: single reaction per message (extend later)
  // media / files
  media: {
    url: String,
    thumbnailUrl: String | null,
    fileName: String | null,
    fileSize: Number | null,         // bytes
    mimeType: String | null,
    durationSec: Number | null,      // voice notes
    width: Number | null,
    height: Number | null
  } | null,
  location: {
    lat: Number,
    lng: Number,
    label: String
  } | null,
  // TutorLink special cards
  systemKind: "homework_shared" | "assignment_received" | "session_reminder" | "ai_summary" | "class_recording" | "booking_confirmed" | null,
  systemTitle: String | null,
  systemSubtitle: String | null,
  systemPayload: Object | null,      // bookingId, recordingUrl, homeworkId, etc.
  createdAt: Date,
  updatedAt: Date
}
```

### Presence (optional collection or Redis)

```js
{
  userId: ObjectId,
  isOnline: Boolean,
  lastSeenAt: Date,
  typingIn: ObjectId | null          // conversationId
}
```

---

## Mobile DTO Mapping

Frontend expects conversation list items shaped like:

```ts
{
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    role: "student" | "tutor";
    isVerified?: boolean;
    subject?: string;
    isOnline?: boolean;
    lastSeen?: string;          // human or ISO; app can format
  };
  lastMessage: string;
  lastMessageAt: string;        // ISO
  unreadCount: number;
  pinned?: boolean;
  archived?: boolean;
  isTyping?: boolean;
  lastStatus?: "sending" | "sent" | "delivered" | "seen" | "failed";
  subject: string;
}
```

Message item:

```ts
{
  id: string;
  chatId: string;
  type: MessageType;
  text?: string;
  senderId: string;
  isMine: boolean;              // computed per request user
  createdAt: string;            // ISO
  status?: MessageStatus;
  edited?: boolean;
  reaction?: string;
  replyTo?: { id: string; senderName: string; text: string };
  mediaUri?: string;
  fileName?: string;
  fileSize?: string;            // display string e.g. "1.2 MB" OR send bytes and let app format
  durationSec?: number;
  locationLabel?: string;
  systemKind?: SystemCardKind;
  systemTitle?: string;
  systemSubtitle?: string;
}
```

---

## REST Endpoints

### 1) List conversations

```http
GET /api/chat/conversations?page=1&limit=20&q=&archived=false
Authorization: Bearer <token>
```

**Query**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Pagination |
| `limit` | number | 20 | Max 50 |
| `q` | string | — | Search participant name / subject / last message |
| `archived` | boolean | false | List archived chats when true |

**Response `data[]`:** conversation DTOs (pinned first, then `lastMessageAt` desc).

**Unread count:** messages in conversation where `sender != me` and `me` not in `seenBy`.

---

### 2) Get / create conversation with a user

```http
POST /api/chat/conversations
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "participantId": "64f...",
  "bookingId": "64f...",
  "subject": "Mathematics"
}
```

**Rules**

- If conversation already exists between the two users → return existing.
- Validate roles are complementary (student ↔ tutor).
- Prefer requiring `bookingId` in production.

**Response:** single conversation DTO (+ optional `messages` first page).

---

### 3) Get conversation by id

```http
GET /api/chat/conversations/:conversationId
Authorization: Bearer <token>
```

---

### 4) Pin / unpin

```http
PATCH /api/chat/conversations/:conversationId/pin
Authorization: Bearer <token>
```

```json
{ "pinned": true }
```

Adds/removes current user in `pinnedBy`.

---

### 5) Archive / unarchive

```http
PATCH /api/chat/conversations/:conversationId/archive
Authorization: Bearer <token>
```

```json
{ "archived": true }
```

---

### 6) List messages (cursor pagination recommended)

```http
GET /api/chat/conversations/:conversationId/messages?cursor=&limit=30
Authorization: Bearer <token>
```

| Param | Description |
|-------|-------------|
| `cursor` | `_id` or `createdAt` of oldest message currently loaded |
| `limit` | default 30 |

Return **newest page** for initial open; older pages via cursor.

**Side effect (recommended):** mark delivered for messages not sent by me.

---

### 7) Send text message

```http
POST /api/chat/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "type": "text",
  "text": "Assalam o Alaikum!",
  "replyTo": "64f..." 
}
```

**Server sets:** `status: "sent"`, `createdAt`, updates conversation `lastMessage*`.

**Realtime:** emit `message:new` to conversation room.

---

### 8) Send media / file / voice / homework

**Option A — multipart direct**

```http
POST /api/chat/conversations/:conversationId/messages/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Fields:

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `image` \| `pdf` \| `document` \| `voice` \| `homework` |
| `file` | yes | binary |
| `text` | no | caption |
| `durationSec` | voice | number |
| `replyTo` | no | message id |

**Option B — presigned URL (preferred for large files)**

1. `POST /api/chat/uploads/presign` → `{ uploadUrl, fileUrl, key }`
2. Client uploads to storage
3. `POST /api/chat/conversations/:id/messages` with media metadata

```json
{
  "type": "pdf",
  "text": "Homework chapter 4",
  "media": {
    "url": "https://cdn.../file.pdf",
    "fileName": "derivatives-practice.pdf",
    "fileSize": 1258291,
    "mimeType": "application/pdf"
  }
}
```

**Limits (suggested)**

| Type | Max size |
|------|----------|
| Image | 10 MB |
| PDF / document / homework | 20 MB |
| Voice | 5 MB / max 5 min |

Allowed mime: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `audio/m4a`, `audio/mpeg`, `audio/aac`.

---

### 9) Send location

```http
POST /api/chat/conversations/:conversationId/messages
```

```json
{
  "type": "location",
  "location": {
    "lat": 31.5204,
    "lng": 74.3587,
    "label": "Lahore, Pakistan"
  }
}
```

---

### 10) Edit message (own text only)

```http
PATCH /api/chat/messages/:messageId
Authorization: Bearer <token>
```

```json
{ "text": "Updated text" }
```

Rules: only sender; only `type=text`; within e.g. 15 minutes (configurable). Set `edited: true`.

Emit `message:updated`.

---

### 11) Delete message

```http
DELETE /api/chat/messages/:messageId?scope=me|everyone
Authorization: Bearer <token>
```

| scope | Behavior |
|-------|----------|
| `me` | add user to `deletedFor` |
| `everyone` | only sender; set `deletedForEveryone` + tombstone text |

Emit `message:deleted`.

---

### 12) React to message

```http
POST /api/chat/messages/:messageId/reactions
Authorization: Bearer <token>
```

```json
{ "emoji": "👍" }
```

Empty emoji or `DELETE` removes reaction.

Emit `message:reaction`.

---

### 13) Mark conversation read

```http
POST /api/chat/conversations/:conversationId/read
Authorization: Bearer <token>
```

```json
{
  "upToMessageId": "64f..."
}
```

Add current user to `seenBy` for all messages up to that id (not sent by me). Update statuses → `seen` for sender.

Emit `message:seen` to conversation.

---

### 14) Forward message

```http
POST /api/chat/messages/:messageId/forward
Authorization: Bearer <token>
```

```json
{
  "targetConversationIds": ["64f...", "64f..."]
}
```

Creates copies in target conversations (participant check required).

---

## Realtime (Socket.IO recommended)

### Connection

```
URL: wss://tutorlink-backend-fxb9.onrender.com
Auth: { token: "<firebaseIdToken>" }
```

On connect:

1. Verify Firebase token
2. Join personal room: `user:<userId>`
3. Client joins conversations as needed: `conversation:<conversationId>`

### Client → Server events

| Event | Payload | Purpose |
|-------|---------|---------|
| `conversation:join` | `{ conversationId }` | Subscribe to thread |
| `conversation:leave` | `{ conversationId }` | Unsubscribe |
| `typing:start` | `{ conversationId }` | Show typing |
| `typing:stop` | `{ conversationId }` | Hide typing |
| `presence:ping` | `{}` | Keep online (or use connect/disconnect) |

### Server → Client events

| Event | Payload | UI effect |
|-------|---------|-----------|
| `message:new` | message DTO | Append bubble |
| `message:updated` | message DTO | Edit label / text |
| `message:deleted` | `{ messageId, scope }` | Remove / tombstone |
| `message:reaction` | `{ messageId, reaction }` | Reaction chip |
| `message:delivered` | `{ messageId, conversationId }` | Double tick |
| `message:seen` | `{ messageIds[], conversationId, seenBy }` | Blue/purple read ticks |
| `typing:update` | `{ conversationId, userId, isTyping }` | Typing dots |
| `presence:update` | `{ userId, isOnline, lastSeenAt }` | Online indicator |
| `conversation:updated` | conversation preview DTO | Refresh list row |
| `session:started` | `{ conversationId, bookingId, joinUrl }` | Floating “Join Now” card |

---

## TutorLink System Messages (Backend-generated)

Create `type: "system"` or `type: "session"` messages from domain events:

| Event | `systemKind` | Example title |
|-------|--------------|---------------|
| Booking confirmed | `booking_confirmed` | Booking Confirmed |
| Homework uploaded by tutor | `homework_shared` | Homework Shared |
| Student submits assignment | `assignment_received` | Assignment Received |
| Reminder job (T-30 min) | `session_reminder` | Session Reminder |
| AI summary ready | `ai_summary` | AI Summary Shared |
| Recording ready | `class_recording` | Class Recording Available |
| Tutor starts live class | (`type: "session"`) | Tutor has started your session |

These should appear in the message timeline and update `lastMessage` preview.

---

## Presence Rules

| State | Rule |
|-------|------|
| Online | Socket connected (or last ping < 60s) |
| Last seen | `lastSeenAt` when disconnecting |
| Typing | Auto-expire after 3–5s without `typing:start` refresh |

---

## Security & Privacy

1. Always verify conversation membership.
2. Do not return messages deleted for the requesting user.
3. Rate-limit sends (e.g. 30 messages / minute / user).
4. Scan/validate uploads (mime + extension).
5. Encryption banner in UI is **product copy**; if true E2E is required later, document separately. For v1, **TLS + authz** is the baseline (“protected in transit”).
6. Never trust client `isMine` / `status` — compute server-side.

---

## Suggested Implementation Order (Backend)

### P0 — MVP to replace mocks

1. Conversation list + get-or-create
2. Message list + send text
3. Socket `message:new`
4. Read receipts (`delivered` / `seen`)
5. Unread counts

### P1 — Match full UI

6. Pin / archive
7. Typing indicators
8. Presence online/last seen
9. Image / PDF / document upload
10. Voice notes
11. Reply / edit / delete / reactions

### P2 — Education features

12. Homework / assignment system cards
13. Session reminder jobs
14. Live session “Join Now” event
15. AI summary + recording cards
16. Forward message

---

## Example Flows

### Open Messages tab

1. `GET /api/chat/conversations`
2. Connect socket + listen `conversation:updated`, `presence:update`

### Open a chat

1. `GET /api/chat/conversations/:id/messages?limit=30`
2. `conversation:join`
3. `POST /api/chat/conversations/:id/read`
4. Listen `message:new`, `typing:update`, `message:seen`

### Send text

1. Optimistic UI (`sending`)
2. `POST .../messages`
3. On success → `sent`
4. Peer socket receives `message:new` → their device emits delivered/seen via read APIs

---

## Error Codes (recommended)

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Bad/missing token |
| `FORBIDDEN` | 403 | Not a participant |
| `NOT_FOUND` | 404 | Conversation/message missing |
| `VALIDATION_ERROR` | 400 | Bad payload |
| `FILE_TOO_LARGE` | 413 | Upload limit |
| `UNSUPPORTED_MEDIA` | 415 | Mime not allowed |
| `RATE_LIMITED` | 429 | Too many messages |
| `BOOKING_REQUIRED` | 400 | Cannot chat without booking |

---

## Env Vars (Backend)

```env
FIREBASE_PROJECT_ID=tutor-link-62ed9
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

CHAT_UPLOAD_BUCKET=...
CHAT_UPLOAD_MAX_MB=20
CHAT_PRESENCE_TTL_SEC=60
REDIS_URL=...                 # recommended for sockets + presence at scale
```

---

## Frontend Integration Notes

Mobile screens (already built, mock-driven):

| Screen | Path |
|--------|------|
| Chat list | `src/screens/MainScreens/SharedScreens/Chat/ChatListScreen` |
| Chat thread | `src/screens/MainScreens/SharedScreens/Chat/ChatScreen` |
| Mock shapes | `src/constants/chatMockData.ts` |

When APIs are ready, replace mocks in a service layer such as:

- `src/services/chat/chatService.ts`
- `src/api/chat.api.ts`
- socket client helper

Do **not** change DTO field names without coordinating with frontend.

---

## Contact / Ownership

- Mobile chat UI: TutorLink frontend (`in-appchat-ui` branch)
- Auth dependency: Firebase ID token verification must use project **`tutor-link-62ed9`**
- Related existing routes: bookings, tutor profiles, verification (`isVerified`)

---

## Checklist for Backend Sign-off

- [ ] `GET /api/chat/conversations` returns pinned + unread correctly  
- [ ] Student can message only allowed tutors (booking rule)  
- [ ] Text send + realtime receive works on 2 devices  
- [ ] Delivered / seen ticks update  
- [ ] Typing + online presence works  
- [ ] Image/PDF/voice upload works on Android + iOS  
- [ ] System cards created from booking/session events  
- [ ] Session started → Join Now payload includes meeting link  
- [ ] Firebase project matches mobile app (no 401 on chat routes)  
