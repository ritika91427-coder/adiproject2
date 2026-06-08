'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. HERO TITLE — word slide-up from clip
  ───────────────────────────────────────────── */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const raw = heroTitle.textContent.trim();
    heroTitle.innerHTML = raw
      .split(' ')
      .map((word, i) =>
        `<span class="hero__word-wrap" aria-hidden="true">` +
          `<span class="hero__word" style="animation-delay:${0.15 + i * 0.08}s">${word}</span>` +
        `</span>`
      )
      .join(' ');
    heroTitle.setAttribute('aria-label', raw);
  }

  /* ─────────────────────────────────────────
     2. SCROLL REVEAL — IntersectionObserver
  ───────────────────────────────────────────── */
  const directorPhoto   = document.querySelector('.director__photo');
  const directorContent = document.querySelector('.director__content');
  if (directorPhoto)   directorPhoto.classList.add('reveal', 'reveal--left');
  if (directorContent) directorContent.classList.add('reveal', 'reveal--right');

  const teamContent = document.querySelector('.expert-team__content');
  const teamImage   = document.querySelector('.expert-team__image-wrap');
  if (teamContent) teamContent.classList.add('reveal', 'reveal--left');
  if (teamImage)   teamImage.classList.add('reveal', 'reveal--right');

  document.querySelectorAll('.section__header').forEach(el => {
    el.classList.add('reveal--scale');
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale').forEach(el => io.observe(el));

  /* ─────────────────────────────────────────
     2b. STAGGERED CARD REVEALS
     Cards slide up one by one as the section
     scrolls into view.
  ───────────────────────────────────────────── */
  const cardGroups = [
    '.features__grid .feature-card',
    '.services__grid .service-card',
    '.team__grid .team-card',
    '.testimonials__track .testimonial-card',
    '.stats__grid .stat-item',
    '.updates-card__list .update-item',
  ];

  cardGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s`;
      card.style.willChange = 'transform, opacity';

      const cardObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          cardObs.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

      cardObs.observe(card);
    });
  });


  /* ─────────────────────────────────────────
     3. TILT — smooth lerp, RAF-driven
  ───────────────────────────────────────────── */
  const TILT_MAX    = 5;
  const LERP_FACTOR = 0.07;

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
        `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(6px)`;

      if (!inside &&
          Math.abs(currentX) < 0.005 &&
          Math.abs(currentY) < 0.005) {
        card.style.transform = '';
        cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
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
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
  });


  /* ─────────────────────────────────────────
     4. MAGNETIC BUTTONS — lerp-smooth return
  ───────────────────────────────────────────── */
  const MAGNET_STRENGTH = 0.2;

  document.querySelectorAll('.btn--primary, .btn--nav').forEach(btn => {
    let rafId = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let hovering = false;

    function magnetTick() {
      cx = lerp(cx, tx, 0.12);
      cy = lerp(cy, ty, 0.12);
      btn.style.transform = `translate(${cx}px, ${cy}px)`;

      if (!hovering && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        btn.style.transform = '';
        cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(magnetTick);
    }

    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width  / 2) * MAGNET_STRENGTH;
      ty = (e.clientY - r.top  - r.height / 2) * MAGNET_STRENGTH;
    });

    btn.addEventListener('mouseenter', () => {
      hovering = true;
      if (!rafId) rafId = requestAnimationFrame(magnetTick);
    });

    btn.addEventListener('mouseleave', () => {
      hovering = false;
      tx = 0; ty = 0;
      if (!rafId) rafId = requestAnimationFrame(magnetTick);
    });
  });


  /* ─────────────────────────────────────────
     5. HERO PARALLAX — passive, rAF-throttled
  ───────────────────────────────────────────── */
  const heroCarousel = document.querySelector('.hero__carousel');
  if (heroCarousel && window.matchMedia('(min-width: 768px)').matches) {
    const heroEl = heroCarousel.parentElement;
    let ticking  = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < heroEl.offsetHeight) {
          heroCarousel.style.transform = `translateY(${scrollY * 0.25}px)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     6. TRUST BAR — staggered reveal
  ───────────────────────────────────────────── */
  const trustBar = document.querySelector('.features__trust-bar');
  if (trustBar) {
    const items = trustBar.querySelectorAll('.trust-item');
    items.forEach((item, i) => {
      item.classList.add('reveal');
      item.style.transitionDelay = `${i * 80}ms`;
    });
    io.observe(trustBar);
  }

});
