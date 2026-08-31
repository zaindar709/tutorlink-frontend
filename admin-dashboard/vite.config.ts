import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ratingsFile = path.resolve(__dirname, 'public/live-ratings.json');

function ensureRatingsFile() {
  if (!fs.existsSync(ratingsFile)) {
    fs.writeFileSync(ratingsFile, '[]\n', 'utf8');
  }
}

function readRatings(): unknown[] {
  ensureRatingsFile();
  try {
    const raw = fs.readFileSync(ratingsFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRatings(list: unknown[]) {
  ensureRatingsFile();
  fs.writeFileSync(ratingsFile, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
}

/** Student app POSTs ratings here; admin UI GETs them for Tutor Ratings page. */
function liveRatingsApiPlugin(): Plugin {
  return {
    name: 'live-ratings-api',
    configureServer(server) {
      ensureRatingsFile();
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        if (url !== '/api/live-ratings') {
          next();
          return;
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const list = readRatings();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(list));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const entry = JSON.parse(body || '{}') as {
                bookingId?: string;
                id?: string;
              };
              if (!entry || typeof entry !== 'object') {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
                return;
              }
              const list = readRatings() as Array<{ bookingId?: string; id?: string }>;
              const next = [
                entry,
                ...list.filter(
                  e =>
                    e.bookingId !== entry.bookingId &&
                    e.id !== entry.id
                ),
              ];
              writeRatings(next);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, count: next.length }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), liveRatingsApiPlugin()],
  server: {
    host: true, // 0.0.0.0 — reachable from Android emulator (10.0.2.2) / LAN devices
    port: 5174,
    strictPort: true,
    open: true,
  },
});
