# Builder — Bibliothèque

La bibliothèque regroupe 5 sous-panels accessibles depuis la sidebar du builder. Chaque panel offre un accès rapide aux ressources du framework.

## Icônes

324 icônes Heroicons disponibles en deux variantes : **outline** et **solid**.

- Toggle **outline/solid** en haut du panel pour changer la variante affichée
- Recherche en temps réel par nom d'icône
- Grille d'icônes avec le nom affiché sous chaque icône
- Clic sur une icône → copie le code HTML dans le presse-papier :

```html
<span data-icon="nom" data-icon-type="outline" data-icon-size="24"></span>
```

- Les SVG sont chargés depuis `/assets/icons/` et mis en cache côté client
- API utilisée : `BuilderAPI.iconsList()`

## Composants

Affiche les composants réutilisables du framework (header, footer, card, etc.).

- Chaque composant est présenté avec son code HTML d'utilisation
- Clic → copie le code du composant dans le presse-papier
- Les composants utilisent le système de slots (`data-component`, `<template data-slot>`)

## Éléments

Catalogue d'éléments HTML interactifs du framework.

- Boutons, cartes, badges, tooltips, popups, accordéons, tabs, etc.
- Chaque élément est présenté avec un aperçu et son code HTML
- Clic → copie le snippet HTML

## Animations

Configurateur d'animations scroll et click.

- Types disponibles : `fade-in`, `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`, `zoom-in`, `slide-in`, etc.
- Paramètres configurables : type d'animation, délai, durée
- Génère les attributs `data-*` à copier sur un élément HTML
- Classes CSS : `anim-fade-in-up`, `anim-click-ripple`, `anim-click-pulse`, etc.
- Clic → copie les attributs générés

## Médiathèque

Gestionnaire de fichiers images du site.

- Upload par drag & drop ou sélection de fichier
- Upload en base64 via l'API (`BuilderAPI.mediaUpload`)
- Grille d'images avec prévisualisation miniature
- Recherche par nom de fichier
- Suppression avec confirmation modale
- Intégration avec l'éditeur : le bouton « Parcourir » dans les propriétés d'une image ouvre un picker médias
- Le picker médias affiche la même grille et permet de sélectionner une image pour remplir le champ `src`
- Formats supportés : JPG, PNG, GIF, SVG, WebP
- Les fichiers sont stockés dans `/assets/images/` (ou `/data/media/`)

## Module JS

`builder-library.js` gère les 5 sous-panels.

- Exposé via `window.BuilderLibrary.refresh(panelId)`
- Le `panelId` correspond à :

| Panel ID | Description |
|---|---|
| `lib-wireframes` | Wireframes |
| `lib-icons` | Icônes |
| `lib-components` | Composants |
| `lib-elements` | Éléments |
| `lib-animations` | Animations |
| `lib-media` | Médiathèque |
