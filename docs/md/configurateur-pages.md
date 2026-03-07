# Configurateur — Gestion des pages

Le panneau **Pages** du Configurateur affiche un arbre organisé par dossiers de toutes les pages HTML du site. Il permet de créer, renommer, supprimer, dupliquer et organiser les pages dans des dossiers indépendants, ainsi que de gérer leurs métadonnées (SEO, statut, code personnalisé, etc.).

## Vue d'ensemble

Le panneau Pages est accessible depuis la barre latérale gauche du Configurateur. Il présente l'ensemble des pages du site sous forme d'arbre organisé par dossiers, reflétant la structure physique du projet. Chaque page est un fichier `.html` référencé dans le registre `pages.json`.

Sélectionnez une page (simple clic) pour afficher son panneau de métadonnées à droite.

## Arbre par dossiers

Les pages sont stockées dans le dossier `pages/` du projet. L'arbre reflète cette structure :

- `index.html` — page d'accueil (toujours en premier, verrouillée)
- `blog.html` — page à la racine
- `confidentialite.html` — page à la racine
- 📁 `blog/` — dossier indépendant
  - `blog/article.html` — page dans le dossier `blog/` (template)

Les **dossiers sont indépendants des pages** : le dossier `blog/` existe indépendamment de `blog.html`. On peut avoir un dossier `legal/` sans que `legal.html` n'existe, et vice versa. C'est le même principe que dans VSCode ou un explorateur de fichiers classique.

La hiérarchie se déduit uniquement du **chemin physique** des fichiers : `blog/article.html` est dans le dossier `blog/` car son chemin contient `blog/`.

### Drag & drop des pages

L'arbre supporte le drag & drop pour réorganiser les pages :

- **Glisser sur un dossier** : déplace la page dans ce dossier
- **Glisser sur une page (moitié haute)** : insérer avant la cible
- **Glisser sur une page (moitié basse)** : insérer après la cible

Si la cible est dans un dossier différent, le fichier HTML est **physiquement déplacé** sur le disque et ses chemins relatifs (`../core/`, `../config-site.js`, etc.) sont automatiquement ajustés selon la nouvelle profondeur.

La page d'accueil est **verrouillée** : elle ne peut être ni déplacée, ni imbriquée. Les pages templates sont également non-déplaçables.

### Drag & drop des dossiers

Les dossiers sont également draggables et peuvent être :

- **Glissés sur un autre dossier** : le dossier est imbriqué dans le dossier cible (ex : `blog/` glissé sur `services/` → `services/blog/`)
- **Glissés entre des éléments** : le dossier est déplacé à la même profondeur que la cible

Lors du déplacement d'un dossier, **toutes les pages et sous-dossiers qu'il contient sont déplacés avec lui**, et les chemins relatifs dans les fichiers HTML sont automatiquement ajustés selon la nouvelle profondeur.

**Garde-fou** : il est impossible de déplacer un dossier dans lui-même ou dans un de ses sous-dossiers.

### Dossiers

Les dossiers apparaissent dans l'arbre avec une icône de dossier et un chevron pour expand/collapse. Ils sont :

- **Cliquables** pour sélectionner et afficher le panneau de propriétés à droite (le chevron gère l'expand/collapse)
- **Draggables** : peuvent être déplacés par drag & drop dans l'arbre
- **Droppables** : glisser une page ou un dossier dessus le déplace dans le dossier
- **Imbriquables** : les sous-dossiers sont supportés (ex : `services/consulting/`)

Sélectionnez un dossier (simple clic) pour afficher son panneau de propriétés à droite. Ce panneau permet de :

1. **Modifier le nom d'affichage** — champ éditable, sauvegarde au blur ou Entrée
2. **Modifier le slug** — champ éditable avec vérification de doublon en temps réel. Le changement déplace physiquement les fichiers.
3. **Créer un sous-dossier** — bouton dans la toolbar du panneau
4. **Supprimer le dossier** — bouton dans la toolbar (désactivé si le dossier n'est pas vide)

Les dossiers vides ne sont **pas** automatiquement supprimés. Ils persistent jusqu'à suppression explicite.

## Opérations CRUD

### Créer une page

Cliquez sur le bouton **+ Nouvelle page** dans la toolbar. Une modale apparaît pour saisir le nom du fichier. L'extension `.html` est ajoutée automatiquement. La nouvelle page est créée dans le dossier `pages/` à partir du template `snippets/page.html`, dont les chemins relatifs sont automatiquement ajustés.

```
// Exemple : saisir "contact" crée pages/contact.html
// Exemple : saisir "services/consulting" crée pages/services/consulting.html
```

### Créer un dossier

Cliquez sur le bouton **dossier+** dans la toolbar à côté de "Nouvelle page". Une modale apparaît avec deux champs :

- **Nom du dossier** : nom d'affichage libre (accents, espaces, majuscules autorisés)
- **Slug** : chemin technique, **généré automatiquement** à partir du nom (ex : « Études de cas » → `etudes-de-cas`). Modifiable manuellement.

Une **vérification de doublon en temps réel** est effectuée sur le slug : si un dossier avec le même slug existe déjà, un message d'erreur s'affiche et le bouton Créer est désactivé.

Le dossier est créé physiquement dans `pages/` et enregistré dans `reg.folders`.

### Créer un sous-dossier

Clic droit sur un dossier existant → "Nouveau sous-dossier". La même modale avec champs nom + slug apparaît, avec vérification de doublon en temps réel dans le contexte du dossier parent.

### Nom et slug des dossiers

Chaque dossier possède deux identifiants :

- **Nom** (`name`) : nom d'affichage libre (accents, espaces, majuscules autorisés). Affiché dans l'arbre et les menus.
- **Slug** : chemin technique sur le disque (sans accents, espaces ni caractères spéciaux). Généré automatiquement à partir du nom lors de la création.

Lors de la création d'un dossier, le slug est automatiquement déduit du nom via slugification (ex : « Études de cas » → `etudes-de-cas`). L'utilisateur peut modifier le slug manuellement dans la modale. Les deux peuvent être modifiés indépendamment ensuite.

### Renommer un dossier

Le panneau de propriétés (clic sur le dossier) permet deux types de renommage :

1. **Nom d'affichage** : champ éditable en haut du panneau. Le changement est sauvegardé au blur ou avec Entrée. Aucun fichier n'est déplacé.
2. **Slug** : champ éditable avec vérification de doublon en temps réel. Le changement déplace physiquement le dossier et met à jour le registre. Cela entraîne :
   - Le déplacement physique du dossier sur le disque
   - La mise à jour de toutes les clés de pages et sous-dossiers dans le registre
   - L'ajustement automatique des chemins relatifs dans les fichiers HTML si la profondeur change

### Renommer une page

Modifiez le champ **Slug** dans le panneau de métadonnées pour changer l'URL de la page.

### Supprimer une page

Bouton **Supprimer** (icône poubelle) dans le panneau de métadonnées. Une modale de confirmation apparaît. La suppression entraîne :

- La suppression du fichier HTML du disque
- La suppression de l'entrée correspondante dans `pages.json`

Les pages protégées (`index.html`, `404.html`) ne peuvent pas être supprimées.

### Supprimer un dossier

Clic droit sur un dossier dans l'arbre → "Supprimer le dossier". Uniquement possible si le dossier est vide (pas de pages ni de sous-dossiers).

### Dupliquer une page

Crée une copie du fichier HTML avec un nouveau nom. Le contenu est dupliqué à l'identique, et une nouvelle entrée est ajoutée au registre avec les mêmes métadonnées (sauf le slug et le chemin, qui sont adaptés au nouveau nom).

### Déplacer une page

En plus du drag & drop, le panneau de métadonnées affiche un champ **Dossier** en lecture seule avec un bouton **Déplacer** permettant de saisir le nom du dossier cible (vide = racine).

## Panneau de métadonnées

Quand une page est sélectionnée (simple clic), un panneau de métadonnées s'affiche à droite. Il contient les champs suivants :

| Champ | Type | Description |
|-------|------|-------------|
| **Titre de la page** | Texte | Titre affiché de la page (balise `<title>`) |
| **Slug** | Texte | URL propre de la page (ex : `/blog/article`) |
| **Dossier** | Lecture seule | Dossier actuel de la page + bouton "Déplacer" |
| **Meta title** | Texte | Titre SEO (balise `<meta name="title">`). Surcharge le titre de la page pour les moteurs de recherche. |
| **Meta description** | Texte | Description SEO (balise `<meta name="description">`). Résumé affiché dans les résultats de recherche. |
| **Image à la une** | Fichier | Image principale de la page (Open Graph, partage social, aperçu). |
| **Statut** | Bouton | `published` (publiée) ou `draft` (brouillon). |
| **noindex** | Checkbox | Cochez pour ajouter `<meta name="robots" content="noindex">` et exclure la page des moteurs de recherche. |
| **Code personnalisé `<head>`** | Textarea | Zone de texte extensible pour injecter du HTML personnalisé dans la balise `<head>`. |
| **Code personnalisé `<body>`** | Textarea | Zone de texte extensible pour injecter du HTML personnalisé avant la balise `</body>`. |

## Pages en lecture seule

Certaines pages sont marquées comme `readOnly` dans le registre. Ces pages sont protégées et ne peuvent pas être supprimées ou renommées. Cela concerne typiquement les pages système comme `404.html`.

## Pages template

Les pages templates sont gérées via le registre `pages.json` (champ `isTemplate`). Par exemple, `blog/article.html` est un template servant de modèle pour les articles du blog.

Les pages template apparaissent dans l'arbre avec un indicateur visuel distinct (icône code `</>` et badge "Template"). Elles ne peuvent pas être déplacées via le drag & drop.

## Registre `pages.json`

Le fichier `pages.json` est le registre central qui stocke toutes les métadonnées des pages du site. Les chemins (`path`) sont stockés **relativement au dossier `pages/`** (ex : `blog.html`, et non `pages/blog.html`). Le fichier réel sur le disque se trouve à `pages/blog.html`.

Le registre est synchronisé automatiquement avec le système de fichiers : si un fichier HTML est ajouté ou supprimé manuellement dans `pages/`, le registre est mis à jour au prochain chargement.

### Structure du registre (V2)

```json
{
  "version": 2,
  "homepage": "index.html",
  "folders": {
    "blog": { "order": 0, "collapsed": false }
  },
  "pages": {
    "index.html": {
      "title": "Accueil",
      "slug": "index",
      "metaTitle": "",
      "metaDescription": "",
      "featuredImage": "",
      "status": "published",
      "noindex": false,
      "order": 0,
      "customHead": "",
      "customBody": "",
      "readOnly": false,
      "isTemplate": false
    },
    "blog/article.html": {
      "title": "Article exemple",
      "slug": "blog/article",
      "metaTitle": "",
      "metaDescription": "",
      "featuredImage": "",
      "status": "published",
      "noindex": false,
      "order": 0,
      "customHead": "",
      "customBody": "",
      "readOnly": false,
      "isTemplate": true
    }
  }
}
```

### Propriétés top-level

| Propriété | Type | Description |
|-----------|------|-------------|
| `version` | Number | Version du registre (actuellement `2`) |
| `homepage` | String | Chemin de la page d'accueil |
| `folders` | Object | Dossiers enregistrés (clé = chemin, valeur = `{ order, collapsed }`) |
| `pages` | Object | Pages enregistrées (clé = chemin relatif à `pages/`) |

### Propriétés d'une page

| Propriété | Type | Description |
|-----------|------|-------------|
| `title` | String | Titre de la page |
| `slug` | String | URL propre |
| `metaTitle` | String | Titre SEO (override) |
| `metaDescription` | String | Description SEO (override) |
| `featuredImage` | String | Chemin de l'image à la une |
| `status` | String | `published` ou `draft` |
| `noindex` | Boolean | Exclure des moteurs de recherche |
| `order` | Number | Position dans l'arbre (au sein de son dossier) |
| `customHead` | String | Code HTML injecté dans `<head>` |
| `customBody` | String | Code HTML injecté avant `</body>` |
| `readOnly` | Boolean | Page protégée (non supprimable/renommable) |
| `isTemplate` | Boolean | Page servant de modèle |

### Migration V1 → V2

Si le registre est en version 1 (ancien système avec champ `parent`), la migration est automatique au chargement :

- Les champs `parent` et `collapsed` sont supprimés des pages
- Les dossiers sont détectés depuis les chemins des pages existantes
- Les états `collapsed` des anciens parents sont reportés vers les dossiers correspondants
- La version est passée à 2

### Propriétés d'un dossier

| Propriété | Type | Description |
|-----------|------|-------------|
| `name` | String | Nom d'affichage du dossier (accents, espaces autorisés) |
| `order` | Number | Position dans l'arbre |
| `collapsed` | Boolean | État expand/collapse du dossier |

## Module JavaScript

La logique du panneau Pages est gérée par le module `configurateur-pages.js`. Ce module est responsable de :

- L'affichage et la mise à jour de l'arbre organisé par dossiers
- Les opérations CRUD (création, renommage, suppression, duplication) de pages et dossiers
- Le drag & drop de pages et de dossiers (réordonnement, déplacement, imbrication)
- Le déplacement physique des fichiers et dossiers sur le disque
- Le renommage de dossiers avec mise à jour en cascade du registre
- La création de sous-dossiers imbriqués
- La synchronisation du registre `pages.json` avec le système de fichiers
- L'affichage et la sauvegarde du panneau de métadonnées

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Composants](components.md)
- [Wireframes](wireframes.md)
