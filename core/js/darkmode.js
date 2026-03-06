/* ==========================================================================
   DARK MODE — Toggle, persistence localStorage, prefers-color-scheme
   Charger en synchrone dans <head> (pas defer) pour éviter le flash.
   Usage : <button data-theme-toggle>Toggle</button>
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'site-system-theme';

  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // Appliquer immédiatement (bloque le rendu pour éviter le flash)
  applyTheme(getPreferred());

  // Écouter les changements de préférence système
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var handler = function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
  }

  // Exposer globalement
  window.toggleTheme = toggleTheme;

  // Délégation click sur [data-theme-toggle]
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) {
      e.preventDefault();
      toggleTheme();
    }
  });
})();
