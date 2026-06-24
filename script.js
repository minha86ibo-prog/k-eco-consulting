/* =========================================================
   K-ECO CONSULTING — script.js
   Handles: Nav scroll, hamburger, reveal animations,
            hero canvas particles, 3D container particles,
            counter animations, strength bars, contact form
   ========================================================= */

'use strict';

/* ─── NAV SCROLL ─────────────────────────────────────────── */
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  // Animate hamburger to X
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity = '';
    });
  });
});

/* ─── HERO CANVAS PARTICLES ──────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.5 + 0.4,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:  -(Math.random() * 0.5 + 0.2),
      a:    Math.random(),
      da:   Math.random() * 0.003 + 0.001,
      color: Math.random() > 0.6 ? '#00C16E' : '#1D4ED8'
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(W * H / 8000), 120);
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,193,110,${(1 - d / maxDist) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.da;
      if (p.a > 1) p.da = -p.da;
      if (p.a < 0) p.da = -p.da;
      if (p.y < -10)  p.y = H + 10;
      if (p.x < -10)  p.x = W + 10;
      if (p.x > W+10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(')', `,${p.a})`).replace('rgb', 'rgba').replace('#', '');
      // simpler alpha approach:
      ctx.globalAlpha = p.a * 0.7;
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    animId = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => {
    resize();
    initParticles();
  });
  ro.observe(canvas.parentElement);

  resize();
  initParticles();
  tick();
})();

/* ─── 3D CONTAINER FLOATING PARTICLES ───────────────────── */
(function initContainerParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 14; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      border-radius: 50%;
      background: ${Math.random() > 0.5 ? '#00C16E' : '#1D4ED8'};
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      opacity: 0;
      animation: floatDot ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite;
    `;
    container.appendChild(dot);
  }

  // Inject keyframes once
  if (!document.getElementById('dotKf')) {
    const style = document.createElement('style');
    style.id = 'dotKf';
    style.textContent = `
      @keyframes floatDot {
        0%   { opacity: 0; transform: translateY(0) scale(0); }
        30%  { opacity: .8; }
        70%  { opacity: .4; }
        100% { opacity: 0; transform: translateY(-40px) scale(1.5); }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ─── INTERSECTION OBSERVER (REVEAL + COUNTERS + BARS) ──── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── COUNTER ANIMATION ──────────────────────────────────── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat__num').forEach(el => counterObserver.observe(el));

/* ─── STRENGTH BARS ──────────────────────────────────────── */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill = entry.target;
    fill.style.width = fill.dataset.width + '%';
    barObserver.unobserve(fill);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.strength__fill').forEach(el => barObserver.observe(el));

/* ─── CONTACT FORM ───────────────────────────────────────── */
const form    = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simple validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#EF4444';
        valid = false;
        field.addEventListener('input', () => field.style.borderColor = '', { once: true });
      }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '전송 중...';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      form.reset();
      btn.textContent = '상담 신청하기';
      btn.disabled = false;
      success.classList.add('visible');
      setTimeout(() => success.classList.remove('visible'), 5000);
    }, 1200);
  });
}

/* ─── SMOOTH SECTION HIGHLIGHT ───────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--green)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── HERO PARALLAX (subtle) ─────────────────────────────── */
const heroContent = document.querySelector('.hero__content');
window.addEventListener('scroll', () => {
  if (heroContent && window.scrollY < window.innerHeight) {
    heroContent.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }
}, { passive: true });

/* ─── ECO FINANCE PROCESS REVEAL ─────────────────────────── */
const processObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    processObserver.unobserve(entry.target);
    const steps = entry.target.querySelectorAll('.flow-step');
    steps.forEach((step, index) => {
      step.style.transitionDelay = `${index * 0.15}s`;
      step.classList.add('is-visible');
    });
  });
}, { threshold: 0.15 });

const financeFlow = document.querySelector('.finance__flow');
if (financeFlow) processObserver.observe(financeFlow);
