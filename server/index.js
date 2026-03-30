import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const DATA_PATH = process.env.DATA_PATH || path.join(process.cwd(), 'data', 'entries.json');
const DATA_DIR = path.dirname(DATA_PATH);

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]');
}

function readEntries() {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeEntries(list) {
  ensureStore();
  fs.writeFileSync(DATA_PATH, JSON.stringify(list));
}

app.get('/api/entries', (req, res) => {
  const list = readEntries();
  res.json(list);
});

app.post('/api/entries', (req, res) => {
  const body = req.body || {};
  const entry = {
    id: body.id || Date.now().toString(),
    text: body.text || '',
    part: body.part || null,
    createdAt: body.createdAt || new Date().toISOString()
  };
  const list = readEntries();
  list.push(entry);
  writeEntries(list);
  res.json({ ok: true, id: entry.id });
});

app.patch('/api/entries/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body || {};
  const list = readEntries();
  const idx = list.findIndex(e => e.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...body, id };
  } else {
    list.push({ id, text: body.text || '', part: body.part || null, createdAt: new Date().toISOString() });
  }
  writeEntries(list);
  res.json({ ok: true, id });
});

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Urban Legend API listening on', port);
});
