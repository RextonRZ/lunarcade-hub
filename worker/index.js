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

// Reviews on the download page. Children may read them, so text is short, link-free and filtered,
// each visitor may post three a day, and the owner can hide one (see worker/schema.sql).
const REVIEW_ROLES = ['parent', 'teacher', 'pupil', 'other'];
const REVIEWS_SHOWN = 60;
const REVIEWS_PER_DAY = 3;
const BLOCKED_WORDS = /\b(fuck\w*|shit\w*|bitch\w*|cunt|dick|pussy|bastard|asshole|slut|whore|nigg\w*|babi|bodoh|sial|celaka|pukimak|puki|lancau|pantat|kimak|haram\s?jadah|bangsat|anjing|keparat)\b/i;
const LINKS = /(https?:\/\/|www\.|\b[\w-]+\.(com|net|org|my|io|xyz|ru|cn)\b)/i;

async function visitorId(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('lunarcade-reviews:' + ip));
  return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function listReviews(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, name, role, hearts, body, loves, created_at FROM reviews WHERE hidden = 0 ORDER BY created_at DESC LIMIT ?1`
  ).bind(REVIEWS_SHOWN).all();
  const totals = await env.DB.prepare(`SELECT COUNT(*) AS count, AVG(hearts) AS average FROM reviews WHERE hidden = 0`).first();
  return json({
    count: totals.count,
    average: totals.count ? Math.round(totals.average * 10) / 10 : null,
    reviews: results.map((r) => ({ id: r.id, name: r.name, role: r.role, hearts: r.hearts, body: r.body, loves: r.loves, createdAt: r.created_at })),
  });
}

async function postReview(request, env) {
  let input;
  try {
    input = await request.json();
  } catch {}
  const name = cleanName(input?.name);
  const body = typeof input?.body === 'string' ? input.body.normalize('NFKC').replace(/\s+/g, ' ').trim() : '';
  const role = REVIEW_ROLES.includes(input?.role) ? input.role : null;
  const hearts = Number.isInteger(input?.hearts) && input.hearts >= 1 && input.hearts <= 5 ? input.hearts : null;
  if (!validName(name)) return json({ error: 'name', message: 'Please use a nickname of up to 20 characters.' }, 400);
  if (!role || !hearts) return json({ error: 'fields', message: 'Please choose who you are and how many hearts.' }, 400);
  if (Array.from(body).length < 10 || Array.from(body).length > 300) {
    return json({ error: 'length', message: 'Reviews need 10 to 300 characters.' }, 400);
  }
  if (LINKS.test(body) || LINKS.test(name)) return json({ error: 'links', message: 'Links are not allowed in reviews.' }, 400);
  if (BLOCKED_WORDS.test(body) || BLOCKED_WORDS.test(name)) {
    return json({ error: 'words', message: 'Please keep it friendly. Pupils read these reviews too.' }, 400);
  }
  const visitor = await visitorId(request);
  const now = Date.now();
  const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM reviews WHERE visitor = ?1 AND created_at > ?2`)
    .bind(visitor, now - 864e5).first();
  if (recent.n >= REVIEWS_PER_DAY) return json({ error: 'limit', message: 'Thanks! You can post again tomorrow.' }, 429);
  const row = await env.DB.prepare(
    `INSERT INTO reviews (name, role, hearts, body, visitor, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id`
  ).bind(name, role, hearts, body, visitor, now).first();
  return json({ review: { id: row.id, name, role, hearts, body, loves: 0, createdAt: now } }, 201);
}

async function loveReview(id, request, env) {
  const visitor = await visitorId(request);
  const added = await env.DB.prepare(
    `INSERT OR IGNORE INTO review_loves (review_id, visitor) SELECT id, ?2 FROM reviews WHERE id = ?1 AND hidden = 0`
  ).bind(id, visitor).run();
  if (added.meta.changes) await env.DB.prepare(`UPDATE reviews SET loves = loves + 1 WHERE id = ?1`).bind(id).run();
  const row = await env.DB.prepare(`SELECT loves FROM reviews WHERE id = ?1 AND hidden = 0`).bind(id).first();
  if (!row) return json({ error: 'not found' }, 404);
  return json({ loves: row.loves, loved: true });
}

// Installers are too big for Cloudflare's 25 MB asset limit, so they live on GitHub Releases.
// /download/<platform> always points at the newest one, and /api/release tells the download page
// which version and sizes to show. GitHub's API refuses Cloudflare's shared addresses, so this reads
// its plain web addresses instead: /releases/latest redirects to the newest tag, and each installer's
// download address reports its size. Files follow electron-builder's names (LunarCade-2.9.7-windows.exe).
// Answers are cached for 10 minutes, and the last good one is kept in D1 for when GitHub is unreachable.
const RELEASES = 'https://github.com/RextonRZ/lunarcade-hub/releases';
const PLATFORM_FILES = { windows: 'windows.exe', android: 'android.apk', mac: 'mac.dmg' };

async function fetchRelease() {
  const headers = { 'User-Agent': 'lunarcade-worker' };
  const latest = await fetch(RELEASES + '/latest', { redirect: 'manual', headers });
  const tag = (latest.headers.get('Location') || '').match(/\/tag\/([^/?#]+)/)?.[1];
  if (!tag) throw new Error('GitHub gave no latest tag (' + latest.status + ')');
  const version = decodeURIComponent(tag).replace(/^v/, '');
  const files = {};
  await Promise.all(Object.entries(PLATFORM_FILES).map(async ([platform, suffix]) => {
    const name = `LunarCade-${version}-${suffix}`;
    const url = `${RELEASES}/download/${tag}/${name}`;
    const res = await fetch(url, { method: 'HEAD', headers });
    if (res.ok) files[platform] = { name, size: Number(res.headers.get('Content-Length')) || null, url };
  }));
  return { version, files };
}

async function latestRelease(env, ctx) {
  const cache = caches.default;
  const key = new Request('https://lunarcade.internal/latest-release');
  const cached = await cache.match(key);
  if (cached) return cached.json();
  const remember = (info, seconds) =>
    ctx.waitUntil(cache.put(key, new Response(JSON.stringify(info), { headers: { 'Cache-Control': 'max-age=' + seconds } })));
  try {
    const info = await fetchRelease();
    remember(info, 600);
    ctx.waitUntil(
      env.DB.prepare(`INSERT INTO kv (key, value, updated_at) VALUES ('latest-release', ?1, ?2)
        ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`)
        .bind(JSON.stringify(info), Date.now()).run()
    );
    return info;
  } catch (e) {
    const saved = await env.DB.prepare(`SELECT value FROM kv WHERE key = 'latest-release'`).first();
    if (!saved) throw e;
    console.warn('Using the saved release: ' + e.message);
    const info = JSON.parse(saved.value);
    remember(info, 120);
    return info;
  }
}

async function download(platform, env, ctx) {
  let target = RELEASES + '/latest';
  try {
    target = (await latestRelease(env, ctx)).files[platform]?.url || target;
  } catch (e) {
    console.error(e);
  }
  return Response.redirect(target, 302);
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const platform = pathname.match(/^\/download\/(windows|android|mac)\/?$/)?.[1];
    if (platform) return download(platform, env, ctx);
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    try {
      if (pathname === '/api/release' && request.method === 'GET') return json(await latestRelease(env, ctx));
      if (pathname === '/api/reviews' && request.method === 'GET') return await listReviews(env);
      if (pathname === '/api/reviews' && request.method === 'POST') return await postReview(request, env);
      const loveId = pathname.match(/^\/api\/reviews\/(\d+)\/love$/)?.[1];
      if (loveId && request.method === 'POST') return await loveReview(Number(loveId), request, env);
      if (pathname === '/api/leaderboard' && request.method === 'GET') return await leaderboard(env);
      if (pathname === '/api/score' && request.method === 'POST') return await submit(request, env);
      return json({ error: 'not found' }, 404);
    } catch (e) {
      console.error(e);
      return json({ error: 'server error' }, 500);
    }
  },
};
