// Online leaderboard: mirrors the game's local leaderboard to the LunarCade server (worker/index.js)
// so every player, on the website or the desktop app, sees the same rankings. Without a server or
// a network connection the game silently keeps using the local, this-device leaderboard.
(function () {
  const cfg = globalThis.LUNARCADE_CONFIG || {};
  const sameOrigin = /^https?:$/.test(location.protocol) ? location.origin : '';
  const api = (cfg.apiUrl || sameOrigin).replace(/\/+$/, '');

  // Leaderboard text while connected; offline, the game's own "this device only" wording returns.
  const ONLINE = {
    en: { local: 'Global Leaderboard — Live', notice: 'Shared by every LunarCade player on the web and desktop. Your best result per mission counts.' },
    bm: { local: 'Papan Juara Global — Langsung', notice: 'Dikongsi oleh semua pemain LunarCade di web dan desktop. Keputusan terbaik anda bagi setiap misi dikira.' },
    zh: { local: '全球排行榜 — 实时', notice: '网页版和桌面版的所有 LunarCade 玩家共享此排行榜，每项任务记录你的最佳成绩。' },
  };

  function attach(game) {
    if (!api) return;
    const { store, compare, valid, clean, labels } = game;
    const localList = store.list.bind(store);
    const localRecord = store.record.bind(store);
    let remote = new Map(); // category -> cleaned records from the server
    let online = false;
    let signature = '';

    const OFFLINE = {};
    for (const lang of Object.keys(ONLINE)) if (labels[lang]) OFFLINE[lang] = { local: labels[lang].local, notice: labels[lang].notice };
    const setLabels = () => {
      for (const lang of Object.keys(OFFLINE)) Object.assign(labels[lang], (online ? ONLINE : OFFLINE)[lang]);
    };

    function bestPerPlayer(items) {
      const best = new Map();
      for (const r of items) {
        const old = best.get(r.playerId);
        if (!old || compare(r, old) < 0) best.set(r.playerId, r);
      }
      return [...best.values()];
    }

    // The board, result screens and rank badges all read through list(), so merging here is enough.
    store.list = (category) => bestPerPlayer([...localList(category), ...(remote.get(category) || [])]).sort(compare).map((r) => ({ ...r }));

    store.record = (item) => {
      const result = localRecord(item);
      if (result?.best) submit(result.best);
      return result;
    };

    async function load() {
      try {
        const res = await fetch(api + '/api/leaderboard', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const next = new Map();
        for (const item of (await res.json()).records) {
          if (!valid(item)) continue;
          const r = clean(item);
          if (!next.has(r.category)) next.set(r.category, []);
          next.get(r.category).push(r);
        }
        remote = next;
        online = true;
        uploadLocalBests();
      } catch (e) {
        online = false;
      }
      setLabels();
      const sig = online + JSON.stringify([...remote].map(([c, list]) => [c, list.map((r) => r.playerId + ':' + r.score + ':' + (r.timeMs ?? r.accuracy))]));
      if (sig !== signature) {
        signature = sig;
        game.refresh();
      }
    }

    // Results earned offline (or before going online) are uploaded once they beat the server copy.
    const tried = new Set();
    const attemptId = (r) => r.category + '\u0000' + r.playerId + '\u0000' + r.achievedAt;
    function uploadLocalBests() {
      for (const r of store.records) {
        if (tried.has(attemptId(r))) continue;
        const theirs = (remote.get(r.category) || []).find((x) => x.playerId === r.playerId);
        if (theirs && compare(r, theirs) >= 0) continue;
        submit(r, false);
      }
    }

    async function submit(r, reload = true) {
      tried.add(attemptId(r));
      try {
        const { kind, name, mode, score, achievedAt, correct, total, attempts, timeMs, slow, auto } = r;
        const res = await fetch(api + '/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, name, mode, score, achievedAt, completed: true, correct, total, attempts, timeMs, slow, auto }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
      } catch (e) {
        // Still saved locally; the next app start retries it.
      }
      if (reload) load();
    }

    // Refresh every 10 s while the leaderboard is on screen so it updates live.
    let wasOpen = false;
    let last = 0;
    setInterval(() => {
      const open = !document.hidden && game.isBoardOpen();
      if (open && (!wasOpen || Date.now() - last >= 10000)) {
        last = Date.now();
        load();
      }
      wasOpen = open;
    }, 500);
    setLabels();
    load();
  }

  globalThis.LunarOnline = { attach };
})();
