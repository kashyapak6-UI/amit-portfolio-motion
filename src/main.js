import "./style.css";
import { profile, services, about, projects, gallery, experience, tools, coreSkills, industries } from "./content.js";
import SIZES from "./img-sizes.json";

/* ---------- device profile ---------- */
const mq = (q) => matchMedia(q).matches;
const reduced = mq("(prefers-reduced-motion: reduce)");
const touch = mq("(hover: none), (pointer: coarse)");
const small = mq("(max-width: 760px), (max-height: 500px)");
const lite = touch || small;
const saveData = !!(navigator.connection && navigator.connection.saveData);
const lowEnd = lite && ((navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2 || saveData);
const html = document.documentElement;
const hasWebGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
const use3D = hasWebGL && !lowEnd && !reduced;
html.classList.toggle("touch", touch);
html.classList.toggle("lite", lite);
html.classList.toggle("reduced", reduced);
html.classList.toggle("no3d", !use3D);

// reveal the display type only once the self-hosted font is ready (no layout shift)
const fontsOk = () => html.classList.add("fonts-ok");
if (document.fonts && document.fonts.load) {
  Promise.race([document.fonts.load('400 64px "Inter Tight"'), new Promise((r) => setTimeout(r, 1500))]).then(fontsOk, fontsOk);
} else fontsOk();

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const out = (t) => 1 - (1 - t) ** 3;
const ease = (t) => t * t * (3 - 2 * t);
const span = (p, a, b) => clamp((p - a) / (b - a));
const pad = (n) => String(n).padStart(2, "0");
const BASE = import.meta.env.BASE_URL + "work/";
const fileOf = (src) => src.split("/").pop();
const smallSrc = (src, w) => { const f = fileOf(src), s = SIZES[f]; return s && w < s[0] * 0.9 ? `${BASE}sm/${f.replace(/\.webp$/, "")}-${w}.webp` : src; };
const srcset = (src) => { const f = fileOf(src), s = SIZES[f]; if (!s) return ""; return [400, 800].filter((w) => w < s[0] * 0.9).map((w) => `${smallSrc(src, w)} ${w}w`).concat(`${src} ${s[0]}w`).join(", "); };
const img = (src, alt, sizes, eager = false) => { const s = SIZES[fileOf(src)]; return `<img src="${src}" srcset="${srcset(src)}" sizes="${sizes}" ${s ? `width="${s[0]}" height="${s[1]}"` : ""} alt="${alt}" ${eager ? "" : 'loading="lazy"'} decoding="async" />`; };
const words = (t, cls = "w") => t.split(" ").map((w) => `<span class="${cls}">${w}</span>`).join(" ");
const mail = `mailto:${profile.email}`;

/* ---------- content ---------- */
const reelItems = [
  { title: "AI Reel · 01", video: BASE + "gallery-video-01.mp4", poster: BASE + "gallery-video-01-poster.webp" },
  { title: "A Tasty Twist", poster: BASE + "gallery-project-03.webp" },
  { title: "AI Reel · 02", video: BASE + "gallery-video-04.mp4", poster: BASE + "gallery-video-04-poster.webp" },
  { title: "GrizonTech", poster: BASE + "gallery-poster-04.webp" },
  { title: "AI Reel · 03", video: BASE + "gallery-video-05.mp4", poster: BASE + "gallery-video-05-poster.webp" },
  { title: "Starzlink", poster: BASE + "gallery-social-05.webp" },
  { title: "AI Reel · 04", video: BASE + "gallery-video-02.mp4", poster: BASE + "gallery-video-02-poster.webp" },
  { title: "Logo Suite", poster: BASE + "gallery-logo-03.webp" },
  { title: "AI Reel · 05", video: BASE + "gallery-video-03.mp4", poster: BASE + "gallery-video-03-poster.webp" },
  { title: "Shri Ram Inox", poster: BASE + "gallery-poster-10.webp" },
].map((r) => ({ ...r, tex: smallSrc(r.poster, lite ? 400 : 800) }));

const wall = [
  ...gallery,
  { type: "video", src: BASE + "gallery-video-02.mp4", poster: BASE + "gallery-video-02-poster.webp", cat: "Reel" },
  { type: "image", src: BASE + "gallery-banner-01.webp", cat: "Web banner" },
  { type: "image", src: BASE + "gallery-poster-05.webp", cat: "Poster" },
  { type: "image", src: BASE + "gallery-social-02.webp", cat: "Social" },
  { type: "image", src: BASE + "gallery-event-02.webp", cat: "Event" },
  { type: "video", src: BASE + "gallery-video-03.mp4", poster: BASE + "gallery-video-03-poster.webp", cat: "Reel" },
  { type: "image", src: BASE + "gallery-project-02.webp", cat: "Packaging" },
  { type: "image", src: BASE + "gallery-poster-08.webp", cat: "Poster" },
  { type: "image", src: BASE + "gallery-logo-02.webp", cat: "Logo" },
  { type: "image", src: BASE + "gallery-banner-03.webp", cat: "Web banner" },
];

const coverHTML = (p, sizes) => p.img
  ? img(p.img, `${p.title} — ${p.sub}`, sizes)
  : `<div class="gen-cover" style="--from:${p.cover.from};--to:${p.cover.to};--ink:${p.cover.ink}" role="img" aria-label="${p.title} — ${p.sub}"><span>${p.cover.word}</span><small>${p.cat}</small></div>`;

const accentWords = new Set(["bold,", "simple", "visuals"]);
const leadHTML = (layer) => about.lead.split(" ").map((w) => `<span class="w${layer && accentWords.has(w) ? " acc" : ""}">${w}</span>`).join(" ");

$("#app").innerHTML = `
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <nav aria-label="Primary">
    ${["About", "Work", "Reels", "Experience", "Skills", "Contact"].map((l, i) => `<a href="#${l.toLowerCase()}"><small>${pad(i + 1)}</small>${l}</a>`).join("")}
  </nav>
  <div class="menu-foot"><a href="${mail}">${profile.email}</a><span>${profile.location}</span></div>
</div>
<div id="name2" class="cursor-pill" aria-hidden="true"></div>

<main>
<section class="about" id="about" aria-labelledby="about-h">
  <div class="label"><span>(01)</span><span id="about-h">About — the designer</span><span class="hide-sm">Move to paint ↘</span></div>
  <div class="ink-wrap">
    <div class="ink-base">
      <p class="lead">${leadHTML(false)}</p>
      <figure class="ink-fig">${img(about.image, "Amit Kashyap at work", "(max-width:760px) 92vw, 34vw")}</figure>
    </div>
    <div class="ink-top" aria-hidden="true">
      <p class="lead">${leadHTML(true)}</p>
      <figure class="ink-fig">${img(about.image, "", "(max-width:760px) 92vw, 34vw")}</figure>
    </div>
  </div>
  <div class="about-grid">
    <div class="about-copy">${about.paragraphs.map((p) => `<p class="rv">${p}</p>`).join("")}
      <p class="rv mono">${profile.mantra}</p></div>
    <ul class="stats">${about.stats.map((s) => `<li class="rv"><b data-count="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</b><span>${s.label}</span></li>`).join("")}</ul>
  </div>
</section>

<section class="work" id="work" aria-labelledby="work-h">
  <div class="label"><span>(02)</span><span id="work-h">Selected work</span><span>${pad(projects.length)} chapters</span></div>
  <h2 class="big rv">Chapters,<br/><em>2020 → 2026</em></h2>
  <ol class="chapters">
    ${projects.map((p, i) => `
    <li class="chapter" style="--i:${i}">
      <article class="ch-card">
        <div class="ch-meta">
          <span class="ch-num">${pad(i + 1)}</span>
          <div>
            <h3>${p.title}</h3>
            <p>${p.sub}</p>
          </div>
          <dl><div><dt>Discipline</dt><dd>${p.cat}</dd></div><div><dt>Year</dt><dd>${p.year}</dd></div></dl>
        </div>
        <div class="ch-media">${coverHTML(p, "(max-width:760px) 88vw, 46vw")}</div>
      </article>
    </li>`).join("")}
  </ol>
</section>

<section class="reels" id="reels" aria-labelledby="reels-h">
  <div class="label"><span>(03)</span><span id="reels-h">Reels &amp; creatives wall</span><span>${touch ? "Tap a reel to play" : "Hover to reveal"}</span></div>
  <h2 class="big rv">Made to be<br/><em>scrolled past slowly.</em></h2>
  <div class="wall">
    ${wall.map((g, i) => g.type === "video"
      ? `<figure class="tile is-video"><button class="vbtn" type="button" aria-label="Play ${g.cat} ${i + 1}"><video muted loop playsinline preload="none" data-src="${g.src}" poster="${smallSrc(g.poster, 400)}" width="720" height="1280"></video><span class="play" aria-hidden="true">▶</span></button><figcaption>${pad(i + 1)} · ${g.cat}</figcaption></figure>`
      : `<figure class="tile">${img(g.src, `${g.cat} design by Amit Kashyap`, "(max-width:760px) 46vw, 24vw")}<figcaption>${pad(i + 1)} · ${g.cat}</figcaption></figure>`).join("")}
  </div>
</section>

<section class="exp" id="experience" aria-labelledby="exp-h">
  <div class="label"><span>(04)</span><span id="exp-h">Experience</span><span>6 teams · 4+ years</span></div>
  <div class="exp-grid">
    <div class="exp-side"><h2 class="big">Where the<br/><em>work happened.</em></h2><div class="exp-years mono"><span class="yr">2025</span><span>← → 2020</span></div></div>
    <ol class="exp-list"><i class="exp-line" aria-hidden="true"></i>
      ${experience.map((e) => `<li class="rv"><span class="mono">${e.period}</span><h3>${e.role} <em>@ ${e.company}</em></h3>${e.place ? `<small class="mono">${e.place}</small>` : ""}<ul>${e.points.map((x) => `<li>${x}</li>`).join("")}</ul></li>`).join("")}
    </ol>
  </div>
</section>

<section class="skills" id="skills" aria-labelledby="skills-h">
  <div class="label"><span>(05)</span><span id="skills-h">Skills, tools &amp; industries</span><span>Scroll faster ↯</span></div>
  <div class="mq" data-dir="1"><div class="mq-in">${[0, 1].map(() => `<span>${tools.map((t) => `<b style="--c:${t.color}">${t.name}</b>`).join("<i>✺</i>")}<i>✺</i></span>`).join("")}</div></div>
  <div class="mq alt" data-dir="-1"><div class="mq-in">${[0, 1].map(() => `<span>${coreSkills.map((t) => `<b>${t}</b>`).join("<i>/</i>")}<i>/</i></span>`).join("")}</div></div>
  <div class="mq" data-dir="1"><div class="mq-in">${[0, 1].map(() => `<span>${industries.map((t) => `<b>${t}</b>`).join("<i>·</i>")}<i>·</i></span>`).join("")}</div></div>
  <ul class="svc">${services.map((s, i) => `<li class="rv"><span class="mono">${pad(i + 1)}</span>${s}</li>`).join("")}</ul>
</section>

<section class="contact" id="contact" aria-labelledby="contact-h">
  <div class="label"><span>(06)</span><span>Contact</span><span>Open for freelance &amp; full-time</span></div>
  <h2 id="contact-h" class="kin" aria-label="Let's make it move">
    <span class="k1" aria-hidden="true">LET'S MAKE</span><span class="k2" aria-hidden="true">IT MOVE</span>
  </h2>
  <a class="email" href="${mail}"><span>${profile.email}</span><i aria-hidden="true">↗</i></a>
  <div class="c-row">
    ${profile.phones.map((p) => `<a class="pill" href="tel:${p.replace(/[^+\d]/g, "")}">${p}</a>`).join("")}
    <span class="mono">${profile.location}</span>
  </div>
</section>
</main>
<footer class="foot"><span>© 2026 ${profile.first} ${profile.last}</span><span class="mono">Designed in motion — dark mode only</span><a href="#hero">Back to top ↑</a></footer>
`;

/* ---------- fallback grid (no WebGL / low-end / reduced motion) ---------- */
if (!use3D) {
  $(".fb-grid").innerHTML = reelItems.slice(0, 6).map((r, i) => `<figure style="--i:${i}"><img src="${r.tex}" alt="" width="400" height="${Math.round(400 / 0.72)}" loading="lazy" decoding="async" /><figcaption>${r.title}</figcaption></figure>`).join("");
}

/* ---------- hero: one number drives everything ---------- */
const track = $("#track"), stage = $("#hero");
const l1 = $("#l1"), l2 = $("#l2"), cap = $("#cap"), rule = $("#rule"), gridHead = $(".grid-head");
const intros = [$("#glow"), $("#cross"), $(".hint")];
const poster = $(".poster");
const fbCards = $$(".fb-grid figure");
let target = 0, p = 0, heroOn = true, ribbon = null, lastP = -1;
const readScroll = () => { target = clamp(scrollY / Math.max(1, track.offsetHeight - stage.offsetHeight)); };
addEventListener("scroll", readScroll, { passive: true }); readScroll();
new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; if (!heroOn && ribbon) ribbon.pauseAll(); html.classList.toggle("past-hero", !heroOn || target >= 0.995); }, { rootMargin: "100px" }).observe(track);

const RUN_END = innerWidth < 760 ? 110 : 80;
const HEAD0 = 0.25;
const QS = new URLSearchParams(location.search);
function heroDOM(pp) {
  html.classList.toggle("past-hero", target >= 0.995);
  // scroll 0: the title sits fully composed; scrolling splits it apart in opposite directions
  const run = RUN_END * ease(span(pp, 0.015, 0.5));
  l1.style.transform = `translate3d(${-run}vw,0,0)`;
  l2.style.transform = `translate3d(${run}vw,0,0)`;
  const capA = 1 - span(pp, 0.01, 0.07);
  cap.style.opacity = capA; cap.style.visibility = capA > 0 ? "" : "hidden";
  const intro = 1 - span(pp, 0.01, 0.08);
  for (const el of intros) el.style.opacity = intro;
  rule.style.transform = `scaleX(${ease(span(pp, 0.72, 0.86))})`;
  gridHead.style.opacity = span(pp, 0.74, 0.86);
  if (poster) poster.style.opacity = use3D ? "" : String(1 - span(pp, 0.05, 0.2));
  if (!use3D) fbCards.forEach((f, i) => { const q = out(span(pp, 0.3 + i * 0.05, 0.5 + i * 0.05)); f.style.opacity = q; f.style.transform = `translate3d(0,${(1 - q) * (i % 2 ? -40 : 40)}vh,0) rotate(${(1 - q) * (i % 2 ? 6 : -6)}deg)`; });
}

const nameEl = $("#name");
if (!touch) stage.addEventListener("pointermove", (e) => {
  const h = ribbon && ribbon.hit(e.clientX, e.clientY, p);
  nameEl.style.opacity = h ? 1 : 0; stage.style.cursor = h ? "pointer" : "";
  if (h) { nameEl.textContent = h.title; nameEl.style.transform = `translate(${e.clientX + 14}px,${e.clientY + 16}px)`; }
});
stage.addEventListener("click", (e) => { if (ribbon && ribbon.hit(e.clientX, e.clientY, p)) $("#reels").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); });

// adaptive quality: drop DPR if the device can't hold ~45fps
let fpsT = performance.now(), fpsN = 0, fpsChecks = 0, frameN = 0;
function heroLoop(now) {
  if (heroOn) {
    p += (target - p) * (reduced ? 1 : 0.09);
    if (Math.abs(target - p) < 0.00005) p = target;
    if (p !== lastP) { heroDOM(p); lastP = p; }
    // renders every frame while visible (idle drift at the top); on phones the idle drift runs at ~30fps
    if (ribbon && (!lite || p > 0.01 || (frameN++ & 1) === 0)) ribbon.render(p);
    if (ribbon && lite && fpsChecks < 4) { fpsN++; if (now - fpsT > 2000) { if (fpsN / ((now - fpsT) / 1000) < 45) ribbon.lowerDpr(); fpsT = now; fpsN = 0; fpsChecks++; } }
  }
  requestAnimationFrame(heroLoop);
}
heroDOM(0);
requestAnimationFrame(heroLoop);

function bootRibbon() {
  const later = (f) => setTimeout(f, 0);
  import("./ribbon.js").then(({ createRibbon }) => later(() => {
    const r = createRibbon({ canvas: $("#gl"), stage, items: reelItems, lite, reduced, useVideo: !lite && !saveData, head0: +(QS.get("h0") || HEAD0), zoom0: +(QS.get("z0") || (innerWidth / innerHeight < 0.9 ? 1.8 : 1)) });
    r.warm().then(() => later(() => {
      ribbon = r; ribbon.render(p);
      requestAnimationFrame(() => html.classList.add("gl-on"));
    }));
  })).catch(() => html.classList.add("no3d"));
}
if (use3D) {
  if (lite) (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(bootRibbon, { timeout: 2500 });
  else bootRibbon();
}

// resize: ignore mobile URL-bar height-only changes
let lastW = innerWidth, lastH = innerHeight;
addEventListener("resize", () => {
  const wChanged = innerWidth !== lastW, hBig = Math.abs(innerHeight - lastH) > 140;
  if (touch && !wChanged && !hBig) return;
  lastW = innerWidth; lastH = innerHeight; readScroll();
  if (ribbon) ribbon.resize(); lastP = -1;
});

/* ---------- menu ---------- */
const menu = $("#menu"), menuBtn = $(".menu-btn");
const setMenu = (open) => {
  menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open));
  html.classList.toggle("menu-open", open); menuBtn.firstChild.textContent = open ? "CLOSE" : "MENU";
  if (open) menu.querySelector("a").focus();
};
menuBtn.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

/* ---------- reveals + counters ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in"); io.unobserve(e.target);
  const b = e.target.querySelector("[data-count]");
  if (b) {
    const end = +b.dataset.count, suf = b.dataset.suffix, t0 = performance.now();
    const step = (t) => { const k = reduced ? 1 : out(clamp((t - t0) / 1400)); b.textContent = Math.round(end * k).toLocaleString("en-IN") + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
}), { rootMargin: "0px 0px -10% 0px" });
$$(".rv").forEach((el) => io.observe(el));

/* ---------- section scroll effects (only while visible) ---------- */
const live = new Set();
const sio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target))), { rootMargin: "120px 0px" });
const about_ = $(".about"), work_ = $(".work"), exp_ = $(".exp"), skills_ = $(".skills"), contact_ = $(".contact");
[about_, work_, exp_, skills_, contact_].forEach((s) => sio.observe(s));

const leadWords = $$(".ink-base .lead .w");
const chapters = $$(".chapter");
const expLine = $(".exp-line"), expList = $(".exp-list"), yr = $(".yr");
const marquees = $$(".mq").map((el) => ({ el, inn: el.firstElementChild, dir: +el.dataset.dir, x: 0 }));
const k1 = $(".k1"), k2 = $(".k2");
const prog = (el, a = 1, b = 0) => { const r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (r.height + vh * (a - b))); };

let lastY = scrollY, vel = 0;
function sections(dt) {
  const y = scrollY, dy = y - lastY; lastY = y;
  vel += (dy - vel) * 0.12;
  if (live.has(about_)) {
    const k = prog(about_.querySelector(".ink-wrap"), 0.9, 0.35);
    const n = Math.round(k * leadWords.length * 1.15);
    leadWords.forEach((w, i) => w.classList.toggle("on", i < n));
    inkTick(dt, k);
  }
  if (live.has(work_) && !reduced) {
    chapters.forEach((c, i) => {
      const next = chapters[i + 1]; const card = c.firstElementChild;
      if (!next) { card.style.transform = ""; return; }
      const r = next.getBoundingClientRect(), vh = innerHeight;
      const k = clamp(1 - (r.top - vh * 0.12) / (vh * 0.75));
      card.style.transform = `scale(${1 - k * 0.07})`; card.style.filter = k > 0.01 ? `brightness(${1 - k * 0.55})` : "";
    });
  }
  if (live.has(exp_)) {
    const k = prog(expList, 0.75, 0.5);
    expLine.style.transform = `scaleY(${k})`;
    yr.textContent = String(Math.round(mix(2025, 2020, k)));
  }
  if (live.has(skills_)) {
    const boost = reduced ? 0 : Math.min(14, Math.abs(vel) * 0.35);
    for (const m of marquees) {
      const w = m.inn.scrollWidth / 2 || 1;
      m.x -= m.dir * (reduced ? 0 : 0.6 + boost) * (dt / 16.7);
      if (m.x < -w) m.x += w; if (m.x > 0) m.x -= w;
      m.inn.style.transform = `translate3d(${m.x}px,0,0) skewX(${clamp(-vel * 0.12, -8, 8) * (reduced ? 0 : 1)}deg)`;
    }
  }
  if (live.has(contact_)) {
    const k = prog(contact_, 1, 0.3);
    const run = mix(-22, 0, out(k));
    k1.style.transform = `translate3d(${run}vw,0,0)`; k2.style.transform = `translate3d(${-run}vw,0,0)`;
  }
}

/* ---------- ink-brush reveal (own implementation) ---------- */
// A trail of soft blobs builds a CSS mask over a colour copy of the section: cursor/finger paints, ink slowly dries.
const inkTop = $(".ink-top"), inkWrap = $(".ink-wrap");
const blobs = []; let ptr = null, autoT = 0;
const addBlob = (x, y, r) => { blobs.push({ x, y, r, life: 1 }); if (blobs.length > 26) blobs.shift(); };
if (!touch) inkWrap.addEventListener("pointermove", (e) => { const b = inkWrap.getBoundingClientRect(); ptr = { x: e.clientX - b.left, y: e.clientY - b.top }; });
inkWrap.addEventListener("pointerleave", () => (ptr = null));
inkWrap.addEventListener("touchmove", (e) => { const t = e.touches[0], b = inkWrap.getBoundingClientRect(); ptr = { x: t.clientX - b.left, y: t.clientY - b.top, touch: 1 }; }, { passive: true });
inkWrap.addEventListener("touchend", () => (ptr = null), { passive: true });
let lastPtr = null;
function inkTick(dt, k) {
  const W = inkWrap.clientWidth, H = inkWrap.clientHeight, base = Math.max(W, H);
  if (reduced) { inkTop.style.webkitMaskImage = inkTop.style.maskImage = "none"; inkTop.style.opacity = k > 0.3 ? 1 : 0; return; }
  if (ptr) {
    const sp = lastPtr ? Math.hypot(ptr.x - lastPtr.x, ptr.y - lastPtr.y) : 0;
    if (!lastPtr || sp > 6) addBlob(ptr.x + (Math.random() - 0.5) * 10, ptr.y + (Math.random() - 0.5) * 10, base * (0.085 + Math.min(sp, 60) / 800));
    lastPtr = { ...ptr };
  } else {
    lastPtr = null;
    // touch / idle: an automatic brush stroke tied to scroll progress
    autoT += dt;
    if (touch && k > 0.05 && k < 0.98 && autoT > 55) {
      autoT = 0; const t = k * 3.4;
      addBlob(W * (0.5 + 0.42 * Math.sin(t * 2.1)), H * (0.12 + 0.76 * k + 0.06 * Math.sin(t * 5)), base * 0.12);
    }
  }
  for (const b of blobs) b.life -= dt / (touch ? 2600 : 3000);
  while (blobs.length && blobs[0].life <= 0) blobs.shift();
  const m = blobs.length ? blobs.map((b) => `radial-gradient(circle ${Math.max(1, b.r * (0.55 + 0.45 * b.life)).toFixed(1)}px at ${b.x.toFixed(1)}px ${b.y.toFixed(1)}px,#000 ${Math.round(35 + 35 * b.life)}%,transparent)`).join(",") : "linear-gradient(transparent,transparent)";
  inkTop.style.webkitMaskImage = inkTop.style.maskImage = m;
}

let tPrev = performance.now();
function sectionLoop(t) { const dt = Math.min(64, t - tPrev); tPrev = t; if (live.size) sections(dt); requestAnimationFrame(sectionLoop); }
requestAnimationFrame(sectionLoop);

/* ---------- reels wall: lazy video, hover ink on desktop, tap on touch ---------- */
$$(".tile.is-video").forEach((f) => {
  const v = f.querySelector("video"), btn = f.querySelector(".vbtn");
  const load = () => { if (!v.src) { v.src = v.dataset.src; v.preload = "auto"; } };
  const play = () => { load(); v.play().then(() => f.classList.add("playing")).catch(() => {}); };
  const stop = () => { v.pause(); f.classList.remove("playing"); };
  if (!touch) { f.addEventListener("pointerenter", play); f.addEventListener("pointerleave", stop); }
  btn.addEventListener("click", () => (v.paused ? play() : stop()));
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused) stop(); }).observe(f);
});
if (!touch) $$(".tile").forEach((f) => {
  f.addEventListener("pointerenter", (e) => { const r = f.getBoundingClientRect(); f.style.setProperty("--x", `${e.clientX - r.left}px`); f.style.setProperty("--y", `${e.clientY - r.top}px`); f.classList.add("lit"); });
  f.addEventListener("pointerleave", () => f.classList.remove("lit"));
});
