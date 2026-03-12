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

  /* ---------- Bouton Configurateur (local uniquement) ---------- */
  var host = window.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:';
  if (isLocal) {
    var BUILDER_PORT = 5555;
    var BUILDER_URL = 'http://localhost:' + BUILDER_PORT;

    var btn = document.createElement('a');
    btn.href = BUILDER_URL;
    btn.target = '_blank';
    btn.className = 'cfg-fab';
    btn.title = 'Ouvrir le Configurateur';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 ' +
      '1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 ' +
      '1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 ' +
      '1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 ' +
      '4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 ' +
      '1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

    // Style inline pour ne pas dépendre d'un fichier CSS
    btn.style.cssText =
      'position:fixed;bottom:20px;right:20px;z-index:9999;' +
      'width:48px;height:48px;border-radius:50%;' +
      'background:var(--color-primary,#2563eb);color:#fff;' +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;' +
      'transition:transform 0.2s ease,box-shadow 0.2s ease;' +
      'text-decoration:none;';

    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    });

    // Vérifier si le serveur tourne avant d'ajouter le bouton
    fetch(BUILDER_URL + '/api/health-check', { method: 'POST', mode: 'no-cors' })
      .then(function () {
        document.body.appendChild(btn);
      })
      .catch(function () {
        // Serveur pas lancé — afficher quand même avec un tooltip différent
        btn.title = 'Configurateur — Lancez : python3 configurateur/configurator-server.py';
        btn.style.opacity = '0.5';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          alert('Le serveur du configurateur n\'est pas lancé.\n\nLancez-le avec :\npython3 configurateur/configurator-server.py');
        });
        document.body.appendChild(btn);
      });
  }
})();
