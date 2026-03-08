/* ==========================================================================
   ANIMATION CREATOR — Outil interactif standalone pour les docs
   Génère le code HTML des animations du framework
   ========================================================================== */
(function () {
  'use strict';

  var ANIMATIONS = [
    { value: 'anim-fade-in', label: 'Fade In' },
    { value: 'anim-fade-in-up', label: 'Fade In Up' },
    { value: 'anim-fade-in-down', label: 'Fade In Down' },
    { value: 'anim-fade-in-left', label: 'Fade In Left' },
    { value: 'anim-fade-in-right', label: 'Fade In Right' },
    { value: 'anim-scale-in', label: 'Scale In' },
    { value: 'anim-scale-in-up', label: 'Scale In Up' },
    { value: 'anim-slide-in-up', label: 'Slide In Up' },
    { value: 'anim-slide-in-down', label: 'Slide In Down' },
    { value: 'anim-slide-in-left', label: 'Slide In Left' },
    { value: 'anim-slide-in-right', label: 'Slide In Right' },
    { value: 'anim-rotate-in', label: 'Rotate In' }
  ];

  var DURATIONS = [
    { value: '', label: 'Par défaut (600ms)' },
    { value: 'anim--duration-fast', label: 'Rapide (300ms)' },
    { value: 'anim--duration-slow', label: 'Lent (1000ms)' },
    { value: 'anim--duration-slower', label: 'Très lent (1500ms)' }
  ];

  var EASINGS = [
    { value: '', label: 'Par défaut' },
    { value: 'anim--ease-bounce', label: 'Bounce' },
    { value: 'anim--ease-elastic', label: 'Elastic' },
    { value: 'anim--ease-smooth', label: 'Smooth' }
  ];

  var CLICK_ANIMS = [
    { value: 'anim-click-pulse', label: 'Pulse' },
    { value: 'anim-click-shake', label: 'Shake' },
    { value: 'anim-click-bounce', label: 'Bounce' },
    { value: 'anim-click-ripple', label: 'Ripple' }
  ];

  var state = {
    type: 'anim-fade-in-up',
    duration: '',
    easing: '',
    delay: 0,
    exit: false
  };

  /* ---------- Helpers ---------- */

  function getAnimClasses() {
    var classes = [state.type];
    if (state.duration) classes.push(state.duration);
    if (state.easing) classes.push(state.easing);
    if (state.delay > 0) classes.push('anim--delay-' + state.delay);
    return classes;
  }

  function updateOutput() {
    var output = document.getElementById('animCreatorOutput');
    if (!output) return;
    var classes = getAnimClasses();
    var code = 'class="' + classes.join(' ') + '"';
    if (state.exit) code += ' data-anim-exit="true"';
    output.textContent = code;
  }

  function replayPreview() {
    var box = document.getElementById('animCreatorPreview');
    if (!box) return;
    // Désactiver les transitions pendant le reset pour éviter un flash
    box.style.transition = 'none';
    // Réinitialiser : retirer toutes les classes d'animation
    box.className = 'creator__preview-item';
    // Ajouter les classes d'animation SANS le delay (pas pertinent pour le preview)
    var classes = [state.type];
    if (state.duration) classes.push(state.duration);
    if (state.easing) classes.push(state.easing);
    classes.forEach(function (cls) { box.classList.add(cls); });
    // Forcer un reflow pour peindre l'état invisible (opacity:0 + transform)
    void box.offsetWidth;
    // Réactiver les transitions
    box.style.transition = '';
    // Déclencher l'animation d'entrée
    requestAnimationFrame(function () {
      box.classList.add('anim--visible');
    });
  }

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

  /* ---------- Render ---------- */

  function init() {
    var root = document.getElementById('animationCreator');
    if (!root) return;

    var html = '';
    html += '<div class="creator">';
    html += '<h3 class="creator__title">Créateur d\'animations</h3>';

    // Scroll animations
    html += '<div class="creator__group"><label class="creator__label">Type d\'animation</label>';
    html += '<div class="creator__type-grid">';
    ANIMATIONS.forEach(function (anim) {
      var active = state.type === anim.value ? ' creator__type--active' : '';
      html += '<button class="creator__type' + active + '" data-anim-type="' + anim.value + '">' + anim.label + '</button>';
    });
    html += '</div></div>';

    // Duration
    html += '<div class="creator__group"><label class="creator__label">Durée</label>';
    html += '<div class="creator__options">';
    DURATIONS.forEach(function (d) {
      var active = state.duration === d.value ? ' creator__opt--active' : '';
      html += '<button class="creator__opt' + active + '" data-anim-duration="' + d.value + '">' + d.label + '</button>';
    });
    html += '</div></div>';

    // Easing
    html += '<div class="creator__group"><label class="creator__label">Easing</label>';
    html += '<div class="creator__options">';
    EASINGS.forEach(function (e) {
      var active = state.easing === e.value ? ' creator__opt--active' : '';
      html += '<button class="creator__opt' + active + '" data-anim-easing="' + e.value + '">' + e.label + '</button>';
    });
    html += '</div></div>';

    // Delay slider
    html += '<div class="creator__group"><label class="creator__label">Délai</label>';
    html += '<div class="creator__slider-wrap">';
    html += '<input type="range" class="creator__slider" id="animCreatorDelay" min="0" max="10" step="1" value="' + state.delay + '">';
    html += '<span class="creator__slider-value" id="animCreatorDelayValue">' + (state.delay * 100) + 'ms</span>';
    html += '</div></div>';

    // Exit toggle
    html += '<div class="creator__group">';
    html += '<label class="creator__checkbox"><input type="checkbox" id="animCreatorExit"' + (state.exit ? ' checked' : '') + '> Animation de sortie (rejoue au re-scroll)</label>';
    html += '</div>';

    // Preview
    html += '<div class="creator__group"><label class="creator__label">Aperçu</label>';
    html += '<div class="creator__preview-box">';
    html += '<div class="creator__preview-item" id="animCreatorPreview">Aperçu de l\'animation</div>';
    html += '<div class="creator__preview-actions">';
    html += '<button class="creator__btn" id="animCreatorReplay"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Rejouer</button>';
    html += '</div>';
    html += '</div></div>';

    // Output
    html += '<div class="creator__group"><label class="creator__label">Code à copier</label>';
    html += '<div class="creator__output">';
    html += '<code id="animCreatorOutput"></code>';
    html += '<button class="creator__btn creator__btn--primary" id="animCreatorCopy">Copier</button>';
    html += '</div></div>';

    // Click animations
    html += '<div class="creator__sep"></div>';
    html += '<h3 class="creator__title">Animations au clic</h3>';
    html += '<div class="creator__click-grid">';
    CLICK_ANIMS.forEach(function (ca) {
      html += '<div class="creator__click-card" data-click-anim="' + ca.value + '">'
        + '<span>' + ca.label + '</span>'
        + '<button class="creator__btn" data-copy-click="' + ca.value + '">Copier</button>'
        + '</div>';
    });
    html += '</div>';

    html += '</div>';
    root.innerHTML = html;

    // Update output
    updateOutput();

    // Bind events
    root.querySelectorAll('[data-anim-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.type = btn.getAttribute('data-anim-type');
        root.querySelectorAll('[data-anim-type]').forEach(function (b) {
          b.classList.toggle('creator__type--active', b === btn);
        });
        updateOutput();
        replayPreview();
      });
    });

    root.querySelectorAll('[data-anim-duration]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.duration = btn.getAttribute('data-anim-duration');
        root.querySelectorAll('[data-anim-duration]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updateOutput();
        replayPreview();
      });
    });

    root.querySelectorAll('[data-anim-easing]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.easing = btn.getAttribute('data-anim-easing');
        root.querySelectorAll('[data-anim-easing]').forEach(function (b) {
          b.classList.toggle('creator__opt--active', b === btn);
        });
        updateOutput();
        replayPreview();
      });
    });

    var delaySlider = document.getElementById('animCreatorDelay');
    if (delaySlider) {
      delaySlider.addEventListener('input', function () {
        state.delay = parseInt(delaySlider.value);
        var label = document.getElementById('animCreatorDelayValue');
        if (label) label.textContent = (state.delay * 100) + 'ms';
        updateOutput();
        replayPreview();
      });
    }

    var exitToggle = document.getElementById('animCreatorExit');
    if (exitToggle) {
      exitToggle.addEventListener('change', function () {
        state.exit = exitToggle.checked;
        updateOutput();
      });
    }

    document.getElementById('animCreatorReplay').addEventListener('click', replayPreview);

    document.getElementById('animCreatorCopy').addEventListener('click', function () {
      var output = document.getElementById('animCreatorOutput');
      if (output) copyToClipboard(output.textContent);
    });

    root.querySelectorAll('[data-copy-click]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        copyToClipboard('class="' + btn.getAttribute('data-copy-click') + '"');
      });
    });

    // Initial preview
    replayPreview();
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
