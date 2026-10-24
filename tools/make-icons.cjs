// Makes every app icon (web, desktop, Android) from one square picture (default: art/app-icon.png):
//   npm run icons                  (uses art/app-icon.png)
//   npm run icons -- other.png     (any square PNG/JPG, ideally 1024×1024 or larger)
// Runs inside Electron so no image library is needed.
//
// The art is a rounded-square badge on a black background, so:
//   - "cut" icons (desktop app, browser tab, older Android): corners cut away to transparent.
//   - "phone" icons (iPhone, Android home screens round the corners themselves): the art is zoomed
//     slightly inside its frame on a matching purple, so no black ever shows.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const input = process.argv.slice(2).find((a) => /\.(png|jpe?g|webp)$/i.test(a)) || path.join(root, 'art', 'app-icon.png');
const CORNER = 0.27; // corner radius of the art's rounded frame, as a fraction of the width
const PURPLE = '#2a1a6e'; // matches the art's frame, used behind "phone" icons
const NIGHT = '#171340'; // the game's background colour, used for the launch screen

const outputs = [
  { file: 'web/icon.png', size: [512, 512], kind: 'cut' },
  { file: 'web/icon-192.png', size: [192, 192], kind: 'cut' },
  { file: 'web/icon-maskable.png', size: [512, 512], kind: 'phone' },
  { file: 'web/apple-touch-icon.png', size: [180, 180], kind: 'phone' },
];

// Android images are regenerated at whatever size the Capacitor template uses.
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');
const androidKinds = { 'ic_launcher.png': 'cut', 'ic_launcher_round.png': 'round', 'ic_launcher_foreground.png': 'foreground', 'splash.png': 'splash' };
if (fs.existsSync(res)) {
  for (const dir of fs.readdirSync(res)) {
    for (const [name, kind] of Object.entries(androidKinds)) {
      const file = path.join(res, dir, name);
      if (!fs.existsSync(file)) continue;
      const png = fs.readFileSync(file);
      outputs.push({ file: path.relative(root, file), size: [png.readUInt32BE(16), png.readUInt32BE(20)], kind });
    }
  }
  const colour = path.join(res, 'values', 'ic_launcher_background.xml');
  fs.writeFileSync(colour, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${PURPLE}</color>\n</resources>\n`);
}

const draw = `(async (src, kind, w, h, CORNER, PURPLE, NIGHT) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.querySelector('canvas'), g = c.getContext('2d');
  c.width = w; c.height = h; g.clearRect(0, 0, w, h);
  const side = Math.min(img.width, img.height), sx = (img.width - side) / 2, sy = (img.height - side) / 2;
  const art = (x, y, d, clip) => {
    g.save(); g.beginPath();
    if (clip === 'circle') g.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2); else g.roundRect(x, y, d, d, d * CORNER);
    g.clip(); g.drawImage(img, sx, sy, side, side, x, y, d, d); g.restore();
  };
  const zoomed = (cx, cy, d) => { const z = d * 1.16; art(cx - z / 2, cy - z / 2, z); };
  if (kind === 'cut') art(0, 0, w);
  if (kind === 'phone') { g.fillStyle = PURPLE; g.fillRect(0, 0, w, h); zoomed(w / 2, h / 2, w); }
  if (kind === 'round') {
    g.save(); g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.clip();
    g.fillStyle = PURPLE; g.fillRect(0, 0, w, h); zoomed(w / 2, h / 2, w); g.restore();
  }
  // Adaptive icon foreground: Android shows roughly the middle two thirds, over the purple background.
  if (kind === 'foreground') { g.beginPath(); g.rect(0, 0, w, h); g.clip(); zoomed(w / 2, h / 2, w * 0.72); }
  if (kind === 'splash') { g.fillStyle = NIGHT; g.fillRect(0, 0, w, h); const d = Math.min(w, h) * 0.38; art((w - d) / 2, (h - d) / 2, d); }
  return c.toDataURL('image/png');
})`;

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  await win.loadURL('data:text/html,<canvas></canvas>');
  const src = 'data:image/' + path.extname(input).slice(1).replace('jpg', 'jpeg') + ';base64,' + fs.readFileSync(input).toString('base64');
  for (const { file, size: [w, h], kind } of outputs) {
    const args = [src, kind, w, h, CORNER, PURPLE, NIGHT].map((a) => JSON.stringify(a)).join(',');
    const url = await win.webContents.executeJavaScript(`${draw}(${args})`);
    fs.writeFileSync(path.join(root, file), Buffer.from(url.split(',')[1], 'base64'));
    console.log(`  ${file.replace(/\\/g, '/')}  ${w}×${h}  (${kind})`);
  }
  app.quit();
});
