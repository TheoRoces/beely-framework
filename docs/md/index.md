# Site System

Boilerplate zero dependances pour créer des sites et landing pages en pur HTML/CSS/JS.

## Demarrage rapide

1. Copiez le dossier `site-system/` dans votre projet
2. Ouvrez `core/css/tokens.css` et modifiez les couleurs, polices, etc.
3. Configurez `config-site.js` (nom du site, favicon, analytics, domaines)
4. C'est pret ! Ouvrez `index.html` dans votre navigateur

## Par ou commencer ?

Choisissez votre parcours selon votre besoin :

### Site vitrine simple

Une landing page ou un site de quelques pages, sans blog ni formulaire.

1. [Démarrer un projet](getting-started.md#creer-un-nouveau-projet)
2. [Personnaliser les tokens](tokens.md#couleurs)
3. [Configurer header & footer](components.md#composants-inclus)
4. [Mettre en page avec Grid / Bento](grid.md#grille-simple)
5. [Copier-coller des sections](wireframes.md)
6. [Ajouter des animations](animations.md#animations-d-entree-scroll)
7. [Mettre en place les cookies](cookies.md#configuration) (obligatoire RGPD)
8. Configurer les pages legales via [LEGAL_CONFIG](getting-started.md#legal-config) (obligatoire)
9. [Mettre en production](production.md#deploiement-hostinger-apache)

### Site avec blog

Tout ce qui precede + un blog dynamique connecte a Baserow.

1. Parcours "Site vitrine" ci-dessus
2. [Configurer le blog](blog.md#connexion-a-baserow)
3. [Générer le sitemap](sitemap.md#utilisation)

### Site avec formulaires

Tout ce qui precede + formulaires multi-etapes avec envoi par email.

1. Parcours "Site vitrine" ci-dessus
2. [Créer des formulaires](forms.md#structure-de-base)
3. [Pré-remplissage par URL](params.md#pre-remplissage-des-champs)

## Architecture

```
site-system/
├── .htaccess                  ← URLs propres + securite (Apache)
├── .env                       ← Variables serveur (CORS, tokens API) — non versionne
├── .deploy.env                ← Config SSH de déploiement — non versionne
├── .rsync-exclude             ← Fichiers exclus du déploiement rsync
├── config-site.js             ← Configuration client (site, cookies, blog, legal)
├── deploy.sh                  ← Script de déploiement rsync/SSH
├── core/                      ← Framework (ne pas toucher)
│   ├── css/
│   │   ├── tokens.css         ← Charte client (couleurs, polices, etc.)
│   │   ├── base.css           ← Reset + utilitaires
│   │   ├── animations.css     ← Animations scroll + clic
│   │   ├── elements.css       ← Styles elements interactifs
│   │   ├── forms.css          ← Styles formulaires + toasts
│   │   ├── cookies.css        ← Bandeau cookies
│   │   ├── grid.css           ← Système de grille / bento
│   │   ├── icons.css          ← Styles icones SVG
│   │   └── blog.css           ← Styles blog (listing, article, lightbox)
│   └── js/
│       ├── components.js      ← Système de composants/slots
│       ├── animations.js      ← IntersectionObserver + clic
│       ├── elements.js        ← Popup, Tooltip, Accordion, Tabs, Slider
│       ├── forms.js           ← Formulaires multi-steps, validation, webhooks
│       ├── params.js          ← Persistance des UTMs + pré-remplissage
│       ├── cookies.js         ← Consentement cookies
│       ├── blog.js            ← Moteur blog Baserow
│       ├── darkmode.js        ← Toggle dark/light mode
│       ├── icons.js           ← Système d'icones SVG inline
│       └── site.js            ← Favicon + titre par defaut (depuis SITE_CONFIG)
├── components/                ← Composants (modifiables)
│   ├── header.js              ← Composant Header
│   ├── footer.js              ← Composant Footer
│   └── card.js                ← Composant Card
├── snippets/                  ← Fragments HTML copier-coller
├── assets/                    ← Images, icones, logos, polices
│   ├── images/
│   ├── icons/
│   ├── logos/
│   └── fonts/
├── api/                       ← Endpoints PHP (proxy Baserow, consentement, formulaires)
│   ├── baserow.php            ← Proxy API Baserow (CORS)
│   ├── consent.php            ← Enregistrement consentement RGPD
│   └── form.php               ← Proxy webhook formulaires
├── data/                      ← Donnees serveur (CSV consentements)
├── blog.html                  ← Page listing blog
├── blog/
│   └── article.html           ← Page article
├── docs/                      ← Cette documentation
└── index.html                 ← Page de demo
```

## Fonctionnalites

- **Démarrer un projet** — Créer un site, le déployer en production, adapter le boilerplate (avec ou sans blog). [Voir la doc](getting-started.md)
- **Design Tokens** — Configurez la charte graphique du client en 30 secondes dans un seul fichier. [Voir la doc](tokens.md)
- **Composants / Slots** — Système de composants réutilisables via slots : Header, Footer, Card, et composants custom. [Voir la doc](components.md)
- **Elements interactifs** — Popup, Tooltip, Accordion, Tabs, Slider (draggable, autoplay, multi-slides). [Voir la doc](elements.md)
- **Icones** — 324 icones Heroicons (outline + solid). Chargement SVG inline, animation au survol, copier-coller rapide. [Voir la doc](icons.md)
- **Grid / Bento** — Système de grille flexible et layouts bento asymetriques. CSS pur, responsive. [Voir la doc](grid.md)
- **Formulaires** — Multi-steps, logique conditionnelle, champs custom, validation, webhooks. [Voir la doc](forms.md)
- **Blog** — Blog dynamique connecte a Baserow. Listing, article, galerie lightbox, filtres. [Voir la doc](blog.md)
- **Cookies** — Bandeau RGPD avec gestion granulaire et injection auto des scripts analytics. [Voir la doc](cookies.md)
- **Animations** — Animations d'entree au scroll, de sortie, et au clic. Respect prefers-reduced-motion. [Voir la doc](animations.md)
- **Paramètres URL** — Persistance des UTMs, pré-remplissage des champs depuis l'URL. [Voir la doc](params.md)
- **Sitemap** — Generation automatique de sitemap.xml et robots.txt via Node.js. [Voir la doc](sitemap.md)
- **Wireframes** — 375 sections pretes a copier-coller : headers, heroes, services, portfolios, FAQs, et bien plus. [Voir la doc](wireframes.md)

## Conventions

- **BEM** : Block__Element--Modifier pour le nommage CSS
- **data-*** : Configuration via attributs HTML
- **Aucune dependance** : tout fonctionne en pur JS/CSS/HTML
- **file://** : fonctionne sans serveur web

## Prerequis

- **HTML/CSS** : connaitre les bases (balises, classes, proprietes CSS)
- **Editeur de code** : VSCode recommande (avec l'extension *Live Server*)
- **Navigateur moderne** : Chrome, Firefox, Safari ou Edge
- **Node.js** : uniquement pour la generation du sitemap (*optionnel*)
- **Serveur Apache + PHP** : uniquement pour la production (blog, formulaires, cookies)

## Glossaire

| Terme | Definition |
|-------|-----------|
| **Design tokens** | Variables CSS centralisees (`--color-primary`, `--text-lg`, etc.) qui définissent la charte graphique. Modifiez-les dans `tokens.css` pour changer tout le design. |
| **BEM** | Convention de nommage CSS : `.block__element--modifier`. Exemple : `.card__title--large`. |
| **Slots** | Mecanisme pour injecter du contenu dans un composant. On definit des `<template data-slot="nom">` dans le HTML. |
| **Composant** | Bloc HTML réutilisable (header, footer, card) défini en JS via `registerComponent()` et utilise via `data-component="nom"`. |
| **data-*** | Attributs HTML personnalises utilisés pour configurer le comportement des elements sans ecrire de JS. Ex : `data-popup-target`, `data-icon`. |
| **Wireframe** | Section HTML prete a l'emploi (hero, FAQ, portfolio...) a copier-coller dans vos pages. |
| **Webhook** | URL qui reçoit les donnees d'un formulaire par POST. Utilise avec Make.com pour envoyer des emails. |
| **Proxy PHP** | Script côté serveur (`api/*.php`) qui transmet les requetes a des services externes (Baserow, Make.com) en masquant les tokens d'API. |
| **Baserow** | CMS headless (base de donnees en ligne) utilise comme back-end pour le blog. Similaire a Airtable. |
| **RGPD / CNIL** | Reglementation europeenne/francaise sur la protection des donnees. Impose le consentement avant depot de cookies. |

## Inclure dans une page

```html
<!-- CSS (dans le <head>) -->
<link rel="stylesheet" href="core/css/tokens.css">
<link rel="stylesheet" href="core/css/base.css">
<link rel="stylesheet" href="core/css/animations.css">
<link rel="stylesheet" href="core/css/elements.css">
<link rel="stylesheet" href="core/css/forms.css">
<link rel="stylesheet" href="core/css/cookies.css">
<link rel="stylesheet" href="core/css/grid.css">
<link rel="stylesheet" href="core/css/icons.css">
<link rel="stylesheet" href="core/css/blog.css">

<!-- Dark mode (synchrone, avant les CSS) -->
<script src="core/js/darkmode.js"></script>

<!-- JS (dans le <head>) -->
<script src="core/js/components.js"></script>
<script src="components/header.js"></script>
<script src="components/footer.js"></script>
<script src="components/card.js"></script>

<!-- JS interactifs (defer) -->
<script src="core/js/animations.js" defer></script>
<script src="core/js/elements.js" defer></script>
<script src="core/js/forms.js" defer></script>
<script src="core/js/icons.js" defer></script>
<script src="core/js/params.js" defer></script>
<script src="config-site.js" defer></script>
<script src="core/js/blog.js" defer></script>
<script src="core/js/cookies.js" defer></script>
```
