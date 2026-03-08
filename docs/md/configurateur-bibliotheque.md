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

- **Drag & drop** : glissez des images directement dans la zone de dépôt
- **Bouton Uploader** : cliquez pour sélectionner des fichiers depuis votre ordinateur
- Les fichiers sont uploadés dans le **dossier courant** (racine par défaut)
- Formats supportés : JPG, JPEG, PNG, GIF, SVG, WebP, AVIF, ICO
- Taille max : 5 Mo par fichier

### Organisation en dossiers

Vous pouvez créer des dossiers pour ranger vos images :

- Cliquez sur **Dossier** dans la barre d'outils → entrez un nom → le dossier est créé
- Les dossiers apparaissent en haut de la grille avec une icône de dossier
- Cliquez sur un dossier pour y naviguer
- Un **fil d'Ariane** (breadcrumb) en haut vous permet de revenir en arrière : `Images / photos / portraits`
- Les images uploadées vont dans le dossier où vous vous trouvez

### Popup d'édition

Cliquez sur une image (pas sur un bouton) pour ouvrir le popup d'édition :

- **Aperçu** de l'image à gauche
- **Infos fichier** : type (JPEG, PNG…), poids (Ko/Mo), chemin complet
- **Nom du fichier** : modifiable pour renommer l'image
- **Texte alternatif (alt)** : description pour l'accessibilité (lecteurs d'écran, SEO). Le alt text est sauvegardé dans `data/media-meta.json` et **propagé automatiquement** dans toutes les pages HTML qui utilisent l'image (l'attribut `alt=""` des balises `<img>` est mis à jour). Le champ est pré-rempli à l'ouverture de la popup si un alt text a déjà été renseigné.
- **Dossier** : sélecteur pour déplacer l'image dans un autre dossier
- **Suivi d'utilisation** : affiche le nombre de pages qui utilisent cette image, avec la liste de leurs chemins. Si l'image n'est utilisée nulle part, la mention « Non utilisée » est affichée.
- Bouton **Enregistrer** pour appliquer les modifications

### Mise à jour automatique des chemins

Lorsqu'une image est **déplacée** ou **renommée** via la popup d'édition, toutes les pages HTML qui la référencent sont **automatiquement mises à jour** avec le nouveau chemin. Un toast informatif indique combien de pages ont été mises à jour (ex : « Fichier mis à jour — 3 pages mises à jour »).

Cela évite les images cassées après une réorganisation de la médiathèque : vous pouvez renommer et déplacer vos fichiers librement sans vous soucier des références.

### Actions rapides

- **Copier** (sur chaque image) → copie le chemin du fichier (ex: `/assets/images/hero.jpg`) + toast « Copié ! »
- **Supprimer** (×) → supprime l'image après confirmation
- **Recherche** → filtre les images et dossiers par nom en temps réel

---

## Module JS

`configurateur-library.js` gère les panels icônes et médiathèque.

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
| `BuilderAPI.mediaRename(chemin, nouveauNom)` | Renomme une image (met à jour les références dans les pages) |
| `BuilderAPI.mediaMkdir(nom, parent)` | Crée un dossier |
| `BuilderAPI.mediaMove(chemin, dossier)` | Déplace une image (met à jour les références dans les pages) |
| `BuilderAPI.mediaUsage(chemin)` | Retourne la liste des pages utilisant cette image |
| `BuilderAPI.mediaSetAlt(chemin, altText)` | Définit le texte alternatif et le propage dans les pages |
| `BuilderAPI.mediaGetMeta(chemin)` | Récupère les métadonnées (alt text) depuis `media-meta.json` |
