import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : null;

async function ensureDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL DEFAULT '',
      part JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function normalizePart(part) {
  if (typeof part === 'string') {
    try {
      return JSON.parse(part);
    } catch {
      return part;
    }
  }
  return part ?? null;
}

function normalizeRow(row) {
  return {
    id: row.id,
    text: row.text || '',
    part: normalizePart(row.part),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

app.get('/api/entries', (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: 'DATABASE_URL not set' });
  pool
    .query('SELECT id, text, part, created_at FROM entries ORDER BY created_at ASC')
    .then(result => res.json(result.rows.map(normalizeRow)))
    .catch(err => {
      console.error(err);
      res.status(500).json({ ok: false });
    });
});

app.post('/api/entries', (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: 'DATABASE_URL not set' });
  const body = req.body || {};
  const id = body.id || Date.now().toString();
  const text = body.text || '';
  const part = body.part === undefined ? null : JSON.stringify(body.part);
  const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();

  pool
    .query(
      `INSERT INTO entries (id, text, part, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         text = EXCLUDED.text,
         part = EXCLUDED.part,
         created_at = EXCLUDED.created_at`,
      [id, text, part, createdAt]
    )
    .then(() => res.json({ ok: true, id }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ ok: false });
    });
});

app.patch('/api/entries/:id', (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: 'DATABASE_URL not set' });
  const id = req.params.id;
  const body = req.body || {};
  const text = Object.prototype.hasOwnProperty.call(body, 'text') ? body.text : null;
  const part = Object.prototype.hasOwnProperty.call(body, 'part') ? JSON.stringify(body.part) : null;

  pool
    .query(
      `UPDATE entries
       SET text = COALESCE($2, text),
           part = COALESCE($3::jsonb, part)
       WHERE id = $1`,
      [id, text, part]
    )
    .then(async result => {
      if (result.rowCount === 0) {
        const createdAt = new Date();
        await pool.query(
          `INSERT INTO entries (id, text, part, created_at)
           VALUES ($1, $2, $3, $4)`,
          [id, text ?? '', part, createdAt]
        );
      }
      res.json({ ok: true, id });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ ok: false });
    });
});

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
ensureDb()
  .then(() => {
    app.listen(port, () => {
      console.log('Urban Legend API listening on', port);
    });
  })
  .catch(err => {
    console.error('Failed to init database', err);
    process.exit(1);
  });
