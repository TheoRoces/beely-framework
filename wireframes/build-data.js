#!/usr/bin/env node
/**
 * Génère wireframes-data.json — bundle de tous les wireframes HTML.
 * Contourne le bug de Live Server qui injecte son script dans les
 * réponses .html et corrompt les SVG dans les iframes.
 *
 * Usage :
 *   node wireframes/build-data.js           Génère le bundle une fois
 *   node wireframes/build-data.js --watch   Génère + surveille les changements
 *
 * Le fichier est auto-généré et non versionné (.gitignore).
 */

var fs = require('fs');
var path = require('path');

var WIREFRAMES_DIR = path.join(__dirname);
var OUTPUT = path.join(__dirname, 'wireframes-data.json');
var WATCH = process.argv.includes('--watch');

function build() {
  var data = {};
  var count = 0;

  function walk(dir) {
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.html')) {
        var key = path.relative(WIREFRAMES_DIR, fullPath).replace(/\\/g, '/');
        data[key] = fs.readFileSync(fullPath, 'utf8');
        count++;
      }
    }
  }

  walk(WIREFRAMES_DIR);
  fs.writeFileSync(OUTPUT, JSON.stringify(data), 'utf8');
  return count;
}

/* Build initial */
var n = build();
var ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
console.log('[' + ts + '] wireframes-data.json généré — ' + n + ' wireframes');

if (!WATCH) process.exit(0);

/* Mode watch : surveille les sous-dossiers pour les .html modifiés */
console.log('Mode watch actif — en attente de modifications...');

var debounce = null;

function onFileChange(eventType, filename) {
  if (!filename || !filename.endsWith('.html')) return;
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(function () {
    var count = build();
    var t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    console.log('[' + t + '] Rebuild — ' + count + ' wireframes (modifié : ' + filename + ')');
  }, 300);
}

/* Surveiller chaque sous-dossier (fs.watch récursif n'est pas fiable partout) */
var entries = fs.readdirSync(WIREFRAMES_DIR, { withFileTypes: true });
for (var i = 0; i < entries.length; i++) {
  if (entries[i].isDirectory()) {
    fs.watch(path.join(WIREFRAMES_DIR, entries[i].name), onFileChange);
  }
}
/* Surveiller aussi la racine wireframes/ */
fs.watch(WIREFRAMES_DIR, onFileChange);
