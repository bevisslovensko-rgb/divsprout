/**
 * DIVSPROUT — CORE JS
 * Vanilla JS. No dependencies. No frameworks.
 * Lightweight, modular, tree-shakeable by hand.
 *
 * Modules:
 *  1. Nav (mobile toggle, scroll state)
 *  2. ScrollReveal (Intersection Observer)
 *  3. FAQ (accordion)
 *  4. NumberCounter (animated counting)
 *  5. Analytics (event helpers)
 *  6. Utils
 */

'use strict';

/* ── 1. Navigation ────────────────────────────────────────── */
const Nav = {
  init() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');

    if (!nav) return;

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        hamburger.setAttribute('aria-expanded', isOpen);
        // Animate hamburger lines
        hamburger.classList.toggle('is-active', isOpen);
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
          mobileMenu.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', false);
          hamburger.classList.remove('is-active');
        }
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('is-open');
          hamburger.classList.remove('is-active');
        });
      });
    }

    // Active link
    const currentPath = window.location.pathname;
    nav.querySelectorAll('.nav__link').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('nav__link--active');
      }
    });
  }
};

/* ── 2. Scroll Reveal ─────────────────────────────────────── */
const ScrollReveal = {
  observer: null,

  init() {
    const elements = document.querySelectorAll('.reveal, .stagger');
    if (!elements.length) return;

    // Immediately show if reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => {
        el.classList.add('is-visible');
        if (el.classList.contains('stagger')) {
          el.querySelectorAll('*').forEach(child => child.style.opacity = 1);
        }
      });
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      }
    );

    elements.forEach(el => this.observer.observe(el));
  },

  destroy() {
    if (this.observer) this.observer.disconnect();
  }
};

/* ── 3. FAQ Accordion ─────────────────────────────────────── */
const FAQ = {
  init() {
    const items = document.querySelectorAll('.faq__item');
    if (!items.length) return;

    items.forEach(item => {
      const question = item.querySelector('.faq__question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all others (single open at a time)
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.faq__question')
              ?.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current
        item.classList.toggle('is-open', !isOpen);
        question.setAttribute('aria-expanded', !isOpen);

        // Analytics
        if (!isOpen) {
          Analytics.event('faq_open', {
            question: question.textContent.trim().slice(0, 80)
          });
        }
      });
    });
  }
};

/* ── 4. Number Counter (animated) ────────────────────────── */
const NumberCounter = {
  /**
   * Animate a number from 0 to target.
   * @param {HTMLElement} el  - Target element
   * @param {number} target   - End value
   * @param {object} options  - { duration, prefix, suffix, decimals }
   */
  animate(el, target, options = {}) {
    const {
      duration = 800,
      prefix = '',
      suffix = '',
      decimals = 0
    } = options;

    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + (target - startVal) * ease;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  },

  /**
   * Init all [data-count] elements on scroll reveal
   */
  initAll() {
    const elements = document.querySelectorAll('[data-count]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const decimals = parseInt(el.dataset.decimals || 0);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          const duration = parseInt(el.dataset.duration || 1000);

          this.animate(el, target, { duration, prefix, suffix, decimals });
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    elements.forEach(el => observer.observe(el));
  }
};

/* ── 5. Analytics Event Helpers ───────────────────────────── */
const Analytics = {
  /**
   * Fire a GA4 / gtag event.
   * Fails silently if gtag not loaded.
   */
  event(name, params = {}) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', name, params);
      }
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Track calculator usage
   */
  trackCalculator(name, inputs = {}) {
    this.event('calculator_used', {
      calculator_name: name,
      ...inputs
    });
  },

  /**
   * Track affiliate click
   */
  trackAffiliate(name, position) {
    this.event('affiliate_click', {
      affiliate_name: name,
      position: position
    });
  },

  /**
   * Track tool share / copy
   */
  trackShare(method, calculator) {
    this.event('share', {
      method,
      content_type: 'calculator',
      content_id: calculator
    });
  }
};

/* ── 6. Utils ─────────────────────────────────────────────── */
const Utils = {
  /**
   * Format a number as currency string.
   * @param {number} value
   * @param {string} currency - 'USD', 'EUR', etc.
   * @param {number} decimals
   */
  formatCurrency(value, currency = 'USD', decimals = 2) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  /**
   * Format a number with commas.
   */
  formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  /**
   * Format as percentage.
   */
  formatPercent(value, decimals = 2) {
    return value.toFixed(decimals) + '%';
  },

  /**
   * Debounce a function call.
   */
  debounce(fn, delay = 150) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Throttle a function call.
   */
  throttle(fn, limit = 150) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Clamp a value between min and max.
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Copy text to clipboard.
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  },

  /**
   * Parse URL params.
   */
  getParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  /**
   * Sanitize number input — returns 0 for invalid.
   */
  parseNumber(val) {
    const n = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  }
};

/* ── 7. Theme Toggle ──────────────────────────────────────── */
const ThemeToggle = {
  KEY: 'ds-theme',

  /**
   * Apply saved theme on load (fast-path is also handled inline in <head>)
   * and wire up the toggle button.
   */
  init() {
    // Default is always dark mode.
    // Only switch to light if the user explicitly saved that preference.
    const saved = localStorage.getItem(this.KEY);
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(this.KEY, 'dark');
        Analytics.event('theme_toggle', { theme: 'dark' });
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(this.KEY, 'light');
        Analytics.event('theme_toggle', { theme: 'light' });
      }
    });
  }
};

/* ── 8. Share URL ─────────────────────────────────────────── */
const ShareCalc = {
  init() {
    const shareBtn = document.querySelector('[data-share]');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const url = window.location.href;
      const success = await Utils.copyToClipboard(url);

      if (success) {
        const original = shareBtn.textContent;
        shareBtn.textContent = 'Copied!';
        setTimeout(() => (shareBtn.textContent = original), 2000);
        Analytics.trackShare('copy_link', document.title);
      }
    });
  }
};

/* ── Init all modules on DOM ready ───────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeToggle.init();
  Nav.init();
  ScrollReveal.init();
  FAQ.init();
  NumberCounter.initAll();
  ShareCalc.init();
});

/* Export for calculator pages */
window.DS = {
  Analytics,
  Utils,
  NumberCounter,
  ScrollReveal
};
