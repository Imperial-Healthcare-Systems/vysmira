/* VYSMIRA Solutions — site behaviour
   No dependencies. Progressive enhancement: everything works without JS,
   this layer only improves it. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Sticky header state ------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 100);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- 2. Desktop mega menus ------------------------------------------- */
  function initMegaMenus() {
    var triggers = document.querySelectorAll('[data-mega-trigger]');
    var openTimer = null, closeTimer = null;

    function closeAll(except) {
      triggers.forEach(function (t) {
        if (t === except) return;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-expanded', 'false');
        if (panel) panel.classList.remove('is-open');
      });
    }

    triggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;
      var wrap = trigger.closest('li');

      function open() {
        clearTimeout(closeTimer);
        closeAll(trigger);
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
      }
      function close() {
        trigger.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-open');
      }

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
      });

      // 120ms intent delay so a passing cursor doesn't trigger the panel
      wrap.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        openTimer = setTimeout(open, 120);
      });
      wrap.addEventListener('mouseleave', function () {
        clearTimeout(openTimer);
        closeTimer = setTimeout(close, 180);
      });

      panel.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { close(); trigger.focus(); }
      });
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-mega-trigger]') && !e.target.closest('.mega')) closeAll(null);
    });
  }

  /* ---- 3. Mobile navigation -------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) return;
    var closeBtn = nav.querySelector('.mobile-nav__close');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });

    // Focus trap
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = nav.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Accordions
    nav.querySelectorAll('.m-acc__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.classList.toggle('is-open', !isOpen);
      });
    });
  }

  /* ---- 4. Sticky mobile CTA -------------------------------------------- */
  function initMobileCta() {
    var bar = document.querySelector('.mobile-cta');
    if (!bar) return;
    document.body.classList.add('has-mobile-cta');
    var ticking = false;
    function update() {
      bar.classList.toggle('is-visible', window.scrollY > 400);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- 5. Scroll reveal ------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- 6. Statistic count-up ------------------------------------------- */
  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length || reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now(), dur = 900;
        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  /* ---- 7. Forms --------------------------------------------------------- */
  var VALIDATORS = {
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    tel: function (v) { return /^[+]?[\d\s()-]{7,18}$/.test(v); }
  };

  function fieldError(input, msg) {
    var wrap = input.closest('.field');
    if (!wrap) return;
    var slot = wrap.querySelector('.err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (slot) slot.textContent = msg || '';
  }

  function validateField(input) {
    var v = (input.value || '').trim();
    var label = input.getAttribute('data-label') || 'This field';

    if (input.hasAttribute('required')) {
      if (input.type === 'checkbox' && !input.checked) {
        fieldError(input, 'Please tick this box to continue'); return false;
      }
      if (input.type !== 'checkbox' && !v) {
        fieldError(input, label + ' is required'); return false;
      }
    }
    if (v && input.type === 'email' && !VALIDATORS.email(v)) {
      fieldError(input, 'Enter a valid email address'); return false;
    }
    if (v && input.type === 'tel' && !VALIDATORS.tel(v)) {
      fieldError(input, 'Enter a valid phone number, including country code'); return false;
    }
    if (input.type === 'file' && input.files && input.files.length) {
      var file = input.files[0];
      var ok = /\.(pdf|docx?|DOCX?|PDF)$/.test(file.name);
      if (!ok) { fieldError(input, 'Upload a PDF, DOC or DOCX file'); return false; }
      if (file.size > 5 * 1024 * 1024) {
        fieldError(input, 'This file is larger than 5MB. Please upload a smaller file.'); return false;
      }
    }
    fieldError(input, '');
    return true;
  }

  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      var fields = form.querySelectorAll('input, select, textarea');

      fields.forEach(function (input) {
        // Validate on blur, never on keystroke
        input.addEventListener('blur', function () { validateField(input); });
        input.addEventListener('input', function () {
          if (input.getAttribute('aria-invalid') === 'true') validateField(input);
        });
        if (input.type === 'checkbox') {
          input.addEventListener('change', function () { validateField(input); });
        }
      });

      form.addEventListener('submit', function (e) {
        var valid = true, firstBad = null;
        fields.forEach(function (input) {
          if (input.type === 'hidden') return;
          if (!validateField(input)) { valid = false; if (!firstBad) firstBad = input; }
        });

        // Honeypot + timing check
        var pot = form.querySelector('[name="company_website"]');
        var started = parseInt(form.getAttribute('data-started') || '0', 10);
        var tooFast = started && (Date.now() - started) < 2500;
        if ((pot && pot.value) || tooFast) { e.preventDefault(); return; }

        if (!valid) {
          e.preventDefault();
          if (firstBad) { firstBad.focus(); firstBad.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); }
          return;
        }

        // Stamp the render time so the server can reject instant submissions
        var stamp = form.querySelector('[name="form_started"]');
        if (stamp) stamp.value = form.getAttribute('data-started') || '';

        // Preview mode: opened from file://, or no endpoint configured yet.
        // On a real deployment the form posts normally to its PHP handler.
        var isPreview = location.protocol === 'file:' || !form.getAttribute('action') ||
                        form.getAttribute('action') === '#';
        if (isPreview) {
          e.preventDefault();
          var btn = form.querySelector('button[type="submit"]');
          var status = form.querySelector('.form-status');
          if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
          setTimeout(function () {
            if (status) {
              status.className = 'form-status form-status--ok is-visible';
              status.textContent = 'Validation passed. This is the preview build — on the deployed site this posts to the PHP handler in /api/ and redirects to the thank-you page.';
              status.setAttribute('role', 'status');
            }
            if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-label') || 'Send enquiry'; }
          }, 700);
        }
      });

      form.setAttribute('data-started', String(Date.now()));
    });
  }

  /* ---- 7b. Biography dialogs -------------------------------------------- */
  function initBios() {
    document.querySelectorAll('[data-bio-open]').forEach(function (trigger) {
      var dialog = document.getElementById(trigger.getAttribute('data-bio-open'));
      if (!dialog || trigger.dataset.bioBound) return;
      trigger.dataset.bioBound = '1';

      trigger.addEventListener('click', function () {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');   // very old browsers: inline fallback
      });

      dialog.querySelectorAll('[data-bio-close]').forEach(function (btn) {
        btn.addEventListener('click', function () { dialog.close(); });
      });

      // Click the backdrop — i.e. outside the dialog's own box — to dismiss.
      dialog.addEventListener('click', function (e) {
        if (e.target !== dialog) return;
        var box = dialog.getBoundingClientRect();
        var outside = e.clientX < box.left || e.clientX > box.right ||
                      e.clientY < box.top || e.clientY > box.bottom;
        if (outside) dialog.close();
      });

      // Escape is handled natively by <dialog>; restore focus on the way out.
      dialog.addEventListener('close', function () { trigger.focus(); });
    });
  }

  /* ---- 8. Current-page highlight (single-file build) -------------------- */
  function markCurrent() {
    var path = document.body.getAttribute('data-page');
    if (!path) return;
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      if (el.getAttribute('data-nav') === path) el.classList.add('is-active');
    });
  }

  /* ---- Boot ------------------------------------------------------------- */
  function boot() {
    if (!window.__vysChromeBooted) {
      window.__vysChromeBooted = true;
      initHeader();
      initMegaMenus();
      initMobileNav();
      initMobileCta();
    }
    initPage();
  }

  function initPage() {
    initReveal();
    initCounters();
    initForms();
    initBios();
    markCurrent();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();

  window.VYSMIRA = { boot: boot, initPage: initPage };
})();
