# Démarrer un projet

Guide complet pour créer un nouveau site, le déployer en production, et adapter le boilerplate selon vos besoins.

**Sommaire de cette page :**

1. [Créer un nouveau projet](#creer-un-nouveau-projet) -- copier, personnaliser, configurer
2. [Git & GitHub](#git--github) -- versionner et pousser votre code
3. [Mise en production](#mise-en-production) -- SSH, rsync, déploiement, .env
4. [Site sans blog](#site-sans-blog) -- retirer les fichiers blog
5. [Modules optionnels](#modules-optionnels) -- retirer ce dont vous n'avez pas besoin
6. [Snippets copier-coller](#snippets-copier-coller) -- fragments HTML prets a l'emploi

---

## Créer un nouveau projet

### 1. Cloner le template

Clonez le dépôt **beely-template** avec ses submodules, puis lancez le setup :

```bash
git clone --recursive https://github.com/TheoRoces/beely-template.git mon-projet
cd mon-projet/
./setup.sh --init
```

Le script `setup.sh` initialise les 2 submodules (`.framework/` et `builder/`), crée les symlinks nécessaires, et copie les fichiers `.env.example`.

Voir [Architecture 3 repos](submodule.md) pour le détail de l'architecture.

### 2. Personnaliser la charte graphique

Ouvrez `core/css/tokens.css` et modifiez les variables CSS :

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

Voir [Design Tokens](tokens.md) pour la reference complete.

### 3. Configurer le site

Editez `config-site.js`. Ce fichier centralise toute la configuration du projet :

- **SITE_CONFIG** : identite du site (nom, favicon)
- **COOKIES_CONFIG** : IDs analytics (`ga4`, `gtm`, `clarity`, etc.), textes du bandeau RGPD, lien vers la politique de confidentialite
- **BLOG_CONFIG** : connexion Baserow (voir section [Site sans blog](#site-sans-blog) si non utilise)
- **LEGAL_CONFIG** : informations legales de l'entreprise (nom, SIRET, adresse, hebergeur, etc.)

#### Identite du site (`SITE_CONFIG`)

```js
window.SITE_CONFIG = {
  name: 'Mon Site',              // Titre par defaut (si <title> est vide)
  favicon: '/favicon.ico',       // Chemin vers le favicon
};
```

La configuration SSH de déploiement est dans un fichier separe `.deploy.env` (non committe). Voir [Déploiement](production.md).

Le **favicon** et le **titre par defaut** sont automatiquement appliques par `core/js/site.js` : si aucune balise `<link rel="icon">` n'est presente, le favicon configuré est injecte ; si le `<title>` est vide, le nom du site est utilise.

Voir [Cookies & Analytics](cookies.md#configuration) pour le detail des autres sections.

### 4. Remplir les informations legales {#legal-config}

Dans `config-site.js`, completez le bloc `LEGAL_CONFIG` avec vos informations :

```js
window.LEGAL_CONFIG = {
  company: 'Ma Societe SAS',
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
  developer: {           // Optionnel, masque si name est vide
    name: '', url: '', address: ''
  }
};
```

Les pages `mentions-legales.html` et `confidentialite.html` sont fournies et se remplissent automatiquement avec ces informations. Les champs vides affichent un placeholder `[NOM_DU_CHAMP]` pour vous aider a identifier les manques.

N'oubliez pas de configurer aussi `privacyUrl` dans la banniere cookies pour que le lien vers la politique de confidentialite apparaisse dans le bandeau :

```js
banner: {
  privacyUrl: '/confidentialite.html',
  privacyText: 'Politique de confidentialite',
  // ...
}
```

**Important :** les textes legaux fournis sont des modeles generiques. Faites-les valider par un professionnel du droit avant mise en production.

Voir [Pages legales](cookies.md#champs-legal-config) pour le detail de chaque champ.

### 5. Composants (header, footer, card)

Chaque composant se configure directement dans le HTML via des **attributs `data-*`** (pour les valeurs simples) et des **`<template data-slot>`** (pour le contenu HTML riche).

- **Header** : `data-site-name`, `data-logo-link`, `data-logo-src`, slots `nav`, `cta`, `search`
- **Footer** : `data-copyright`, slot `content`
- **Card** : `data-title`, `data-text`, `data-image`, `data-image-alt`, slot `footer`

Les composants (`components/*.js`) ne sont a modifier que si vous changez la structure HTML. Voir [Composants](components.md) pour le detail.

### 6. Créer vos pages

Copiez `snippets/page.html` comme modele pour chaque nouvelle page. Structure minimale :

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
        <a href="/mentions-legales.html">Mentions legales</a>
        <a href="/confidentialite.html">Confidentialite</a>
      </nav>
    </template>
  </div>

</body>
</html>
```

### 7. Tester en local

Ouvrez le projet avec **VS Code + Live Server** ou n'importe quel serveur local :

```bash
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
# Changer le remote
git remote set-url origin https://github.com/votre-user/votre-projet.git

# Pousser le code
git push -u origin main
```

### 3. Workflow quotidien

Les commandes Git que vous utiliserez au quotidien :

```bash
# Voir l'etat des fichiers modifies
git status

# Voir les modifications en detail
git diff

# Ajouter tous les fichiers modifies
git add -A

# Ajouter un fichier specifique
git add chemin/du/fichier.html

# Créer un commit avec un message descriptif
git commit -m "Add contact page with form validation"

# Pousser sur GitHub
git push

# Recuperer les dernieres modifications (si travail en equipe)
git pull
```

### 4. Bonnes pratiques commits

- Un commit = une modification logique (pas 10 changements differents dans un seul commit)
- Messages en anglais, courts et descriptifs : `Add`, `Fix`, `Update`, `Remove`
- Exemples : `"Add hero section to homepage"`, `"Fix mobile nav toggle"`, `"Update color tokens"`

### 5. Fichier `.gitignore`

Assurez-vous que les fichiers sensibles ou inutiles ne sont pas versionnes :

```
# Fichiers a ignorer dans .gitignore
.env
.deploy.env
.DS_Store
node_modules/
.claude/
data/
```

---

## Mise en production

Le déploiement, la configuration serveur et la checklist de lancement ont leur page dediee :

- [Mise en production](production.md) -- SSH, rsync, .env, .htaccess, checklist de lancement

---

## Site sans blog

Si votre site n'a pas besoin de blog, supprimez les fichiers lies et allegez la configuration.

### Fichiers a supprimer

```bash
# Pages blog
blog.html                  # Page listing
blog/                      # Dossier contenant article.html

# Proxy API
api/                       # Dossier contenant baserow.php

# Fichier environnement (si le blog etait le seul usage)
.env
```

### CSS et JS a retirer des pages

Dans chaque fichier HTML, supprimez ces lignes du `<head>` :

```html
<!-- Supprimer cette ligne CSS -->
<link rel="stylesheet" href="core/css/blog.css">

<!-- Supprimer cette ligne JS -->
<script src="core/js/blog.js" defer></script>
```

Les fichiers `core/css/blog.css` et `core/js/blog.js` peuvent rester dans le dossier `core/` sans probleme (ils ne seront simplement plus charges).

### Configuration a nettoyer

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

### Navigation a adapter

Retirez le lien "Blog" du slot `nav` dans le header de chaque page HTML.

### Resume

| Action | Fichiers concernes |
|--------|--------------------|
| Supprimer | `blog.html`, `blog/`, `api/`, `.env` |
| Retirer des `<head>` | `blog.css`, `blog.js` |
| Nettoyer | `config-site.js` (section BLOG_CONFIG) |
| Adapter | `components/header.js` (retirer lien Blog) |

---

## Modules optionnels

Vous pouvez aussi retirer d'autres modules selon vos besoins. Chaque module est independant :

| Module | CSS | JS | Requis ? |
|--------|-----|-----|----------|
| Tokens + Base | `tokens.css`, `base.css` | -- | Oui (toujours) |
| Site (favicon, titre) | -- | `site.js` | Recommande |
| Composants | -- | `components.js` | Oui (header/footer) |
| Elements | `elements.css` | `elements.js` | Optionnel |
| Icones | `icons.css` | `icons.js` | Optionnel |
| Grid / Bento | `grid.css` | -- | Optionnel |
| Formulaires | `forms.css` | `forms.js` | Optionnel |
| Animations | `animations.css` | `animations.js` | Optionnel |
| Cookies | `cookies.css` | `cookies.js` | Recommande (RGPD) |
| Paramètres URL | -- | `params.js` | Optionnel |
| Blog | `blog.css` | `blog.js` | Optionnel |
| Dark Mode | -- | `darkmode.js` | Optionnel |
| Pages legales | -- | `legal.js` | Recommande (RGPD) |

**Minimum requis** : `tokens.css` + `base.css` + `components.js` + `site.js` + vos composants (`header.js`, `footer.js`).

---

## Snippets (copier-coller)

Le dossier `snippets/` contient un fichier HTML par element, pret a copier-coller dans vos pages. Chaque fichier commence par un bloc commentaire listant toutes les classes, attributs et options disponibles.

| Fichier | Contenu |
|---------|---------|
| `popup.html` | Popup centre, panneau lateral, bottom sheet, panneau superieur |
| `tabs.html` | Tabs basiques + tabs imbriqués |
| `accordion.html` | Accordion simple + multiple |
| `slider.html` | Slider avec toutes les options (loop, autoplay, draggable, per-view) |
| `form.html` | Formulaire simple + multi-step avec validation et conditions |
| `animations.html` | Animations scroll + clic + SVG |
| `grid.html` | Grid colonnes + bento layouts |
| `cookies.html` | Configuration cookies + bandeau RGPD |
| `darkmode.html` | Toggle dark mode + script a inclure |
| `page.html` | Page complete (doctype minimal avec tous les CSS/JS prets) |
| `icons.html` | Icones (usage data-icon + options) |

Ces fichiers ne sont pas des pages completes, mais des **fragments HTML** a integrer dans vos pages.

### Problèmes courants

- **Le site ne s'affiche pas correctement :** vérifiez l'ordre des CSS dans le `<head>` : `tokens.css` doit etre charge en premier.
- **Les composants ne s'affichent pas :** vérifiez que `components.js` est charge avant les fichiers de composants (`header.js`, `footer.js`).
- **Problèmes de déploiement :** consultez la page [Mise en production](production.md).

### Voir aussi

- [Mise en production](production.md)
- [Design Tokens](tokens.md)
- [Composants](components.md)
- [Cookies & RGPD](cookies.md)
- [Blog](blog.md)
- [Wireframes](wireframes.md)
