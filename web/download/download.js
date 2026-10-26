// Download page behaviour: the Moon runs through the month (on its own at the top, with the scroll
// after that), screenshots sit in carousels with a full-size viewer, the downloads show the latest
// release, and reviews load, post and collect loves.
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const L = window.LC_I18N;
  const t = L.t;
  L.apply();
  const chapters = $$('.chapter');
  const days = chapters.map((c) => Number(c.dataset.day));

  // ---- The month.
  // At the top of the page the Moon plays the month like a time-lapse, about 24 seconds a cycle.
  // Once the visitor scrolls, the scroll takes over and each chapter is one phase. A spring eases
  // between the two, always the short way round the cycle, so it never spins back through every phase.
  const CYCLE = 29.53;
  const TIMELAPSE = CYCLE / 24; // days per second
  const wrap = (d) => ((((d - 1) % CYCLE) + CYCLE) % CYCLE) + 1;
  const towards = (from, to) => { const x = to - from; return x - CYCLE * Math.round(x / CYCLE); };
  const moon = window.LunarMoon.create($('#moon'), 'img/moon-lroc-2k.webp');
  const dayEl = $('#day-number'), litEl = $('#day-lit'), phaseEl = $('#phase-name'), factEl = $('#phase-fact');
  const track = $('.phases');
  const trackButtons = chapters.map((chapter, i) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    const label = () => {
      button.dataset.label = L.phase(i);
      button.setAttribute('aria-label', L.phase(i) + ', ' + t('day', { n: Math.floor(days[i]) }));
    };
    label();
    document.addEventListener('lc:lang', label);
    const icon = document.createElement('canvas');
    icon.width = icon.height = 36;
    window.LunarMoon.drawPhase(icon.getContext('2d'), 36, days[i], '#e9e6df', '#2a2d4a');
    button.append(icon);
    // A dot shows its phase on the Moon right here; the page itself does not move.
    button.addEventListener('click', () => {
      preview = days[i];
      previewAt = scrollY;
      previewUntil = performance.now() + 8000;
      timelapse = false;
    });
    li.append(button);
    track.append(li);
    return button;
  });
  // Tooltips: the first one waits, then neighbours open instantly while the pointer stays on the row.
  let warmTimer = 0;
  track.addEventListener('pointerover', () => { clearTimeout(warmTimer); warmTimer = setTimeout(() => track.classList.add('warm'), 300); });
  track.addEventListener('pointerleave', () => { clearTimeout(warmTimer); warmTimer = setTimeout(() => track.classList.remove('warm'), 400); });

  let target = 1, shown = 1, current = -1, last = performance.now(), timelapse = true;
  // A phase picked from the dots holds until the visitor scrolls on.
  // At the top of the page the time-lapse picks up again 8 seconds later.
  let preview = null, previewAt = 0, previewUntil = 0;
  // The Windows card is lit by the Moon: its glow follows how much of the disc is lit.
  const getMain = $('.get-main');
  let getLit = -1;
  function measure() {
    if (preview !== null && Math.abs(scrollY - previewAt) > 60) preview = null;
    timelapse = preview === null && scrollY < Math.min(innerHeight * 0.15, 140);
    // Each chapter owns the scroll span from where its top reaches the reading line to where the next
    // one does, holding its own phase for the first part (Full Moon longest, for the downloads).
    const line = innerHeight * 0.45;
    const tops = chapters.map((c) => c.getBoundingClientRect().top);
    const starts = tops.map((t, j) => (j === 0 ? 0 : Math.max(0, t + scrollY - line)));
    let i = 0;
    while (i < starts.length - 1 && starts[i + 1] <= scrollY) i++;
    if (i < starts.length - 1) {
      const hold = chapters[i].id === 'full-moon' ? 0.6 : 0.35;
      const frac = (scrollY - starts[i]) / Math.max(1, starts[i + 1] - starts[i]);
      target = days[i] + Math.max(0, (frac - hold) / (1 - hold)) * (days[i + 1] - days[i]);
    } else {
      // After the last chapter the Moon fades towards the next new Moon.
      const end = document.documentElement.scrollHeight - scrollY - innerHeight;
      const span = Math.max(1, chapters[i].offsetHeight - innerHeight * 0.3);
      target = days[i] + Math.min(1, Math.max(0, 1 - end / span)) * (29.2 - days[i]);
    }
  }
  function setChapter(i) {
    const first = current === -1;
    current = i;
    trackButtons.forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
    const show = () => {
      phaseEl.textContent = L.phase(i);
      factEl.textContent = L.fact(i);
    };
    if (first || reduceMotion.matches) return show();
    // The name and its sentence blur out, change and come back together, so they never disagree.
    phaseEl.classList.add('swap');
    factEl.classList.add('swap');
    setTimeout(() => {
      if (current !== i) return;
      show();
      phaseEl.classList.remove('swap');
      factEl.classList.remove('swap');
    }, 180);
  }
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (preview !== null && now > previewUntil && scrollY < Math.min(innerHeight * 0.15, 140)) { preview = null; measure(); }
    const goal = preview !== null ? preview : target;
    if (reduceMotion.matches) shown = preview !== null ? preview : timelapse ? 1 : target;
    else if (timelapse) shown = wrap(shown + dt * TIMELAPSE);
    else {
      const gap = towards(shown, goal);
      shown = Math.abs(gap) < 0.002 ? goal : wrap(shown + gap * (1 - Math.exp(-dt * 5)));
    }
    moon.setDay(shown);
    moon.render(now, reduceMotion.matches);
    moveNova(now, dt);
    const a = window.LunarMoon.phaseAngle(shown);
    // The phase name follows the Moon on screen, not the chapter, so the two never disagree.
    const nearest = days.reduce((best, d, j) => (Math.abs(towards(shown, d)) < Math.abs(towards(shown, days[best])) ? j : best), 0);
    if (nearest !== current) setChapter(nearest);
    const lit = 0.5 - 0.5 * Math.cos(a);
    if (getMain && Math.abs(lit - getLit) > 0.01) { getLit = lit; getMain.style.setProperty('--lit', (lit * lit).toFixed(3)); }
    dayEl.textContent = t('day', { n: Math.min(30, Math.max(1, Math.round(shown))) });
    litEl.textContent = t('lit', { p: Math.round(lit * 100) });
    requestAnimationFrame(frame);
  }
  // ---- Nova orbits the Moon on a tilted ellipse, passing behind it (smaller, dimmed) and back in
  // front, and every few seconds does a trick: a somersault, a hop, a turn, a dash or a wiggle.
  // Scrolling makes Nova zoom faster. With reduced motion Nova stays put.
  const nova = $('.nova');
  const frameEl = $('.moon-frame');
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const TRICKS = {
    flip: { dur: 1100, apply: (k, p) => { p.rot += 360 * easeInOut(k); } },
    hop: { dur: 800, apply: (k, p) => { p.y -= p.F * 0.16 * Math.sin(Math.PI * k); p.sy *= 1 + 0.08 * Math.sin(Math.PI * k); } },
    turn: { dur: 1000, apply: (k, p) => { p.sx *= Math.cos(2 * Math.PI * easeInOut(k)); } },
    dash: { dur: 1400, apply: (k, p) => { p.boost += 5 * Math.sin(Math.PI * k); p.rot += 14 * Math.sin(Math.PI * k); } },
    wiggle: { dur: 900, apply: (k, p) => { p.rot += 14 * Math.sin(6 * Math.PI * k) * (1 - k); } },
  };
  const trickNames = Object.keys(TRICKS);
  let orbit = 0.9, trick = null, nextTrick = performance.now() + 2500, lastY = scrollY, scrollBoost = 0, lastTrick = '';
  function moveNova(now, dt) {
    if (!nova || reduceMotion.matches || !nova.offsetParent) return;
    const F = frameEl.clientWidth;
    // Scroll speed adds to the orbit speed and fades out smoothly.
    const v = Math.abs(scrollY - lastY) / Math.max(dt, 0.016);
    lastY = scrollY;
    scrollBoost += (Math.min(v * 0.004, 4) - scrollBoost) * (1 - Math.exp(-dt * 3));
    const p = { F, x: 0, y: 0, rot: 0, sx: 1, sy: 1, boost: 0 };
    if (!trick && now > nextTrick) {
      let name;
      do name = trickNames[Math.floor(Math.random() * trickNames.length)]; while (name === lastTrick);
      trick = { name, start: now };
      lastTrick = name;
    }
    if (trick) {
      const k = Math.min(1, (now - trick.start) / TRICKS[trick.name].dur);
      TRICKS[trick.name].apply(k, p);
      if (k >= 1) { trick = null; nextTrick = now + 2600 + Math.random() * 2600; }
    }
    orbit += dt * (2 * Math.PI / 15) * (1 + scrollBoost + p.boost);
    const tilt = -10 * Math.PI / 180;
    const X = 0.56 * F * Math.cos(orbit), Y = 0.15 * F * Math.sin(orbit);
    const depth = Math.sin(orbit); // > 0 in front of the Moon
    const x = X * Math.cos(tilt) - Y * Math.sin(tilt) + p.x;
    const y = X * Math.sin(tilt) + Y * Math.cos(tilt) + p.y;
    const s = 0.8 + 0.2 * depth;
    const lean = 10 * Math.cos(orbit) + p.rot;
    nova.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${lean.toFixed(1)}deg) scale(${(s * p.sx).toFixed(3)}, ${(s * p.sy).toFixed(3)})`;
    nova.classList.toggle('behind', depth < -0.05);
  }

  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', measure);
  measure();
  requestAnimationFrame(frame);

  // ---- Entrances: the headline arrives word by word, the rest of the hero follows, and later
  // copy rises once as it scrolls into view.
  let w = 0;
  const splitWords = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const parts = L.lang === 'zh' ? [...child.textContent] : child.textContent.split(/(\s+)/);
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const span = document.createElement('span');
          span.className = 'w';
          span.style.setProperty('--w', w++);
          span.textContent = part;
          frag.append(span);
        }
        child.replaceWith(frag);
      } else splitWords(child);
    }
  };
  splitWords($('h1'));
  document.addEventListener('lc:lang', () => {
    w = 0;
    $('h1').innerHTML = `<span data-i18n="h1a"></span> <span class="lit" data-i18n="h1b"></span>`;
    L.apply($('h1'));
    splitWords($('h1'));
  });
  $$('.chapter-hero > *').forEach((el, i) => el.style.setProperty('--i', i));
  const reveal = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const chapter of chapters.slice(1)) {
    [...chapter.children].forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--i', Math.min(i, 4));
      reveal.observe(el);
    });
  }


  // ---- Starfield behind the page: small twinkling stars in the game's colours that drift slightly
  // with the scroll, and now and then a shooting star. Sparse enough to never compete with the text.
  (function starfield() {
    const canvas = $('#stars');
    const ctx = canvas.getContext('2d');
    const tints = ['255,255,255', '255,255,255', '143,227,255', '255,211,107', '200,180,255', '255,170,210'];
    let stars = [], w = 0, h = 0, dpr = 1, shooting = null, nextShot = performance.now() + 4000;
    function seed() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const count = Math.round(Math.min(280, (w * h) / 5000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h * 1.6, r: Math.random() < 0.16 ? 1.4 + Math.random() * 1 : 0.4 + Math.random() * 0.8,
        depth: 0.04 + Math.random() * 0.14, phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 1.6,
        tint: tints[Math.floor(Math.random() * tints.length)], base: 0.35 + Math.random() * 0.5,
      }));
    }
    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const still = reduceMotion.matches;
      const t = still ? 0 : now / 1000;
      for (const s of stars) {
        const y = ((s.y - scrollY * s.depth) % (h * 1.6) + h * 1.6) % (h * 1.6);
        if (y > h + 4) continue;
        const a = s.base * (still ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
        ctx.fillStyle = 'rgba(' + s.tint + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.r > 1.3) { // a soft cross glint on the brightest stars
          // Sparkle: the glint flares as the star brightens.
          const flare = Math.pow(Math.max(0, a / s.base), 3);
          ctx.fillStyle = 'rgba(' + s.tint + ',' + (a * 0.32 * flare).toFixed(3) + ')';
          ctx.fillRect(s.x - s.r * 4, y - 0.45, s.r * 8, 0.9);
          ctx.fillRect(s.x - 0.45, y - s.r * 4, 0.9, s.r * 8);
        }
      }
      if (!still) {
        if (!shooting && now > nextShot && !document.hidden) {
          shooting = { x: w * (0.35 + Math.random() * 0.6), y: h * (0.05 + Math.random() * 0.3), start: now, len: 120 + Math.random() * 80 };
        }
        if (shooting) {
          const k = (now - shooting.start) / 900;
          if (k >= 1) { shooting = null; nextShot = now + 7000 + Math.random() * 6000; }
          else {
            const e = 1 - Math.pow(1 - k, 3), x = shooting.x - e * 260, y = shooting.y + e * 130;
            const g = ctx.createLinearGradient(x, y, x + shooting.len, y - shooting.len / 2);
            g.addColorStop(0, 'rgba(255,255,255,' + (0.8 * (1 - k)).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + shooting.len, y - shooting.len / 2); ctx.stroke();
          }
        }
      }
      if (!still) requestAnimationFrame(draw);
    }
    seed();
    addEventListener('resize', () => { seed(); if (reduceMotion.matches) draw(0); });
    if (reduceMotion.matches) { draw(0); addEventListener('scroll', () => draw(0), { passive: true }); }
    else requestAnimationFrame(draw);
  })();

  // ---- Screenshot carousels: swipe, arrows or dots; the current slide opens full size.
  const viewer = $('#viewer'), viewerImg = $('#viewer-img'), viewerCap = $('#viewer-cap');
  let viewerSlides = [], viewerIndex = 0, viewerReel = null;
  const smooth = () => (reduceMotion.matches ? 'auto' : 'smooth');
  for (const reel of $$('.reel')) {
    const trackEl = $('.reel-track', reel);
    const slides = $$('.slide', reel);
    let cur = 0;
    const bar = document.createElement('div');
    bar.className = 'reel-bar';
    bar.innerHTML = `<p class="reel-count" aria-hidden="true"><b>1</b> / ${slides.length}</p><div class="reel-dots"></div>
      <div class="reel-nav"><button class="reel-btn" type="button" data-dir="-1" data-i18n-attr="aria-label:a.prev"><svg><use href="#i-prev"/></svg></button>
      <button class="reel-btn" type="button" data-dir="1" data-i18n-attr="aria-label:a.next"><svg><use href="#i-next"/></svg></button></div>`;
    L.apply(bar);
    reel.append(bar);
    const dots = slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      const dotLabel = () => dot.setAttribute('aria-label', t('a.screen', { n: i + 1, s: $('figcaption', slide).textContent }));
      dotLabel();
      document.addEventListener('lc:lang', dotLabel);
      dot.addEventListener('click', () => go(i));
      $('.reel-dots', bar).append(dot);
      return dot;
    });
    const [prev, next] = $$('.reel-btn', bar);
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    slides.forEach((slide, i) => {
      const img = $('img', slide);
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'slide-open';
      open.setAttribute('aria-label', t('a.view', { s: img.alt }));
      img.replaceWith(open);
      open.append(img);
      slide.style.setProperty('--shot', `url("${img.getAttribute('src')}")`);
      open.insertAdjacentHTML('beforeend', '<span class="expand" aria-hidden="true"><svg><use href="#i-expand"/></svg></span>');
      open.addEventListener('click', () => (i === cur ? openViewer(slides, i, go) : go(i)));
    });
    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1; }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      trackEl.scrollTo({ left: Math.min(i * step(), trackEl.scrollWidth - trackEl.clientWidth), behavior: smooth() });
      setCurrent(i);
    }
    function setCurrent(i) {
      cur = i;
      slides.forEach((s, j) => s.classList.toggle('is-current', j === i));
      dots.forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
      $('.reel-count b', bar).textContent = i + 1;
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    }
    let ticking = false;
    trackEl.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const atEnd = trackEl.scrollLeft >= trackEl.scrollWidth - trackEl.clientWidth - 4;
        const i = atEnd ? slides.length - 1 : Math.round(trackEl.scrollLeft / step());
        if (i !== cur) setCurrent(i);
      });
    }, { passive: true });
    trackEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    setCurrent(0);
  }

  function openViewer(slides, i, go) {
    viewerSlides = slides;
    viewerReel = go;
    showInViewer(i, false);
    viewer.showModal();
  }
  function showInViewer(i, animate) {
    viewerIndex = (i + viewerSlides.length) % viewerSlides.length;
    const img = $('img', viewerSlides[viewerIndex]);
    const set = () => {
      viewerImg.src = img.currentSrc || img.src;
      viewerImg.alt = img.alt;
      viewerCap.textContent = $('figcaption', viewerSlides[viewerIndex]).textContent;
    };
    if (!animate || reduceMotion.matches) return set();
    viewerImg.classList.add('swap');
    setTimeout(() => {
      set();
      viewerImg.decode().catch(() => {}).finally(() => viewerImg.classList.remove('swap'));
    }, 120);
  }
  function closeViewer() {
    if (viewerReel) viewerReel(viewerIndex);
    if (reduceMotion.matches) return viewer.close();
    viewer.classList.add('closing');
    setTimeout(() => { viewer.close(); viewer.classList.remove('closing'); }, 150);
  }
  $('.viewer-prev').addEventListener('click', () => showInViewer(viewerIndex - 1, true));
  $('.viewer-next').addEventListener('click', () => showInViewer(viewerIndex + 1, true));
  $('.viewer-close').addEventListener('click', closeViewer);
  viewer.addEventListener('cancel', (e) => { e.preventDefault(); closeViewer(); });
  viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showInViewer(viewerIndex + 1, true);
    if (e.key === 'ArrowLeft') showInViewer(viewerIndex - 1, true);
  });

  // ---- The visitor's own device gets the gold button: Android sees the APK first, iPhone and iPad see
  // Play online first (iOS cannot install either app), everyone else sees Windows first.
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (isAndroid || isIOS) {
    for (const row of $$('.actions')) {
      const win = row.querySelector('[data-dl=windows]'), android = row.querySelector('[data-dl=android]');
      let play = row.querySelector('a[href="../"]');
      if (isIOS && !play) {
        play = document.createElement('a');
        play.href = '../';
        play.target = '_blank';
        play.rel = 'noopener';
        play.innerHTML = '<svg><use href="#i-globe"/></svg><span data-i18n="play"></span>';
        L.apply(play);
        row.append(play);
      }
      const first = isAndroid ? android : play;
      for (const b of [win, android, play]) if (b) b.className = 'btn ' + (b === first ? 'btn-primary' : 'btn-ghost');
      row.prepend(first);
    }
    // The same on the download cards at Full Moon.
    for (const b of $$('.get .btn')) {
      const mine = isAndroid ? b.dataset.dl === 'android' : b.getAttribute('href') === '../';
      b.className = 'btn ' + (mine ? 'btn-primary' : 'btn-ghost');
    }
  }

  // ---- Latest release: version, sizes and file names from GitHub, via the site's own API.
  const mb = (bytes) => (bytes >= 10 * 1048576 ? Math.round(bytes / 1048576) : (bytes / 1048576).toFixed(1)) + ' MB';
  fetch('/api/release').then((r) => (r.ok ? r.json() : null)).then((release) => {
    if (!release) return;
    const showVersion = () => $$('[data-version]').forEach((el) => (el.textContent = t('version', { v: release.version })));
    showVersion();
    document.addEventListener('lc:lang', showVersion);
    $$('[data-version-num]').forEach((el) => (el.textContent = release.version));
    for (const [platform, file] of Object.entries(release.files || {})) {
      if (file.size) $$(`[data-size="${platform}"]`).forEach((el) => (el.textContent = mb(file.size)));
      $$(`[data-file="${platform}"]`).forEach((el) => (el.textContent = file.name));
    }
    if (release.files && release.files.mac) $('.get-mac').hidden = false;
  }).catch(() => {});

  // ---- Reviews.
  const roleName = (role) => t(role === 'other' || !role ? 'role.chip.other' : 'role.' + role);
  const SHOWN_FIRST = 3;
  const list = $('#review-list'), more = $('#reviews-more');
  let reviews = [], expanded = false;
  const loved = new Set((() => { try { return JSON.parse(localStorage.getItem('lc-loved') || '[]'); } catch (e) { return []; } })());
  const saveLoved = () => { try { localStorage.setItem('lc-loved', JSON.stringify([...loved])); } catch (e) {} };

  function stars(n) {
    const wrap = document.createElement('span');
    wrap.className = 'stars-row';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', t('rv.stars', { n: Math.round(n * 10) / 10 }));
    for (let i = 1; i <= 5; i++) {
      wrap.insertAdjacentHTML('beforeend', `<svg class="${i <= Math.round(n) ? 'on' : 'off'}"><use href="#i-star"/></svg>`);
    }
    return wrap;
  }
  function reviewItem(r, fresh) {
    const li = document.createElement('li');
    li.className = 'review' + (fresh ? ' fresh' : '');
    const head = document.createElement('div');
    head.className = 'review-head';
    const name = document.createElement('span');
    name.className = 'review-name';
    name.textContent = r.name;
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = roleName(r.role);
    const date = document.createElement('time');
    date.className = 'review-date';
    date.dateTime = new Date(r.createdAt).toISOString();
    date.textContent = new Date(r.createdAt).toLocaleDateString(L.locale, { day: 'numeric', month: 'short', year: 'numeric' });
    head.append(name, chip, date);
    const body = document.createElement('p');
    body.textContent = r.body;
    const love = document.createElement('button');
    love.type = 'button';
    love.className = 'love';
    const isLoved = loved.has(r.id);
    love.setAttribute('aria-pressed', String(isLoved));
    love.innerHTML = '<svg><use href="#i-heart"/></svg><span></span>';
    love.setAttribute('aria-label', t('rv.love'));
    love.querySelector('span').textContent = r.loves;
    love.addEventListener('click', () => {
      if (loved.has(r.id)) return;
      loved.add(r.id);
      saveLoved();
      r.loves += 1;
      love.setAttribute('aria-pressed', 'true');
      love.classList.add('pop');
      love.addEventListener('animationend', () => love.classList.remove('pop'), { once: true });
      love.querySelector('span').textContent = r.loves;
      fetch(`/api/reviews/${r.id}/love`, { method: 'POST' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data) love.querySelector('span').textContent = data.loves; })
        .catch(() => {});
    });
    li.append(head, stars(r.hearts), body, love);
    return li;
  }
  function renderReviews(freshId) {
    list.replaceChildren(...reviews.filter((r, i) => expanded || i < SHOWN_FIRST).map((r) => reviewItem(r, r.id === freshId)));
    $('#reviews-empty').hidden = reviews.length > 0;
    more.hidden = reviews.length <= SHOWN_FIRST;
    more.textContent = expanded ? t('rv.fewer') : t('rv.more', { n: reviews.length });
  }
  function renderSummary(count, average) {
    $('#reviews-summary').hidden = !count;
    if (!count) return;
    $('#reviews-avg').textContent = average.toFixed(1);
    $('#reviews-avg-stars').replaceChildren(...stars(average).childNodes);
    $('#reviews-count').textContent = count === 1 ? t('rv.count1') : t('rv.countN', { n: count });
  }
  let summary = { count: 0, total: 0 };
  more.addEventListener('click', () => { expanded = !expanded; renderReviews(); });
  fetch('/api/reviews')
    .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
    .then((data) => {
      reviews = data.reviews;
      summary = { count: data.count, total: (data.average || 0) * data.count };
      renderSummary(data.count, data.average || 0);
      renderReviews();
    })
    .catch(() => { $('#reviews-error').hidden = false; });

  // ---- Review form.
  const form = $('#review-form'), errorEl = $('#form-error'), okEl = $('#form-ok'), submit = $('#rv-submit');
  const heartLabels = $$('#star-pick label');
  const paintHearts = (n) => heartLabels.forEach((l, i) => l.classList.toggle('on', i < n));
  const chosenHearts = () => Number((form.querySelector('input[name=hearts]:checked') || {}).value || 0);
  heartLabels.forEach((label, i) => {
    label.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') paintHearts(i + 1); });
    label.addEventListener('pointerleave', () => paintHearts(chosenHearts()));
  });
  form.addEventListener('change', () => paintHearts(chosenHearts()));
  const bodyField = $('#rv-body');
  bodyField.addEventListener('input', () => { $('#rv-count').textContent = Array.from(bodyField.value).length; });
  const showError = (message) => { errorEl.textContent = message; errorEl.hidden = false; okEl.hidden = true; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const data = new FormData(form);
    const review = {
      name: String(data.get('name') || '').trim(),
      role: data.get('role'),
      hearts: Number(data.get('hearts')),
      body: String(data.get('body') || '').trim(),
    };
    if (!review.name) return showError(t('err.name'));
    if (!review.role) return showError(t('err.role'));
    if (!review.hearts) return showError(t('err.stars'));
    if (Array.from(review.body).length < 10) return showError(t('err.short'));
    submit.disabled = true;
    submit.textContent = t('rv.posting');
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        const known = { name: 'err.name', fields: 'err.role', length: 'err.length', links: 'err.links', words: 'err.words', limit: 'err.limit' }[out.error];
        return showError(t(known || 'err.generic'));
      }
      reviews.unshift(out.review);
      summary.count += 1;
      summary.total += out.review.hearts;
      renderSummary(summary.count, summary.total / summary.count);
      renderReviews(out.review.id);
      form.reset();
      paintHearts(0);
      $('#rv-count').textContent = '0';
      okEl.hidden = false;
    } catch (err) {
      showError(t('err.network'));
    } finally {
      submit.disabled = false;
      submit.textContent = t('rv.submit');
    }
  });

  // ---- Language switcher: English by default, BM and 中文 on request; remembered per browser.
  for (const b of $$('.lang [data-lang]')) b.addEventListener('click', () => L.set(b.dataset.lang));
  document.addEventListener('lc:lang', () => {
    if (current >= 0) { phaseEl.textContent = L.phase(current); factEl.textContent = L.fact(current); }
    renderSummary(summary.count, summary.count ? summary.total / summary.count : 0);
    renderReviews();
  });
})();
