/* ==========================================================================
   ANIMATIONS JS — IntersectionObserver + Click animations
   ========================================================================== */

(function () {
  'use strict';

  var ANIM_SELECTOR = [
    '[class*="anim-fade-in"]',
    '[class*="anim-scale-in"]',
    '[class*="anim-slide-in"]',
    '[class*="anim-rotate-in"]',
    '[class*="anim-svg-"]',
    '.anim-font-weight-scroll'
  ].join(',');

  /**
   * Initialise les animations d'entrée/sortie (IntersectionObserver)
   * et les animations au clic.
   * @param {HTMLElement} [root=document]
   */
  window.initAnimations = function (root) {
    root = root || document;
    initScrollAnimations(root);
    initClickAnimations();
  };

  /* ---------- Scroll animations ---------- */

  function initScrollAnimations(root) {
    // Respecter prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Rendre tout visible immédiatement
      var els = root.querySelectorAll(ANIM_SELECTOR);
      els.forEach(function (el) { el.classList.add('anim--visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim--visible');

          // Si pas d'animation de sortie, arrêter d'observer
          if (!entry.target.hasAttribute('data-anim-exit')) {
            observer.unobserve(entry.target);
          }
        } else {
          // Animation de sortie : retirer la classe pour re-déclencher à la ré-entrée
          if (entry.target.hasAttribute('data-anim-exit')) {
            entry.target.classList.remove('anim--visible');
          }
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    var elements = root.querySelectorAll(ANIM_SELECTOR);
    elements.forEach(function (el) {
      // Appliquer les attributs data-font-* comme CSS custom properties
      var fontFrom = el.getAttribute('data-font-from');
      var fontTo = el.getAttribute('data-font-to');
      var fontDuration = el.getAttribute('data-font-duration');
      if (fontFrom) el.style.setProperty('--anim-font-from', fontFrom);
      if (fontTo) el.style.setProperty('--anim-font-to', fontTo);
      if (fontDuration) el.style.setProperty('--anim-font-duration', fontDuration);

      observer.observe(el);
    });
  }

  /* ---------- Click animations ---------- */

  function initClickAnimations() {
    // Délégation d'événements sur document (une seule fois)
    if (window.__clickAnimInit) return;
    window.__clickAnimInit = true;

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[class*="anim-click-"]');
      if (!target) return;

      // Ripple spécial
      if (target.classList.contains('anim-click-ripple')) {
        handleRipple(target, e);
        return;
      }

      // Autres animations au clic
      target.classList.remove('anim-click--active');
      // Force reflow pour relancer l'animation
      void target.offsetWidth;
      target.classList.add('anim-click--active');

      target.addEventListener('animationend', function handler() {
        target.classList.remove('anim-click--active');
        target.removeEventListener('animationend', handler);
      });
    });
  }

  function handleRipple(target, e) {
    var rect = target.getBoundingClientRect();
    var circle = document.createElement('span');
    circle.className = 'anim-click-ripple__circle';
    circle.style.left = (e.clientX - rect.left) + 'px';
    circle.style.top = (e.clientY - rect.top) + 'px';
    target.appendChild(circle);

    circle.addEventListener('animationend', function () {
      circle.remove();
    });
  }
})();
