registerComponent('header', function (slots) {
  var logoLink = escapeSlotHtml(slots.logoLink || '/');
  var logoSrc = slots.logoSrc || '';
  var logoAlt = escapeSlotHtml(slots.siteName || 'Logo');
  var navHtml = slots.nav || '';

  var logoInner = logoSrc
    ? `<img src="${escapeSlotHtml(logoSrc)}" alt="${logoAlt}">`
    : `<span class="header__logo-text">${logoAlt}</span>`;

  var searchBtn = '';
  if (slots.search !== undefined) {
    searchBtn = `
      <button class="header__search" data-search-trigger>
        <span data-icon="magnifying-glass" data-icon-type="outline" data-icon-size="16"></span>
        <span class="header__search-label">Rechercher...</span>
        <kbd class="header__search-kbd">⌘K</kbd>
      </button>`;
  }

  return `
    <header class="header">
      <div class="container header__inner">
        <a href="${logoLink}" class="header__logo">${logoInner}</a>
        <nav class="header__nav">${navHtml}</nav>
        <div class="header__actions">
          ${searchBtn}
          <button class="header__theme-toggle" data-theme-toggle aria-label="Basculer le thème">
            <span class="header__theme-icon header__theme-icon--sun" data-icon="sun" data-icon-type="outline" data-icon-size="18"></span>
            <span class="header__theme-icon header__theme-icon--moon" data-icon="moon" data-icon-type="outline" data-icon-size="18"></span>
          </button>
          <button class="header__burger" data-header-toggle aria-label="Ouvrir le menu" aria-expanded="false">
            <span class="header__burger-line"></span>
            <span class="header__burger-line"></span>
            <span class="header__burger-line"></span>
          </button>
        </div>
        ${slots.cta ? `<div class="header__cta">${slots.cta}</div>` : ''}
      </div>
      <div class="header__overlay" data-header-overlay></div>
    </header>`;
});
