# Configurateur

Interface visuelle pour configurer l'ensemble de votre site sans éditer manuellement les fichiers de configuration.

## Présentation

Le **Configurateur** est une page HTML autonome (`configurator.html`) qui génère automatiquement les 3 fichiers de configuration du framework :

| Fichier | Contenu | Commitable |
|---|---|---|
| `config-site.js` | Identité du site, analytics, blog, mentions légales | Oui |
| `.env` | Tokens API, CORS, webhooks (côté serveur) | Non |
| `.deploy.env` | Configuration SSH prod/preprod | Non |

Le configurateur est **local uniquement** — il n'est jamais déployé en production (exclu via `.rsync-exclude`).

## Lancement

### Avec le serveur Python (recommandé)

Le serveur Python permet l'écriture directe des fichiers de configuration sur le disque, sans manipulation manuelle.

```bash
python3 configurator-server.py
```

Puis ouvrir `http://localhost:5555/configurator.html` dans votre navigateur.

Le serveur :
- Sert les fichiers statiques du projet
- Lit automatiquement la configuration existante au chargement
- **Auto-save** : chaque modification est écrite sur disque après 500ms d'inactivité
- Fonctionne dans **tous les navigateurs** (Firefox, Chrome, Safari…)
- Zero-dependency : utilise uniquement la stdlib Python 3

> **Sécurité** : Le serveur n'autorise l'écriture que sur 4 fichiers : `config-site.js`, `.env`, `.deploy.env` et `.htpasswd`. Toute autre tentative retourne une erreur 403.

### Sans serveur (Live Server / file://)

Le configurateur fonctionne aussi sans le serveur Python, avec quelques différences :
- Les fichiers ne sont pas modifiés automatiquement sur le disque
- Utilisez les boutons **Télécharger** ou **Copier** pour récupérer le code généré
- Vos saisies sont sauvegardées dans le `localStorage` du navigateur

## Les 7 onglets

### Site
Configure l'objet `window.SITE_CONFIG` :
- **Nom du site** — utilisé comme titre par défaut si `<title>` est vide
- **Favicon** — chemin vers le favicon (`/favicon.ico`, `/assets/favicon.png`…)

### Cookies & Analytics
Configure l'objet `window.COOKIES_CONFIG` :
- **IDs des plateformes** — GA4, GTM, Clarity, Facebook Pixel, Hotjar, LinkedIn, TikTok
- **Bannière de consentement** — textes, durée du cookie, version, lien confidentialité
- **Endpoint consentement** — URL du script PHP de preuve RGPD

### Blog
Configure l'objet `window.BLOG_CONFIG` :
- **Connexion Baserow** — URL de l'instance, Table ID, token dev
- **Proxy PHP** — URL du proxy côté serveur
- **Affichage** — articles par page, format date, image par défaut, chemins

### Mentions légales
Configure l'objet `window.LEGAL_CONFIG` :
- **Éditeur** — entreprise, SIRET, responsable, adresse, contact
- **Hébergeur** — nom, adresse, site, contact
- **Développeur** — nom, site, adresse (optionnel)

### Serveur (.env)
Génère le fichier `.env` (non commitable, non déployé) :
- **Baserow** — token API et URL
- **CORS** — origine autorisée
- **Formulaires** — webhook Make.com et email de notification
- **Make.com** — clé API, zone, team ID

### Déploiement (.deploy.env)
Génère le fichier `.deploy.env` (non commitable, non déployé) :
- **Production** — URL, host, port, user, path SSH
- **Pré-production** — mêmes champs pour l'environnement de test

### Protection HTTP (htpasswd)
Protège le site par mot de passe (HTTP Basic Auth) — idéal pour un staging ou préprod :
- **Toggle** — active/désactive la protection en un clic
- **Identifiant** — nom d'utilisateur pour l'authentification
- **Mot de passe** — hashé en bcrypt côté serveur
- **Message d'invite** — texte affiché dans la popup du navigateur (défaut : « Accès restreint »)

Quand activé, le serveur Python génère `.htpasswd` et injecte le bloc `AuthType Basic` dans `.htaccess`. Quand désactivé, les deux sont nettoyés automatiquement.

> **Note** : cet onglet nécessite le serveur Python (pas de mode téléchargement).

## Fonctionnalités

### Auto-save (serveur Python)
Quand le serveur Python tourne, chaque modification d'un champ déclenche une écriture automatique du fichier concerné après 500ms. Un indicateur en haut de page confirme la connexion :
- 🟢 **Vert** — Serveur connecté, auto-save actif
- 🔴 **Rouge** — Serveur non détecté, mode fallback

### Téléchargement
Le bouton **Télécharger** permet de récupérer le fichier généré correspondant à l'onglet actif :
- Onglets Site / Cookies / Blog / Légal → `config-site.js`
- Onglet Serveur → `.env`
- Onglet Déploiement → `.deploy.env`

### Copier le code
Chaque bloc de prévisualisation dispose d'un bouton **Copier** qui copie le code généré dans le presse-papier.

### Importer une config existante
Le bouton **Importer** permet de charger un fichier existant (`config-site.js`, `.env`, ou `.deploy.env`) pour pré-remplir tous les champs. Avec le serveur Python, la configuration existante est chargée automatiquement au premier lancement.

### Persistance locale
Toutes les valeurs saisies sont sauvegardées dans le `localStorage` du navigateur. Elles sont restaurées automatiquement à chaque ouverture du configurateur.

### Prévisualisation en direct
Chaque onglet affiche un aperçu en temps réel du code qui sera généré, mis à jour à chaque frappe.

## Architecture technique

### Fichiers

| Fichier | Rôle | Déployé |
|---|---|---|
| `configurator.html` | Interface du configurateur (HTML + CSS + JS inline) | Non |
| `configurator-server.py` | Micro-serveur Python pour l'écriture fichiers | Non |

Les deux fichiers sont exclus du déploiement via `.rsync-exclude`.

### Serveur Python — API

Le serveur écoute sur le port **5555** et expose deux endpoints :

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cfg-read` | Lit le contenu d'un fichier autorisé |
| `POST` | `/api/cfg-save` | Écrit le contenu dans un fichier autorisé |

**Body JSON (read) :**
```json
{
  "file": "config-site.js"
}
```

**Body JSON (save) :**
```json
{
  "file": "config-site.js",
  "content": "// contenu du fichier..."
}
```

**Fichiers autorisés :** `config-site.js`, `.env`, `.deploy.env`, `.htpasswd`. Tout autre fichier retourne une erreur 403.

| `POST` | `/api/cfg-htpasswd` | Génère/supprime `.htpasswd` et met à jour `.htaccess` |

**Body JSON (htpasswd) :**
```json
{
  "enabled": true,
  "username": "admin",
  "password": "monmotdepasse",
  "realm": "Accès restreint"
}
```

### Flux de données

```
Navigateur (configurator.html)
    ↓ input (chaque frappe)
    ↓ state JS (objet en mémoire)
    ↓ localStorage (persistance)
    ↓ générateur (code JS / env)
    ↓ prévisualisation (mise à jour live)
    ↓ POST /api/cfg-save (débouncé 500ms)
    ↓
Fichier sur disque (config-site.js / .env / .deploy.env)
```

## Guide rapide

1. Lancer le serveur : `python3 configurator-server.py`
2. Ouvrir `http://localhost:5555/configurator.html`
3. Remplir les champs dans chaque onglet
4. Les fichiers sont automatiquement écrits sur le disque
5. Arrêter le serveur avec `Ctrl+C`

> **Astuce** : Si vous n'avez pas Python 3, vous pouvez toujours utiliser le configurateur via Live Server — les boutons Télécharger et Copier fonctionnent sans le serveur.
