'use strict';

/* ============================================
   Wangduk Health — Animation Engine
   Studio-grade: lerp tilt, clip-path reveals,
   expo easing, no cheap loops
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. HERO TITLE — word slide-up from clip
     Each word is wrapped in an overflow:hidden
     container so the slide looks like the text
     is being revealed from behind a mask.
  ───────────────────────────────────────────── */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const raw = heroTitle.textContent.trim();
    heroTitle.innerHTML = raw
      .split(' ')
      .map((word, i) =>
        `<span class="hero__word-wrap" aria-hidden="true">`+
          `<span class="hero__word" style="animation-delay:${0.18 + i * 0.1}s">${word}</span>`+
        `</span>`
      )
      .join(' ');

    // Accessible fallback: keep text readable for screen readers
    heroTitle.setAttribute('aria-label', raw);
  }


  /* ─────────────────────────────────────────
     2. SCROLL REVEAL — IntersectionObserver
  ───────────────────────────────────────────── */
  // Director and team — add directional classes before observing
  const directorPhoto   = document.querySelector('.director__photo');
  const directorContent = document.querySelector('.director__content');
  if (directorPhoto)   directorPhoto.classList.add('reveal', 'reveal--left');
  if (directorContent) directorContent.classList.add('reveal', 'reveal--right');

  const teamContent = document.querySelector('.expert-team__content');
  const teamImage   = document.querySelector('.expert-team__image-wrap');
  if (teamContent) teamContent.classList.add('reveal', 'reveal--left');
  if (teamImage)   teamImage.classList.add('reveal', 'reveal--right');

  // Section headers scale-in
  document.querySelectorAll('.section__header').forEach(el => {
    el.classList.add('reveal--scale');
  });

  // Observer — fires once per element, then disconnects it
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));


  /* ─────────────────────────────────────────
     3. TILT — smooth lerp, RAF-driven
     No snapping: target values update on mouse-
     move; a running RAF loop lerps current →
     target every frame so the motion is fluid.
  ───────────────────────────────────────────── */
  const TILT_MAX    = 6;    // degrees
  const LERP_FACTOR = 0.10; // lower = smoother/slower tracking

  function lerp(a, b, t) { return a + (b - a) * t; }

  const tiltCards = document.querySelectorAll(
    '.feature-card, .service-card, .contact-card'
  );

  tiltCards.forEach(card => {
    let rafId   = null;
    let inside  = false;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    function tick() {
      currentX = lerp(currentX, targetX, LERP_FACTOR);
      currentY = lerp(currentY, targetY, LERP_FACTOR);

      card.style.transform =
        `perspective(900px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(4px)`;

      // Stop RAF when card is idle and not hovered
      if (!inside &&
          Math.abs(currentX) < 0.01 &&
          Math.abs(currentY) < 0.01) {
        card.style.transform = '';
        cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5; // -0.5 → 0.5
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      targetY =  nx * TILT_MAX;
      targetX = -ny * TILT_MAX;
    });

    card.addEventListener('mouseenter', () => {
      inside = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseleave', () => {
      inside  = false;
      targetX = 0;
      targetY = 0;
      // Let the RAF loop wind down naturally
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
  });


  /* ─────────────────────────────────────────
     4. MAGNETIC BUTTONS — subtle pull
  ───────────────────────────────────────────── */
  const MAGNET_STRENGTH = 0.22;

  document.querySelectorAll('.btn--primary, .btn--nav').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * MAGNET_STRENGTH;
      const dy = (e.clientY - r.top  - r.height / 2) * MAGNET_STRENGTH;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });


  /* ─────────────────────────────────────────
     5. HERO PARALLAX — passive, rAF-throttled
  ───────────────────────────────────────────── */
  const heroCarousel = document.querySelector('.hero__carousel');
  if (heroCarousel && window.matchMedia('(min-width: 768px)').matches) {
    const heroEl  = heroCarousel.parentElement;
    let ticking   = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < heroEl.offsetHeight) {
          heroCarousel.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     6. TRUST BAR — staggered reveal via class
  ───────────────────────────────────────────── */
  const trustBar = document.querySelector('.features__trust-bar');
  if (trustBar) {
    const items = trustBar.querySelectorAll('.trust-item');
    items.forEach((item, i) => {
      item.classList.add('reveal');
      item.style.transitionDelay = `${i * 90}ms`;
    });
    io.observe(trustBar); // reuse the same observer
  }

});
