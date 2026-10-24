// LunarCade server (Cloudflare Worker). Serves the game from web/ and a tiny leaderboard API:
//   GET  /api/leaderboard  top 50 per category
//   POST /api/score        submit a finished run; only a player's best result per category is kept
// Validation mirrors N295validRecord / N295compare in the game so the server never stores a run
// the game itself would reject.

const TOP_PER_CATEGORY = 50;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const cleanName = (v) => (typeof v === 'string' ? v.trim().normalize('NFKC') : '');
const validName = (name) => !!name && Array.from(name).length <= 20 && !/[\u0000-\u001f\u007f-\u009f]/.test(name);

function parseRun(r) {
  if (!r || typeof r !== 'object' || r.completed !== true) return null;
  const name = cleanName(r.name);
  if (!validName(name) || !Number.isSafeInteger(r.score) || r.score < 0 || r.score > 1e7) return null;
  const now = Date.now();
  const achievedAt = Number.isSafeInteger(r.achievedAt) && r.achievedAt > 0 && r.achievedAt <= now + 864e5 ? r.achievedAt : now;
  const run = { name, playerId: name.toLocaleLowerCase('en'), kind: r.kind, mode: r.mode, score: r.score, achievedAt };
  if (r.kind === 'quiz') {
    if (!['standard', 'extended'].includes(r.mode)) return null;
    const total = r.mode === 'standard' ? 8 : 18;
    if (r.total !== total || r.correct !== total || !Number.isInteger(r.attempts) || r.attempts < total || r.attempts > 1000) return null;
    return { ...run, category: 'quiz-' + r.mode, correct: total, total, attempts: r.attempts, accuracy: total / r.attempts };
  }
  if (r.kind === 'racer') {
    if (!['thrill', 'training'].includes(r.mode) || typeof r.slow !== 'boolean' || typeof r.auto !== 'boolean') return null;
    if (!Number.isFinite(r.timeMs) || r.timeMs <= 0 || r.timeMs > 864e5) return null;
    const category = ['racer', r.mode, r.slow ? 'slow' : 'normal', r.auto ? 'auto' : 'manual'].join('-');
    return { ...run, category, timeMs: r.timeMs, slow: r.slow, auto: r.auto };
  }
  return null;
}

async function submit(request, env) {
  let run;
  try {
    run = parseRun(await request.json());
  } catch {}
  if (!run) return json({ error: 'invalid run' }, 400);
  // Upsert, but only replace the stored row when the new run ranks higher (same order as N295compare).
  await env.DB.prepare(
    `INSERT INTO scores (category, player_id, name, kind, mode, score, achieved_at, correct, total, attempts, accuracy, time_ms, slow, auto, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
     ON CONFLICT (category, player_id) DO UPDATE SET
       name = excluded.name, score = excluded.score, achieved_at = excluded.achieved_at, correct = excluded.correct,
       total = excluded.total, attempts = excluded.attempts, accuracy = excluded.accuracy, time_ms = excluded.time_ms,
       updated_at = excluded.updated_at
     WHERE excluded.score > scores.score
        OR (excluded.score = scores.score AND (excluded.accuracy > scores.accuracy OR excluded.time_ms < scores.time_ms))`
  )
    .bind(
      run.category, run.playerId, run.name, run.kind, run.mode, run.score, run.achievedAt,
      run.correct ?? null, run.total ?? null, run.attempts ?? null, run.accuracy ?? null,
      run.timeMs ?? null, run.slow == null ? null : +run.slow, run.auto == null ? null : +run.auto, Date.now()
    )
    .run();
  return json({ ok: true });
}

async function leaderboard(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM (
       SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY score DESC, accuracy DESC, time_ms ASC, achieved_at ASC) AS place
       FROM scores
     ) WHERE place <= ?1`
  )
    .bind(TOP_PER_CATEGORY)
    .all();
  const records = results.map((row) => ({
    kind: row.kind, name: row.name, mode: row.mode, score: row.score, achievedAt: row.achieved_at, completed: true,
    ...(row.kind === 'quiz'
      ? { correct: row.correct, total: row.total, attempts: row.attempts }
      : { timeMs: row.time_ms, slow: !!row.slow, auto: !!row.auto }),
  }));
  return json({ records });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    try {
      if (pathname === '/api/leaderboard' && request.method === 'GET') return await leaderboard(env);
      if (pathname === '/api/score' && request.method === 'POST') return await submit(request, env);
      return json({ error: 'not found' }, 404);
    } catch (e) {
      console.error(e);
      return json({ error: 'server error' }, 500);
    }
  },
};
