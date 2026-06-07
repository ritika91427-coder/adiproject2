/**
 * Wangduk Health and Research — Main JavaScript
 */

(function () {
  'use strict';

  // ── DOM Elements ──
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const heroCarousel = document.getElementById('heroCarousel');
  const heroDots = document.querySelectorAll('.hero__dot');
  const heroSlides = document.querySelectorAll('.hero__slide');
  const appointmentForm = document.getElementById('appointmentForm');
  const formSuccess = document.getElementById('formSuccess');
  const bookAnother = document.getElementById('bookAnother');
  const navLinks = document.querySelectorAll('.nav__link');
  const dateInput = document.getElementById('date');

  // ── Header Scroll Effect ──
  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── Mobile Navigation ──
  let navOverlay = document.querySelector('.nav-overlay');
  if (!navOverlay) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navOverlay);
  }

  function toggleNav(forceClose) {
    const isOpen = forceClose === true ? false : !nav.classList.contains('open');
    nav.classList.toggle('open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    navOverlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleNav());
  navOverlay.addEventListener('click', () => toggleNav(true));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => toggleNav(true));
  });

  // ── Smooth Scroll & Active Nav ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ── Hero Carousel ──
  let currentSlide = 0;
  let carouselInterval;
  const SLIDE_DURATION = 6000;

  function goToSlide(index) {
    currentSlide = index;
    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('hero__slide--active', i === index);
    });
    heroDots.forEach((dot, i) => {
      dot.classList.toggle('hero__dot--active', i === index);
      dot.setAttribute('aria-selected', i === index);
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }

  function startCarousel() {
    stopCarousel();
    carouselInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide, 10));
      startCarousel();
    });
  });

  if (heroCarousel) {
    heroCarousel.addEventListener('mouseenter', stopCarousel);
    heroCarousel.addEventListener('mouseleave', startCarousel);
    startCarousel();
  }

  // ── Scroll Reveal Animation ──
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ── Set Minimum Date for Appointment ──
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // ── Form Validation ──
  const validators = {
    fullName: (value) => {
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Please enter a valid name';
      return '';
    },
    phone: (value) => {
      if (!value.trim()) return 'Phone number is required';
      if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ''))) return 'Enter a valid 10-digit phone number';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
      return '';
    },
    department: (value) => {
      if (!value) return 'Please select a department';
      return '';
    },
    date: (value) => {
      if (!value) return 'Please select a date';
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return 'Date cannot be in the past';
      return '';
    },
    time: (value) => {
      if (!value) return 'Please select a time';
      return '';
    },
  };

  function validateField(name, value) {
    const validator = validators[name];
    if (!validator) return true;

    const error = validator(value);
    const input = document.getElementById(name);
    const errorEl = document.getElementById(`${name}Error`);

    if (error) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = error;
      return false;
    }

    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  if (appointmentForm) {
    Object.keys(validators).forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        input.addEventListener('blur', () => validateField(field, input.value));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            validateField(field, input.value);
          }
        });
      }
    });

    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      Object.keys(validators).forEach((field) => {
        const input = document.getElementById(field);
        if (input && !validateField(field, input.value)) {
          isValid = false;
        }
      });

      if (!isValid) {
        const firstError = appointmentForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      appointmentForm.hidden = true;
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (bookAnother) {
    bookAnother.addEventListener('click', () => {
      appointmentForm.reset();
      Object.keys(validators).forEach((field) => {
        const input = document.getElementById(field);
        const errorEl = document.getElementById(`${field}Error`);
        if (input) input.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
      });
      formSuccess.hidden = true;
      appointmentForm.hidden = false;
    });
  }

  // ── Keyboard: Escape closes mobile nav ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggleNav(true);
    }
  });
})();
