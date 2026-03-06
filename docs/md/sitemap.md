# Sitemap

Génération automatique de `sitemap.xml` et `robots.txt`. Script Node.js natif, zéro dépendance.

## Utilisation

Lancez le script avec votre URL de production :

```bash
node generate-sitemap.js https://monsite.fr
```

Le script génère deux fichiers à la racine du projet :

- `sitemap.xml` — plan du site pour les moteurs de recherche
- `robots.txt` — autorise l'indexation et référence le sitemap

## Fonctionnement

- Parcourt récursivement le projet à la recherche de fichiers `.html`
- Détecte la date de dernière modification de chaque fichier
- Calcule la priorité selon la profondeur (racine = 1.0, sous-dossier = 0.6...)
- `index.html` reçoit toujours la priorité maximale (1.0)

## Dossiers ignorés

Par défaut, les dossiers suivants sont exclus du sitemap :

- `node_modules`, `.git`, `.claude`
- `core/` (fichiers du framework, pas des pages)
- `docs/` (documentation interne, pas destinée au SEO)
- Dossiers commençant par un point

Modifiez la variable `IGNORE_DIRS` dans `generate-sitemap.js` pour ajuster.

## Sortie

### sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://monsite.fr/index.html</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://monsite.fr/blog.html</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

### robots.txt

```
User-agent: *
Allow: /

Sitemap: https://monsite.fr/sitemap.xml
```

## Intégration CI/CD

Ajoutez la commande au pipeline de déploiement pour garder le sitemap à jour :

```yaml
# Exemple GitHub Actions
- name: Generate sitemap
  run: node generate-sitemap.js ${{ vars.SITE_URL }}

# Exemple script de déploiement
deploy:
  node generate-sitemap.js https://monsite.fr
  rsync -avz . user@server:/var/www/
```

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Blog](blog.md)
