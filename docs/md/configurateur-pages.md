# Configurateur — Gestion des pages

Le panneau **Pages** du Configurateur affiche un arbre hiérarchique de toutes les pages HTML du site. Il permet de créer, renommer, supprimer, dupliquer et organiser les pages, ainsi que de gérer leurs métadonnées (SEO, statut, code personnalisé, etc.).

## Vue d'ensemble

Le panneau Pages est accessible depuis la barre latérale gauche du Configurateur. Il présente l'ensemble des pages du site sous forme d'arbre hiérarchique, reflétant la structure de dossiers du projet. Chaque page est un fichier `.html` référencé dans le registre `pages.json`.

Sélectionnez une page (simple clic) pour afficher son panneau de métadonnées à droite.

## Arbre hiérarchique

Les pages sont stockées dans le dossier `pages/` du projet. L'arbre reflète cette structure :

- `index.html` — page d'accueil (verrouillée à la racine)
- `blog.html` — page parente
- `blog/article.html` — page enfant (template) dans `pages/blog/`
- `services.html` — page parente
- `services/consulting.html` — page enfant dans `pages/services/`

Les chemins affichés sont relatifs au dossier `pages/`. Imbriquer une page comme enfant d'une autre **déplace physiquement le fichier** dans le sous-dossier correspondant sur le disque.

L'ordre d'affichage peut être personnalisé via le champ **Ordre** dans les métadonnées de chaque page.

### Drag & drop

L'arbre supporte le drag & drop pour réorganiser les pages :

- **Zone haute (25%)** : insérer la page avant la cible
- **Zone centrale (50%)** : imbriquer la page comme enfant de la cible
- **Zone basse (25%)** : insérer la page après la cible

Lorsqu'une page est imbriquée sous une autre, le fichier HTML est **physiquement déplacé** dans un sous-dossier sur le disque. Par exemple, glisser `contact.html` sur `services.html` déplace le fichier de `pages/contact.html` vers `pages/services/contact.html`. Dé-nester une page la ramène à la racine de `pages/`.

La page d'accueil est **verrouillée** : elle ne peut être ni déplacée, ni imbriquée. Les pages templates sont également non-déplaçables.

Les dossiers vides sont automatiquement supprimés après un déplacement.

## Opérations CRUD

### Créer une page

Cliquez sur le bouton **+** dans le header du panneau. Une modale apparaît pour saisir le nom du fichier. L'extension `.html` est ajoutée automatiquement. La nouvelle page est créée dans le dossier `pages/` à partir du template `snippets/page.html`, dont les chemins relatifs sont automatiquement ajustés.

```
// Exemple : saisir "contact" crée pages/contact.html
// Exemple : saisir "services/consulting" crée pages/services/consulting.html
```

### Renommer une page

Clic droit sur une page ou bouton **Renommer** dans le menu contextuel. Une modale permet de saisir le nouveau nom. Le fichier HTML est renommé sur le disque et l'entrée du registre `pages.json` est mise à jour.

### Supprimer une page

Clic droit sur une page ou bouton **Supprimer**. Une modale de confirmation apparaît. La suppression entraîne :

- La suppression du fichier HTML du disque
- La suppression de l'entrée correspondante dans `pages.json`

Les pages en **lecture seule** (`readOnly`) ne peuvent pas être supprimées.

### Dupliquer une page

Crée une copie du fichier HTML avec un nouveau nom. Le contenu est dupliqué à l'identique, et une nouvelle entrée est ajoutée au registre avec les mêmes métadonnées (sauf le slug et le chemin, qui sont adaptés au nouveau nom).

## Panneau de métadonnées

Quand une page est sélectionnée (simple clic), un panneau de métadonnées s'affiche à droite. Il contient les champs suivants :

| Champ | Type | Description |
|-------|------|-------------|
| **Titre de la page** | Texte | Titre affiché de la page (balise `<title>`) |
| **Chemin du fichier** | Lecture seule | Chemin relatif du fichier HTML (ex : `blog/article.html`) |
| **Slug** | Texte | URL propre de la page (ex : `/blog/article`) |
| **Meta title** | Texte | Titre SEO (balise `<meta name="title">`). Surcharge le titre de la page pour les moteurs de recherche. |
| **Meta description** | Texte | Description SEO (balise `<meta name="description">`). Résumé affiché dans les résultats de recherche. |
| **Image à la une** | Fichier | Image principale de la page (Open Graph, partage social, aperçu). |
| **Statut** | Select | `published` (publiée) ou `draft` (brouillon). Les pages en brouillon ne sont pas accessibles publiquement. |
| **noindex** | Checkbox | Cochez pour ajouter `<meta name="robots" content="noindex">` et exclure la page des moteurs de recherche. |
| **Ordre** | Nombre | Position de la page dans l'arbre hiérarchique. Les pages sont triées par ordre croissant. |
| **Page parente** | Select | Sélectionnez une page parente parmi toutes les pages disponibles. Permet de réorganiser la hiérarchie manuellement. |
| **Code personnalisé `<head>`** | Textarea | Zone de texte extensible pour injecter du HTML personnalisé dans la balise `<head>` (CSS, scripts, balises meta supplémentaires). |
| **Code personnalisé `<body>`** | Textarea | Zone de texte extensible pour injecter du HTML personnalisé avant la balise `</body>` (scripts de tracking, widgets, etc.). |

## Pages en lecture seule

Certaines pages sont marquées comme `readOnly` dans le registre. Ces pages sont protégées et ne peuvent pas être :

- Supprimées
- Renommées

Les pages en lecture seule ont leurs fichiers et métadonnées structurelles protégés. Cela concerne typiquement les pages système comme `404.html`.

## Pages template

Les pages templates sont détectées automatiquement : une page située dans un sous-dossier dont le nom correspond à une page parente de premier niveau est marquée comme template. Par exemple, `blog/article.html` est un template car `blog.html` existe à la racine de `pages/`.

Les pages template apparaissent dans l'arbre avec un indicateur visuel distinct et ne sont pas publiées sur le site final. Elles ne peuvent pas être déplacées via le drag & drop.

## Registre `pages.json`

Le fichier `pages.json` est le registre central qui stocke toutes les métadonnées des pages du site. Les chemins (`path`) sont stockés **relativement au dossier `pages/`** (ex : `blog.html`, et non `pages/blog.html`). Le fichier réel sur le disque se trouve à `pages/blog.html`.

Le registre est synchronisé automatiquement avec le système de fichiers : si un fichier HTML est ajouté ou supprimé manuellement dans `pages/`, le registre est mis à jour au prochain chargement.

### Structure du registre

```json
{
  "pages": [
    {
      "title": "Accueil",
      "path": "index.html",
      "slug": "/",
      "metaTitle": "Mon Site — Accueil",
      "metaDescription": "Bienvenue sur notre site.",
      "featuredImage": "assets/images/hero.jpg",
      "status": "published",
      "noindex": false,
      "order": 1,
      "parent": null,
      "customHead": "",
      "customBody": "",
      "readOnly": false,
      "isTemplate": false
    },
    {
      "title": "Blog",
      "path": "blog.html",
      "slug": "/blog",
      "metaTitle": "Blog — Mon Site",
      "metaDescription": "Tous nos articles.",
      "featuredImage": "",
      "status": "published",
      "noindex": false,
      "order": 2,
      "parent": null,
      "customHead": "",
      "customBody": "",
      "readOnly": false,
      "isTemplate": false
    },
    {
      "title": "Article exemple",
      "path": "blog/article.html",
      "slug": "/blog/article",
      "metaTitle": "",
      "metaDescription": "",
      "featuredImage": "",
      "status": "draft",
      "noindex": false,
      "order": 1,
      "parent": "blog.html",
      "customHead": "",
      "customBody": "",
      "readOnly": false,
      "isTemplate": false
    }
  ]
}
```

### Propriétés du registre

| Propriété | Type | Description |
|-----------|------|-------------|
| `title` | String | Titre de la page |
| `path` | String | Chemin relatif du fichier HTML par rapport au dossier `pages/` |
| `slug` | String | URL propre |
| `metaTitle` | String | Titre SEO (override) |
| `metaDescription` | String | Description SEO (override) |
| `featuredImage` | String | Chemin de l'image à la une |
| `status` | String | `published` ou `draft` |
| `noindex` | Boolean | Exclure des moteurs de recherche |
| `order` | Number | Position dans l'arbre |
| `parent` | String\|null | Chemin de la page parente |
| `customHead` | String | Code HTML injecté dans `<head>` |
| `customBody` | String | Code HTML injecté avant `</body>` |
| `readOnly` | Boolean | Page protégée (non supprimable/renommable) |
| `isTemplate` | Boolean | Page servant de modèle |

## Module JavaScript

La logique du panneau Pages est gérée par le module `configurateur-pages.js`. Ce module est responsable de :

- L'affichage et la mise à jour de l'arbre hiérarchique
- Les opérations CRUD (création, renommage, suppression, duplication)
- La synchronisation du registre `pages.json` avec le système de fichiers
- L'affichage et la sauvegarde du panneau de métadonnées
- La gestion du drag & drop pour réorganiser l'arbre
- La détection automatique de la hiérarchie parent/enfant
- Le déplacement physique des fichiers sur le disque via `movePageToDisk()`
- Le calcul des nouveaux chemins lors d'un drag & drop via `computeNewPath()`

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Composants](components.md)
- [Wireframes](wireframes.md)
