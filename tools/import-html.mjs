// Splits a single-file LUNARCADE HUB export (the kind ChatGPT produces) into the web/ folder:
// fonts, audio and the big script become real files, and the online leaderboard hook is patched in.
//
// Usage: npm run import -- path/to/LUNARCADE-HUB-Vx.y.z.html
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const web = join(root, 'web');
const source = process.argv[2];
if (!source || !existsSync(source)) {
  console.error('Usage: npm run import -- path/to/LUNARCADE-HUB.html');
  process.exit(1);
}

const html = readFileSync(source, 'utf8');
const bytes = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
const hash = (buf) => createHash('sha1').update(buf).digest('hex').slice(0, 10);
const write = (rel, data) => {
  const file = join(web, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
  return data.length;
};

// Generated folders are rebuilt from scratch; hand-written files (config.js, online-leaderboard.js) are kept.
const handWritten = ['config.js', 'online-leaderboard.js', 'fit-small-screens.js'];
for (const dir of ['assets/fonts', 'assets/audio', 'assets/music', 'css']) rmSync(join(web, dir), { recursive: true, force: true });
if (existsSync(join(web, 'js'))) for (const f of readdirSync(join(web, 'js'))) if (!handWritten.includes(f)) rmSync(join(web, 'js', f));

const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const version = (html.match(/<title>[^<]*?V([\d.]+)/) || [])[1] || 'dev';

// ---- CSS: every <style> block, in order, with embedded fonts pulled out into files.
const styleRe = /<style([^>]*)>([\s\S]*?)<\/style>/g;
let css = '';
for (const [, attrs, text] of head.matchAll(styleRe)) css += `/* ===== <style${attrs}> ===== */\n${text}\n`;
const headMeta = head.replace(styleRe, '').trim();

// Fingerprint of every font and sound, so the offline cache only re-downloads media when it changes.
const media = createHash('sha1');
let fontBytes = 0;
const fontNames = new Set();
const fontFaces = [];
css = css.replace(/(\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{[^}]*\}/g, (rule, _c, label) => {
  const face = rule.replace(/url\(data:font\/woff2;base64,([A-Za-z0-9+/=]+)\)/g, (_, b64) => {
    const buf = Buffer.from(b64, 'base64');
    let name = (label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!name || fontNames.has(name)) name = (name ? name + '-' : 'font-') + hash(buf);
    fontNames.add(name);
    media.update(name).update(buf);
    fontBytes += write(`assets/fonts/${name}.woff2`, buf);
    return `url(../assets/fonts/${name}.woff2)`;
  });
  fontFaces.push(face.trim());
  return '';
});
write('css/fonts.css', fontFaces.join('\n') + '\n');
write('css/app.css', css.replace(/\n{3,}/g, '\n\n'));

// ---- Body scripts: audio becomes files, the big bundle becomes js/app.js, small inline scripts stay put.
let audioBytes = 0;
const audioFiles = [];
let appPatched = false;
const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/g;
const bodyOut = body.replace(scriptRe, (tag, attrs, text) => {
  // Sound tables such as globalThis.__MOON_AUDIO={"click":"data:audio/wav;base64,..."} (sound effects)
  // and globalThis.__MOON_MUSIC296={"A":"data:audio/mpeg;base64,..."} (music).
  const table = text.match(/^\s*globalThis\.(\w+)=\{/);
  if (table && text.includes('data:audio/')) {
    const global = table[1];
    const folder = /music/i.test(global) ? 'music' : 'audio';
    const manifest = {};
    for (const [, key, mime, b64] of text.matchAll(/"([\w-]+)":"data:audio\/([\w.+-]+);base64,([A-Za-z0-9+/=]+)"/g)) {
      const file = `assets/${folder}/${key}.${mime === 'mpeg' ? 'mp3' : mime}`;
      const buf = Buffer.from(b64, 'base64');
      media.update(file).update(buf);
      audioBytes += write(file, buf);
      audioFiles.push(file);
      manifest[key] = file;
    }
    const name = global.replace(/^_+/, '').toLowerCase().replace(/_/g, '-');
    write(`js/${name}.js`, `globalThis.${global}=${JSON.stringify(manifest, null, 1)};\n`);
    return `<script src="js/${name}.js"></script>`;
  }
  if (!attrs.trim() && text.length > 100_000) {
    const hook = 'const N295store=N295createStore({getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)});';
    let js = text;
    if (js.includes(hook)) {
      js = js.replace(hook, hook + "\nglobalThis.LunarOnline?.attach({store:N295store,compare:N295compare,valid:N295validRecord,clean:N295cleanRecord,labels:N295L,isBoardOpen:()=>Vt==='stats',refresh:()=>{if(Vt==='stats')Nt('stats')}});");
      appPatched = true;
    }
    write('js/app.js', js.trimStart());
    return '<script src="js/config.js"></script>\n<script src="js/online-leaderboard.js"></script>\n<script src="js/app.js"></script>';
  }
  return tag;
});

const page = `<!doctype html><html lang="en"><head>${headMeta}
<link rel="icon" href="icon.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="LunarCade">
<script src="js/fit-small-screens.js"></script>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/app.css">
<script>if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !(window.Capacitor || window.parent.Capacitor)) navigator.serviceWorker.register('sw.js');</script>
</head><body>${bodyOut}</body></html>
`;
// index.html is hand-written: it fits game.html to every screen size and orientation.
write('game.html', page);
write('version.json', JSON.stringify({ version, importedFrom: source.split(/[\\/]/).pop(), importedAt: new Date().toISOString() }, null, 2) + '\n');

// Offline cache for the home-screen app: the page shell, with a cache name unique to this import.
// Page addresses as the website serves them: Cloudflare drops the .html ending.
const shell = ['./', 'game', 'manifest.webmanifest', 'css/app.css', 'css/fonts.css', ...readdirSync(join(web, 'js')).map((f) => 'js/' + f)];
const build = version + '-' + hash(Buffer.from(page + css + ['index.html', 'js/app.js', 'js/fit-small-screens.js'].map((f) => readFileSync(join(web, f), 'utf8')).join('')));
write('sw.js', readFileSync(join(root, 'tools/sw-template.js'), 'utf8')
  .replace('__BUILD__', build)
  .replace('__MEDIA__', media.digest('hex').slice(0, 10))
  .replace('__SHELL__', JSON.stringify(shell))
  .replace('__AUDIO__', JSON.stringify(audioFiles)));

console.log(`Imported V${version} into web/`);
console.log(`  fonts  ${fontNames.size} files, ${bytes(fontBytes)}`);
console.log(`  audio  ${bytes(audioBytes)}`);
console.log(`  page   ${bytes(page.length)}, css ${bytes(css.length)}`);
if (!appPatched) {
  console.warn('\n  WARNING: leaderboard hook not found in this version, so the online leaderboard is OFF.');
  console.warn('  Search js/app.js for "N295store=N295createStore" and update tools/import-html.mjs.');
}
