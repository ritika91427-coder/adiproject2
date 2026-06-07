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

  // ── Updates & Admin Panel ──
  const STORAGE_KEY = 'whr_updates';
  const ADMIN_PASSWORD = 'wangduk@admin';

  function getUpdates() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveUpdates(updates) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Render updates in the public card
  function renderPublicUpdates() {
    const list = document.getElementById('updatesCardList');
    const empty = document.getElementById('updatesCardEmpty');
    if (!list) return;
    const updates = getUpdates();

    // Remove old items (keep empty placeholder)
    Array.from(list.querySelectorAll('.update-item')).forEach((el) => el.remove());

    if (updates.length === 0) {
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      updates.forEach((u) => {
        const item = document.createElement('div');
        item.className = 'update-item';
        item.innerHTML = `
          <div class="update-item__title">${escapeHtml(u.title)}</div>
          <div class="update-item__body">${escapeHtml(u.body)}</div>
          <div class="update-item__date">${formatDate(u.date)}</div>`;
        list.appendChild(item);
      });
    }
  }

  // Render updates in admin dashboard list
  function renderAdminUpdates() {
    const list = document.getElementById('adminUpdatesList');
    const emptyMsg = document.getElementById('adminListEmpty');
    if (!list) return;
    const updates = getUpdates();

    Array.from(list.querySelectorAll('.admin-update-row')).forEach((el) => el.remove());

    if (updates.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
    } else {
      if (emptyMsg) emptyMsg.hidden = true;
      updates.forEach((u, idx) => {
        const row = document.createElement('div');
        row.className = 'admin-update-row';
        row.innerHTML = `
          <div class="admin-update-row__content">
            <div class="admin-update-row__title">${escapeHtml(u.title)}</div>
            <div class="admin-update-row__body">${escapeHtml(u.body)}</div>
            <div class="admin-update-row__date">${formatDate(u.date)}</div>
          </div>
          <button class="admin-update-row__delete" aria-label="Delete update" data-idx="${idx}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>`;
        list.appendChild(row);
      });

      list.querySelectorAll('.admin-update-row__delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.dataset.idx, 10);
          const updates = getUpdates();
          updates.splice(i, 1);
          saveUpdates(updates);
          renderAdminUpdates();
          renderPublicUpdates();
        });
      });
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Admin modal elements
  const adminOverlay = document.getElementById('adminOverlay');
  const adminClose = document.getElementById('adminClose');
  const adminTrigger = document.getElementById('adminTrigger');
  const adminLogin = document.getElementById('adminLogin');
  const adminDashboard = document.getElementById('adminDashboard');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  const adminPasswordInput = document.getElementById('adminPassword');
  const adminPasswordError = document.getElementById('adminPasswordError');
  const postUpdateBtn = document.getElementById('postUpdateBtn');
  const updateTitleInput = document.getElementById('updateTitle');
  const updateBodyInput = document.getElementById('updateBody');
  const updateTitleError = document.getElementById('updateTitleError');
  const updateBodyError = document.getElementById('updateBodyError');

  let adminLoggedIn = false;

  function openAdmin() {
    adminOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (adminLoggedIn) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function closeAdmin() {
    adminOverlay.hidden = true;
    document.body.style.overflow = '';
    if (adminPasswordInput) {
      adminPasswordInput.value = '';
      adminPasswordError.textContent = '';
    }
  }

  function showLogin() {
    adminLogin.hidden = false;
    adminDashboard.hidden = true;
    setTimeout(() => adminPasswordInput && adminPasswordInput.focus(), 50);
  }

  function showDashboard() {
    adminLogin.hidden = true;
    adminDashboard.hidden = false;
    renderAdminUpdates();
  }

  if (adminTrigger) {
    adminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openAdmin();
    });
  }

  if (adminClose) {
    adminClose.addEventListener('click', closeAdmin);
  }

  if (adminOverlay) {
    adminOverlay.addEventListener('click', (e) => {
      if (e.target === adminOverlay) closeAdmin();
    });
  }

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      const val = adminPasswordInput ? adminPasswordInput.value : '';
      if (!val) {
        adminPasswordError.textContent = 'Please enter the password.';
        return;
      }
      if (val !== ADMIN_PASSWORD) {
        adminPasswordError.textContent = 'Incorrect password. Please try again.';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
        return;
      }
      adminPasswordError.textContent = '';
      adminLoggedIn = true;
      showDashboard();
    });

    adminPasswordInput && adminPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') adminLoginBtn.click();
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      adminLoggedIn = false;
      showLogin();
    });
  }

  if (postUpdateBtn) {
    postUpdateBtn.addEventListener('click', () => {
      const title = updateTitleInput ? updateTitleInput.value.trim() : '';
      const body = updateBodyInput ? updateBodyInput.value.trim() : '';
      let valid = true;

      if (!title) {
        updateTitleError.textContent = 'Please enter a title.';
        valid = false;
      } else {
        updateTitleError.textContent = '';
      }

      if (!body) {
        updateBodyError.textContent = 'Please enter a message.';
        valid = false;
      } else {
        updateBodyError.textContent = '';
      }

      if (!valid) return;

      const updates = getUpdates();
      updates.unshift({ title, body, date: new Date().toISOString() });
      saveUpdates(updates);

      updateTitleInput.value = '';
      updateBodyInput.value = '';
      renderAdminUpdates();
      renderPublicUpdates();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminOverlay && !adminOverlay.hidden) {
      closeAdmin();
    }
  });

  // Initial render
  renderPublicUpdates();
})();
