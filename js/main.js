/* ===========================
   NAVBAR SCROLL
   =========================== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ===========================
   MOBILE MENU
   =========================== */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ===========================
   ACTIVE NAV ON SCROLL
   =========================== */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.remove('active'));
    const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
    if (active) active.classList.add('active');
  });
}, { threshold: 0.35 }).observe(document.querySelector('#hero'));

sections.forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    });
  }, { threshold: 0.4 }).observe(s);
});

/* ===========================
   SCROLL FADE-IN
   =========================== */
document.querySelectorAll(
  '.section-title, .about-grid, .skills-grid, .timeline-item, .project-card, .contact-wrapper'
).forEach(el => {
  el.classList.add('fade-in');
  new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('visible'), i * 55);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 }).observe(el);
});

/* ===========================
   HERO — init all effects after load
   =========================== */
window.addEventListener('DOMContentLoaded', () => {
  heroEntrance();
  setTimeout(() => {
    initParticles();
    initTypewriter();
    initParallax();
    initCounters();
  }, 700);
});

/* ---------------------------
   Hero entrance animation
   --------------------------- */
function heroEntrance() {
  const photo = document.querySelector('.hero-photo');
  const text  = document.querySelector('.hero-text');
  [photo, text].forEach((el, i) => {
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.75s ease, transform 0.75s ease';
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 180 + i * 140);
  });
}

/* ---------------------------
   1. Canvas Particles
   --------------------------- */
function initParticles() {
  const hero   = document.querySelector('.hero');
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); spawnParticles(); });

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeParticle() {
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(1.2, 3.2),
      dx: rand(-0.35, 0.35),
      dy: rand(-0.35, 0.35),
      alpha: rand(0.08, 0.35),
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.008, 0.02),
    };
  }

  function spawnParticles() {
    particles = Array.from({ length: 32 }, makeParticle);
  }
  spawnParticles();

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108,99,255,${a})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });
    requestAnimationFrame(loop);
  })();
}

/* ---------------------------
   2. Typewriter
   --------------------------- */
function initTypewriter() {
  const tagline = document.querySelector('.hero-tagline');
  if (!tagline) return;

  const html   = tagline.innerHTML;
  tagline.innerHTML = '';
  tagline.style.minHeight = '3.6rem';

  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  tagline.appendChild(cursor);

  // Parse into char/br tokens
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const tokens = [];
  temp.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      tokens.push(...[...node.textContent].map(c => ({ t: 'c', v: c })));
    } else if (node.nodeName === 'BR') {
      tokens.push({ t: 'br' });
    }
  });

  let i = 0;
  const speed = 38;

  (function type() {
    if (i >= tokens.length) {
      setTimeout(() => cursor.classList.add('type-done'), 900);
      return;
    }
    const tok = tokens[i++];
    if (tok.t === 'c') {
      cursor.insertAdjacentText('beforebegin', tok.v);
    } else {
      cursor.insertAdjacentHTML('beforebegin', '<br>');
    }
    setTimeout(type, speed);
  })();
}

/* ---------------------------
   3. Mouse Parallax
   --------------------------- */
function initParallax() {
  const hero  = document.querySelector('.hero');
  const photo = document.querySelector('.hero-photo');
  const text  = document.querySelector('.hero-text');
  if (!photo || !text) return;

  photo.style.willChange = 'transform';
  text.style.willChange  = 'transform';

  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left  - r.width  / 2) / r.width;
    ty = (e.clientY - r.top   - r.height / 2) / r.height;
  });
  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  (function tick() {
    cx += (tx - cx) * 0.055;
    cy += (ty - cy) * 0.055;

    photo.style.transform = `translate(${cx * -20}px, ${cy * -16}px)`;
    text.style.transform  = `translate(${cx *   7}px, ${cy *   5}px)`;
    requestAnimationFrame(tick);
  })();
}

/* ---------------------------
   4. Counter animation (stats)
   --------------------------- */
function initCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const unitEl = el.querySelector('.stat-unit');
        if (!unitEl) return;                       // skip non-numeric like 'AL'

        const unitHTML = unitEl.outerHTML;
        const raw      = el.childNodes[0].nodeValue.trim();
        const target   = parseFloat(raw);
        if (isNaN(target)) return;

        const isFloat  = !Number.isInteger(target);
        const duration = 1300;
        let   start    = null;

        requestAnimationFrame(function step(ts) {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.childNodes[0].nodeValue = isFloat ? val.toFixed(2) : String(Math.round(val));
          if (progress < 1) requestAnimationFrame(step);
        });

        obs.unobserve(el);
      });
    }, { threshold: 0.6 }).observe(el);
  });
}
