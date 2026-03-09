/* ==========================================================================
   WIREFRAMES — Script d'interactivite pour les previews
   Gere les accordions, tabs, filtres, carousels et toggles
   generiquement via les conventions BEM des wireframes.
   ========================================================================== */

(function () {

  /* ---------- Accordion / FAQ toggle ---------- */
  /* Pattern: click on [class*="__question"] or [class*="__header"]
     toggles --open / --expanded on the parent __item / __step / __accordion */

  document.addEventListener('click', function (e) {
    var trigger = null;
    var el = e.target;

    /* Walk up to find an accordion trigger */
    while (el && el !== document) {
      var cls = el.className || '';
      if (typeof cls === 'string' &&
          (cls.indexOf('__question') > -1 || cls.indexOf('__accordion-header') > -1 || cls.indexOf('__step-header') > -1)) {
        trigger = el;
        break;
      }
      el = el.parentElement;
    }

    if (!trigger) return;

    /* Find the parent item */
    var item = trigger.parentElement;
    if (!item) return;

    var itemCls = item.className || '';
    if (typeof itemCls !== 'string') return;

    /* Determine the state class (--open or --expanded) */
    var stateClass = '';
    var classes = itemCls.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf('--open') > -1) {
        stateClass = classes[i];
        break;
      }
      if (classes[i].indexOf('--expanded') > -1) {
        stateClass = classes[i];
        break;
      }
    }

    /* If not currently open, build the state class from the base class */
    if (!stateClass) {
      /* Find base BEM class (first class without --) */
      var baseClass = '';
      for (var j = 0; j < classes.length; j++) {
        if (classes[j].indexOf('--') === -1 && classes[j].length > 0) {
          baseClass = classes[j];
          break;
        }
      }
      if (baseClass) {
        stateClass = baseClass + '--open';
      } else {
        return;
      }
    }

    /* Toggle: close siblings (accordion behavior), then toggle current */
    var parent = item.parentElement;
    if (parent) {
      var siblings = parent.children;
      for (var k = 0; k < siblings.length; k++) {
        if (siblings[k] !== item) {
          siblings[k].classList.remove(stateClass);
          /* Also handle --expanded variant */
          var expClass = stateClass.replace('--open', '--expanded');
          if (expClass !== stateClass) siblings[k].classList.remove(expClass);
        }
      }
    }

    item.classList.toggle(stateClass);
  });

  /* ---------- Tab / filter pill toggle ---------- */
  /* Pattern: click on [class*="__tab"] or [class*="__pill"] or [class*="__filter"]
     inside a nav/group container toggles --active among siblings */

  document.addEventListener('click', function (e) {
    var btn = null;
    var el = e.target;

    while (el && el !== document) {
      var cls = el.className || '';
      if (typeof cls === 'string') {
        if ((cls.indexOf('__tab') > -1 || cls.indexOf('__pill') > -1 ||
             cls.indexOf('__filter') > -1 || cls.indexOf('__view-btn') > -1) &&
            cls.indexOf('__tab-') === -1 && cls.indexOf('__tabs') === -1) {
          /* Make sure it looks like a clickable element (not a panel) */
          var tag = el.tagName.toLowerCase();
          if (tag === 'button' || tag === 'a' || tag === 'span' || tag === 'div' || tag === 'li') {
            btn = el;
            break;
          }
        }
      }
      el = el.parentElement;
    }

    if (!btn) return;

    /* Skip framework .tabs components — handled by elements.js initTabs() */
    if (btn.closest('.tabs')) return;

    /* Find the active class for this button */
    var btnCls = btn.className || '';
    var btnClasses = btnCls.split(/\s+/);
    var activeClass = '';

    /* Check if any sibling has an --active class to determine the pattern */
    var container = btn.parentElement;
    if (!container) return;

    var children = container.children;
    for (var i = 0; i < children.length; i++) {
      var cCls = (children[i].className || '').split(/\s+/);
      for (var j = 0; j < cCls.length; j++) {
        if (cCls[j].indexOf('--active') > -1 || cCls[j].indexOf('--on') > -1) {
          activeClass = cCls[j];
          break;
        }
      }
      if (activeClass) break;
    }

    /* If no active class found, build it from the button's base class */
    if (!activeClass) {
      for (var k = 0; k < btnClasses.length; k++) {
        if (btnClasses[k].indexOf('--') === -1 && btnClasses[k].length > 0) {
          activeClass = btnClasses[k] + '--active';
          break;
        }
      }
    }

    if (!activeClass) return;

    /* Toggle: remove from siblings, add to clicked */
    for (var m = 0; m < children.length; m++) {
      children[m].classList.remove(activeClass);
    }
    btn.classList.add(activeClass);
  });

  /* ---------- Carousel / scroll arrows ---------- */
  /* Pattern: click on [class*="__arrow"] or [class*="__nav-btn"]
     scrolls the nearest scrollable container */

  document.addEventListener('click', function (e) {
    var arrow = null;
    var el = e.target;

    while (el && el !== document) {
      var cls = el.className || '';
      if (typeof cls === 'string' &&
          (cls.indexOf('__arrow') > -1 || cls.indexOf('__nav-btn') > -1 || cls.indexOf('nav--prev') > -1 || cls.indexOf('nav--next') > -1)) {
        arrow = el;
        break;
      }
      el = el.parentElement;
    }

    if (!arrow) return;

    /* Determine direction */
    var arrowCls = arrow.className || '';
    var ariaLabel = (arrow.getAttribute('aria-label') || '').toLowerCase();
    var isLeft = arrowCls.indexOf('--left') > -1 || arrowCls.indexOf('--prev') > -1 ||
                 ariaLabel.indexOf('prec') > -1 || ariaLabel.indexOf('prev') > -1 ||
                 ariaLabel.indexOf('gauche') > -1;

    /* Also check if this is the first nav-btn (= prev) or second (= next) */
    if (!isLeft && arrowCls.indexOf('__nav-btn') > -1) {
      var navParent = arrow.parentElement;
      if (navParent) {
        var navBtns = navParent.querySelectorAll('[class*="__nav-btn"]');
        if (navBtns.length >= 2 && navBtns[0] === arrow) {
          isLeft = true;
        }
      }
    }

    /* Find scrollable container: look for overflow-x: auto/scroll in the section */
    var section = arrow.closest('section') || arrow.closest('[class*="wf-"]') || arrow.parentElement;
    if (!section) return;

    var scrollable = null;
    var candidates = section.querySelectorAll('*');
    for (var i = 0; i < candidates.length; i++) {
      var style = window.getComputedStyle(candidates[i]);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
        scrollable = candidates[i];
        break;
      }
    }

    if (!scrollable) return;

    /* Scroll by one card width */
    var scrollAmount = 340;
    var firstChild = scrollable.firstElementChild;
    if (firstChild) {
      scrollAmount = firstChild.offsetWidth + 24; /* card width + gap */
    }

    scrollable.scrollBy({
      left: isLeft ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  });

  /* ---------- Plus/Minus toggle (FAQ-15 style) ---------- */
  /* Handled by the accordion handler above since it uses the same --open pattern */

  /* ---------- Details/Summary (native) ---------- */
  /* Already handled by the browser natively */

})();
