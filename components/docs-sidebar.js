registerComponent('docs-sidebar', function (slots) {
  var active = slots.active || 'index';
  var links = [
    { cat: 'Prise en main' },
    { href: 'index.html',           label: 'Introduction',       key: 'index' },
    { href: 'getting-started.html', label: 'D\u00e9marrer un projet', key: 'getting-started' },
    { href: 'production.html',      label: 'Mise en production', key: 'production' },
    { cat: 'Fonctionnalit\u00e9s' },
    { href: 'tokens.html',     label: 'Design Tokens', key: 'tokens' },
    { href: 'components.html', label: 'Composants',    key: 'components' },
    { href: 'elements.html',  label: '\u00c9l\u00e9ments',      key: 'elements' },
    { href: 'grid.html',      label: 'Grid / Bento',  key: 'grid' },
    { href: 'animations.html',label: 'Animations',     key: 'animations' },
    { href: 'icons.html',     label: 'Ic\u00f4nes',         key: 'icons' },
    { href: 'forms.html',     label: 'Formulaires',    key: 'forms' },
    { href: 'blog.html',      label: 'Blog',           key: 'blog' },
    { href: 'cookies.html',   label: 'Cookies & RGPD', key: 'cookies' },
    { cat: 'Outils' },
    { href: 'configurateur.html', label: 'Configurateur', key: 'configurateur' },
    { href: 'sitemap.html',    label: 'Sitemap',        key: 'sitemap' },
    { href: 'params.html',     label: 'Param\u00e8tres URL', key: 'params' },
    { href: 'wireframes.html', label: 'Wireframes',     key: 'wireframes' },
    { href: 'claude.html',     label: 'Claude Code',    key: 'claude' },
    { href: 'submodule.html', label: 'Architecture Submodule', key: 'submodule' },
    { cat: 'Configurateur' },
    { href: 'configurateur.html',              label: 'Vue d\'ensemble',     key: 'configurateur' },
    { href: 'configurateur-dashboard.html',    label: 'Dashboard',           key: 'configurateur-dashboard' },
    { href: 'configurateur-pages.html',        label: 'Pages',               key: 'configurateur-pages' },
    { href: 'configurateur-config.html',       label: 'Configuration',       key: 'configurateur-config' },
    { href: 'configurateur-bibliotheque.html', label: 'Biblioth\u00e8que',   key: 'configurateur-bibliotheque' },
    { href: 'configurateur-deploy.html',       label: 'D\u00e9ploiement',    key: 'configurateur-deploy' },
    { href: 'configurateur-api.html',          label: 'API Backend',         key: 'configurateur-api' }
  ];

  var html = '<div class="docs-sidebar__title">Documentation</div>';
  var inGroup = false;

  links.forEach(function (item) {
    if (item.cat) {
      if (inGroup) html += '</div>';
      html += '<div class="docs-sidebar__category">' + item.cat + '</div>';
      html += '<div class="docs-sidebar__group">';
      inGroup = true;
    } else {
      var cls = item.key === active ? ' class="active"' : '';
      html += '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
    }
  });

  if (inGroup) html += '</div>';
  return html;
});
