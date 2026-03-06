# Builder — Vue d'ensemble

Le Site System Builder est un éditeur visuel WYSIWYG zero-dependency pour construire des pages Site System directement dans le navigateur.

## Introduction

Le **Site System Builder** est un éditeur visuel WYSIWYG conçu pour créer et modifier des pages Site System sans écrire de code manuellement. Il respecte la philosophie **zero-dependency** du framework : pas de npm, pas de build tools, juste du vanilla JS et un backend Python utilisant uniquement la bibliothèque standard.

Le builder permet de :

- Créer et gérer des pages depuis une interface visuelle
- Insérer des wireframes (375+ sections prêtes à l'emploi) par glisser-déposer
- Éditer le contenu en direct dans un canvas iframe
- Accéder à la bibliothèque d'icônes, composants, éléments et animations
- Configurer les design tokens via le configurateur intégré
- Déployer et versionner avec git

## Lancement

Le builder repose sur un serveur Python léger (`configurator-server.py`) qui tourne sur le port **5555**.

### 1. Démarrer le serveur

Depuis la racine du projet :

```bash
python3 configurator-server.py
```

Le serveur démarre sur `http://localhost:5555`. Il utilise uniquement la bibliothèque standard Python (pas de pip install nécessaire).

### 2. Accéder au builder

Ouvrez votre navigateur et naviguez vers :

```
http://localhost:5555/builder/
```

Le builder se charge comme une SPA (Single Page Application) avec navigation par panels.

## Architecture

Le builder suit une architecture client-serveur simple :

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Backend** | Python 3 (stdlib uniquement) | Serveur HTTP sur le port 5555, API REST pour lire/écrire les fichiers, gérer le registry et servir les assets |
| **Frontend** | Vanilla JS (9 modules) | Interface SPA avec canvas iframe, gestion d'état, navigation par panels |

Le backend Python sert de proxy fichier : il lit et écrit les fichiers HTML du projet, gère le registre des pages (`pages.json`), et fournit les wireframes disponibles. Le frontend gère toute l'interface utilisateur, le canvas d'édition, et communique avec le backend via des appels HTTP.

## Structure des fichiers

Le dossier `builder/` contient l'ensemble du code du builder :

| Fichier | Description |
|---------|-------------|
| `builder/index.html` | Interface HTML principale du builder |
| `builder/builder.css` | Styles du builder (layout, panels, canvas, sidebar) |
| `builder/js/builder-app.js` | Shell principal : navigation entre panels, gestion de l'état global, initialisation |
| `builder/js/builder-api.js` | Client HTTP pour communiquer avec l'API backend Python |
| `builder/js/builder-canvas.js` | Éditeur WYSIWYG : canvas iframe pour l'édition en direct, navigator DOM |
| `builder/js/builder-pages.js` | Gestion des pages : arborescence, création, suppression, métadonnées |
| `builder/js/builder-wireframes.js` | Catalogue de wireframes : parcours, prévisualisation et insertion de sections |
| `builder/js/builder-library.js` | Bibliothèque : icônes, composants, éléments, animations, médias |
| `builder/js/builder-configurator.js` | Intégration du configurateur de design tokens |
| `builder/js/builder-publish.js` | Déploiement en production/pré-production et gestion git |
| `builder/js/builder-modal.js` | Système de modales : confirm, prompt, alertes |

## Concepts clés

### Panels SPA

Le builder fonctionne comme une **Single Page Application**. La navigation se fait entre différents panels sans rechargement de page. Chaque panel correspond à une fonctionnalité majeure : dashboard, pages, éditeur, configurateur, et sous-panels de la bibliothèque.

### Registry (`pages.json`)

Le fichier `pages.json` est le **registre central** de toutes les pages du projet. Il stocke :

- Les chemins des fichiers HTML
- Les métadonnées de chaque page (titre, description, template utilisé)
- L'arborescence et la hiérarchie des pages

Le registry est lu et écrit par le backend Python, et utilisé par le frontend pour afficher l'arborescence des pages.

### Système de sections

Les pages sont structurées en **sections** délimitées par des commentaires HTML spéciaux :

```html
<!-- #section:hero-01 -->
<section class="hero">
  <!-- Contenu de la section -->
</section>
<!-- /section:hero-01 -->
```

Ces marqueurs permettent au builder d'identifier, réordonner, remplacer ou supprimer des sections individuelles sans affecter le reste de la page.

### Canvas iframe

L'édition visuelle se fait dans un **iframe** qui charge la page en cours de modification. Cette approche isole complètement les styles et scripts de la page éditée de ceux du builder lui-même. Le builder injecte des outils d'édition (sélection, déplacement, redimensionnement) dans l'iframe via le navigator DOM.

## Panels

Le builder est organisé en panels principaux, accessibles depuis la navigation latérale :

### Dashboard

Vue d'accueil du builder. Affiche un résumé du projet : nombre de pages, accès rapides aux actions fréquentes (créer une page, ouvrir le configurateur, déployer).

### Pages

Gestionnaire de pages du projet. Permet de :

- Visualiser l'arborescence complète des pages
- Créer, renommer et supprimer des pages
- Modifier les métadonnées (titre, description, slug)
- Ouvrir une page dans l'éditeur

### Éditeur (Canvas)

Cœur du builder. L'éditeur affiche la page dans un canvas iframe et propose :

- L'édition en direct du contenu (texte, images)
- Le navigator DOM pour sélectionner et manipuler les éléments
- L'insertion de wireframes depuis le catalogue
- La réorganisation des sections par glisser-déposer
- La prévisualisation responsive (desktop, tablette, mobile)

### Configurateur

Interface visuelle pour modifier les design tokens du projet (`tokens.css`) : couleurs, typographie, espacements, arrondis. Les modifications sont appliquées en temps réel dans le canvas.

### Bibliothèque

La bibliothèque regroupe plusieurs sous-panels :

- **Icônes** — les 324 Heroicons (outline + solid) avec recherche et copie rapide
- **Composants** — les composants enregistrés du projet (header, footer, card, etc.)
- **Éléments** — boutons, badges, formulaires et autres éléments de base
- **Animations** — les animations disponibles (fade, slide, scale, etc.)
- **Médias** — gestion des images et fichiers du projet

### Déploiement

Panel de publication et versioning. Permet de :

- Déployer en production ou pré-production via `deploy.sh`
- Gérer les commits git (voir les changements, commiter, pousser)
