/* ==========================================================================
   DOCS JS — Recherche Cmd+K + Boutons copier sur les blocs de code
   ========================================================================== */

(function () {
  'use strict';

  /* =====================================================================
     COPYABLE CODE BLOCKS
     ===================================================================== */

  function initCopyButtons() {
    var pres = document.querySelectorAll('.docs-content pre');
    pres.forEach(function (pre) {
      if (pre.__copyInit) return;
      pre.__copyInit = true;

      pre.style.position = 'relative';

      var btn = document.createElement('button');
      btn.className = 'docs-copy-btn';
      btn.textContent = 'Copier';
      btn.setAttribute('aria-label', 'Copier le code');

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;

        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copié !';
          btn.classList.add('docs-copy-btn--success');
          setTimeout(function () {
            btn.textContent = 'Copier';
            btn.classList.remove('docs-copy-btn--success');
          }, 2000);
        }).catch(function () {
          // Fallback pour les navigateurs sans clipboard API
          var textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            btn.textContent = 'Copié !';
            btn.classList.add('docs-copy-btn--success');
            setTimeout(function () {
              btn.textContent = 'Copier';
              btn.classList.remove('docs-copy-btn--success');
            }, 2000);
          } catch (e) {
            btn.textContent = 'Erreur';
          }
          document.body.removeChild(textarea);
        });
      });

      pre.appendChild(btn);
    });
  }

  /* =====================================================================
     SEARCH (Cmd+K / Ctrl+K)
     ===================================================================== */

  var searchIndex = [
    // Démarrer un projet
    { title: 'Démarrer un projet', section: 'Vue d\'ensemble', url: 'getting-started.html', keywords: 'démarrer projet start nouveau créer installation setup guide' },
    { title: 'Créer un nouveau projet', section: 'Démarrer un projet', url: 'getting-started.html#creer-un-nouveau-projet', keywords: 'copier boilerplate nouveau projet créer start' },
    { title: 'Mise en production', section: 'Démarrer un projet', url: 'production.html', keywords: 'production déployer deploy apache serveur htaccess https ssl rsync ftp' },
    { title: 'Déploiement manuel (FTP / cPanel)', section: 'Mise en production', url: 'production.html#deploiement-manuel-ftp-cpanel', keywords: 'ftp cpanel manuel upload glisser déposer o2switch ovh infomaniak filezilla cyberduck' },
    { title: 'Site sans blog', section: 'Démarrer un projet', url: 'getting-started.html#site-sans-blog', keywords: 'sans blog supprimer retirer fichiers baserow proxy' },
    { title: 'Modules optionnels', section: 'Démarrer un projet', url: 'getting-started.html#modules-optionnels', keywords: 'modules optionnels retirer supprimer minimum requis' },
    { title: 'Snippets (copier-coller)', section: 'Démarrage', url: 'getting-started.html#snippets-copier-coller', keywords: 'snippets copier coller template fragment exemple code html' },
    // Tokens
    { title: 'Design Tokens', section: 'Couleurs, polices, tailles', url: 'tokens.html', keywords: 'tokens couleurs colors primary secondary tertiary accent error success warning polices fonts font-base font-heading radius shadow ombres tailles text clamp' },
    { title: 'Couleurs', section: 'Design Tokens', url: 'tokens.html#couleurs', keywords: 'couleurs colors primary secondary tertiary accent error success warning white black bg neutral variantes variants color-mix transparent light dark' },
    { title: 'Polices', section: 'Design Tokens', url: 'tokens.html#polices', keywords: 'polices fonts typographie typography font-body font-heading font-mono local inter variable @font-face RGPD' },
    { title: 'Animations Variable Font', section: 'Design Tokens', url: 'tokens.html#animations-variable-font', keywords: 'variable font animation poids weight hover scroll loop transition animate inter' },
    { title: 'Tailles de texte dynamiques', section: 'Design Tokens', url: 'tokens.html#tailles-de-texte-dynamiques', keywords: 'tailles text fluid clamp responsive dynamiques text-xs text-sm text-base text-lg text-xl' },
    { title: 'Border Radius', section: 'Design Tokens', url: 'tokens.html#border-radius', keywords: 'radius border-radius arrondi coins rounded' },
    { title: 'Ombres', section: 'Design Tokens', url: 'tokens.html#ombres', keywords: 'ombres shadows shadow-sm shadow-md shadow-lg shadow-xl box-shadow' },
    { title: 'Mode sombre (Dark Mode)', section: 'Design Tokens', url: 'tokens.html#mode-sombre-dark-mode', keywords: 'dark mode sombre theme thème toggle basculer nuit prefers-color-scheme localStorage darkmode' },
    { title: 'Toggle Dark Mode', section: 'Design Tokens', url: 'tokens.html#bouton-toggle', keywords: 'toggle basculer bouton data-theme-toggle darkmode sombre clair light' },
    // Composants / Slots
    { title: 'Composants / Slots', section: 'Vue d\'ensemble', url: 'components.html', keywords: 'composants components slots registerComponent template data-component réutilisables header footer card' },
    { title: 'Système de Slots', section: 'Composants', url: 'components.html#injection-de-slots', keywords: 'slots injection template data-slot data-slot-* camelCase attributs contenu' },
    { title: 'registerComponent', section: 'Composants', url: 'components.html#api-javascript', keywords: 'registerComponent renderComponents api javascript fonction enregistrer composant' },
    { title: 'Composant Header', section: 'Composants', url: 'components.html#header', keywords: 'header logo navigation nav cta logoSrc logoAlt logoLink' },
    { title: 'Composant Footer', section: 'Composants', url: 'components.html#footer', keywords: 'footer copyright contenu liens' },
    { title: 'Composant Card', section: 'Composants', url: 'components.html#card', keywords: 'card carte image titre texte bouton footer' },
    { title: 'Composant custom', section: 'Composants', url: 'components.html#creer-un-composant-custom', keywords: 'custom créer composant personnalisé testimonial' },
    // Éléments interactifs
    { title: 'Éléments interactifs', section: 'Vue d\'ensemble', url: 'elements.html', keywords: 'éléments interactifs popup tooltip accordion tabs slider carousel' },
    { title: 'Popup / Modal', section: 'Éléments', url: 'elements.html#popup-modal', keywords: 'popup modal dialog overlay close escape emboitable nestable' },
    { title: 'Popup — Variantes de position', section: 'Éléments', url: 'elements.html#variantes-de-position', keywords: 'popup position lateral bottom top right left panneau sheet drawer slide sidebar' },
    { title: 'Tooltip', section: 'Éléments', url: 'elements.html#tooltip', keywords: 'tooltip bulle info survol hover position top bottom left right' },
    { title: 'Accordion', section: 'Éléments', url: 'elements.html#accordion', keywords: 'accordion accordéon pliable collapse expand multiple emboitable' },
    { title: 'Tabs', section: 'Éléments', url: 'elements.html#tabs', keywords: 'tabs onglets navigation tabulation panel emboitable' },
    { title: 'Slider / Carousel', section: 'Éléments', url: 'elements.html#slider-carousel', keywords: 'slider carousel carrousel slide swipe drag draggable autoplay loop dots flèches per-view multi' },
    // Icônes
    { title: 'Icônes', section: 'Vue d\'ensemble', url: 'icons.html', keywords: 'icônes icons heroicons svg outline solid inline data-icon' },
    { title: 'Toutes les icônes', section: 'Icônes', url: 'icons.html#toutes-les-icones', keywords: 'liste galerie recherche copier coller toutes icônes' },
    // Blog
    { title: 'Blog', section: 'Vue d\'ensemble', url: 'blog.html', keywords: 'blog baserow articles listing article galerie lightbox dynamique' },
    { title: 'Configuration Blog', section: 'Blog', url: 'blog.html#connexion-a-baserow', keywords: 'configuration config baserow token tableId api blog' },
    { title: 'Champs Baserow', section: 'Blog', url: 'blog.html#champs-baserow', keywords: 'champs baserow title slug excerpt content featured_img categories taxonomie galerie' },
    { title: 'Page listing', section: 'Blog', url: 'blog.html#exemples-de-pages', keywords: 'listing grille cards load more pagination filtres catégories' },
    { title: 'Page article', section: 'Blog', url: 'blog.html#page-article', keywords: 'article hero contenu galerie lightbox meta description seo' },
    // Forms
    { title: 'Formulaires', section: 'Vue d\'ensemble', url: 'forms.html', keywords: 'formulaires forms form input textarea validation webhook multi-step steps conditional' },
    { title: 'Multi-Steps', section: 'Formulaires', url: 'forms.html#multi-steps', keywords: 'multi-step steps étapes progression progress bar indicateurs navigation précédent suivant' },
    { title: 'Validation', section: 'Formulaires', url: 'forms.html#validation', keywords: 'validation required email phone url min max règles validate erreur error' },
    { title: 'Logique conditionnelle', section: 'Formulaires', url: 'forms.html#logique-conditionnelle', keywords: 'condition conditionnel logique afficher masquer data-condition equals not-equals visible hidden' },
    { title: 'Custom Select', section: 'Formulaires', url: 'forms.html#custom-select', keywords: 'select custom dropdown déroulant option choisir stylisable' },
    { title: 'Custom Number', section: 'Formulaires', url: 'forms.html#custom-number', keywords: 'number nombre compteur increment decrement plus moins min max step' },
    { title: 'Custom Radio Group', section: 'Formulaires', url: 'forms.html#custom-radio-group', keywords: 'radio bouton radio group option choix unique single' },
    { title: 'Custom Checkbox Group', section: 'Formulaires', url: 'forms.html#custom-checkbox-group', keywords: 'checkbox case cocher group option choix multiple' },
    { title: 'Custom Multi Select', section: 'Formulaires', url: 'forms.html#custom-multi-select', keywords: 'multiselect multi select multiple dropdown sélection multiple tags' },
    { title: 'Webhook', section: 'Formulaires', url: 'forms.html#webhook-payload', keywords: 'webhook post json envoi soumission payload data date_now url user_agent utm' },
    { title: 'Toasts', section: 'Formulaires', url: 'forms.html#toasts', keywords: 'toast notification message success error warning info showToast' },
    { title: 'Pré-remplissage par URL', section: 'Formulaires', url: 'forms.html#pre-remplissage-par-url', keywords: 'pré-remplissage prefill url paramètres query string champ input auto remplir' },
    // Cookies
    { title: 'Cookies & Analytics', section: 'Vue d\'ensemble', url: 'cookies.html', keywords: 'cookies analytics consentement rgpd gdpr bandeau banner ga4 gtm clarity facebook pixel hotjar linkedin tiktok' },
    { title: 'Configuration Analytics', section: 'Cookies', url: 'cookies.html#configuration', keywords: 'configuration config ga4 gtm clarity facebook pixel hotjar linkedin tiktok ids identifiants' },
    // Animations
    { title: 'Animations', section: 'Vue d\'ensemble', url: 'animations.html', keywords: 'animations scroll entrée sortie clic fade scale slide rotate' },
    { title: 'Animations d\'entrée', section: 'Animations', url: 'animations.html#animations-d-entree-scroll', keywords: 'entrée scroll fade-in scale-in slide-in rotate-in visible intersection observer' },
    { title: 'Animations SVG', section: 'Animations', url: 'animations.html#animations-svg', keywords: 'svg dessin draw stroke path circle tracé animation svg-draw svg-draw-fade svg-fade svg-fade-up svg-fill' },
    { title: 'Modificateurs', section: 'Animations', url: 'animations.html#modificateurs', keywords: 'delay délai duration durée easing bounce elastic smooth fast slow' },
    { title: 'Animations au clic', section: 'Animations', url: 'animations.html#animations-au-clic', keywords: 'clic click pulse shake bounce ripple material design' },
    { title: 'Animations Variable Font', section: 'Animations', url: 'animations.html#animations-variable-font', keywords: 'variable font animation poids weight hover scroll loop transition animate inter' },
    { title: 'Accessibilité', section: 'Animations', url: 'animations.html#accessibilite', keywords: 'accessibilité reduced motion prefers-reduced-motion a11y' },
    // Params
    { title: 'Paramètres URL', section: 'Vue d\'ensemble', url: 'params.html', keywords: 'paramètres url utm persistance liens internes pré-remplissage query string' },
    { title: 'Persistance UTM', section: 'Paramètres URL', url: 'params.html#persistance-entre-les-pages', keywords: 'utm persistance liens internes source medium campaign term content' },
    { title: 'API getUrlParams / getUTMs', section: 'Paramètres URL', url: 'params.html#api-javascript', keywords: 'api getUrlParams getUTMs javascript fonction globale' },
    // Grid / Bento
    { title: 'Grid / Bento', section: 'Layout', url: 'grid.html', keywords: 'grid grille bento layout colonnes columns responsive' },
    { title: 'Grille simple', section: 'Grid', url: 'grid.html#grille-simple', keywords: 'grid grille colonnes data-cols gap espacement' },
    { title: 'Span colonnes/lignes', section: 'Grid', url: 'grid.html#span-items', keywords: 'span col-span row-span colonnes lignes full width' },
    { title: 'Bento Layout', section: 'Grid', url: 'grid.html#bento', keywords: 'bento asymétrique wide tall large full size carte card' },
    { title: 'Layouts prédéfinis', section: 'Grid', url: 'grid.html#layouts-predefinis', keywords: 'layout sidebar feature prédéfini template' },
    // Sitemap
    { title: 'Sitemap', section: 'SEO', url: 'sitemap.html', keywords: 'sitemap xml robots seo référencement google search engine moteur recherche plan site generate' },
    // Getting started
    { title: 'Introduction', section: 'Démarrage', url: 'index.html', keywords: 'introduction démarrage getting started architecture structure dossier fichiers inclure' },
    { title: 'Architecture du projet', section: 'Introduction', url: 'index.html#architecture', keywords: 'architecture structure dossiers fichiers css js components' },
    { title: 'Inclure dans une page', section: 'Introduction', url: 'index.html#inclure-dans-une-page', keywords: 'inclure page script link css js head body defer' },
    // Wireframes
    { title: 'Wireframes', section: 'Vue d\'ensemble', url: 'wireframes.html', keywords: 'wireframes sections copier coller snippets templates layouts hero header footer cta testimonial service portfolio team contact faq gallery blog' },
    { title: 'Heroes', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe hero banner accueil landing splash cover' },
    { title: 'Services', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe service offre prestation feature fonctionnalite' },
    { title: 'Portfolios', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe portfolio projet realisation case study galerie' },
    { title: 'Testimonials', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe testimonial temoignage avis client review quote citation' },
    { title: 'Contact', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe contact formulaire form email telephone adresse' },
    { title: 'FAQ', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe faq questions reponses accordion' },
    { title: 'Coming Soon', section: 'Wireframes', url: 'wireframes.html', keywords: 'wireframe coming soon bientot disponible countdown timer lancement' },
    // Configurateur
    { title: 'Configurateur', section: 'Vue d\'ensemble', url: 'configurateur.html', keywords: 'configurateur configurator builder config setup paramètres configuration visuel interface' },
    { title: 'Dashboard', section: 'Configurateur', url: 'configurateur-dashboard.html', keywords: 'dashboard tableau de bord résumé overview projet' },
    { title: 'Pages', section: 'Configurateur', url: 'configurateur-pages.html', keywords: 'pages gestion créer supprimer éditer page' },
    { title: 'Configuration', section: 'Configurateur', url: 'configurateur-config.html', keywords: 'configuration config paramètres réglages site' },
    { title: 'Bibliothèque', section: 'Configurateur', url: 'configurateur-bibliotheque.html', keywords: 'bibliothèque library composants sections wireframes blocs' },
    { title: 'Déploiement', section: 'Configurateur', url: 'configurateur-deploy.html', keywords: 'déploiement deploy production serveur mise en ligne' },
    { title: 'API Backend', section: 'Configurateur', url: 'configurateur-api.html', keywords: 'api backend serveur python endpoints cfg-save cfg-read' },
  ];

  var searchOverlay = null;
  var searchInput = null;
  var searchResults = null;

  function createSearchOverlay() {
    if (searchOverlay) return;

    searchOverlay = document.createElement('div');
    searchOverlay.className = 'docs-search';
    searchOverlay.innerHTML = ''
      + '<div class="docs-search__overlay"></div>'
      + '<div class="docs-search__dialog">'
      +   '<div class="docs-search__header">'
      +     '<svg class="docs-search__icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" stroke-width="2"/><path d="M13 13l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      +     '<input class="docs-search__input" type="text" placeholder="Rechercher dans la documentation..." autofocus>'
      +     '<kbd class="docs-search__kbd">Esc</kbd>'
      +   '</div>'
      +   '<div class="docs-search__results"></div>'
      +   '<div class="docs-search__footer">'
      +     '<span><kbd>&uarr;</kbd><kbd>&darr;</kbd> naviguer</span>'
      +     '<span><kbd>&crarr;</kbd> ouvrir</span>'
      +     '<span><kbd>Esc</kbd> fermer</span>'
      +   '</div>'
      + '</div>';

    document.body.appendChild(searchOverlay);

    searchInput = searchOverlay.querySelector('.docs-search__input');
    searchResults = searchOverlay.querySelector('.docs-search__results');

    // Close on overlay click
    searchOverlay.querySelector('.docs-search__overlay').addEventListener('click', closeSearch);

    // Input handler
    searchInput.addEventListener('input', function () {
      performSearch(searchInput.value.trim());
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearch();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveSelection(1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveSelection(-1);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        var active = searchResults.querySelector('.docs-search__result--active');
        if (active) {
          window.location.href = active.getAttribute('data-url');
        }
        return;
      }
    });

    // Click on result
    searchResults.addEventListener('click', function (e) {
      var result = e.target.closest('.docs-search__result');
      if (result) {
        window.location.href = result.getAttribute('data-url');
      }
    });
  }

  function openSearch() {
    createSearchOverlay();
    searchOverlay.classList.add('docs-search--open');
    searchInput.value = '';
    searchInput.focus();
    performSearch('');
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    if (searchOverlay) {
      searchOverlay.classList.remove('docs-search--open');
      document.body.style.overflow = '';
    }
  }

  function performSearch(query) {
    if (!query) {
      // Show popular / all
      renderResults(searchIndex.filter(function (item) {
        return item.section === 'Vue d\'ensemble' || item.section === 'Démarrage';
      }), '');
      return;
    }

    var q = query.toLowerCase();
    var words = q.split(/\s+/);

    var scored = searchIndex.map(function (item) {
      var score = 0;
      var titleLower = item.title.toLowerCase();
      var sectionLower = item.section.toLowerCase();
      var keywordsLower = item.keywords.toLowerCase();

      words.forEach(function (word) {
        if (titleLower.indexOf(word) > -1) score += 10;
        if (titleLower.indexOf(word) === 0) score += 5;
        if (sectionLower.indexOf(word) > -1) score += 3;
        if (keywordsLower.indexOf(word) > -1) score += 2;
      });

      return { item: item, score: score };
    }).filter(function (s) {
      return s.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score;
    }).slice(0, 8);

    renderResults(scored.map(function (s) { return s.item; }), query);
  }

  function renderResults(items, query) {
    if (items.length === 0) {
      searchResults.innerHTML = '<div class="docs-search__empty">Aucun r&eacute;sultat pour &laquo; ' + escapeHtml(query) + ' &raquo;</div>';
      return;
    }

    searchResults.innerHTML = items.map(function (item, i) {
      var title = query ? highlightMatch(item.title, query) : item.title;
      return '<a class="docs-search__result' + (i === 0 ? ' docs-search__result--active' : '') + '" data-url="' + item.url + '">'
        + '<div class="docs-search__result-title">' + title + '</div>'
        + '<div class="docs-search__result-section">' + item.section + '</div>'
        + '</a>';
    }).join('');
  }

  function highlightMatch(text, query) {
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.substring(0, idx)
      + '<mark>' + text.substring(idx, idx + query.length) + '</mark>'
      + text.substring(idx + query.length);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function moveSelection(dir) {
    var results = searchResults.querySelectorAll('.docs-search__result');
    if (results.length === 0) return;

    var activeIdx = -1;
    results.forEach(function (r, i) {
      if (r.classList.contains('docs-search__result--active')) activeIdx = i;
    });

    var newIdx = activeIdx + dir;
    if (newIdx < 0) newIdx = results.length - 1;
    if (newIdx >= results.length) newIdx = 0;

    results.forEach(function (r, i) {
      r.classList.toggle('docs-search__result--active', i === newIdx);
    });

    results[newIdx].scrollIntoView({ block: 'nearest' });
  }

  /* =====================================================================
     TABLE OF CONTENTS (auto-generated, scroll-synced)
     ===================================================================== */

  function initTOC() {
    var content = document.querySelector('.docs-content');
    var tocContainer = document.querySelector('.docs-toc');
    if (!content || !tocContainer) return;

    var headings = content.querySelectorAll('h2, h3, h4, h5');
    if (headings.length < 2) {
      tocContainer.style.display = 'none';
      return;
    }

    function slugify(text) {
      return text.toLowerCase()
        .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u').replace(/[ýÿ]/g, 'y')
        .replace(/[ç]/g, 'c').replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
    }

    // Compteur pour dédupliquer les IDs identiques
    var usedIds = {};

    var html = '<div class="docs-toc__title">Sur cette page</div>';
    headings.forEach(function (h) {
      var id = h.id || slugify(h.textContent);
      // Dédupliquer si le même slug existe déjà
      if (usedIds[id]) {
        usedIds[id]++;
        id = id + '-' + usedIds[id];
      } else {
        usedIds[id] = 1;
      }
      h.id = id;
      var level = h.tagName.toLowerCase();
      html += '<a href="#' + id + '" data-level="' + level + '">' + escapeHtml(h.textContent) + '</a>';
    });
    tocContainer.innerHTML = html;

    // Scroll spy
    var tocLinks = tocContainer.querySelectorAll('a');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          tocLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

    headings.forEach(function (h) {
      observer.observe(h);
    });

    // Smooth scroll on click
    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', link.getAttribute('href'));
        }
      });
    });
  }

  /* =====================================================================
     CREATOR SHORTCUT BUTTONS (header)
     ===================================================================== */

  function initCreatorButtons() {
    var headerActions = document.querySelector('.header__actions');
    if (!headerActions) return;
    var themeToggle = headerActions.querySelector('[data-theme-toggle]');
    if (!themeToggle) return;

    // Bouton créateur d'animations (sparkles icon)
    var animBtn = document.createElement('a');
    animBtn.href = 'animations.html#animation-creator';
    animBtn.className = 'header__creator-btn';
    animBtn.setAttribute('aria-label', 'Créateur d\'animations');
    animBtn.setAttribute('title', 'Créateur d\'animations');
    animBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707"/><circle cx="12" cy="12" r="4"/></svg>';

    // Bouton créateur de grilles (grid/table icon)
    var gridBtn = document.createElement('a');
    gridBtn.href = 'grid.html#grid-creator';
    gridBtn.className = 'header__creator-btn';
    gridBtn.setAttribute('aria-label', 'Créateur de grilles');
    gridBtn.setAttribute('title', 'Créateur de grilles');
    gridBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';

    headerActions.insertBefore(gridBtn, themeToggle);
    headerActions.insertBefore(animBtn, gridBtn);
  }

  /* =====================================================================
     OFF-CANVAS MOBILE NAV
     ===================================================================== */

  function initOffcanvasNav() {
    var sidebar = document.querySelector('.docs-sidebar');
    if (!sidebar) return;

    // Create hamburger button and inject into header actions
    var toggle = document.createElement('button');
    toggle.className = 'docs-nav-toggle';
    toggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
    toggle.innerHTML = '<span data-icon="bars-3" data-icon-type="outline" data-icon-size="20" data-icon-animate="no"></span>';

    var headerActions = document.querySelector('.header__actions');
    if (headerActions) {
      headerActions.appendChild(toggle);
    }

    // Create close button inside sidebar
    var closeBtn = document.createElement('button');
    closeBtn.className = 'docs-sidebar__close';
    closeBtn.setAttribute('aria-label', 'Fermer le menu');
    closeBtn.innerHTML = '<span data-icon="x-mark" data-icon-type="outline" data-icon-size="20" data-icon-animate="no"></span>';
    sidebar.insertBefore(closeBtn, sidebar.firstChild);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'docs-offcanvas-overlay';
    document.body.appendChild(overlay);

    function openNav() {
      sidebar.classList.add('docs-sidebar--open');
      overlay.classList.add('docs-offcanvas-overlay--open');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      sidebar.classList.remove('docs-sidebar--open');
      overlay.classList.remove('docs-offcanvas-overlay--open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);

    // Close on link click (navigate)
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('docs-sidebar--open')) {
        closeNav();
      }
    });

    // Render data-icon elements in dynamically created buttons
    if (typeof window.initIcons === 'function') {
      window.initIcons(toggle);
      window.initIcons(closeBtn);
    }
  }

  /* =====================================================================
     INIT
     ===================================================================== */

  function init() {
    initCopyButtons();
    initTOC();
    initCreatorButtons();
    initOffcanvasNav();

    // Keyboard shortcut Cmd+K / Ctrl+K
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // Search trigger buttons (delegation for dynamic content)
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-search-trigger]');
      if (trigger) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  /* Attendre DOMContentLoaded pour que components.js ait rendu le header */
  if (document.readyState === 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
