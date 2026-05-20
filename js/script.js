/* ================================================================
   DISCOVER TRIPURA — Main Script
   Form submissions are handled by Netlify Forms.
   Email notifications are configured in the Netlify dashboard.
   ================================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initHeroSlider();
    initHeroReveal();
    initScrollReveal();
    initForm();
    initSmoothScroll();
  });
})();

/* ================================================================
   NAVBAR — transparent on hero, dark + compact on scroll
   ================================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ================================================================
   HERO SLIDER — auto-advances every 6 seconds
   ================================================================ */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
      startTimer();
    });
  });

  startTimer();
}

/* ================================================================
   HERO CONTENT REVEAL — fires once on load
   ================================================================ */
function initHeroReveal() {
  const items = document.querySelectorAll('.reveal-up');
  items.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add('in');
    }, 300 + i * 150);
  });
}

/* ================================================================
   SCROLL REVEAL — Intersection Observer on [data-reveal] elements
   ================================================================ */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    observer.observe(el);
  });
}

/* ================================================================
   SMOOTH SCROLL — polyfill-free via scrollIntoView
   ================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
}

/* ================================================================
   BOOKING FORM — validation + EmailJS / mailto fallback
   ================================================================ */
function initForm() {
  const form      = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;
    submitEnquiry();
  });

  // Live clear error on input
  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () { clearError(this); });
    field.addEventListener('change', function () { clearError(this); });
  });
}

function validateForm() {
  let valid = true;

  const checks = [
    { id: 'f_name',      errId: 'err_name',      msg: 'Please enter your full name.' },
    { id: 'f_email',     errId: 'err_email',      msg: 'Please enter a valid email address.' },
    { id: 'f_phone',     errId: 'err_phone',      msg: 'Please enter your phone number.' },
    { id: 'f_travelers', errId: 'err_travelers',  msg: 'Please select number of travellers.' },
    { id: 'f_month',     errId: 'err_month',      msg: 'Please select a preferred travel month.' },
  ];

  checks.forEach(function (c) {
    const field = document.getElementById(c.id);
    const err   = document.getElementById(c.errId);
    const val   = field ? field.value.trim() : '';

    if (!val) {
      showError(field, err, c.msg);
      valid = false;
    } else if (c.id === 'f_email' && !isValidEmail(val)) {
      showError(field, err, 'Please enter a valid email address.');
      valid = false;
    }
  });

  return valid;
}

function showError(field, errEl, msg) {
  if (field) field.classList.add('error');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
}

function clearError(field) {
  field.classList.remove('error');
  const errId = 'err_' + field.id.replace('f_', '');
  const errEl = document.getElementById(errId);
  if (errEl) errEl.classList.remove('visible');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setLoading(loading) {
  const btn     = document.getElementById('submitBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoad = btn.querySelector('.btn-loading');
  btn.disabled        = loading;
  btnText.style.display = loading ? 'none'         : '';
  btnLoad.style.display = loading ? 'inline-flex'  : 'none';
}

function submitEnquiry() {
  setLoading(true);

  const payload = {
    access_key:   '475c003a-9dea-42a1-8f03-287f8765caed',
    subject:      'New Tour Enquiry — Travel Tripura',
    from_name:    'Travel Tripura Website',
    name:         document.getElementById('f_name').value.trim(),
    email:        document.getElementById('f_email').value.trim(),
    phone:        document.getElementById('f_phone').value.trim(),
    travelers:    document.getElementById('f_travelers').value,
    travel_month: document.getElementById('f_month').value,
    hotel_preference: document.getElementById('f_hotel').value || 'No preference',
    message:      document.getElementById('f_message').value.trim() || 'No special requests.'
  };

  fetch('https://api.web3forms.com/submit', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      setLoading(false);
      if (data.success) {
        document.getElementById('bookingForm').reset();
        openModal();
      } else {
        throw new Error(data.message);
      }
    })
    .catch(function (err) {
      setLoading(false);
      console.error('Form error:', err);
      alert('Something went wrong. Please email us directly at tour@traveltripura.in');
    });
}

/* ================================================================
   MODAL
   ================================================================ */
function openModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('open');
  modal.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('successModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
});

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

// Expose closeModal globally (used in HTML onclick)
window.closeModal = closeModal;
