# Builder — API Backend

Le builder utilise un serveur Python léger (`configurator-server.py`) comme backend. Ce serveur ne dépend d'aucune bibliothèque externe — il utilise uniquement la bibliothèque standard Python 3.

## Serveur Python

| Propriété | Valeur |
|---|---|
| Fichier | `configurator-server.py` (à la racine du projet) |
| Port | `5555` (par défaut) |
| Lancement | `python3 configurator-server.py` |
| Dépendances | Zéro — utilise `http.server`, `json`, `os`, `subprocess` de la stdlib |
| Fichiers statiques | Sert les fichiers statiques ET gère les endpoints POST |
| CORS | Activé pour le développement local |

## Endpoints — Configuration

| Endpoint | Méthode | Paramètres | Réponse |
|---|---|---|---|
| `/api/cfg-read` | POST | `{ file: "config-site.js" }` | `{ ok: true, content: "..." }` |
| `/api/cfg-save` | POST | `{ file: "config-site.js", content: "..." }` | `{ ok: true }` |

**Note :** Fichiers supportés : `config-site.js`, `.env`, `.deploy.env`

## Endpoints — Pages

| Endpoint | Méthode | Paramètres | Réponse |
|---|---|---|---|
| `/api/pages-list` | POST | `{}` | `{ ok: true, pages: [{ path, title, readOnly, isTemplate }] }` |
| `/api/page-read` | POST | `{ path: "index.html" }` | `{ ok: true, content: "<!DOCTYPE..." }` |
| `/api/page-write` | POST | `{ path: "index.html", content: "..." }` | `{ ok: true }` |
| `/api/page-create` | POST | `{ filename: "contact.html" }` | `{ ok: true, path: "contact.html" }` |
| `/api/page-delete` | POST | `{ path: "contact.html" }` | `{ ok: true }` |
| `/api/page-rename` | POST | `{ path: "old.html", newName: "new.html" }` | `{ ok: true, newPath: "new.html" }` |
| `/api/page-duplicate` | POST | `{ path: "index.html", newName: "copie.html" }` | `{ ok: true, newPath: "copie.html" }` |

## Endpoints — Contenu

| Endpoint | Méthode | Paramètres | Réponse |
|---|---|---|---|
| `/api/wireframes-catalog` | POST | `{}` | `{ ok: true, categories: [{ slug, name, count, files }] }` |
| `/api/wireframe-read` | POST | `{ category: "heros", file: "hero-01.html" }` | `{ ok: true, content: "..." }` |
| `/api/icons-list` | POST | `{}` | `{ ok: true, icons: [{ name, outline, solid }] }` |
| `/api/media-list` | POST | `{}` | `{ ok: true, files: ["image.jpg", ...] }` |
| `/api/media-upload` | POST | `{ filename: "photo.jpg", data: "base64..." }` | `{ ok: true, path: "assets/images/photo.jpg" }` |
| `/api/media-delete` | POST | `{ filename: "photo.jpg" }` | `{ ok: true }` |

## Endpoints — Registre

| Endpoint | Méthode | Paramètres | Réponse |
|---|---|---|---|
| `/api/registry-read` | POST | `{}` | `{ ok: true, registry: { version, homepage, deploys, pages } }` |
| `/api/registry-write` | POST | `{ registry: {...} }` | `{ ok: true }` |

## Endpoints — Déploiement

| Endpoint | Méthode | Paramètres | Réponse |
|---|---|---|---|
| `/api/deploy` | POST | `{ target: "prod" }` | `{ ok: true, output: "rsync output..." }` |
| `/api/git-push` | POST | `{ message: "commit message" }` | `{ ok: true, output: "git output..." }` |
| `/api/deploy-config` | POST | `{}` | `{ ok: true, prod: { configured, url }, preprod: { configured, url } }` |

## Structure du registre (pages.json)

Le fichier `pages.json` stocke la configuration de toutes les pages et l'état des déploiements :

```json
{
  "version": 1,
  "homepage": "index.html",
  "deploys": {
    "prod": { "lastDeploy": "2026-03-06T12:00:00Z", "status": "success" },
    "preprod": { "lastDeploy": null, "status": null },
    "git": { "lastPush": "2026-03-06T12:00:00Z", "status": "success" }
  },
  "pages": {
    "index.html": {
      "title": "Accueil",
      "slug": "index",
      "metaTitle": "",
      "metaDescription": "",
      "featuredImage": "",
      "status": "published",
      "noindex": false,
      "customHead": "",
      "customBody": "",
      "order": 0,
      "parent": null,
      "readOnly": false,
      "isTemplate": false,
      "createdAt": "2026-03-06T12:00:00Z",
      "updatedAt": "2026-03-06T12:00:00Z"
    }
  }
}
```

## Sécurité

- **Validation des chemins :** tous les paths sont vérifiés pour empêcher la traversée de répertoires (`../`)
- **Répertoires protégés (lecture seule) :** `core`, `wireframes`, `api`, `components`, `snippets`, `assets`, `builder`, `data`, `.git`, `.claude`, `.vscode`
- **Fichiers protégés en suppression/renommage :** `index.html`, `404.html`, `configurator.html`, `config-site.js`, `base-index.html`
- **Usage local uniquement :** le serveur ne tourne qu'en local (développement uniquement), il ne doit **JAMAIS** être exposé sur Internet
- **Fichiers .env :** les fichiers `.env` ne sont jamais servis en tant que fichiers statiques

## Client JavaScript

Le fichier `builder-api.js` encapsule tous les appels API. Toutes les méthodes retournent des **Promises**.

### Méthodes disponibles

| Méthode | Description |
|---|---|
| `BuilderAPI.cfgRead(file)` | Lire un fichier de configuration |
| `BuilderAPI.cfgSave(file, content)` | Sauvegarder un fichier de configuration |
| `BuilderAPI.pagesList()` | Lister toutes les pages |
| `BuilderAPI.pageRead(path)` | Lire le contenu d'une page |
| `BuilderAPI.pageWrite(path, content)` | Écrire le contenu d'une page |
| `BuilderAPI.pageCreate(filename)` | Créer une nouvelle page |
| `BuilderAPI.pageDelete(path)` | Supprimer une page |
| `BuilderAPI.pageRename(path, newName)` | Renommer une page |
| `BuilderAPI.pageDuplicate(path, newName)` | Dupliquer une page |
| `BuilderAPI.wireframesCatalog()` | Récupérer le catalogue des wireframes |
| `BuilderAPI.wireframeRead(category, file)` | Lire un wireframe spécifique |
| `BuilderAPI.iconsList()` | Lister toutes les icônes disponibles |
| `BuilderAPI.mediaList()` | Lister les fichiers média |
| `BuilderAPI.mediaUpload(filename, data)` | Uploader un fichier média (base64) |
| `BuilderAPI.mediaDelete(filename)` | Supprimer un fichier média |
| `BuilderAPI.registryRead()` | Lire le registre des pages |
| `BuilderAPI.registryWrite(registry)` | Écrire le registre des pages |
| `BuilderAPI.deploy(target)` | Déployer vers prod ou preprod |
| `BuilderAPI.gitPush(message)` | Commit et push Git |
| `BuilderAPI.deployConfig()` | Récupérer la config de déploiement |

### Exemple d'utilisation

```js
// Lire la liste des pages
const { pages } = await BuilderAPI.pagesList();

// Lire le contenu d'une page
const { content } = await BuilderAPI.pageRead('index.html');

// Sauvegarder une page modifiée
await BuilderAPI.pageWrite('index.html', newContent);

// Déployer en production
const { output } = await BuilderAPI.deploy('prod');
```

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Composants](components.md)
- [Paramètres](params.md)
