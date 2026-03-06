# Architecture 3 Repos

Le système Beely est organisé en **3 dépôts indépendants** connectés par des **git submodules** et des **symlinks**. Cette architecture garantit la stabilité pour des centaines de projets clients.

---

## Sommaire

1. [Les 3 repos](#les-3-repos) — framework, builder, template
2. [Architecture d'un projet](#architecture-dun-projet) — structure des fichiers
3. [Fichiers symlinkés vs réels](#fichiers-symlinkés-vs-réels) — ce qui vient du framework vs du projet
4. [Installation d'un nouveau projet](#installation-dun-nouveau-projet) — cloner et initialiser
5. [Modifier le framework](#modifier-le-framework) — éditer, commiter et propager
6. [Modifier le builder](#modifier-le-builder) — éditer, commiter et propager
7. [Mettre à jour les submodules](#mettre-à-jour-les-submodules) — récupérer les dernières versions
8. [Déploiement](#déploiement) — rsync suit les symlinks
9. [Versioning](#versioning) — tags sémantiques
10. [Commandes utiles](#commandes-utiles) — référence rapide

---

## Les 3 repos

| Repo | Contenu | Usage |
|---|---|---|
| **beely-framework** | Core CSS/JS, API PHP, composants, wireframes, docs, assets | Submodule `.framework/` |
| **beely-builder** | Builder visuel, configurateur, serveur Python | Submodule `builder/` |
| **beely-template** | Starter projet client : pages, config, deploy, setup | Cloné pour chaque nouveau client |

Chaque repo est **versionné indépendamment** avec des tags sémantiques (v1.0.0, v1.1.0, etc.).

---

## Architecture d'un projet

Un projet client utilise les 2 submodules via `setup.sh` qui crée les symlinks :

```
mon-projet/
├── .framework/              ← submodule beely-framework
├── builder/                 ← submodule beely-builder
│   ├── index.html           ← Builder UI
│   ├── builder.css
│   ├── configurator.html    ← Configurateur intégré
│   ├── configurator-server.py ← Serveur de dev
│   └── js/                  ← 9 modules JS
├── core/                    ← symlink → .framework/core/
├── components/              ← symlink → .framework/components/
├── assets/                  ← symlink → .framework/assets/
├── api/                     ← symlink → .framework/api/
├── wireframes/              ← symlink → .framework/wireframes/
├── snippets/                ← symlink → .framework/snippets/
├── docs/                    ← symlink → .framework/docs/
├── base-index.html          ← symlink → .framework/base-index.html
├── robots.txt               ← symlink → .framework/robots.txt
├── generate-sitemap.js      ← symlink → .framework/generate-sitemap.js
├── config-site.js           ← fichier réel du projet
├── index.html               ← fichier réel du projet
├── .htaccess                ← fichier réel du projet
├── deploy.sh                ← fichier réel du projet
├── setup.sh                 ← fichier réel du projet
└── .gitmodules              ← référence les 2 submodules
```

Le HTML référence `core/css/tokens.css` comme d'habitude — le symlink redirige automatiquement vers `.framework/core/css/tokens.css`.

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
| `base-index.html` | Template HTML de base |
| `robots.txt` | Fichier robots.txt par défaut |
| `generate-sitemap.js` | Générateur de sitemap |

### Fichiers réels (projet)

Propres à chaque projet, versionnés dans le dépôt du projet.

| Chemin | Description |
|---|---|
| `config-site.js` | Configuration du site (nom, analytics, blog, mentions légales) |
| `index.html` | Page d'accueil |
| `blog.html`, `blog/` | Blog |
| `mentions-legales.html` | Mentions légales |
| `confidentialite.html` | Politique de confidentialité |
| `404.html` | Page d'erreur |
| `.htaccess` | Configuration Apache |
| `deploy.sh` | Script de déploiement |
| `setup.sh` | Script d'installation |
| `.env` | Variables d'environnement sensibles |
| `.deploy.env` | Configuration SSH |

### Submodule builder

Le builder est un submodule dans `builder/`. Il n'est **jamais déployé** (exclu via `.rsync-exclude`).

---

## Installation d'un nouveau projet

### Depuis beely-template

```bash
# 1. Cloner le template
git clone --recursive https://github.com/TheoRoces/beely-template.git mon-projet
cd mon-projet

# 2. Lancer le setup (crée les symlinks + copie les .env)
./setup.sh --init

# 3. Configurer le projet
# Remplir config-site.js, .env, .deploy.env
# Ou utiliser le configurateur :
python3 builder/configurator-server.py
# → http://localhost:5555/builder/configurator.html
```

### Cloner un projet existant

```bash
git clone --recursive https://github.com/org/mon-projet.git
cd mon-projet
./setup.sh
```

Si cloné sans `--recursive` :

```bash
./setup.sh --init
```

---

## Modifier le framework

```bash
# 1. Naviguer dans le submodule
cd .framework/

# 2. Éditer les fichiers (changements visibles immédiatement via les symlinks)

# 3. Commiter et pousser
git add -A && git commit -m "Description" && git push

# 4. Mettre à jour la référence dans le projet parent
cd ..
git add .framework
git commit -m "Update framework submodule"
```

---

## Modifier le builder

```bash
# 1. Naviguer dans le submodule
cd builder/

# 2. Éditer les fichiers

# 3. Commiter et pousser
git add -A && git commit -m "Description" && git push

# 4. Mettre à jour la référence dans le projet parent
cd ..
git add builder
git commit -m "Update builder submodule"
```

---

## Mettre à jour les submodules

### Mettre à jour le framework

```bash
git submodule update --remote .framework
git add .framework
git commit -m "Update framework to latest version"
```

### Mettre à jour le builder

```bash
git submodule update --remote builder
git add builder
git commit -m "Update builder to latest version"
```

### Mettre à jour les deux

```bash
git submodule update --remote
git add .framework builder
git commit -m "Update submodules to latest versions"
```

---

## Déploiement d'un projet client

Le script `deploy.sh` utilise **rsync** avec l'option `-L` (follow symlinks). Le serveur reçoit une structure à plat.

```bash
rsync -avzL --delete \
  --exclude-from='.rsync-exclude' \
  -e "ssh -p ${REMOTE_PORT}" \
  ./ user@serveur:/chemin/
```

**Points importants :**
- Le serveur ne contient **aucun symlink** — uniquement les fichiers réels
- `.framework/` et `builder/` ne sont **jamais déployés** (exclus via `.rsync-exclude`)
- L'option `-L` est **essentielle** — sans elle, rsync copierait les symlinks au lieu des fichiers

---

## Mise en production du framework

Le framework est aussi déployé sur son propre domaine pour la documentation en ligne (ex: `framework.beely.studio`).

### Déployer le framework

Depuis la racine du repo `beely-framework` :

```bash
./deploy.sh prod
```

Cela envoie la documentation, le core CSS/JS, les wireframes et tous les assets sur le serveur. Le site de doc est accessible publiquement.

### Workflow complet : modifier le framework et propager partout

Quand tu modifies le framework (ajout d'une feature, correction de bug, mise à jour de la doc), il faut **propager les changements à tous les projets** qui l'utilisent. Voici les étapes, dans l'ordre :

#### Étape 1 — Modifier et pousser le framework

```bash
# 1. Aller dans le repo du framework
cd /chemin/vers/beely-framework

# 2. Faire les modifications (CSS, JS, docs, etc.)

# 3. Commiter et pousser sur GitHub
git add -A
git commit -m "Description de la modification"
git push
```

#### Étape 2 — Déployer la doc du framework (optionnel)

Si tu as modifié la doc ou les fichiers visibles sur `framework.beely.studio` :

```bash
./deploy.sh prod
```

#### Étape 3 — Mettre à jour chaque projet client

Pour **chaque projet** qui utilise le framework comme submodule, il faut aller chercher la nouvelle version :

```bash
# 1. Aller dans le projet client
cd /chemin/vers/mon-projet

# 2. Mettre à jour le submodule framework
cd .framework
git pull        # récupère les derniers commits
cd ..

# 3. Enregistrer la mise à jour dans le projet
git add .framework
git commit -m "Update framework submodule"

# 4. (Optionnel) Pousser et déployer le projet client
git push
./deploy.sh prod
```

**En une seule commande** (raccourci) :

```bash
cd .framework && git pull && cd .. && git add .framework && git commit -m "Update framework submodule"
```

#### Étape 4 — Faire pareil pour le builder (si modifié)

Si le builder a aussi été modifié :

```bash
cd builder && git pull && cd .. && git add builder && git commit -m "Update builder submodule"
```

### Pourquoi c'est nécessaire ?

Un **submodule git** est un pointeur vers un commit précis d'un autre repo. Quand tu fais `git pull` dans le submodule, tu récupères les derniers commits. Mais le projet parent ne sait pas que le submodule a changé tant que tu ne fais pas `git add .framework && git commit`.

C'est voulu : chaque projet est **épinglé à une version précise** du framework. Ça évite qu'une mise à jour du framework casse un site en production.

### Récap visuel

```
Tu modifies le framework
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

Si tu as beaucoup de projets, tu peux créer un script qui boucle sur tous les projets :

```bash
#!/bin/bash
# update-all-projects.sh
PROJECTS=("test-projet" "client-a" "client-b")
BASE="/Users/theo/Sites"

for project in "${PROJECTS[@]}"; do
  echo "=== Mise à jour de $project ==="
  cd "$BASE/$project"

  # Framework
  cd .framework && git pull && cd ..
  git add .framework

  # Builder
  cd builder && git pull && cd ..
  git add builder

  git commit -m "Update submodules to latest"
  echo ""
done
```

---

## Versioning

Chaque repo utilise le **versioning sémantique** :

- **Patch** (v1.0.1) : corrections de bugs, pas de changement d'API
- **Minor** (v1.1.0) : nouvelles fonctionnalités rétrocompatibles
- **Major** (v2.0.0) : changements qui cassent la rétrocompatibilité

Pour épingler un projet à une version spécifique du framework :

```bash
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
| `git submodule update --remote builder` | Mettre à jour le builder |
| `git submodule status` | Voir les commits des submodules |
| `git submodule foreach git pull` | Mettre à jour tous les submodules |
| `cd .framework && git log --oneline -5` | Derniers commits du framework |
| `cd builder && git log --oneline -5` | Derniers commits du builder |
| `cd .framework && git pull && cd .. && git add .framework && git commit -m "Update framework"` | Raccourci MàJ framework |
| `cd builder && git pull && cd .. && git add builder && git commit -m "Update builder"` | Raccourci MàJ builder |

---

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Configurateur](configurateur.md)
- [Mise en production](production.md)
- [Builder — Vue d'ensemble](builder-overview.md)
