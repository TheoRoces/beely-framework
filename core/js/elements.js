/* ==========================================================================
   ELEMENTS JS — Popup, Tooltip, Accordion, Tabs, Slider
   Tous emboîtables (nestable)
   ========================================================================== */

(function () {
  'use strict';

  /**
   * Initialise tous les éléments interactifs dans un conteneur.
   * @param {HTMLElement} [root=document]
   */
  window.initElements = function (root) {
    root = root || document;
    initPopups();
    initTooltips(root);
    initAccordions(root);
    initTabs(root);
    initSliders(root);
  };

  /* ==========================================================================
     POPUP / MODAL
     ========================================================================== */

  // Compteur de scroll locks (partagé entre popup, lightbox, etc.)
  window.__scrollLockCount = window.__scrollLockCount || 0;
  function lockScroll() {
    window.__scrollLockCount++;
    document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    window.__scrollLockCount = Math.max(0, window.__scrollLockCount - 1);
    if (window.__scrollLockCount === 0) {
      document.body.style.overflow = '';
    }
  }

  var openPopups = []; // pile des popups ouverts (pour Escape)

  function initPopups() {
    if (window.__popupsInit) return;
    window.__popupsInit = true;

    // Ouvrir un popup
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-popup-target]');
      if (trigger) {
        e.preventDefault();
        var id = trigger.getAttribute('data-popup-target');
        var popup = document.querySelector('[data-popup="' + id + '"]');
        if (popup) openPopup(popup);
        return;
      }

      // Fermer via bouton close
      var closeBtn = e.target.closest('[data-popup-close]');
      if (closeBtn) {
        var popup = closeBtn.closest('.popup');
        if (popup) closePopup(popup);
        return;
      }

      // Fermer via overlay
      if (e.target.classList.contains('popup__overlay')) {
        var popup = e.target.closest('.popup');
        if (popup) closePopup(popup);
      }
    });

    // Fermer avec Escape (le dernier ouvert)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openPopups.length > 0) {
        closePopup(openPopups[openPopups.length - 1]);
      }
    });
  }

  function openPopup(popup) {
    popup.classList.add('popup--active');
    openPopups.push(popup);
    lockScroll();
  }

  function closePopup(popup) {
    popup.classList.remove('popup--active');
    var idx = openPopups.indexOf(popup);
    if (idx > -1) openPopups.splice(idx, 1);
    unlockScroll();
  }

  /* ==========================================================================
     TOOLTIP
     ========================================================================== */

  function initTooltips(root) {
    var tooltips = root.querySelectorAll('[data-tooltip]');
    tooltips.forEach(function (el) {
      if (el.__tooltipInit) return;
      el.__tooltipInit = true;

      // Assurer position relative
      if (!el.classList.contains('tooltip')) {
        el.classList.add('tooltip');
      }

      el.addEventListener('mouseenter', function () {
        showTooltip(el);
      });

      el.addEventListener('mouseleave', function () {
        hideTooltip(el);
      });

      el.addEventListener('focus', function () {
        showTooltip(el);
      });

      el.addEventListener('blur', function () {
        hideTooltip(el);
      });
    });
  }

  function showTooltip(el) {
    if (el.__tooltipBubble) return;

    var text = el.getAttribute('data-tooltip');
    var pos = el.getAttribute('data-tooltip-pos') || 'top';

    var bubble = document.createElement('span');
    bubble.className = 'tooltip__bubble tooltip__bubble--' + pos;
    bubble.textContent = text;
    el.appendChild(bubble);
    el.__tooltipBubble = bubble;

    // Vérifier le débordement et repositionner si nécessaire
    requestAnimationFrame(function () {
      adjustTooltipPosition(el, bubble, pos);
      bubble.classList.add('tooltip__bubble--visible');
    });
  }

  function hideTooltip(el) {
    if (el.__tooltipBubble) {
      el.__tooltipBubble.remove();
      el.__tooltipBubble = null;
    }
  }

  function adjustTooltipPosition(el, bubble, preferredPos) {
    var rect = bubble.getBoundingClientRect();
    var cls = 'tooltip__bubble--';

    // Si déborde en haut → passer en bas
    if (preferredPos === 'top' && rect.top < 0) {
      bubble.className = 'tooltip__bubble ' + cls + 'bottom tooltip__bubble--visible';
    }
    // Si déborde en bas → passer en haut
    if (preferredPos === 'bottom' && rect.bottom > window.innerHeight) {
      bubble.className = 'tooltip__bubble ' + cls + 'top tooltip__bubble--visible';
    }
    // Si déborde à gauche → passer à droite
    if (preferredPos === 'left' && rect.left < 0) {
      bubble.className = 'tooltip__bubble ' + cls + 'right tooltip__bubble--visible';
    }
    // Si déborde à droite → passer à gauche
    if (preferredPos === 'right' && rect.right > window.innerWidth) {
      bubble.className = 'tooltip__bubble ' + cls + 'left tooltip__bubble--visible';
    }
  }

  /* ==========================================================================
     ACCORDION
     ========================================================================== */

  function initAccordions(root) {
    var accordions = root.querySelectorAll('.accordion');
    accordions.forEach(function (accordion) {
      if (accordion.__accordionInit) return;
      accordion.__accordionInit = true;

      // Envelopper le contenu du body dans un inner div (pour l'animation grid)
      var bodies = accordion.querySelectorAll(':scope > .accordion__item > .accordion__body');
      bodies.forEach(function (body) {
        if (!body.querySelector('.accordion__body-inner')) {
          var inner = document.createElement('div');
          inner.className = 'accordion__body-inner';
          while (body.firstChild) {
            inner.appendChild(body.firstChild);
          }
          body.appendChild(inner);
        }
      });

      accordion.addEventListener('click', function (e) {
        var header = e.target.closest('.accordion__header');
        if (!header) return;

        var item = header.parentElement;
        if (!item.classList.contains('accordion__item')) return;

        // Trouver l'accordion parent direct de cet item (pour le scoping nestable)
        var parentAccordion = item.parentElement.closest('.accordion');
        // Si le parentAccordion n'est pas le même que l'accordion actuel, ne rien faire
        // (l'événement sera géré par l'accordion parent)
        if (parentAccordion && parentAccordion !== accordion) return;

        var isMultiple = accordion.hasAttribute('data-accordion-multi');
        var isActive = item.classList.contains('accordion__item--active');

        if (!isMultiple) {
          // Fermer les autres items AU MÊME NIVEAU uniquement
          var siblings = accordion.querySelectorAll(':scope > .accordion__item');
          siblings.forEach(function (sib) {
            if (sib !== item) sib.classList.remove('accordion__item--active');
          });
        }

        item.classList.toggle('accordion__item--active');
      });
    });
  }

  /* ==========================================================================
     TABS
     ========================================================================== */

  function initTabs(root) {
    var tabContainers = root.querySelectorAll('.tabs');
    tabContainers.forEach(function (container) {
      if (container.__tabsInit) return;
      container.__tabsInit = true;

      // Trouver les tabs directs (pas imbriqués)
      var nav = container.querySelector(':scope > .tabs__nav');
      if (!nav) return;

      var tabs = nav.querySelectorAll(':scope > .tabs__tab');
      var panels = container.querySelectorAll(':scope > .tabs__panel');

      // Wrapper pour les fades de scroll
      var wrapper = document.createElement('div');
      wrapper.className = 'tabs__nav-wrapper';
      nav.parentNode.insertBefore(wrapper, nav);
      wrapper.appendChild(nav);

      function updateFades() {
        var scrollLeft = nav.scrollLeft;
        var maxScroll = nav.scrollWidth - nav.clientWidth;
        if (maxScroll <= 2) {
          wrapper.classList.remove('tabs__nav-wrapper--fade-left', 'tabs__nav-wrapper--fade-right');
          return;
        }
        wrapper.classList.toggle('tabs__nav-wrapper--fade-left', scrollLeft > 5);
        wrapper.classList.toggle('tabs__nav-wrapper--fade-right', scrollLeft < maxScroll - 5);
      }

      nav.addEventListener('scroll', updateFades, { passive: true });
      window.addEventListener('resize', updateFades);
      requestAnimationFrame(updateFades);

      // Activer le premier tab ou celui avec data-tab-active
      var activeTab = nav.querySelector('[data-tab-active]') || tabs[0];
      if (activeTab) {
        activateTab(container, activeTab, tabs, panels);
      }

      nav.addEventListener('click', function (e) {
        var tab = e.target.closest('.tabs__tab');
        if (!tab || tab.parentElement !== nav) return;
        activateTab(container, tab, tabs, panels);
      });
    });
  }

  function activateTab(container, activeTab, tabs, panels) {
    var tabId = activeTab.getAttribute('data-tab');

    tabs.forEach(function (t) {
      t.classList.toggle('tabs__tab--active', t === activeTab);
    });

    panels.forEach(function (p) {
      p.classList.toggle('tabs__panel--active', p.getAttribute('data-tab-panel') === tabId);
    });

    // Scroll le tab actif en vue
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ==========================================================================
     SLIDER / CAROUSEL
     ========================================================================== */

  function initSliders(root) {
    var sliders = root.querySelectorAll('.slider');
    sliders.forEach(function (slider) {
      if (slider.__sliderInit) return;
      slider.__sliderInit = true;
      createSlider(slider);
    });
  }

  var defaultPrevSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.75 19.5L8.25 12L15.75 4.5"/></svg>';
  var defaultNextSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.25 4.5L15.75 12L8.25 19.5"/></svg>';

  function injectArrowIcon(btn, defaultSvg, iconName, iconType, iconSize) {
    if (!btn) return;
    if (!iconName) {
      // Icône par défaut : adapter la taille du SVG inline
      var svg = defaultSvg;
      if (iconSize) {
        svg = svg.replace(/width="20"/, 'width="' + iconSize + '"').replace(/height="20"/, 'height="' + iconSize + '"');
      }
      btn.innerHTML = svg;
      return;
    }
    // Utiliser le système d'icônes (fetchIconSvg)
    if (window.fetchIconSvg) {
      window.fetchIconSvg(iconType || 'outline', iconName, function (svgStr) {
        if (svgStr) {
          var size = iconSize || '20';
          svgStr = svgStr.replace(/width="\d+"/, 'width="' + size + '"').replace(/height="\d+"/, 'height="' + size + '"');
          svgStr = svgStr.replace(/stroke="#[^"]+"/g, 'stroke="currentColor"').replace(/fill="#[^"]+"/g, function (m) {
            return m.indexOf('none') > -1 ? m : 'fill="currentColor"';
          });
          btn.innerHTML = svgStr;
        }
      });
    }
  }

  function getPerView(slider) {
    var raw = (slider.getAttribute('data-slider-per-view') || '1').trim().split(/\s+/);
    var desktop = parseInt(raw[0]) || 1;
    var tablet = parseInt(raw[1]) || desktop;
    var mobileLandscape = parseInt(raw[2]) || tablet;
    var mobile = parseInt(raw[3]) || mobileLandscape;

    var w = window.innerWidth;
    if (w <= 478) return mobile;
    if (w <= 767) return mobileLandscape;
    if (w <= 991) return tablet;
    return desktop;
  }

  function createSlider(slider) {
    var track = slider.querySelector('.slider__track');
    var slides = slider.querySelectorAll('.slider__slide');
    var prevBtn = slider.querySelector('.slider__prev');
    var nextBtn = slider.querySelector('.slider__next');
    var dotsContainer = slider.querySelector('.slider__dots');

    if (!track || slides.length === 0) return;

    // Personnalisation des flèches
    var arrowPrevIcon = slider.getAttribute('data-slider-arrow-prev');
    var arrowNextIcon = slider.getAttribute('data-slider-arrow-next');
    var arrowIconType = slider.getAttribute('data-slider-arrow-type') || 'outline';
    var arrowIconSize = slider.getAttribute('data-slider-arrow-size');

    // Injecter les icônes SVG
    injectArrowIcon(prevBtn, defaultPrevSvg, arrowPrevIcon, arrowIconType, arrowIconSize);
    injectArrowIcon(nextBtn, defaultNextSvg, arrowNextIcon, arrowIconType, arrowIconSize);

    var perView = getPerView(slider);
    var loop = slider.getAttribute('data-slider-loop') === 'true';
    var autoplayDelay = parseInt(slider.getAttribute('data-slider-auto')) || 0;
    var showDots = slider.getAttribute('data-slider-dots') !== 'false';
    var showArrows = slider.getAttribute('data-slider-arrows') !== 'false';

    // Masquer les flèches si data-slider-arrows="false"
    if (!showArrows) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }

    // Masquer les dots si data-slider-dots="false"
    if (!showDots && dotsContainer) {
      dotsContainer.style.display = 'none';
    }

    var current = 0;
    var total = slides.length;
    var maxIndex = Math.max(0, total - perView);
    var autoplayTimer = null;

    // Générer les dots
    if (dotsContainer && showDots) {
      dotsContainer.innerHTML = '';
      var dotCount = maxIndex + 1;
      for (var i = 0; i < dotCount; i++) {
        var dot = document.createElement('button');
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.setAttribute('data-slide-index', i);
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      if (loop) {
        if (index > maxIndex) index = 0;
        if (index < 0) index = maxIndex;
      } else {
        index = Math.max(0, Math.min(index, maxIndex));
      }

      current = index;
      var offset = -(current * (100 / perView));
      track.style.transform = 'translateX(' + offset + '%)';

      // Mettre à jour les dots
      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll('.slider__dot');
        dots.forEach(function (d, i) {
          d.classList.toggle('slider__dot--active', i === current);
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Navigation par boutons
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });

    // Navigation par dots
    if (dotsContainer) {
      dotsContainer.addEventListener('click', function (e) {
        var dot = e.target.closest('.slider__dot');
        if (!dot) return;
        var idx = parseInt(dot.getAttribute('data-slide-index'), 10);
        goTo(idx);
        resetAutoplay();
      });
    }

    // Swipe tactile
    var startX = 0;
    var isDragging = false;

    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      // Empêcher le scroll horizontal par défaut
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      isDragging = false;
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
        resetAutoplay();
      }
    });

    // Drag souris (data-slider-drag="true")
    var draggable = slider.getAttribute('data-slider-drag') === 'true';
    if (draggable) {
      var dragStartX = 0;
      var dragStartOffset = 0;
      var isMouseDragging = false;
      var hasDragged = false;
      var dragThreshold = 50;

      slider.style.cursor = 'grab';
      track.style.userSelect = 'none';

      var onMouseMove = function (e) {
        if (!isMouseDragging) return;
        hasDragged = true;
        var diff = e.clientX - dragStartX;
        var sliderWidth = slider.offsetWidth;
        var percentDiff = (diff / sliderWidth) * 100;
        track.style.transform = 'translateX(' + (dragStartOffset + percentDiff) + '%)';
      };

      var onMouseUp = function (e) {
        if (!isMouseDragging) return;
        isMouseDragging = false;
        track.style.transition = '';
        slider.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        var diff = dragStartX - e.clientX;
        if (Math.abs(diff) > dragThreshold) {
          if (diff > 0) next();
          else prev();
          resetAutoplay();
        } else {
          goTo(current);
        }
      };

      track.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        isMouseDragging = true;
        hasDragged = false;
        dragStartX = e.clientX;
        dragStartOffset = -(current * (100 / perView));
        track.style.transition = 'none';
        slider.style.cursor = 'grabbing';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      // Bloquer le clic uniquement si un vrai drag a eu lieu
      track.addEventListener('click', function (e) {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      // Empêcher le drag natif des images/liens
      track.addEventListener('dragstart', function (e) {
        e.preventDefault();
      });
    }

    // Autoplay
    function startAutoplay() {
      if (autoplayDelay > 0) {
        autoplayTimer = setInterval(next, autoplayDelay);
      }
    }

    function resetAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      startAutoplay();
    }

    // Pause au survol
    if (autoplayDelay > 0) {
      slider.addEventListener('mouseenter', function () {
        if (autoplayTimer) clearInterval(autoplayTimer);
      });
      slider.addEventListener('mouseleave', function () {
        startAutoplay();
      });
    }

    // Responsive per-view
    var hasResponsive = (slider.getAttribute('data-slider-per-view') || '').trim().indexOf(' ') > -1;

    function applyFlexBasis() {
      slides.forEach(function (s) {
        s.style.flexBasis = (100 / perView) + '%';
      });
    }

    function regenerateDots() {
      if (!dotsContainer || !showDots) return;
      dotsContainer.innerHTML = '';
      var dotCount = maxIndex + 1;
      for (var i = 0; i < dotCount; i++) {
        var dot = document.createElement('button');
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.setAttribute('data-slide-index', i);
        dotsContainer.appendChild(dot);
      }
    }

    function updatePerView() {
      var newPerView = getPerView(slider);
      if (newPerView === perView) return;
      perView = newPerView;
      maxIndex = Math.max(0, total - perView);
      applyFlexBasis();
      if (current > maxIndex) current = maxIndex;
      regenerateDots();
      goTo(current);
    }

    if (hasResponsive) {
      applyFlexBasis();
      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updatePerView, 100);
      });
    }

    // Init
    goTo(0);
    startAutoplay();
  }
})();
