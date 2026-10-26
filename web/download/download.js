// Download page behaviour: the Moon runs through the month (on its own at the top, with the scroll
// after that), screenshots sit in carousels with a full-size viewer, the downloads show the latest
// release, and reviews load, post and collect loves.
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
    button.dataset.label = chapter.dataset.phase;
    button.setAttribute('aria-label', `${chapter.dataset.phase}, day ${Math.floor(days[i])}`);
    const icon = document.createElement('canvas');
    icon.width = icon.height = 36;
    window.LunarMoon.drawPhase(icon.getContext('2d'), 36, days[i], '#e9e6df', '#2a2d4a');
    button.append(icon);
    button.addEventListener('click', () => chapter.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' }));
    li.append(button);
    track.append(li);
    return button;
  });
  // Tooltips: the first one waits, then neighbours open instantly while the pointer stays on the row.
  let warmTimer = 0;
  track.addEventListener('pointerover', () => { clearTimeout(warmTimer); warmTimer = setTimeout(() => track.classList.add('warm'), 300); });
  track.addEventListener('pointerleave', () => { clearTimeout(warmTimer); warmTimer = setTimeout(() => track.classList.remove('warm'), 400); });

  let target = 1, shown = 1, current = -1, last = performance.now(), timelapse = true;
  // The Windows card is lit by the Moon: its glow follows how much of the disc is lit.
  const getMain = $('.get-main');
  let getLit = -1;
  function measure() {
    timelapse = scrollY < Math.min(innerHeight * 0.15, 140);
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
      phaseEl.textContent = chapters[i].dataset.phase;
      factEl.textContent = chapters[i].dataset.fact;
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
    if (reduceMotion.matches) shown = timelapse ? 1 : target;
    else if (timelapse) shown = wrap(shown + dt * TIMELAPSE);
    else {
      const gap = towards(shown, target);
      shown = Math.abs(gap) < 0.002 ? target : wrap(shown + gap * (1 - Math.exp(-dt * 5)));
    }
    moon.setDay(shown);
    moon.render(now, reduceMotion.matches);
    const a = window.LunarMoon.phaseAngle(shown);
    // The phase name follows the Moon on screen, not the chapter, so the two never disagree.
    const nearest = days.reduce((best, d, j) => (Math.abs(towards(shown, d)) < Math.abs(towards(shown, days[best])) ? j : best), 0);
    if (nearest !== current) setChapter(nearest);
    const lit = 0.5 - 0.5 * Math.cos(a);
    if (getMain && Math.abs(lit - getLit) > 0.01) { getLit = lit; getMain.style.setProperty('--lit', (lit * lit).toFixed(3)); }
    dayEl.textContent = 'Day ' + Math.min(30, Math.max(1, Math.round(shown)));
    litEl.textContent = Math.round(lit * 100) + '% lit';
    requestAnimationFrame(frame);
  }
  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', measure);
  measure();
  requestAnimationFrame(frame);

  // ---- Entrances: the hero rises once on load; later copy rises once as it scrolls into view.
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
      <button class="reel-btn" type="button" data-dir="-1" aria-label="Previous screen"><svg><use href="#i-prev"/></svg></button>
      <button class="reel-btn" type="button" data-dir="1" aria-label="Next screen"><svg><use href="#i-next"/></svg></button>`;
    reel.append(bar);
    const dots = slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Screen ${i + 1}: ${$('figcaption', slide).textContent}`);
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
      open.setAttribute('aria-label', 'View larger: ' + img.alt);
      img.replaceWith(open);
      open.append(img);
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
        play.innerHTML = '<svg><use href="#i-browser"/></svg>Play online';
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
    $$('[data-version]').forEach((el) => (el.textContent = 'Version ' + release.version));
    $$('[data-version-num]').forEach((el) => (el.textContent = release.version));
    for (const [platform, file] of Object.entries(release.files || {})) {
      if (file.size) $$(`[data-size="${platform}"]`).forEach((el) => (el.textContent = mb(file.size)));
      $$(`[data-file="${platform}"]`).forEach((el) => (el.textContent = file.name));
    }
    if (release.files && release.files.mac) $('.get-mac').hidden = false;
  }).catch(() => {});

  // ---- Reviews.
  const ROLES = { parent: 'Parent', teacher: 'Teacher', pupil: 'Pupil', other: 'Player' };
  const SHOWN_FIRST = 3;
  const list = $('#review-list'), more = $('#reviews-more');
  let reviews = [], expanded = false;
  const loved = new Set((() => { try { return JSON.parse(localStorage.getItem('lc-loved') || '[]'); } catch (e) { return []; } })());
  const saveLoved = () => { try { localStorage.setItem('lc-loved', JSON.stringify([...loved])); } catch (e) {} };

  function hearts(n, label) {
    const wrap = document.createElement('span');
    wrap.className = 'hearts';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', label || `${n} out of 5 hearts`);
    for (let i = 1; i <= 5; i++) {
      wrap.insertAdjacentHTML('beforeend', `<svg class="${i <= Math.round(n) ? 'on' : 'off'}"><use href="#i-heart"/></svg>`);
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
    chip.textContent = ROLES[r.role] || 'Player';
    const date = document.createElement('time');
    date.className = 'review-date';
    date.dateTime = new Date(r.createdAt).toISOString();
    date.textContent = new Date(r.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    head.append(name, chip, date);
    const body = document.createElement('p');
    body.textContent = r.body;
    const love = document.createElement('button');
    love.type = 'button';
    love.className = 'love';
    const isLoved = loved.has(r.id);
    love.setAttribute('aria-pressed', String(isLoved));
    love.innerHTML = '<svg><use href="#i-heart"/></svg><span></span><span class="sr-only"> loves, love this review</span>';
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
    li.append(head, hearts(r.hearts), body, love);
    return li;
  }
  function renderReviews(freshId) {
    list.replaceChildren(...reviews.filter((r, i) => expanded || i < SHOWN_FIRST).map((r) => reviewItem(r, r.id === freshId)));
    $('#reviews-empty').hidden = reviews.length > 0;
    more.hidden = reviews.length <= SHOWN_FIRST;
    more.textContent = expanded ? 'Show fewer' : `Show all ${reviews.length} reviews`;
  }
  function renderSummary(count, average) {
    $('#reviews-summary').hidden = !count;
    if (!count) return;
    $('#reviews-avg').textContent = average.toFixed(1);
    $('#reviews-avg-hearts').replaceChildren(...hearts(average).childNodes);
    $('#reviews-count').textContent = count === 1 ? 'from 1 review' : `from ${count} reviews`;
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
  const heartLabels = $$('#heart-pick label');
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
    if (!review.name) return showError('Please add a nickname.');
    if (!review.role) return showError('Please choose who you are.');
    if (!review.hearts) return showError('Please choose how many hearts.');
    if (Array.from(review.body).length < 10) return showError('Reviews need at least 10 characters.');
    submit.disabled = true;
    submit.textContent = 'Posting…';
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) return showError(out.message || 'Your review could not be posted. Please try again.');
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
      showError('Your review could not be posted. Check your connection and try again.');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Post review';
    }
  });
})();
