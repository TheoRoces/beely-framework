/* ==========================================================================
   BUILDER FRAMEWORK — Gestion des versions + Health Check
   ========================================================================== */
(function () {
  'use strict';

  var currentVersion = '';
  var loaded = false;

  /* ---------- Render version courante ---------- */
  async function loadInfo() {
    var el = document.getElementById('fwCurrent');
    if (!el) return;
    try {
      var info = await BuilderAPI.frameworkInfo();
      currentVersion = info.version || '';
      el.innerHTML =
        '<div class="bld-fw__info-grid">' +
          '<div class="bld-fw__info-item">' +
            '<div class="bld-fw__info-label">Version</div>' +
            '<div class="bld-fw__info-value bld-fw__info-value--version">' + esc(info.version) + '</div>' +
          '</div>' +
          '<div class="bld-fw__info-item">' +
            '<div class="bld-fw__info-label">Commit</div>' +
            '<div class="bld-fw__info-value"><code>' + esc(info.commit) + '</code></div>' +
          '</div>' +
          '<div class="bld-fw__info-item">' +
            '<div class="bld-fw__info-label">Branche</div>' +
            '<div class="bld-fw__info-value">' + esc(info.branch) + '</div>' +
          '</div>' +
          '<div class="bld-fw__info-item">' +
            '<div class="bld-fw__info-label">Dernière mise à jour</div>' +
            '<div class="bld-fw__info-value">' + esc(info.date) + '</div>' +
          '</div>' +
        '</div>';
    } catch (e) {
      el.innerHTML = '<div class="bld-fw__error">Erreur : ' + esc(e.message) + '</div>';
    }
  }

  /* ---------- Versions disponibles ---------- */
  async function loadVersions() {
    var el = document.getElementById('fwVersions');
    if (!el) return;
    el.innerHTML = '<div class="bld-fw__loading">Récupération des versions...</div>';
    try {
      var data = await BuilderAPI.frameworkVersions();
      currentVersion = data.current || currentVersion;

      if (!data.versions || data.versions.length === 0) {
        el.innerHTML = '<div class="bld-fw__empty">Aucun tag trouvé. Utilisez <code>git tag v1.0.0</code> dans .framework/ pour créer une version.</div>';
        return;
      }

      var html = '<div class="bld-fw__version-list">';
      data.versions.forEach(function (v) {
        var isCurrent = v.tag === currentVersion || currentVersion.indexOf(v.tag) === 0;
        html += '<div class="bld-fw__version-item' + (isCurrent ? ' bld-fw__version-item--current' : '') + '">';
        html += '<div class="bld-fw__version-info">';
        html += '<span class="bld-fw__version-tag">' + esc(v.tag) + '</span>';
        if (isCurrent) html += '<span class="bld-fw__version-badge">actuel</span>';
        if (v.date) html += '<span class="bld-fw__version-date">' + esc(v.date) + '</span>';
        html += '</div>';
        if (v.message) html += '<div class="bld-fw__version-msg">' + esc(v.message) + '</div>';
        if (!isCurrent) {
          html += '<button class="bld-btn bld-btn--sm bld-btn--primary bld-fw__version-btn" data-version="' + esc(v.tag) + '">Installer</button>';
        }
        html += '</div>';
      });
      html += '</div>';
      el.innerHTML = html;

      // Event delegation pour les boutons Installer
      el.querySelectorAll('[data-version]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          updateFramework(btn.getAttribute('data-version'));
        });
      });
    } catch (e) {
      el.innerHTML = '<div class="bld-fw__error">Erreur : ' + esc(e.message) + '</div>';
    }
  }

  /* ---------- Update framework ---------- */
  async function updateFramework(version) {
    var confirmed = await BuilderModal.confirm(
      'Changer de version',
      'Basculer le framework sur <strong>' + esc(version) + '</strong> ?<br><br>' +
      '<em>Le serveur du configurateur utilise les fichiers framework. ' +
      'Rechargez la page après la mise à jour.</em>',
      { confirmLabel: 'Installer', confirmClass: 'bld-btn--primary' }
    );
    if (!confirmed) return;

    BuilderApp.showToast('Installation de ' + version + '...', 'info');
    try {
      var result = await BuilderAPI.frameworkUpdate(version);
      if (result.ok) {
        currentVersion = result.version;
        BuilderApp.showToast('Framework mis à jour : ' + result.version, 'success');
        await loadInfo();
        await loadVersions();
      } else {
        BuilderApp.showToast('Erreur : ' + (result.error || 'Échec'), 'error');
      }
    } catch (e) {
      BuilderApp.showToast('Erreur : ' + e.message, 'error');
    }
  }

  /* ---------- Health Check ---------- */
  async function runHealthCheck() {
    var el = document.getElementById('fwHealth');
    if (!el) return;
    el.innerHTML = '<div class="bld-fw__loading">Analyse en cours...</div>';
    try {
      var data = await BuilderAPI.healthCheck();
      var html = '<div class="bld-fw__health-summary">';
      html += '<span class="bld-fw__health-score ' +
        (data.failed === 0 ? 'bld-fw__health-score--ok' : 'bld-fw__health-score--warn') + '">';
      html += data.passed + '/' + data.total;
      html += '</span>';
      html += data.failed === 0
        ? '<span>Tout est en ordre</span>'
        : '<span>' + data.failed + ' problème' + (data.failed > 1 ? 's' : '') + ' détecté' + (data.failed > 1 ? 's' : '') + '</span>';
      html += '</div>';

      html += '<div class="bld-fw__health-list">';
      data.checks.forEach(function (c) {
        html += '<div class="bld-fw__health-item ' + (c.ok ? 'bld-fw__health-item--ok' : 'bld-fw__health-item--fail') + '">';
        html += '<span class="bld-fw__health-icon">' + (c.ok ? '✓' : '✗') + '</span>';
        html += '<span class="bld-fw__health-name">' + esc(c.name) + '</span>';
        if (c.detail) html += '<span class="bld-fw__health-detail">' + esc(c.detail) + '</span>';
        html += '</div>';
      });
      html += '</div>';
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = '<div class="bld-fw__error">Erreur : ' + esc(e.message) + '</div>';
    }
  }

  /* ---------- Helpers ---------- */
  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---------- Events ---------- */
  var btnRefresh = document.getElementById('btnFwRefresh');
  if (btnRefresh) btnRefresh.addEventListener('click', loadVersions);

  var btnHealth = document.getElementById('btnHealthCheck');
  if (btnHealth) btnHealth.addEventListener('click', runHealthCheck);

  /* ---------- API publique ---------- */
  window.BuilderFramework = {
    refresh: function () {
      if (!loaded) {
        loaded = true;
        loadInfo();
        loadVersions();
        runHealthCheck();
      }
    }
  };
})();
