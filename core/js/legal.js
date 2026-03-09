/* ==========================================================================
   LEGAL — Rendu dynamique des pages mentions legales et confidentialite
   Lit LEGAL_CONFIG et COOKIES_CONFIG pour injecter les infos entreprise
   et generer la section cookies/analytics automatiquement.
   ========================================================================== */

(function () {
  'use strict';

  var config = window.LEGAL_CONFIG;
  if (!config) return;

  /* ---------- Infos par service (nom, finalite, cookies, duree) ---------- */

  var serviceInfo = {
    ga4: {
      name: 'Google Analytics 4',
      purpose: 'Mesure d\'audience',
      cookies: '_ga, _ga_*, _gid, _gat',
      duration: '2 ans (_ga), 24h (_gid)',
      provider: 'Google LLC'
    },
    gtm: {
      name: 'Google Tag Manager',
      purpose: 'Gestion des balises',
      cookies: '_ga, _ga_*, _gid, _gat',
      duration: '2 ans (_ga), 24h (_gid)',
      provider: 'Google LLC'
    },
    clarity: {
      name: 'Microsoft Clarity',
      purpose: 'Analyse du comportement',
      cookies: '_clck, _clsk, CLID, ANONCHK',
      duration: '1 an (_clck), 1 jour (_clsk)',
      provider: 'Microsoft Corporation'
    },
    hotjar: {
      name: 'Hotjar',
      purpose: 'Cartes de chaleur et enregistrements',
      cookies: '_hj*, _hjSession*, _hjid',
      duration: '1 an (_hjid), 30 min (session)',
      provider: 'Hotjar Ltd'
    },
    fbPixel: {
      name: 'Facebook Pixel',
      purpose: 'Publicite ciblee et conversions',
      cookies: '_fbp, _fbc, fr',
      duration: '90 jours (_fbp), 90 jours (fr)',
      provider: 'Meta Platforms Inc.'
    },
    linkedin: {
      name: 'LinkedIn Insight Tag',
      purpose: 'Publicite et analytics B2B',
      cookies: '_li*, li_sugr, bcookie, lidc',
      duration: '2 ans (bcookie), 24h (lidc)',
      provider: 'LinkedIn Corporation'
    },
    tiktok: {
      name: 'TikTok Pixel',
      purpose: 'Publicite et conversions',
      cookies: '_ttp, _tt_enable_cookie, tt_*',
      duration: '13 mois (_ttp)',
      provider: 'TikTok Inc.'
    }
  };

  /* ---------- Helpers ---------- */

  /** Resout un chemin (ex: "hosting.name") dans un objet */
  function resolve(obj, path) {
    var parts = path.split('.');
    var val = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!val || typeof val !== 'object') return '';
      val = val[parts[i]];
    }
    return (val !== undefined && val !== null) ? String(val) : '';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---------- Injection des data-legal ---------- */

  function injectLegalData() {
    var els = document.querySelectorAll('[data-legal]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var field = el.getAttribute('data-legal');
      var value = resolve(config, field);

      if (!value) {
        /* Placeholder si vide */
        if (!el.textContent || el.textContent.trim() === '') {
          el.textContent = '[' + field.toUpperCase() + ']';
        }
        continue;
      }

      /* Injection securisee via textContent */
      el.textContent = value;

      /* Pour les <a>, ajouter aussi le href */
      if (el.tagName === 'A') {
        if (field === 'email' || field.indexOf('email') > -1) {
          el.href = 'mailto:' + value;
        } else if (field === 'phone' || field.indexOf('phone') > -1) {
          el.href = 'tel:' + value.replace(/\s/g, '');
        } else if (field === 'website' || field.indexOf('url') > -1) {
          el.href = value;
          if (value.indexOf('http') === 0) el.target = '_blank';
          el.rel = 'noopener';
        }
      }
    }
  }

  /* ---------- Section developpeur ---------- */

  function handleDeveloperSection() {
    var devSections = document.querySelectorAll('[data-legal-developer]');
    var devName = resolve(config, 'developer.name');
    for (var i = 0; i < devSections.length; i++) {
      if (!devName) {
        devSections[i].style.display = 'none';
      }
    }
  }

  /* ---------- Section cookies dynamique ---------- */

  function renderCookiesTable() {
    var target = document.querySelector('[data-legal-cookies]');
    if (!target) return;

    var cookiesConfig = window.COOKIES_CONFIG;
    if (!cookiesConfig) {
      target.innerHTML = '<p>Ce site n\'utilise aucun cookie tiers.</p>';
      return;
    }

    /* Detecter les services actifs */
    var activeServices = [];
    var categories = cookiesConfig.categories || {};

    for (var catKey in categories) {
      var cat = categories[catKey];
      var services = cat.services || [];
      for (var j = 0; j < services.length; j++) {
        var key = services[j];
        if (cookiesConfig[key] && serviceInfo[key]) {
          /* Eviter les doublons (ga4/gtm partagent des cookies) */
          var alreadyAdded = false;
          for (var k = 0; k < activeServices.length; k++) {
            if (activeServices[k].key === key) { alreadyAdded = true; break; }
          }
          if (!alreadyAdded) {
            activeServices.push({
              key: key,
              info: serviceInfo[key],
              category: cat.label
            });
          }
        }
      }
    }

    if (activeServices.length === 0) {
      target.innerHTML = `<p>Ce site n'utilise aucun cookie tiers. Seul un cookie technique (<code>${escapeHtml((cookiesConfig.banner && cookiesConfig.banner.cookieName) || 'cookie_consent')}</code>) est utilisé pour enregistrer votre choix de consentement.</p>`;
      return;
    }

    /* Generer le tableau */
    var html = '<p>Ce site utilise les services suivants, soumis à votre consentement :</p>';
    html += '<table>';
    html += '<tr><th>Service</th><th>Éditeur</th><th>Finalité</th><th>Cookies</th><th>Durée</th></tr>';

    for (var s = 0; s < activeServices.length; s++) {
      var svc = activeServices[s];
      html += `<tr>
        <td>${escapeHtml(svc.info.name)}</td>
        <td>${escapeHtml(svc.info.provider)}</td>
        <td>${escapeHtml(svc.info.purpose)} (${escapeHtml(svc.category)})</td>
        <td><code>${escapeHtml(svc.info.cookies)}</code></td>
        <td>${escapeHtml(svc.info.duration)}</td>
      </tr>`;
    }

    html += '</table>';

    /* Ajouter le cookie de consentement */
    var cookieName = (cookiesConfig.banner && cookiesConfig.banner.cookieName) || 'cookie_consent';
    var cookieDuration = (cookiesConfig.banner && cookiesConfig.banner.cookieDuration) || 395;
    html += `<p>Un cookie technique (<code>${escapeHtml(cookieName)}</code>) est également déposé pour enregistrer votre choix de consentement. Ce cookie a une durée de ${cookieDuration} jours (~13 mois) et ne nécessite pas de consentement (cookie strictement nécessaire).</p>`;

    target.innerHTML = html;
  }

  /* ---------- Init ---------- */

  function init() {
    injectLegalData();
    handleDeveloperSection();
    renderCookiesTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
