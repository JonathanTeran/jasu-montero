/* ═══════════════════════════════════════════════════════════
   JASÚ MONTERO — V7 «LA FUNCIÓN»
   Telón · cursor reflector · polvo dorado · split-text ·
   tira fijada · tornamesa · TV retro · anillo 3D · lightbox
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ── Split-text de los títulos del hero ─────────────── */
  const split = (el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ltr";
      s.textContent = ch === " " ? " " : ch;
      s.style.setProperty("--ld", `${0.55 + i * 0.06}s`);
      el.appendChild(s);
    });
  };
  const _titleBack = $("#titleBack");
  const _titleFront = $("#titleFront");
  if (_titleBack) split(_titleBack);
  if (_titleFront) split(_titleFront);

  /* ── Telón de apertura ──────────────────────────────── */
  const loader = $("#loader");
  const count = $("#loaderCount");

  let curtainOpened = false;
  const curtainHooks = [];
  const onCurtainOpen = (fn) => {
    if (curtainOpened) fn();
    else curtainHooks.push(fn);
  };
  const openCurtain = () => {
    if (curtainOpened) return;
    curtainOpened = true;
    count.textContent = "100";
    loader.classList.add("is-done");
    document.body.removeAttribute("data-loading");
    document.body.classList.add("show-on");
    curtainHooks.forEach((fn) => fn());
    setTimeout(() => loader.remove(), 1600);
  };

  if (reduced) {
    openCurtain();
  } else {
    const t0 = performance.now();
    const DUR = 1700;
    const tick = (t) => {
      if (curtainOpened) return;
      const p = Math.min((t - t0) / DUR, 1);
      count.textContent = Math.round(p * 100);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(openCurtain, 220);
    };
    requestAnimationFrame(tick);
    // rAF se congela en pestañas ocultas: garantiza la apertura igualmente
    setTimeout(openCurtain, DUR + 900);
  }

  /* ── Cursor reflector (desktop) ─────────────────────── */
  if (finePointer && !reduced) {
    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();

    $$("a, button, .setlist__row, .ring__item").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  const hero = $(".hero");

  /* ── Polvo dorado (canvas) ──────────────────────────── */
  const dustCanvas = $("#dust");
  if (!reduced) {
    const ctx = dustCanvas.getContext("2d");
    let W, H, parts = [];
    let visible = true;

    const resize = () => {
      W = dustCanvas.width = hero.offsetWidth;
      H = dustCanvas.height = hero.offsetHeight;
    };
    resize();
    addEventListener("resize", resize, { passive: true });

    const N = Math.min(70, Math.floor(innerWidth / 18));
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.8 + 0.4,
        vy: Math.random() * 0.00045 + 0.0001,
        vx: (Math.random() - 0.5) * 0.0003,
        a: Math.random() * 0.5 + 0.15,
        ph: Math.random() * Math.PI * 2,
      });
    }

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; })
      .observe(hero);

    (function dustLoop(t) {
      requestAnimationFrame(dustLoop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        const tw = 0.55 + 0.45 * Math.sin(t * 0.001 + p.ph);
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 169, 80, ${(p.a * tw).toFixed(3)})`;
        ctx.fill();
      });
    })(0);
  }

  /* ── Barra de progreso + nav ────────────────────────── */
  const progress = $("#progress");
  const nav = $("#nav");
  const docH = () => document.documentElement.scrollHeight - innerHeight;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 30);
    progress.style.transform = `scaleX(${(scrollY / docH()).toFixed(4)})`;
    pinActs();
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* Menú móvil */
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

  /* Sección activa */
  const sections = $$("main section[id]");
  const navAs = $$(".nav__links a");
  const spyIO = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      navAs.forEach((a) =>
        a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`)
      );
    }),
    { rootMargin: "-35% 0px -55% 0px" }
  );
  sections.forEach((s) => spyIO.observe(s));

  /* ── Aparición al scroll ────────────────────────────── */
  const rvTargets = $$(
    ".sec-head, .era, .deck__table, .setlist li, .tv, .ticket, .backstage__copy, .pass, .ring-stage, .mosaic__item"
  );
  rvTargets.forEach((t) => t.classList.add("rv"));
  const groups = new Map();
  const rvIO = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const p = e.target.parentElement;
      const i = groups.get(p) ?? 0;
      groups.set(p, i + 1);
      e.target.style.setProperty("--d", `${Math.min(i * 0.09, 0.45)}s`);
      e.target.classList.add("in");
      rvIO.unobserve(e.target);
    }),
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );
  rvTargets.forEach((t) => rvIO.observe(t));

  /* ── ACTO I: tira horizontal fijada ─────────────────── */
  const acts = $(".acts");
  const track = $("#actsTrack");
  const actsBar = $("#actsBar");
  const isMobileActs = () => matchMedia("(max-width: 880px)").matches;

  function pinActs() {
    if (isMobileActs() || reduced) return;
    const rect = acts.getBoundingClientRect();
    const total = acts.offsetHeight - innerHeight;
    const p = Math.min(Math.max(-rect.top / total, 0), 1);
    const dist = track.scrollWidth - innerWidth + innerWidth * 0.16;
    track.style.transform = `translateX(${(-p * dist).toFixed(1)}px)`;
    actsBar.style.transform = `scaleX(${p.toFixed(3)})`;
  }
  pinActs();
  addEventListener("resize", () => { track.style.transform = ""; pinActs(); }, { passive: true });

  /* ── ACTO II: tornamesa con audio real ──────────────── */
  const vinyl = $("#vinyl");
  const vinylLabel = $("#vinylLabel");
  const tonearm = $("#tonearm");
  const deckEq = $("#deckEq");
  const nowTitle = $("#nowTitle");
  const openSpotify = $("#openSpotify");

  // Un solo reproductor para los adelantos de 30 s
  const player = new Audio();
  player.preload = "none";

  const deckPlayState = (on) => {
    vinyl.classList.toggle("is-playing", on);
    tonearm.classList.toggle("is-playing", on);
    deckEq.classList.toggle("is-on", on);
  };

  player.addEventListener("ended", () => deckPlayState(false));
  player.addEventListener("pause", () => deckPlayState(false));
  player.addEventListener("play", () => deckPlayState(true));

  const selectTrack = (row) => {
    $$(".setlist__row").forEach((r) => r.classList.remove("is-active"));
    row.classList.add("is-active");
    vinylLabel.src = row.dataset.cover;
    nowTitle.textContent = $("span", row).textContent;
    openSpotify.href = `https://open.spotify.com/track/${row.dataset.spotify}`;
  };

  $$(".setlist__row").forEach((row) =>
    row.addEventListener("click", () => {
      // ¿Está REALMENTE cargado este tema? (no basta la clase visual is-active)
      const isLoaded = !!player.src && player.src.endsWith(row.dataset.audio);

      // Mismo tema cargado y sonando → pausa (la aguja sube)
      if (isLoaded && !player.paused) {
        player.pause();
        return;
      }

      selectTrack(row);

      if (!isLoaded) {
        player.src = row.dataset.audio;
        player.currentTime = 0;
      }
      player.play().catch(() => deckPlayState(true)); // sin audio permitido: al menos gira
    })
  );

  /* ── Audio de apertura: jingle al abrirse el telón ───── */
  const intro = new Audio("assets/audio/intro-quiero-jasu.mp3");
  intro.preload = "auto";
  intro.volume = 0.9;
  let introPlayed = false;
  let gestureArmed = false;

  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    const go = () => {
      ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
        document.removeEventListener(ev, go)
      );
      playIntro();
    };
    ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
      document.addEventListener(ev, go, { passive: true })
    );
  }

  const playIntro = () => {
    if (introPlayed) return;
    introPlayed = true;
    intro.currentTime = 0;
    intro.play().catch(() => {
      // El navegador bloqueó el autoplay: reintenta al primer gesto del usuario
      introPlayed = false;
      armGesture();
    });
  };

  // Suena al abrirse el telón; si el navegador lo bloquea, al primer clic/tecla
  onCurtainOpen(playIntro);

  // El botón "Que comience el show" también dispara el jingle (es un gesto válido)
  const showStart = $("#showStart");
  if (showStart) showStart.addEventListener("click", playIntro);

  /* ── ACTO III: TV retro ─────────────────────────────── */
  const tvScreen = $("#tvScreen");
  const tvThumb = $("#tvThumb");
  const tvStatic = $("#tvStatic");
  const tvPlay = $("#tvPlay");
  const tvOsd = $("#tvOsd");
  const tpl = $("#ytTemplate");

  const tvLoad = (id, autoplay) => {
    const old = $("iframe", tvScreen);
    if (old) old.remove();
    if (autoplay) {
      const f = tpl.content.firstElementChild.cloneNode(true);
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      tvScreen.appendChild(f);
      tvPlay.style.display = "none";
    } else {
      tvPlay.style.display = "";
    }
  };

  tvPlay.addEventListener("click", () => tvLoad(tvScreen.dataset.video || "D9d9pfnqhno", true));
  tvScreen.dataset.video = "D9d9pfnqhno";

  // Cambiar de canal reproduce el video automáticamente (sin pulsar play)
  $$("#tvChannels button").forEach((btn, i) =>
    btn.addEventListener("click", () => {
      $$("#tvChannels button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const id = btn.dataset.video;
      tvOsd.textContent = `CH·0${i + 1}`;
      tvScreen.dataset.video = id;

      if (reduced) {
        tvThumb.src = `assets/img/video-${id}.jpg`;
        tvLoad(id, true);
        return;
      }
      tvStatic.classList.add("is-on");
      setTimeout(() => {
        tvThumb.src = `assets/img/video-${id}.jpg`;
        tvLoad(id, true);
        setTimeout(() => tvStatic.classList.remove("is-on"), 240);
      }, 320);
    })
  );

  /* ── ACTO IV: anillo 3D ─────────────────────────────── */
  const stage = $("#ringStage");
  const ring = $("#ring");
  let angle = 0;
  let velocity = reduced ? 0 : 0.05;
  let dragging = false;
  let lastX = 0;
  let moved = 0;
  let ringVisible = false;

  new IntersectionObserver(([e]) => { ringVisible = e.isIntersecting; })
    .observe(stage);

  (function ringLoop() {
    requestAnimationFrame(ringLoop);
    if (!ringVisible) return;
    if (!dragging) {
      angle += velocity;
      velocity *= 0.985;
      if (!reduced && Math.abs(velocity) < 0.05) {
        velocity = velocity < 0 ? -0.05 : 0.05;
      }
    }
    ring.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
  })();

  // Sin setPointerCapture: capturar el puntero se roba el click de las
  // fotos y el visor nunca abría. El arrastre funciona igual.
  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    stage.classList.add("is-grabbing");
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    angle += dx * 0.35;
    velocity = dx * 0.12;
    // respuesta inmediata al arrastre (sin esperar al rAF)
    ring.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
  });

  const endDrag = () => { dragging = false; stage.classList.remove("is-grabbing"); };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", endDrag);

  $$(".ring__item").forEach((item) =>
    item.addEventListener("click", () => {
      if (moved > 8) return; // fue un arrastre, no un clic
      const img = $("img", item);
      openImage(img.src, img.alt);
    })
  );

  /* ── Mosaico: todas las fotos → visor ───────────────── */
  $$(".mosaic__item").forEach((item) =>
    item.addEventListener("click", () => {
      const img = $("img", item);
      openImage(img.src, img.alt);
    })
  );

  /* ── Tilt 3D en boletos y pase ──────────────────────── */
  if (finePointer && !reduced) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -10}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .6s cubic-bezier(.22,.61,.36,1)";
        card.style.transform = "";
        setTimeout(() => (card.style.transition = ""), 600);
      });
    });

    /* Botones magnéticos */
    $$("[data-magnet]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform .5s cubic-bezier(.34,1.56,.64,1)";
        btn.style.transform = "";
        setTimeout(() => (btn.style.transition = ""), 500);
      });
    });
  }

  /* ── Lightbox (video / imagen) ──────────────────────── */
  const lb = $("#lightbox");
  const lbContent = $("#lightboxContent");
  const lbClose = $("#lightboxClose");
  let lastFocus = null;

  const openLB = (node) => {
    lbContent.innerHTML = "";
    lbContent.appendChild(node);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    lbClose.focus();
  };

  const closeLB = () => {
    lb.hidden = true;
    lbContent.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  function openImage(src, alt) {
    const img = new Image();
    img.src = src;
    img.alt = alt || "";
    openLB(img);
  }

  lbClose.addEventListener("click", closeLB);
  $("#lightboxBackdrop").addEventListener("click", closeLB);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLB(); });

  /* ── Pase backstage (mailto) ────────────────────────── */
  const form = $("#passForm");
  const note = $("#passNote");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const d = new FormData(form);
    const asunto = encodeURIComponent(`[Backstage Web] ${d.get("nombre")}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${d.get("nombre")}\nCorreo: ${d.get("email")}\n\n${d.get("mensaje")}`
    );
    location.href = `mailto:${form.dataset.mailto}?subject=${asunto}&body=${cuerpo}`;
    note.textContent = "Abriendo tu aplicación de correo… ¡nos vemos en el backstage!";
    form.reset();
  });

  /* ── Año ────────────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();

  onScroll();
})();
