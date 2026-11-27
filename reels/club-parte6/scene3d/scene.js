// 3D world for "Mi nuevo club — Parte 6": low-poly club pitch + the coach.
// Exposes window.renderAt(t) -> JPEG data URL. Scene timing comes from scenes.json,
// mouth opening from env.json (voice loudness per frame at 30 fps).
import * as THREE from './three.module.js';

const W = 1080, H = 1920, FPS = 30;
const cfg = await (await fetch('scenes.json')).json();
const ENV = await (await fetch('env.json')).json();
const lilita = new FontFace('Lilita', await (await fetch('LilitaOne.woff2')).arrayBuffer());
await lilita.load();
document.fonts.add(lilita);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 500);

// deterministic random
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });
const flat = (color, o = {}) => std(color, { flatShading: true, ...o });
function mesh(geo, mat, parent, pos = [0, 0, 0], shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// ---------------------------------------------------------------- sky + fog
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
  vertexShader: `varying float vy; void main(){ vy = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying float vy;
    void main(){ float a = clamp(vy*2.2, 0., 1.); gl_FragColor = vec4(mix(bottom, top, pow(a, .8)), 1.); }`,
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat));
scene.fog = new THREE.Fog(0xffffff, 40, 140);

// stars (night only)
const starGeo = new THREE.BufferGeometry();
const sp = [];
for (let i = 0; i < 500; i++) {
  const th = rnd() * Math.PI * 2, ph = 0.15 + rnd() * 1.2;
  sp.push(250 * Math.cos(th) * Math.cos(ph), 250 * Math.sin(ph), 250 * Math.sin(th) * Math.cos(ph));
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffee, size: 1.6, fog: false }));
scene.add(stars);

// ---------------------------------------------------------------- lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 1.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.0);
sun.position.set(-12, 20, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 80 });
sun.shadow.bias = -0.0005;
sun.shadow.radius = 4;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc8d4ff, 0);
fill.position.set(2, 6, 20);
scene.add(fill);

// ---------------------------------------------------------------- ground
function pitchTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1536;
  const g = c.getContext('2d');
  for (let i = 0; i < 12; i++) {
    g.fillStyle = i % 2 ? '#4f9a42' : '#5aab4a';
    g.fillRect(0, i * 128, 1024, 128);
  }
  g.strokeStyle = 'rgba(245,250,240,.95)';
  g.lineWidth = 9;
  g.strokeRect(40, 40, 944, 1456);
  g.beginPath(); g.moveTo(40, 768); g.lineTo(984, 768); g.stroke();
  g.beginPath(); g.arc(512, 768, 150, 0, Math.PI * 2); g.stroke();
  g.strokeRect(272, 40, 480, 230); g.strokeRect(272, 1266, 480, 230);
  g.strokeRect(392, 40, 240, 90); g.strokeRect(392, 1406, 240, 90);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const PITCH_W = 40, PITCH_L = 60, PITCH_Z = -14; // pitch centre; the coach stands near the near end
const outer = mesh(new THREE.PlaneGeometry(400, 400), std(0x4a8c3e), scene, [0, -0.02, 0], false);
outer.rotation.x = -Math.PI / 2;
const pitch = mesh(new THREE.PlaneGeometry(PITCH_W, PITCH_L), std(0xffffff, { map: pitchTexture() }), scene, [0, 0, PITCH_Z], false);
pitch.rotation.x = -Math.PI / 2;

// dirt cover used by the "cancha de verdad" reveal (scale.x goes 1 -> 0)
const dirtTex = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#b97a45'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = rnd() > .5 ? '#a86a3a' : '#c88a55';
    g.beginPath(); g.ellipse(rnd() * 512, rnd() * 512, 20 + rnd() * 60, 10 + rnd() * 25, 0, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const dirtPivot = new THREE.Group();
dirtPivot.position.set(PITCH_W / 2 + 6, 0.02, PITCH_Z);
scene.add(dirtPivot);
const dirt = mesh(new THREE.PlaneGeometry(PITCH_W + 12, PITCH_L + 12), std(0xffffff, { map: dirtTex }), dirtPivot, [-(PITCH_W + 12) / 2, 0, 0], false);
dirt.rotation.x = -Math.PI / 2;

// ---------------------------------------------------------------- hills + trees
for (let i = 0; i < 9; i++) {
  const r = 30 + rnd() * 25;
  const h = mesh(new THREE.IcosahedronGeometry(r, 1), flat(0x7a8a4a), scene, [-140 + i * 35, -r * 0.72, -95 - rnd() * 30], false);
  h.scale.y = 0.55;
}
const treeMats = [flat(0x3f8a4a), flat(0x2f7440), flat(0x4b9a52)];
const trunkMat = flat(0x7a5232);
function tree(x, z, s) {
  if ((x < -PITCH_W / 2 - 3 && z > PITCH_Z + 10) || (x > PITCH_W / 2 + 1 && Math.abs(z - PITCH_Z - 6) < 16)) return;
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  mesh(new THREE.CylinderGeometry(0.25 * s, 0.3 * s, 1.2 * s, 6), trunkMat, g, [0, 0.6 * s, 0]);
  for (let i = 0; i < 3; i++)
    mesh(new THREE.ConeGeometry((1.7 - i * 0.4) * s, 2.0 * s, 7), treeMats[i % 3], g, [0, (1.8 + i * 1.1) * s, 0]);
  g.rotation.y = rnd() * 6;
  scene.add(g);
}
for (let i = 0; i < 70; i++) {
  const x = -60 + rnd() * 120, z = -48 - rnd() * 30;
  tree(x, z, 1.1 + rnd() * 0.9);
}
for (let side of [-1, 1]) for (let i = 0; i < 18; i++) tree(side * (PITCH_W / 2 + 5 + rnd() * 20), -45 + rnd() * 50, 1 + rnd() * 0.8);

// little rocks / tufts like Part 1
for (let i = 0; i < 40; i++) {
  const x = (rnd() - .5) * 60, z = 8 - rnd() * 70;
  if (Math.abs(x) < PITCH_W / 2 + 1 && z < PITCH_Z + PITCH_L / 2 + 1) continue;
  mesh(new THREE.ConeGeometry(0.25, 0.5, 4), flat(0xc9b04a), scene, [x, 0.25, z]);
}

// ---------------------------------------------------------------- goal
function makeGoal(w = 7.3, h = 2.44, d = 2.0) {
  const g = new THREE.Group();
  const white = std(0xffffff, { roughness: .4 });
  const post = r => new THREE.CylinderGeometry(r, r, 1, 12);
  const p1 = mesh(post(0.09), white, g, [-w / 2, h / 2, 0]); p1.scale.y = h;
  const p2 = mesh(post(0.09), white, g, [w / 2, h / 2, 0]); p2.scale.y = h;
  const bar = mesh(post(0.09), white, g, [0, h, 0]); bar.scale.y = w; bar.rotation.z = Math.PI / 2;
  // net
  const pts = [];
  const N = 0.25;
  for (let x = -w / 2; x <= w / 2 + 1e-3; x += N) { pts.push(x, h, 0, x, h * 0.6, -d, x, h * 0.6, -d, x, 0, -d); }
  for (let y = 0; y <= h * 0.6 + 1e-3; y += N) pts.push(-w / 2, y, -d, w / 2, y, -d);
  for (let k = 0; k <= 1; k += N / d) { const z = -d * k, y = h - (h * 0.4) * k; pts.push(-w / 2, y, z, w / 2, y, z); }
  for (const sx of [-1, 1]) {
    for (let k = 0; k <= 1 + 1e-3; k += N / d) { const z = -d * k, y = h - (h * 0.4) * k; pts.push(sx * w / 2, 0, z, sx * w / 2, y, z); }
    for (let y = 0; y <= h; y += N) { const kk = Math.min(1, Math.max(0, (h - y) / (h * 0.4))); pts.push(sx * w / 2, y, 0, sx * w / 2, Math.min(y, h * 0.6), -d * (y > h * 0.6 ? kk : 1)); }
  }
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.LineSegments(ng, new THREE.LineBasicMaterial({ color: 0xf2f2f2, transparent: true, opacity: 0.75 })));
  scene.add(g);
  return g;
}
const goalNear = makeGoal(); // the new goal behind the coach
goalNear.position.set(0, 0, PITCH_Z - PITCH_L / 2 + 0.5);

// ---------------------------------------------------------------- ball
function makeBall(r = 0.35) {
  const geo = new THREE.IcosahedronGeometry(r, 1).toNonIndexed();
  const cols = [];
  const n = geo.attributes.position.count / 3;
  for (let f = 0; f < n; f++) {
    const c = (f % 5 === 0) ? [0.08, 0.08, 0.1] : [0.95, 0.95, 0.95];
    for (let k = 0; k < 3; k++) cols.push(...c);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = mesh(geo, std(0xffffff, { vertexColors: true, flatShading: true, roughness: .5 }), scene);
  return m;
}
const ball = makeBall();

// ---------------------------------------------------------------- floodlights
function makeTower(h = 11) {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.16, 0.22, h, 8), std(0x8a90a0, { metalness: .4, roughness: .5 }), g, [0, h / 2, 0]);
  const head = mesh(new THREE.BoxGeometry(2.6, 1.6, 0.4), std(0x4a5060), g, [0, h + 0.4, 0]);
  const lamps = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const lm = new THREE.MeshStandardMaterial({ color: 0x999999, emissive: 0xfff6d8, emissiveIntensity: 0 });
    mesh(new THREE.CircleGeometry(0.3, 16), lm, g, [-0.85 + i * 0.85, h + 0.05 + j * 0.75, 0.21], false);
    lamps.push(lm);
  }
  // fake glow sprite
  const gc = document.createElement('canvas'); gc.width = gc.height = 128;
  const gg = gc.getContext('2d');
  const grd = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,250,225,1)'); grd.addColorStop(0.25, 'rgba(255,245,200,.55)'); grd.addColorStop(1, 'rgba(255,240,200,0)');
  gg.fillStyle = grd; gg.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  glow.scale.set(9, 9, 1);
  glow.position.set(0, h + 0.4, 0.6);
  g.add(glow);
  const spot = new THREE.SpotLight(0xfff4dc, 0, 70, 0.75, 0.6, 1.2);
  spot.position.set(0, h + 0.4, 0.5);
  g.add(spot);
  g.add(spot.target);
  scene.add(g);
  return { g, lamps, glow, spot, h,
    set(on) {
      lamps.forEach(l => (l.emissiveIntensity = 3.5 * on));
      glow.material.opacity = 0.9 * on;
      spot.intensity = 160 * on;
    } };
}
const towers = [[-PITCH_W / 2 - 2, PITCH_Z + 12], [PITCH_W / 2 + 2, PITCH_Z + 12], [-PITCH_W / 2 - 2, PITCH_Z - 18], [PITCH_W / 2 + 2, PITCH_Z - 18]]
  .map(([x, z]) => { const t = makeTower(12); t.g.position.set(x, 0, z); t.g.lookAt(0, 0, PITCH_Z); t.spot.target.position.set(0, -12, 18); return t; });
const heroTower = makeTower(10);
heroTower.g.position.set(0, 0, -6);
heroTower.spot.target.position.set(0, -10, 10);

// ---------------------------------------------------------------- the coach
const SKIN = 0xf2c9a0, RED = 0xd8272c, NAVY = 0x2c3c72;
const coach = new THREE.Group();
scene.add(coach);
const mSkin = std(SKIN, { roughness: .55 }), mRed = std(RED, { roughness: .6 }), mNavy = std(NAVY, { roughness: .7 });
const mDark = std(0x1a1418, { roughness: .4 }), mWhite = std(0xffffff, { roughness: .3 }), mBrown = std(0x3a2218, { roughness: .8 });

// legs + shoes
for (const sx of [-1, 1]) {
  mesh(new THREE.CapsuleGeometry(0.28, 0.6, 6, 12), mNavy, coach, [sx * 0.38, 0.62, 0]);
  const shoe = mesh(new THREE.SphereGeometry(0.34, 16, 12), mDark, coach, [sx * 0.4, 0.16, 0.12]);
  shoe.scale.set(1, 0.55, 1.4);
}
// body
const body = mesh(new THREE.SphereGeometry(1, 32, 24), mRed, coach, [0, 1.75, 0]);
body.scale.set(0.98, 0.95, 0.82);
mesh(new THREE.BoxGeometry(0.05, 1.4, 0.05), mWhite, coach, [0, 1.72, 0.81]);
for (const sx of [-1, 1]) {
  const s = mesh(new THREE.BoxGeometry(0.05, 1.3, 0.05), mWhite, coach, [sx * 0.55, 1.75, 0.66]);
  s.rotation.z = sx * 0.1; s.rotation.y = sx * 0.6;
}
const badge = mesh(new THREE.CircleGeometry(0.14, 20), std(0xeed79a), coach, [-0.38, 2.05, 0.74], false);
badge.rotation.y = -0.4;
mesh(new THREE.BoxGeometry(0.22, 0.06, 0.02), mDark, coach, [0.36, 2.0, 0.76], false).rotation.y = 0.4;
// collar
const collar = mesh(new THREE.TorusGeometry(0.45, 0.1, 10, 24), mRed, coach, [0, 2.55, 0]);
collar.rotation.x = Math.PI / 2;

// arms: shoulder pivot -> upper arm -> elbow pivot -> forearm + hand
const arms = {};
for (const sx of [-1, 1]) {
  const sh = new THREE.Group(); sh.position.set(sx * 0.82, 2.3, 0); coach.add(sh);
  mesh(new THREE.CapsuleGeometry(0.2, 0.45, 6, 12), mRed, sh, [0, -0.32, 0]);
  const el = new THREE.Group(); el.position.set(0, -0.68, 0); sh.add(el);
  mesh(new THREE.CapsuleGeometry(0.19, 0.4, 6, 12), mRed, el, [0, -0.28, 0]);
  mesh(new THREE.SphereGeometry(0.24, 16, 12), mSkin, el, [0, -0.66, 0]);
  arms[sx] = { sh, el };
}
// head
const head = new THREE.Group(); head.position.set(0, 3.55, 0); coach.add(head);
mesh(new THREE.SphereGeometry(1, 40, 30), mSkin, head);
for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(0.2, 16, 12), mSkin, head, [sx * 0.98, -0.05, 0]);
const cap = mesh(new THREE.SphereGeometry(1.06, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), std(NAVY, { roughness: .55 }), head, [0, 0.12, -0.02]);
cap.rotation.x = -0.12;
const brim = mesh(new THREE.TorusGeometry(1.03, 0.1, 10, 40), std(0x202a52), head, [0, 0.14, -0.02]);
brim.rotation.x = Math.PI / 2 - 0.12;
mesh(new THREE.SphereGeometry(0.13, 16, 12), std(0xd8272c), head, [0, 1.15, -0.15]);
const pupils = [];
for (const sx of [-1, 1]) {
  const e = mesh(new THREE.SphereGeometry(0.24, 24, 16), mWhite, head, [sx * 0.36, -0.2, 0.86], false);
  e.scale.set(1, 1.15, 0.55);
  const p = mesh(new THREE.SphereGeometry(0.13, 20, 14), mDark, head, [sx * 0.36, -0.22, 0.98], false);
  p.scale.set(1, 1.15, 0.5);
  mesh(new THREE.SphereGeometry(0.04, 10, 8), mWhite, head, [sx * 0.36 + 0.05, -0.15, 1.04], false);
  pupils.push(p);
}
const brows = {};
for (const sx of [-1, 1]) {
  const b = mesh(new THREE.CapsuleGeometry(0.05, 0.26, 4, 8), mBrown, head, [sx * 0.37, 0.05, 0.95], false);
  b.rotation.z = Math.PI / 2;
  brows[sx] = b;
}
const nose = mesh(new THREE.SphereGeometry(0.19, 20, 14), std(0xe9a985, { roughness: .5 }), head, [0, -0.44, 1.0], false);
for (const sx of [-1, 1]) {
  const m = mesh(new THREE.CapsuleGeometry(0.1, 0.32, 6, 10), mBrown, head, [sx * 0.21, -0.6, 0.9], false);
  m.rotation.z = Math.PI / 2 + sx * 0.3;
}
const mouth = mesh(new THREE.SphereGeometry(0.24, 24, 16), std(0x6e1a1e, { roughness: .9 }), head, [0, -0.8, 0.76], false);
const tongue = mesh(new THREE.SphereGeometry(0.13, 16, 12), std(0xd46a6a), head, [0, -0.86, 0.86], false);

const POSES = {
  // [shoulder rot z, shoulder rot x, elbow rot z, elbow rot x] for the right arm; left mirrors z
  idle: [0.15, 0, 0.1, 0],
  cheer: [2.6, 0, -0.5, 0],
  open: [1.0, -0.2, 0.3, 0],
  point: [1.35, -0.9, 0.1, -0.2],
  head: [2.3, -0.4, 1.9, 0],
  wave: [2.5, 0, 0.6, 0],
};
function setCoach(pose, t, open, mood) {
  const wig = Math.sin(t * 12) * 0.12;
  for (const sx of [-1, 1]) {
    let p = POSES[pose];
    if (pose === 'wave' && sx === -1) p = POSES.idle;
    if (pose === 'point' && sx === -1) p = POSES.idle;
    const w = (pose === 'cheer' || pose === 'wave') ? wig * (sx === 1 ? 1 : -1) : (pose === 'open' ? wig * 0.4 : 0);
    arms[sx].sh.rotation.set(p[1], 0, sx * (p[0] + w));
    arms[sx].el.rotation.set(p[3], 0, sx * (p[2] + (pose === 'wave' && sx === 1 ? Math.sin(t * 10) * 0.4 : 0)));
  }
  const o = Math.min(1, open * 1.3);
  mouth.scale.set(1.15, 0.12 + o * 0.9, 0.5);
  mouth.position.y = -0.79 - o * 0.06;
  tongue.visible = o > 0.25;
  tongue.position.y = -0.83 - o * 0.12;
  const worried = mood === 'worried';
  for (const sx of [-1, 1]) {
    brows[sx].rotation.z = Math.PI / 2 + sx * (worried ? -0.35 : -0.1);
    brows[sx].position.y = worried ? 0.07 : 0.05;
  }
  head.rotation.z = Math.sin(t * 2.1) * 0.05;
  head.rotation.x = -0.05 + Math.sin(t * 3.3) * 0.03 - (worried ? -0.08 : 0);
  coach.position.y = Math.abs(Math.sin(t * 7)) * 0.03;
}

// ================================================================ Parte 4 additions
// far goal (the one nearest the camera side, +z), used in the match shots
const goalFar = makeGoal();
goalFar.position.set(0, 0, PITCH_Z + PITCH_L / 2 - 0.5);
goalFar.rotation.y = Math.PI;
const GOAL_A = PITCH_Z - PITCH_L / 2 + 0.5; // z of goalNear (we score here)
const GOAL_B = PITCH_Z + PITCH_L / 2 - 0.5; // z of goalFar (they shoot here)

function labelTex(text, bg, fg, w = 512, h = 128) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.font = `bold ${h * 0.6}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- locker rooms (vestidores)
const lockers = new THREE.Group();
lockers.position.set(-PITCH_W / 2 - 10, 0, PITCH_Z + 22);
lockers.rotation.y = Math.PI / 2 - 0.25;
scene.add(lockers);
{
  const wall = flat(0xf3e6c8), roof = flat(0xd8272c), trim = flat(0x2c3c72);
  const b = mesh(new THREE.BoxGeometry(12, 4.2, 6), wall, lockers, [0, 2.1, 0]);
  mesh(new THREE.BoxGeometry(13, 0.6, 7), roof, lockers, [0, 4.5, 0]);
  const r2 = mesh(new THREE.CylinderGeometry(0, 4.8, 1.6, 4, 1), roof, lockers, [0, 5.6, 0]);
  r2.rotation.y = Math.PI / 4; r2.scale.set(1.35, 1, 0.7);
  mesh(new THREE.BoxGeometry(2, 3, 0.2), trim, lockers, [-3, 1.5, 3.02]);
  mesh(new THREE.BoxGeometry(2, 3, 0.2), trim, lockers, [3, 1.5, 3.02]);
  for (const x of [-3, 3]) mesh(new THREE.SphereGeometry(0.12, 8, 6), flat(0xeed79a), lockers, [x + 0.6, 1.5, 3.15], false);
  for (const x of [-5, 0, 5]) mesh(new THREE.BoxGeometry(1.4, 1, 0.15), flat(0x9fd3ff, { emissive: 0x335577 }), lockers, [x, 3.1, 3.02], false);
  const sign = mesh(new THREE.PlaneGeometry(7, 1.3), new THREE.MeshBasicMaterial({ map: labelTex('VESTIDORES', '#1e2646', '#ffd640', 1024, 190) }), lockers, [0, 4.0, 3.12], false);
  b.castShadow = true;
}

// ---------------------------------------------------------------- stands (gradas) with fans
const stands = new THREE.Group();
stands.position.set(PITCH_W / 2 + 4, 0, PITCH_Z + 6);
stands.rotation.y = -Math.PI / 2;
scene.add(stands);
const fans = [];
{
  const conc = flat(0xb8bcc8), seatC = [flat(0xd8272c), flat(0xf2f2f2)];
  for (let r = 0; r < 5; r++) {
    mesh(new THREE.BoxGeometry(26, 0.8 * (r + 1), 1.6), conc, stands, [0, 0.4 * (r + 1), -r * 1.6]);
    mesh(new THREE.BoxGeometry(26, 0.18, 0.5), seatC[r % 2], stands, [0, 0.8 * (r + 1) + 0.1, -r * 1.6 + 0.3], false);
  }
  const roofM = flat(0x2c3c72);
  mesh(new THREE.BoxGeometry(27, 0.3, 9), roofM, stands, [0, 7.4, -3.4]);
  for (const x of [-12.5, 0, 12.5]) mesh(new THREE.CylinderGeometry(0.15, 0.15, 7.4, 6), roofM, stands, [x, 3.7, -7.6]);
  const shirtCols = [0xd8272c, 0xd8272c, 0xffd640, 0xf2f2f2, 0x2c3c72, 0xd8272c];
  const skinCols = [0xf2c9a0, 0xd9a77c, 0xa8744e, 0xf5d5b5];
  for (let r = 0; r < 5; r++) for (let i = 0; i < 16; i++) {
    if (rnd() < 0.18) continue;
    const g = new THREE.Group();
    g.position.set(-12 + i * 1.6 + (rnd() - .5) * 0.4, 0.8 * (r + 1) + 0.2, -r * 1.6 + 0.1);
    mesh(new THREE.CapsuleGeometry(0.32, 0.4, 4, 8), flat(shirtCols[Math.floor(rnd() * shirtCols.length)]), g, [0, 0.45, 0]);
    mesh(new THREE.SphereGeometry(0.3, 12, 10), std(skinCols[Math.floor(rnd() * skinCols.length)]), g, [0, 1.15, 0]);
    stands.add(g);
    fans.push({ g, ph: rnd() * 6, y: g.position.y, r, i });
  }
  const banner = mesh(new THREE.PlaneGeometry(10, 1.2), new THREE.MeshBasicMaterial({ map: labelTex('FC STUAT', '#d8272c', '#ffffff', 1024, 128) }), stands, [0, 0.9, 1.0], false);
}

// ---------------------------------------------------------------- mini players
function makeMini(shirt, shorts, num) {
  const g = new THREE.Group();
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(sx * 0.2, 0.75, 0); g.add(hip);
    mesh(new THREE.CapsuleGeometry(0.14, 0.4, 4, 8), std(shorts), hip, [0, -0.3, 0]);
    const shoe = mesh(new THREE.SphereGeometry(0.17, 10, 8), mDark, hip, [0, -0.62, 0.08]);
    shoe.scale.set(1, 0.6, 1.4);
    legs.push(hip);
  }
  mesh(new THREE.SphereGeometry(0.55, 18, 14), std(shirt, { roughness: .6 }), g, [0, 1.25, 0]).scale.set(1, 1.05, 0.85);
  const arms2 = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.5, 1.5, 0); g.add(sh);
    mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), std(shirt), sh, [0, -0.25, 0]);
    mesh(new THREE.SphereGeometry(0.13, 10, 8), mSkin, sh, [0, -0.52, 0]);
    sh.rotation.z = sx * 0.25;
    arms2.push(sh);
  }
  const hd = new THREE.Group(); hd.position.set(0, 2.15, 0); g.add(hd);
  mesh(new THREE.SphereGeometry(0.52, 20, 16), mSkin, hd);
  for (const sx of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.1, 10, 8), mWhite, hd, [sx * 0.18, 0.02, 0.45], false).scale.set(1, 1.2, 0.6);
    mesh(new THREE.SphereGeometry(0.06, 8, 6), mDark, hd, [sx * 0.18, 0.0, 0.5], false);
  }
  mesh(new THREE.SphereGeometry(0.53, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), mBrown, hd, [0, 0.06, -0.03]);
  if (num) {
    const n = mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: labelTex(String(num), '#00000000', '#ffffff', 128, 128), transparent: true }), g, [0, 1.35, -0.48], false);
    n.rotation.y = Math.PI;
  }
  scene.add(g);
  return { g, legs, arms: arms2, hd,
    pose(t, run = 0, cheer = 0, ph = 0) {
      const s = Math.sin(t * 14 + ph) * 0.8 * run;
      legs[0].rotation.x = s; legs[1].rotation.x = -s;
      for (let i = 0; i < 2; i++) {
        const sx = i ? 1 : -1;
        arms2[i].rotation.x = -s * (i ? 1 : -1) * 0.8;
        arms2[i].rotation.z = sx * (0.25 + cheer * (2.4 + Math.sin(t * 12 + ph) * 0.2));
      }
      g.position.y = run ? Math.abs(Math.sin(t * 14 + ph)) * 0.12 * run : 0;
      if (cheer) g.position.y += Math.abs(Math.sin(t * 6 + ph)) * 0.6 * cheer;
    } };
}
const RED_T = [], GREY_T = [];
for (let i = 0; i < 11; i++) RED_T.push(makeMini(i === 0 ? 0xffd640 : 0xd8272c, i === 0 ? 0x1a1418 : 0xf2f2f2, i + 1));
for (let i = 0; i < 11; i++) GREY_T.push(makeMini(i === 0 ? 0x2fa860 : 0xf28fb0, 0x2f6b3a, i + 1)); // FC Lombrises: pink + green
const minis = [...RED_T, ...GREY_T];
// name tags of the 11 winners of Part 2, above the heads of shirts #1..#11
const TAG_NAMES = ['@DavidAlarcon-k6c', '@CarlosalejandroDominguez-h3t', '@Jose-g8h5z', '@lucilarivera3502',
  '@irmaguadalupe|castellanosar5763', '@Mikeandike2023', '@ValentinoTellecheao', '@AlejandoSantay',
  '@saulayuquearaujo5998', '@DylanalexanderCortes-k2d', '@CarlosMalagueño-w8s'];
function splitName(n) {
  if (n.includes('|')) return n.split('|');
  if (n.length <= 15) return [n];
  let best = Math.ceil(n.length / 2), bm = 1e9;
  for (let i = 4; i < n.length - 3; i++) {
    const c = n[i], prev = n[i - 1];
    const natural = c === '-' || (/[A-Z]/.test(c) && /[a-z]/.test(prev)) || (/[0-9]/.test(c) && !/[0-9]/.test(prev));
    const score = Math.max(i, n.length - i) - (natural ? 7 : 0);
    if (score < bm) { bm = score; best = i; }
  }
  return [n.slice(0, best), n.slice(best)];
}
const tags = TAG_NAMES.map((name, i) => {
  const lines = splitName(name);
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const fs = 62, lh = 70;
  g.font = `${fs}px Lilita`;
  const tw = Math.max(...lines.map(l => g.measureText(l).width));
  const w = Math.ceil(tw) + 140, h = lines.length * lh + 34;
  c.width = w; c.height = h + 26;
  g.font = `${fs}px Lilita`;
  g.fillStyle = 'rgba(20,24,40,0.93)'; g.strokeStyle = '#ffffff'; g.lineWidth = 7;
  g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 28); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(w / 2 - 22, h - 6); g.lineTo(w / 2 + 22, h - 6); g.lineTo(w / 2, h + 20); g.closePath();
  g.fillStyle = '#ffffff'; g.fill();
  g.fillStyle = '#d8272c'; g.beginPath(); g.roundRect(16, 16, 80, h - 32, 18); g.fill();
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(i + 1), 56, h / 2 + 3);
  g.fillStyle = '#ffd640'; g.textAlign = 'center';
  lines.forEach((l, k) => g.fillText(l, 106 + tw / 2 + 4, 17 + lh / 2 + k * lh + 4));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, fog: false }));
  sp.center.set(0.5, 0);
  sp.renderOrder = 10;
  sp.userData.aspect = c.width / c.height;
  sp.userData.rows = lines.length;
  sp.visible = false;
  scene.add(sp);
  return sp;
});
// tagCfg: null = hidden; {px: tag height on screen (of 1920), only: shirt indexes to show}
let tagCfg = null;
const _v = new THREE.Vector3();
function updateTags() {
  tags.forEach((sp, i) => {
    const p = RED_T[i];
    if (!tagCfg || !p.g.visible || (tagCfg.only && !tagCfg.only.includes(i))) { sp.visible = false; return; }
    const sc = p.g.scale.x;
    if (sc < 0.3) { sp.visible = false; return; }
    sp.visible = true;
    sp.position.set(p.g.position.x, p.g.position.y + 2.8 * sc, p.g.position.z);
    const dist = _v.copy(sp.position).sub(camera.position).length();
    const pop = Math.min(1, sc / (tagCfg.full || sc));
    const h = pop * (tagCfg.px * (sp.userData.rows === 1 ? 0.62 : 1)) / 1920 * 2 * dist * Math.tan(camera.fov * Math.PI / 360);
    sp.scale.set(h * sp.userData.aspect, h, 1);
  });
}
// 4-3-3 in "board" units (x -1..1 across, y 0 own goal .. 1 halfway)
const F433 = [[0, 0.03], [-0.75, 0.3], [-0.27, 0.24], [0.27, 0.24], [0.75, 0.3], [-0.5, 0.55], [0, 0.5], [0.5, 0.55], [-0.7, 0.85], [0, 0.9], [0.7, 0.85]];

// ---------------------------------------------------------------- environment presets
const ENVS = {
  dusk: { top: 0x5e3f96, bottom: 0xf59670, fog: 0xe89a86, hemi: [0xffe2c8, 0x40603a, 1.1], sun: [0xffd2a8, 2.6], stars: false, lights: 0 },
  night_dark: { top: 0x080c26, bottom: 0x283a78, fog: 0x1c2852, hemi: [0x7080b0, 0x203020, 0.45], sun: [0x9aa8ff, 0.4], stars: true, lights: 0, fill: 0.8 },
  night: { top: 0x080c26, bottom: 0x283a78, fog: 0x1c2852, hemi: [0x8090c0, 0x203020, 0.6], sun: [0x9aa8ff, 0.5], stars: true, lights: 1, fill: 1.6 },
};
function setEnv(name) {
  const e = ENVS[name];
  skyMat.uniforms.top.value.set(e.top);
  skyMat.uniforms.bottom.value.set(e.bottom);
  scene.fog.color.set(e.fog);
  hemi.color.set(e.hemi[0]); hemi.groundColor.set(e.hemi[1]); hemi.intensity = e.hemi[2];
  sun.color.set(e.sun[0]); sun.intensity = e.sun[1];
  stars.visible = e.stars;
  fill.intensity = e.fill || 0;
  towers.forEach(t => t.set(e.lights));
}

// ---------------------------------------------------------------- scenes
const clamp01 = x => Math.min(Math.max(x, 0), 1);
const easeOut = x => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = x => { x = clamp01(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeBack = x => { x = clamp01(x); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); };
const mouthAt = t => ENV[Math.floor(t * FPS)] || 0;
const lerp = (a, b, k) => a + (b - a) * k;
function cam(px, py, pz, lx, ly, lz, fov = 38) {
  camera.position.set(px, py, pz);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(lx, ly, lz);
}
function hideMinis() { minis.forEach(m => { m.g.visible = false; m.g.rotation.set(0, 0, 0); m.g.scale.setScalar(1); m.pose(0); }); }
function place(m, x, z, face) { m.g.visible = true; m.g.position.x = x; m.g.position.z = z; m.g.rotation.y = face; }
// team formation on the real pitch. red attacks -z (towards GOAL_A), grey attacks +z.
function formation(team, red, push = 0) {
  team.forEach((m, i) => {
    const [fx, fy] = F433[i];
    const own = red ? GOAL_B : GOAL_A, dir = red ? -1 : 1;
    place(m, fx * PITCH_W * 0.38, own + dir * (fy * (PITCH_L / 2 - 2) + push * (i ? 1 : 0.1)), red ? Math.PI : 0);
  });
}

// ================================================================ Parte 4: stadium without fans, new fans, mystery mascot
fans.forEach((f, i) => { f.ord = (i * 37) % fans.length; });
const SX = stands.position.x, SZ = stands.position.z;
const hero = fans.find(f => f.r === 1 && f.i === 8) || fans[Math.floor(fans.length / 2)];
const halo = mesh(new THREE.TorusGeometry(0.62, 0.07, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd640 }), hero.g, [0, 0.05, 0], false);
halo.rotation.x = Math.PI / 2;
const youTag = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('TÚ', '#d8272c', '#ffffff', 256, 128), depthTest: false, depthWrite: false, fog: false }));
youTag.renderOrder = 10; scene.add(youTag);

// tumbleweed rolling through the empty stadium
const tumble = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const r = mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 18), flat(0x9a7a45), tumble, [0, 0, 0], false);
  r.rotation.set(i * 1.05, i * 0.7, i * 0.4);
}
scene.add(tumble);

// mystery mascot: black silhouette on a pedestal under a spotlight
const mascot = new THREE.Group(); scene.add(mascot);
{
  const blk = new THREE.MeshBasicMaterial({ color: 0x05050b }), wht = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const add = (geo, mat, pos, sc) => { const x = new THREE.Mesh(geo, mat); x.position.set(...pos); if (sc) x.scale.set(...sc); mascot.add(x); return x; };
  add(new THREE.SphereGeometry(1.15, 24, 18), blk, [0, 2.0, 0], [1, 1.15, 0.9]);
  add(new THREE.SphereGeometry(0.95, 24, 18), blk, [0, 3.75, 0]);
  add(new THREE.SphereGeometry(0.4, 14, 10), blk, [0, 3.5, 0.85], [1.2, 0.8, 0.8]);
  add(new THREE.SphereGeometry(0.35, 12, 10), blk, [0, 1.3, -1.1]);
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.38, 14, 10), blk, [sx * 0.7, 4.55, 0]);
    add(new THREE.CapsuleGeometry(0.25, 0.9, 4, 10), blk, [sx * 1.35, 2.3, 0]).rotation.z = sx * 0.6;
    add(new THREE.CapsuleGeometry(0.3, 0.6, 4, 10), blk, [sx * 0.55, 0.6, 0]);
    add(new THREE.SphereGeometry(0.17, 12, 10), wht, [sx * 0.36, 3.95, 0.8], [1, 1.2, 0.6]);
  }
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#ffd640'; g.font = '210px Lilita'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 128, 138);
  const q = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  q.position.set(0, 2.1, 1.12); mascot.add(q);
}
const pedestal = mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.5, 32), std(0x3a4060, { roughness: .4 }), scene, [0, 0.25, -2]);
const mSpot = new THREE.SpotLight(0xfff4dc, 0, 60, 0.5, 0.5, 1);
mSpot.position.set(0, 18, 4); mSpot.target.position.set(0, 0, -2); scene.add(mSpot, mSpot.target);
const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 4.2, 18, 32, 1, true),
  new THREE.MeshBasicMaterial({ color: 0xfff4dc, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
beam.position.set(0, 9, -2); scene.add(beam);

// fans: mode none | pop (they appear one by one, spread over popDur seconds) | all
// ================================================================ Parte 5: 600 fans, the teddy-bear mascot, the cup, 0-5 vs FC Lombrises
// fans' shirts can turn into the rival's colours ("su estadio")
fans.forEach(f => { f.shirt = f.g.children[0].material; f.col = f.shirt.color.clone(); });
const PINK = new THREE.Color(0xf28fb0), LGREEN = new THREE.Color(0x3f9a4a);
function fansColors(rival) {
  fans.forEach((f, i) => f.shirt.color.copy(rival ? (i % 3 ? PINK : LGREEN) : f.col));
}

// the teddy bear (osito) mascot, suggested by @MATEOPEREZO7
const bear = new THREE.Group(); scene.add(bear);
{
  const fur = std(0x9a6233, { roughness: .95 }), lite = std(0xe8c39a, { roughness: .85 }), dark = std(0x2a1810, { roughness: .3 });
  const pink = std(0xf0a0a8), red = std(0xd8272c, { roughness: .6 }), wh = std(0xffffff, { roughness: .2 });
  const add = (geo, mat, pos, sc, rot) => { const x = mesh(geo, mat, bear, pos); if (sc) x.scale.set(...sc); if (rot) x.rotation.set(...rot); return x; };
  add(new THREE.SphereGeometry(1.15, 28, 20), fur, [0, 2.0, 0], [1, 1.1, 0.9]);
  add(new THREE.SphereGeometry(0.8, 24, 16), lite, [0, 1.9, 0.55], [1, 1.1, 0.5]);
  add(new THREE.SphereGeometry(0.95, 28, 20), fur, [0, 3.75, 0]);
  add(new THREE.SphereGeometry(0.42, 20, 14), lite, [0, 3.5, 0.82], [1.2, 0.85, 0.8]);
  add(new THREE.SphereGeometry(0.14, 12, 10), dark, [0, 3.64, 1.15], [1.3, 1, 1]);
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.12, 12, 10), dark, [sx * 0.33, 3.98, 0.84]);
    add(new THREE.SphereGeometry(0.04, 8, 6), wh, [sx * 0.33 + 0.04, 4.03, 0.95]);
    add(new THREE.SphereGeometry(0.36, 16, 12), fur, [sx * 0.7, 4.5, 0]);
    add(new THREE.SphereGeometry(0.2, 12, 10), pink, [sx * 0.7, 4.5, 0.22], [1, 1, 0.4]);
    add(new THREE.CapsuleGeometry(0.28, 0.8, 6, 12), fur, [sx * 1.25, 2.3, 0.1], null, [0, 0, sx * 0.6]);
    add(new THREE.CapsuleGeometry(0.32, 0.5, 6, 12), fur, [sx * 0.55, 0.65, 0.1]);
    add(new THREE.SphereGeometry(0.22, 12, 10), lite, [sx * 0.55, 0.38, 0.45], [1, 1, 0.4]);
  }
  add(new THREE.TorusGeometry(0.62, 0.16, 10, 24), red, [0, 3.0, 0], null, [Math.PI / 2, 0, 0]);
  add(new THREE.BoxGeometry(0.32, 0.8, 0.1), red, [0.35, 2.55, 0.78], null, [0, 0, 0.15]);
}

// the cup
const trophy = new THREE.Group(); scene.add(trophy);
{
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 0.35, roughness: 0.3, emissive: 0x4a2c00 });
  const wood = std(0x3a2418, { roughness: .6 });
  mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.6, 24), wood, trophy, [0, 0.3, 0]);
  mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.0, 16), gold, trophy, [0, 1.1, 0]);
  mesh(new THREE.SphereGeometry(0.36, 16, 12), gold, trophy, [0, 1.65, 0]);
  const prof = [[0.25, 0], [0.75, 0.25], [1.05, 0.8], [1.15, 1.5], [1.18, 1.62]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(new THREE.LatheGeometry(prof, 32), new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 0.35, roughness: 0.3, emissive: 0x4a2c00, side: THREE.DoubleSide }), trophy, [0, 1.85, 0]);
  for (const sx of [-1, 1]) mesh(new THREE.TorusGeometry(0.42, 0.09, 10, 24), gold, trophy, [sx * 1.25, 2.8, 0]);
  const plate = mesh(new THREE.PlaneGeometry(1.2, 0.35), new THREE.MeshBasicMaterial({ map: labelTex('COPA', '#ffd640', '#1e2646', 256, 80) }), trophy, [0, 0.32, 1.12], false);
}

function fansShow(mode, lt, t, amp = 1) {
  fans.forEach(f => {
    const s = mode === 'none' ? 0 : 1;
    f.g.visible = s > 0;
    f.g.scale.setScalar(1);
    f.g.position.y = f.y + Math.abs(Math.sin(t * 9 + f.ph)) * 0.5 * amp;
  });
}
const _w = new THREE.Vector3();
// the five goals: absolute times come from the voice ("uno... dos... tres... cuatro... ¡cinco!")
// ================================================================ Parte 6: the second leg at FC Lombrises' stadium
const MK = cfg.marks;
const G4 = MK.g4 || [], TWO = MK.two || [], DESC = MK.desc ?? 1e9, GOL = MK.gol ?? 1e9;
const SCORERS4 = [8, 9, 10, 6], SCORERS2 = [5, 10]; // RED_T indexes (shirt # = index + 1)

// a shot into the net: ball from (x0, z0) to (gx, net z) arriving at g; returns true once it is in
function shotAt(t, g, x0, z0, gx, netZ, dir) {
  const q = clamp01((t - (g - 0.45)) / 0.45);
  let bx = lerp(x0, gx, q), bz = lerp(z0, netZ, q), by = 0.35 + Math.sin(q * Math.PI) * 1.8 + q * 0.5;
  if (q >= 1) { bz = netZ + dir * 0.5; by = 0.35; }
  ball.position.set(bx, by, bz);
  ball.rotation.set(t * 8, t * 5, 0);
  return q;
}
function diveKeeper(keeper, gx, q, z) {
  const kx = -Math.sign(gx) * 2.2 * easeOut((q - 0.3) / 0.5); // dives the wrong way
  keeper.g.position.x = kx;
  keeper.g.position.z = z;
  keeper.g.rotation.z = -Math.sign(kx) * Math.min(1, Math.abs(kx) / 2.2) * 1.1;
  keeper.g.position.y = Math.abs(kx) > 0.5 ? 0.5 : 0;
}
// we attack GOAL_A, one clean shot per goal: the scorer from behind (name over his head), the keeper, two defenders
const SHOT_X = [-1.5, 1.5, 0, -1, 1, 0], SHOT_GX = [2.6, -2.4, 1.2, -2.8, 0.6, -1.5];
function weAttack(t, times, scorers) {
  ball.visible = true;
  let cur = 0;
  times.forEach((g, s) => { if (t >= g - 0.6) cur = s; });
  const g = times[cur], x0 = SHOT_X[cur % 6], z0 = GOAL_A + 13, gx = SHOT_GX[cur % 6];
  const sh = RED_T[scorers[cur]];
  place(sh, x0 - 0.3, z0 + 1, Math.PI);
  sh.g.scale.setScalar(1.3);
  sh.pose(t, t < g - 0.45 ? 1 : 0, t > g + 0.1 ? 1 : 0, 0);
  const keeper = GREY_T[0];
  place(keeper, 0, GOAL_A + 1.2, 0); keeper.g.scale.setScalar(1.3); keeper.pose(t, 0, 0, 0);
  [1, 2].forEach((j, n) => { const d = GREY_T[j]; place(d, (n ? 3.2 : -3.2) + Math.sin(t * 2 + j) * 0.4, GOAL_A + 6, 0); d.g.scale.setScalar(1.3); d.pose(t, 0.5, 0, j); });
  let q = 0;
  if (t < g - 0.45) { ball.position.set(x0, 0.35, z0 - 0.4); ball.rotation.set(t * 8, 0, 0); }
  else q = shotAt(t, g, x0, z0 - 0.4, gx, GOAL_A - 0.9, -1);
  diveKeeper(keeper, gx, q, GOAL_A + 1.2);
  tagCfg = { px: 120, only: [scorers[cur]] };
  cam(x0 - 1.0, 4.4, z0 + 10, gx * 0.3, 1.4, GOAL_A, 42);
  return cur;
}

function shot(name, lt, dur, t) {
  const k = lt / Math.max(dur, 0.1);
  coach.visible = true;
  coach.position.set(0, 0, 0);
  coach.rotation.set(0, 0, 0);
  heroTower.g.visible = false;
  heroTower.set(0);
  dirt.visible = false;
  ball.visible = false;
  hideMinis();
  tagCfg = null;
  tumble.visible = false; mascot.visible = false; pedestal.visible = false; bear.visible = false; trophy.visible = false;
  mSpot.intensity = 0; beam.material.opacity = 0; halo.visible = false; youTag.visible = false;
  fansColors(false);
  fansShow('all', lt, t, 1);
  const m = mouthAt(t);
  const coachAtStands = (pose, mood, dx = 9) => {
    coach.position.set(SX - dx, 0, SZ - 2.0);
    coach.rotation.y = -Math.PI / 2 + 0.15;
    setCoach(pose, t, m, mood);
  };
  const standsCam = (push = 2.5) => cam(SX - 22 + push * k, 4.0, SZ, SX + 3, 4.4, SZ, 52);

  switch (name) {
    case 'hook': { // at FC Lombrises' stadium (pink stands), "necesitamos SEIS"
      setEnv('night');
      fansColors(true);
      fansShow('all', lt, t, 1.3);
      coachAtStands('point', 'happy');
      standsCam();
      break;
    }
    case 'lineup': {
      tagCfg = { px: 100, full: 2.4 };
      setEnv('night');
      coach.visible = false;
      const ROWS = [[0], [1, 2, 3], [4, 5, 6], [7, 8], [9, 10]], RZ = [24, 13, 2, -9, -20], RX = { 1: [0], 2: [-6, 6], 3: [-8.6, 0, 8.6] };
      ROWS.forEach((row, r) => row.forEach((i, j) => {
        const p = RED_T[i];
        place(p, RX[row.length][j], PITCH_Z + RZ[r], 0);
        p.g.scale.setScalar(Math.max(0.001, easeBack((lt - 0.05 - i * 0.05) / 0.3)) * 2.4);
        p.pose(t, 0, 0, i);
      }));
      cam(0, 34, PITCH_Z + 50, 0, 0, PITCH_Z + 1, 52);
      break;
    }
    case 'goals4': case 'two': {
      setEnv('night');
      coach.visible = false;
      weAttack(t, name === 'goals4' ? G4 : TWO, name === 'goals4' ? SCORERS4 : SCORERS2);
      break;
    }
    case 'desc': { // they pull one back in our goal
      setEnv('night');
      coach.visible = false;
      ball.visible = true;
      formation(RED_T, true, -6);
      formation(GREY_T, false, 26);
      minis.forEach((p, i) => { p.g.scale.setScalar(1.3); p.pose(t, 0.6, 0, i); p.g.position.x += Math.sin(t * 1.3 + i) * 0.8; });
      const keeper = RED_T[0], gx = 2.4, x0 = -4, z0 = GOAL_B - 14;
      const sh = GREY_T[9];
      sh.g.position.set(x0, 0, z0 - 1); sh.g.rotation.y = 0;
      if (t > DESC + 0.1) sh.pose(t, 0, 1, 0);
      const q = shotAt(t, DESC, x0, z0, gx, GOAL_B + 0.9, 1);
      diveKeeper(keeper, gx, q, GOAL_B - 1.2);
      cam(2.5, 5, GOAL_B + 9, -1, 1.4, GOAL_B - 8, 50);
      break;
    }
    case 'tension': { // "quedan tres minutos"
      setEnv('night');
      fansColors(true);
      fansShow('all', lt, t, 0.6);
      coachAtStands('head', 'worried');
      standsCam(4);
      break;
    }
    case 'pens': case 'dylan': { // penalties: our #10 takes the last one
      setEnv('night');
      coach.visible = false;
      ball.visible = true;
      const keeper = GREY_T[0], spotZ = GOAL_A + 11;
      place(keeper, 0, GOAL_A + 0.6, 0);
      keeper.g.scale.setScalar(1.3);
      keeper.pose(t, 0, 0, 0);
      const dy = RED_T[9];
      dy.g.scale.setScalar(1.3);
      tagCfg = { px: 130, only: [9] };
      if (name === 'pens') {
        place(dy, -1.6, spotZ + 3.2, Math.PI);
        dy.pose(t, 0, 0, 0);
        keeper.g.position.x = Math.sin(t * 3) * 0.8;
        ball.position.set(0, 0.35, spotZ);
        cam(-0.9, 4.4, spotZ + 13 - 1.5 * k, 0, 1.6, GOAL_A, 40);
      } else {
        const kick = GOL - 0.45, run = clamp01((t - (kick - 0.9)) / 0.9);
        place(dy, lerp(-1.6, -0.4, run), lerp(spotZ + 3.2, spotZ + 0.7, run), Math.PI);
        dy.pose(t, t < kick ? run : 0, t > GOL + 0.1 ? 1 : 0, 0);
        if (t < kick) { ball.position.set(0, 0.35, spotZ); keeper.g.position.x = Math.sin(t * 3) * 0.6; }
        else { const q = shotAt(t, GOL, 0, spotZ, -2.6, GOAL_A - 0.9, -1); diveKeeper(keeper, -2.6, q, GOAL_A + 0.6); }
        if (t > GOL + 0.2) RED_T.forEach((p, i) => { if (i !== 9) { place(p, -6 + (i % 5) * 3, spotZ - 3 - Math.floor(i / 5) * 2, 0); p.g.scale.setScalar(1.3); p.pose(t, 0, 1, i); } });
        cam(-0.9, 4.4, spotZ + 11.5 - 1.5 * k, 0, 1.6, GOAL_A, 40);
      }
      break;
    }
    case 'money': {
      setEnv('night');
      fansShow('all', lt, t, 1);
      coachAtStands('open', 'worried');
      standsCam();
      break;
    }
    case 'cta': {
      setEnv('night');
      fansShow('all', lt, t, 1.6);
      coachAtStands(k < 0.5 ? 'point' : 'wave', 'happy');
      standsCam();
      break;
    }
  }
}

window.renderAt = (t) => {
  let s = cfg.scenes[cfg.scenes.length - 1];
  for (const sc of cfg.scenes) if (t >= sc.s0 && t < sc.s1) { s = sc; break; }
  shot(s.name, t - s.s0, s.s1 - s.s0, t);
  updateTags();
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/jpeg', 0.93);
};
window.ready = true;
