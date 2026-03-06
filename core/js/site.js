/* ==========================================================================
   SITE — Applique les reglages globaux de SITE_CONFIG
   Favicon, titre par defaut.
   Charge apres config-site.js (synchrone).
   ========================================================================== */

(function () {
  'use strict';

  var cfg = window.SITE_CONFIG;
  if (!cfg) return;

  /* ---------- Favicon ---------- */
  if (cfg.favicon) {
    var existing = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!existing) {
      var link = document.createElement('link');
      link.rel = 'icon';
      link.href = cfg.favicon;
      document.head.appendChild(link);
    }
  }

  /* ---------- Titre par defaut ---------- */
  if (cfg.name) {
    var title = document.title || '';
    if (!title.trim()) {
      document.title = cfg.name;
    }
  }
})();
