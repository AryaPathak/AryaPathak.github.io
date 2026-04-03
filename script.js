/* ═══════════════════════════════════════════════════════
   ARYA PATHAK — PORTFOLIO SCRIPTS
   Cursor | Canvas | Scroll Animations | Counters
═══════════════════════════════════════════════════════ */

'use strict';

// ── Utility ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

// ══════════════════════════════════════════════════════════
// 1. CUSTOM CURSOR
// ══════════════════════════════════════════════════════════
(function initCursor() {
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function animateRing() {
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverEls = $$('a, button, .metric-card, .project-card, .article-card, .contact-link, .platform-pill');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

// ══════════════════════════════════════════════════════════
// 2. NAV SCROLL STATE
// ══════════════════════════════════════════════════════════
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ══════════════════════════════════════════════════════════
// 3. MOBILE MENU
// ══════════════════════════════════════════════════════════
(function initMobileMenu() {
  const btn = $('#navMenuBtn');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  let open = false;
  btn.addEventListener('click', () => {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      open = false;
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ══════════════════════════════════════════════════════════
// 4. HERO CANVAS — Particle Network
// ══════════════════════════════════════════════════════════
(function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -1000, y: -1000 };
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 130;
  const MOUSE_FORCE_DIST = 120;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_FORCE_DIST) {
        const force = (MOUSE_FORCE_DIST - dist) / MOUSE_FORCE_DIST;
        this.vx += (dx / dist) * force * 0.4;
        this.vy += (dy / dist) * force * 0.4;
      }

      // Damping
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${this.alpha})`;
      ctx.fill();
    }
  }

  function setup() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          // Blue to purple gradient based on position
          const ratio = particles[i].x / W;
          const r = Math.round(lerp(59, 139, ratio));
          const g = Math.round(lerp(130, 92, ratio));
          const b = Math.round(lerp(246, 246, ratio));
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', () => { resize(); setup(); }, { passive: true });
  resize();
  setup();
  draw();
})();

// ══════════════════════════════════════════════════════════
// 5. SCROLL REVEAL
// ══════════════════════════════════════════════════════════
(function initReveal() {
  const els = $$('.reveal-up');
  if (!els.length) return;

  // Apply stagger delays from data attributes
  els.forEach(el => {
    const delay = el.getAttribute('data-delay');
    if (delay) el.style.transitionDelay = `${delay}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

// ══════════════════════════════════════════════════════════
// 6. ANIMATED COUNTERS
// ══════════════════════════════════════════════════════════
(function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutExpo(progress);
      const current = eased * target;

      el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    }

    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

// ══════════════════════════════════════════════════════════
// 7. SMOOTH ACTIVE NAV HIGHLIGHT
// ══════════════════════════════════════════════════════════
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

// ══════════════════════════════════════════════════════════
// 8. HERO NAME — Letter-by-letter reveal on load
// ══════════════════════════════════════════════════════════
(function initHeroReveal() {
  const heroRevels = $$('.hero-content .reveal-up');
  heroRevels.forEach((el, i) => {
    el.style.transitionDelay = `${200 + i * 120}ms`;
    // Trigger after tiny delay so CSS transition fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  });
})();

// ══════════════════════════════════════════════════════════
// 9. METRIC CARDS — subtle parallax tilt
// ══════════════════════════════════════════════════════════
(function initTilt() {
  const cards = $$('.metric-card, .project-card, .research-card');
  if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -5;
      const tiltY = dx * 5;
      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
})();

// ══════════════════════════════════════════════════════════
// 10. WRITING PLATFORM TABS
// ══════════════════════════════════════════════════════════
(function initPlatformTabs() {
  const pills = $$('.platform-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
})();

// ══════════════════════════════════════════════════════════
// 11. BACKGROUND GRID LINES — subtle scan effect
// ══════════════════════════════════════════════════════════
(function initScanLines() {
  const style = document.createElement('style');
  style.textContent = `
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image:
        linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 10%, black 40%, transparent 100%);
    }
  `;
  document.head.appendChild(style);
})();

// ══════════════════════════════════════════════════════════
// 12. SMOOTH SCROLL for anchor links
// ══════════════════════════════════════════════════════════
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

// ══════════════════════════════════════════════════════════
// 13. CURSOR TRAIL — subtle dot trail on fast move
// ══════════════════════════════════════════════════════════
(function initCursorTrail() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let lastX = 0, lastY = 0, trailTimeout;
  document.addEventListener('mousemove', e => {
    const speed = Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;

    if (speed > 20) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(96,165,250,0.4);
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%,-50%);
        transition: opacity 0.5s, transform 0.5s;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.opacity = '0';
        dot.style.transform = 'translate(-50%,-50%) scale(0)';
      });
      setTimeout(() => dot.remove(), 500);
    }
  }, { passive: true });
})();

// ══════════════════════════════════════════════════════════
// 14. PAGE LOAD FADE-IN
// ══════════════════════════════════════════════════════════
(function initPageLoad() {
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.5s ease';
  window.addEventListener('load', () => {
    document.documentElement.style.opacity = '1';
  });
})();
