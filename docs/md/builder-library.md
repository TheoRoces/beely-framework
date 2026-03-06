# Builder — Bibliothèque & Outils

La sidebar du builder est organisée en 3 sections :

- **Builder** — Accueil, Pages, Éditeur, Médiathèque, Configurateur
- **Outils** — Animations, Grilles
- **Bibliothèque** — Wireframes, Icônes, Composants, Éléments

Chaque panel offre un accès rapide aux ressources du framework. Tout fonctionne en copier-coller : tu cliques, ça copie le code HTML, tu le colles dans ta page.

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

## Composants

Affiche les composants réutilisables du framework (header, footer, card, etc.).

- Chaque composant est présenté avec son code HTML d'utilisation
- Clic → copie le code du composant dans le presse-papier + toast « Copié ! »
- Les composants utilisent le système de slots (`data-component`, `<template data-slot>`)

## Éléments

Catalogue d'éléments HTML interactifs du framework.

- Popup, accordéon, tabs, slider, tooltip
- Chaque élément est présenté avec un aperçu et son code HTML
- Clic → copie le snippet HTML + toast « Copié ! »

---

## Animations (Outil)

Configurateur visuel d'animations. Tu choisis tes options, tu vois le résultat en direct, et tu copies le code.

### Comment ça marche

1. Choisis un **type d'animation** : fade-in, fade-in-up, zoom-in, slide-in, etc.
2. Règle le **délai** (quand l'animation démarre) et la **durée** (combien de temps elle dure)
3. Clique sur **Rejouer** pour voir l'animation en aperçu
4. Copie le code généré avec le bouton **Copier** (en haut à droite ou en bas)

### Types disponibles

- Scroll : `fade-in`, `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`, `zoom-in`, `slide-in`
- Click : `pulse`, `shake`, `bounce`, `ripple`, `spin`, `jiggle`

Le code généré ressemble à ça :

```html
<div class="anim-fade-in-up" style="transition-delay: 0.2s;">
```

---

## Grilles (Outil)

Configurateur visuel de layouts CSS Grid et Bento. Crée des mises en page en colonnes sans écrire de CSS.

### Mode Grille flexible

Une grille simple avec un nombre de colonnes fixe :

1. Choisis le **nombre de colonnes** (1 à 6 colonnes)
2. Choisis l'**espacement** entre les colonnes (none, xs, sm, md, lg, xl)
3. Choisis l'**alignement vertical** (haut, centré, bas, étiré)
4. Ajuste le **nombre d'items** (1 à 12)
5. Clique sur un item dans l'aperçu pour modifier son **span** (combien de colonnes il occupe)
6. Copie le code HTML avec le bouton **Copier**

Le code généré ressemble à ça :

```html
<div class="grid" data-cols="3" data-gap="md">
  <div>Contenu</div>
  <div data-col-span="2">Contenu large</div>
  <div>Contenu</div>
</div>
```

### Mode Bento

Un layout asymétrique style « bento box » avec des cartes de tailles variées :

1. Choisis l'**espacement** et la **hauteur des rangées**
2. Choisis un **layout prédéfini** (sidebar, sidebar-left, feature) ou laisse libre
3. Clique sur chaque item pour choisir sa **taille** : normal, wide (2 cols), tall (2 rangées), large (2×2), full (toute la largeur)
4. Copie le code HTML

Le code généré ressemble à ça :

```html
<div class="bento" data-gap="md" data-row-height="lg">
  <div class="bento__item" data-size="large">Contenu</div>
  <div class="bento__item">Contenu</div>
  <div class="bento__item" data-size="wide">Contenu</div>
</div>
```

### Boutons d'action

- **Copier** (en haut à droite) → copie le code HTML généré
- **Réinitialiser** (en haut à droite) → remet toutes les options par défaut

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

### Picker médias (dans l'éditeur)

Quand tu modifies une image dans l'éditeur visuel, un bouton « Parcourir » ouvre un picker médias. C'est la même grille d'images, mais en mode sélection : clique sur une image pour la choisir.

---

## Module JS

`builder-library.js` gère tous les sous-panels de la bibliothèque et des outils.

- Exposé via `window.BuilderLibrary.refresh(panelId)`
- Le `panelId` correspond à :

| Panel ID | Section | Description |
|---|---|---|
| `lib-wireframes` | Bibliothèque | Wireframes (375+ sections) |
| `lib-icons` | Bibliothèque | Icônes Heroicons (324) |
| `lib-components` | Bibliothèque | Composants réutilisables |
| `lib-elements` | Bibliothèque | Éléments interactifs |
| `lib-animations` | Outils | Configurateur d'animations |
| `lib-grid` | Outils | Configurateur de grilles |
| `lib-media` | Builder | Médiathèque |

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
