// 3D world for "Mi nuevo club — Parte 2": low-poly club pitch + the coach.
// Exposes window.renderAt(t) -> JPEG data URL. Scene timing comes from scenes.json,
// mouth opening from env.json (voice loudness per frame at 30 fps).
import * as THREE from './three.module.js';

const W = 1080, H = 1920, FPS = 30;
const cfg = await (await fetch('scenes.json')).json();
const ENV = await (await fetch('env.json')).json();

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

// ---------------------------------------------------------------- environment presets
const ENVS = {
  dusk: { top: 0x5e3f96, bottom: 0xf59670, fog: 0xe89a86, hemi: [0xffe2c8, 0x40603a, 1.1], sun: [0xffd2a8, 2.6], stars: false, lights: 0 },
  night: { top: 0x080c26, bottom: 0x283a78, fog: 0x1c2852, hemi: [0x8090c0, 0x203020, 0.55], sun: [0x9aa8ff, 0.5], stars: true, lights: 1, fill: 1.6 },
  night_dark: { top: 0x080c26, bottom: 0x283a78, fog: 0x1c2852, hemi: [0x7080b0, 0x203020, 0.45], sun: [0x9aa8ff, 0.4], stars: true, lights: 0, fill: 0.8 },
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
const easeOut = x => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
const easeBack = x => { x = Math.min(Math.max(x, 0), 1); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); };
const mouthAt = t => ENV[Math.floor(t * FPS)] || 0;
function cam(px, py, pz, lx, ly, lz, fov = 38) {
  camera.position.set(px, py, pz);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(lx, ly, lz);
}

function shot(name, lt, dur, t) {
  const k = lt / Math.max(dur, 0.1); // 0..1 through the scene
  coach.visible = true;
  coach.position.set(0, 0, 0);
  coach.rotation.set(0, 0, 0);
  goalNear.position.set(0, 0, PITCH_Z - PITCH_L / 2 + 0.5);
  dirtPivot.scale.x = 0.0001;
  dirt.visible = false;
  heroTower.g.visible = false;
  heroTower.set(0);
  ball.visible = true;
  ball.position.set(1.6, 0.35, 1.2);
  ball.rotation.set(0, t, 0);
  const m = mouthAt(t);

  switch (name) {
    case 'hook': {
      setEnv('dusk');
      setCoach('cheer', t, m, 'happy');
      coach.position.y = Math.abs(Math.sin(lt * 5)) * 0.35;
      ball.visible = false;
      cam(0, 3.2, 10.0 - 0.6 * k, 0, 3.0, 0, 40);
      break;
    }
    case 'goal': {
      setEnv('dusk');
      coach.visible = false;
      goalNear.position.set(0, 6 * (1 - easeBack(lt / 0.45)), -4);
      ball.position.set(0.4, 0.35 + Math.abs(Math.sin(lt * 6)) * 0.9, 1.5);
      ball.rotation.set(lt * 4, lt * 3, 0);
      cam(2.2 - 1.0 * k, 2.6, 13, 0, 3.0, -4, 40);
      break;
    }
    case 'grass': {
      setEnv('dusk');
      coach.visible = false;
      dirt.visible = true;
      dirtPivot.scale.x = Math.max(0.0001, 1 - easeOut(lt / 0.8));
      ball.visible = false;
      cam(0, 15 - 1.5 * k, 8, 0, 0, PITCH_Z + 4, 42);
      break;
    }
    case 'lights': {
      setEnv('night_dark');
      coach.visible = false;
      heroTower.g.visible = true;
      const on = Math.min(1, Math.max(0, (lt - 0.25) / 0.15));
      heroTower.set(on);
      ball.position.set(0.8, 0.35, 0.5);
      cam(0, 1.4, 11 - k, 0, 8.6, -6, 46);
      break;
    }
    case 'short': {
      setEnv('dusk');
      const news = lt > 0.85;
      setCoach(news ? 'head' : 'open', t, m, news ? 'worried' : 'happy');
      cam(0, 3.2, 12.0 - (news ? 1.2 * easeOut((lt - 0.85) / 0.4) : 0), 0, 3.0, 0, 40);
      break;
    }
    case 'rates': {
      setEnv('dusk');
      setCoach('point', t, m, 'happy');
      coach.rotation.y = 0.25;
      cam(0.5, 3.2, 12.5 - 0.4 * k, 0.5, 3.0, 0, 40);
      ball.visible = false;
      break;
    }
    case 'name': {
      setEnv('night');
      const said = cfg.marks.name_said - cfg.start.name;
      setCoach(lt > said ? 'cheer' : 'open', t, m, 'happy');
      if (lt > said) coach.position.y = Math.abs(Math.sin((lt - said) * 6)) * 0.3;
      ball.visible = false;
      cam(0, 3.2, 11.5 - 0.5 * k, 0, 2.6, 0, 40);
      break;
    }
    case 'eleven': {
      setEnv('night');
      coach.visible = false;
      ball.position.set(0, 0.35, PITCH_Z);
      cam(0, 62, PITCH_Z + 0.01, 0, 0, PITCH_Z, 52);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, PITCH_Z);
      camera.up.set(0, 1, 0);
      break;
    }
    case 'vs': {
      setEnv('night');
      coach.visible = false;
      const a = -0.5 + k * 0.6;
      cam(Math.sin(a) * 26, 7, PITCH_Z + Math.cos(a) * 26, 0, 2, PITCH_Z, 45);
      ball.position.set(0, 0.35, PITCH_Z);
      break;
    }
    case 'end': {
      setEnv('night');
      setCoach('wave', t, m, 'happy');
      ball.position.set(1.4, 0.35, 0.8);
      cam(0, 3.0, 14 - 0.6 * k, 0, 2.6, 0, 40);
      break;
    }
  }
}

window.renderAt = (t) => {
  let s = cfg.scenes[cfg.scenes.length - 1];
  for (const sc of cfg.scenes) if (t >= sc.s0 && t < sc.s1) { s = sc; break; }
  shot(s.name, t - s.s0, s.s1 - s.s0, t);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/jpeg', 0.93);
};
window.ready = true;
