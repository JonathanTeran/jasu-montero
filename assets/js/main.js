/* ═══════════════════════════════════════════════════════
   JASÚ MONTERO — interacciones del sitio
   Temas · menú móvil · reveal · contadores · video · form
   ═══════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Temas: noche / claro / blanco ──────────────────── */
  const THEME_KEY = "jasu-theme";
  const THEMES = ["noche", "claro", "blanco"];
  const root = document.documentElement;

  const applyTheme = (theme) => {
    if (!THEMES.includes(theme)) theme = "noche";
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    $$(".theme-switch__btn").forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.setTheme === theme)
    );
  };

  // Tema guardado > preferencia del sistema > noche (la foto salta en oscuro)
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(saved || (prefersLight ? "claro" : "noche"));

  $$(".theme-switch__btn").forEach((btn) =>
    btn.addEventListener("click", () => applyTheme(btn.dataset.setTheme))
  );

  /* ── Barra de navegación ────────────────────────────── */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Menú móvil */
  const burger = $("#navBurger");
  const links = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  $$(".nav__link", links).forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* Resaltar sección activa */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`)
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ── Animaciones de entrada (con escalonado) ────────── */
  const reveals = $$(".reveal");
  const groups = new Map(); // escalona por contenedor padre

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const parent = e.target.parentElement;
        const idx = groups.get(parent) ?? 0;
        groups.set(parent, idx + 1);
        e.target.style.setProperty("--d", `${Math.min(idx * 0.12, 0.6)}s`);
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => io.observe(el));

  /* ── Contadores del hero ────────────────────────────── */
  const counters = $$("[data-count]");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1600;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        animateCount(e.target);
        cio.unobserve(e.target);
      }),
    { threshold: 0.6 }
  );
  counters.forEach((c) => cio.observe(c));

  /* ── Videos: lite embed de YouTube ──────────────────── */
  const tpl = $("#ytTemplate");
  $$(".video-card").forEach((card) => {
    const id = card.dataset.video;
    const media = $(".video-card__media", card);
    const play = () => {
      if ($("iframe", media)) return;
      const frame = tpl.content.firstElementChild.cloneNode(true);
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      media.appendChild(frame);
    };
    $(".video-card__play", card).addEventListener("click", play);
    $("img", media).addEventListener("click", play);
  });

  /* ── Formulario de contacto (mailto sin backend) ────── */
  const form = $("#contactForm");
  const note = $("#formNote");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = new FormData(form);
    const para = form.dataset.mailto;
    const asunto = encodeURIComponent(`[Web] ${data.get("asunto")} — ${data.get("nombre")}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${data.get("nombre")}\nCorreo: ${data.get("email")}\nMotivo: ${data.get("asunto")}\n\n${data.get("mensaje")}`
    );
    window.location.href = `mailto:${para}?subject=${asunto}&body=${cuerpo}`;
    note.textContent = "Abriendo tu aplicación de correo… ¡gracias por escribir!";
    form.reset();
  });

  /* ── Año del pie ────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
})();
