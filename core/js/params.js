/* ==========================================================================
   PARAMS — Persistance des paramètres d'URL + pré-remplissage des champs
   ========================================================================== */

(function () {
  'use strict';

  function cssEscape(str) {
    return str.replace(/["\\]/g, '\\$&');
  }

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  /**
   * Récupère tous les paramètres d'URL actuels.
   */
  function getUrlParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (!search) return params;
    search.split('&').forEach(function (pair) {
      var parts = pair.split('=');
      if (parts[0]) {
        try {
          params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
        } catch (e) {
          // Malformed URL encoding, skip this param
        }
      }
    });
    return params;
  }

  /**
   * Construit une query string à partir d'un objet.
   */
  function buildQuery(params) {
    var pairs = [];
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== '') {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
    return pairs.length > 0 ? '?' + pairs.join('&') : '';
  }

  /**
   * Ajoute les paramètres d'URL à tous les liens internes.
   */
  function persistParams() {
    var params = getUrlParams();
    if (Object.keys(params).length === 0) return;

    var query = buildQuery(params);
    var links = document.querySelectorAll('a[href]');
    var currentHost = window.location.hostname;

    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Ignorer les ancres, mailto, tel, javascript, liens externes
      if (href.indexOf('#') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;

      // Vérifier si c'est un lien interne
      var isInternal = false;
      if (href.indexOf('/') === 0 || href.indexOf('./') === 0 || href.indexOf('../') === 0) {
        isInternal = true;
      } else {
        try {
          var url = new URL(href, window.location.origin);
          isInternal = url.hostname === currentHost;
        } catch (e) {
          // Chemin relatif (ex: "pages/about.html")
          isInternal = !href.startsWith('http');
        }
      }

      if (!isInternal) return;

      // Séparer le hash et la query existante
      var hash = '';
      var base = href;
      var hashIdx = href.indexOf('#');
      if (hashIdx > -1) {
        hash = href.substring(hashIdx);
        base = href.substring(0, hashIdx);
      }

      var existingQuery = '';
      var queryIdx = base.indexOf('?');
      if (queryIdx > -1) {
        existingQuery = base.substring(queryIdx + 1);
        base = base.substring(0, queryIdx);
      }

      // Fusionner les paramètres (existants + courants)
      var merged = {};
      if (existingQuery) {
        existingQuery.split('&').forEach(function (pair) {
          var parts = pair.split('=');
          if (parts[0]) merged[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
        });
      }
      for (var key in params) {
        if (params.hasOwnProperty(key) && !merged.hasOwnProperty(key)) {
          merged[key] = params[key];
        }
      }

      link.setAttribute('href', base + buildQuery(merged) + hash);
    });
  }

  /**
   * Pré-remplit les champs de formulaire depuis les paramètres d'URL.
   * ?nom=Manon → <input name="nom"> aura la valeur "Manon"
   */
  function prefillFields() {
    var params = getUrlParams();
    if (Object.keys(params).length === 0) return;

    for (var key in params) {
      if (!params.hasOwnProperty(key)) continue;
      var value = params[key];

      // Inputs, textareas, selects
      var fields = document.querySelectorAll('[name="' + cssEscape(key) + '"]');
      fields.forEach(function (field) {
        var tag = field.tagName.toLowerCase();
        var type = (field.getAttribute('type') || '').toLowerCase();

        if (type === 'checkbox' || type === 'radio') {
          // Cocher si la valeur correspond
          if (field.value === value || value === 'true' || value === '1') {
            field.checked = true;
            // Déclencher un event change pour les logiques conditionnelles
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else if (tag === 'select') {
          field.value = value;
          field.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          field.value = value;
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // Custom form elements (data-name)
      var customFields = document.querySelectorAll('[data-name="' + cssEscape(key) + '"]');
      customFields.forEach(function (el) {
        // Custom select: simuler la sélection
        if (el.classList.contains('form__select')) {
          var option = el.querySelector('[data-value="' + cssEscape(value) + '"]');
          if (option) option.click();
        }
        // Custom radio/checkbox groups
        if (el.classList.contains('form__radio-group') || el.classList.contains('form__checkbox-group')) {
          var opt = el.querySelector('[data-value="' + cssEscape(value) + '"]');
          if (opt) opt.click();
        }
      });
    }
  }

  /**
   * Récupère les UTMs depuis les paramètres d'URL.
   */
  window.getUTMs = function () {
    var params = getUrlParams();
    var utms = {};
    UTM_KEYS.forEach(function (key) {
      utms[key] = params[key] || '';
    });
    return utms;
  };

  /**
   * Récupère tous les paramètres d'URL actuels (exposé globalement).
   */
  window.getUrlParams = getUrlParams;

  /* ---------- Init ---------- */

  function init() {
    persistParams();
    prefillFields();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
