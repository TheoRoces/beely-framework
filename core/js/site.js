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
    var serverRunning = false;

    // Bouton FAB — petit, neutral, avec bordure
    var btn = document.createElement('button');
    btn.className = 'cfg-fab';
    btn.title = 'Configurateur';
    btn.setAttribute('aria-label', 'Ouvrir le Configurateur');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 ' +
      '1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 ' +
      '1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 ' +
      '1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 ' +
      '4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 ' +
      '1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

    btn.style.cssText =
      'position:fixed;bottom:16px;right:16px;z-index:9999;' +
      'width:36px;height:36px;border-radius:var(--radius-md,8px);' +
      'background:var(--color-bg,#fff);color:var(--color-text-light,#6b7280);' +
      'border:1px solid var(--color-border,#e5e7eb);' +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.1);cursor:pointer;' +
      'transition:border-color 0.15s ease,color 0.15s ease,box-shadow 0.15s ease;' +
      'padding:0;';

    btn.addEventListener('mouseenter', function () {
      btn.style.borderColor = 'var(--color-text-light,#6b7280)';
      btn.style.color = 'var(--color-text,#111)';
      btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.borderColor = 'var(--color-border,#e5e7eb)';
      btn.style.color = 'var(--color-text-light,#6b7280)';
      btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    });

    // Popup stylisée
    function showCfgPopup() {
      var overlay = document.createElement('div');
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.4);' +
        'display:flex;align-items:center;justify-content:center;' +
        'animation:cfgFadeIn 0.15s ease;';

      var modal = document.createElement('div');
      modal.style.cssText =
        'background:var(--color-bg,#fff);border:1px solid var(--color-border,#e5e7eb);' +
        'border-radius:var(--radius-lg,12px);padding:24px;max-width:380px;width:90%;' +
        'box-shadow:0 20px 60px rgba(0,0,0,0.2);';

      var title = document.createElement('h3');
      title.textContent = 'Configurateur';
      title.style.cssText = 'margin:0 0 8px;font-size:16px;font-weight:600;';

      var msg = document.createElement('p');
      msg.style.cssText = 'margin:0 0 16px;font-size:14px;color:var(--color-text-light,#6b7280);line-height:1.5;';
      msg.textContent = 'Le serveur du configurateur n\'est pas lancé. Voulez-vous le démarrer ?';

      var code = document.createElement('code');
      code.textContent = 'python3 configurateur/configurator-server.py';
      code.style.cssText =
        'display:block;padding:8px 12px;margin:0 0 20px;font-size:12px;' +
        'background:var(--color-bg-alt,#f3f4f6);border:1px solid var(--color-border,#e5e7eb);' +
        'border-radius:var(--radius-md,8px);font-family:var(--font-mono,monospace);' +
        'color:var(--color-text,#111);';

      var actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';

      var btnCancel = document.createElement('button');
      btnCancel.textContent = 'Annuler';
      btnCancel.style.cssText =
        'padding:6px 14px;font-size:13px;border-radius:var(--radius-md,8px);' +
        'border:1px solid var(--color-border,#e5e7eb);background:var(--color-bg,#fff);' +
        'color:var(--color-text,#111);cursor:pointer;font-weight:500;';

      var btnOk = document.createElement('button');
      btnOk.textContent = 'Démarrer';
      btnOk.style.cssText =
        'padding:6px 14px;font-size:13px;border-radius:var(--radius-md,8px);' +
        'border:1px solid var(--color-primary,#2563eb);background:var(--color-primary,#2563eb);' +
        'color:#fff;cursor:pointer;font-weight:500;';

      function close() { overlay.remove(); }

      btnCancel.addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
      });

      btnOk.addEventListener('click', function () {
        btnOk.textContent = 'Démarrage...';
        btnOk.disabled = true;
        btnOk.style.opacity = '0.6';

        // Tenter d'ouvrir le configurateur — poll toutes les 500ms pendant 8s
        var attempts = 0;
        var maxAttempts = 16;
        var poll = setInterval(function () {
          attempts++;
          fetch(BUILDER_URL + '/api/framework-info', { method: 'POST' })
            .then(function (r) {
              if (r.ok) {
                clearInterval(poll);
                close();
                window.open(BUILDER_URL + '/configurateur/', '_blank');
              }
            })
            .catch(function () {
              if (attempts >= maxAttempts) {
                clearInterval(poll);
                msg.textContent = 'Le serveur ne répond pas. Lancez la commande ci-dessus dans votre terminal.';
                msg.style.color = 'var(--color-error,#dc2626)';
                btnOk.textContent = 'Démarrer';
                btnOk.disabled = false;
                btnOk.style.opacity = '';
              }
            });
        }, 500);
      });

      actions.appendChild(btnCancel);
      actions.appendChild(btnOk);
      modal.appendChild(title);
      modal.appendChild(msg);
      modal.appendChild(code);
      modal.appendChild(actions);
      overlay.appendChild(modal);

      // Animation CSS
      var style = document.createElement('style');
      style.textContent = '@keyframes cfgFadeIn{from{opacity:0}to{opacity:1}}';
      overlay.appendChild(style);

      document.body.appendChild(overlay);
      btnOk.focus();
    }

    btn.addEventListener('click', function () {
      if (serverRunning) {
        window.open(BUILDER_URL + '/configurateur/', '_blank');
      } else {
        showCfgPopup();
      }
    });

    // Vérifier si le serveur tourne
    fetch(BUILDER_URL + '/api/framework-info', { method: 'POST' })
      .then(function (r) {
        if (r.ok) {
          serverRunning = true;
          btn.style.color = 'var(--color-primary,#2563eb)';
          btn.style.borderColor = 'var(--color-primary,#2563eb)';
        }
        document.body.appendChild(btn);
      })
      .catch(function () {
        document.body.appendChild(btn);
      });
  }
})();
