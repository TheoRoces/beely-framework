# Architecture Submodule

Le framework Site System est une source de vérité unique partagée entre tous les projets via **git submodule** et **symlinks**. Cette architecture garantit que chaque projet utilise toujours la dernière version du framework sans duplication de code.

---

## Sommaire

1. [Concept](#concept) — pourquoi un submodule
2. [Architecture](#architecture) — framework dans `.framework/` + symlinks
3. [Fichiers symlinkés vs réels](#fichiers-symlinkés-vs-réels) — ce qui vient du framework vs ce qui est propre au projet
4. [Installation](#installation) — cloner et initialiser un projet
5. [Modifier le framework](#modifier-le-framework) — éditer, commiter et propager
6. [Mettre à jour le framework](#mettre-à-jour-le-framework) — récupérer les dernières modifications
7. [Ajouter un nouveau fichier](#ajouter-un-nouveau-fichier-au-framework) — étendre le framework
8. [Déploiement](#déploiement) — rsync suit les symlinks
9. [Commandes utiles](#commandes-utiles) — référence rapide git submodule

---

## Concept

Le framework Site System est conçu comme une **source de vérité unique** (single source of truth). Plutôt que de copier les fichiers du framework dans chaque projet, on utilise un **git submodule** qui pointe vers le dépôt du framework.

Les avantages de cette approche :

- **Zéro duplication** — le code du framework n'existe qu'à un seul endroit
- **Mises à jour centralisées** — une correction dans le framework profite à tous les projets
- **Versioning indépendant** — chaque projet peut être à une version différente du framework
- **Séparation claire** — les fichiers du framework et ceux du projet sont bien distincts
- **Transparence** — grâce aux symlinks, les chemins HTML restent identiques (ex: `core/css/tokens.css`)

---

## Architecture

Le framework vit dans le dossier `.framework/` à la racine du projet. Ce dossier est un **git submodule** qui pointe vers le dépôt GitHub du framework.

Des **symlinks** (liens symboliques) sont créés à la racine du projet pour pointer vers les dossiers et fichiers du framework. Ainsi, les chemins relatifs utilisés dans le HTML restent identiques :

```
mon-projet/
├── .framework/              ← git submodule (dépôt du framework)
├── core/                    ← symlink → .framework/core/
├── components/              ← symlink → .framework/components/
├── assets/                  ← symlink → .framework/assets/
├── api/                     ← symlink → .framework/api/
├── wireframes/              ← symlink → .framework/wireframes/
├── snippets/                ← symlink → .framework/snippets/
├── docs/                    ← symlink → .framework/docs/
├── base-html.html           ← symlink → .framework/base-html.html
├── base-index.html          ← symlink → .framework/base-index.html
├── robots.txt               ← symlink → .framework/robots.txt
├── generate-sitemap.js      ← symlink → .framework/generate-sitemap.js
├── config-site.js           ← fichier réel du projet
├── index.html               ← fichier réel du projet
├── .htaccess                ← fichier réel du projet
└── deploy.sh                ← fichier réel du projet
```

Le HTML référence `core/css/tokens.css` comme d'habitude — le symlink redirige automatiquement vers `.framework/core/css/tokens.css`. Aucun changement n'est nécessaire dans le code HTML.

---

## Fichiers symlinkés vs réels

### Fichiers symlinkés (framework)

Ces fichiers et dossiers sont des symlinks vers `.framework/`. Ils ne doivent **jamais être modifiés directement** dans le projet — les modifications se font dans le dépôt du framework.

| Chemin | Description |
|---|---|
| `core/` | CSS et JS du framework (tokens, base, animations, éléments, etc.) |
| `components/` | Composants réutilisables (header, footer, card, sidebar, etc.) |
| `assets/` | Icônes Heroicons, images par défaut, favicons |
| `api/` | Endpoints PHP (proxy Baserow, formulaire, consentement RGPD) |
| `wireframes/` | 375+ sections HTML prêtes à l'emploi |
| `snippets/` | Fragments HTML copiables |
| `docs/` | Documentation interactive du framework |
| `base-html.html` | Template HTML de base (page vierge) |
| `base-index.html` | Template de page d'accueil avec sections pré-intégrées |
| `robots.txt` | Fichier robots.txt par défaut |
| `generate-sitemap.js` | Script Node.js de génération du sitemap |

### Fichiers réels (projet)

Ces fichiers sont propres à chaque projet et ne sont **pas partagés** entre projets. Ils sont versionnés dans le dépôt du projet.

| Chemin | Description |
|---|---|
| `config-site.js` | Configuration du site (nom, analytics, blog, mentions légales) |
| `index.html` | Page d'accueil du projet |
| `blog.html` | Page listing du blog |
| `blog/` | Dossier des articles de blog |
| `mentions-legales.html` | Page mentions légales |
| `confidentialite.html` | Page politique de confidentialité |
| `404.html` | Page d'erreur 404 |
| `data/` | Données spécifiques au projet |
| `sitemap.xml` | Sitemap généré pour le projet |
| `.htaccess` | Configuration Apache du projet |
| `deploy.sh` | Script de déploiement |
| `CLAUDE.md` | Directives Claude Code du projet |
| `.env` | Variables d'environnement sensibles |
| `.deploy.env` | Configuration SSH de déploiement |
| `builder/` | Dossier du Builder (si utilisé) |
| `configurator.html` | Configurateur de design tokens |
| `configurator-server.py` | Serveur Python pour le configurateur |
| `pages.json` | Registre des pages du Builder |

---

## Installation

Pour cloner un projet qui utilise le submodule framework :

### 1. Cloner avec le submodule

```bash
git clone --recursive https://github.com/votre-org/mon-projet.git
cd mon-projet
```

L'option `--recursive` clone automatiquement le submodule `.framework/` en même temps que le projet.

### 2. Exécuter le script d'installation

```bash
./setup.sh
```

Le script `setup.sh` crée tous les symlinks nécessaires à la racine du projet. Il vérifie que le submodule est bien initialisé et affiche un récapitulatif des liens créés.

### Si le submodule n'a pas été cloné

Si vous avez cloné sans `--recursive`, initialisez le submodule manuellement :

```bash
git submodule init
git submodule update
```

Puis lancez `./setup.sh` pour créer les symlinks.

---

## Modifier le framework

Pour apporter des modifications au framework (corrections, nouvelles fonctionnalités, nouveaux wireframes) :

### 1. Naviguer dans le submodule

```bash
cd .framework/
```

### 2. Éditer les fichiers

Modifiez les fichiers normalement. Grâce aux symlinks, les changements sont **immédiatement visibles** dans le projet parent — pas besoin de copier ou synchroniser quoi que ce soit.

### 3. Commiter et pousser

```bash
git add -A
git commit -m "Description de la modification"
git push
```

### 4. Mettre à jour la référence dans le projet parent

De retour à la racine du projet, mettez à jour la référence du submodule :

```bash
cd ..
git add .framework
git commit -m "Update framework submodule"
git push
```

Cela enregistre le nouveau commit du framework dans le projet parent.

---

## Mettre à jour le framework

Pour récupérer les dernières modifications du framework dans votre projet :

```bash
git submodule update --remote .framework
```

Cette commande met à jour le submodule vers le dernier commit de la branche `main` du framework. Les symlinks continuent de fonctionner sans intervention — ils pointent vers `.framework/` dont le contenu vient d'être mis à jour.

N'oubliez pas de commiter la mise à jour dans le projet parent :

```bash
git add .framework
git commit -m "Update framework to latest version"
git push
```

---

## Ajouter un nouveau fichier au framework

Quand vous ajoutez un nouveau fichier ou dossier dans le dépôt du framework :

### 1. Ajouter dans le dépôt framework

Créez le fichier dans `.framework/`, commitez et poussez.

### 2. Créer le symlink si nécessaire

Si le fichier doit être accessible à la racine du projet, ajoutez un symlink :

```bash
ln -s .framework/nouveau-dossier nouveau-dossier
```

Les fichiers *dans* des dossiers déjà symlinkés (comme `core/`, `components/`) sont automatiquement accessibles — pas besoin de symlink supplémentaire.

### 3. Mettre à jour setup.sh

Ajoutez le nouveau symlink dans `setup.sh` pour que les futurs clones le créent automatiquement.

---

## Déploiement

Le script `deploy.sh` utilise **rsync** avec l'option `-L` (follow symlinks). Lors du déploiement, rsync suit les symlinks et copie les fichiers réels sur le serveur — le serveur reçoit une structure à plat, sans symlinks ni submodule.

```bash
# Extrait de deploy.sh
rsync -avz -L --delete \
  --exclude-from='.rsync-exclude' \
  ./ user@serveur:/chemin/
```

Le dossier `.framework/` est exclu du déploiement via `.rsync-exclude` (les fichiers sont déjà déployés via les symlinks suivis par rsync).

**Points importants :**

- Le serveur ne contient **aucun symlink** — uniquement les fichiers réels
- Le dossier `.framework/` n'est **jamais déployé**
- L'option `-L` est **essentielle** — sans elle, rsync copierait les symlinks au lieu des fichiers

---

## Commandes utiles

Référence rapide des commandes git submodule les plus courantes :

| Commande | Description |
|---|---|
| `git clone --recursive <url>` | Cloner un projet avec son submodule |
| `git submodule init` | Initialiser le submodule (après un clone sans `--recursive`) |
| `git submodule update` | Mettre à jour le submodule au commit référencé |
| `git submodule update --remote .framework` | Mettre à jour vers le dernier commit de la branche distante |
| `git submodule status` | Afficher le commit actuel du submodule |
| `git diff --submodule` | Voir les changements dans le submodule |
| `cd .framework && git log --oneline -5` | Voir les derniers commits du framework |
| `cd .framework && git pull` | Tirer les dernières modifications du framework |
| `git submodule foreach git pull` | Mettre à jour tous les submodules (si plusieurs) |
| `git submodule add <url> .framework` | Ajouter le submodule framework à un projet existant |

---

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Composants](components.md)
- [Builder — Vue d'ensemble](builder-overview.md)
