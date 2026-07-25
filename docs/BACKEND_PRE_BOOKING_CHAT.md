# Backend change: pre-booking chat (no bookingId)

Mobile app **Ask** on Messages creates:

```http
POST /api/chat/conversations
Authorization: Bearer <Firebase ID token>
Content-Type: application/json

{
  "participantId": "<tutorUserId>",
  "subject": "Mathematics"
}
```

## Current problem

Live API returns **400** when `bookingId` is missing. Students cannot message tutors before hiring.

## Required behavior

Accept **either**:

| Field | Required | Notes |
|-------|----------|--------|
| `bookingId` | one of | Existing booking chat |
| `participantId` | one of | Other user's Mongo `_id` (User collection) |
| `tutorId` | optional alias | Same as `participantId` when caller is student |
| `subject` | optional | e.g. first subject |

### Rules

1. Caller must be `student`, other must be `tutor` (or reverse).
2. If a conversation already exists between the two users → return it (`200`).
3. Else create with `booking: null` → return (`201`).
4. Do **not** require a booking for inquiry / pre-hire chat.

### Example handler sketch

```js
const { bookingId, participantId, tutorId, subject } = req.body;
const otherId = participantId || tutorId;

if (!bookingId && !otherId) {
  return res.status(400).json({
    success: false,
    message: 'bookingId or participantId is required',
  });
}

if (bookingId) {
  // existing booking-based create...
}

const other = await User.findById(otherId);
if (!other) {
  return res.status(404).json({ success: false, message: 'User not found' });
}

// validate student <-> tutor roles...

let conversation = await Conversation.findOne({
  participants: { $all: [req.user._id, other._id] },
});

if (!conversation) {
  conversation = await Conversation.create({
    participants: [req.user._id, other._id],
    student: req.user.role === 'student' ? req.user._id : other._id,
    tutor: req.user.role === 'tutor' ? req.user._id : other._id,
    booking: null,
    subject: subject || 'General',
  });
}

return res.status(conversation.wasNew ? 201 : 200).json({
  success: true,
  data: conversationDTO(conversation),
});
```

Until this is deployed, the app opens a **local pre-booking chat** so the UI can still be tested (messages stay on device; tutor will not receive them).
