# Configurateur — Déploiement

Le Configurateur intègre un système de publication directement dans l'interface, accessible via le bouton "Publier" dans la barre supérieure.

## Dropdown de publication

Le dropdown de publication est situé dans la **topbar du Configurateur, à droite**. Il s'ouvre au clic sur le bouton **"Publier"**.

Une fois ouvert, il affiche **3 cartes de déploiement** :

- **Production** — déploiement vers le serveur de production
- **Pré-production** — déploiement vers le serveur de pré-production
- **Git** — commit et push vers le dépôt distant

Chaque carte affiche :

- **Statut** — un point vert (succès) ou rouge (erreur / jamais déployé)
- **Date du dernier déploiement** — au format lisible
- **URL du domaine** — lien cliquable vers le site déployé
- **Bouton d'action** — "Déployer" ou "Commit & Push"

## Déploiement Production / Pré-production

Le déploiement utilise le script `deploy.sh` qui effectue un **rsync via SSH** vers le serveur cible.

### Prérequis

Configurer le fichier `.deploy.env` avec les credentials SSH (voir la section [Configuration requise](#configuration-requise)).

### Fonctionnement

1. L'utilisateur clique sur **"Déployer"** sur la carte Production ou Pré-production
2. Le Configurateur exécute l'API `/api/deploy` avec le paramètre `target=prod` ou `target=preprod`
3. Le serveur Python exécute `./deploy.sh <target>` en subprocess
4. Le résultat (`stdout` + `stderr`) est affiché dans le [log de déploiement](#log-de-déploiement)
5. Le statut et la date sont sauvegardés dans le registre (`pages.json` → `deploys.prod` / `deploys.preprod`)

### Fichiers exclus du déploiement

Le fichier `.rsync-exclude` définit les fichiers et dossiers exclus du transfert :

| Exclusion | Raison |
|---|---|
| `.git/` | Historique Git, inutile en production |
| `.gitignore` | Fichier de configuration Git |
| `CLAUDE.md` | Directives Claude Code |
| `.claude/` | Configuration Claude Code |
| `.env` | Variables d'environnement sensibles |
| `.deploy.env` | Credentials SSH de déploiement |
| `deploy.sh` | Script de déploiement |
| `.rsync-exclude` | Fichier d'exclusion rsync |
| `generate-sitemap.js` | Outil CLI de génération de sitemap |
| `.DS_Store` | Fichiers système macOS |

## Git (commit & push)

La carte **Git** dans le dropdown de publication permet de versionner et pousser le code directement depuis le Configurateur.

### Interface

- **Champ de saisie** — pour écrire le message de commit
- **Bouton "Commit & Push"** — lance l'opération

### Fonctionnement

1. L'utilisateur saisit un message de commit dans le champ dédié
2. Clic sur **"Commit & Push"**
3. Le Configurateur exécute l'API `/api/git-push` avec le message
4. Le serveur exécute : `git add -A && git commit -m "message" && git push`
5. Le résultat est affiché dans le [log de déploiement](#log-de-déploiement)
6. Le statut et la date sont sauvegardés dans le registre (`deploys.git`)

## Log de déploiement

Une **zone de texte** située en bas du dropdown affiche la sortie du script de déploiement en temps réel.

- **Scrollable** — permet de consulter l'intégralité de la sortie
- **Fond sombre** — style terminal pour une meilleure lisibilité
- **Persistant** — le contenu reste visible pendant toute la session

Le log affiche à la fois la sortie standard (`stdout`) et les erreurs (`stderr`) du processus exécuté.

## Indicateurs de statut

Chaque carte de déploiement affiche un **indicateur visuel** de l'état du dernier déploiement :

| Indicateur | Signification |
|---|---|
| **Point vert** | Le dernier déploiement s'est terminé avec succès |
| **Point rouge** | Le dernier déploiement a échoué, ou l'environnement n'a jamais été déployé |

La **date du dernier déploiement** est affichée au format lisible :

- Format relatif pour les déploiements récents (ex : *il y a 2 heures*)
- Date complète pour les déploiements plus anciens (ex : *6 mars 2026 à 14:30*)

## Configuration requise

Le déploiement nécessite un fichier `.deploy.env` à la racine du projet. Créez-le depuis le template `.deploy.env.example`.

### Variables de production

| Variable | Description | Exemple |
|---|---|---|
| `PROD_HOST` | Adresse IP ou nom de domaine du serveur | `92.113.28.181` |
| `PROD_PORT` | Port SSH du serveur | `65002` |
| `PROD_USER` | Utilisateur SSH | `u937866772` |
| `PROD_PATH` | Chemin distant vers le répertoire public | `/home/u937866772/domains/.../public_html/` |
| `PROD_URL` | URL publique du site en production | `https://mon-site.com` |

La même structure s'applique pour la pré-production avec le préfixe `PREPROD_` (`PREPROD_HOST`, `PREPROD_PORT`, `PREPROD_USER`, `PREPROD_PATH`, `PREPROD_URL`).

### Clé SSH

Une clé SSH **ed25519 sans mot de passe** est recommandée pour permettre le déploiement automatisé sans intervention manuelle :

```bash
ssh-keygen -t ed25519 -C "deploy@mon-site.com" -f ~/.ssh/id_ed25519 -N ""
```

Ajoutez la clé publique au fichier `~/.ssh/authorized_keys` du serveur distant.

### Script deploy.sh

Le script `deploy.sh` doit être exécutable :

```bash
chmod +x deploy.sh
```

## Module JS

L'interface de déploiement est gérée par le module `builder-publish.js`. Il expose ses méthodes via l'objet global `window.BuilderPublish`.

### API utilisées

| Méthode | Description |
|---|---|
| `BuilderAPI.deploy(target)` | Lance le déploiement vers la cible spécifiée (`"prod"` ou `"preprod"`). Retourne une promesse avec le résultat du script. |
| `BuilderAPI.gitPush(message)` | Exécute un commit & push avec le message fourni. Retourne une promesse avec le résultat de la commande Git. |
| `BuilderAPI.deployConfig()` | Récupère la configuration de déploiement (URLs, statuts, dates des derniers déploiements). |

### Exemple d'utilisation

```js
// Déployer en production
BuilderAPI.deploy('prod').then(result => {
  console.log('Déploiement terminé :', result);
});

// Commit & push
BuilderAPI.gitPush('Mise à jour du header').then(result => {
  console.log('Push terminé :', result);
});

// Récupérer la config de déploiement
BuilderAPI.deployConfig().then(config => {
  console.log('Dernier déploiement prod :', config.deploys.prod);
});
```

### Module source

Le fichier source du module est `builder-publish.js`. Il est chargé par le Configurateur et initialisé automatiquement lorsque le dropdown de publication est ouvert.

## Voir aussi

- [Configurateur — Dashboard](configurateur-dashboard.md)
- [Configurateur — Pages](configurateur-pages.md)
- [Configurateur — Vue d'ensemble](configurateur.md)