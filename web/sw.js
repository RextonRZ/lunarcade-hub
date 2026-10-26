// Offline cache for the website and home-screen app. Generated into web/sw.js by tools/import-html.mjs.
// CACHE (page, code) is renewed with every import; MEDIA (music, sounds, fonts) only when those files
// change, so returning players don't download 15 MB of music again for a code-only update.
const CACHE = 'lunarcade-2.9.7-826839228b';
const MEDIA = 'lunarcade-media-cce8d56fd6';
const SHELL = ["./","game","manifest.webmanifest","css/app.css","css/fonts.css","js/app.js","js/config.js","js/fit-small-screens.js","js/moon-audio.js","js/moon-music296.js","js/online-leaderboard.js"];
const AUDIO = ["assets/audio/boost.wav","assets/audio/click.wav","assets/audio/collect.wav","assets/audio/collision.wav","assets/audio/concept.wav","assets/audio/correct.wav","assets/audio/dialogue.wav","assets/audio/engine.wav","assets/audio/finish.wav","assets/audio/hover.wav","assets/audio/incorrect.wav","assets/audio/jump.wav","assets/audio/menu.wav","assets/audio/quiz.wav","assets/audio/racer.wav","assets/audio/transition.wav","assets/audio/victory.wav","assets/music/A.mp3","assets/music/B.mp3","assets/music/C.mp3"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then((c) => c.addAll(SHELL)),
      // Music and sounds are saved up front so the game is fully playable offline after one visit.
      caches.open(MEDIA).then((c) => Promise.allSettled(AUDIO.map((u) => c.match(u).then((hit) => hit || c.add(u))))),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lunarcade-') && k !== CACHE && k !== MEDIA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Leaderboard calls always go to the network.
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  if (/\/assets\/(audio|music)\//.test(url.pathname)) event.respondWith(media(event));
  else if (url.pathname.includes('/assets/fonts/')) event.respondWith(font(event.request));
  else event.respondWith(page(event.request));
});

// Page and code: network first so updates show immediately, but fall back to the saved copy when
// offline or when the connection is too slow to answer within 3 seconds.
async function page(request) {
  const cache = await caches.open(CACHE);
  const network = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });
  const slow = new Promise((resolve) => setTimeout(resolve, 3000));
  const first = await Promise.race([network.catch(() => null), slow]);
  if (first) return first;
  const cached = await cache.match(request, { ignoreSearch: true });
  return cached || network.catch(() => Response.error());
}

// Fonts: cache first; each file is only fetched the first time its characters are needed.
async function font(request) {
  const cache = await caches.open(MEDIA);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

// Music and sounds: browsers ask for byte ranges, so answer those from the saved file.
const saving = new Map();
async function media(event) {
  const cache = await caches.open(MEDIA);
  const key = event.request.url.split('?')[0];
  const cached = await cache.match(key);
  if (!cached) {
    // Not saved yet: play straight from the network and save a full copy in the background.
    if (!saving.has(key)) saving.set(key, cache.add(key).catch(() => {}).finally(() => saving.delete(key)));
    event.waitUntil(saving.get(key));
    return fetch(event.request);
  }
  const range = /^bytes=(\d*)-(\d*)$/.exec(event.request.headers.get('range') || '');
  if (!range || (!range[1] && !range[2])) return cached;
  const blob = await cached.blob();
  const size = blob.size;
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
