# Beely Framework (Site System)

Framework zero-dependency pour créer des sites web et landing pages. HTML5, CSS3 (custom properties), Vanilla JS, PHP.

## Architecture

```
core/           → CSS & JS du framework (ne pas modifier directement)
  css/          → tokens.css, base.css, elements.css, animations.css, forms.css...
  js/           → site.js, components.js, animations.js, elements.js, icons.js...
components/     → Composants réutilisables (header, footer, docs-sidebar)
assets/icons/   → 324 icônes Heroicons (outline + solid)
wireframes/     → 375+ sections HTML prêtes à l'emploi
docs/           → Documentation interactive (14+ pages)
api/            → Endpoints PHP (consent RGPD, proxy Baserow, formulaires)
snippets/       → Fragments HTML prêts à copier-coller
```

## Fonctionnalités

- Design tokens CSS (couleurs, typographie, espacement)
- Système de composants avec slots (`data-component`, `<template data-slot>`)
- Animations scroll (IntersectionObserver) et click
- Formulaires multi-étapes avec validation et webhooks
- Blog dynamique connecté à Baserow (headless CMS)
- Gestion RGPD : bannière cookies, consentement granulaire, logs serveur
- Dark mode avec toggle persistant
- 324 icônes Heroicons inline
- Pages légales auto-générées depuis config
- URLs propres via Apache rewrite

## Utilisation

Ce repo est utilisé comme **submodule Git** (dossier `.framework/`) dans chaque projet client. Les fichiers `core/`, `assets/`, `components/` sont liés par symlinks à la racine du projet.

## Documentation en ligne

[framework.beely.studio](https://framework.beely.studio)

## Repos liés

- [beely-builder](https://github.com/TheoRoces/beely-builder) — Configurateur (interface d'administration)
- [beely-template](https://github.com/TheoRoces/beely-template) — Template de démarrage pour projets clients
