# Wireframes

375 sections prêtes à copier-coller. Chaque wireframe est un snippet HTML autonome avec styles intégrés et responsive.

## Comment utiliser

1. Parcourez les catégories ou utilisez la recherche pour trouver une section.
2. Cliquez sur la carte pour un aperçu plein écran, ou sur **Copier** pour récupérer le code.
3. Collez le snippet directement dans votre page HTML -- il est autonome (styles inclus).
4. Personnalisez les textes, images et couleurs via les variables CSS du wireframe ou vos propres `tokens.css`.

## Développement local (Live Server)

Les wireframes sont servis via un bundle JSON (`wireframes-data.json`) pour contourner un [bug connu de Live Server](https://github.com/ritwickdey/vscode-live-server/issues/684) qui injecte du code dans les réponses HTML et corrompt les SVG dans les iframes.

**Générer le bundle :**

```bash
node wireframes/build-data.js
```

**Mode watch** (régénère automatiquement quand un wireframe est modifié) :

```bash
node wireframes/build-data.js --watch
```

Le fichier `wireframes-data.json` est auto-généré, non versionné (`.gitignore`) et non déployé (`.rsync-exclude`). En production (sans Live Server), les wireframes sont chargés directement en HTML via `fetch()`.

## Outils de la page

- **Recherche** : filtrage en temps réel par nom de wireframe
- **Breakpoints** : prévisualisation Desktop (1440px), Tablette (768px), Mobile L (480px), Mobile (375px)
- **Filtres par catégorie** : affiche uniquement les wireframes d'une catégorie
- **Modal de preview** : clic sur une carte pour un aperçu plein écran avec onglets Preview / Code
- **Bouton Copier** : copie le HTML du wireframe dans le presse-papier

## Catégories disponibles

Chaque catégorie contient **15 variantes** (nommées `prefix-01` à `prefix-15`). Les fichiers HTML sont stockés dans `wireframes/{categorie}/`.

| # | Catégorie | Prefixe | Description |
|---|---|---|---|
| 1 | **Headers** | `header` | Barres de navigation et headers de site |
| 2 | **Heroes** | `hero` | Sections hero / above the fold |
| 3 | **Intros** | `intro` | Sections d'introduction / présentation |
| 4 | **Services** | `services` | Grilles et listes de services / features |
| 5 | **Portfolios** | `portfolio` | Galeries de projets / réalisations |
| 6 | **Teams** | `team` | Présentation d'équipe / membres |
| 7 | **Testimonials** | `testimonials` | Avis clients / témoignages |
| 8 | **Logos** | `logos` | Bandes de logos partenaires / clients |
| 9 | **Contents** | `content` | Sections de contenu texte / media |
| 10 | **Blogs** | `blog` | Listings d'articles de blog |
| 11 | **Single Posts** | `single` | Pages d'article individuel |
| 12 | **Filtres** | `filter` | Catégories et filtres de contenu |
| 13 | **Galleries** | `gallery` | Galeries d'images |
| 14 | **CTAs** | `cta` | Appels à l'action (call-to-action) |
| 15 | **Contacts** | `contact` | Formulaires et sections de contact |
| 16 | **FAQs** | `faq` | Foires aux questions |
| 17 | **Steps** | `steps` | Étapes / processus |
| 18 | **Timelines** | `timeline` | Chronologies / frises temporelles |
| 19 | **Banners** | `banner` | Bannières et bandes d'information |
| 20 | **Popups** | `popup` | Modales et popups |
| 21 | **Mega Menus** | `mega-menu` | Menus de navigation étendus |
| 22 | **Events** | `event` | Sections évènements |
| 23 | **Coming Soon** | `coming-soon` | Pages "bientôt disponible" |
| 24 | **Error Pages** | `error` | Pages d'erreur (404, 500...) |
| 25 | **Thank You** | `thank-you` | Pages de remerciement / confirmation |

## Structure des fichiers

```
wireframes/
  headers/
    header-01.html
    header-02.html
    ...
    header-15.html
  heros/
    hero-01.html
    ...
  intros/
    intro-01.html
    ...
  (etc. pour chaque catégorie)
```

Chaque fichier `.html` est un snippet autonome contenant :
- Le HTML de la section
- Un bloc `<style>` avec les styles spécifiques (y compris responsive)
- Les variables CSS personnalisables (couleurs, polices, espacements)

## Utilisation avec le skill /wireframe

Le skill Claude Code `/wireframe` permet d'intégrer un wireframe directement dans une page :

```bash
# Intégrer un wireframe spécifique
/wireframe hero-03

# Lister les options d'une catégorie
/wireframe cta

# Intégrer un banner
/wireframe banner-07
```

## Personnalisation

Les wireframes utilisent les variables CSS de `tokens.css` quand elles sont disponibles, avec des valeurs de fallback :

- `--color-primary` : couleur principale
- `--color-text` : couleur du texte
- `--color-bg` : couleur de fond
- `--color-border` : couleur des bordures
- `--font-body` : police du corps de texte
- `--font-heading` : police des titres

## Voir aussi

- [Claude Code](claude.md) (skill `/wireframe`)
- [Design Tokens](tokens.md)
- [Composants](components.md)
