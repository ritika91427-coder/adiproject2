/**
 * Wangduk Health and Research — Main JavaScript
 */

// Always open at the top — disable browser scroll restoration
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  'use strict';

  // ── DOM Elements ──
  const header = document.getElementById('header');
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
      nav.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── Mobile Navigation (hamburger removed — nav is always visible) ──
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });

  // ── Smooth Scroll & Active Nav ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
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

    appointmentForm.addEventListener('submit', async (e) => {
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

      const submitBtn = appointmentForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Confirming…';
      }

      const payload = {
        fullName:   document.getElementById('fullName').value.trim(),
        phone:      document.getElementById('phone').value.trim(),
        email:      document.getElementById('email').value.trim(),
        department: document.getElementById('department').value,
        date:       document.getElementById('date').value,
        time:       document.getElementById('time').value,
        message:    (document.getElementById('message') ? document.getElementById('message').value.trim() : '')
      };

      try {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          appointmentForm.hidden = true;
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert(data.error || 'Something went wrong. Please try again.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
      } catch {
        alert('Unable to reach the server. Please check your connection and try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
      }
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


  // ── Updates (API-backed) ──────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatUpdateDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async function renderPublicUpdates() {
    const list  = document.getElementById('updatesCardList');
    const empty = document.getElementById('updatesCardEmpty');
    if (!list) return;
    try {
      const res     = await fetch('/api/updates');
      const updates = await res.json();
      Array.from(list.querySelectorAll('.update-item')).forEach(el => el.remove());
      if (!Array.isArray(updates) || updates.length === 0) {
        if (empty) empty.hidden = false;
      } else {
        if (empty) empty.hidden = true;
        updates.forEach(u => {
          const item = document.createElement('div');
          item.className = 'update-item';
          item.innerHTML = `
            <div class="update-item__title">${escapeHtml(u.title)}</div>
            <div class="update-item__body">${escapeHtml(u.body)}</div>
            <div class="update-item__date">${formatUpdateDate(u.created_at)}</div>`;
          list.appendChild(item);
        });
      }
    } catch {
      if (empty) empty.hidden = false;
    }
  }

  // Admin overlay (legacy inline panel — kept for ESC key only)
  const adminOverlay = document.getElementById('adminOverlay');
  const adminClose   = document.getElementById('adminClose');
  const adminTrigger = document.getElementById('adminTrigger');

  if (adminTrigger) {
    adminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/admin';
    });
  }
  if (adminClose && adminOverlay) {
    adminClose.addEventListener('click', () => { adminOverlay.hidden = true; document.body.style.overflow = ''; });
  }
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => { e.preventDefault(); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminOverlay && !adminOverlay.hidden) {
      adminOverlay.hidden = true;
      document.body.style.overflow = '';
    }
  });

  // Initial render
  renderPublicUpdates();

  // ── Appointment Status Tracker ─────────────────────────────────────────
  const trackerInput  = document.getElementById('trackerInput');
  const trackerBtn    = document.getElementById('trackerBtn');
  const trackerResult = document.getElementById('trackerResult');
  const trackerFound  = document.getElementById('trackerFound');
  const trackerError  = document.getElementById('trackerError');
  const trackerErrorMsg = document.getElementById('trackerErrorMsg');

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour % 12 || 12;
    return `${display}:${m} ${ampm}`;
  }

  function setSteps(status) {
    const steps    = document.querySelectorAll('.tracker__step');
    const lines    = document.querySelectorAll('.tracker__step-line');
    const order    = ['Pending', 'Confirmed', 'Completed'];
    const activeIdx = order.indexOf(status);
    const cancelled = status === 'Cancelled';

    steps.forEach((step, i) => {
      step.classList.remove('is-active', 'is-done', 'is-cancelled');
      if (cancelled) {
        if (i === 0) step.classList.add('is-cancelled');
      } else {
        if (i < activeIdx)  step.classList.add('is-done');
        if (i === activeIdx) step.classList.add('is-active');
      }
    });

    lines.forEach((line, i) => {
      line.classList.remove('is-done');
      if (!cancelled && i < activeIdx) line.classList.add('is-done');
    });
  }

  function showResult(data) {
    trackerResult.hidden = false;
    trackerFound.hidden  = false;
    trackerError.hidden  = true;

    const badge = document.getElementById('trackerBadge');
    const statusKey = (data.status || 'pending').toLowerCase();
    badge.className = `tracker__badge tracker__badge--${statusKey}`;
    badge.textContent = data.status;

    document.getElementById('trackerApptId').textContent = `Appointment #${data.id}`;
    document.getElementById('trackerName').textContent   = data.full_name;
    document.getElementById('trackerDept').textContent   = data.department;
    document.getElementById('trackerDate').textContent   = formatDate(data.appointment_date);
    document.getElementById('trackerTime').textContent   = formatTime(data.appointment_time);

    setSteps(data.status);
  }

  function showError(msg) {
    trackerResult.hidden = false;
    trackerFound.hidden  = true;
    trackerError.hidden  = false;
    trackerErrorMsg.textContent = msg;
  }

  async function checkStatus() {
    const id = trackerInput.value.trim();
    if (!id || isNaN(id) || parseInt(id) < 1) {
      showError('Please enter a valid appointment ID.');
      trackerResult.hidden = false;
      return;
    }

    trackerBtn.classList.add('is-loading');
    trackerBtn.textContent = 'Checking…';

    try {
      const res  = await fetch(`/api/appointments/status/${parseInt(id)}`);
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Something went wrong. Please try again.');
      } else {
        showResult(data);
      }
    } catch {
      showError('Could not reach the server. Please check your connection.');
    } finally {
      trackerBtn.classList.remove('is-loading');
      trackerBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Check Status`;
    }
  }

  if (trackerBtn) {
    trackerBtn.addEventListener('click', checkStatus);
    trackerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkStatus(); });
  }
})();
