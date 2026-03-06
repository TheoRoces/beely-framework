# Configurateur — Vue d'ensemble

Le Configurateur Site System est un outil d'administration zero-dependency pour gérer les pages, la configuration du site, la médiathèque et les icônes.

## Introduction

Le **Configurateur** est une interface d'administration conçue pour gérer un projet Site System sans écrire de code manuellement. Il respecte la philosophie **zero-dependency** du framework : pas de npm, pas de build tools, juste du vanilla JS et un backend Python utilisant uniquement la bibliothèque standard.

Le Configurateur permet de :

- Gérer les pages du projet (création, suppression, métadonnées SEO, arborescence)
- Configurer les design tokens via le configurateur intégré
- Gérer la médiathèque (images, dossiers, upload)
- Parcourir les 324 icônes Heroicons avec recherche et copie rapide
- Déployer et versionner avec git

> **Note :** Les outils interactifs (créateur d'animations, créateur de grilles) sont désormais intégrés directement dans les pages de documentation correspondantes : [Animations](animations.html#animation-creator) et [Grid](grid.html#grid-creator).

## Lancement

Le Configurateur repose sur un serveur Python léger (`configurator-server.py`) qui tourne sur le port **5555**.

### 1. Démarrer le serveur

Depuis la racine du projet :

```bash
python3 builder/configurator-server.py
```

Le serveur démarre sur `http://localhost:5555`. Il utilise uniquement la bibliothèque standard Python (pas de pip install nécessaire).

### 2. Accéder au Configurateur

Ouvrez votre navigateur et naviguez vers :

```
http://localhost:5555/builder/
```

Le Configurateur se charge comme une SPA (Single Page Application) avec navigation par panels.

## Architecture

Le Configurateur suit une architecture client-serveur simple :

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Backend** | Python 3 (stdlib uniquement) | Serveur HTTP sur le port 5555, API REST pour gérer les fichiers, le registry et servir les assets |
| **Frontend** | Vanilla JS (7 modules) | Interface SPA, gestion d'état, navigation par panels |

Le backend Python sert de proxy fichier : il gère le registre des pages (`pages.json`), les opérations CRUD sur les pages et les médias, et fournit l'API de configuration. Le frontend gère toute l'interface utilisateur.

## Structure des fichiers

Le dossier `builder/` contient l'ensemble du code :

| Fichier | Description |
|---------|-------------|
| `builder/index.html` | Interface HTML principale |
| `builder/configurateur.css` | Styles (layout, panels, sidebar) |
| `builder/js/configurateur-app.js` | Shell principal : navigation entre panels, état global, initialisation |
| `builder/js/configurateur-api.js` | Client HTTP pour communiquer avec l'API backend Python |
| `builder/js/configurateur-pages.js` | Gestion des pages : arborescence, création, suppression, métadonnées |
| `builder/js/configurateur-library.js` | Bibliothèque : icônes et médiathèque |
| `builder/js/configurateur-config.js` | Configurateur de design tokens |
| `builder/js/configurateur-publish.js` | Déploiement en production/pré-production et gestion git |
| `builder/js/configurateur-modal.js` | Système de modales : confirm, prompt, alertes |

## Panels

Le Configurateur est organisé en 5 panels :

### Accueil (Dashboard)

Vue d'accueil. Affiche un résumé du projet : nombre de pages, accès rapides aux actions fréquentes (créer une page, ouvrir le configurateur, déployer).

### Pages

Gestionnaire de pages du projet. Permet de :

- Visualiser l'arborescence complète des pages (dossiers, sous-pages)
- Créer, renommer, dupliquer et supprimer des pages
- Modifier les métadonnées (titre, description SEO, slug, statut publié/brouillon)
- Réordonner les pages par glisser-déposer

### Configuration

Interface visuelle pour configurer tout le projet : nom du site, analytics, cookies, blog, mentions légales, déploiement. Les fichiers `config-site.js`, `.env` et `.deploy.env` sont générés automatiquement.

### Médiathèque

Gestionnaire d'images du site avec :

- Upload par drag & drop ou sélection de fichier
- Organisation en dossiers (création, navigation, breadcrumb)
- Popup d'édition (renommer, alt text, déplacer entre dossiers)
- Infos fichier (type, poids, chemin)
- Copie rapide du chemin d'une image

### Icônes

324 icônes Heroicons (outline + solid) avec recherche et copie rapide du code `data-icon`.

## Registry (`pages.json`)

Le fichier `pages.json` est le **registre central** de toutes les pages du projet. Il stocke :

- Les chemins des fichiers HTML
- Les métadonnées de chaque page (titre, description, slug, statut)
- L'arborescence et la hiérarchie des pages

Le registry est lu et écrit par le backend Python, et utilisé par le frontend pour afficher l'arborescence des pages.

## Déploiement

Le panel de publication permet de :

- Déployer en production ou pré-production via `deploy.sh`
- Gérer les commits git (voir les changements, commiter, pousser)
