// Runs inside game.html. On the website and in the Android app the game is shown by index.html, which
// keeps it at 900 × 520 or larger (the smallest layout the game supports) and scales or turns it to fit
// the screen. The desktop app opens game.html directly in a window that is never smaller than that.
(function () {
  const embedded = window.parent !== window;
  if (!embedded && !/Electron\//.test(navigator.userAgent)) {
    // Opened directly in a browser: go through index.html so small and upright screens still fit.
    location.replace('./' + location.search + location.hash);
    return;
  }

  const phone = Math.min(screen.width, screen.height) < 520 && matchMedia('(pointer: coarse)').matches;

  // The 3D scenes render at up to 1.5× devicePixelRatio with glow and soft shadows, which is too many
  // pixels for a phone GPU, and phones show the game scaled down anyway. Render at 1× there: about
  // 2.25× fewer pixels per frame. Page text is unaffected; only canvas drawing gets slightly softer.
  if (phone && devicePixelRatio > 1) {
    Object.defineProperty(window, 'devicePixelRatio', { get: () => 1, configurable: true });
  }

  let host = null;
  try {
    if (embedded) host = window.parent.document;
  } catch (e) {}
  if (!host) return;

  // Full screen must cover index.html, not just this frame, or the fitting is lost.
  const top = host.documentElement;
  if (top.requestFullscreen) {
    document.documentElement.requestFullscreen = (options) => top.requestFullscreen(options);
    document.exitFullscreen = () => host.exitFullscreen();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => (host.fullscreenElement ? document.documentElement : null),
    });
    host.addEventListener('fullscreenchange', () => document.dispatchEvent(new Event('fullscreenchange')));
  }

  // In a phone browser, the first tap goes full screen and locks landscape, like a native game.
  // Android allows this; iPhone Safari does not, so there the game stays turned until the phone is.
  const installed = !!(window.Capacitor || window.parent.Capacitor) ||
    window.parent.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  if (phone && !installed && top.requestFullscreen) {
    addEventListener('pointerdown', async () => {
      try {
        if (!host.fullscreenElement) await top.requestFullscreen({ navigationUI: 'hide' });
        await window.parent.screen.orientation?.lock?.('landscape');
      } catch (e) {}
    }, { once: true, capture: true });
  }
})();
