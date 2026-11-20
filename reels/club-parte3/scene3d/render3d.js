// Render the 3D layer of "Mi nuevo club — Parte 2" to JPEG frames with headless Chromium.
//   node render3d.js <scene3d dir> <three.module.js> <out dir> <nframes> [--only 0,30,60] [--workers 3]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [dir, threePath, out, nframesArg] = process.argv.slice(2);
const nframes = parseInt(nframesArg, 10);
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > 0 ? process.argv[onlyIdx + 1].split(',').map(Number) : null;
const wIdx = process.argv.indexOf('--workers');
const workers = wIdx > 0 ? parseInt(process.argv[wIdx + 1], 10) : 3;
fs.mkdirSync(out, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const frames = only || [...Array(nframes).keys()];
  const todo = frames.filter(i => !fs.existsSync(path.join(out, `${String(i).padStart(4, '0')}.jpg`)));
  let next = 0, done = 0;
  async function worker() {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => console.error('pageerror', e.message));
    await page.route('http://scene.local/**', route => {
      const name = new URL(route.request().url()).pathname.slice(1) || 'scene.html';
      const file = name === 'three.module.js' ? threePath : path.join(dir, name);
      route.fulfill({ body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
    });
    await page.goto('http://scene.local/scene.html');
    await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
    while (next < todo.length) {
      const i = todo[next++];
      const url = await page.evaluate(t => window.renderAt(t), i / 30);
      fs.writeFileSync(path.join(out, `${String(i).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
      if (++done % 60 === 0) console.log(`${done}/${todo.length}`);
    }
    await page.close();
  }
  await Promise.all([...Array(workers)].map(worker));
  await browser.close();
  console.log('done', done);
})();
