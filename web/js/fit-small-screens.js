// The game is laid out for screens of at least 900 × 520 and shows a "rotate / bigger screen" notice
// below that. On a phone held sideways, widen the page viewport instead so the browser zooms the
// whole game out to fit. Portrait phones keep the normal viewport (and the game's rotate notice).
(function () {
  const meta = document.querySelector('meta[name=viewport]');
  if (!meta) return;
  const original = meta.content;
  const MIN_W = 900, MIN_H = 520;

  function fit() {
    const long = Math.max(screen.width, screen.height), short = Math.min(screen.width, screen.height);
    const small = long < MIN_W || short < MIN_H;
    const landscape = innerWidth > innerHeight;
    if (!small || !landscape) {
      if (meta.content !== original) meta.content = original;
      return;
    }
    // Width/height ratio is the same at any zoom, so this settles in one step.
    const width = Math.ceil(Math.max(MIN_W, MIN_H * (innerWidth / innerHeight)));
    const content = `width=${width},user-scalable=no,viewport-fit=cover`;
    if (meta.content !== content) meta.content = content;
  }

  fit();
  addEventListener('resize', fit);
  addEventListener('orientationchange', () => setTimeout(fit, 300));

  const phone = Math.min(screen.width, screen.height) < MIN_H && matchMedia('(pointer: coarse)').matches;

  // The 3D scenes render at up to 1.5× devicePixelRatio with glow and soft shadows, which is too many
  // pixels for a phone GPU. Phones already zoom the game out, so render at 1× there: about 2.25×
  // fewer pixels per frame. Page text is unaffected; only canvas drawing gets slightly softer.
  if (phone && devicePixelRatio > 1) {
    Object.defineProperty(window, 'devicePixelRatio', { get: () => 1, configurable: true });
  }

  // In a phone browser, the first tap goes full screen and locks landscape, like a native game.
  // Android allows this; iPhone Safari does not, so the game's rotate notice remains there.
  const installed = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || !!globalThis.Capacitor;
  if (phone && !installed && document.documentElement.requestFullscreen) {
    addEventListener('pointerdown', async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        await screen.orientation?.lock?.('landscape');
      } catch (e) {}
    }, { once: true, capture: true });
  }
})();
