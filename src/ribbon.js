// Scroll-driven video ribbon — adapted from the free motionsites.ai "Video Ribbon" prompt
// (prompt text/code is free to reuse per their terms). Cards use Amit's OWN reels & designs.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Vector3, Vector2, CatmullRomCurve3, PlaneGeometry,
  ShaderMaterial, Mesh, DoubleSide, TextureLoader, VideoTexture, LinearFilter, NoColorSpace, LinearSRGBColorSpace,
} from "three";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const out = (t) => 1 - (1 - t) ** 3;
const span = (p, a, b) => clamp((p - a) / (b - a));

export function createRibbon({ canvas, stage, items, lite, useVideo }) {
  const renderer = new WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = LinearSRGBColorSpace;
  const scene = new Scene();
  const FOV = 35, camera = new PerspectiveCamera(FOV, 1, 0.1, 100);

  /* ---------- rail ---------- */
  let PATH_L = 1;
  const SAMPLES = lite ? 700 : 1200, pathP = [], pathT = [];
  const PH0 = -1.5, PH1 = Math.PI * 2 + 1.35;
  function buildPath() {
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const t = i / 160, ph = mix(PH0, PH1, t), cs = Math.cos(ph), u = 2 * t - 1;
      const depth = cs > 0 ? 7.6 + 16.4 * cs ** 0.9 : 7.6 + 2.2 * cs;
      const edge = 0.84 + 0.5 * span(0.14 - t, 0, 0.14) + 0.8 * span(t, 0.84, 1);
      pts.push(new Vector3(edge * Math.sin(ph) * depth * 0.561, 0.5 * Math.sign(u) * Math.abs(u) ** 1.4 * depth * 0.63, -depth));
    }
    const path = new CatmullRomCurve3(pts, false, "centripetal");
    path.arcLengthDivisions = 1500;
    PATH_L = path.getLength();
    for (let i = 0; i <= SAMPLES; i++) { const u = i / SAMPLES; pathP.push(path.getPointAt(u)); pathT.push(path.getTangentAt(u)); }
  }
  const at = (s, op, ot) => {
    const f = clamp(s / PATH_L) * SAMPLES, i = Math.min(SAMPLES - 1, Math.floor(f)), k = f - i;
    op.lerpVectors(pathP[i], pathP[i + 1], k); ot.lerpVectors(pathT[i], pathT[i + 1], k).normalize();
  };

  /* ---------- cards (portrait, to suit 9:16 reels) ---------- */
  const CARD_W = 1.16, CARD_H = 1.62, GAP = 0.035, STEP = CARD_W + GAP, NX = lite ? 14 : 24, NY = 3;
  const vs = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
  const fs = `uniform sampler2D map;uniform vec2 cover;uniform float aspect,ready,radius,hot;varying vec2 vUv;
void main(){
  vec2 q=(abs(vUv-.5)-.5)*vec2(aspect,1.)+radius;
  float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
  float px=fwidth(d),a=1.-smoothstep(-px,px,d);
  if(a<.01)discard;
  vec2 uv=vUv;if(!gl_FrontFacing)uv.x=1.-uv.x;
  vec3 c=mix(vec3(.075),texture2D(map,(uv-.5)*cover+.5).rgb,ready);
  float edge=smoothstep(-.012-px,-.012,d);
  c=mix(c,vec3(1.,.357,.122),edge*hot);
  gl_FragColor=vec4(mix(c,vec3(1.),edge*.1),a);
}`;
  const loader = new TextureLoader();
  const setCover = (mat, w, h) => {
    const va = w / h, ca = CARD_W / CARD_H;
    mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
  };
  const cards = items.map((it, i) => {
    const geo = new PlaneGeometry(1, 1, NX, NY);
    const mat = new ShaderMaterial({
      vertexShader: vs, fragmentShader: fs, transparent: true, side: DoubleSide,
      uniforms: { map: { value: null }, cover: { value: new Vector2(1, 1) }, aspect: { value: CARD_W / CARD_H }, ready: { value: 0 }, radius: { value: 0.03 }, hot: { value: 0 } },
    });
    const mesh = new Mesh(geo, mat); mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);
    const c = { i, title: it.title, it, geo, mat, mesh, rect: null, v: null, hot: 0 };
    loader.load(it.tex, (tex) => {
      tex.colorSpace = NoColorSpace; tex.minFilter = LinearFilter; tex.generateMipmaps = false;
      if (c.v && mat.uniforms.ready.value === 1 && mat.uniforms.map.value?.isVideoTexture) return;
      mat.uniforms.map.value = tex; setCover(mat, tex.image.width, tex.image.height); mat.uniforms.ready.value = 1;
    });
    return c;
  });

  // desktop: swap in Amit's real reels once the ribbon is about to start
  let videosOn = false;
  function startVideos() {
    if (videosOn || !useVideo) return; videosOn = true;
    for (const c of cards) {
      if (!c.it.video) continue;
      const v = document.createElement("video");
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: "auto" });
      v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
      v.src = c.it.video; c.v = v;
      v.addEventListener("loadeddata", () => {
        const tex = new VideoTexture(v);
        tex.colorSpace = NoColorSpace; tex.minFilter = LinearFilter; tex.magFilter = LinearFilter; tex.generateMipmaps = false;
        c.mat.uniforms.map.value = tex; setCover(c.mat, v.videoWidth, v.videoHeight); c.mat.uniforms.ready.value = 1;
      }, { once: true });
    }
  }

  /* ---------- layout ---------- */
  const GZ = 8;
  let W = 1, H = 1, asp = 1, cols = 6, rows = 1, tanH = 0.3153, dprCap = lite ? 1.5 : 2;
  function resize() {
    W = stage.clientWidth; H = stage.clientHeight; asp = W / H;
    renderer.setPixelRatio(Math.min(devicePixelRatio, dprCap)); renderer.setSize(W, H, false);
    camera.aspect = asp; camera.fov = asp < 16 / 9 ? (Math.atan(0.561 / asp) * 360) / Math.PI : FOV; camera.updateProjectionMatrix();
    tanH = Math.tan((camera.fov * Math.PI) / 360);
    if (asp < 0.9) { cols = 3; rows = 2; } else { cols = 6; rows = 1; }
  }
  resize(); buildPath();
  function grid(i) {
    const vh = 2 * GZ * tanH, vw = vh * asp, gw = vw * (rows === 1 ? 0.8 : 0.9), gap = gw * (rows === 1 ? 0.012 : 0.025);
    let cw = (gw - gap * (cols - 1)) / cols, ch = cw / (CARD_W / CARD_H);
    const maxH = vh * (rows === 1 ? 0.46 : 0.3); if (ch > maxH) { ch = maxH; cw = ch * (CARD_W / CARD_H); }
    const rw = cw * cols + gap * (cols - 1), gh = ch * rows + gap * (rows - 1);
    const c = i % cols, r = Math.floor(i / cols);
    return { x: -rw / 2 + cw / 2 + c * (cw + gap), y: gh / 2 - ch / 2 - r * (ch + gap) - vh * 0.02, w: cw, h: ch, vw, vh, c, r };
  }

  /* ---------- pose ---------- */
  const op = new Vector3(), ot = new Vector3(), up = new Vector3(), Y = new Vector3(0, 1, 0), vp = new Vector3();
  function poseRibbon(c, head) {
    const pos = c.geo.attributes.position, centre = head - c.i * STEP;
    for (let ix = 0; ix <= NX; ix++) {
      const lu = ix / NX - 0.5;
      at(centre + lu * CARD_W, op, ot);
      up.copy(Y).addScaledVector(ot, -Y.dot(ot)).normalize();
      for (let iy = 0; iy <= NY; iy++) {
        const k = iy * (NX + 1) + ix, lv = 0.5 - iy / NY;
        vp.copy(op).addScaledVector(up, lv * CARD_H);
        pos.setXYZ(k, vp.x, vp.y, vp.z);
      }
    }
    pos.needsUpdate = true;
  }
  function poseGrid(c, q) {
    const g = grid(c.i), pos = c.geo.attributes.position;
    const mc = (cols - 1) / 2, side = g.c - mc;
    const dy = rows === 1 ? (g.c % 2 ? -1 : 1) : g.r < rows / 2 ? 1 : -1;
    const ox = (side / mc) * g.vw * 0.45 * (1 - q), oy = dy * g.vh * 0.5 * (1 - q), tilt = (1 - q) * 0.22 * ((side / mc) || 0.5) * dy;
    const cs = Math.cos(tilt), sn = Math.sin(tilt);
    for (let iy = 0; iy <= NY; iy++) for (let ix = 0; ix <= NX; ix++) {
      const k = iy * (NX + 1) + ix, x = (ix / NX - 0.5) * g.w, y = (0.5 - iy / NY) * g.h;
      pos.setXYZ(k, g.x + ox + x * cs - y * sn, g.y + oy + x * sn + y * cs, -GZ - (1 - q) * 0.6 * Math.sin((ix / NX) * Math.PI));
    }
    pos.needsUpdate = true;
    c.rect = g;
  }

  const RIB_A = 0.14, RIB_B = 0.63, GRID_N = () => cols * rows;
  let hover = null;
  function render(pp) {
    if (pp > 0.08) startVideos();
    const pr = span(pp, RIB_A, RIB_B), total = PATH_L + cards.length * STEP, head = mix(0, total, pr);
    for (const c of cards) {
      const s = head - c.i * STEP, end = PATH_L - CARD_W;
      if (s < end) {
        c.mesh.visible = s > CARD_W * 0.5; c.rect = null;
        if (c.mesh.visible) poseRibbon(c, head);
      } else if (c.i < GRID_N()) {
        const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / total), q = out(span(pp, st, st + 0.13));
        c.mesh.visible = q > 0.001;
        if (c.mesh.visible) poseGrid(c, q);
      } else { c.mesh.visible = false; c.rect = null; }
      c.hot += ((hover === c ? 1 : 0) - c.hot) * 0.2; c.mat.uniforms.hot.value = c.hot;
      if (c.v) {
        if (c.mesh.visible && c.v.paused) c.v.play().catch(() => {});
        else if (!c.mesh.visible && !c.v.paused) c.v.pause();
      }
    }
    renderer.render(scene, camera);
  }
  function hit(clientX, clientY, pp) {
    hover = null;
    if (pp > 0.84) {
      const r = stage.getBoundingClientRect();
      const nx = (clientX - r.left) / W - 0.5, ny = 0.5 - (clientY - r.top) / H;
      for (const c of cards) { const g = c.rect; if (!g) continue; const x = nx * g.vw, y = ny * g.vh; if (Math.abs(x - g.x) < g.w / 2 && Math.abs(y - g.y) < g.h / 2) hover = c; }
    }
    return hover;
  }
  function pauseAll() { for (const c of cards) if (c.v && !c.v.paused) c.v.pause(); }
  function lowerDpr() { if (dprCap > 1) { dprCap = 1; resize(); return true; } return false; }
  return { render, resize, hit, pauseAll, lowerDpr };
}
