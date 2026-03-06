# Configurateur — Bibliothèque

Le Configurateur inclut deux panels de bibliothèque : **Icônes** et **Médiathèque**.

> **Note :** Les outils interactifs (créateur d'animations, créateur de grilles) sont désormais intégrés directement dans les pages de documentation : [Animations](animations.html#animation-creator) et [Grid](grid.html#grid-creator). Les wireframes, composants et éléments sont consultables dans les pages docs correspondantes.

---

## Icônes

324 icônes Heroicons disponibles en deux styles : **outline** (contour) et **solid** (rempli).

- Toggle **outline/solid** en haut du panel pour changer le style affiché
- Barre de recherche en temps réel pour trouver une icône par son nom (ex: « arrow », « user », « heart »)
- Grille d'icônes avec le nom affiché sous chaque icône
- Clic sur une icône → copie le code HTML dans le presse-papier + toast « Copié ! »

Le code copié ressemble à ça :

```html
<span data-icon="heart" data-icon-type="outline" data-icon-size="24"></span>
```

- Les SVG sont chargés depuis `/assets/icons/` et mis en cache (pas de rechargement inutile)
- Les icônes solid utilisent `currentColor` pour s'adapter au thème (clair/sombre)

---

## Médiathèque

Gestionnaire de fichiers images du site. Les images sont stockées dans `/assets/images/`.

### Upload

- **Drag & drop** : glisse des images directement dans la zone de dépôt
- **Bouton Uploader** : clique pour sélectionner des fichiers depuis ton ordinateur
- Les fichiers sont uploadés dans le **dossier courant** (racine par défaut)
- Formats supportés : JPG, JPEG, PNG, GIF, SVG, WebP, AVIF, ICO
- Taille max : 5 Mo par fichier

### Organisation en dossiers

Tu peux créer des dossiers pour ranger tes images :

- Clique sur **Dossier** dans la barre d'outils → entre un nom → le dossier est créé
- Les dossiers apparaissent en haut de la grille avec une icône de dossier
- Clique sur un dossier pour y naviguer
- Un **fil d'Ariane** (breadcrumb) en haut te permet de revenir en arrière : `Images / photos / portraits`
- Les images uploadées vont dans le dossier où tu te trouves

### Popup d'édition

Clique sur une image (pas sur un bouton) pour ouvrir le popup d'édition :

- **Aperçu** de l'image à gauche
- **Infos fichier** : type (JPEG, PNG…), poids (Ko/Mo), chemin complet
- **Nom du fichier** : modifiable pour renommer l'image
- **Texte alternatif (alt)** : description pour l'accessibilité (lecteurs d'écran, SEO)
- **Dossier** : sélecteur pour déplacer l'image dans un autre dossier
- Bouton **Enregistrer** pour appliquer les modifications

### Actions rapides

- **Copier** (sur chaque image) → copie le chemin du fichier (ex: `/assets/images/hero.jpg`) + toast « Copié ! »
- **Supprimer** (×) → supprime l'image après confirmation
- **Recherche** → filtre les images et dossiers par nom en temps réel

---

## Module JS

`builder-library.js` gère les panels icônes et médiathèque.

- Exposé via `window.BuilderLibrary.refresh(panelId)`
- Le `panelId` correspond à :

| Panel ID | Description |
|---|---|
| `lib-icons` | Icônes Heroicons (324) |
| `lib-media` | Médiathèque |

## API utilisées

| Endpoint | Description |
|---|---|
| `BuilderAPI.iconsList()` | Liste les icônes disponibles |
| `BuilderAPI.mediaList()` | Liste les images et dossiers |
| `BuilderAPI.mediaUpload(nom, base64, dossier)` | Upload une image |
| `BuilderAPI.mediaDelete(chemin)` | Supprime une image |
| `BuilderAPI.mediaRename(chemin, nouveauNom)` | Renomme une image |
| `BuilderAPI.mediaMkdir(nom, parent)` | Crée un dossier |
| `BuilderAPI.mediaMove(chemin, dossier)` | Déplace une image |
