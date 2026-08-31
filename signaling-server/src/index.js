const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectMongo } = require('./db');
const { verifySocketAuth } = require('./auth');
const { registerClassroomHandlers } = require('./signaling');

const PORT = Number(process.env.PORT || 4001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

async function main() {
  await connectMongo();

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'tutorlink-signaling',
      time: new Date().toISOString(),
    });
  });

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const user = await verifySocketAuth(socket);
      socket.data.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', socket => {
    console.log('[signaling] connected', socket.id, socket.data.user?.userId);
    registerClassroomHandlers(io, socket);
  });

  server.listen(PORT, () => {
    console.log(`[signaling] TutorLink classroom signaling on :${PORT}`);
  });
}

main().catch(err => {
  console.error('[signaling] fatal', err);
  process.exit(1);
});
