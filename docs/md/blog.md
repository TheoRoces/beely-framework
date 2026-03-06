# Blog

Système de blog dynamique connecté à Baserow. Listing avec pagination « Load more », filtres par catégories, page article avec galerie lightbox, SEO dynamique. Zéro dépendance.

## Connexion à Baserow

Le blog utilise l'API Baserow comme CMS. Voici comment récupérer les identifiants nécessaires.

### 1. Créer un token API

1. Connectez-vous à [baserow.io](https://baserow.io)
2. Cliquez sur votre avatar (en haut à gauche) → **Settings**
3. Allez dans l'onglet **Database tokens** (dans le menu de gauche)
4. Cliquez sur **Create token**
5. Donnez un nom (ex. « Blog front ») et sélectionnez le **workspace** concerné
6. Dans les permissions, assurez-vous que la table blog a bien **Read** coché (décochez create, update, delete pour la sécurité)
7. Copiez le token généré (commençant par un long hash alphanumérique)

### 2. Trouver le Table ID

Ouvrez votre table dans Baserow. Le **Table ID** est visible dans l'URL du navigateur :

```
https://baserow.io/database/12345/table/67890/...
                                       ^^^^^  ^^^^^
                                       DB ID  Table ID
```

C'est le **deuxième nombre** dans l'URL (après `/table/`) qui nous intéresse. Dans cet exemple : `67890`.

**Autre méthode :** dans Baserow, ouvrez la sidebar de gauche, faites un clic droit sur le nom de votre table → l'ID apparaît dans l'URL de l'onglet.

### 3. Configurer le projet

Ouvrez `config-site.js` à la racine du projet et remplissez la section `BLOG_CONFIG` :

```js
window.BLOG_CONFIG = {
  baserow: {
    url: 'https://api.baserow.io',
    token: 'VOTRE_TOKEN_ICI',         // Token API (Settings → Database tokens)
    tableId: '67890',                 // Table ID (le nombre après /table/ dans l'URL)
  },
  perPage: 12,                        // Articles par page
  dateFormat: 'fr-FR',                // Locale des dates
  defaultImage: '',                   // Image par défaut si pas de featured_img
  articlePage: 'blog/article',        // Chemin vers la page article
  blogPage: 'blog',                   // Chemin vers le listing
};
```

### 4. Vérifier la connexion

Pour tester que le token et le Table ID sont corrects, ouvrez votre navigateur et entrez :

```
https://api.baserow.io/api/database/rows/table/67890/?user_field_names=true
// Header: Authorization: Token VOTRE_TOKEN_ICI
```

Vous devez obtenir un JSON avec vos articles. Si vous obtenez une erreur 401, vérifiez le token. Si 404, vérifiez le Table ID.

### 5. Proxy PHP (production)

En production, le token API ne doit **jamais** être exposé côté client. Utilisez le proxy PHP fourni dans `api/baserow.php`. Le blog.js l'utilise automatiquement si `proxyUrl` est configuré :

```js
window.BLOG_CONFIG = {
  baserow: {
    url: 'https://api.baserow.io',
    token: '',           // Vide en prod (le proxy gère le token côté serveur)
    tableId: '67890',
  },
  proxyUrl: '/api/baserow.php',  // Proxy qui injecte le token côté serveur
  // ...
};
```

Le fichier `api/baserow.php` contient le token en dur côté serveur. Le client ne voit jamais le token.

## Champs Baserow

Créez les champs suivants dans votre table. **Tous sont optionnels** sauf `title`.

| Champ | Type Baserow | Description |
|---|---|---|
| `title` | Texte | Titre de l'article |
| `slug` | Texte | Slug URL (ex. `mon-article`) |
| `excerpt` | Texte long | Résumé affiché sur la card + fallback meta description |
| `content` | Texte long / Rich text | Contenu HTML complet de l'article |
| `featured_img` | Fichier | Image principale (hero + og:image) |
| `date` | Date | Date de publication |
| `author` | Texte | Nom de l'auteur |
| `meta_title` | Texte | Titre SEO (fallback : `title`) |
| `meta_description` | Texte long | Description SEO (fallback : `excerpt`) |
| `categories` | **Choix multiples** | Catégories (filtrage auto) |
| `taxonomies` | **Choix multiples** | Tags / taxonomies supplémentaires |
| `status` | **Choix unique** | `published` = visible, `draft` = masqué |
| `read_time` | Nombre | Temps de lecture en minutes (affiché « X min ») |
| `gallery_1` à `gallery_5` | Fichier | Images de galerie (lightbox) |

### Options pour categories

Créez les options que vous souhaitez dans le champ multi-select Baserow. Exemples :

```
Tech, Design, Marketing, Business, Tutoriel, News
```

### Options pour status

Créez deux options dans le champ single-select :

```
published   → Article visible sur le site
draft       → Article masqué (brouillon)
```

## Données d'exemple

Voici des entrées à copier/coller dans Baserow pour tester le blog :

### Article 1

| Champ | Valeur |
|---|---|
| `title` | Découvrir le CSS moderne |
| `slug` | decouvrir-css-moderne |
| `excerpt` | Un tour d'horizon des nouveautés CSS : container queries, :has(), color-mix(), et bien plus. |
| `content` | `<h2>Container Queries</h2><p>Les container queries permettent de styliser un élément en fonction de la taille de son conteneur, pas de la fenêtre.</p><h2>Le sélecteur :has()</h2><p>Enfin un sélecteur parent en CSS ! :has() permet de cibler un élément qui contient un enfant spécifique.</p><h2>color-mix()</h2><p>Générez des variantes de couleurs directement en CSS, sans préprocesseur.</p>` |
| `date` | 2026-02-20 |
| `author` | Marie Dupont |
| `categories` | Tech, Tutoriel |
| `taxonomies` | CSS, Frontend |
| `meta_title` | CSS Moderne : Container Queries, :has(), color-mix() |
| `meta_description` | Découvrez les fonctionnalités CSS modernes : container queries, sélecteur :has(), color-mix() et plus. |
| `status` | published |

### Article 2

| Champ | Valeur |
|---|---|
| `title` | 10 règles pour un bon UX Design |
| `slug` | 10-regles-ux-design |
| `excerpt` | Les principes fondamentaux pour créer des interfaces intuitives et agréables à utiliser. |
| `content` | `<h2>1. La cohérence</h2><p>Utilisez les mêmes patterns partout. Un bouton doit toujours ressembler à un bouton.</p><h2>2. Le feedback</h2><p>Chaque action de l'utilisateur doit produire une réponse visible.</p><h2>3. La hiérarchie visuelle</h2><p>Guidez le regard avec des tailles, couleurs et contrastes.</p>` |
| `date` | 2026-02-15 |
| `author` | Thomas Martin |
| `categories` | Design |
| `taxonomies` | UX, UI |
| `status` | published |

### Article 3

| Champ | Valeur |
|---|---|
| `title` | Déployer un site statique en 5 minutes |
| `slug` | deployer-site-statique |
| `excerpt` | Guide rapide pour mettre en ligne un site HTML/CSS/JS sur un hébergement Apache. |
| `content` | `<h2>Étape 1 : Préparer les fichiers</h2><p>Vérifiez que tous vos liens sont relatifs et que votre .htaccess est configuré.</p><h2>Étape 2 : Transférer</h2><p>Utilisez rsync, FTP ou le gestionnaire de fichiers de votre hébergeur.</p><h2>Étape 3 : Vérifier</h2><p>Testez toutes les pages, le formulaire de contact et le blog.</p>` |
| `date` | 2026-02-10 |
| `author` | Marie Dupont |
| `categories` | Tech, Tutoriel |
| `taxonomies` | Déploiement, Apache |
| `status` | published |

### Article 4

| Champ | Valeur |
|---|---|
| `title` | Comprendre le SEO on-page |
| `slug` | comprendre-seo-on-page |
| `excerpt` | Les bases du référencement naturel : balises meta, structure HTML et bonnes pratiques. |
| `content` | `<h2>Les balises meta</h2><p>Title et description sont les deux balises les plus importantes pour le SEO.</p><h2>La structure HTML</h2><p>Utilisez des h1-h6 hiérarchiques, des images avec alt, et un balisage sémantique.</p>` |
| `date` | 2026-02-05 |
| `author` | Thomas Martin |
| `categories` | Marketing |
| `taxonomies` | SEO, Google |
| `status` | published |

### Article 5 (brouillon)

| Champ | Valeur |
|---|---|
| `title` | Les tendances web 2026 |
| `slug` | tendances-web-2026 |
| `excerpt` | Ce qui va changer dans le développement web cette année. |
| `date` | 2026-03-01 |
| `author` | Marie Dupont |
| `categories` | Tech, News |
| `status` | **draft** |

*Cet article a le statut `draft` — il n'apparaîtra pas sur le site.*

## Démo live — Pills + Custom Select

Catégories en **pills**, taxonomies en **select custom** (identique aux selects des formulaires).

```html
<div data-blog="listing" data-blog-filters="categories:pills, taxonomies:select"></div>
```

## Démo live — Checkboxes + Multi-Select (sans décompte)

Catégories en **checkboxes**, taxonomies en **multi-select custom** sans décompte (`:no-count`).

```html
<div data-blog="listing"
     data-blog-filters="categories:checkboxes, taxonomies:multi-select:no-count"></div>
```

## Démo live — Radios

Catégories en **radios** (sélection unique).

```html
<div data-blog="listing" data-blog-filters="categories:radios"></div>
```

### Fonctionnement

- Au chargement : skeletons de chargement
- Fetch de **tous les articles** depuis Baserow (tri par date décroissante)
- Filtrage **100% côté client** : exclut les `draft`, filtre par catégories/taxonomies
- Affichage en grille de cards (image, catégories, titre, extrait, meta)
- Bouton « Charger plus » pour la pagination client-side
- Seules les valeurs ayant des articles sont affichées dans les filtres
- Si pas de `featured_img`, un placeholder SVG neutre est affiché

## Système de filtres

Les filtres sont configurés via l'attribut `data-blog-filters`.

Format : `champ:style` ou `champ:style:no-count`, séparés par des virgules.

### Styles de filtres disponibles

| Style | Description | Sélection |
|---|---|---|
| `pills` | Boutons pills (défaut) | Simple |
| `select` | Custom select dropdown (identique aux forms) | Simple |
| `multi-select` | Custom multi-select dropdown avec checkboxes (identique aux forms) | Multiple |
| `checkboxes` | Cases à cocher inline | Multiple |
| `radios` | Boutons radio inline | Simple |

### Affichage du décompte

Par défaut, le nombre d'articles est affiché à côté de chaque valeur. Pour le masquer, ajoutez `:no-count` après le style :

```html
<!-- Avec décompte (défaut) -->
data-blog-filters="categories:pills"

<!-- Sans décompte -->
data-blog-filters="categories:pills:no-count"

<!-- Mixte : categories avec décompte, taxonomies sans -->
data-blog-filters="categories:select, taxonomies:multi-select:no-count"
```

Pour les filtres externes, utilisez l'attribut `data-filter-count="false"`.

### Exemples de combinaisons

```html
<!-- Défaut : catégories en pills -->
<div data-blog="listing"></div>

<!-- Catégories en pills + taxonomies en select -->
<div data-blog="listing"
     data-blog-filters="categories:pills, taxonomies:select"></div>

<!-- Catégories en checkboxes + taxonomies en multi-select sans décompte -->
<div data-blog="listing"
     data-blog-filters="categories:checkboxes, taxonomies:multi-select:no-count"></div>

<!-- Catégories en radios seules -->
<div data-blog="listing"
     data-blog-filters="categories:radios"></div>

<!-- Aucun filtre interne (filtres externes uniquement) -->
<div data-blog="listing" data-blog-filters=""></div>
```

### Filtres séparés (externes)

Vous pouvez placer un filtre **en dehors** du listing, n'importe où dans la page :

```html
<!-- Filtre externe pour les catégories -->
<div data-blog-filter="categories"
     data-filter-style="checkboxes"
     data-filter-label="Catégories"></div>

<!-- Filtre externe sans décompte -->
<div data-blog-filter="taxonomies"
     data-filter-style="select"
     data-filter-count="false"></div>

<!-- Le listing sans filtre interne -->
<div data-blog="listing" data-blog-filters=""></div>
```

Attributs disponibles sur un filtre externe :

| Attribut | Description |
|---|---|
| `data-blog-filter` | Nom du champ Baserow (à filtrer) |
| `data-filter-style` | Style : `pills`, `select`, `multi-select`, `checkboxes`, `radios` |
| `data-filter-label` | Label affiché (optionnel, auto-détecté pour categories/taxonomies) |
| `data-filter-count` | `"false"` pour masquer le décompte |

### Pagination

Le nombre d'articles par page est configuré par `perPage` dans `config-site.js`. Le bouton « Charger plus » apparaît automatiquement s'il y a plus d'articles que la limite. Pour tester la pagination, mettez `perPage: 2`.

## Placeholder image

Quand un article n'a pas de `featured_img`, un placeholder SVG est affiché automatiquement. Vous pouvez aussi l'utiliser n'importe où avec la classe utilitaire :

```html
<!-- Placeholder image réutilisable -->
<div class="placeholder-img"></div>
```

Ratio 16:9, fond `--color-bg-alt`, icône SVG neutre, compatible dark mode. Ajoutez un `style` pour ajuster la taille si besoin.

## Page article

Affiche un article unique avec SEO dynamique.

```html
<div data-blog="article"></div>
```

### Résolution de l'article

L'article est résolu via l'URL :

```
<!-- Par slug (recommandé, SEO-friendly) -->
blog/article?slug=decouvrir-css-moderne

<!-- Par ID Baserow -->
blog/article?id=42
```

Si le champ `slug` existe, les cards du listing l'utilisent automatiquement.

### Slugs dupliqués

Si deux articles ont le même slug, un avertissement apparaît dans la console. Pour désambiguïser, ajoutez l'ID Baserow dans l'URL :

```
blog/article?slug=mon-article&id=123
```

### SEO dynamique

Le JS met à jour automatiquement les balises SEO depuis les données Baserow :

| Balise | Source Baserow | Fallback |
|---|---|---|
| `<title>` | `meta_title` | `title` |
| `meta[description]` | `meta_description` | `excerpt` |
| `og:title` | `meta_title` | `title` |
| `og:description` | `meta_description` | `excerpt` |
| `og:image` | `featured_img` | |
| `og:url` | `window.location.href` | |
| `og:type` | `article` | |
| `twitter:card` | `summary_large_image` | |
| `twitter:title` | `meta_title` | `title` |
| `twitter:description` | `meta_description` | `excerpt` |
| `twitter:image` | `featured_img` | |

### Galerie & Lightbox

Les champs `gallery_1` à `gallery_5` sont affichés en grille. Un clic ouvre une lightbox plein écran :

- Flèches gauche/droite (clic ou clavier)
- Touche `Escape` pour fermer
- Clic sur l'overlay pour fermer

## Exemples de pages

### Page listing complète

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Mon Site</title>
  <script src="core/js/darkmode.js"></script>
  <link rel="stylesheet" href="core/css/tokens.css">
  <link rel="stylesheet" href="core/css/base.css">
  <link rel="stylesheet" href="core/css/animations.css">
  <link rel="stylesheet" href="core/css/blog.css">
  <script src="core/js/components.js"></script>
  <script src="components/header.js"></script>
  <script src="components/footer.js"></script>
  <script src="core/js/animations.js" defer></script>
  <script src="core/js/params.js" defer></script>
  <script src="config-site.js" defer></script>
  <script src="core/js/blog.js" defer></script>
</head>
<body>

  <div data-component="header">
    <template data-slot="logoAlt">Mon Site</template>
    <template data-slot="nav">
      <a href="index.html">Accueil</a>
      <a href="blog.html">Blog</a>
    </template>
  </div>

  <section class="section">
    <div class="container">
      <h1>Blog</h1>
      <div data-blog="listing"></div>
    </div>
  </section>

  <div data-component="footer">
    <template data-slot="copyright">&copy; 2026 Mon Site</template>
  </div>

</body>
</html>
```

### Page article complète

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article — Mon Site</title>
  <!-- SEO (rempli dynamiquement par blog.js) -->
  <meta name="description" content="">
  <meta property="og:title" content="">
  <meta property="og:description" content="">
  <meta property="og:type" content="article">
  <meta property="og:image" content="">
  <meta property="og:url" content="">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="">
  <meta name="twitter:description" content="">
  <meta name="twitter:image" content="">

  <script src="../core/js/darkmode.js"></script>
  <link rel="stylesheet" href="../core/css/tokens.css">
  <link rel="stylesheet" href="../core/css/base.css">
  <link rel="stylesheet" href="../core/css/animations.css">
  <link rel="stylesheet" href="../core/css/blog.css">
  <script src="../core/js/components.js"></script>
  <script src="../components/header.js"></script>
  <script src="../components/footer.js"></script>
  <script src="../core/js/animations.js" defer></script>
  <script src="../core/js/params.js" defer></script>
  <script src="../config-site.js" defer></script>
  <script src="../core/js/blog.js" defer></script>
</head>
<body>

  <div data-component="header">
    <template data-slot="logoAlt">Mon Site</template>
    <template data-slot="logoLink">../index.html</template>
    <template data-slot="nav">
      <a href="../blog.html">Blog</a>
    </template>
  </div>

  <article class="section">
    <div class="container">
      <div data-blog="article"></div>
    </div>
  </article>

  <div data-component="footer">
    <template data-slot="copyright">&copy; 2026 Mon Site</template>
  </div>

</body>
</html>
```

## Options de configuration

| Clé | Défaut | Description |
|---|---|---|
| `baserow.url` | `https://api.baserow.io` | URL de l'instance Baserow |
| `baserow.token` | `''` | Token API (vide si proxy) |
| `baserow.tableId` | `''` | ID de la table |
| `proxyUrl` | `''` | URL du proxy PHP (vide = appel direct) |
| `perPage` | `12` | Articles par page |
| `dateFormat` | `fr-FR` | Locale Intl pour les dates |
| `defaultImage` | `''` | Image si pas de featured_img |
| `articlePage` | `blog/article` | Chemin vers la page article |
| `blogPage` | `blog` | Chemin vers le listing |

## Personnalisation CSS

| Bloc | Description |
|---|---|
| `.blog__grid` | Grille de cards (CSS Grid auto-fill) |
| `.blog__filters` | Barre de filtres par catégories |
| `.blog__load-more` | Conteneur du bouton pagination |
| `.blog-card` | Card d'article (image 16:9, titre, extrait) |
| `.blog-article` | Article complet (hero, contenu, galerie) |
| `.blog-article__share` | Section de partage (copier lien, Twitter/X, LinkedIn) |
| `.blog-article__meta-item` | Item de méta avec icône (date, auteur, temps de lecture) |
| `.blog-related` | Grille d'articles similaires (3 colonnes, responsive) |
| `.blog-lightbox` | Overlay plein écran pour les images |
| `.blog-skeleton` | Animation de chargement (pulse) |

## Inclure dans une page

```html
<!-- CSS -->
<link rel="stylesheet" href="core/css/blog.css">

<!-- JS (dans le head, defer) -->
<script src="config-site.js" defer></script>
<script src="core/js/blog.js" defer></script>
<script src="core/js/params.js" defer></script>

<!-- Page article uniquement : icônes pour les boutons de partage et métas -->
<link rel="stylesheet" href="core/css/icons.css">
<script src="core/js/icons.js" defer></script>
```

Le script `params.js` est requis pour lire les paramètres d'URL (`?slug=` / `?id=`) sur la page article.

Sur la page article, ajoutez aussi `icons.css` et `icons.js` pour les icônes de partage, métas et articles similaires.

### Fonctionnalités article

La page article inclut automatiquement :

- **Métas enrichies** : date, auteur et temps de lecture avec icônes
- **Catégories** au-dessus du titre (pills cliquables)
- **Taxonomies** avec icône hashtag
- **Section partage** : copier le lien, partager sur Twitter/X et LinkedIn
- **Articles similaires** : grille de 3 articles de la même catégorie
- **SEO** : meta title, description, og:image remplis dynamiquement
- **Lightbox** : galerie d'images avec navigation clavier

## Problèmes courants

- **Les articles ne s'affichent pas :** vérifiez que `BLOG_CONFIG.baserow.tableId` est correct dans `config-site.js` et que le proxy `api/baserow.php` fonctionne.
- **Erreur CORS :** le fichier `.env` doit contenir `SITE_ORIGIN=https://votre-domaine.fr` correspondant exactement à votre URL.
- **Les images ne s'affichent pas :** vérifiez que le champ Baserow est de type `file` et que les fichiers sont bien uploadés dans Baserow.
- **Les filtres ne marchent pas :** les catégories Baserow doivent être de type `multiple_select` avec des options prédéfinies.

## Voir aussi

- [Démarrer un projet](getting-started.html)
- [Cookies & Analytics](cookies.html)
- [Sitemap](sitemap.html)
