# Backend: Firebase Cloud Messaging (push notifications)

Mobile app registers an FCM device token after login / session restore and clears it on logout.

## Endpoints required

### 1. Register device token

```http
POST /api/notifications/device-token
Authorization: Bearer <Firebase ID token>
Content-Type: application/json

{
  "token": "<FCM registration token>",
  "platform": "android" | "ios",
  "role": "student" | "tutor" | "parent"
}
```

**Behavior**

- Upsert by `(userId, token)` — same token on re-login should not create duplicates.
- Store: `userId`, `token`, `platform`, `role`, `updatedAt`.
- Return `{ success: true, data: { registered: true } }`.

### 2. Unregister device token

```http
DELETE /api/notifications/device-token
Authorization: Bearer <Firebase ID token>
Content-Type: application/json

{
  "token": "<FCM registration token>"
}
```

**Behavior**

- Delete that token for the authenticated user.
- Return `{ success: true, data: { unregistered: true } }`.

### 3. Optional inbox list

```http
GET /api/notifications?page=1&limit=30
Authorization: Bearer <Firebase ID token>
```

Used later for an in-app notification center (optional for push itself).

---

## Sending pushes (server)

Use Firebase Admin SDK with a **service account** from project `tutor-link-62ed9`.

Always send a **notification + data** payload so:

- Background / quit → system tray notification on the phone
- Foreground → app shows an alert and can deep-link

### Example payload

```js
await admin.messaging().send({
  token: deviceToken,
  notification: {
    title: 'New message',
    body: 'Ali sent you a message',
  },
  data: {
    type: 'chat', // chat | booking | session | request | verification | certificate | schedule
    chatId: '<conversationId>',
    peerName: 'Ali',
    bookingId: '', // optional
  },
  android: {
    priority: 'high',
    notification: {
      channelId: 'tutorlink_default',
      sound: 'default',
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
      },
    },
  },
});
```

### Suggested trigger points

| Event | Recipients | `data.type` |
|-------|------------|-------------|
| New chat message | Other participant | `chat` |
| Booking created / accepted / cancelled | Student + tutor | `booking` |
| Session reminder (e.g. 30 min before) | Both | `session` |
| Tutor verification approved / rejected | Tutor | `verification` |
| New hire / tutoring request | Tutor | `request` |
| Certificate issued | Student | `certificate` |

### Multi-device

A user may have several tokens. Send to **all** active tokens for that user; remove tokens that FCM reports as invalid / unregistered.

---

## Mobile wiring (already done)

- Package: `@react-native-firebase/messaging`
- Register: after `persistSession` + successful splash restore
- Unregister: logout / clear auth
- Android channel id: `tutorlink_default`
- Permission: `POST_NOTIFICATIONS` (Android 13+)

Until these backend routes exist, the app still obtains a local FCM token; registration API calls may 404 (logged softly).
