# Backend: Firebase Cloud Messaging (push notifications)

Mobile app registers an FCM device token after login / session restore and clears it on logout.

Foreground display uses **Notifee** (`@notifee/react-native`) so notifications appear as **native system notifications** even when the app is open. Background / terminated delivery uses FCM `notification` + `data` (OS tray) or Notifee for data-only messages.

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

### 2. Unregister device token

```http
DELETE /api/notifications/device-token
Authorization: Bearer <Firebase ID token>
Content-Type: application/json

{
  "token": "<FCM registration token>"
}
```

### 3. Optional server inbox

```http
GET /api/notifications?page=1&limit=30
```

Optional — the app also keeps a local Notification Center of received pushes.

---

## Sending pushes (required shape)

Always send **notification + data** (all `data` values must be strings):

```js
await admin.messaging().send({
  token: deviceToken,
  notification: {
    title: 'New message',
    body: 'Ali sent you a message',
  },
  data: {
    notificationId: '<unique-id>',       // dedupe in Notification Center
    type: 'chat',                        // chat | booking | session | schedule | payment | reminder | verification | request | certificate
    createdAt: new Date().toISOString(),
    relatedId: '<bookingId-or-similar>', // optional
    chatId: '<conversationId>',          // chat
    bookingId: '',
    paymentId: '',
    screen: '',                          // optional deep link override
    peerName: 'Ali',
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

| Event | `data.type` | Suggested navigation |
|-------|-------------|----------------------|
| Chat message | `chat` / `message` | Messages / ChatScreen |
| Booking create/confirm/cancel | `booking` | Bookings |
| Session reminder | `session` / `reminder` | Bookings |
| Time slot update | `schedule` | Schedule (tutor) |
| Payment / wallet | `payment` | WalletScreen |
| Tutor verification | `verification` | Request |
| Hire request | `request` | Request |
| Certificate | `certificate` | StudentCertificatesScreen |

---

## Mobile wiring

- `@react-native-firebase/messaging` + `@notifee/react-native`
- Channel id: `tutorlink_default`
- Background handler registered in `index.js`
- Notification Center: `StudentNotificationInboxScreen` (HomeNavigator)
- Deep link on tap: foreground / background / terminated

**Rebuild required after installing Notifee:** `npx react-native run-android`
