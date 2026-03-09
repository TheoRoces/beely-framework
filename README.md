# Beely Framework (Site System)

Framework zero-dependency pour créer des sites web et landing pages. HTML5, CSS3 (custom properties), Vanilla JS, PHP.

## Architecture

```
core/           → CSS & JS du framework (ne pas modifier directement)
  css/          → tokens.css, base.css, elements.css, animations.css, forms.css...
  js/           → site.js, components.js, animations.js, elements.js, icons.js...
components/     → Composants réutilisables (header, footer, docs-sidebar)
configurateur/  → Configurateur visuel / site builder (ex beely-builder)
assets/icons/   → 324 icônes Heroicons (outline + solid)
api/            → Endpoints PHP (consent RGPD, proxy Baserow, formulaires)
snippets/       → Fragments HTML prêts à copier-coller
wireframes/     → 375+ sections HTML (gitignored — local + prod uniquement)
docs/           → Documentation interactive (gitignored — local + prod uniquement)
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

Ce repo est utilisé comme **unique submodule Git** (dossier `.framework/`) dans chaque projet client. Les fichiers `core/`, `assets/`, `components/`, `configurateur/` sont liés par symlinks à la racine du projet.

## Documentation en ligne

[framework.beely.studio](https://framework.beely.studio)

## Repos liés

- [beely-template](https://github.com/TheoRoces/beely-template) — Template de démarrage pour projets clients

> **Note :** Le configurateur (ex beely-builder) a été fusionné dans ce repo depuis la v1.1.0. Il n'existe plus en tant que repo/submodule séparé.
