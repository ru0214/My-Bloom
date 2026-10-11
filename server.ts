import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Setup data directory for persistent cross-device storage
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'cloud_sync_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let syncStore: Record<string, { data: any; updatedAt: number }> = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    syncStore = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sync store from disk', err);
  }
}

function saveStoreToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(syncStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save sync store to disk', err);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Create a short 6-digit sync code (e.g. MJ-9241)
app.post('/api/sync/generate-code', (req, res) => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomCode = 'MJ-';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  res.json({ code: randomCode });
});

// Get cloud data by key / code
app.get('/api/sync/:key', (req, res) => {
  const key = req.params.key.trim().toLowerCase();
  const entry = syncStore[key];
  if (!entry) {
    return res.status(404).json({ error: 'No data found for this sync key' });
  }
  res.json({ data: entry.data, updatedAt: entry.updatedAt });
});

// Save cloud data by key / code
app.post('/api/sync/:key', (req, res) => {
  const key = req.params.key.trim().toLowerCase();
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Missing data payload' });
  }
  const now = Date.now();
  syncStore[key] = {
    data,
    updatedAt: now,
  };
  saveStoreToDisk();
  res.json({ success: true, updatedAt: now });
});

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
