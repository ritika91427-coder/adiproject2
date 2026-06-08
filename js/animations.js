'use strict';

/* ============================================
   Wangduk Health — Premium Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Page Load Progress Bar ──────────────────
  const bar = document.createElement('div');
  bar.id = 'page-progress';
  document.body.prepend(bar);

  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    scrollProgress = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = scrollProgress + '%';
  }, { passive: true });


  // ── Hero Title — Word-by-Word Animation ─────
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const words = heroTitle.textContent.split(' ');
    heroTitle.innerHTML = words
      .map((w, i) => `<span class="word" style="animation-delay:${0.2 + i * 0.09}s">${w}</span>`)
      .join(' ');
  }


  // ── Hero Subtitle & Badge Fade-in ────────────
  const heroSub = document.querySelector('.hero__subtitle');
  if (heroSub) {
    heroSub.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity 0.8s ease 0.9s,transform 0.8s ease 0.9s';
    setTimeout(() => { heroSub.style.opacity = '1'; heroSub.style.transform = 'translateY(0)'; }, 50);
  }
  const heroActions = document.querySelector('.hero__actions');
  if (heroActions) {
    heroActions.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity 0.8s ease 1.2s,transform 0.8s ease 1.2s';
    setTimeout(() => { heroActions.style.opacity = '1'; heroActions.style.transform = 'translateY(0)'; }, 50);
  }


  // ── Floating Particles on Hero ───────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    const colors = ['rgba(59,130,246,0.6)', 'rgba(139,92,246,0.5)', 'rgba(6,182,212,0.5)', 'rgba(255,255,255,0.4)'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'hero__particle';
      const size = 3 + Math.random() * 6;
      p.style.cssText = [
        `width:${size}px`, `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `animation-duration:${6 + Math.random() * 10}s`,
        `animation-delay:${Math.random() * 8}s`
      ].join(';');
      hero.appendChild(p);
    }
  }


  // ── Stat Card Counter Animation ──────────────
  const counters = document.querySelectorAll('.stat-card__number');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = '1';
      animateCounter(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const text = el.textContent.trim();
    const numMatch = text.match(/[\d]+/);
    if (!numMatch) return;

    const target = parseInt(numMatch[0]);
    const prefix = text.slice(0, numMatch.index);
    const suffix = text.slice(numMatch.index + numMatch[0].length);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = text;
    }
    requestAnimationFrame(update);
  }


  // ── Enhanced Staggered Reveal ────────────────
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));


  // ── Director section reveal directions ───────
  const directorPhoto = document.querySelector('.director__photo');
  const directorContent = document.querySelector('.director__content');
  if (directorPhoto) directorPhoto.classList.add('reveal--left');
  if (directorContent) directorContent.classList.add('reveal--right');

  // Expert team
  const teamContent = document.querySelector('.expert-team__content');
  const teamImage = document.querySelector('.expert-team__image-wrap');
  if (teamContent) teamContent.classList.add('reveal--left');
  if (teamImage) teamImage.classList.add('reveal--right');


  // ── Magnetic Buttons ─────────────────────────
  const magnetBtns = document.querySelectorAll('.btn--primary, .btn--nav');
  magnetBtns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });


  // ── Card Tilt Effect ─────────────────────────
  const tiltCards = document.querySelectorAll('.feature-card, .service-card, .stat-card, .contact-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = ((y - cy) / cy) * 5;
      const tiltY = ((cx - x) / cx) * 5;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  // ── Section Header Scale-In ───────────────────
  const sectionHeaders = document.querySelectorAll('.section__header');
  sectionHeaders.forEach(el => el.classList.add('reveal--scale'));


  // ── Parallax on Hero ─────────────────────────
  const heroCarousel = document.querySelector('.hero__carousel');
  if (heroCarousel && window.matchMedia('(min-width: 768px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroH = heroCarousel.parentElement.offsetHeight;
          if (scrollY < heroH) {
            heroCarousel.style.transform = `translateY(${scrollY * 0.35}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  // ── Service card link underline draw ─────────
  const links = document.querySelectorAll('.service-card__link');
  links.forEach(link => {
    link.style.cssText += ';background-image:linear-gradient(currentColor,currentColor);background-position:0% 100%;background-size:0% 2px;background-repeat:no-repeat;transition:background-size 0.3s ease,gap 0.3s ease,color 0.3s ease';
    link.parentElement.parentElement.addEventListener('mouseenter', () => {
      link.style.backgroundSize = '100% 2px';
    });
    link.parentElement.parentElement.addEventListener('mouseleave', () => {
      link.style.backgroundSize = '0% 2px';
    });
  });


  // ── Features trust bar stagger ───────────────
  const trustItems = document.querySelectorAll('.trust-item');
  trustItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(16px)';
    item.style.transition = `opacity 0.5s ease ${0.1 + i * 0.1}s, transform 0.5s ease ${0.1 + i * 0.1}s`;
  });

  const trustObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        trustItems.forEach(item => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        });
        trustObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const trustBar = document.querySelector('.features__trust-bar');
  if (trustBar) trustObserver.observe(trustBar);


  // ── Footer Links hover underline ─────────────
  const footerLinks = document.querySelectorAll('.footer__links a, .footer__contact a');
  footerLinks.forEach(link => {
    link.style.transition = 'color 0.25s ease, padding-left 0.25s ease';
    link.addEventListener('mouseenter', () => { link.style.paddingLeft = '6px'; });
    link.addEventListener('mouseleave', () => { link.style.paddingLeft = '0'; });
  });

});
