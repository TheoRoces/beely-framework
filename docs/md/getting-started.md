# Démarrer un projet

Guide complet pour installer le framework Site System, créer un site, et le mettre en ligne.

**Sommaire de cette page :**

1. [Installer le framework](#installer-le-framework) — 3 scénarios selon ta situation
2. [Personnaliser le site](#personnaliser-le-site) — charte graphique, config, composants
3. [Créer des pages](#creer-des-pages) — template HTML et structure
4. [Tester en local](#tester-en-local) — Live Server, Python, Node
5. [Git & GitHub](#git--github) — versionner et pousser ton code
6. [Mise en production](#mise-en-production) — déployer sur un serveur
7. [Site sans blog](#site-sans-blog) — retirer le blog
8. [Modules optionnels](#modules-optionnels) — retirer ce dont tu n'as pas besoin
9. [Snippets copier-coller](#snippets-copier-coller) — fragments HTML prêts à l'emploi

---

## Installer le framework

### Comment ouvrir un terminal ?

Toutes les commandes de cette page se tapent dans un **terminal** (ligne de commande). Voici comment l'ouvrir :

- **Sur Mac** : ouvre l'application **Terminal** (dans Applications → Utilitaires) ou tape `terminal` dans Spotlight (Cmd+Espace)
- **Dans VSCode** : menu **Terminal → Nouveau terminal**, ou le raccourci **Ctrl+`** (touche backtick, en haut à gauche du clavier)
- **Sur Windows** : ouvre **PowerShell** ou **Git Bash**

Le terminal VSCode est pratique car il s'ouvre directement dans le dossier de ton projet.

---

### D'où pars-tu ?

Choisis le scénario qui correspond à ta situation :

| Scénario | Ta situation | Aller à |
|---|---|---|
| **A** | Je n'ai aucun projet, je pars de zéro | [Scénario A](#scenario-a) |
| **B** | J'ai un projet quasi vierge (un `index.html` et quelques fichiers) | [Scénario B](#scenario-b) |
| **C** | J'ai un projet existant structuré (dossiers `/css`, `/js`, `/assets`, etc.) | [Scénario C](#scenario-c) |

---

### Scénario A — Partir de zéro (aucun projet) {#scenario-a}

C'est le cas le plus simple. Tu clones un template prêt à l'emploi qui contient déjà toute la structure.

**Étape 1 — Cloner le template**

```bash
# 💻 Terminal : Terminal.app (Mac) ou terminal VSCode
# 📂 Dossier : là où tu ranges tes sites (ex: ~/Sites/)

cd ~/Sites
git clone --recursive https://github.com/TheoRoces/beely-template.git mon-projet
cd mon-projet
```

L'option `--recursive` est importante : elle télécharge aussi le framework et le Configurateur en même temps.

**Étape 2 — Lancer le setup**

```bash
# 📂 Dossier : ~/Sites/mon-projet/ (la racine du projet)

./setup.sh --init
```

Ce script crée les **symlinks** (raccourcis) qui relient ton projet au framework. Il copie aussi les fichiers `.env.example` pour que tu puisses les remplir.

**Étape 3 — Ouvrir dans VSCode**

```bash
# 📂 Dossier : ~/Sites/mon-projet/

code .
```

Ou bien : ouvre VSCode, puis **Fichier → Ouvrir un dossier** et sélectionne `mon-projet`.

**Étape 4 — Personnaliser**

Passe à la section [Personnaliser le site](#personnaliser-le-site) ci-dessous.

---

### Scénario B — Projet quasi vierge (index.html + quelques fichiers) {#scenario-b}

Tu as déjà un projet avec un `index.html` et peut-être quelques fichiers CSS/JS, mais pas de structure complète. Tu veux y ajouter le framework.

**Étape 1 — Initialiser git (si pas déjà fait)**

```bash
# 💻 Terminal : terminal VSCode (Ctrl+`)
# 📂 Dossier : la racine de ton projet (là où se trouve ton index.html)

git init
git add -A
git commit -m "Initial commit"
```

Si ton projet est déjà un dépôt git, passe cette étape.

**Étape 2 — Ajouter le framework comme submodule**

```bash
# 📂 Dossier : la racine de ton projet

git submodule add https://github.com/TheoRoces/beely-framework.git .framework
```

Cela crée un dossier `.framework/` contenant tout le framework (CSS, JS, composants, icônes, wireframes, docs).

**Étape 3 — Ajouter le Configurateur (optionnel)**

```bash
# 📂 Dossier : la racine de ton projet

git submodule add https://github.com/TheoRoces/beely-builder.git builder
```

Le Configurateur est un éditeur visuel optionnel. Si tu ne l'utilises pas, saute cette étape.

**Étape 4 — Créer les symlinks**

Tu peux copier le script `setup.sh` depuis le [template GitHub](https://github.com/TheoRoces/beely-template/blob/main/setup.sh) et l'exécuter, ou créer les symlinks manuellement :

```bash
# 📂 Dossier : la racine de ton projet

ln -s .framework/core core
ln -s .framework/components components
ln -s .framework/assets assets
ln -s .framework/api api
ln -s .framework/wireframes wireframes
ln -s .framework/snippets snippets
ln -s .framework/docs docs
ln -s .framework/base-index.html base-index.html
ln -s .framework/robots.txt robots.txt
ln -s .framework/generate-sitemap.js generate-sitemap.js
```

**Étape 5 — Créer le fichier de configuration**

Crée un fichier `config-site.js` à la racine de ton projet. Copie le contenu depuis le [template](https://github.com/TheoRoces/beely-template/blob/main/config-site.js) ou crée-le manuellement :

```js
window.SITE_CONFIG = {
  name: 'Mon Site',
  favicon: '/favicon.ico',
};
```

Voir la section [Personnaliser le site](#personnaliser-le-site) pour le détail complet.

**Étape 6 — Adapter ton HTML**

Remplace les `<link>` et `<script>` de ton `index.html` pour utiliser le framework. Voici un avant/après :

**Avant (ton HTML actuel) :**
```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

**Après (avec le framework) :**
```html
<head>
  <!-- Dark mode + Config (synchrone) -->
  <script src="core/js/darkmode.js"></script>
  <script src="config-site.js"></script>
  <script src="core/js/site.js"></script>

  <!-- CSS du framework (requis) -->
  <link rel="stylesheet" href="core/css/tokens.css">
  <link rel="stylesheet" href="core/css/base.css">
  <link rel="stylesheet" href="core/css/cookies.css">

  <!-- Tes styles perso (après le framework pour pouvoir overrider) -->
  <link rel="stylesheet" href="style.css">

  <!-- Composants (synchrone) -->
  <script src="core/js/components.js"></script>
  <script src="components/header.js"></script>
  <script src="components/footer.js"></script>

  <!-- JS interactifs (defer) -->
  <script src="core/js/cookies.js" defer></script>
</head>
```

Tu gardes tes fichiers CSS perso — il suffit de les charger **après** ceux du framework.

**Étape 7 — Commiter et tester**

```bash
# 📂 Dossier : la racine de ton projet

git add -A
git commit -m "Add Site System framework"
```

Passe à [Tester en local](#tester-en-local).

---

### Scénario C — Projet existant structuré {#scenario-c}

Tu as un site existant avec des dossiers `/css`, `/js`, `/assets`, etc. Tu veux migrer progressivement vers le framework sans tout casser.

**Étape 1 — Ajouter le framework**

Suis les étapes 1 à 4 du [Scénario B](#scenario-b) (git init, submodule, symlinks).

**Étape 2 — Migration progressive**

Tu n'as pas besoin de tout migrer d'un coup. Voici la stratégie recommandée :

1. **Garde tes fichiers CSS existants** — renomme `css/style.css` en `css/custom.css` si nécessaire
2. **Ajoute les CSS du framework** dans le `<head>` de chaque page, **avant** tes CSS custom :

```html
<!-- Framework (ajouter) -->
<link rel="stylesheet" href="core/css/tokens.css">
<link rel="stylesheet" href="core/css/base.css">

<!-- Tes styles existants (garder, charger après) -->
<link rel="stylesheet" href="css/custom.css">
```

3. **Ajoute les JS du framework** pour les fonctionnalités que tu veux utiliser (composants, icônes, animations, etc.)
4. **Migre les composants un par un** : remplace ton header HTML par le composant `data-component="header"`, puis le footer, etc.
5. **Teste après chaque modification** pour vérifier que rien ne casse

**Étape 3 — Supprimer tes anciens fichiers (quand prêt)**

Une fois la migration terminée, tu peux supprimer les fichiers devenus inutiles (`css/`, `js/`, `assets/` s'ils sont remplacés par le framework).

**Conseil** : commence par une seule page pour te familiariser avec le framework, puis étends aux autres pages.

---

## Personnaliser le site

### 1. Charte graphique (tokens.css)

Ouvre `core/css/tokens.css` et modifie les variables CSS :

```css
:root {
  /* Couleurs */
  --color-primary: #2563eb;     /* Couleur principale */
  --color-secondary: #7c3aed;   /* Couleur secondaire */
  --color-bg: #ffffff;          /* Fond */
  --color-text: #1e293b;        /* Texte */

  /* Polices */
  --font-sans: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;

  /* Arrondis, espacements, etc. */
}
```

Voir [Design Tokens](tokens.md) pour la référence complète.

### 2. Configuration du site (config-site.js)

Édite `config-site.js`. Ce fichier centralise toute la configuration du projet :

- **SITE_CONFIG** : identité du site (nom, favicon)
- **COOKIES_CONFIG** : IDs analytics (`ga4`, `gtm`, `clarity`, etc.), textes du bandeau RGPD, lien vers la politique de confidentialité
- **BLOG_CONFIG** : connexion Baserow (voir section [Site sans blog](#site-sans-blog) si non utilisé)
- **LEGAL_CONFIG** : informations légales de l'entreprise (nom, SIRET, adresse, hébergeur, etc.)

#### Identité du site (`SITE_CONFIG`)

```js
window.SITE_CONFIG = {
  name: 'Mon Site',              // Titre par défaut (si <title> est vide)
  favicon: '/favicon.ico',       // Chemin vers le favicon
};
```

La configuration SSH de déploiement est dans un fichier séparé `.deploy.env` (non committé). Voir [Déploiement](production.md).

Le **favicon** et le **titre par défaut** sont automatiquement appliqués par `core/js/site.js` : si aucune balise `<link rel="icon">` n'est présente, le favicon configuré est injecté ; si le `<title>` est vide, le nom du site est utilisé.

Voir [Cookies & Analytics](cookies.md#configuration) pour le détail des autres sections.

### 3. Informations légales (LEGAL_CONFIG)

Dans `config-site.js`, complétez le bloc `LEGAL_CONFIG` avec vos informations :

```js
window.LEGAL_CONFIG = {
  company: 'Ma Société SAS',
  legalForm: 'SAS',
  siret: '123 456 789 00000',
  registration: 'RCS Paris',
  representative: 'Jean Dupont',
  address: '123 rue Exemple, 75000 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'contact@monsite.fr',
  website: 'https://monsite.fr',
  hosting: {
    name: 'OVH',
    address: '2 rue Kellermann, 59100 Roubaix',
    url: 'https://www.ovh.com',
    contact: 'https://www.ovh.com/fr/support/'
  },
  developer: {           // Optionnel, masqué si name est vide
    name: '', url: '', address: ''
  }
};
```

Les pages `mentions-legales.html` et `confidentialite.html` sont fournies et se remplissent automatiquement avec ces informations. Les champs vides affichent un placeholder `[NOM_DU_CHAMP]` pour vous aider à identifier les manques.

N'oubliez pas de configurer aussi `privacyUrl` dans la bannière cookies pour que le lien vers la politique de confidentialité apparaisse dans le bandeau :

```js
banner: {
  privacyUrl: '/confidentialite.html',
  privacyText: 'Politique de confidentialité',
  // ...
}
```

**Important :** les textes légaux fournis sont des modèles génériques. Faites-les valider par un professionnel du droit avant mise en production.

Voir [Pages légales](cookies.md#champs-legal-config) pour le détail de chaque champ.

### 4. Composants (header, footer, card)

Chaque composant se configure directement dans le HTML via des **attributs `data-*`** (pour les valeurs simples) et des **`<template data-slot>`** (pour le contenu HTML riche).

- **Header** : `data-site-name`, `data-logo-link`, `data-logo-src`, slots `nav`, `cta`, `search`
- **Footer** : `data-copyright`, slot `content`
- **Card** : `data-title`, `data-text`, `data-image`, `data-image-alt`, slot `footer`

Les composants (`components/*.js`) ne sont à modifier que si vous changez la structure HTML. Voir [Composants](components.md) pour le détail.

---

## Créer des pages

Copiez `snippets/page.html` comme modèle pour chaque nouvelle page. Structure minimale :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ma Page — Mon Site</title>
  <meta name="description" content="Description SEO de la page.">

  <!-- Dark mode + Config (synchrone) -->
  <script src="core/js/darkmode.js"></script>
  <script src="config-site.js"></script>
  <script src="core/js/site.js"></script>

  <!-- CSS (requis) -->
  <link rel="stylesheet" href="core/css/tokens.css">
  <link rel="stylesheet" href="core/css/base.css">
  <link rel="stylesheet" href="core/css/cookies.css">

  <!-- CSS (optionnel — ajoutez selon vos besoins) -->
  <link rel="stylesheet" href="core/css/animations.css">
  <link rel="stylesheet" href="core/css/elements.css">
  <link rel="stylesheet" href="core/css/forms.css">
  <link rel="stylesheet" href="core/css/grid.css">
  <link rel="stylesheet" href="core/css/icons.css">
  <!-- <link rel="stylesheet" href="core/css/blog.css"> -->

  <!-- Composants (synchrone) -->
  <script src="core/js/components.js"></script>
  <script src="components/header.js"></script>
  <script src="components/footer.js"></script>

  <!-- JS interactifs (defer — ajoutez selon vos besoins) -->
  <script src="core/js/animations.js" defer></script>
  <script src="core/js/elements.js" defer></script>
  <script src="core/js/forms.js" defer></script>
  <script src="core/js/icons.js" defer></script>
  <script src="core/js/params.js" defer></script>
  <script src="core/js/cookies.js" defer></script>
</head>
<body>

  <!-- Header : attributs + slots -->
  <div data-component="header"
       data-site-name="Mon Site"
       data-logo-link="/index.html">
    <template data-slot="nav">
      <a href="/index.html">Accueil</a>
      <a href="/contact.html">Contact</a>
    </template>
  </div>

  <div class="container">
    <!-- Votre contenu ici -->
  </div>

  <!-- Footer : attributs + slots -->
  <div data-component="footer"
       data-copyright="&copy; 2026 Mon Site">
    <template data-slot="content">
      <nav class="footer__links">
        <a href="/mentions-legales.html">Mentions légales</a>
        <a href="/confidentialite.html">Confidentialité</a>
      </nav>
    </template>
  </div>

</body>
</html>
```

---

## Tester en local

Ouvrez le projet avec **VS Code + Live Server** ou n'importe quel serveur local :

```bash
# 💻 Terminal : terminal VSCode (Ctrl+`)
# 📂 Dossier : la racine de ton projet

# Option 1 : VS Code Live Server (extension)
# Clic droit sur index.html → "Open with Live Server"

# Option 2 : Python
python3 -m http.server 8000

# Option 3 : Node.js (npx)
npx serve .
```

Les liens internes utilisent `.html` pour fonctionner partout (Live Server, file://, etc.). En production, le `.htaccess` redirige vers des URLs propres.

---

## Git & GitHub

Le projet est déjà un dépôt Git (cloné depuis beely-template). Il faut simplement changer le remote pour pointer vers votre propre dépôt.

### 1. Créer votre dépôt GitHub

Créez un nouveau dépôt sur [github.com/new](https://github.com/new), puis changez le remote :

```bash
# 💻 Terminal : terminal VSCode (Ctrl+`)
# 📂 Dossier : la racine de ton projet

# Changer le remote
git remote set-url origin https://github.com/votre-user/votre-projet.git

# Pousser le code
git push -u origin main
```

### 2. Workflow quotidien

Les commandes Git que vous utiliserez au quotidien :

```bash
# 📂 Dossier : la racine de ton projet

# Voir l'état des fichiers modifiés
git status

# Voir les modifications en détail
git diff

# Ajouter tous les fichiers modifiés
git add -A

# Ajouter un fichier spécifique
git add chemin/du/fichier.html

# Créer un commit avec un message descriptif
git commit -m "Add contact page with form validation"

# Pousser sur GitHub
git push

# Récupérer les dernières modifications (si travail en équipe)
git pull
```

### 3. Bonnes pratiques commits

- Un commit = une modification logique (pas 10 changements différents dans un seul commit)
- Messages en anglais, courts et descriptifs : `Add`, `Fix`, `Update`, `Remove`
- Exemples : `"Add hero section to homepage"`, `"Fix mobile nav toggle"`, `"Update color tokens"`

### 4. Fichier `.gitignore`

Assurez-vous que les fichiers sensibles ou inutiles ne sont pas versionnés :

```
# Fichiers à ignorer dans .gitignore
.env
.deploy.env
.DS_Store
node_modules/
.claude/
data/
```

---

## Mise en production

Le déploiement, la configuration serveur et la checklist de lancement ont leur page dédiée :

- [Mise en production](production.md) — SSH, rsync, .env, .htaccess, checklist de lancement

---

## Site sans blog

Si votre site n'a pas besoin de blog, supprimez les fichiers liés et allégez la configuration.

### Fichiers à supprimer

```bash
# 📂 Dossier : la racine de ton projet

# Pages blog
blog.html                  # Page listing
blog/                      # Dossier contenant article.html

# Proxy API
api/                       # Dossier contenant baserow.php

# Fichier environnement (si le blog était le seul usage)
.env
```

### CSS et JS à retirer des pages

Dans chaque fichier HTML, supprimez ces lignes du `<head>` :

```html
<!-- Supprimer cette ligne CSS -->
<link rel="stylesheet" href="core/css/blog.css">

<!-- Supprimer cette ligne JS -->
<script src="core/js/blog.js" defer></script>
```

Les fichiers `core/css/blog.css` et `core/js/blog.js` peuvent rester dans le dossier `core/` sans problème (ils ne seront simplement plus chargés).

### Configuration à nettoyer

Dans `config-site.js`, supprimez ou videz la section `BLOG_CONFIG` :

```js
/* ---------- BLOG ---------- */
// Supprimez tout ce bloc si pas de blog :
window.BLOG_CONFIG = {
  baserow: { url: '', token: '', tableId: '' },
  perPage: 12,
  dateFormat: 'fr-FR',
  defaultImage: '',
  articlePage: 'blog/article',
  blogPage: 'blog',
};
```

### Navigation à adapter

Retirez le lien « Blog » du slot `nav` dans le header de chaque page HTML.

### Résumé

| Action | Fichiers concernés |
|--------|--------------------|
| Supprimer | `blog.html`, `blog/`, `api/`, `.env` |
| Retirer des `<head>` | `blog.css`, `blog.js` |
| Nettoyer | `config-site.js` (section BLOG_CONFIG) |
| Adapter | `components/header.js` (retirer lien Blog) |

---

## Modules optionnels

Vous pouvez aussi retirer d'autres modules selon vos besoins. Chaque module est indépendant :

| Module | CSS | JS | Requis ? |
|--------|-----|-----|----------|
| Tokens + Base | `tokens.css`, `base.css` | — | Oui (toujours) |
| Site (favicon, titre) | — | `site.js` | Recommandé |
| Composants | — | `components.js` | Oui (header/footer) |
| Éléments | `elements.css` | `elements.js` | Optionnel |
| Icônes | `icons.css` | `icons.js` | Optionnel |
| Grid / Bento | `grid.css` | — | Optionnel |
| Formulaires | `forms.css` | `forms.js` | Optionnel |
| Animations | `animations.css` | `animations.js` | Optionnel |
| Cookies | `cookies.css` | `cookies.js` | Recommandé (RGPD) |
| Paramètres URL | — | `params.js` | Optionnel |
| Blog | `blog.css` | `blog.js` | Optionnel |
| Dark Mode | — | `darkmode.js` | Optionnel |
| Pages légales | — | `legal.js` | Recommandé (RGPD) |

**Minimum requis** : `tokens.css` + `base.css` + `components.js` + `site.js` + vos composants (`header.js`, `footer.js`).

---

## Snippets (copier-coller)

Le dossier `snippets/` contient un fichier HTML par élément, prêt à copier-coller dans vos pages. Chaque fichier commence par un bloc commentaire listant toutes les classes, attributs et options disponibles.

| Fichier | Contenu |
|---------|---------|
| `popup.html` | Popup centré, panneau latéral, bottom sheet, panneau supérieur |
| `tabs.html` | Tabs basiques + tabs imbriqués |
| `accordion.html` | Accordion simple + multiple |
| `slider.html` | Slider avec toutes les options (loop, autoplay, draggable, per-view) |
| `form.html` | Formulaire simple + multi-step avec validation et conditions |
| `animations.html` | Animations scroll + clic + SVG |
| `grid.html` | Grid colonnes + bento layouts |
| `cookies.html` | Configuration cookies + bandeau RGPD |
| `darkmode.html` | Toggle dark mode + script à inclure |
| `page.html` | Page complète (doctype minimal avec tous les CSS/JS prêts) |
| `icons.html` | Icônes (usage data-icon + options) |

Ces fichiers ne sont pas des pages complètes, mais des **fragments HTML** à intégrer dans vos pages.

### Problèmes courants

- **Le site ne s'affiche pas correctement :** vérifiez l'ordre des CSS dans le `<head>` : `tokens.css` doit être chargé en premier.
- **Les composants ne s'affichent pas :** vérifiez que `components.js` est chargé avant les fichiers de composants (`header.js`, `footer.js`).
- **Problèmes de déploiement :** consultez la page [Mise en production](production.md).

### Voir aussi

- [Mise en production](production.md)
- [Design Tokens](tokens.md)
- [Composants](components.md)
- [Cookies & RGPD](cookies.md)
- [Blog](blog.md)
- [Wireframes](wireframes.md)
