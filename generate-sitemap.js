#!/usr/bin/env node
/* ==========================================================================
   SITEMAP GENERATOR — Génère sitemap.xml automatiquement
   Usage : node generate-sitemap.js https://monsite.fr
   Zéro dépendance — Node.js natif uniquement
   ========================================================================== */

var fs = require('fs');
var path = require('path');

var BASE_URL = process.argv[2];

if (!BASE_URL) {
  console.error('Usage : node generate-sitemap.js https://monsite.fr');
  console.error('  Exemple : node generate-sitemap.js https://example.com');
  process.exit(1);
}

// Nettoyer le trailing slash
BASE_URL = BASE_URL.replace(/\/+$/, '');

var ROOT = __dirname;

// Fichiers/dossiers à ignorer
var IGNORE_DIRS = ['node_modules', '.git', '.claude', 'docs', 'core', 'components', 'snippets', 'assets', 'api'];
var IGNORE_FILES = ['generate-sitemap.js', 'sitemap.xml', 'robots.txt', '404.html'];

// Priorités par profondeur/type
var PRIORITIES = {
  'index.html': '1.0',
  _default_root: '0.8',
  _default_sub: '0.6',
  _default_deep: '0.4'
};

// Fréquence de mise à jour
var CHANGEFREQ = 'monthly';

/**
 * Parcourt le dossier récursivement et collecte les fichiers .html
 */
function collectHTMLFiles(dir, relativeTo) {
  var results = [];
  var entries;

  try {
    entries = fs.readdirSync(dir);
  } catch (e) {
    return results;
  }

  entries.forEach(function (entry) {
    var fullPath = path.join(dir, entry);
    var relPath = path.relative(relativeTo, fullPath);

    // Ignorer les dossiers exclus
    if (IGNORE_DIRS.indexOf(entry) > -1) return;
    if (IGNORE_FILES.indexOf(entry) > -1) return;
    if (entry.startsWith('.')) return;

    var stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      return;
    }

    if (stat.isDirectory()) {
      results = results.concat(collectHTMLFiles(fullPath, relativeTo));
    } else if (entry.endsWith('.html')) {
      var depth = relPath.split(path.sep).length - 1;
      var priority = PRIORITIES[entry] || (depth === 0 ? PRIORITIES._default_root : depth === 1 ? PRIORITIES._default_sub : PRIORITIES._default_deep);

      // index.html à la racine = priorité max
      if (relPath === 'index.html') priority = '1.0';

      // URL propre : retirer .html (Apache sert les fichiers .html via rewrite)
      var cleanPath = relPath.split(path.sep).join('/').replace(/\.html$/, '');
      // Garder la racine "/" pour index
      var loc = cleanPath === 'index' ? BASE_URL + '/' : BASE_URL + '/' + cleanPath;

      results.push({
        loc: loc,
        lastmod: stat.mtime.toISOString().split('T')[0],
        changefreq: CHANGEFREQ,
        priority: priority
      });
    }
  });

  return results;
}

/**
 * Génère le XML du sitemap
 */
function generateSitemapXML(urls) {
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Trier : index.html en premier, puis par profondeur
  urls.sort(function (a, b) {
    if (a.priority !== b.priority) return parseFloat(b.priority) - parseFloat(a.priority);
    return a.loc.localeCompare(b.loc);
  });

  urls.forEach(function (url) {
    xml += '  <url>\n';
    xml += '    <loc>' + escapeXml(url.loc) + '</loc>\n';
    xml += '    <lastmod>' + url.lastmod + '</lastmod>\n';
    xml += '    <changefreq>' + url.changefreq + '</changefreq>\n';
    xml += '    <priority>' + url.priority + '</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';
  return xml;
}

/**
 * Génère robots.txt
 */
function generateRobotsTxt() {
  return 'User-agent: *\nAllow: /\n' +
    'Disallow: /components/\n' +
    'Disallow: /core/\n' +
    'Disallow: /api/\n' +
    'Disallow: /assets/\n' +
    'Disallow: /snippets/\n' +
    '\nSitemap: ' + BASE_URL + '/sitemap.xml\n';
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Exécution ---

var urls = collectHTMLFiles(ROOT, ROOT);

if (urls.length === 0) {
  console.error('Aucun fichier .html trouvé.');
  process.exit(1);
}

var sitemapXml = generateSitemapXML(urls);
var robotsTxt = generateRobotsTxt();

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt);

console.log('sitemap.xml généré avec ' + urls.length + ' URLs :');
urls.forEach(function (u) {
  console.log('  ' + u.loc + '  (priorité: ' + u.priority + ')');
});
console.log('\nrobots.txt généré.');
console.log('Base URL : ' + BASE_URL);
