# Architecture 3 Repos

> **⚠️ Section réservée au développeur du framework.** Si vous utilisez Site System pour créer un site, vous pouvez ignorer cette section.

Le système Beely est organisé en **3 dépôts indépendants** connectés par des **git submodules** et des **symlinks**. Cette architecture garantit la stabilité pour des centaines de projets clients.

---

## Sommaire

1. [Reprendre de zéro](#reprendre-de-zero) — retrouver les repos, recloner, reconfigurer
2. [Les 3 repos](#les-3-repos) — framework, configurateur, template
3. [Architecture d'un projet](#architecture-dun-projet) — structure des fichiers
4. [Fichiers symlinkés vs réels](#fichiers-symlinkés-vs-réels) — ce qui vient du framework vs du projet
5. [Installation d'un nouveau projet](#installation-dun-nouveau-projet) — cloner et initialiser
6. [Modifier le framework](#modifier-le-framework) — éditer, commiter et propager
7. [Modifier le Configurateur](#modifier-le-configurateur) — éditer, commiter et propager
8. [Mettre à jour les submodules](#mettre-à-jour-les-submodules) — récupérer les dernières versions
9. [Déploiement](#déploiement) — rsync suit les symlinks
10. [Mise en production du framework](#mise-en-production-du-framework) — propager les changements partout
11. [Quel repo modifier pour quoi ?](#quel-repo-modifier-pour-quoi) — guide rapide
12. [Versioning](#versioning) — tags sémantiques
13. [Commandes utiles](#commandes-utiles) — référence rapide

---

## Reprendre de zéro {#reprendre-de-zero}

Si vous avez perdu la main (nouveau Mac, réinstallation, longue absence), voici comment tout retrouver et recloner.

### Les 3 repos GitHub

| Repo | URL GitHub | Description |
|---|---|---|
| **beely-framework** | `https://github.com/TheoRoces/beely-framework` | Le framework : CSS, JS, composants, wireframes, docs, assets, API PHP |
| **beely-builder** | `https://github.com/TheoRoces/beely-builder` | Le Configurateur visuel : éditeur WYSIWYG, configurateur, serveur Python |
| **beely-template** | `https://github.com/TheoRoces/beely-template` | Le template de départ pour chaque nouveau projet client |

### Recloner l'environnement complet

```bash
# 💻 Terminal : Terminal.app (Mac) ou terminal VSCode
# 📂 Dossier : là où vous rangez vos sites (ex: ~/Sites/)

cd ~/Sites

# 1. Cloner le framework (pour le modifier ou le déployer)
git clone https://github.com/TheoRoces/beely-framework.git site-system-framework

# 2. Cloner le Configurateur (pour le modifier)
git clone https://github.com/TheoRoces/beely-builder.git beely-builder

# 3. Cloner le template (pour créer de nouveaux projets)
git clone --recursive https://github.com/TheoRoces/beely-template.git beely-template
```

### Recloner un projet client existant

```bash
# 💻 Terminal : Terminal.app ou terminal VSCode
# 📂 Dossier : ~/Sites/

cd ~/Sites
git clone --recursive https://github.com/votre-org/mon-projet.git
cd mon-projet
./setup.sh
```

L'option `--recursive` clone automatiquement les submodules (`.framework/` et `configurateur/`). Le script `setup.sh` crée les symlinks.

### Recréer les fichiers de config

Deux fichiers ne sont pas dans git (ils contiennent des secrets). Il faut les recréer :

**`.deploy.env`** (infos SSH pour le déploiement) :

```bash
# 📂 Dossier : la racine du projet

cp .deploy.env.example .deploy.env
```

Puis remplir les valeurs SSH. Pour retrouver les infos serveur :
- Connectez-vous à [Hostinger hPanel](https://hpanel.hostinger.com/)
- Allez dans **Avancé → Accès SSH**
- Notez l'IP, le port et le nom d'utilisateur

**`.env`** (tokens API, webhooks) :

```bash
# 📂 Dossier : la racine du projet

cp .env.example .env
```

Puis remplir les tokens (Baserow, Make.com, etc.).

### Le framework en ligne

La documentation et le framework sont déployés sur **https://framework.beely.studio**. Ce site est mis à jour via `./deploy.sh prod` depuis le repo `site-system-framework` (ou depuis n'importe quel projet client qui pointe vers ce domaine dans son `.deploy.env`).

---

## Les 3 repos

| Repo | Contenu | Usage |
|---|---|---|
| **beely-framework** | Core CSS/JS, API PHP, composants, wireframes, docs, assets | Submodule `.framework/` |
| **beely-builder** | Configurateur visuel, configurateur, serveur Python | Submodule `configurateur/` |
| **beely-template** | Starter projet client : pages, config, deploy, setup | Cloné pour chaque nouveau client |

Chaque repo est **versionné indépendamment** avec des tags sémantiques (v1.0.0, v1.1.0, etc.).

---

## Architecture d'un projet

Un projet client utilise les 2 submodules via `setup.sh` qui crée les symlinks :

```
mon-projet/
├── .framework/              ← submodule beely-framework
├── configurateur/           ← submodule beely-builder
│   ├── index.html           ← Configurateur UI
│   ├── configurateur.css
│   ├── configurator.html    ← Configurateur intégré
│   ├── configurator-server.py ← Serveur de dev
│   └── js/                  ← 9 modules JS
├── pages/                   ← pages du site
│   ├── index.html           ← page d'accueil
│   ├── blog.html            ← blog
│   ├── blog/article.html    ← template article
│   ├── base-index.html      ← symlink → ../.framework/base-index.html
│   ├── css/                 ← styles custom du projet
│   └── js/                  ← scripts custom du projet
├── core/                    ← symlink → .framework/core/
├── components/              ← symlink → .framework/components/
├── assets/                  ← symlink → .framework/assets/
├── api/                     ← symlink → .framework/api/
├── wireframes/              ← symlink → .framework/wireframes/
├── snippets/                ← symlink → .framework/snippets/
├── docs/                    ← symlink → .framework/docs/
├── robots.txt               ← symlink → .framework/robots.txt
├── generate-sitemap.js      ← symlink → .framework/generate-sitemap.js
├── config-site.js           ← fichier réel du projet
├── 404.html                 ← page d'erreur (racine)
├── .htaccess                ← fichier réel du projet
├── deploy.sh                ← fichier réel du projet
├── setup.sh                 ← fichier réel du projet
└── .gitmodules              ← référence les 2 submodules
```

Les pages utilisent des chemins relatifs (`../core/css/tokens.css`) — le `../` remonte d'un niveau depuis `pages/` vers la racine où les symlinks redirigent automatiquement vers `.framework/`.

---

## Fichiers symlinkés vs réels

### Fichiers symlinkés (framework)

Ces fichiers sont des symlinks vers `.framework/`. Les modifications se font dans le dépôt du framework.

| Chemin | Description |
|---|---|
| `core/` | CSS et JS du framework |
| `components/` | Composants réutilisables (header, footer, card…) |
| `assets/` | Icônes Heroicons, images par défaut |
| `api/` | Endpoints PHP (proxy Baserow, formulaire, consentement) |
| `wireframes/` | 375 sections HTML prêtes à l'emploi |
| `snippets/` | Fragments HTML copiables |
| `docs/` | Documentation interactive |
| `pages/base-index.html` | Template HTML de base |
| `robots.txt` | Fichier robots.txt par défaut |
| `generate-sitemap.js` | Générateur de sitemap |

### Fichiers réels (projet)

Propres à chaque projet, versionnés dans le dépôt du projet.

| Chemin | Description |
|---|---|
| `config-site.js` | Configuration du site (nom, analytics, blog, mentions légales) |
| `pages/` | Dossier contenant toutes les pages HTML du site |
| `pages/index.html` | Page d'accueil |
| `pages/blog.html` | Blog |
| `pages/blog/article.html` | Template article blog |
| `pages/css/` | Styles CSS personnalisés du projet |
| `pages/js/` | Scripts JS personnalisés du projet |
| `404.html` | Page d'erreur (à la racine pour Apache) |
| `.htaccess` | Configuration Apache (URLs propres, rewrites vers `pages/`) |
| `deploy.sh` | Script de déploiement |
| `setup.sh` | Script d'installation |
| `.env` | Variables d'environnement sensibles |
| `.deploy.env` | Configuration SSH |

### Submodule Configurateur

Le Configurateur est un submodule dans `configurateur/`. Il n'est **jamais déployé** (exclu via `.rsync-exclude`).

---

## Installation d'un nouveau projet

### Depuis beely-template

```bash
# 💻 Terminal : Terminal.app ou terminal VSCode
# 📂 Dossier : ~/Sites/ (votre dossier de projets)

# 1. Cloner le template
git clone --recursive https://github.com/TheoRoces/beely-template.git mon-projet
cd mon-projet

# 2. Lancer le setup (crée les symlinks + copie les .env)
./setup.sh --init

# 3. Configurer le projet
# Remplir config-site.js, .env, .deploy.env
# Ou utiliser le configurateur :
python3 configurateur/configurator-server.py
# → http://localhost:5555/configurateur/configurator.html
```

### Cloner un projet existant

```bash
# 💻 Terminal : Terminal.app ou terminal VSCode
# 📂 Dossier : ~/Sites/

git clone --recursive https://github.com/org/mon-projet.git
cd mon-projet
./setup.sh
```

Si cloné sans `--recursive` :

```bash
# 📂 Dossier : ~/Sites/mon-projet/ (la racine du projet)

./setup.sh --init
```

---

## Modifier le framework

```bash
# 💻 Terminal : terminal VSCode (Ctrl+`)
# 📂 Dossier : la racine d'un projet client (ex: ~/Sites/mon-projet/)

# 1. Naviguer dans le submodule
cd .framework/

# 2. Éditer les fichiers (changements visibles immédiatement via les symlinks)

# 3. Commiter et pousser
git add -A && git commit -m "Description" && git push

# 4. Revenir à la racine et mettre à jour la référence
cd ..
git add .framework
git commit -m "Update framework submodule"
```

---

## Modifier le Configurateur

```bash
# 💻 Terminal : terminal VSCode (Ctrl+`)
# 📂 Dossier : la racine d'un projet client (ex: ~/Sites/mon-projet/)

# 1. Naviguer dans le submodule
cd configurateur/

# 2. Éditer les fichiers

# 3. Commiter et pousser
git add -A && git commit -m "Description" && git push

# 4. Revenir à la racine et mettre à jour la référence
cd ..
git add configurateur
git commit -m "Update configurateur submodule"
```

---

## Mettre à jour les submodules

### Mettre à jour le framework

```bash
# 📂 Dossier : la racine d'un projet client

git submodule update --remote .framework
git add .framework
git commit -m "Update framework to latest version"
```

### Mettre à jour le Configurateur

```bash
# 📂 Dossier : la racine d'un projet client

git submodule update --remote configurateur
git add configurateur
git commit -m "Update configurateur to latest version"
```

### Mettre à jour les deux

```bash
# 📂 Dossier : la racine d'un projet client

git submodule update --remote
git add .framework configurateur
git commit -m "Update submodules to latest versions"
```

---

## Déploiement d'un projet client

Le script `deploy.sh` utilise **rsync** avec l'option `-L` (follow symlinks). Le serveur reçoit une structure à plat.

```bash
# 📂 Dossier : la racine du projet client

rsync -avzL --delete \
  --exclude-from='.rsync-exclude' \
  -e "ssh -p ${REMOTE_PORT}" \
  ./ user@serveur:/chemin/
```

**Points importants :**
- Le serveur ne contient **aucun symlink** — uniquement les fichiers réels
- `.framework/` et `configurateur/` ne sont **jamais déployés** (exclus via `.rsync-exclude`)
- L'option `-L` est **essentielle** — sans elle, rsync copierait les symlinks au lieu des fichiers

---

## Mise en production du framework

Le framework est aussi déployé sur son propre domaine : **https://framework.beely.studio**.

### Déployer le framework

```bash
# 💻 Terminal : Terminal.app ou terminal VSCode
# 📂 Dossier : ~/Sites/site-system-framework/ (ou ~/Sites/site-system/)
#              = le repo qui a un .deploy.env pointant vers framework.beely.studio

./deploy.sh prod
```

Cela envoie la documentation, le core CSS/JS, les wireframes et tous les assets sur le serveur. Le site de doc est accessible publiquement.

### Workflow complet : modifier le framework et propager partout

Quand vous modifiez le framework (ajout d'une feature, correction de bug, mise à jour de la doc), il faut **propager les changements à tous les projets** qui l'utilisent. Voici les étapes, dans l'ordre :

#### Étape 1 — Modifier et pousser le framework

```bash
# 💻 Terminal : terminal VSCode
# 📂 Dossier : le repo du framework (~/Sites/site-system-framework/)
#              OU le submodule d'un projet (~/Sites/mon-projet/.framework/)

# 1. Faire les modifications (CSS, JS, docs, etc.)

# 2. Commiter et pousser sur GitHub
git add -A
git commit -m "Description de la modification"
git push
```

#### Étape 2 — Déployer la doc du framework (optionnel)

Si vous avez modifié la doc ou les fichiers visibles sur `framework.beely.studio` :

```bash
# 📂 Dossier : le repo qui déploie le framework
#              (~/Sites/site-system/ ou ~/Sites/site-system-framework/)

./deploy.sh prod
```

#### Étape 3 — Mettre à jour chaque projet client

Pour **chaque projet** qui utilise le framework comme submodule, il faut aller chercher la nouvelle version :

```bash
# 💻 Terminal : terminal VSCode
# 📂 Dossier : la racine du projet client (ex: ~/Sites/mon-projet/)

# 1. Mettre à jour le submodule framework
cd .framework
git pull        # récupère les derniers commits
cd ..

# 2. Enregistrer la mise à jour dans le projet
git add .framework
git commit -m "Update framework submodule"

# 3. (Optionnel) Pousser et déployer le projet client
git push
./deploy.sh prod
```

**En une seule commande** (raccourci) :

```bash
# 📂 Dossier : la racine du projet client

cd .framework && git pull && cd .. && git add .framework && git commit -m "Update framework submodule"
```

#### Étape 4 — Faire pareil pour le Configurateur (si modifié)

Si le Configurateur a aussi été modifié :

```bash
# 📂 Dossier : la racine du projet client

cd configurateur && git pull && cd .. && git add configurateur && git commit -m "Update configurateur submodule"
```

### Pourquoi c'est nécessaire ?

Un **submodule git** est un pointeur vers un commit précis d'un autre repo. Quand vous faites `git pull` dans le submodule, vous récupérez les derniers commits. Mais le projet parent ne sait pas que le submodule a changé tant que vous ne faites pas `git add .framework && git commit`.

C'est voulu : chaque projet est **épinglé à une version précise** du framework. Ça évite qu'une mise à jour du framework casse un site en production.

### Récap visuel

```
Vous modifiez le framework
        ↓
git push (dans beely-framework)
        ↓
deploy.sh prod (framework.beely.studio)
        ↓
Pour CHAQUE projet client :
    cd .framework && git pull && cd ..
    git add .framework && git commit
    git push && ./deploy.sh prod
```

### Automatiser avec un script

Si vous avez beaucoup de projets, vous pouvez créer un script qui boucle sur tous les projets :

```bash
#!/bin/bash
# update-all-projects.sh
# 💻 Terminal : Terminal.app
# 📂 Dossier : n'importe où (le script navigue tout seul)

PROJECTS=("test-projet" "client-a" "client-b")
BASE="/Users/theo/Sites"

for project in "${PROJECTS[@]}"; do
  echo "=== Mise à jour de $project ==="
  cd "$BASE/$project"

  # Framework
  cd .framework && git pull && cd ..
  git add .framework

  # Configurateur
  cd configurateur && git pull && cd ..
  git add configurateur

  git commit -m "Update submodules to latest"
  echo ""
done
```

---

## Quel repo modifier pour quoi ? {#quel-repo-modifier-pour-quoi}

Guide rapide pour savoir où aller quand vous voulez modifier quelque chose :

| Je veux... | Repo à modifier | Dossier | Commande depuis un projet client |
|---|---|---|---|
| Changer le CSS du framework (tokens, base, grid, etc.) | beely-framework | `core/css/` | `cd .framework && ...` |
| Changer le JS du framework (composants, animations, etc.) | beely-framework | `core/js/` | `cd .framework && ...` |
| Ajouter/modifier un wireframe | beely-framework | `wireframes/` | `cd .framework && ...` |
| Modifier la documentation | beely-framework | `docs/` | `cd .framework && ...` |
| Ajouter/modifier un composant (header, footer, card) | beely-framework | `components/` | `cd .framework && ...` |
| Modifier les API PHP | beely-framework | `api/` | `cd .framework && ...` |
| Ajouter des icônes | beely-framework | `assets/icons/` | `cd .framework && ...` |
| Modifier le Configurateur visuel | beely-builder | `js/` | `cd configurateur && ...` |
| Modifier le configurateur | beely-builder | `configurator.html` | `cd configurateur && ...` |
| Modifier le serveur Python du Configurateur | beely-builder | `configurator-server.py` | `cd configurateur && ...` |
| Modifier une page de mon site | le projet lui-même | `pages/` | édition directe |
| Changer la config du site (nom, analytics, etc.) | le projet lui-même | `config-site.js` | édition directe |
| Configurer le déploiement SSH | le projet lui-même | `.deploy.env` | édition directe |
| Configurer les secrets (tokens API) | le projet lui-même | `.env` | édition directe |

**Règle simple** : si le fichier est un symlink → modifier dans le repo correspondant (framework ou configurateur). Si c'est un fichier réel → modifier directement dans le projet.

---

## Versioning

Chaque repo utilise le **versioning sémantique** :

- **Patch** (v1.0.1) : corrections de bugs, pas de changement d'API
- **Minor** (v1.1.0) : nouvelles fonctionnalités rétrocompatibles
- **Major** (v2.0.0) : changements qui cassent la rétrocompatibilité

Pour épingler un projet à une version spécifique du framework :

```bash
# 📂 Dossier : la racine du projet client

cd .framework
git checkout v1.2.0
cd ..
git add .framework
git commit -m "Pin framework to v1.2.0"
```

---

## Commandes utiles

| Commande | Description |
|---|---|
| `git clone --recursive <url>` | Cloner un projet avec ses submodules |
| `git submodule update --init --recursive` | Initialiser les submodules après un clone |
| `git submodule update --remote .framework` | Mettre à jour le framework |
| `git submodule update --remote configurateur` | Mettre à jour le Configurateur |
| `git submodule status` | Voir les commits des submodules |
| `git submodule foreach git pull` | Mettre à jour tous les submodules |
| `cd .framework && git log --oneline -5` | Derniers commits du framework |
| `cd configurateur && git log --oneline -5` | Derniers commits du Configurateur |
| `cd .framework && git pull && cd .. && git add .framework && git commit -m "Update framework"` | Raccourci MàJ framework |
| `cd configurateur && git pull && cd .. && git add configurateur && git commit -m "Update configurateur"` | Raccourci MàJ Configurateur |

---

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Configurateur](configurateur.md)
- [Mise en production](production.md)
- [Configurateur — Vue d'ensemble](configurateur.md)
