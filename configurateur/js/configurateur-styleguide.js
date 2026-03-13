/* ==========================================================================
   BUILDER STYLEGUIDE — Guide de style dynamique
   ========================================================================== */
(function () {
  'use strict';

  var loaded = false;
  var copySvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

  /* ---------- Helpers ---------- */
  function getCSS(prop) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  }

  function resolveHex(cssVar) {
    var el = document.createElement('div');
    el.style.backgroundColor = 'var(' + cssVar + ')';
    document.body.appendChild(el);
    var raw = getComputedStyle(el).backgroundColor;
    document.body.removeChild(el);
    if (!raw || raw === 'rgba(0, 0, 0, 0)') return 'transparent';
    // Handle color(srgb r g b) format
    var srgb = raw.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (srgb) {
      return '#' + [srgb[1], srgb[2], srgb[3]].map(function (v) {
        return Math.round(parseFloat(v) * 255).toString(16).padStart(2, '0');
      }).join('');
    }
    // Handle rgb/rgba format
    var rgb = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgb) {
      return '#' + [rgb[1], rgb[2], rgb[3]].map(function (v) {
        return parseInt(v).toString(16).padStart(2, '0');
      }).join('');
    }
    return raw;
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(function () {
      if (window.BuilderApp) window.BuilderApp.showToast('Copié : ' + text, 'success');
    });
  }

  function section(id, title, content, open) {
    return '<details class="bld-sg__section"' + (open ? ' open' : '') + ' id="sg-' + id + '">' +
      '<summary class="bld-sg__section-header"><h2 class="bld-sg__section-title">' + title + '</h2>' +
      '<svg class="bld-sg__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</summary><div class="bld-sg__section-body">' + content + '</div></details>';
  }

  function codeBlock(snippet, emmet) {
    var escaped = snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    var copyVal = snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var html = '<div class="bld-sg__code-group">';
    // Snippet HTML copiable
    html += '<div class="bld-sg__code"><div class="bld-sg__code-label">HTML</div><pre><code>' + escaped + '</code></pre>' +
      '<button class="bld-sg__copy-btn" data-copy-snippet title="Copier le HTML">' + copySvg + '</button></div>';
    // Emmet abréviation copiable
    if (emmet) {
      html += '<div class="bld-sg__code bld-sg__code--emmet"><div class="bld-sg__code-label">Emmet</div><code>' + emmet + '</code>' +
        '<button class="bld-sg__copy-btn" data-copy-code="' + emmet + '" title="Copier l\'abréviation Emmet">' + copySvg + '</button></div>';
    }
    html += '</div>';
    return html;
  }

  /* ═══════════ COLORS ═══════════ */
  function colorStrip(label, baseName, suffixes) {
    var html = '<div class="bld-sg__strip">';
    html += '<div class="bld-sg__strip-label">' + label + '</div>';
    html += '<div class="bld-sg__strip-colors">';
    suffixes.forEach(function (s) {
      var cssVar = s === '' ? '--' + baseName : '--' + baseName + s;
      var hex = resolveHex(cssVar);
      html += '<div class="bld-sg__strip-cell" data-copy="var(' + cssVar + ')" title="' + cssVar + ' · ' + hex + '">' +
        '<div class="bld-sg__strip-bg" style="background:var(' + cssVar + ')"></div>' +
        '<span class="bld-sg__strip-name">' + (s === '' ? 'Base' : s.replace('--', '').replace(/-/g, ' ').toUpperCase().replace(baseName.toUpperCase(), '').trim()) + '</span>' +
      '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderColors() {
    var html = '';
    var suffixes = ['', '-l-1', '-l-2', '-l-3', '-l-4', '-l-5', '-l-6', '-d-1', '-d-2', '-d-3', '-d-4', '-d-5', '-d-6', '-t-1', '-t-2', '-t-3', '-t-4', '-t-5', '-t-6'];
    var shortLabels = ['Base', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

    ['primary', 'secondary', 'tertiary', 'accent', 'neutral'].forEach(function (name) {
      var label = name.charAt(0).toUpperCase() + name.slice(1);
      html += '<div class="bld-sg__strip">';
      html += '<div class="bld-sg__strip-label">' + label + '</div>';
      html += '<div class="bld-sg__strip-colors">';
      suffixes.forEach(function (s, i) {
        var cssVar = s === '' ? '--' + name : '--' + name + s;
        var hex = resolveHex(cssVar);
        html += '<div class="bld-sg__strip-cell" data-copy="var(' + cssVar + ')" title="' + cssVar + '\n' + hex + '">' +
          '<div class="bld-sg__strip-bg" style="background:var(' + cssVar + ')"></div>' +
          '<span class="bld-sg__strip-name">' + shortLabels[i] + '</span>' +
        '</div>';
      });
      html += '</div></div>';
    });

    // Semantic
    html += '<div class="bld-sg__subsection">Sémantiques</div>';
    html += '<div class="bld-sg__strip"><div class="bld-sg__strip-colors">';
    [['Success', '--success'], ['Warning', '--warning'], ['Error', '--error']].forEach(function (c) {
      var hex = resolveHex(c[1]);
      html += '<div class="bld-sg__strip-cell bld-sg__strip-cell--wide" data-copy="var(' + c[1] + ')" title="' + c[1] + '\n' + hex + '">' +
        '<div class="bld-sg__strip-bg" style="background:var(' + c[1] + ')"></div><span class="bld-sg__strip-name">' + c[0] + '</span></div>';
    });
    html += '</div></div>';

    // Text & bg
    html += '<div class="bld-sg__subsection">Texte & fonds</div>';
    html += '<div class="bld-sg__strip"><div class="bld-sg__strip-colors">';
    [['Text', '--text'], ['Text light', '--text-light'], ['Bg', '--bg'], ['Bg alt', '--bg-alt'], ['Border', '--border'], ['Border dark', '--border-dark']].forEach(function (c) {
      var hex = resolveHex(c[1]);
      html += '<div class="bld-sg__strip-cell bld-sg__strip-cell--wide" data-copy="var(' + c[1] + ')" title="' + c[1] + '\n' + hex + '">' +
        '<div class="bld-sg__strip-bg" style="background:var(' + c[1] + ')"></div><span class="bld-sg__strip-name">' + c[0] + '</span></div>';
    });
    html += '</div></div>';

    // Grey scale
    html += '<div class="bld-sg__subsection">Échelle de gris</div>';
    html += '<div class="bld-sg__strip"><div class="bld-sg__strip-colors">';
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(function (n) {
      var v = '--color-neutral-' + n;
      html += '<div class="bld-sg__strip-cell" data-copy="var(' + v + ')" title="' + v + '">' +
        '<div class="bld-sg__strip-bg" style="background:var(' + v + ')"></div><span class="bld-sg__strip-name">' + n + '</span></div>';
    });
    html += '</div></div>';

    return section('colors', 'Couleurs', html, true);
  }

  /* ═══════════ TYPOGRAPHY ═══════════ */
  function renderTypography() {
    var html = '';

    // Fonts
    html += '<div class="bld-sg__font-grid">';
    [['Body', '--font-body'], ['Heading', '--font-heading'], ['Mono', '--font-mono']].forEach(function (f) {
      html += '<div class="bld-sg__font-card" data-copy="var(' + f[1] + ')">' +
        '<span class="bld-sg__font-preview" style="font-family:var(' + f[1] + ')">Aa Bb Cc 0123</span>' +
        '<span class="bld-sg__font-meta">' + f[0] + ' · <code>' + f[1] + '</code></span></div>';
    });
    html += '</div>';

    // Sizes
    html += '<div class="bld-sg__subsection">Tailles</div>';
    html += '<div class="bld-sg__type-list">';
    ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'].forEach(function (s) {
      html += '<div class="bld-sg__type-row" data-copy="var(--' + s + ')">' +
        '<code>--' + s + '</code><span>' + getCSS('--' + s) + '</span>' +
        '<span class="bld-sg__type-sample" style="font-size:var(--' + s + ')">Le vif zéphyr jubile</span></div>';
    });
    html += '</div>';

    // Weights
    html += '<div class="bld-sg__subsection">Graisses</div>';
    html += '<div class="bld-sg__weight-row">';
    [['Normal', '--font-weight-normal'], ['Medium', '--font-weight-medium'], ['Semibold', '--font-weight-semibold'], ['Bold', '--font-weight-bold']].forEach(function (w) {
      html += '<div class="bld-sg__weight-card" data-copy="var(' + w[1] + ')">' +
        '<span style="font-weight:var(' + w[1] + ');font-size:var(--text-lg)">' + w[0] + '</span>' +
        '<code>' + getCSS(w[1]) + '</code></div>';
    });
    html += '</div>';

    return section('typo', 'Typographie', html, true);
  }

  /* ═══════════ SPACING & LAYOUT ═══════════ */
  function renderSpacingLayout() {
    var html = '';

    // Spacing
    html += '<div class="bld-sg__spacing-list">';
    [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].forEach(function (n) {
      var v = '--space-' + n;
      html += '<div class="bld-sg__spacing-row" data-copy="var(' + v + ')">' +
        '<code>' + v + '</code><span>' + getCSS(v) + '</span>' +
        '<div class="bld-sg__spacing-bar" style="width:var(' + v + ')"></div></div>';
    });
    html += '</div>';

    // Radii + Shadows + Transitions
    html += '<div class="bld-sg__row">';

    html += '<div class="bld-sg__half"><div class="bld-sg__subsection">Rayons</div><div class="bld-sg__radii-grid">';
    ['radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-2xl', 'radius-full'].forEach(function (r) {
      var v = '--' + r;
      html += '<div class="bld-sg__radius-item" data-copy="var(' + v + ')">' +
        '<div class="bld-sg__radius-box" style="border-radius:var(' + v + ')"></div>' +
        '<code>' + v + '</code></div>';
    });
    html += '</div></div>';

    html += '<div class="bld-sg__half"><div class="bld-sg__subsection">Ombres</div><div class="bld-sg__shadow-grid">';
    ['shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'].forEach(function (s) {
      var v = '--' + s;
      html += '<div class="bld-sg__shadow-card" data-copy="var(' + v + ')">' +
        '<div class="bld-sg__shadow-box" style="box-shadow:var(' + v + ')"></div>' +
        '<code>' + v + '</code></div>';
    });
    html += '</div></div>';

    html += '</div>';

    // Transitions
    html += '<div class="bld-sg__subsection">Transitions</div>';
    html += '<div class="bld-sg__transition-list">';
    [['--transition-fast', 'Fast'], ['--transition-base', 'Base'], ['--transition-slow', 'Slow']].forEach(function (t) {
      html += '<div class="bld-sg__transition-row" data-copy="var(' + t[0] + ')">' +
        '<code>' + t[0] + '</code><span>' + getCSS(t[0]) + '</span>' +
        '<div class="bld-sg__transition-track"><div class="bld-sg__transition-ball" style="transition:transform var(' + t[0] + ')"></div></div></div>';
    });
    html += '</div>';

    return section('layout', 'Espacements & Layout', html, false);
  }

  /* ═══════════ BUTTONS ═══════════ */
  function renderButtons() {
    var html = '<div class="bld-sg__buttons-row">';
    [
      ['Primary', 'btn btn--primary', '<button class="btn btn--primary">Texte</button>', 'button.btn.btn--primary{Texte}'],
      ['Secondary', 'btn btn--secondary', '<button class="btn btn--secondary">Texte</button>', 'button.btn.btn--secondary{Texte}'],
      ['Disabled', 'btn btn--primary', '<button class="btn btn--primary" disabled>Texte</button>', 'button.btn.btn--primary[disabled]{Texte}']
    ].forEach(function (b) {
      html += '<div class="bld-sg__btn-demo">' +
        '<button class="' + b[1] + '"' + (b[0] === 'Disabled' ? ' disabled' : '') + '>' + b[0] + '</button>' +
        codeBlock(b[2], b[3]) +
      '</div>';
    });
    html += '</div>';
    return section('buttons', 'Boutons', html, false);
  }

  /* ═══════════ FORMS ═══════════ */
  function renderForms() {
    var html = '';

    html += '<div class="bld-sg__form-row">';
    html += '<div class="bld-sg__form-cell">' +
      '<div class="form__field"><label class="form__label">Nom complet</label>' +
      '<input type="text" class="form__input" placeholder="Jean Dupont"></div>' +
      codeBlock(
        '<div class="form__field">\n  <label class="form__label">Label</label>\n  <input type="text" class="form__input" placeholder="...">\n</div>',
        '.form__field>label.form__label{Label}+input.form__input[placeholder="..."]'
      ) + '</div>';
    html += '<div class="bld-sg__form-cell">' +
      '<div class="form__field"><label class="form__label">Email <span class="form__label-hint">(requis)</span></label>' +
      '<input type="email" class="form__input" placeholder="jean@exemple.fr"></div>' +
      codeBlock(
        '<div class="form__field">\n  <label class="form__label">Label <span class="form__label-hint">(requis)</span></label>\n  <input type="email" class="form__input" placeholder="...">\n</div>',
        '.form__field>label.form__label{Label }+input.form__input[type="email"]'
      ) + '</div>';
    html += '</div>';

    html += '<div class="bld-sg__form-row">';
    html += '<div class="bld-sg__form-cell">' +
      '<div class="form__field"><label class="form__label">Message</label>' +
      '<textarea class="form__textarea" placeholder="Votre message..." rows="3"></textarea></div>' +
      codeBlock(
        '<div class="form__field">\n  <label class="form__label">Label</label>\n  <textarea class="form__textarea" rows="3"></textarea>\n</div>',
        '.form__field>label.form__label{Label}+textarea.form__textarea[rows="3"]'
      ) + '</div>';
    html += '<div class="bld-sg__form-cell">' +
      '<div class="form__field"><label class="form__label">Budget</label>' +
      '<div class="form__select" data-name="sg-budget">' +
        '<div class="form__select-trigger">Choisir...</div>' +
        '<div class="form__select-options">' +
          '<div class="form__select-option" data-value="1">Moins de 5 000 €</div>' +
          '<div class="form__select-option" data-value="2">5 000 — 15 000 €</div>' +
          '<div class="form__select-option" data-value="3">Plus de 15 000 €</div>' +
        '</div></div></div>' +
      codeBlock(
        '<div class="form__select" data-name="nom">\n  <div class="form__select-trigger">Choisir...</div>\n  <div class="form__select-options">\n    <div class="form__select-option" data-value="1">Option 1</div>\n    <div class="form__select-option" data-value="2">Option 2</div>\n  </div>\n</div>',
        '.form__select[data-name="nom"]>.form__select-trigger{Choisir...}+.form__select-options>.form__select-option[data-value="$"]{Option $}*3'
      ) + '</div>';
    html += '</div>';

    html += '<div class="bld-sg__form-row">';
    html += '<div class="bld-sg__form-cell">' +
      '<div class="form__field"><label class="form__label">Type de projet</label>' +
      '<div class="form__radio-group" data-name="sg-type">' +
        '<div class="form__radio-option" data-value="site">Site web</div>' +
        '<div class="form__radio-option" data-value="app">Application</div>' +
        '<div class="form__radio-option" data-value="ecom">E-commerce</div>' +
      '</div></div>' +
      codeBlock(
        '<div class="form__radio-group" data-name="nom">\n  <div class="form__radio-option" data-value="a">Option A</div>\n  <div class="form__radio-option" data-value="b">Option B</div>\n</div>',
        '.form__radio-group[data-name="nom"]>.form__radio-option[data-value="$@a"]{Option $}*3'
      ) + '</div>';
    html += '<div class="bld-sg__form-cell">' +
      '<div class="form__field"><label class="form__label">Services souhaités</label>' +
      '<div class="form__checkbox-group" data-name="sg-services">' +
        '<div class="form__checkbox-option" data-value="design">Design</div>' +
        '<div class="form__checkbox-option" data-value="dev">Développement</div>' +
        '<div class="form__checkbox-option" data-value="seo">SEO</div>' +
      '</div></div>' +
      codeBlock(
        '<div class="form__checkbox-group" data-name="nom">\n  <div class="form__checkbox-option" data-value="a">Option A</div>\n  <div class="form__checkbox-option" data-value="b">Option B</div>\n</div>',
        '.form__checkbox-group[data-name="nom"]>.form__checkbox-option[data-value="$@a"]{Option $}*3'
      ) + '</div>';
    html += '</div>';

    return section('forms', 'Formulaires', html, false);
  }

  /* ═══════════ ELEMENTS ═══════════ */
  function renderElements() {
    var html = '';

    // Tabs
    html += '<div class="bld-sg__subsection">Tabs</div>';
    html += '<div class="bld-sg__demo-block">';
    html += '<div class="tabs">' +
      '<div class="tabs__nav">' +
        '<button class="tabs__tab" data-tab="sg-tab1" data-tab-active>Onglet 1</button>' +
        '<button class="tabs__tab" data-tab="sg-tab2">Onglet 2</button>' +
        '<button class="tabs__tab" data-tab="sg-tab3">Onglet 3</button>' +
      '</div>' +
      '<div class="tabs__panel" data-tab-panel="sg-tab1"><p>Contenu du premier onglet. Les tabs permettent de naviguer entre différentes vues.</p></div>' +
      '<div class="tabs__panel" data-tab-panel="sg-tab2"><p>Contenu du deuxième onglet avec un texte différent.</p></div>' +
      '<div class="tabs__panel" data-tab-panel="sg-tab3"><p>Troisième onglet. Chaque panel est activé indépendamment.</p></div>' +
    '</div>';
    html += codeBlock(
      '<div class="tabs">\n  <div class="tabs__nav">\n    <button class="tabs__tab" data-tab="id1" data-tab-active>Onglet 1</button>\n    <button class="tabs__tab" data-tab="id2">Onglet 2</button>\n  </div>\n  <div class="tabs__panel" data-tab-panel="id1">Contenu 1</div>\n  <div class="tabs__panel" data-tab-panel="id2">Contenu 2</div>\n</div>',
      '.tabs>.tabs__nav>button.tabs__tab[data-tab="tab$"]{Onglet $}*3^+.tabs__panel[data-tab-panel="tab$"]{Contenu $}*3'
    );
    html += '</div>';

    // Accordion
    html += '<div class="bld-sg__subsection">Accordéon</div>';
    html += '<div class="bld-sg__demo-block">';
    html += '<div class="accordion">' +
      '<div class="accordion__item"><button class="accordion__header">Section 1</button>' +
        '<div class="accordion__body"><div class="accordion__body-inner"><p>Contenu de la première section de l\'accordéon.</p></div></div></div>' +
      '<div class="accordion__item"><button class="accordion__header">Section 2</button>' +
        '<div class="accordion__body"><div class="accordion__body-inner"><p>Contenu de la deuxième section. Un seul panneau ouvert à la fois par défaut.</p></div></div></div>' +
      '<div class="accordion__item"><button class="accordion__header">Section 3</button>' +
        '<div class="accordion__body"><div class="accordion__body-inner"><p>Ajoutez <code>data-accordion-multi</code> pour autoriser plusieurs panneaux ouverts.</p></div></div></div>' +
    '</div>';
    html += codeBlock(
      '<div class="accordion">\n  <div class="accordion__item">\n    <button class="accordion__header">Titre</button>\n    <div class="accordion__body">\n      <div class="accordion__body-inner">\n        <p>Contenu</p>\n      </div>\n    </div>\n  </div>\n</div>',
      '.accordion>.accordion__item*3>button.accordion__header{Titre $}+.accordion__body>.accordion__body-inner>p{Contenu $}'
    );
    html += '</div>';

    // Popup
    html += '<div class="bld-sg__subsection">Popup / Modal</div>';
    html += '<div class="bld-sg__demo-block">';
    html += '<div style="display:flex;gap:var(--space-3)">' +
      '<button class="btn btn--primary" data-popup-target="sg-popup-center">Ouvrir (centre)</button>' +
      '<button class="btn btn--secondary" data-popup-target="sg-popup-right">Ouvrir (droite)</button>' +
    '</div>' +
    '<div class="popup" data-popup="sg-popup-center">' +
      '<div class="popup__overlay"></div>' +
      '<div class="popup__content">' +
        '<button class="popup__close" data-popup-close>&times;</button>' +
        '<h3 style="margin:0 0 var(--space-3)">Popup centrée</h3>' +
        '<p>Ceci est un exemple de popup modale. Appuyez sur Échap ou cliquez en dehors pour fermer.</p>' +
      '</div></div>' +
    '<div class="popup" data-popup="sg-popup-right" data-popup-position="right">' +
      '<div class="popup__overlay"></div>' +
      '<div class="popup__content">' +
        '<button class="popup__close" data-popup-close>&times;</button>' +
        '<h3 style="margin:0 0 var(--space-3)">Panel latéral</h3>' +
        '<p>Position <code>right</code> pour un panneau latéral.</p>' +
      '</div></div>';
    html += codeBlock(
      '<button data-popup-target="mon-popup">Ouvrir</button>\n\n<div class="popup" data-popup="mon-popup">\n  <div class="popup__overlay"></div>\n  <div class="popup__content">\n    <button class="popup__close" data-popup-close>&times;</button>\n    <h3>Titre</h3>\n    <p>Contenu de la popup.</p>\n  </div>\n</div>',
      'button[data-popup-target="id"]{Ouvrir}+.popup[data-popup="id"]>.popup__overlay+.popup__content>button.popup__close[data-popup-close]{&times;}+h3{Titre}+p{Contenu}'
    );
    html += '</div>';

    // Tooltip
    html += '<div class="bld-sg__subsection">Tooltip</div>';
    html += '<div class="bld-sg__demo-block">';
    html += '<div style="display:flex;gap:var(--space-6);flex-wrap:wrap">' +
      '<span data-tooltip="Tooltip en haut" data-tooltip-pos="top" style="text-decoration:underline dotted;cursor:help">Hover (haut)</span>' +
      '<span data-tooltip="Tooltip en bas" data-tooltip-pos="bottom" style="text-decoration:underline dotted;cursor:help">Hover (bas)</span>' +
      '<span data-tooltip="Tooltip à gauche" data-tooltip-pos="left" style="text-decoration:underline dotted;cursor:help">Hover (gauche)</span>' +
      '<span data-tooltip="Tooltip à droite" data-tooltip-pos="right" style="text-decoration:underline dotted;cursor:help">Hover (droite)</span>' +
    '</div>';
    html += codeBlock(
      '<span data-tooltip="Info au survol" data-tooltip-pos="top">Texte</span>',
      'span[data-tooltip="Info" data-tooltip-pos="top"]{Texte}'
    );
    html += '</div>';

    // Slider
    html += '<div class="bld-sg__subsection">Slider / Carousel</div>';
    html += '<div class="bld-sg__demo-block">';
    html += '<div class="slider" data-slider-per-view="3" data-slider-gap="md" data-slider-loop="true">' +
      '<div class="slider__track">';
    for (var i = 1; i <= 6; i++) {
      html += '<div class="slider__slide"><div style="background:var(--color-bg-alt);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-8);text-align:center;font-weight:var(--font-weight-medium)">Slide ' + i + '</div></div>';
    }
    html += '</div><button class="slider__prev"></button><button class="slider__next"></button><div class="slider__dots"></div></div>';
    html += codeBlock(
      '<div class="slider" data-slider-per-view="3" data-slider-gap="md" data-slider-loop="true">\n  <div class="slider__track">\n    <div class="slider__slide">Slide 1</div>\n    <div class="slider__slide">Slide 2</div>\n    <div class="slider__slide">Slide 3</div>\n  </div>\n  <button class="slider__prev"></button>\n  <button class="slider__next"></button>\n  <div class="slider__dots"></div>\n</div>',
      '.slider[data-slider-per-view="3" data-slider-gap="md" data-slider-loop="true"]>.slider__track>.slider__slide{Slide $}*6^+button.slider__prev+button.slider__next+.slider__dots'
    );
    html += '</div>';

    return section('elements', 'Éléments interactifs', html, false);
  }

  /* ═══════════ RENDER ═══════════ */
  function render() {
    if (loaded) return;
    loaded = true;

    var container = document.getElementById('styleguideContent');
    if (!container) return;

    container.innerHTML =
      renderColors() +
      renderTypography() +
      renderSpacingLayout() +
      renderButtons() +
      renderForms() +
      renderElements();

    // Copy on click
    container.addEventListener('click', function (e) {
      var copyEl = e.target.closest('[data-copy]');
      if (copyEl) { e.stopPropagation(); copyText(copyEl.getAttribute('data-copy')); return; }
      var copyBtn = e.target.closest('[data-copy-code]');
      if (copyBtn) { e.stopPropagation(); copyText(copyBtn.getAttribute('data-copy-code')); return; }
      var snippetBtn = e.target.closest('[data-copy-snippet]');
      if (snippetBtn) {
        e.stopPropagation();
        var codeEl = snippetBtn.closest('.bld-sg__code');
        if (codeEl) {
          var code = codeEl.querySelector('code');
          if (code) copyText(code.textContent);
        }
        return;
      }
    });

    // Transition ball animation
    container.addEventListener('mouseenter', function (e) {
      var row = e.target.closest('.bld-sg__transition-row');
      if (row) { var b = row.querySelector('.bld-sg__transition-ball'); if (b) b.style.transform = 'translateX(120px)'; }
    }, true);
    container.addEventListener('mouseleave', function (e) {
      var row = e.target.closest('.bld-sg__transition-row');
      if (row) { var b = row.querySelector('.bld-sg__transition-ball'); if (b) b.style.transform = 'translateX(0)'; }
    }, true);

    // Init framework components
    if (window.initForms) window.initForms(container);
    if (window.initElements) window.initElements(container);
  }

  window.BuilderStyleguide = {
    refresh: function () { render(); }
  };
})();
