const { assertCanJoinSession } = require('./sessionAccess');

const EVENTS = {
  JOIN_SESSION: 'join-session',
  LEAVE_SESSION: 'leave-session',
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  PEER_JOINED: 'peer-joined',
  PEER_LEFT: 'peer-left',
  CALL_ENDED: 'call-ended',
  TOGGLE_CAMERA: 'toggle-camera',
  TOGGLE_MIC: 'toggle-mic',
  SCREEN_SHARE_STARTED: 'screen-share-started',
  SCREEN_SHARE_STOPPED: 'screen-share-stopped',
  CONNECTION_QUALITY: 'connection-quality',
  SESSION_CHAT: 'session-chat',
  SESSION_ERROR: 'session-error',
  JOIN_ACK: 'join-ack',
};

/** sessionId -> Map<socketId, { userId, role, name }> */
const rooms = new Map();

function roomKey(sessionId) {
  return `classroom:${sessionId}`;
}

function getRoomMembers(sessionId) {
  if (!rooms.has(sessionId)) rooms.set(sessionId, new Map());
  return rooms.get(sessionId);
}

function registerClassroomHandlers(io, socket) {
  const authUser = socket.data.user || {};

  socket.on(EVENTS.JOIN_SESSION, async payload => {
    try {
      const sessionId = payload?.sessionId || payload?.bookingId;
      const userId = String(payload?.userId || authUser.userId || '');
      const role = payload?.role === 'tutor' ? 'tutor' : 'student';
      const name = payload?.name || role;

      const access = await assertCanJoinSession({ sessionId, userId, role });
      if (!access.ok) {
        socket.emit(EVENTS.SESSION_ERROR, {
          code: access.code,
          message: access.message,
        });
        return;
      }

      const key = roomKey(sessionId);
      await socket.join(key);

      const members = getRoomMembers(sessionId);
      members.set(socket.id, { userId, role, name });
      socket.data.sessionId = sessionId;
      socket.data.classroomUserId = userId;

      const peerCount = members.size;
      const hasTutor = [...members.values()].some(m => m.role === 'tutor');

      // 1:1 rule: tutor is the offerer once both peers are present.
      // If student joins second, nudge the tutor socket to create the offer.
      const shouldOffer = peerCount >= 2 && role === 'tutor';

      socket.emit(EVENTS.JOIN_ACK, {
        sessionId,
        peerCount,
        shouldCreateOffer: shouldOffer,
      });

      socket.to(key).emit(EVENTS.PEER_JOINED, {
        sessionId,
        userId,
        role,
        name,
        peerCount,
      });

      if (peerCount >= 2 && role === 'student' && hasTutor) {
        for (const [sid, member] of members.entries()) {
          if (member.role === 'tutor') {
            io.to(sid).emit(EVENTS.JOIN_ACK, {
              sessionId,
              peerCount,
              shouldCreateOffer: true,
            });
          }
        }
      }

      console.log(
        `[signaling] join ${sessionId} user=${userId} role=${role} peers=${peerCount}`
      );
    } catch (err) {
      socket.emit(EVENTS.SESSION_ERROR, {
        code: 'JOIN_FAILED',
        message: err.message || 'Failed to join session',
      });
    }
  });

  const leave = (payload = {}) => {
    const sessionId = payload.sessionId || socket.data.sessionId;
    if (!sessionId) return;
    const key = roomKey(sessionId);
    const members = getRoomMembers(sessionId);
    const member = members.get(socket.id);
    members.delete(socket.id);
    socket.leave(key);

    socket.to(key).emit(EVENTS.PEER_LEFT, {
      sessionId,
      userId: member?.userId || socket.data.classroomUserId,
    });

    if (members.size === 0) {
      rooms.delete(sessionId);
    }
  };

  socket.on(EVENTS.LEAVE_SESSION, leave);

  const relay = eventName => payload => {
    const sessionId = payload?.sessionId || socket.data.sessionId;
    if (!sessionId) return;
    socket.to(roomKey(sessionId)).emit(eventName, payload);
  };

  socket.on(EVENTS.OFFER, relay(EVENTS.OFFER));
  socket.on(EVENTS.ANSWER, relay(EVENTS.ANSWER));
  socket.on(EVENTS.ICE_CANDIDATE, relay(EVENTS.ICE_CANDIDATE));
  socket.on(EVENTS.TOGGLE_CAMERA, relay(EVENTS.TOGGLE_CAMERA));
  socket.on(EVENTS.TOGGLE_MIC, relay(EVENTS.TOGGLE_MIC));
  socket.on(EVENTS.SCREEN_SHARE_STARTED, relay(EVENTS.SCREEN_SHARE_STARTED));
  socket.on(EVENTS.SCREEN_SHARE_STOPPED, relay(EVENTS.SCREEN_SHARE_STOPPED));
  socket.on(EVENTS.CONNECTION_QUALITY, relay(EVENTS.CONNECTION_QUALITY));
  socket.on(EVENTS.SESSION_CHAT, relay(EVENTS.SESSION_CHAT));

  socket.on(EVENTS.CALL_ENDED, payload => {
    const sessionId = payload?.sessionId || socket.data.sessionId;
    if (!sessionId) return;
    const key = roomKey(sessionId);
    io.to(key).emit(EVENTS.CALL_ENDED, payload);
    // Clear room membership for this socket
    leave({ sessionId });
  });

  socket.on('disconnect', reason => {
    leave({});
    console.log('[signaling] disconnect', socket.id, reason);
  });
}

module.exports = { registerClassroomHandlers, EVENTS };
