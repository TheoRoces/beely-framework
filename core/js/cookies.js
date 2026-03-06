/* ==========================================================================
   COOKIES — Bandeau de consentement granulaire + injection des scripts
   Conforme CNIL/RGPD : duree 13 mois max, preuve de consentement, timestamp
   Depend de config-site.js (charge avant)
   ========================================================================== */

(function () {
  'use strict';

  var config = window.COOKIES_CONFIG;
  if (!config) return;

  var banner = config.banner || {};
  var COOKIE_NAME = banner.cookieName || 'cookie_consent';
  var COOKIE_DAYS = Math.min(banner.cookieDuration || 395, 395); // CNIL max ~13 mois
  var CONSENT_VERSION = banner.consentVersion || '1.0';
  var categories = config.categories || {};

  /* ---------- Utilitaires cookies ---------- */

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax;Secure';
  }

  function getCookie(name) {
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var match = document.cookie.match(new RegExp('(^| )' + escaped + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
  }

  /* ---------- Consent storage ---------- */

  function getConsent() {
    var raw = getCookie(COOKIE_NAME);
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);

      /* Verification de la version : si la version a change, re-demander */
      if (data.version && data.version !== CONSENT_VERSION) {
        deleteCookie(COOKIE_NAME);
        return null;
      }

      /* Verifier l'expiration (CNIL : 13 mois max) */
      if (data.timestamp) {
        var elapsed = Date.now() - data.timestamp;
        var maxMs = COOKIE_DAYS * 86400000;
        if (elapsed > maxMs) {
          deleteCookie(COOKIE_NAME);
          return null;
        }
      }
      return data.choices || null;
    } catch (e) {
      /* Legacy : ancien format — on efface et on re-demande */
      deleteCookie(COOKIE_NAME);
      return null;
    }
  }

  function saveConsent(choices) {
    var data = {
      choices: choices,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };
    setCookie(COOKIE_NAME, JSON.stringify(data), COOKIE_DAYS);

    /* Preuve de consentement cote serveur */
    sendConsentProof(data);
  }

  /* ---------- Preuve de consentement (PHP / webhook) ---------- */

  function sendConsentProof(data) {
    /* Determiner l'endpoint : consentEndpoint (PHP built-in) ou consentWebhook */
    var endpoint = config.consentEndpoint || config.consentWebhook || '';
    if (!endpoint) return;

    var payload = {
      consent: data.choices,
      timestamp: new Date(data.timestamp).toISOString(),
      url: window.location.origin + window.location.pathname,
      user_agent: navigator.userAgent,
      expiry_date: new Date(data.timestamp + COOKIE_DAYS * 86400000).toISOString()
    };

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(payload));
    } catch (e) {
      /* Erreur reseau — le consentement est sauvegarde localement */
    }
  }

  /* ---------- Nettoyage des cookies tiers au refus ---------- */

  /**
   * Supprime les cookies deposes par les services tiers lorsque
   * l'utilisateur refuse ou retire son consentement pour une categorie.
   */
  var knownCookies = {
    ga4:      ['_ga', '_ga_*', '_gid', '_gat'],
    gtm:      ['_ga', '_ga_*', '_gid', '_gat'],
    clarity:  ['_clck', '_clsk', 'CLID', 'ANONCHK', 'SM', 'MR'],
    hotjar:   ['_hj*', '_hjSession*', '_hjid'],
    fbPixel:  ['_fbp', '_fbc', 'fr'],
    linkedin: ['_li*', 'li_sugr', 'bcookie', 'lidc', 'UserMatchHistory', 'AnalyticsSyncHistory'],
    tiktok:   ['_ttp', '_tt_enable_cookie', 'tt_*']
  };

  function cleanServiceCookies(serviceKey) {
    var patterns = knownCookies[serviceKey];
    if (!patterns) return;

    /* Lire tous les cookies actuels */
    var allCookies = document.cookie.split(';');
    for (var i = 0; i < allCookies.length; i++) {
      var name = allCookies[i].split('=')[0].trim();
      for (var j = 0; j < patterns.length; j++) {
        var p = patterns[j];
        var match = false;
        if (p.indexOf('*') > -1) {
          /* Pattern avec wildcard : verifier le prefixe */
          match = name.indexOf(p.replace('*', '')) === 0;
        } else {
          match = name === p;
        }
        if (match) {
          deleteCookie(name);
          /* Supprimer aussi avec les domaines courants */
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname;
        }
      }
    }
  }

  function cleanRefusedCategories(consent) {
    for (var catKey in categories) {
      if (!consent[catKey] && !categories[catKey].required) {
        var services = categories[catKey].services || [];
        for (var i = 0; i < services.length; i++) {
          cleanServiceCookies(services[i]);
        }
      }
    }
  }

  /* ---------- Injection des scripts ---------- */

  var injected = {};

  function injectService(key) {
    if (injected[key] || !config[key]) return;
    injected[key] = true;

    switch (key) {
      case 'ga4':
        var gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ga4);
        document.head.appendChild(gaScript);
        var gaInit = document.createElement('script');
        gaInit.textContent = 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","' + config.ga4.replace(/[^A-Za-z0-9-]/g, '') + '");';
        document.head.appendChild(gaInit);
        break;

      case 'gtm':
        var gtmId = config.gtm.replace(/[^A-Za-z0-9-]/g, '');
        var gtmScript = document.createElement('script');
        gtmScript.textContent = '(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","' + gtmId + '");';
        document.head.appendChild(gtmScript);
        break;

      case 'clarity':
        var clarityId = config.clarity.replace(/[^A-Za-z0-9]/g, '');
        var clarityScript = document.createElement('script');
        clarityScript.textContent = '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","' + clarityId + '");';
        document.head.appendChild(clarityScript);
        break;

      case 'fbPixel':
        var fbId = config.fbPixel.replace(/[^0-9]/g, '');
        var fbScript = document.createElement('script');
        fbScript.textContent = '!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","' + fbId + '");fbq("track","PageView");';
        document.head.appendChild(fbScript);
        break;

      case 'hotjar':
        var hjId = String(config.hotjar).replace(/[^0-9]/g, '');
        var hjScript = document.createElement('script');
        hjScript.textContent = '(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:' + hjId + ',hjsv:6};a=o.getElementsByTagName("head")[0];r=o.createElement("script");r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");';
        document.head.appendChild(hjScript);
        break;

      case 'linkedin':
        var liId = config.linkedin.replace(/[^0-9]/g, '');
        var liScript = document.createElement('script');
        liScript.textContent = '_linkedin_partner_id="' + liId + '";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);';
        document.head.appendChild(liScript);
        break;

      case 'tiktok':
        var ttId = config.tiktok.replace(/[^A-Za-z0-9]/g, '');
        var ttScript = document.createElement('script');
        ttScript.textContent = '!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load("' + ttId + '");ttq.page();}(window,document,"ttq");';
        document.head.appendChild(ttScript);
        break;
    }
  }

  function applyConsent(consent) {
    for (var catKey in categories) {
      if (consent[catKey] || categories[catKey].required) {
        var services = categories[catKey].services || [];
        for (var i = 0; i < services.length; i++) {
          injectService(services[i]);
        }
      }
    }
  }

  /* ---------- Bandeau de consentement ---------- */

  var currentBanner = null;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function buildCategoryToggles(consent) {
    var html = '<div class="cookies__categories">';
    for (var catKey in categories) {
      var cat = categories[catKey];
      var isRequired = cat.required === true;

      /* Masquer les categories sans service configure (sauf required) */
      if (!isRequired) {
        var hasServices = false;
        var services = cat.services || [];
        for (var i = 0; i < services.length; i++) {
          if (config[services[i]]) { hasServices = true; break; }
        }
        if (!hasServices) continue;
      }

      var checked = (isRequired || (consent && consent[catKey])) ? ' checked' : '';
      var disabled = isRequired ? ' disabled' : '';

      html += ''
        + '<label class="cookies__category' + (isRequired ? ' cookies__category--required' : '') + '">'
        +   '<div class="cookies__category-info">'
        +     '<strong>' + escapeHtml(cat.label) + (isRequired ? ' <span class="cookies__required-badge">requis</span>' : '') + '</strong>'
        +     '<span>' + escapeHtml(cat.description) + '</span>'
        +   '</div>'
        +   '<input type="checkbox" class="cookies__toggle" data-category="' + escapeHtml(catKey) + '"' + checked + disabled + '>'
        +   '<div class="cookies__switch"><div class="cookies__switch-knob"></div></div>'
        + '</label>';
    }
    html += '</div>';
    return html;
  }

  function createBanner(showSettings) {
    if (currentBanner) currentBanner.remove();

    var existingConsent = getConsent();
    var el = document.createElement('div');
    el.className = 'cookies';

    var settingsVisible = showSettings ? ' cookies__settings--visible' : '';

    /* Lien vers la politique de confidentialite (optionnel) */
    var privacyLink = banner.privacyUrl
      ? ' <a href="' + escapeHtml(banner.privacyUrl) + '" target="_blank" rel="noopener">' + escapeHtml(banner.privacyText || 'Politique de confidentialit\u00e9') + '</a>'
      : '';

    el.innerHTML = ''
      + '<div class="cookies__inner">'
      +   '<div class="cookies__text">'
      +     '<strong class="cookies__title">' + escapeHtml(banner.title || 'Cookies') + '</strong>'
      +     '<p>' + escapeHtml(banner.text || '') + privacyLink + '</p>'
      +   '</div>'
      +   '<div class="cookies__actions">'
      +     '<button class="cookies__btn cookies__btn--accept">' + escapeHtml(banner.acceptText || 'Tout accepter') + '</button>'
      +     '<button class="cookies__btn cookies__btn--reject">' + escapeHtml(banner.rejectText || 'Tout refuser') + '</button>'
      +     '<button class="cookies__btn cookies__btn--settings">' + escapeHtml(banner.settingsText || 'Personnaliser') + '</button>'
      +   '</div>'
      +   '<div class="cookies__settings' + settingsVisible + '">'
      +     buildCategoryToggles(existingConsent)
      +     '<div class="cookies__settings-actions">'
      +       '<button class="cookies__btn cookies__btn--save">' + escapeHtml(banner.saveText || 'Enregistrer mes choix') + '</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    /* Tout accepter */
    el.querySelector('.cookies__btn--accept').addEventListener('click', function () {
      var consent = {};
      for (var k in categories) consent[k] = true;
      saveConsent(consent);
      applyConsent(consent);
      closeBanner(el);
    });

    /* Tout refuser (les categories required restent true) */
    el.querySelector('.cookies__btn--reject').addEventListener('click', function () {
      var consent = {};
      for (var k in categories) {
        consent[k] = categories[k].required === true;
      }
      saveConsent(consent);
      cleanRefusedCategories(consent);
      closeBanner(el);
    });

    /* Toggle panneau de personnalisation */
    var settingsPanel = el.querySelector('.cookies__settings');
    el.querySelector('.cookies__btn--settings').addEventListener('click', function () {
      settingsPanel.classList.toggle('cookies__settings--visible');
    });

    /* Enregistrer les choix personnalises */
    el.querySelector('.cookies__btn--save').addEventListener('click', function () {
      var consent = {};
      var toggles = el.querySelectorAll('.cookies__toggle');
      for (var i = 0; i < toggles.length; i++) {
        var cat = toggles[i].getAttribute('data-category');
        consent[cat] = toggles[i].checked || (categories[cat] && categories[cat].required === true);
      }
      saveConsent(consent);
      applyConsent(consent);
      cleanRefusedCategories(consent);
      closeBanner(el);
    });

    document.body.appendChild(el);
    currentBanner = el;

    requestAnimationFrame(function () {
      el.classList.add('cookies--visible');
    });
  }

  function closeBanner(el) {
    el.classList.remove('cookies--visible');
    el.addEventListener('transitionend', function () {
      el.remove();
      if (currentBanner === el) currentBanner = null;
    });
    /* Fallback si pas de transition CSS */
    setTimeout(function () {
      if (el.parentNode) {
        el.remove();
        if (currentBanner === el) currentBanner = null;
      }
    }, 600);
  }

  /* ---------- Bouton de reouverture (delegation) ---------- */

  function bindSettingsButtons() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-cookies-settings]');
      if (trigger) {
        e.preventDefault();
        createBanner(true);
      }
    });
  }

  /* ---------- API publique ---------- */

  window.openCookieSettings = function () {
    createBanner(true);
  };

  /* ---------- Init ---------- */

  function init() {
    var consent = getConsent();

    if (consent) {
      applyConsent(consent);
    } else {
      createBanner(false);
    }

    bindSettingsButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
