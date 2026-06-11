/* ═══════════════════════════════════════════════════
   JASÚ MONTERO V2 — slider, acento neón, video, form
   ═══════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── Acento neón: rosa / cian ───────────────────── */
  const ACCENT_KEY = "jasu-v2-accent";
  const applyAccent = (a) => {
    if (!["rosa", "cian"].includes(a)) a = "rosa";
    document.documentElement.setAttribute("data-accent", a);
    localStorage.setItem(ACCENT_KEY, a);
    $$(".accent-switch button").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.accent === a)
    );
  };
  applyAccent(localStorage.getItem(ACCENT_KEY) || "rosa");
  $$(".accent-switch button").forEach((b) =>
    b.addEventListener("click", () => applyAccent(b.dataset.accent))
  );

  /* ── Menú móvil ─────────────────────────────────── */
  const burger = $("#navBurger");
  const links = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ── Slider del hero ────────────────────────────── */
  const slides = $$(".hero-slide");
  const dotsBox = $("#slideDots");
  const num = $("#slideNum");
  const bar = $("#slideBar");
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement("i");
    if (i === 0) dot.classList.add("is-active");
    dotsBox.appendChild(dot);
  });
  const dots = $$("i", dotsBox);

  const goTo = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === current));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === current));
    num.textContent = String(current + 1).padStart(2, "0");
    bar.style.transform = `translateY(${current * 100}%)`;
    restart();
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 6500);
  };

  $("#slidePrev").addEventListener("click", () => goTo(current - 1));
  $("#slideNext").addEventListener("click", () => goTo(current + 1));
  restart();

  /* ── Video destacado (lite embed + tira) ────────── */
  const tpl = $("#ytTemplate");
  const player = $("#featuredPlayer");
  const thumb = $("#featuredThumb");
  const playBtn = $("#featuredPlay");
  const caption = $("#featuredCaption");

  const loadVideo = (id, autoplay) => {
    const old = $("iframe", player);
    if (old) old.remove();
    if (autoplay) {
      const frame = tpl.content.firstElementChild.cloneNode(true);
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      player.appendChild(frame);
    }
  };

  playBtn.addEventListener("click", () => loadVideo(player.dataset.video, true));

  $$("#featuredStrip button").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$("#featuredStrip button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      player.dataset.video = btn.dataset.video;
      thumb.src = $("img", btn).src;
      caption.textContent = btn.dataset.title;
      loadVideo(btn.dataset.video, true);
    })
  );

  /* ── Aparición al hacer scroll ──────────────────── */
  const targets = $$(
    ".sec-head, .gig, .news-item, .polaroid, .bio__text, .album__cover, .player, .featured__stage, .gallery__mosaic img, .booking__copy, .booking__form"
  );
  targets.forEach((t) => t.classList.add("reveal-v2"));

  const groups = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const p = e.target.parentElement;
        const i = groups.get(p) ?? 0;
        groups.set(p, i + 1);
        e.target.style.setProperty("--d", `${Math.min(i * 0.1, 0.5)}s`);
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((t) => io.observe(t));

  /* ── Sección activa en el nav ───────────────────── */
  const sections = $$("section[id]");
  const navAs = $$(".nav__links a");
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navAs.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`)
        );
      }),
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ── Formulario de booking (mailto) ─────────────── */
  const form = $("#bookingForm");
  const note = $("#bookingNote");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const d = new FormData(form);
    const asunto = encodeURIComponent(`[Booking Web] ${d.get("nombre")}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${d.get("nombre")}\nCorreo: ${d.get("email")}\n\n${d.get("mensaje")}`
    );
    window.location.href = `mailto:${form.dataset.mailto}?subject=${asunto}&body=${cuerpo}`;
    note.textContent = "Abriendo tu aplicación de correo… ¡gracias!";
    form.reset();
  });

  /* ── Año ────────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
})();
