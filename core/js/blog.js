/* ==========================================================================
   BLOG — Moteur de blog Baserow (listing + article + lightbox)
   Dépend de config-site.js (window.BLOG_CONFIG) et params.js (getUrlParams)
   ========================================================================== */

(function () {
  'use strict';

  var config = window.BLOG_CONFIG;
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === 'file:';

  /* ---------- Helpers ---------- */

  /**
   * Construit le lien vers un article.
   * Prod : /blog/mon-slug  (URL propre, réécrite par .htaccess)
   * Local : /blog/article?slug=mon-slug  (pas de rewrite Apache)
   */
  function buildArticleLink(slug, id) {
    var blogBase = config.blogPage || 'blog';
    if (blogBase.charAt(0) !== '/') blogBase = '/' + blogBase;
    blogBase = blogBase.replace(/\/+$/, '');

    if (slug && !isLocal) {
      // URL propre en production
      return `${blogBase}/${encodeURIComponent(slug)}`;
    }
    // Fallback query param (local dev ou pas de slug)
    var articlePage = config.articlePage || 'article.html';
    if (articlePage.charAt(0) !== '/') articlePage = '/' + articlePage;
    return `${articlePage}?${slug ? 'slug=' + encodeURIComponent(slug) : 'id=' + id}`;
  }

  /**
   * Extrait le slug depuis l'URL path.
   * /blog/mon-slug → 'mon-slug'
   * /blog → null
   * /blog/article → null (c'est la page template)
   */
  function getSlugFromPath() {
    var blogBase = config.blogPage || 'blog';
    blogBase = '/' + blogBase.replace(/^\/+/, '').replace(/\/+$/, '');
    var path = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '');
    if (path.indexOf(blogBase + '/') === 0) {
      var rest = path.substring(blogBase.length + 1);
      if (rest && rest !== 'article') return decodeURIComponent(rest);
    }
    return null;
  }

  function safeField(row, name) {
    if (!row || row[name] === undefined || row[name] === null || row[name] === '') return null;
    var val = row[name];
    // Baserow single-select: {id, value, color}
    if (val && typeof val === 'object' && !Array.isArray(val) && val.value !== undefined) {
      return val.value || null;
    }
    // Baserow file fields return [{url:"...", ...}]
    if (Array.isArray(val)) {
      if (val.length === 0) return null;
      if (val[0] && val[0].url) return val[0].url;
      return val;
    }
    return val;
  }

  /**
   * Extrait les valeurs d'un champ multi-select Baserow.
   * Multi-select retourne [{id, value, color}, ...]
   * Supporte aussi le format texte (rétro-compat: "val1, val2")
   * @returns {string[]}
   */
  function multiSelectValues(row, name) {
    if (!row || !row[name]) return [];
    var val = row[name];
    // Baserow multi-select: [{id, value, color}, ...]
    if (Array.isArray(val)) {
      var values = [];
      for (var i = 0; i < val.length; i++) {
        if (val[i] && val[i].value) {
          values.push(val[i].value);
        }
      }
      if (values.length > 0) return values;
    }
    // Rétro-compat: texte séparé par des virgules
    if (typeof val === 'string' && val) {
      return val.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return [];
  }

  function safeFileUrls(row, name) {
    if (!row || !row[name] || !Array.isArray(row[name])) return [];
    var urls = [];
    for (var i = 0; i < row[name].length; i++) {
      if (row[name][i] && row[name][i].url) {
        urls.push(row[name][i].url);
      }
    }
    return urls;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat(config.dateFormat || 'fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      }).format(d);
    } catch (e) {
      return dateStr;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** SVG placeholder pour les images manquantes (icône photo neutre) */
  var placeholderSvg = `<div class="blog-card__placeholder">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>`;

  /**
   * Sanitise du HTML CMS : supprime les balises et attributs dangereux.
   * Whitelist : balises de mise en forme, images, liens, listes, tableaux.
   */
  function sanitizeHtml(html) {
    if (!html) return '';
    // Utiliser DOMParser pour parser sans exécuter de scripts
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var div = doc.body;

    // Balises autorisées
    var allowed = ['P','BR','STRONG','B','EM','I','U','S','A','IMG',
      'UL','OL','LI','H1','H2','H3','H4','H5','H6','BLOCKQUOTE',
      'PRE','CODE','TABLE','THEAD','TBODY','TR','TH','TD',
      'FIGURE','FIGCAPTION','HR','SPAN','DIV','SUP','SUB'];

    // Attributs autorisés par balise
    var allowedAttrs = {
      A: ['href', 'target', 'rel', 'title'],
      IMG: ['src', 'alt', 'width', 'height', 'loading'],
      TD: ['colspan', 'rowspan'],
      TH: ['colspan', 'rowspan']
    };

    function clean(el) {
      var children = Array.prototype.slice.call(el.childNodes);
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node.nodeType === 1) { // Element
          var tag = node.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'OBJECT' || tag === 'EMBED') {
            node.remove();
            continue;
          }
          if (allowed.indexOf(tag) === -1) {
            // Remplacer par son contenu
            while (node.firstChild) {
              el.insertBefore(node.firstChild, node);
            }
            node.remove();
            // Recalculer car on a modifié les enfants
            i--;
            children = Array.prototype.slice.call(el.childNodes);
            continue;
          }
          // Nettoyer les attributs
          var attrs = Array.prototype.slice.call(node.attributes);
          var validAttrs = allowedAttrs[tag] || [];
          for (var j = 0; j < attrs.length; j++) {
            var attrName = attrs[j].name.toLowerCase();
            // Supprimer les event handlers et attributs non autorisés
            if (attrName.indexOf('on') === 0 || (validAttrs.indexOf(attrName) === -1 && attrName !== 'class' && attrName !== 'id')) {
              node.removeAttribute(attrs[j].name);
            }
          }
          // Vérifier les href pour javascript:
          if (tag === 'A') {
            var href = (node.getAttribute('href') || '').trim().toLowerCase();
            if (href.indexOf('javascript:') === 0 || href.indexOf('data:') === 0) {
              node.setAttribute('href', '#');
            }
            // Forcer rel="noopener" sur les liens externes
            if (node.getAttribute('target') === '_blank') {
              node.setAttribute('rel', 'noopener noreferrer');
            }
          }
          // Vérifier src pour javascript:
          if (tag === 'IMG') {
            var src = (node.getAttribute('src') || '').trim().toLowerCase();
            if (src.indexOf('javascript:') === 0 || src.indexOf('data:') === 0) {
              node.removeAttribute('src');
            }
          }
          clean(node);
        }
      }
    }

    clean(div);
    return div.innerHTML;
  }

  /* ---------- XHR ---------- */

  function xhr(url, callback) {
    var req = new XMLHttpRequest();
    var proxyUrl = (!isLocal && config.proxyUrl) ? config.proxyUrl : '';
    var token = config.baserow.token || '';
    var baserowBase = (config.baserow.url || 'https://api.baserow.io').replace(/\/+$/, '');
    var finalUrl;
    var useDirectApi = false;

    if (proxyUrl && url.indexOf(baserowBase) === 0) {
      // Mode production : passer par le proxy PHP (token caché côté serveur)
      var rest = url.substring(baserowBase.length);
      var qIdx = rest.indexOf('?');
      var endpoint = qIdx > -1 ? rest.substring(0, qIdx) : rest;
      var qs = qIdx > -1 ? rest.substring(qIdx + 1) : '';
      finalUrl = proxyUrl + '?endpoint=' + encodeURIComponent(endpoint) + (qs ? '&' + qs : '');
    } else {
      // Mode dev : appel direct à l'API Baserow avec le token
      finalUrl = url;
      useDirectApi = true;
    }

    req.open('GET', finalUrl, true);

    // Envoyer le token en header si appel direct (dev)
    if (useDirectApi && token) {
      req.setRequestHeader('Authorization', 'Token ' + token);
    }

    req.onreadystatechange = function () {
      if (req.readyState !== 4) return;
      if (req.status >= 200 && req.status < 300) {
        try {
          callback(null, JSON.parse(req.responseText));
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error('HTTP ' + req.status), null);
      }
    };
    req.onerror = function () {
      callback(new Error('Erreur réseau'), null);
    };
    req.send();
  }

  /* ---------- Baserow API ---------- */

  function buildUrl(path, params) {
    var base = (config.baserow.url || 'https://api.baserow.io').replace(/\/+$/, '');
    var url = base + path;
    var qs = [];
    for (var k in params) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        qs.push(`${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
      }
    }
    if (qs.length) url += (url.indexOf('?') > -1 ? '&' : '?') + qs.join('&');
    return url;
  }

  /**
   * Extrait la valeur texte d'un champ status (single-select ou texte).
   */
  function getStatus(row) {
    var val = row.status;
    if (!val) return '';
    if (typeof val === 'object' && val.value) return val.value.toLowerCase();
    if (typeof val === 'string') return val.toLowerCase();
    return '';
  }

  function fetchRowById(id, callback) {
    var tableId = config.baserow.tableId;
    var url = buildUrl('/api/database/rows/table/' + tableId + '/' + id + '/', {
      user_field_names: 'true'
    });
    xhr(url, callback);
  }

  function fetchRowBySlug(slug, callback) {
    var tableId = config.baserow.tableId;
    var url = buildUrl('/api/database/rows/table/' + tableId + '/', {
      user_field_names: 'true',
      'filter__slug__equal': slug,
      size: 10 // Récupérer plus pour détecter les doublons
    });
    xhr(url, function (err, data) {
      if (err) return callback(err, null);
      if (!data || !data.results || data.results.length === 0) {
        return callback(new Error('Article introuvable'), null);
      }
      // Garde-fou slugs dupliqués : si plusieurs résultats,
      // utiliser le plus récent (dernier publié) ou un ?id= explicite
      if (data.results.length > 1) {
        var params = (typeof window.getUrlParams === 'function') ? window.getUrlParams() : {};
        if (params.id) {
          // Si un ID est fourni en plus du slug, l'utiliser pour désambiguïser
          var targetId = parseInt(params.id, 10);
          for (var i = 0; i < data.results.length; i++) {
            if (data.results[i].id === targetId) {
              return callback(null, data.results[i]);
            }
          }
        }
        // Sinon prendre le premier (le plus récent selon l'ordre Baserow)
        console.warn('[blog] Slug dupliqué "' + slug + '" — ' + data.results.length + ' articles trouvés. Utilisez ?slug=xxx&id=123 pour disambiguïser.');
      }
      callback(null, data.results[0]);
    });
  }

  /* ---------- Rendering: Skeleton ---------- */

  function renderSkeleton(count) {
    var html = '';
    for (var i = 0; i < count; i++) {
      html += `<div class="blog-skeleton">
        <div class="blog-skeleton__image"></div>
        <div class="blog-skeleton__body">
          <div class="blog-skeleton__line"></div>
          <div class="blog-skeleton__line blog-skeleton__line--short"></div>
          <div class="blog-skeleton__line blog-skeleton__line--xs"></div>
        </div>
      </div>`;
    }
    return html;
  }

  /* ---------- Rendering: Card ---------- */

  function renderCard(row) {
    var img = safeField(row, 'featured_img') || config.defaultImage;
    var title = safeField(row, 'title');
    var excerpt = safeField(row, 'excerpt');
    var date = safeField(row, 'date');
    var author = safeField(row, 'author');
    var readTime = safeField(row, 'read_time');
    var cats = multiSelectValues(row, 'categories');
    var slug = safeField(row, 'slug');
    var link = buildArticleLink(slug, row.id);

    var imageHtml = img
      ? `<div class="blog-card__image"><img src="${escapeHtml(img)}" alt="${escapeHtml(title || '')}" loading="lazy"></div>`
      : `<div class="blog-card__image">${placeholderSvg}</div>`;

    var catsHtml = '';
    if (cats.length > 0) {
      catsHtml = '<div class="blog-card__categories">';
      for (var i = 0; i < cats.length; i++) {
        catsHtml += `<span class="blog-card__category">${escapeHtml(cats[i])}</span>`;
      }
      catsHtml += '</div>';
    }

    var metaParts = [];
    if (date) metaParts.push(`<span class="blog-card__meta-item">${formatDate(date)}</span>`);
    if (author) metaParts.push(`<span class="blog-card__meta-item">${escapeHtml(author)}</span>`);
    if (readTime) metaParts.push(`<span class="blog-card__meta-item">${escapeHtml(String(readTime))} min</span>`);
    var metaHtml = metaParts.length > 0
      ? `<div class="blog-card__meta">${metaParts.join('<span class="blog-card__meta-sep">&middot;</span>')}</div>`
      : '';

    return `<a href="${link}" class="blog-card anim-fade-in-up">
      ${imageHtml}
      <div class="blog-card__body">
        ${catsHtml}
        ${title ? `<h3 class="blog-card__title">${escapeHtml(title)}</h3>` : ''}
        ${excerpt ? `<p class="blog-card__excerpt">${escapeHtml(excerpt)}</p>` : ''}
        ${metaHtml}
      </div>
    </a>`;
  }

  /* ---------- Helpers: DOM ---------- */

  /** Remonte le DOM pour trouver l'attribut data-filter-field */
  function getFilterField(el) {
    while (el && el !== document) {
      if (el.getAttribute && el.getAttribute('data-filter-field')) return el.getAttribute('data-filter-field');
      el = el.parentElement;
    }
    return null;
  }

  /** Extrait les valeurs uniques d'un champ multi-select parmi les rows */
  function extractFieldValues(rows, field) {
    var values = {};
    for (var i = 0; i < rows.length; i++) {
      var vals = multiSelectValues(rows[i], field);
      for (var j = 0; j < vals.length; j++) {
        if (vals[j]) values[vals[j]] = (values[vals[j]] || 0) + 1;
      }
    }
    return values;
  }

  /* ---------- Fetch published rows (shared between listing and article) ---------- */

  function fetchPublishedRows(callback) {
    var result = [];
    var tableId = config.baserow.tableId;
    function fetchPage(page) {
      var url = buildUrl('/api/database/rows/table/' + tableId + '/', {
        user_field_names: 'true',
        page: page,
        size: 200,
        order_by: '-date'
      });
      xhr(url, function (err, data) {
        if (err) return callback(err, []);
        var rows = (data && data.results) || [];
        for (var i = 0; i < rows.length; i++) {
          var status = getStatus(rows[i]);
          if (!status || status !== 'draft') result.push(rows[i]);
        }
        if (data && data.next) fetchPage(page + 1);
        else callback(null, result);
      });
    }
    fetchPage(1);
  }

  /* ---------- Listing ---------- */

  function initListing(container) {
    var allRows = [];
    var filteredRows = [];
    var displayedCount = 0;
    var perPage = config.perPage || 12;
    var activeFilters = {};
    var gridEl, filtersWrap, loadMoreEl;

    /* Parse data-blog-filters="categories:pills, taxonomies:select:no-count" */
    var filterConfigs = (function () {
      var attr = container.getAttribute('data-blog-filters');
      if (!attr) return [{ field: 'categories', style: 'pills', label: 'Catégories', count: true }];
      if (!attr.trim()) return []; // data-blog-filters="" → pas de filtres internes
      var configs = [];
      var parts = attr.split(',');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].trim().split(':');
        var field = pair[0].trim();
        var style = (pair[1] || 'pills').trim();
        var showCount = !(pair[2] && pair[2].trim() === 'no-count');
        var labels = { categories: 'Catégories', taxonomies: 'Tags' };
        configs.push({ field: field, style: style, label: labels[field] || field, count: showCount });
      }
      return configs;
    })();

    /* Build DOM */
    container.innerHTML = `
      <div class="blog__filters-wrap"></div>
      <div class="blog__grid">${renderSkeleton(perPage)}</div>
      <div class="blog__load-more"></div>`;

    filtersWrap = container.querySelector('.blog__filters-wrap');
    gridEl = container.querySelector('.blog__grid');
    loadMoreEl = container.querySelector('.blog__load-more');

    /* ---------- Fetch ALL rows (pagination récursive, filtrage client-side) ---------- */

    function fetchAllRows(callback) {
      var result = [];
      var tableId = config.baserow.tableId;
      function fetchPage(page) {
        var url = buildUrl('/api/database/rows/table/' + tableId + '/', {
          user_field_names: 'true',
          page: page,
          size: 200,
          order_by: '-date'
        });
        xhr(url, function (err, data) {
          if (err) return callback(err, []);
          var rows = (data && data.results) || [];
          for (var i = 0; i < rows.length; i++) {
            var status = getStatus(rows[i]);
            if (!status || status !== 'draft') result.push(rows[i]);
          }
          if (data && data.next) fetchPage(page + 1);
          else callback(null, result);
        });
      }
      fetchPage(1);
    }

    /* ---------- Client-side filtering ---------- */

    function applyFilters() {
      filteredRows = [];
      for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];
        var match = true;
        for (var field in activeFilters) {
          var selected = activeFilters[field];
          if (!selected || selected.length === 0) continue;
          var rowValues = multiSelectValues(row, field);
          var hasMatch = false;
          for (var s = 0; s < selected.length; s++) {
            for (var r = 0; r < rowValues.length; r++) {
              if (rowValues[r] === selected[s]) { hasMatch = true; break; }
            }
            if (hasMatch) break;
          }
          if (!hasMatch) { match = false; break; }
        }
        if (match) filteredRows.push(row);
      }
    }

    /* ---------- Filter renderers ---------- */

    /** Suffixe décompte optionnel */
    function countSuffix(fc, counts, key) {
      return fc.count ? ` <span class="blog__filter-count">(${counts[key]})</span>` : '';
    }

    function renderPillsFilter(fc, keys, counts, selected) {
      var isNone = selected.length === 0;
      var h = `<div class="blog__filters" data-filter-field="${fc.field}" data-filter-style="pills">`;
      h += `<button class="blog__filter-tag${isNone ? ' blog__filter-tag--active' : ''}" data-filter-value="">Tous</button>`;
      for (var i = 0; i < keys.length; i++) {
        var act = selected.indexOf(keys[i]) > -1;
        h += `<button class="blog__filter-tag${act ? ' blog__filter-tag--active' : ''}" data-filter-value="${escapeHtml(keys[i])}">${escapeHtml(keys[i])}${countSuffix(fc, counts, keys[i])}</button>`;
      }
      return h + '</div>';
    }

    function renderSelectFilter(fc, keys, counts, selected) {
      var selValue = selected.length > 0 ? selected[0] : '';
      var triggerLabel = selValue ? `${escapeHtml(selValue)}${fc.count ? ` (${counts[selValue]})` : ''}` : `${escapeHtml(fc.label)} — Tous`;
      var filledClass = selValue ? ' blog__filter-select-trigger--filled' : '';
      var h = `<div class="blog__filters blog__filters--select" data-filter-field="${fc.field}" data-filter-style="select">
        <div class="blog__filter-select">
          <div class="blog__filter-select-trigger${filledClass}">${triggerLabel}</div>
          <div class="blog__filter-select-options">
            <div class="blog__filter-select-option${!selValue ? ' blog__filter-select-option--active' : ''}" data-value="">Tous</div>`;
      for (var i = 0; i < keys.length; i++) {
        var act = selected.indexOf(keys[i]) > -1;
        h += `<div class="blog__filter-select-option${act ? ' blog__filter-select-option--active' : ''}" data-value="${escapeHtml(keys[i])}">${escapeHtml(keys[i])}${countSuffix(fc, counts, keys[i])}</div>`;
      }
      h += '</div></div></div>';
      return h;
    }

    function renderCheckboxFilter(fc, keys, counts, selected) {
      var h = `<div class="blog__filters blog__filters--checkboxes" data-filter-field="${fc.field}" data-filter-style="checkboxes">`;
      for (var i = 0; i < keys.length; i++) {
        var act = selected.indexOf(keys[i]) > -1;
        h += `<div class="blog__filter-checkbox-option${act ? ' blog__filter-checkbox-option--active' : ''}" data-value="${escapeHtml(keys[i])}">${escapeHtml(keys[i])}${countSuffix(fc, counts, keys[i])}</div>`;
      }
      return h + '</div>';
    }

    function renderRadioFilter(fc, keys, counts, selected) {
      var isNone = selected.length === 0;
      var h = `<div class="blog__filters blog__filters--radios" data-filter-field="${fc.field}" data-filter-style="radios">`;
      h += `<div class="blog__filter-radio-option${isNone ? ' blog__filter-radio-option--active' : ''}" data-value="">Tous</div>`;
      for (var i = 0; i < keys.length; i++) {
        var act = selected.indexOf(keys[i]) > -1;
        h += `<div class="blog__filter-radio-option${act ? ' blog__filter-radio-option--active' : ''}" data-value="${escapeHtml(keys[i])}">${escapeHtml(keys[i])}${countSuffix(fc, counts, keys[i])}</div>`;
      }
      return h + '</div>';
    }

    function renderMultiSelectFilter(fc, keys, counts, selected) {
      var triggerLabel = selected.length > 0
        ? selected.join(', ')
        : `${escapeHtml(fc.label)} — Tous`;
      var filledClass = selected.length > 0 ? ' blog__filter-multi-trigger--filled' : '';
      var h = `<div class="blog__filters blog__filters--multi-select" data-filter-field="${fc.field}" data-filter-style="multi-select">
        <div class="blog__filter-multi">
          <div class="blog__filter-multi-trigger${filledClass}">${triggerLabel}</div>
          <div class="blog__filter-multi-options">`;
      for (var i = 0; i < keys.length; i++) {
        var act = selected.indexOf(keys[i]) > -1;
        h += `<div class="blog__filter-multi-option${act ? ' blog__filter-multi-option--active' : ''}" data-value="${escapeHtml(keys[i])}">${escapeHtml(keys[i])}${countSuffix(fc, counts, keys[i])}</div>`;
      }
      h += '</div></div></div>';
      return h;
    }

    function renderFilterBlock(fc) {
      var values = extractFieldValues(allRows, fc.field);
      var keys = Object.keys(values).sort();
      if (keys.length === 0) return '';
      var selected = activeFilters[fc.field] || [];
      switch (fc.style) {
        case 'select': return renderSelectFilter(fc, keys, values, selected);
        case 'multi-select': return renderMultiSelectFilter(fc, keys, values, selected);
        case 'checkboxes': return renderCheckboxFilter(fc, keys, values, selected);
        case 'radios': return renderRadioFilter(fc, keys, values, selected);
        default: return renderPillsFilter(fc, keys, values, selected);
      }
    }

    /* ---------- Render all filters (internes + externes) ---------- */

    function renderAllFilters() {
      var html = '';
      for (var i = 0; i < filterConfigs.length; i++) {
        html += renderFilterBlock(filterConfigs[i]);
      }
      filtersWrap.innerHTML = html;
      bindFilterEvents(filtersWrap);

      // Filtres externes : <div data-blog-filter="categories" data-filter-style="checkboxes">
      var externals = document.querySelectorAll('[data-blog-filter]');
      for (var e = 0; e < externals.length; e++) {
        var el = externals[e];
        var field = el.getAttribute('data-blog-filter');
        var style = el.getAttribute('data-filter-style') || 'pills';
        var showCount = el.getAttribute('data-filter-count') !== 'false';
        var labels = { categories: 'Catégories', taxonomies: 'Tags' };
        var fc = { field: field, style: style, label: el.getAttribute('data-filter-label') || labels[field] || field, count: showCount };
        el.innerHTML = renderFilterBlock(fc);
        bindFilterEvents(el);
      }
    }

    /* ---------- Event binding ---------- */

    function bindFilterEvents(wrapper) {
      // Pills
      var pills = wrapper.querySelectorAll('[data-filter-style="pills"] .blog__filter-tag');
      for (var p = 0; p < pills.length; p++) {
        pills[p].addEventListener('click', function () {
          var field = getFilterField(this);
          activeFilters[field] = this.getAttribute('data-filter-value') ? [this.getAttribute('data-filter-value')] : [];
          onFilterChange();
        });
      }

      // Custom Select (single)
      var selectTriggers = wrapper.querySelectorAll('.blog__filter-select-trigger');
      for (var st = 0; st < selectTriggers.length; st++) {
        selectTriggers[st].addEventListener('click', function (e) {
          e.stopPropagation();
          var selectEl = this.parentElement;
          var wasOpen = selectEl.classList.contains('blog__filter-select--open');
          // Fermer tous les selects/multis ouverts
          closeAllDropdowns();
          if (!wasOpen) selectEl.classList.add('blog__filter-select--open');
        });
      }
      var selectOptions = wrapper.querySelectorAll('.blog__filter-select-option');
      for (var so = 0; so < selectOptions.length; so++) {
        selectOptions[so].addEventListener('click', function (e) {
          e.stopPropagation();
          var field = getFilterField(this);
          var value = this.getAttribute('data-value');
          activeFilters[field] = value ? [value] : [];
          onFilterChange();
        });
      }

      // Custom Multi-Select
      var multiTriggers = wrapper.querySelectorAll('.blog__filter-multi-trigger');
      for (var mt = 0; mt < multiTriggers.length; mt++) {
        multiTriggers[mt].addEventListener('click', function (e) {
          e.stopPropagation();
          var msEl = this.parentElement;
          var wasOpen = msEl.classList.contains('blog__filter-multi--open');
          closeAllDropdowns();
          if (!wasOpen) msEl.classList.add('blog__filter-multi--open');
        });
      }
      var multiOptions = wrapper.querySelectorAll('.blog__filter-multi-option');
      for (var mo = 0; mo < multiOptions.length; mo++) {
        multiOptions[mo].addEventListener('click', function (e) {
          e.stopPropagation();
          var field = getFilterField(this);
          var value = this.getAttribute('data-value');
          if (!value) return;
          var current = activeFilters[field] || [];
          var idx = current.indexOf(value);
          if (idx > -1) { current.splice(idx, 1); }
          else { current.push(value); }
          activeFilters[field] = current;
          onFilterChange();
        });
      }

      // Custom Checkboxes (div-based, toggle)
      var checkOpts = wrapper.querySelectorAll('.blog__filter-checkbox-option');
      for (var c = 0; c < checkOpts.length; c++) {
        checkOpts[c].addEventListener('click', function () {
          var field = getFilterField(this);
          var value = this.getAttribute('data-value');
          if (!value) return;
          var current = activeFilters[field] || [];
          var idx = current.indexOf(value);
          if (idx > -1) { current.splice(idx, 1); }
          else { current.push(value); }
          activeFilters[field] = current;
          onFilterChange();
        });
      }

      // Custom Radios (div-based, single select)
      var radioOpts = wrapper.querySelectorAll('.blog__filter-radio-option');
      for (var r = 0; r < radioOpts.length; r++) {
        radioOpts[r].addEventListener('click', function () {
          var field = getFilterField(this);
          var value = this.getAttribute('data-value');
          activeFilters[field] = value ? [value] : [];
          onFilterChange();
        });
      }
    }

    /** Ferme tous les selects/multis custom ouverts */
    function closeAllDropdowns() {
      var open = document.querySelectorAll('.blog__filter-select--open, .blog__filter-multi--open');
      for (var d = 0; d < open.length; d++) {
        open[d].classList.remove('blog__filter-select--open');
        open[d].classList.remove('blog__filter-multi--open');
      }
    }

    // Fermer au clic extérieur
    document.addEventListener('click', closeAllDropdowns);

    /* ---------- Filter change + render ---------- */

    function onFilterChange() {
      applyFilters();
      displayedCount = 0;
      renderAllFilters();
      renderPage();
    }

    function renderPage() {
      var end = Math.min(displayedCount + perPage, filteredRows.length);

      if (filteredRows.length === 0) {
        gridEl.innerHTML = '<div class="blog__empty">Aucun article</div>';
        loadMoreEl.innerHTML = '';
        return;
      }

      var html = '';
      if (displayedCount === 0) {
        for (var i = 0; i < end; i++) html += renderCard(filteredRows[i]);
        gridEl.innerHTML = html;
      } else {
        for (var j = displayedCount; j < end; j++) html += renderCard(filteredRows[j]);
        gridEl.insertAdjacentHTML('beforeend', html);
      }
      displayedCount = end;

      if (displayedCount < filteredRows.length) {
        loadMoreEl.innerHTML = '<button class="blog__load-more-btn">Charger plus</button>';
        loadMoreEl.querySelector('.blog__load-more-btn').addEventListener('click', function () {
          this.disabled = true;
          this.textContent = 'Chargement\u2026';
          renderPage();
        });
      } else {
        loadMoreEl.innerHTML = '';
      }

      if (typeof window.initAnimations === 'function') window.initAnimations();
    }

    /* ---------- Go ---------- */

    fetchAllRows(function (err, rows) {
      if (err) {
        gridEl.innerHTML = '<div class="blog__empty">Erreur de chargement</div>';
        return;
      }
      allRows = rows;
      filteredRows = rows.slice();
      renderAllFilters();
      renderPage();
    });
  }

  /* ---------- Article ---------- */

  function initArticle(container) {
    // Get ID or slug from URL
    var params = (typeof window.getUrlParams === 'function') ? window.getUrlParams() : {};
    var id = params.id;
    var slug = params.slug || getSlugFromPath();

    if (!id && !slug) {
      container.innerHTML = '<div class="blog__empty">Article introuvable</div>';
      return;
    }

    container.innerHTML = '<div class="blog__loading">Chargement...</div>';

    var onRow = function (err, row) {
      if (err || !row) {
        container.innerHTML = '<div class="blog__empty">Article introuvable</div>';
        return;
      }
      /* Bloquer l'acces aux articles en brouillon */
      var status = getStatus(row);
      if (status === 'draft') {
        container.innerHTML = '<div class="blog__empty">Article introuvable</div>';
        return;
      }
      renderArticle(container, row);
    };

    if (slug) {
      fetchRowBySlug(slug, onRow);
    } else {
      fetchRowById(id, onRow);
    }
  }

  /** Helper: icon markup (requires icons.js) */
  function iconHtml(name, size) {
    return `<span data-icon="${name}" data-icon-type="outline" data-icon-size="${size || 16}" data-icon-animate="no"></span>`;
  }

  function renderArticle(container, row) {
    var title = safeField(row, 'title');
    var featuredImg = safeField(row, 'featured_img') || config.defaultImage;
    var date = safeField(row, 'date');
    var author = safeField(row, 'author');
    var readTime = safeField(row, 'read_time');
    var cats = multiSelectValues(row, 'categories');
    var taxonomies = multiSelectValues(row, 'taxonomies');
    var content = safeField(row, 'content');
    var metaTitle = safeField(row, 'meta_title');
    var metaDesc = safeField(row, 'meta_description');

    // SEO — Dynamic meta tags
    var seoTitle = metaTitle || title;
    var seoDesc = metaDesc || (safeField(row, 'excerpt') || '');

    if (seoTitle) {
      document.title = seoTitle;
    }

    // Helper: set or create a <meta> tag
    function setMeta(attr, attrValue, content) {
      if (!content) return;
      var sel = `meta[${attr}="${attrValue}"]`;
      var tag = document.querySelector(sel);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    }

    setMeta('name', 'description', seoDesc);

    // Open Graph
    setMeta('property', 'og:title', seoTitle);
    setMeta('property', 'og:description', seoDesc);
    setMeta('property', 'og:type', 'article');
    if (featuredImg) {
      setMeta('property', 'og:image', featuredImg);
    }
    setMeta('property', 'og:url', window.location.href);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', seoTitle);
    setMeta('name', 'twitter:description', seoDesc);
    if (featuredImg) {
      setMeta('name', 'twitter:image', featuredImg);
    }

    var html = '';

    // Back link — history.back() si navigation interne, sinon fallback config
    var blogPage = config.blogPage || 'blog';
    if (blogPage.charAt(0) !== '/') blogPage = '/' + blogPage;
    html += `<a href="${blogPage}" onclick="if(history.length>1){history.back();return false;}" class="blog-article__back">
      ${iconHtml('arrow-left', 16)}
      <span>Retour au blog</span>
    </a>`;

    // Hero
    if (featuredImg) {
      html += `<div class="blog-article__hero anim-fade-in">
        <img src="${escapeHtml(featuredImg)}" alt="${escapeHtml(title || '')}">
      </div>`;
    } else {
      html += `<div class="blog-article__hero blog-article__hero--placeholder anim-fade-in">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>`;
    }

    // Header
    html += '<div class="blog-article__header">';

    // Categories (above title)
    if (cats.length > 0) {
      html += '<div class="blog-article__categories anim-fade-in-up">';
      for (var i = 0; i < cats.length; i++) {
        html += `<span class="blog-article__category">${escapeHtml(cats[i])}</span>`;
      }
      html += '</div>';
    }

    if (title) {
      html += `<h1 class="blog-article__title anim-fade-in-up anim--delay-1">${escapeHtml(title)}</h1>`;
    }

    // Meta with icons
    var hasMetaItems = date || author || readTime;
    if (hasMetaItems) {
      html += '<div class="blog-article__meta anim-fade-in-up anim--delay-2">';
      if (date) {
        html += `<span class="blog-article__meta-item">
          ${iconHtml('calendar-days', 16)}
          <span>${formatDate(date)}</span>
        </span>`;
      }
      if (author) {
        html += `<span class="blog-article__meta-item">
          ${iconHtml('user', 16)}
          <span>${escapeHtml(author)}</span>
        </span>`;
      }
      if (readTime) {
        html += `<span class="blog-article__meta-item">
          ${iconHtml('clock', 16)}
          <span>${escapeHtml(String(readTime))} min de lecture</span>
        </span>`;
      }
      html += '</div>';
    }

    html += '</div>'; // .blog-article__header

    // Content (HTML sanitisé depuis Baserow)
    if (content) {
      html += `<div class="blog-article__content anim-fade-in-up anim--delay-3">${sanitizeHtml(content)}</div>`;
    }

    // Taxonomies with icon
    if (taxonomies.length > 0) {
      html += `<div class="blog-article__taxonomies">${iconHtml('hashtag', 14)}`;
      for (var ti = 0; ti < taxonomies.length; ti++) {
        html += `<span class="blog-article__taxonomy">${escapeHtml(taxonomies[ti])}</span>`;
      }
      html += '</div>';
    }

    // Gallery
    var galleryUrls = [];
    for (var g = 1; g <= 5; g++) {
      var urls = safeFileUrls(row, 'gallery_' + g);
      for (var u = 0; u < urls.length; u++) {
        galleryUrls.push(urls[u]);
      }
      if (urls.length === 0) {
        var singleUrl = safeField(row, 'gallery_' + g);
        if (singleUrl && typeof singleUrl === 'string' && singleUrl.indexOf('http') === 0) {
          galleryUrls.push(singleUrl);
        }
      }
    }

    if (galleryUrls.length > 0) {
      html += '<div class="blog-article__gallery">';
      for (var gi = 0; gi < galleryUrls.length; gi++) {
        html += `<div class="blog-article__gallery-item" data-lightbox-index="${gi}">
          <img src="${escapeHtml(galleryUrls[gi])}" alt="" loading="lazy">
        </div>`;
      }
      html += '</div>';
    }

    // Share section
    var pageUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(title || '');
    html += `<div class="blog-article__share">
      <h3 class="blog-article__share-title">Partager cet article</h3>
      <div class="blog-article__share-actions">
        <button class="blog-article__share-btn" data-share-copy>
          ${iconHtml('link', 18)}
          <span>Copier le lien</span>
        </button>
        <a href="https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}" target="_blank" rel="noopener noreferrer" class="blog-article__share-btn">
          ${iconHtml('arrow-up-right', 18)}
          <span>Twitter / X</span>
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}" target="_blank" rel="noopener noreferrer" class="blog-article__share-btn">
          ${iconHtml('arrow-up-right', 18)}
          <span>LinkedIn</span>
        </a>
      </div>
    </div>`;

    container.innerHTML = html;

    // Init icons (loaded dynamically)
    if (typeof window.initIcons === 'function') {
      window.initIcons(container);
    }

    // Init animations
    if (typeof window.initAnimations === 'function') {
      window.initAnimations();
    }

    // Init lightbox
    if (galleryUrls.length > 0) {
      initLightbox(container, galleryUrls);
    }

    // Copy link button
    var copyBtn = container.querySelector('[data-share-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(window.location.href).then(function () {
          var span = copyBtn.querySelector('span:last-child');
          if (span) {
            span.textContent = 'Lien copié !';
            setTimeout(function () { span.textContent = 'Copier le lien'; }, 2000);
          }
        }).catch(function () {});
      });
    }

    // Load related articles
    fetchPublishedRows(function (err, allRows) {
      if (!err && allRows) renderRelated(container, row, allRows);
    });
  }

  /* ---------- Related Articles ---------- */

  function renderRelated(container, currentRow, allRows) {
    var currentCats = multiSelectValues(currentRow, 'categories');
    var currentId = currentRow.id;
    var related = [];

    // Find articles with shared categories
    for (var i = 0; i < allRows.length && related.length < 3; i++) {
      var row = allRows[i];
      if (row.id === currentId) continue;
      var rowCats = multiSelectValues(row, 'categories');
      for (var j = 0; j < currentCats.length; j++) {
        if (rowCats.indexOf(currentCats[j]) > -1) {
          related.push(row);
          break;
        }
      }
    }

    // Fallback: fill with most recent articles if not enough related
    if (related.length < 3) {
      for (var k = 0; k < allRows.length && related.length < 3; k++) {
        var r = allRows[k];
        if (r.id === currentId) continue;
        var already = false;
        for (var m = 0; m < related.length; m++) {
          if (related[m].id === r.id) { already = true; break; }
        }
        if (!already) related.push(r);
      }
    }

    if (related.length === 0) return;

    var html = '<div class="blog-related">';
    html += '<h2 class="blog-related__title anim-fade-in-up">Articles similaires</h2>';
    html += '<div class="blog-related__grid">';
    for (var ri = 0; ri < related.length; ri++) {
      html += renderCard(related[ri]);
    }
    html += '</div></div>';

    container.insertAdjacentHTML('beforeend', html);

    if (typeof window.initIcons === 'function') window.initIcons(container);
    if (typeof window.initAnimations === 'function') window.initAnimations();
  }

  /* ---------- Lightbox ---------- */

  function initLightbox(container, urls) {
    var currentIndex = 0;

    // Réutiliser la lightbox existante si elle existe déjà
    var lightbox = document.querySelector('.blog-lightbox');
    if (lightbox) lightbox.remove();

    lightbox = document.createElement('div');
    lightbox.className = 'blog-lightbox';
    lightbox.innerHTML = `
      <div class="blog-lightbox__overlay"></div>
      <img class="blog-lightbox__image" src="" alt="">
      <button class="blog-lightbox__close">&times;</button>
      <button class="blog-lightbox__prev">&lsaquo;</button>
      <button class="blog-lightbox__next">&rsaquo;</button>`;
    document.body.appendChild(lightbox);

    var imgEl = lightbox.querySelector('.blog-lightbox__image');

    function open(index) {
      currentIndex = index;
      imgEl.src = urls[currentIndex];
      lightbox.classList.add('blog-lightbox--active');
      if (typeof window.__scrollLockCount !== 'undefined') {
        window.__scrollLockCount++;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'hidden';
      }
    }

    function close() {
      lightbox.classList.remove('blog-lightbox--active');
      if (typeof window.__scrollLockCount !== 'undefined') {
        window.__scrollLockCount = Math.max(0, window.__scrollLockCount - 1);
        if (window.__scrollLockCount === 0) document.body.style.overflow = '';
      } else {
        document.body.style.overflow = '';
      }
    }

    function prev() {
      currentIndex = (currentIndex - 1 + urls.length) % urls.length;
      imgEl.src = urls[currentIndex];
    }

    function next() {
      currentIndex = (currentIndex + 1) % urls.length;
      imgEl.src = urls[currentIndex];
    }

    // Gallery item clicks
    var items = container.querySelectorAll('.blog-article__gallery-item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-lightbox-index'), 10);
        open(idx);
      });
    }

    // Controls
    lightbox.querySelector('.blog-lightbox__overlay').addEventListener('click', close);
    lightbox.querySelector('.blog-lightbox__close').addEventListener('click', close);
    lightbox.querySelector('.blog-lightbox__prev').addEventListener('click', prev);
    lightbox.querySelector('.blog-lightbox__next').addEventListener('click', next);

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('blog-lightbox--active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  /* ---------- Init ---------- */

  function init() {
    if (!config) return;

    if (!config.baserow || !config.baserow.tableId) {
      var containers = document.querySelectorAll('[data-blog]');
      for (var i = 0; i < containers.length; i++) {
        containers[i].innerHTML = '<div class="blog__empty">Blog non configuré</div>';
      }
      return;
    }

    var listings = document.querySelectorAll('[data-blog="listing"]');
    for (var l = 0; l < listings.length; l++) {
      initListing(listings[l]);
    }

    var articles = document.querySelectorAll('[data-blog="article"]');
    for (var a = 0; a < articles.length; a++) {
      initArticle(articles[a]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
