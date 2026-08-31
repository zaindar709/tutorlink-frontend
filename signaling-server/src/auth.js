/**
 * Firebase Auth verification for Socket.io.
 * Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.
 * In local/dev without Firebase, ALLOW_DEV_AUTH=true accepts JWT-like tokens.
 */

let admin = null;

function initFirebase() {
  if (admin) return admin;
  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');
    if (admin.apps.length) return admin;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(cred),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      admin = null;
    }
  } catch (err) {
    console.warn('[signaling] firebase-admin unavailable', err.message);
    admin = null;
  }
  return admin;
}

async function verifySocketAuth(socket) {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
    socket.handshake.query?.token;

  if (!token || typeof token !== 'string') {
    const err = new Error('Authentication required');
    err.data = { code: 'AUTH_REQUIRED' };
    throw err;
  }

  const fb = initFirebase();
  if (fb) {
    const decoded = await fb.auth().verifyIdToken(token);
    return {
      userId: decoded.uid,
      email: decoded.email || '',
      firebaseUid: decoded.uid,
    };
  }

  if (process.env.ALLOW_DEV_AUTH === 'true') {
    // Dev fallback: treat token as opaque user id / bearer
    return {
      userId: token.slice(0, 64),
      email: '',
      firebaseUid: token.slice(0, 64),
      dev: true,
    };
  }

  const err = new Error('Firebase auth not configured on signaling server');
  err.data = { code: 'AUTH_MISCONFIGURED' };
  throw err;
}

module.exports = { verifySocketAuth };
