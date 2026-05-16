const {
  SUPABASE_URL,
  SUPABASE_KEY,
  SUPABASE_TABLE = 'entries',
  KEEPALIVE_ID = '__keepalive__',
  KEEPALIVE_TEXT = '__DELETED__'
} = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY are required');
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=representation'
};

const heartbeat = {
  id: KEEPALIVE_ID,
  text: KEEPALIVE_TEXT,
  part: {
    system: 'github-actions-keepalive',
    heartbeatAt: new Date().toISOString()
  },
  created_at: new Date().toISOString()
};

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function request(method, path, body) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function upsertHeartbeat() {
  return request('POST', `/rest/v1/${SUPABASE_TABLE}`, heartbeat);
}

async function verifyHeartbeat() {
  const encodedId = encodeURIComponent(KEEPALIVE_ID);
  const rows = await request(
    'GET',
    `/rest/v1/${SUPABASE_TABLE}?select=id,text,part,created_at&id=eq.${encodedId}&limit=1`
  );

  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error('Heartbeat verification failed: row not found');
  }

  const [row] = rows;
  if (row.id !== KEEPALIVE_ID || row.text !== KEEPALIVE_TEXT) {
    throw new Error('Heartbeat verification failed: unexpected row contents');
  }

  return row;
}

async function main() {
  const attempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const upserted = await upsertHeartbeat();
      const verified = await verifyHeartbeat();
      console.log(
        JSON.stringify(
          {
            ok: true,
            attempt,
            upserted,
            verified
          },
          null,
          2
        )
      );
      return;
    } catch (error) {
      lastError = error;
      console.error(`Keepalive attempt ${attempt} failed: ${error.message}`);
      if (attempt < attempts) {
        await sleep(attempt * 5000);
      }
    }
  }

  throw lastError;
}

await main();
