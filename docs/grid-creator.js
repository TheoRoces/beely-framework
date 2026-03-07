/* ==========================================================================
   GRID CREATOR — Outil interactif standalone pour les docs
   Génère le code HTML des grilles et bento du framework
   ========================================================================== */
(function () {
  'use strict';

  var GRID_GAPS = [
    { value: 'none', label: 'Aucun' },
    { value: 'xs', label: 'XS' },
    { value: 'sm', label: 'SM' },
    { value: 'md', label: 'MD' },
    { value: 'lg', label: 'LG' },
    { value: 'xl', label: 'XL' }
  ];

  var GRID_ALIGNS = [
    { value: 'stretch', label: 'Stretch' },
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' }
  ];

  var BENTO_SIZES = [
    { value: '', label: 'Normal' },
    { value: 'wide', label: 'Wide (2×1)' },
    { value: 'tall', label: 'Tall (1×2)' },
    { value: 'large', label: 'Large (2×2)' },
    { value: 'full', label: 'Full width' }
  ];

  var BENTO_LAYOUTS = [
    { value: '', label: 'Aucun' },
    { value: 'sidebar', label: 'Sidebar (2/3 + 1/3)' },
    { value: 'sidebar-left', label: 'Sidebar gauche (1/3 + 2/3)' },
    { value: 'feature', label: 'Feature (1 grand + 2 empilés)' }
  ];

  var BENTO_ROW_HEIGHTS = [
    { value: 'sm', label: 'SM (120px)' },
    { value: 'md', label: 'MD (180px)' },
    { value: 'lg', label: 'LG (240px)' },
    { value: 'xl', label: 'XL (320px)' }
  ];

  var RESPONSIVE_BREAKPOINTS = [
    { key: 'colsTablet', label: 'Tablette', bp: '991px' },
    { key: 'colsMobileL', label: 'Mobile L', bp: '767px' },
    { key: 'colsMobile', label: 'Mobile', bp: '478px' }
  ];

  var state = {
    type: 'grid',
    cols: 3,
    gap: 'md',
    align: 'stretch',
    itemCount: 3,
    selectedItem: -1,
    spans: {},
    layout: '',
    rowHeight: 'md',
    bentoSizes: ['', '', '', '', '', '', '', '', '', '', '', ''],
    gridName: '',
    colsTablet: 0,
    colsMobileL: 0,
    colsMobile: 0
  };

  function slugifyName(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /* ---------- Helpers ---------- */

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast('Copié !');
  }

  function showToast(msg) {
    var existing = document.querySelector('.creator-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'creator-toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:var(--space-6);right:var(--space-6);padding:var(--space-2) var(--space-4);background:var(--color-text);color:var(--color-bg);border-radius:var(--radius-md);font-size:var(--text-sm);z-index:9999;animation:fadeIn 0.2s ease;';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2000);
  }

  function getGridOutput() {
    if (state.type === 'grid') {
      var attrs = ' data-cols="' + state.cols + '"';
      if (state.gap !== 'md') attrs += ' data-gap="' + state.gap + '"';
      if (state.align !== 'stretch') attrs += ' data-align="' + state.align + '"';
      var className = 'grid';
      if (state.gridName) className += ' ' + state.gridName;
      var lines = ['<div class="' + className + '"' + attrs + '>'];
      for (var i = 0; i < state.itemCount; i++) {
        var itemAttrs = '';
        var sp = state.spans[i];
        if (sp) {
          if (sp.col) itemAttrs += ' data-col-span="' + sp.col + '"';
          if (sp.row) itemAttrs += ' data-row-span="' + sp.row + '"';
        }
        lines.push('  <div' + itemAttrs + '>Contenu ' + (i + 1) + '</div>');
      }
      lines.push('</div>');
      return lines.join('\n');
    } else {
      var attrs = '';
      if (state.gap !== 'md') attrs += ' data-gap="' + state.gap + '"';
      if (state.rowHeight !== 'md') attrs += ' data-row-height="' + state.rowHeight + '"';
      if (state.layout) attrs += ' data-layout="' + state.layout + '"';
      var lines = ['<div class="bento"' + attrs + '>'];
      for (var i = 0; i < state.itemCount; i++) {
        var sizeAttr = state.bentoSizes[i] ? ' data-size="' + state.bentoSizes[i] + '"' : '';
        lines.push('  <div class="bento__item"' + sizeAttr + '>Contenu ' + (i + 1) + '</div>');
      }
      lines.push('</div>');
      return lines.join('\n');
    }
  }

  function getResponsiveCss() {
    if (!state.gridName || state.type !== 'grid') return '';
    var lines = [];
    RESPONSIVE_BREAKPOINTS.forEach(function (bp) {
      var cols = state[bp.key];
      if (cols > 0) {
        var tpl = cols === 1 ? '1fr' : 'repeat(' + cols + ', 1fr)';
        lines.push('@media (max-width: ' + bp.bp + ') {');
        lines.push('  .' + state.gridName + ' { grid-template-columns: ' + tpl + '; }');
        lines.push('}');
      }
    });
    return lines.join('\n');
  }

  function updatePreview() {
    var previewEl = document.getElementById('gridCreatorPreview');
    if (!previewEl) return;

    var html = '';
    if (state.type === 'grid') {
      var attrs = ' data-cols="' + state.cols + '"';
      if (state.gap !== 'md') attrs += ' data-gap="' + state.gap + '"';
      if (state.align !== 'stretch') attrs += ' data-align="' + state.align + '"';
      html += '<div class="grid"' + attrs + '>';
      for (var i = 0; i < state.itemCount; i++) {
        var itemAttrs = '';
        var sp = state.spans[i];
        if (sp) {
          if (sp.col) itemAttrs += ' data-col-span="' + sp.col + '"';
          if (sp.row) itemAttrs += ' data-row-span="' + sp.row + '"';
        }
        var selected = state.selectedItem === i ? ' creator__grid-preview-item--selected' : '';
        html += '<div class="creator__grid-preview-item' + selected + '"' + itemAttrs + ' data-grid-item="' + i + '">' + (i + 1) + '</div>';
      }
      html += '</div>';
    } else {
      var attrs = '';
      if (state.gap !== 'md') attrs += ' data-gap="' + state.gap + '"';
      if (state.rowHeight !== 'md') attrs += ' data-row-height="' + state.rowHeight + '"';
      if (state.layout) attrs += ' data-layout="' + state.layout + '"';
      html += '<div class="bento"' + attrs + '>';
      for (var i = 0; i < state.itemCount; i++) {
        var sizeAttr = state.bentoSizes[i] ? ' data-size="' + state.bentoSizes[i] + '"' : '';
        var selected = state.selectedItem === i ? ' creator__grid-preview-item--selected' : '';
        html += '<div class="bento__item creator__grid-preview-item' + selected + '"' + sizeAttr + ' data-grid-item="' + i + '">' + (i + 1) + '</div>';
      }
      html += '</div>';
    }

    previewEl.innerHTML = html;

    previewEl.querySelectorAll('[data-grid-item]').forEach(function (item) {
      item.addEventListener('click', function () {
        var idx = parseInt(item.getAttribute('data-grid-item'));
        state.selectedItem = idx;
        showItemConfig(idx);
        updatePreview();
      });
    });
  }

  function updateOutputDisplay() {
    var output = document.getElementById('gridCreatorOutput');
    if (output) output.textContent = getGridOutput();

    var cssOutput = document.getElementById('gridCreatorCssOutput');
    var cssWrap = document.getElementById('gridCreatorCssWrap');
    if (cssOutput && cssWrap) {
      var css = getResponsiveCss();
      if (css) {
        cssOutput.textContent = css;
        cssWrap.style.display = '';
      } else {
        cssWrap.style.display = 'none';
      }
    }
  }

  function showItemConfig(idx) {
    var configEl = document.getElementById('gridCreatorItemConfig');
    var indexEl = document.getElementById('gridCreatorItemIndex');
    if (!configEl) return;
    configEl.style.display = '';
    if (indexEl) indexEl.textContent = '#' + (idx + 1);

    if (state.type === 'grid') {
      var sp = state.spans[idx] || {};
      document.querySelectorAll('[data-grid-colspan]').forEach(function (b) {
        b.classList.toggle('creator__opt--active', b.getAttribute('data-grid-colspan') === (sp.col || ''));
      });
      document.querySelectorAll('[data-grid-rowspan]').forEach(function (b) {
        b.classList.toggle('creator__opt--active', b.getAttribute('data-grid-rowspan') === (sp.row || ''));
      });
    } else {
      var size = state.bentoSizes[idx] || '';
      document.querySelectorAll('[data-grid-bentosize]').forEach(function (b) {
        b.classList.toggle('creator__opt--active', b.getAttribute('data-grid-bentosize') === size);
      });
    }
  }

  function hideItemConfig() {
    var configEl = document.getElementById('gridCreatorItemConfig');
    if (configEl) configEl.style.display = 'none';
  }

  /* ---------- Render ---------- */

  function render() {
    var root = document.getElementById('gridCreator');
    if (!root) return;

    var html = '';
    html += '<div class="creator">';
    html += '<h3 class="creator__title">Créateur de grilles</h3>';

    // Type toggle
    html += '<div class="creator__group">';
    html += '<div class="creator__grid-toggle">';
    html += '<button class="creator__grid-type' + (state.type === 'grid' ? ' creator__grid-type--active' : '') + '" data-grid-type="grid">Grille flexible</button>';
    html += '<button class="creator__grid-type' + (state.type === 'bento' ? ' creator__grid-type--active' : '') + '" data-grid-type="bento">Bento</button>';
    html += '</div></div>';

    if (state.type === 'grid') {
      // Colonnes
      html += '<div class="creator__group"><label class="creator__label">Colonnes</label>';
      html += '<div class="creator__cols-grid">';
      for (var c = 1; c <= 6; c++) {
        var active = state.cols === c ? ' creator__col--active' : '';
        html += '<button class="creator__col' + active + '" data-grid-cols="' + c + '">' + c + '</button>';
      }
      html += '</div></div>';

      // Gap
      html += '<div class="creator__group"><label class="creator__label">Espacement</label>';
      html += '<div class="creator__options">';
      GRID_GAPS.forEach(function (g) {
        var active = state.gap === g.value ? ' creator__opt--active' : '';
        html += '<button class="creator__opt' + active + '" data-grid-gap="' + g.value + '">' + g.label + '</button>';
      });
      html += '</div></div>';

      // Alignement
      html += '<div class="creator__group"><label class="creator__label">Alignement vertical</label>';
      html += '<div class="creator__options">';
      GRID_ALIGNS.forEach(function (a) {
        var active = state.align === a.value ? ' creator__opt--active' : '';
        html += '<button class="creator__opt' + active + '" data-grid-align="' + a.value + '">' + a.label + '</button>';
      });
      html += '</div></div>';

      // Nombre d'items
      html += '<div class="creator__group"><label class="creator__label">Nombre d\'items</label>';
      html += '<div class="creator__slider-wrap">';
      html += '<input type="range" class="creator__slider" id="gridCreatorItemSlider" min="1" max="12" step="1" value="' + state.itemCount + '">';
      html += '<span class="creator__slider-value" id="gridCreatorItemValue">' + state.itemCount + '</span>';
      html += '</div></div>';

      // ── Responsive ──
      html += '<div class="creator__separator"></div>';
      html += '<div class="creator__group"><label class="creator__label">Responsive <span style="font-weight:normal;color:var(--color-text-light)">(optionnel)</span></label>';
      html += '<div class="creator__field-row">';
      html += '<label class="creator__label creator__label--sm">Nom de la grille</label>';
      html += '<input type="text" class="creator__input" id="gridCreatorName" value="' + state.gridName + '" placeholder="ex : grid-services">';
      html += '</div>';

      if (state.gridName) {
        RESPONSIVE_BREAKPOINTS.forEach(function (bp) {
          html += '<div class="creator__field-row">';
          html += '<label class="creator__label creator__label--sm">' + bp.label + ' (≤ ' + bp.bp + ')</label>';
          html += '<div class="creator__options">';
          var currentVal = state[bp.key];
          var autoActive = currentVal === 0 ? ' creator__opt--active' : '';
          html += '<button class="creator__opt' + autoActive + '" data-grid-resp="' + bp.key + '" data-grid-resp-val="0">Auto</button>';
          for (var c = 1; c <= 6; c++) {
            var active = currentVal === c ? ' creator__opt--active' : '';
            html += '<button class="creator__opt' + active + '" data-grid-resp="' + bp.key + '" data-grid-resp-val="' + c + '">' + c + '</button>';
          }
          html += '</div></div>';
        });
      } else {
        html += '<p style="font-size:var(--text-xs);color:var(--color-text-light);margin:var(--space-2) 0 0;">Nommez votre grille pour configurer le responsive et générer le CSS.</p>';
      }
      html += '</div>';

    } else {
      // Bento : Gap
      html += '<div class="creator__group"><label class="creator__label">Espacement</label>';
      html += '<div class="creator__options">';
      GRID_GAPS.forEach(function (g) {
        var active = state.gap === g.value ? ' creator__opt--active' : '';
        html += '<button class="creator__opt' + active + '" data-grid-gap="' + g.value + '">' + g.label + '</button>';
      });
      html += '</div></div>';

      // Bento : Hauteur de rangée
      html += '<div class="creator__group"><label class="creator__label">Hauteur de rangée</label>';
      html += '<div class="creator__options">';
      BENTO_ROW_HEIGHTS.forEach(function (h) {
        var active = state.rowHeight === h.value ? ' creator__opt--active' : '';
        html += '<button class="creator__opt' + active + '" data-grid-rowheight="' + h.value + '">' + h.label + '</button>';
      });
      html += '</div></div>';

      // Bento : Layout prédéfini
      html += '<div class="creator__group"><label class="creator__label">Layout prédéfini</label>';
      html += '<div class="creator__options">';
      BENTO_LAYOUTS.forEach(function (l) {
        var active = state.layout === l.value ? ' creator__opt--active' : '';
        html += '<button class="creator__opt' + active + '" data-grid-layout="' + l.value + '">' + l.label + '</button>';
      });
      html += '</div></div>';

      // Nombre d'items
      html += '<div class="creator__group"><label class="creator__label">Nombre d\'items</label>';
      html += '<div class="creator__slider-wrap">';
      html += '<input type="range" class="creator__slider" id="gridCreatorItemSlider" min="1" max="12" step="1" value="' + state.itemCount + '">';
      html += '<span class="creator__slider-value" id="gridCreatorItemValue">' + state.itemCount + '</span>';
      html += '</div></div>';
    }

    // Preview
    html += '<div class="creator__group"><label class="creator__label">Aperçu <span style="font-weight:normal;color:var(--color-text-light)">(cliquez sur un item pour le configurer)</span></label>';
    html += '<div class="creator__grid-preview-wrap">';
    html += '<div id="gridCreatorPreview" class="creator__grid-preview"></div>';
    html += '</div></div>';

    // Item config
    html += '<div class="creator__item-config" id="gridCreatorItemConfig" style="display:none;">';
    html += '<div class="creator__item-config-header">';
    html += '<label class="creator__label">Configuration de l\'item <span id="gridCreatorItemIndex"></span></label>';
    html += '<button class="creator__btn" id="gridCreatorDeselect">Désélectionner</button>';
    html += '</div>';

    if (state.type === 'grid') {
      html += '<div class="creator__item-config-row">';
      html += '<label class="creator__label">Col span</label>';
      html += '<div class="creator__options">';
      ['', '2', '3', '4', '5', '6', 'full'].forEach(function (v) {
        var label = v === '' ? 'Auto' : v === 'full' ? 'Full' : v;
        html += '<button class="creator__opt" data-grid-colspan="' + v + '">' + label + '</button>';
      });
      html += '</div></div>';
      html += '<div class="creator__item-config-row">';
      html += '<label class="creator__label">Row span</label>';
      html += '<div class="creator__options">';
      ['', '2', '3', '4'].forEach(function (v) {
        var label = v === '' ? 'Auto' : v;
        html += '<button class="creator__opt" data-grid-rowspan="' + v + '">' + label + '</button>';
      });
      html += '</div></div>';
    } else {
      html += '<div class="creator__item-config-row">';
      html += '<label class="creator__label">Taille</label>';
      html += '<div class="creator__options">';
      BENTO_SIZES.forEach(function (s) {
        html += '<button class="creator__opt" data-grid-bentosize="' + s.value + '">' + s.label + '</button>';
      });
      html += '</div></div>';
    }
    html += '</div>';

    // Output HTML
    html += '<div class="creator__group"><label class="creator__label">Code HTML à copier</label>';
    html += '<div class="creator__output">';
    html += '<code id="gridCreatorOutput" style="white-space:pre;"></code>';
    html += '<button class="creator__btn creator__btn--primary" id="gridCreatorCopy">Copier</button>';
    html += '</div></div>';

    // Output CSS responsive
    html += '<div class="creator__group" id="gridCreatorCssWrap" style="display:none;">';
    html += '<label class="creator__label">CSS responsive à copier</label>';
    html += '<div class="creator__output">';
    html += '<code id="gridCreatorCssOutput" style="white-space:pre;"></code>';
    html += '<button class="creator__btn creator__btn--primary" id="gridCreatorCopyCss">Copier</button>';
    html += '</div></div>';

    // Reset
    html += '<div class="creator__group" style="text-align:center;">';
    html += '<button class="creator__btn" id="gridCreatorReset"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Réinitialiser</button>';
    html += '</div>';

    html += '</div>';
    root.innerHTML = html;

    // Update
    updatePreview();
    updateOutputDisplay();

    // Events
    root.querySelectorAll('[data-grid-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.type = btn.getAttribute('data-grid-type');
        state.selectedItem = -1;
        state.spans = {};
        render();
      });
    });

    root.querySelectorAll('[data-grid-cols]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.cols = parseInt(btn.getAttribute('data-grid-cols'));
        root.querySelectorAll('[data-grid-cols]').forEach(function (b) {
          b.classList.toggle('creator__col--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    root.querySelectorAll('[data-grid-gap]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.gap = btn.getAttribute('data-grid-gap');
        root.querySelectorAll('[data-grid-gap]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    root.querySelectorAll('[data-grid-align]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.align = btn.getAttribute('data-grid-align');
        root.querySelectorAll('[data-grid-align]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    root.querySelectorAll('[data-grid-rowheight]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.rowHeight = btn.getAttribute('data-grid-rowheight');
        root.querySelectorAll('[data-grid-rowheight]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    root.querySelectorAll('[data-grid-layout]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.layout = btn.getAttribute('data-grid-layout');
        root.querySelectorAll('[data-grid-layout]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    var itemSlider = document.getElementById('gridCreatorItemSlider');
    if (itemSlider) {
      itemSlider.addEventListener('input', function () {
        state.itemCount = parseInt(itemSlider.value);
        var label = document.getElementById('gridCreatorItemValue');
        if (label) label.textContent = state.itemCount;
        state.selectedItem = -1;
        updatePreview();
        updateOutputDisplay();
        hideItemConfig();
      });
    }

    document.getElementById('gridCreatorCopy').addEventListener('click', function () {
      var output = document.getElementById('gridCreatorOutput');
      if (output) copyToClipboard(output.textContent);
    });

    var copyCssBtn = document.getElementById('gridCreatorCopyCss');
    if (copyCssBtn) {
      copyCssBtn.addEventListener('click', function () {
        var output = document.getElementById('gridCreatorCssOutput');
        if (output) copyToClipboard(output.textContent);
      });
    }

    // Nom de la grille
    var nameInput = document.getElementById('gridCreatorName');
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        state.gridName = slugifyName(nameInput.value);
        updateOutputDisplay();
        // Re-render pour afficher/cacher les sélecteurs responsive
        var needsRender = (state.gridName && !root.querySelector('[data-grid-resp]'))
          || (!state.gridName && root.querySelector('[data-grid-resp]'));
        if (needsRender) render();
      });
    }

    // Boutons responsive
    root.querySelectorAll('[data-grid-resp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-grid-resp');
        var val = parseInt(btn.getAttribute('data-grid-resp-val'));
        state[key] = val;
        root.querySelectorAll('[data-grid-resp="' + key + '"]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updateOutputDisplay();
      });
    });

    document.getElementById('gridCreatorReset').addEventListener('click', function () {
      state.type = 'grid';
      state.cols = 3;
      state.gap = 'md';
      state.align = 'stretch';
      state.itemCount = 3;
      state.selectedItem = -1;
      state.spans = {};
      state.layout = '';
      state.rowHeight = 'md';
      state.bentoSizes = ['', '', '', '', '', '', '', '', '', '', '', ''];
      state.gridName = '';
      state.colsTablet = 0;
      state.colsMobileL = 0;
      state.colsMobile = 0;
      render();
    });

    var deselectBtn = document.getElementById('gridCreatorDeselect');
    if (deselectBtn) {
      deselectBtn.addEventListener('click', function () {
        state.selectedItem = -1;
        hideItemConfig();
        updatePreview();
      });
    }

    root.querySelectorAll('[data-grid-colspan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.selectedItem < 0) return;
        var val = btn.getAttribute('data-grid-colspan');
        if (!state.spans[state.selectedItem]) state.spans[state.selectedItem] = {};
        state.spans[state.selectedItem].col = val || undefined;
        if (!state.spans[state.selectedItem].col && !state.spans[state.selectedItem].row) {
          delete state.spans[state.selectedItem];
        }
        root.querySelectorAll('[data-grid-colspan]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    root.querySelectorAll('[data-grid-rowspan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.selectedItem < 0) return;
        var val = btn.getAttribute('data-grid-rowspan');
        if (!state.spans[state.selectedItem]) state.spans[state.selectedItem] = {};
        state.spans[state.selectedItem].row = val || undefined;
        if (!state.spans[state.selectedItem].col && !state.spans[state.selectedItem].row) {
          delete state.spans[state.selectedItem];
        }
        root.querySelectorAll('[data-grid-rowspan]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    root.querySelectorAll('[data-grid-bentosize]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.selectedItem < 0) return;
        state.bentoSizes[state.selectedItem] = btn.getAttribute('data-grid-bentosize');
        root.querySelectorAll('[data-grid-bentosize]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
