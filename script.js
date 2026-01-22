// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal on scroll
const reveals = document.querySelectorAll(".reveal");
if (reveals.length) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("active");
      });
    },
    { threshold: 0.18 }
  );
  reveals.forEach((el) => obs.observe(el));
}

// Typing (hero)
const typingEl = document.getElementById("typing");
if (typingEl) {
  const text = typingEl.getAttribute("data-typing") || "";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    typingEl.textContent = text;
  } else {
    let i = 0;
    typingEl.textContent = "";
    const speed = 45;

    (function tick() {
      typingEl.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) setTimeout(tick, speed);
    })();
  }
}

// Background canvas (stars)
(function starfieldInit() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let W = 0, H = 0;
  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let stars = [];
  let mouseX = 0.5, mouseY = 0.5, pmx = 0.5, pmy = 0.5;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cfg = {
    starCount: 180,
    layers: 3,
    baseSpeed: 0.18,
    twinkle: 0.012,
    parallax: 0.035,
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initStars();
    drawFrame(true);
  }

  function initStars() {
    stars = [];
    for (let l = 0; l < cfg.layers; l++) {
      const layerRatio = (l + 1) / cfg.layers;
      const count = Math.floor(cfg.starCount * (0.55 / layerRatio));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: rand(0, W),
          y: rand(0, H),
          r: rand(0.7, 2.0) * layerRatio,
          a: rand(0.18, 0.85),
          v: rand(0.15, 0.65) * layerRatio,
          layer: layerRatio,
        });
      }
    }
  }

  function drawNebula() {
    const g1 = ctx.createRadialGradient(
      W * 0.25, H * 0.35, 0,
      W * 0.25, H * 0.35, Math.max(W, H) * 0.55
    );
    g1.addColorStop(0, "rgba(0,255,136,0.10)");
    g1.addColorStop(0.55, "rgba(0,255,136,0.03)");
    g1.addColorStop(1, "rgba(0,0,0,0)");

    const g2 = ctx.createRadialGradient(
      W * 0.78, H * 0.65, 0,
      W * 0.78, H * 0.65, Math.max(W, H) * 0.50
    );
    g2.addColorStop(0, "rgba(0,255,204,0.08)");
    g2.addColorStop(0.5, "rgba(0,255,204,0.025)");
    g2.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  function drawFrame(once = false) {
    pmx += (mouseX - pmx) * 0.06;
    pmy += (mouseY - pmy) * 0.06;

    ctx.clearRect(0, 0, W, H);
    drawNebula();

    for (const st of stars) {
      if (!once) {
        st.y += cfg.baseSpeed * st.v;
        if (st.y > H + 10) {
          st.y = -10;
          st.x = rand(0, W);
        }
        st.a += (Math.random() - 0.5) * cfg.twinkle;
        st.a = Math.max(0.10, Math.min(0.95, st.a));
      }

      const px = (pmx - 0.5) * W * cfg.parallax * (1 - st.layer);
      const py = (pmy - 0.5) * H * cfg.parallax * (1 - st.layer);

      ctx.beginPath();
      ctx.fillStyle = `rgba(0,255,136,${st.a})`;
      ctx.arc(st.x + px, st.y + py, st.r, 0, Math.PI * 2);
      ctx.fill();

      if (st.r > 1.6 && st.a > 0.6) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,255,136,${st.a * 0.14})`;
        ctx.arc(st.x + px, st.y + py, st.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!once && !reduced) requestAnimationFrame(drawFrame);
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX / W;
      mouseY = e.clientY / H;
    },
    { passive: true }
  );

  window.addEventListener("resize", resize);
  resize();

  if (!reduced) requestAnimationFrame(drawFrame);
})();

// Contact form (Formspree -> merci.html)
const contactForm = document.querySelector(".contact-form");
const formNote = document.getElementById("formNote");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (formNote) formNote.textContent = "Envoi en cours…";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "Accept": "application/json" },
      });

      if (response.ok) {
        contactForm.reset();
        window.location.href = "merci.html";
      } else {
        if (formNote) formNote.textContent = "Erreur lors de l’envoi. Réessaie plus tard.";
      }
    } catch {
      if (formNote) formNote.textContent = "Erreur réseau. Vérifie ta connexion.";
    }
  });
}

// Lightbox
const lb = document.getElementById("lightbox");
const lbMedia = document.getElementById("lbMedia");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

if (lb && lbMedia && lbCaption && lbClose && lbPrev && lbNext) {
  let lbItems = [];
  let lbIndex = 0;

  let lastWasVideo = false;
  let lastVideoSrc = "";
  let lastVideoTime = 0;

  const projectConfig = {
    projet1: 12,
    projet2: 4,
    projet3: 6,
  };

  function openLightbox(items, caption = "") {
    lbItems = items;
    lbIndex = 0;
    lbCaption.textContent = caption;

    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    renderLB();
  }

  async function safeExitFullscreen() {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
  }

  function stopVideoIfAny() {
    const v = lbMedia.querySelector("video");
    if (!v) return;
    try {
      lastVideoTime = v.currentTime || 0;
      v.pause();
      v.removeAttribute("src");
      v.load();
    } catch {}
  }

  async function closeLightbox() {
    await safeExitFullscreen();
    stopVideoIfAny();

    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lbMedia.innerHTML = "";

    lbItems = [];
    lbIndex = 0;
    lastWasVideo = false;
    lastVideoSrc = "";
    lastVideoTime = 0;

    document.body.style.overflow = "";
  }

  function renderLB() {
    if (!lbItems.length) return;

    const item = lbItems[lbIndex];
    lbMedia.innerHTML = "";

    const one = lbItems.length <= 1;
    lbPrev.style.visibility = one ? "hidden" : "visible";
    lbNext.style.visibility = one ? "hidden" : "visible";

    if (item.type === "video") {
      lastWasVideo = true;
      lastVideoSrc = item.src;

      const v = document.createElement("video");
      v.src = item.src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "metadata";
      lbMedia.appendChild(v);
    } else {
      lastWasVideo = false;
      lastVideoSrc = "";
      lastVideoTime = 0;

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = "Projet";
      lbMedia.appendChild(img);
    }
  }

  function nextLB() {
    if (lbItems.length <= 1) return;
    lbIndex = (lbIndex + 1) % lbItems.length;
    renderLB();
  }

  function prevLB() {
    if (lbItems.length <= 1) return;
    lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
    renderLB();
  }

  document.querySelectorAll(".project").forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
      const title = card.querySelector(".content h3")?.textContent || "Projet";
      const desc = card.querySelector(".content p")?.textContent || "";

      const vid = card.querySelector("video");
      if (vid) {
        const src = vid.querySelector("source")?.getAttribute("src") || vid.getAttribute("src");
        if (!src) return;
        openLightbox([{ type: "video", src }], `${title} — ${desc}`);
        return;
      }

      const img = card.querySelector("img");
      if (!img) return;

      const srcCover = img.getAttribute("src") || "";
      const match = srcCover.match(/^projects\/([^/]+)\//);
      if (!match) return;
      const folder = match[1];

      const count = projectConfig[folder] || 1;
      const items = [];
      for (let i = 1; i <= count; i++) {
        const file = String(i).padStart(2, "0") + ".jpg";
        items.push({ type: "image", src: `projects/${folder}/${file}` });
      }

      openLightbox(items, `${title} — ${desc}`);
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lbNext.addEventListener("click", nextLB);
  lbPrev.addEventListener("click", prevLB);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextLB();
    if (e.key === "ArrowLeft") prevLB();
  });

  function rebuildVideoPlayer() {
    if (!lastWasVideo || !lastVideoSrc) return;
    if (!lb.classList.contains("open")) return;

    const v = lbMedia.querySelector("video");
    if (!v) return;

    let time = 0;
    try { time = v.currentTime || lastVideoTime || 0; } catch {}

    lbMedia.innerHTML = "";
    const nv = document.createElement("video");
    nv.src = lastVideoSrc;
    nv.controls = true;
    nv.playsInline = true;
    nv.preload = "metadata";
    lbMedia.appendChild(nv);

    nv.addEventListener(
      "loadedmetadata",
      () => {
        try { nv.currentTime = time; } catch {}
      },
      { once: true }
    );
  }

  function onFullscreenChange() {
    if (!document.fullscreenElement) {
      setTimeout(() => {
        document.body.style.overflow = lb.classList.contains("open") ? "hidden" : "";
        rebuildVideoPlayer();
      }, 120);
    }
  }

  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
}
