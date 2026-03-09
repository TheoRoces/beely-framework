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
├── configurateur/     # Configurateur visuel (ex beely-builder, fusionné dans le framework)
├── snippets/          # Fragments HTML prêts à copier
├── assets/            # Icônes Heroicons (324), images
├── base-index.html    # Template HTML de base
├── .htaccess          # Config Apache + CSP + sécurité
├── robots.txt         # Fichier robots
├── generate-sitemap.js # Générateur de sitemap
├── CHANGELOG.md       # Historique des versions
├── wireframes/        # ⚠ Gitignored — local + déployé en prod uniquement
└── docs/              # ⚠ Gitignored — local + déployé en prod uniquement
```

> **Note :** `docs/` et `wireframes/` sont dans le `.gitignore` du framework. Ils ne sont **pas sur GitHub** mais existent en local et sont déployés en production.

## Matrice de déploiement (fichiers → destinations)

| Fichier / Dossier | GitHub (git) | Serveur (rsync) | Notes |
|---|:---:|:---:|---|
| `core/`, `components/`, `assets/`, `api/`, `snippets/` | ✅ | ✅ | Framework core, déployé via symlinks |
| `configurateur/` | ✅ | ❌ | Outil local, exclu du déploiement |
| `docs/`, `wireframes/` | ❌ | ✅* | *Uniquement sur framework.beely.studio |
| `config-site.js` | ✅ | ✅ | Config client spécifique |
| `.env` | ❌ | ✅ | Secrets API côté serveur |
| `.env.example`, `.deploy.env.example` | ✅ | ❌ | Templates documentés |
| `.deploy.env` | ❌ | ❌ | Config SSH locale uniquement |
| `setup.sh`, `deploy.sh` | ✅ | ❌ | Scripts locaux |
| `.htaccess` | ✅ | ✅ | Config Apache |
| `CLAUDE.md`, `README.md` | ✅ | ❌ | Documentation dev |
| `sitemap.xml` | ❌ | ✅ | Généré avant chaque déploiement |
| `pages/`, `404.html` | ✅ | ✅ | Contenu du site |
| `data/`, `.vscode/` | ❌ | ❌ | Données locales / IDE |

> `.gitignore` = ce qui va sur GitHub. `.rsync-exclude` = ce qui va sur le serveur. Deux périmètres indépendants.

---

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
Les fichiers `docs/` (HTML + MD) sont maintenus localement et déployés en prod, mais ne sont pas sur GitHub (gitignored).
Mettre à jour le `CHANGELOG.md` à chaque release.
