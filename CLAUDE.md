# Site System - Directives projet

## Langue et encodage
- Toujours utiliser les caractères accentués français dans le code, les commentaires et les interfaces : é, è, ê, à, ù, ç, ô, î, etc.
- Ne jamais remplacer les accents par des versions ASCII (pas de "e" au lieu de "é", pas de unicode escapes comme `\u00e9`).
- Cela s'applique au HTML, JS, CSS, Python, commentaires, messages de toast, labels, placeholders, etc.

---

## Commandes Git rapides
Quand l'utilisateur dit l'un de ces mots/phrases, exécuter immédiatement l'action correspondante **sans demander confirmation** :
- **"push"** ou **"pousse"** : `git add -A && git commit -m "<message descriptif auto-généré>" && git push`
- **"commit"** : `git add -A && git commit -m "<message descriptif auto-généré>"`
- **"status"** ou **"état"** : `git status`
- **"log"** : `git log --oneline -10`
- **"diff"** : `git diff`

Pour les commits, toujours générer un message descriptif en anglais basé sur les fichiers modifiés.
Le remote GitHub est : `https://github.com/theoanode/site-system.git`

---

## Architecture des fichiers de configuration

### Fichiers sensibles (non commités, non déployés)
| Fichier | Contenu | Protégé par |
|---|---|---|
| `.env` | Tokens API (Baserow), CORS, webhook Make.com, email notification | `.gitignore` + `.rsync-exclude` + `.htaccess` |
| `.deploy.env` | Config SSH prod/preprod (host, port, user, path) | `.gitignore` + `.rsync-exclude` |

### Fichiers publics (commités)
| Fichier | Contenu |
|---|---|
| `.env.example` | Template documenté de `.env` (sans valeurs sensibles) |
| `.deploy.env.example` | Template documenté de `.deploy.env` (sans valeurs sensibles) |
| `config-site.js` | Config client : nom du site, analytics IDs, blog display, mentions légales |

### Règle de sécurité
- **Jamais** de token, mot de passe ou URL webhook dans `config-site.js` (fichier public côté client)
- Le token Baserow est dans `.env` → lu par `api/baserow.php` (proxy PHP)
- Le webhook Make.com est dans `.env` → lu par `api/form.php` (proxy PHP)
- `blog.js` utilise `proxyUrl: '/api/baserow.php'` en prod (token masqué côté serveur)

---

## Baserow API (Blog CMS)

### Authentification
- Email : `tools@beely.studio`
- Mot de passe : `wosqo1-raDfob-wupxat`
- API URL : `https://api.baserow.io`
- Pour obtenir un JWT token : `curl -s -X POST "https://api.baserow.io/api/user/token-auth/" -H "Content-Type: application/json" -d '{"email":"tools@beely.studio","password":"wosqo1-raDfob-wupxat"}'`
- Utiliser le `access_token` retourné comme header : `Authorization: JWT <token>`

### Commande "crée le blog"
Quand l'utilisateur dit **"crée le blog"** ou **"crée le blog pour [Nom du projet]"**, exécuter automatiquement :

1. **S'authentifier** à Baserow via l'API pour obtenir un JWT token
2. **Lister les workspaces** (`GET /api/workspaces/`) pour trouver ou choisir le workspace cible
3. **Créer une application Database** nommée "[Nom du projet] - Blog" dans le workspace
4. **Créer la table "Articles"** — Baserow génère automatiquement un champ primaire "Nom"
5. **Renommer le champ primaire "Nom"** en "title" (`PATCH /api/database/fields/{field_id}/` avec `{"name": "title"}`) — ce champ servira de titre d'article
6. **Créer les champs supplémentaires** (ne PAS créer de champ `title` séparé) :

| Champ | Type Baserow | Notes |
|---|---|---|
| `title` | *(champ primaire, renommé)* | **Titre de l'article — champ primaire Baserow** |
| `slug` | `text` | URL propre |
| `excerpt` | `long_text` | Résumé court |
| `content` | `long_text` | Corps HTML de l'article |
| `featured_img` | `file` | Image à la une |
| `date` | `date` | Date de publication |
| `author` | `text` | Nom de l'auteur |
| `read_time` | `number` | Temps de lecture en minutes |
| `categories` | `multiple_select` | Catégories (ex: Design, Marketing, Stratégie, Développement, SEO) |
| `taxonomies` | `multiple_select` | Tags secondaires (ex: Tendances, Guide, Tutoriel, Inspiration, Étude de cas) |
| `status` | `single_select` | Options : `published` (vert), `draft` (gris) |
| `meta_title` | `text` | Titre SEO (override) |
| `meta_description` | `long_text` | Description SEO (override) |
| `gallery_1` à `gallery_5` | `file` | Galeries d'images |

7. **Supprimer les champs par défaut** "Notes" et "Actif" créés automatiquement par Baserow
8. **Supprimer les rows vides** créées par défaut par Baserow
9. **Créer un Database Token** en lecture seule pour la table
10. **Insérer 3 articles de démo** avec statut `published`, catégories variées, contenu réaliste en français — le champ `title` (primaire) doit contenir le titre
11. **Mettre à jour `.env`** : renseigner `BASEROW_TOKEN` avec le token créé
12. **Mettre à jour `config-site.js`** : renseigner `BLOG_CONFIG.baserow.tableId` (laisser `token` vide, le proxy PHP l'utilise depuis `.env`)
13. **Confirmer** que le blog est prêt en affichant le récap (table ID, token, nombre d'articles)

### API Baserow - Endpoints utiles
- Lister les workspaces : `GET /api/workspaces/`
- Créer une app : `POST /api/applications/workspace/{workspace_id}/`
- Lister les tables : `GET /api/database/tables/database/{database_id}/`
- Créer une table : `POST /api/database/tables/database/{database_id}/`
- Créer/modifier un champ : `POST|PATCH /api/database/fields/table/{table_id}/`
- Lister les champs : `GET /api/database/fields/table/{table_id}/`
- Créer un row : `POST /api/database/rows/table/{table_id}/?user_field_names=true`
- Modifier un row : `PATCH /api/database/rows/table/{table_id}/{row_id}/?user_field_names=true`
- Supprimer un row : `DELETE /api/database/rows/table/{table_id}/{row_id}/`
- Créer un database token : `POST /api/database/tokens/`

---

## Formulaires — Proxy PHP + Make.com

### Architecture
```
Navigateur → POST /api/form.php → Make.com webhook → Envoi email
```

### Configuration
- L'URL webhook Make.com est dans `.env` (`FORM_WEBHOOK_URL`)
- L'email destinataire est dans `.env` (`FORM_NOTIFICATION_EMAIL`)
- Les formulaires HTML utilisent `data-form-webhook="/api/form.php"`
- Le proxy ajoute `_notification_email` et `_submitted_at` au payload avant de forwarder

### API Make.com — Authentification
- Credentials dans `.env` : `MAKE_API_KEY`, `MAKE_ZONE`, `MAKE_TEAM_ID`
- Base URL : `https://{MAKE_ZONE}/api/v2`
- Header : `Authorization: Token {MAKE_API_KEY}`

### Commande "crée le formulaire"
Quand l'utilisateur dit **"crée le formulaire"** ou **"crée le formulaire pour [Nom du projet]"**, exécuter automatiquement :

1. **Lire `.env`** pour récupérer `MAKE_API_KEY`, `MAKE_ZONE`, `MAKE_TEAM_ID`, `FORM_NOTIFICATION_EMAIL`
2. **Créer un webhook** via `POST /hooks` :
   - `name` : "[Nom du projet] - Formulaire contact"
   - `teamId` : depuis `.env`
   - `typeName` : `gateway-webhook`
   - `method` : false, `headers` : false, `stringify` : false
3. **Récupérer l'URL du webhook** depuis la réponse (`hook.url`)
4. **Créer le scénario** via `POST /scenarios?confirmed=true` avec blueprint :
   - Module 1 : `gateway:CustomWebHook` v1 → lié au hook créé
   - Module 2 : `email:ActionSendEmail` v7 → envoie un email avec les champs du formulaire
   - Scheduling : `{"type":"immediately"}`
   - **Blueprint email mapper** :
     ```json
     {
       "to": "{{1._notification_email}}",
       "subject": "Nouveau message — {{1.nom}}",
       "html": "<h2>Nouveau formulaire reçu</h2><table>...</table>"
     }
     ```
   - Le blueprint doit être passé **en string** (JSON stringifié), ainsi que le scheduling
5. **Activer le scénario** via `POST /scenarios/{id}/start`
6. **Mettre à jour `.env`** : renseigner `FORM_WEBHOOK_URL` avec l'URL du webhook
7. **Confirmer** en affichant le récap (scenario ID, webhook URL, email destinataire)

### API Make.com — Endpoints utiles
- Lister les scénarios : `GET /scenarios?teamId={id}`
- Créer un hook : `POST /hooks`
- Créer un scénario : `POST /scenarios?confirmed=true` (body : `blueprint` string, `teamId`, `scheduling` string)
- Activer : `POST /scenarios/{id}/start`
- Désactiver : `POST /scenarios/{id}/stop`
- Lister les hooks : `GET /hooks?teamId={id}`

### Blueprint — Format
Le blueprint est un JSON stringifié avec cette structure :
```json
{
  "name": "Nom du scénario",
  "flow": [
    {
      "id": 1,
      "module": "gateway:CustomWebHook",
      "version": 1,
      "parameters": { "hook": HOOK_ID, "maxResults": 1 },
      "mapper": {},
      "metadata": { "designer": { "x": 0, "y": 0 } }
    },
    {
      "id": 2,
      "module": "email:ActionSendEmail",
      "version": 7,
      "parameters": {},
      "mapper": { "to": "...", "subject": "...", "html": "..." },
      "metadata": { "designer": { "x": 300, "y": 0 } }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": { "roundtrips": 1, "maxErrors": 3, "autoCommit": true, "sequential": false }
  }
}
```

---

## Déploiement

### Configuration
Les infos SSH sont dans `.deploy.env` (copier depuis `.deploy.env.example`).
Variables : `PROD_HOST`, `PROD_PORT`, `PROD_USER`, `PROD_PATH`, `PROD_URL` (idem `PREPROD_*`).

### Commandes
- `./deploy.sh prod` — déployer en production
- `./deploy.sh preprod` — déployer en pré-production
- `./deploy.sh prod --dry-run` — simuler sans transférer

### Fichiers exclus du déploiement (`.rsync-exclude`)
`.git/`, `.gitignore`, `CLAUDE.md`, `.claude/`, `.env`, `.deploy.env`, `deploy.sh`, `.rsync-exclude`, `generate-sitemap.js`, `.DS_Store`, `Thumbs.db`
