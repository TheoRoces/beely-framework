# Changelog

Toutes les modifications notables de **beely-framework** sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionné selon [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2026-03-06

### Première version stable

**Core CSS** (10 fichiers) :
- `tokens.css` — Design tokens (couleurs, typo, espacements, breakpoints)
- `reset.css` — Reset CSS moderne
- `grid.css` — Système de grille responsive (12 colonnes)
- `components.css` — Styles des composants (cards, badges, tooltips…)
- `forms.css` — Formulaires multi-étapes avec validation
- `elements.css` — Éléments interactifs (tabs, accordions, modals…)
- `animations.css` — Animations scroll et micro-interactions
- `blog.css` — Styles du blog dynamique
- `cookies.css` — Bannière de consentement RGPD
- `icons.css` — Système d'icônes SVG inline

**Core JS** (11 fichiers) :
- `site.js` — Initialisation et utilitaires globaux
- `components.js` — Système de composants avec slots
- `grid.js` — Grille responsive dynamique
- `forms.js` — Validation et soumission de formulaires
- `elements.js` — Éléments interactifs (tabs, accordions, modals, tooltips)
- `animations.js` — Animations scroll (IntersectionObserver)
- `blog.js` — Blog dynamique connecté à Baserow
- `cookies.js` — Gestion du consentement RGPD/CNIL
- `icons.js` — Injection d'icônes Heroicons SVG
- `darkmode.js` — Toggle dark mode persistant
- `params.js` — Paramètres URL dynamiques

**API PHP** :
- `baserow.php` — Proxy sécurisé pour l'API Baserow (blog CMS)
- `consent.php` — Enregistrement des preuves de consentement RGPD
- `form.php` — Proxy formulaires vers webhooks Make.com
- `rate-limit.php` — Rate limiting côté serveur

**Composants** :
- Header, Footer, Card, Docs Sidebar

**Assets** :
- 324 icônes Heroicons (outline + solid)
- Images et médias de démonstration

**Wireframes** :
- 375 sections HTML prêtes à l'emploi (25 catégories × 15 variantes)

**Documentation** :
- 14 pages interactives HTML + Markdown

**Sécurité** :
- Content-Security-Policy header
- Protection SSRF sur le proxy Baserow
- Rate limiting sur les API
- Headers Apache sécurisés (.htaccess)
