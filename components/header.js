registerComponent('header', function (slots) {
  var logoLink = slots.logoLink || '/';
  var logoSrc = slots.logoSrc || '';
  var logoAlt = slots.siteName || 'Logo';
  var navHtml = slots.nav || '';

  /* Icones theme */
  var sunSvg = '<svg class="header__theme-icon header__theme-icon--sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var moonSvg = '<svg class="header__theme-icon header__theme-icon--moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  /* Bouton recherche (uniquement si slot search est declare) */
  var searchBtn = '';
  if (slots.search !== undefined) {
    searchBtn = '<button class="header__search" data-search-trigger>'
      + '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" stroke-width="2"/><path d="M13 13l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      + '<span class="header__search-label">Rechercher...</span>'
      + '<kbd class="header__search-kbd">\u2318K</kbd>'
      + '</button>';
  }

  return ''
    + '<header class="header">'
    +   '<div class="container header__inner">'
    +     '<a href="' + escapeSlotHtml(logoLink) + '" class="header__logo">'
    +       (logoSrc
          ? '<img src="' + escapeSlotHtml(logoSrc) + '" alt="' + escapeSlotHtml(logoAlt) + '">'
          : '<span class="header__logo-text">' + escapeSlotHtml(logoAlt) + '</span>')
    +     '</a>'
    +     '<nav class="header__nav">'
    +       navHtml
    +     '</nav>'
    +     '<div class="header__actions">'
    +       searchBtn
    +       '<button class="header__theme-toggle" data-theme-toggle aria-label="Basculer le th\u00e8me">'
    +         sunSvg + moonSvg
    +       '</button>'
    +     '</div>'
    +     (slots.cta ? '<div class="header__cta">' + slots.cta + '</div>' : '')
    +   '</div>'
    + '</header>';
});
