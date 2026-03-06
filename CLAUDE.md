# Beely Framework - Directives

## Nature du repo
Ce repo est le **framework core** utilisé comme submodule (`.framework/`) dans les projets clients.
Il ne contient **aucun fichier projet-spécifique** (pas de config-site.js, deploy.sh, pages HTML client, etc.).

## Langue et encodage
- Toujours utiliser les caractères accentués français : é, è, ê, à, ù, ç, ô, î, etc.
- Ne jamais remplacer les accents par des versions ASCII.

---

## Commandes Git rapides
- **"commit"** : `git add -A && git commit -m "<message auto en anglais>"`
- **"push"** : `git add -A && git commit -m "<message auto>" && git push`
- **"status"** : `git status`
- **"log"** : `git log --oneline -10`

Remote principal : `git@github-theoroces:TheoRoces/beely-framework.git`

---

## Structure

```
beely-framework/
├── core/css/          # 10 fichiers CSS (tokens, reset, grid, components, forms, elements, animations, blog, cookies, icons)
├── core/js/           # 11 fichiers JS (site, components, grid, forms, elements, animations, blog, cookies, icons, darkmode, params)
├── api/               # PHP : baserow.php, consent.php, form.php, rate-limit.php
├── components/        # Header, Footer, Card, Docs Sidebar
├── snippets/          # Fragments HTML prêts à copier
├── wireframes/        # 375 sections (25 catégories × 15 variantes)
├── docs/              # 14 pages HTML + MD
├── assets/            # Icônes Heroicons (324), images
├── base-index.html    # Template HTML de base
├── .htaccess          # Config Apache + CSP + sécurité
├── robots.txt         # Fichier robots
├── generate-sitemap.js # Générateur de sitemap
└── CHANGELOG.md       # Historique des versions
```

## Règles
- **Versioning sémantique** : chaque release est taggée (v1.0.0, v1.1.0, etc.)
- **Ne jamais casser la rétrocompatibilité** sans incrémenter la version majeure
- **Tester les modifications** : vérifier que les projets clients existants ne cassent pas
- Les fichiers `core/` ne doivent être modifiés qu'avec confirmation explicite

## API PHP

### Baserow (blog CMS)
- Proxy sécurisé : seuls les endpoints `/api/database/` sont autorisés
- Token dans `.env` du projet client → lu par `api/baserow.php`
- Pas de redirect suivis (SSRF)

### Formulaires (Make.com)
- Proxy vers webhooks Make.com
- Webhook URL dans `.env` du projet client → lu par `api/form.php`
- Limite payload : 50KB

### Consentement RGPD
- `api/consent.php` : enregistre les preuves de consentement
- Rate limiting via `api/rate-limit.php`

## Documentation
Chaque modification doit être documentée dans `docs/` (HTML + MD).
Mettre à jour le `CHANGELOG.md` à chaque release.
