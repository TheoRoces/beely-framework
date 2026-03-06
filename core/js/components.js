/* ==========================================================================
   SLOTS — Système de composants/slots inline (build-less)
   ========================================================================== */

(function () {
  'use strict';

  window.__components = {};

  /**
   * Echappe les caracteres HTML speciaux pour prevenir les injections XSS.
   * A utiliser dans les templates pour les slots contenant du texte brut.
   * @param {string} str
   * @returns {string}
   */
  window.escapeSlotHtml = function (str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };

  /**
   * Enregistre un composant reutilisable.
   * @param {string} name - Nom du composant (correspond a data-component="name")
   * @param {function} templateFn - Fonction (slots) => string HTML
   */
  window.registerComponent = function (name, templateFn) {
    window.__components[name] = templateFn;
  };

  /**
   * Rend tous les [data-component] présents dans un conteneur.
   * @param {HTMLElement} [root=document.body]
   */
  window.renderComponents = function (root) {
    root = root || document.body;
    var elements = root.querySelectorAll('[data-component]');

    elements.forEach(function (el) {
      var name = el.getAttribute('data-component');
      var templateFn = window.__components[name];

      if (!templateFn) {
        console.warn('[slots] Composant "' + name + '" non enregistré. Avez-vous inclus le script components/' + name + '.js ?');
        return;
      }

      // Récupérer les slots depuis les <template data-slot="xxx">
      var slots = {};
      var templates = el.querySelectorAll(':scope > template[data-slot]');
      templates.forEach(function (tpl) {
        var slotName = tpl.getAttribute('data-slot');
        // .innerHTML pour le contenu HTML, .content.textContent pour le texte brut
        var content = tpl.innerHTML.trim();
        slots[slotName] = content;
      });

      // Attributs data-* directement sur l'élément (pour les valeurs simples)
      // Supporte data-site-name="X" (→ slots.siteName) et data-slot-* pour compat
      Array.from(el.attributes).forEach(function (attr) {
        if (attr.name.indexOf('data-') === 0
            && attr.name !== 'data-component'
            && attr.name !== 'data-rendered') {
          var slotName;
          if (attr.name.indexOf('data-slot-') === 0) {
            slotName = attr.name.replace('data-slot-', '');
          } else {
            slotName = attr.name.replace('data-', '');
          }
          slotName = slotName.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
          slots[slotName] = attr.value;
        }
      });

      // Générer le HTML et remplacer le contenu
      var html = templateFn(slots);
      el.innerHTML = html;
      el.removeAttribute('data-component');
      el.setAttribute('data-rendered', name);

      // Rendre les composants imbriqués (composant dans un composant)
      if (el.querySelector('[data-component]')) {
        window.renderComponents(el);
      }
    });
  };

  // Initialisation au chargement du DOM
  document.addEventListener('DOMContentLoaded', function () {
    window.renderComponents();

    // Après le rendu des slots, initialiser animations et éléments interactifs
    if (typeof window.initAnimations === 'function') {
      window.initAnimations();
    }
    if (typeof window.initElements === 'function') {
      window.initElements();
    }
  });
})();
