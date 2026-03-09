/* ==========================================================================
   ICONS — Système d'icônes SVG inline
   Charge les SVG depuis assets/icons/ et les insère dans le DOM.
   Usage : <span data-icon="heart" data-icon-type="outline" data-icon-size="24"></span>

   Animations SVG au scroll (via animations.js IntersectionObserver) :
     data-icon-animate="draw-fade"  → dessin + fondu (défaut)
     data-icon-animate="draw"       → dessin seul
     data-icon-animate="fade-up"    → fondu + montée
     data-icon-animate="no"         → aucune animation
   ========================================================================== */

(function () {
  'use strict';

  var cache = {};
  var basePath = '';

  // Déterminer le chemin de base vers assets/icons/
  function getBasePath() {
    if (basePath) return basePath;
    var scripts = document.querySelectorAll('script[src*="icons.js"]');
    if (scripts.length > 0) {
      var src = scripts[scripts.length - 1].getAttribute('src');
      // src = "core/js/icons.js" ou "../core/js/icons.js"
      basePath = src.replace('core/js/icons.js', '') + 'assets/icons/';
    } else {
      basePath = 'assets/icons/';
    }
    return basePath;
  }

  function fetchIcon(type, name, callback) {
    var key = type + '/' + name;
    if (cache[key]) {
      callback(cache[key]);
      return;
    }
    var url = getBasePath() + type + '/' + name + '.svg';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        cache[key] = xhr.responseText;
        callback(xhr.responseText);
      }
    };
    xhr.send();
  }

  // Mapper la valeur data-icon-animate vers la classe CSS anim-svg-*
  function getAnimClass(animValue, iconType) {
    // Pas d'animation par défaut — seulement si data-icon-animate est explicitement défini
    if (!animValue || animValue === 'no' || animValue === 'false' || animValue === 'none') {
      return '';
    }
    // "yes"/"true" = animation par défaut selon le type
    if (animValue === 'yes' || animValue === 'true') {
      animValue = (iconType === 'solid') ? 'fade-up' : 'draw-fade';
    }
    var map = {
      'draw': 'anim-svg-draw',
      'draw-fade': 'anim-svg-draw-fade',
      'fade': 'anim-svg-fade',
      'fade-up': 'anim-svg-fade-up'
    };
    return map[animValue] || '';
  }

  // Calculer la longueur approximative d'un élément SVG
  function getSvgLength(el) {
    if (typeof el.getTotalLength === 'function') {
      try { return Math.ceil(el.getTotalLength()); } catch (e) { /* ignore */ }
    }
    return 200; // fallback raisonnable
  }

  function renderIcon(el) {
    var name = el.getAttribute('data-icon');
    if (!name) return;

    var type = el.getAttribute('data-icon-type') || 'outline';
    var size = el.getAttribute('data-icon-size') || '24';
    var color = el.getAttribute('data-icon-color') || 'currentColor';
    var animate = el.getAttribute('data-icon-animate');

    fetchIcon(type, name, function (svgStr) {
      var temp = document.createElement('div');
      temp.innerHTML = svgStr.trim();
      var svg = temp.querySelector('svg');
      if (!svg) return;

      // Appliquer la taille
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);

      // Appliquer la couleur
      if (type === 'outline') {
        var paths = svg.querySelectorAll('[stroke]');
        for (var i = 0; i < paths.length; i++) {
          if (paths[i].getAttribute('stroke') !== 'none') {
            paths[i].setAttribute('stroke', color);
          }
        }
      } else {
        var fills = svg.querySelectorAll('[fill]');
        for (var j = 0; j < fills.length; j++) {
          if (fills[j].getAttribute('fill') !== 'none') {
            fills[j].setAttribute('fill', color);
          }
        }
      }

      // Classe de base
      svg.classList.add('icon');

      // Animation SVG au scroll
      var animClass = getAnimClass(animate, type);
      if (animClass) {
        // Appliquer l'animation sur chaque shape enfant du SVG
        var shapes = svg.querySelectorAll('path, circle, line, polyline, polygon, rect, ellipse');
        var isDrawAnim = (animClass === 'anim-svg-draw' || animClass === 'anim-svg-draw-fade');

        for (var k = 0; k < shapes.length; k++) {
          shapes[k].classList.add(animClass);

          // Pour les animations draw : calculer --svg-length
          if (isDrawAnim) {
            var len = getSvgLength(shapes[k]);
            shapes[k].style.setProperty('--svg-length', len);
          }

          // Délai progressif entre les shapes
          if (k > 0) {
            shapes[k].classList.add('anim--delay-' + Math.min(k, 10));
          }
        }

        // Hover scale en plus
        svg.classList.add('icon--animated');
      }

      el.innerHTML = '';
      el.appendChild(svg);
      el.classList.add('icon-wrapper');
    });
  }

  function initIcons(root) {
    var els = (root || document).querySelectorAll('[data-icon]');
    for (var i = 0; i < els.length; i++) {
      // Ne pas re-render si déjà chargé
      if (!els[i].querySelector('svg')) {
        renderIcon(els[i]);
      }
    }
  }

  // Exposer globalement
  window.initIcons = initIcons;

  // Exposer fetchIcon pour la copie SVG brute
  window.fetchIconSvg = function (type, name, callback) {
    fetchIcon(type, name, callback);
  };

  // Auto-init
  document.addEventListener('DOMContentLoaded', function () {
    initIcons();
  });
})();
