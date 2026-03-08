/* ==========================================================================
   GRID CREATOR — Outil interactif standalone pour les docs
   Génère le code HTML/CSS des grilles et bento du framework
   Version 2 : breakpoints Webflow-style, col-span/row-span par breakpoint
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

  var BREAKPOINTS = [
    { key: 'desktop', label: 'Desktop', bp: null, icon: '🖥', maxWidth: '100%' },
    { key: 'tablet', label: 'Tablette', bp: '991px', icon: '⊞', maxWidth: '768px' },
    { key: 'mobileL', label: 'Mobile L', bp: '767px', icon: '📱', maxWidth: '480px' },
    { key: 'mobile', label: 'Mobile', bp: '478px', icon: '📱', maxWidth: '375px' }
  ];

  var BP_ORDER = ['desktop', 'tablet', 'mobileL', 'mobile'];

  var state = {
    type: 'grid',
    gap: 'md',
    align: 'stretch',
    itemCount: 3,
    selectedItem: -1,
    gridName: '',
    activeBreakpoint: 'desktop',

    // Colonnes par breakpoint (0 = auto/hériter)
    cols: { desktop: 3, tablet: 0, mobileL: 0, mobile: 0 },

    // Spans par breakpoint par item : { desktop: { 0: {col:'2', row:''}, ... }, ... }
    spans: { desktop: {}, tablet: {}, mobileL: {}, mobile: {} },

    // Bento (inchangé)
    layout: '',
    rowHeight: 'md',
    bentoSizes: ['', '', '', '', '', '', '', '', '', '', '', '']
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

  /* ---------- Cascade helpers ---------- */

  function getEffectiveCols(bpKey) {
    var idx = BP_ORDER.indexOf(bpKey);
    for (var i = idx; i >= 0; i--) {
      if (state.cols[BP_ORDER[i]] > 0) return state.cols[BP_ORDER[i]];
    }
    return 3;
  }

  function getEffectiveSpan(bpKey, itemIdx) {
    var idx = BP_ORDER.indexOf(bpKey);
    var result = {};
    // Cascade : du desktop vers le breakpoint actif
    for (var i = 0; i <= idx; i++) {
      var bpSpans = state.spans[BP_ORDER[i]];
      if (bpSpans && bpSpans[itemIdx]) {
        if (bpSpans[itemIdx].col) result.col = bpSpans[itemIdx].col;
        if (bpSpans[itemIdx].row) result.row = bpSpans[itemIdx].row;
      }
    }
    return result;
  }

  function isSpanInherited(bpKey, itemIdx, prop) {
    // Vérifie si la valeur pour ce breakpoint est héritée (pas définie localement)
    var bpSpans = state.spans[bpKey];
    if (!bpSpans || !bpSpans[itemIdx]) return true;
    return !bpSpans[itemIdx][prop];
  }

  /* ---------- Output ---------- */

  function getGridOutput() {
    if (state.type === 'grid') {
      var desktopCols = state.cols.desktop || 3;
      var attrs = ' data-cols="' + desktopCols + '"';
      if (state.gap !== 'md') attrs += ' data-gap="' + state.gap + '"';
      if (state.align !== 'stretch') attrs += ' data-align="' + state.align + '"';

      var className = 'grid';
      if (state.gridName) className += ' ' + state.gridName;

      var lines = ['<div class="' + className + '"' + attrs + '>'];
      for (var i = 0; i < state.itemCount; i++) {
        if (state.gridName) {
          // Classes auto par index, pas de data-col-span/row-span
          lines.push('  <div class="' + state.gridName + '__item-' + (i + 1) + '">Contenu ' + (i + 1) + '</div>');
        } else {
          // Comportement classique avec data-*
          var itemAttrs = '';
          var sp = getEffectiveSpan('desktop', i);
          if (sp.col) itemAttrs += ' data-col-span="' + sp.col + '"';
          if (sp.row) itemAttrs += ' data-row-span="' + sp.row + '"';
          lines.push('  <div' + itemAttrs + '>Contenu ' + (i + 1) + '</div>');
        }
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

    // Desktop : spans uniquement (pas de media query, pas de grid-template-columns)
    var hasDesktopSpans = false;
    for (var i = 0; i < state.itemCount; i++) {
      var sp = state.spans.desktop[i];
      if (sp && (sp.col || sp.row)) {
        hasDesktopSpans = true;
        break;
      }
    }
    if (hasDesktopSpans) {
      lines.push('/* Desktop */');
      for (var i = 0; i < state.itemCount; i++) {
        var sp = state.spans.desktop[i];
        if (!sp) continue;
        var itemClass = '.' + state.gridName + '__item-' + (i + 1);
        var rules = [];
        if (sp.col) rules.push('  grid-column: span ' + (sp.col === 'full' ? '-1' : sp.col) + ';');
        if (sp.row) rules.push('  grid-row: span ' + sp.row + ';');
        if (rules.length) {
          lines.push(itemClass + ' {');
          lines = lines.concat(rules);
          lines.push('}');
        }
      }
    }

    // Breakpoints non-desktop
    for (var b = 1; b < BP_ORDER.length; b++) {
      var bpKey = BP_ORDER[b];
      var bp = BREAKPOINTS[b];
      var bpCols = state.cols[bpKey];
      var bpSpans = state.spans[bpKey] || {};
      var hasOverrides = bpCols > 0;

      // Vérifier s'il y a des spans explicites pour ce breakpoint
      var hasSpanOverrides = false;
      for (var i = 0; i < state.itemCount; i++) {
        if (bpSpans[i] && (bpSpans[i].col || bpSpans[i].row)) {
          hasSpanOverrides = true;
          break;
        }
      }

      if (!hasOverrides && !hasSpanOverrides) continue;

      if (lines.length > 0) lines.push('');
      lines.push('/* ' + bp.label + ' */');
      lines.push('@media (max-width: ' + bp.bp + ') {');

      if (hasOverrides) {
        var tpl = bpCols === 1 ? '1fr' : 'repeat(' + bpCols + ', 1fr)';
        lines.push('  .' + state.gridName + ' {');
        lines.push('    grid-template-columns: ' + tpl + ';');
        lines.push('  }');
      }

      if (hasSpanOverrides) {
        for (var i = 0; i < state.itemCount; i++) {
          var sp = bpSpans[i];
          if (!sp) continue;
          var itemClass = '  .' + state.gridName + '__item-' + (i + 1);
          var rules = [];
          if (sp.col) rules.push('    grid-column: span ' + (sp.col === 'full' ? '-1' : sp.col) + ';');
          if (sp.row) rules.push('    grid-row: span ' + sp.row + ';');
          if (rules.length) {
            lines.push(itemClass + ' {');
            lines = lines.concat(rules);
            lines.push('  }');
          }
        }
      }

      lines.push('}');
    }

    return lines.join('\n');
  }

  /* ---------- Preview ---------- */

  function updatePreview() {
    var previewEl = document.getElementById('gridCreatorPreview');
    var previewWrap = document.getElementById('gridCreatorPreviewWrap');
    if (!previewEl) return;

    // Adapter la largeur du conteneur selon le breakpoint actif
    if (previewWrap && state.gridName && state.type === 'grid') {
      var bpObj = BREAKPOINTS[BP_ORDER.indexOf(state.activeBreakpoint)];
      previewWrap.style.maxWidth = bpObj.maxWidth;
      previewWrap.style.margin = bpObj.maxWidth === '100%' ? '' : '0 auto';
    } else if (previewWrap) {
      previewWrap.style.maxWidth = '';
      previewWrap.style.margin = '';
    }

    var html = '';
    if (state.type === 'grid') {
      var effectiveCols = state.gridName ? getEffectiveCols(state.activeBreakpoint) : (state.cols.desktop || 3);
      var inlineGrid = 'display:grid;grid-template-columns:repeat(' + effectiveCols + ',1fr);';
      var gapMap = { none: '0', xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' };
      inlineGrid += 'gap:' + (gapMap[state.gap] || '16px') + ';';
      if (state.align !== 'stretch') inlineGrid += 'align-items:' + state.align + ';';

      html += '<div style="' + inlineGrid + '">';
      for (var i = 0; i < state.itemCount; i++) {
        var sp = state.gridName ? getEffectiveSpan(state.activeBreakpoint, i) : getEffectiveSpan('desktop', i);
        var itemStyle = '';
        if (sp.col) {
          if (sp.col === 'full') {
            itemStyle += 'grid-column: 1 / -1;';
          } else {
            itemStyle += 'grid-column: span ' + sp.col + ';';
          }
        }
        if (sp.row) itemStyle += 'grid-row: span ' + sp.row + ';';

        var selected = state.selectedItem === i ? ' creator__grid-preview-item--selected' : '';
        var label = state.gridName ? state.gridName + '__item-' + (i + 1) : '' + (i + 1);
        html += '<div class="creator__grid-preview-item' + selected + '" data-grid-item="' + i + '"' + (itemStyle ? ' style="' + itemStyle + '"' : '') + '>' + label + '</div>';
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

  /* ---------- Item config ---------- */

  function showItemConfig(idx) {
    var configEl = document.getElementById('gridCreatorItemConfig');
    var indexEl = document.getElementById('gridCreatorItemIndex');
    if (!configEl) return;
    configEl.style.display = '';
    if (indexEl) indexEl.textContent = '#' + (idx + 1);

    if (state.type === 'grid') {
      var bp = state.gridName ? state.activeBreakpoint : 'desktop';
      var effectiveSpan = getEffectiveSpan(bp, idx);
      var localSpan = (state.spans[bp] && state.spans[bp][idx]) || {};

      document.querySelectorAll('[data-grid-colspan]').forEach(function (b) {
        var val = b.getAttribute('data-grid-colspan');
        var isActive = val === (effectiveSpan.col || '');
        b.classList.toggle('creator__opt--active', isActive);
        // Marquer comme hérité si actif mais pas défini localement
        if (state.gridName && bp !== 'desktop') {
          b.classList.toggle('creator__opt--inherited', isActive && !localSpan.col && val !== '');
        } else {
          b.classList.remove('creator__opt--inherited');
        }
      });
      document.querySelectorAll('[data-grid-rowspan]').forEach(function (b) {
        var val = b.getAttribute('data-grid-rowspan');
        var isActive = val === (effectiveSpan.row || '');
        b.classList.toggle('creator__opt--active', isActive);
        if (state.gridName && bp !== 'desktop') {
          b.classList.toggle('creator__opt--inherited', isActive && !localSpan.row && val !== '');
        } else {
          b.classList.remove('creator__opt--inherited');
        }
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
      // Nom de la grille (avant les breakpoints)
      html += '<div class="creator__group">';
      html += '<div class="creator__field-row">';
      html += '<label class="creator__label">Nom de la grille <span style="font-weight:normal;color:var(--color-text-light)">(optionnel — active le responsive)</span></label>';
      html += '<input type="text" class="creator__input" id="gridCreatorName" value="' + state.gridName + '" placeholder="ex : grid-services">';
      html += '</div></div>';

      // Barre de breakpoints (visible uniquement si gridName)
      if (state.gridName) {
        html += '<div class="creator__group">';
        html += '<label class="creator__label">Breakpoint</label>';
        html += '<div class="creator__bp-bar">';
        BREAKPOINTS.forEach(function (bp) {
          var active = state.activeBreakpoint === bp.key ? ' creator__bp-btn--active' : '';
          html += '<button class="creator__bp-btn' + active + '" data-bp="' + bp.key + '">';
          html += '<span class="creator__bp-label">' + bp.label + '</span>';
          if (bp.bp) html += '<span class="creator__bp-size">≤ ' + bp.bp + '</span>';
          html += '</button>';
        });
        html += '</div></div>';
      }

      // Colonnes
      var currentCols = state.gridName ? state.cols[state.activeBreakpoint] : state.cols.desktop;
      var effectiveCols = getEffectiveCols(state.activeBreakpoint);
      html += '<div class="creator__group"><label class="creator__label">Colonnes';
      if (state.gridName && state.activeBreakpoint !== 'desktop' && currentCols === 0) {
        html += ' <span style="font-weight:normal;color:var(--color-text-light)">(hérité : ' + effectiveCols + ')</span>';
      }
      html += '</label>';
      html += '<div class="creator__cols-grid">';

      // Bouton Auto pour les breakpoints non-desktop
      if (state.gridName && state.activeBreakpoint !== 'desktop') {
        var autoActive = currentCols === 0 ? ' creator__col--active' : '';
        html += '<button class="creator__col' + autoActive + '" data-grid-cols="0">Auto</button>';
      }
      for (var c = 1; c <= 6; c++) {
        var active = '';
        if (state.gridName) {
          active = currentCols === c ? ' creator__col--active' : '';
        } else {
          active = state.cols.desktop === c ? ' creator__col--active' : '';
        }
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
    html += '<div class="creator__grid-preview-wrap" id="gridCreatorPreviewWrap">';
    html += '<div id="gridCreatorPreview" class="creator__grid-preview"></div>';
    html += '</div></div>';

    // Item config
    html += '<div class="creator__item-config" id="gridCreatorItemConfig" style="display:none;">';
    html += '<div class="creator__item-config-header">';
    html += '<label class="creator__label">Configuration de l\'item <span id="gridCreatorItemIndex"></span>';
    if (state.gridName && state.activeBreakpoint !== 'desktop') {
      var bpLabel = BREAKPOINTS[BP_ORDER.indexOf(state.activeBreakpoint)].label;
      html += ' <span style="font-weight:normal;color:var(--color-primary)">(' + bpLabel + ')</span>';
    }
    html += '</label>';
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
    if (state.selectedItem >= 0) showItemConfig(state.selectedItem);

    // ── Events ──

    // Type toggle
    root.querySelectorAll('[data-grid-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.type = btn.getAttribute('data-grid-type');
        state.selectedItem = -1;
        state.activeBreakpoint = 'desktop';
        render();
      });
    });

    // Breakpoint bar
    root.querySelectorAll('[data-bp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeBreakpoint = btn.getAttribute('data-bp');
        render();
      });
    });

    // Colonnes
    root.querySelectorAll('[data-grid-cols]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = parseInt(btn.getAttribute('data-grid-cols'));
        if (state.gridName) {
          state.cols[state.activeBreakpoint] = val;
        } else {
          state.cols.desktop = val;
        }
        root.querySelectorAll('[data-grid-cols]').forEach(function (b) {
          b.classList.toggle('creator__col--active', b === btn);
        });
        updatePreview();
        updateOutputDisplay();
      });
    });

    // Gap
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

    // Alignement
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

    // Bento : row height
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

    // Bento : layout
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

    // Slider items
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

    // Copy HTML
    document.getElementById('gridCreatorCopy').addEventListener('click', function () {
      var output = document.getElementById('gridCreatorOutput');
      if (output) copyToClipboard(output.textContent);
    });

    // Copy CSS
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
        var newName = slugifyName(nameInput.value);
        var hadName = !!state.gridName;
        state.gridName = newName;
        updateOutputDisplay();
        // Re-render si l'état de la barre de breakpoints change
        if ((!hadName && newName) || (hadName && !newName)) render();
      });
    }

    // Reset
    document.getElementById('gridCreatorReset').addEventListener('click', function () {
      state.type = 'grid';
      state.cols = { desktop: 3, tablet: 0, mobileL: 0, mobile: 0 };
      state.gap = 'md';
      state.align = 'stretch';
      state.itemCount = 3;
      state.selectedItem = -1;
      state.spans = { desktop: {}, tablet: {}, mobileL: {}, mobile: {} };
      state.layout = '';
      state.rowHeight = 'md';
      state.bentoSizes = ['', '', '', '', '', '', '', '', '', '', '', ''];
      state.gridName = '';
      state.activeBreakpoint = 'desktop';
      render();
    });

    // Deselect
    var deselectBtn = document.getElementById('gridCreatorDeselect');
    if (deselectBtn) {
      deselectBtn.addEventListener('click', function () {
        state.selectedItem = -1;
        hideItemConfig();
        updatePreview();
      });
    }

    // Col span
    root.querySelectorAll('[data-grid-colspan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.selectedItem < 0) return;
        var val = btn.getAttribute('data-grid-colspan');
        var bp = state.gridName ? state.activeBreakpoint : 'desktop';
        if (!state.spans[bp]) state.spans[bp] = {};
        if (!state.spans[bp][state.selectedItem]) state.spans[bp][state.selectedItem] = {};

        if (val === '' && bp !== 'desktop' && state.gridName) {
          // "Auto" sur un breakpoint non-desktop = supprimer l'override
          delete state.spans[bp][state.selectedItem].col;
          if (!state.spans[bp][state.selectedItem].row) {
            delete state.spans[bp][state.selectedItem];
          }
        } else {
          state.spans[bp][state.selectedItem].col = val || undefined;
          if (!state.spans[bp][state.selectedItem].col && !state.spans[bp][state.selectedItem].row) {
            delete state.spans[bp][state.selectedItem];
          }
        }

        showItemConfig(state.selectedItem);
        updatePreview();
        updateOutputDisplay();
      });
    });

    // Row span
    root.querySelectorAll('[data-grid-rowspan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.selectedItem < 0) return;
        var val = btn.getAttribute('data-grid-rowspan');
        var bp = state.gridName ? state.activeBreakpoint : 'desktop';
        if (!state.spans[bp]) state.spans[bp] = {};
        if (!state.spans[bp][state.selectedItem]) state.spans[bp][state.selectedItem] = {};

        if (val === '' && bp !== 'desktop' && state.gridName) {
          delete state.spans[bp][state.selectedItem].row;
          if (!state.spans[bp][state.selectedItem].col) {
            delete state.spans[bp][state.selectedItem];
          }
        } else {
          state.spans[bp][state.selectedItem].row = val || undefined;
          if (!state.spans[bp][state.selectedItem].col && !state.spans[bp][state.selectedItem].row) {
            delete state.spans[bp][state.selectedItem];
          }
        }

        showItemConfig(state.selectedItem);
        updatePreview();
        updateOutputDisplay();
      });
    });

    // Bento size
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
