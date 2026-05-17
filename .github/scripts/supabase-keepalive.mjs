const {
  SUPABASE_URL,
  SUPABASE_KEY,
  SUPABASE_TABLE = 'entries'
} = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY are required');
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: 'application/json'
};

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function pingSupabase() {
  // Pure SELECT — does not require UPDATE/INSERT permission on RLS.
  // Any successful query against PostgREST counts as DB activity for free-tier inactivity timer.
  const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id&limit=1`;
  const response = await fetch(url, { method: 'GET', headers });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function main() {
  const attempts = 5;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const rows = await pingSupabase();
      console.log(
        JSON.stringify(
          {
            ok: true,
            attempt,
            rowsReturned: Array.isArray(rows) ? rows.length : 0,
            at: new Date().toISOString()
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
