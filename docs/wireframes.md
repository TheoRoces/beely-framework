# Wireframes

375 sections pretes a copier-coller. Chaque wireframe est un snippet HTML autonome avec styles integres et responsive.

## Comment utiliser

1. Parcourez les categories ou utilisez la recherche pour trouver une section.
2. Cliquez sur la carte pour un apercu plein ecran, ou sur **Copier** pour recuperer le code.
3. Collez le snippet directement dans votre page HTML -- il est autonome (styles inclus).
4. Personnalisez les textes, images et couleurs via les variables CSS du wireframe ou vos propres `tokens.css`.

## Outils de la page

- **Recherche** : filtrage en temps reel par nom de wireframe
- **Breakpoints** : previsualisation Desktop (1440px), Tablette (768px), Mobile (375px)
- **Filtres par categorie** : affiche uniquement les wireframes d'une categorie
- **Modal de preview** : clic sur une carte pour un apercu plein ecran avec onglets Preview / Code
- **Bouton Copier** : copie le HTML du wireframe dans le presse-papier

## Categories disponibles

Chaque categorie contient **15 variantes** (nommees `prefix-01` a `prefix-15`). Les fichiers HTML sont stockes dans `wireframes/{categorie}/`.

| # | Categorie | Prefixe | Description |
|---|---|---|---|
| 1 | **Headers** | `header` | Barres de navigation et headers de site |
| 2 | **Heroes** | `hero` | Sections hero / above the fold |
| 3 | **Intros** | `intro` | Sections d'introduction / presentation |
| 4 | **Services** | `services` | Grilles et listes de services / features |
| 5 | **Portfolios** | `portfolio` | Galeries de projets / realisations |
| 6 | **Teams** | `team` | Presentation d'equipe / membres |
| 7 | **Testimonials** | `testimonials` | Avis clients / temoignages |
| 8 | **Logos** | `logos` | Bandes de logos partenaires / clients |
| 9 | **Contents** | `content` | Sections de contenu texte / media |
| 10 | **Blogs** | `blog` | Listings d'articles de blog |
| 11 | **Single Posts** | `single` | Pages d'article individuel |
| 12 | **Filtres** | `filter` | Categories et filtres de contenu |
| 13 | **Galleries** | `gallery` | Galeries d'images |
| 14 | **CTAs** | `cta` | Appels a l'action (call-to-action) |
| 15 | **Contacts** | `contact` | Formulaires et sections de contact |
| 16 | **FAQs** | `faq` | Foires aux questions |
| 17 | **Steps** | `steps` | Etapes / processus |
| 18 | **Timelines** | `timeline` | Chronologies / frises temporelles |
| 19 | **Banners** | `banner` | Bannieres et bandes d'information |
| 20 | **Popups** | `popup` | Modales et popups |
| 21 | **Mega Menus** | `mega-menu` | Menus de navigation etendus |
| 22 | **Events** | `event` | Sections evenements |
| 23 | **Coming Soon** | `coming-soon` | Pages "bientot disponible" |
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
  (etc. pour chaque categorie)
```

Chaque fichier `.html` est un snippet autonome contenant :
- Le HTML de la section
- Un bloc `<style>` avec les styles specifiques (y compris responsive)
- Les variables CSS personnalisables (couleurs, polices, espacements)

## Utilisation avec le skill /wireframe

Le skill Claude Code `/wireframe` permet d'integrer un wireframe directement dans une page :

```bash
# Integrer un wireframe specifique
/wireframe hero-03

# Lister les options d'une categorie
/wireframe cta

# Integrer un banner
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
