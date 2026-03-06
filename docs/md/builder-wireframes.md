# Builder — Wireframes

Le builder inclut une bibliothèque de plus de 375 sections HTML pré-construites, organisées en catégories. Ces wireframes permettent de construire rapidement des pages en assemblant des blocs visuels.

## Catalogue de wireframes

Le catalogue est accessible de deux façons :

1. **Depuis la sidebar du builder** : panel « Wireframes » dans la section Bibliothèque
2. **Depuis l'éditeur** : bouton « Wireframes » dans la toolbar → ouvre le panneau catalogue à droite

Les catégories sont chargées dynamiquement depuis l'API (endpoint `/api/wireframes-catalog`). Un cache côté client évite les appels API répétés.

## Catégories disponibles

| Catégorie | Nombre | Description |
|---|---|---|
| **Banners** | 15 | Bannières d'annonce et promotionnelles |
| **Blogs** | 15 | Grilles d'articles et listes de posts |
| **Categories/Filters** | variable | Filtres et navigation par catégorie |
| **Coming Soons** | 15 | Pages « bientôt disponible » |
| **Contacts** | variable | Formulaires et sections de contact |
| **Contents** | 15 | Blocs de contenu texte/image |
| **CTAs** | 15 | Appels à l'action |
| **Error Pages** | variable | Pages d'erreur (404, 500, etc.) |
| **Events** | 15 | Sections événements et calendriers |
| **FAQs** | variable | Questions fréquentes et accordéons |
| **Galleries** | variable | Galeries d'images et portfolios visuels |
| **Headers** | 15 | En-têtes de page et navigation |
| **Heros** | 15 | Sections héro (bannière principale) |
| **Intros** | 15 | Sections d'introduction |
| **Logos** | 15 | Grilles de logos partenaires/clients |
| **Mega Menus** | 15 | Menus de navigation avancés |
| **Popups** | variable | Fenêtres modales et popups |
| **Portfolios** | 15 | Grilles de projets et réalisations |
| **Services** | 15 | Présentations de services |
| **Singles Posts** | variable | Templates d'articles individuels |
| **Steps** | variable | Processus et étapes |
| **Testimonials** | 15 | Témoignages et avis clients |
| **Thank You** | variable | Pages de remerciement |
| **Timelines** | 15 | Chronologies et historiques |

## Recherche

Un champ de recherche en temps réel est disponible en haut du catalogue. Il filtre par nom de catégorie et par nom de fichier wireframe. Les catégories correspondantes s'ouvrent automatiquement, et les catégories sans résultat sont masquées.

## Insertion dans le canvas

Pour insérer un wireframe dans la page en cours d'édition :

1. Cliquez sur un wireframe dans le catalogue — le HTML est lu via l'API
2. Le wireframe est inséré comme nouvelle section dans la page
3. Un marqueur de section `<!-- #section:nom -->` est ajouté automatiquement
4. L'iframe et le Navigator se mettent à jour instantanément
5. L'opération crée un point d'undo (Cmd+Z pour annuler)

## Structure des fichiers

Les wireframes sont stockés dans `/wireframes/[catégorie]/[nom].html`. Chaque fichier contient uniquement le HTML de la section (pas de `<html>`, `<head>`, `<body>`).

Le wireframe peut utiliser les classes CSS du framework (tokens, elements, grid, etc.). Pour ajouter un nouveau wireframe, il suffit de créer un fichier `.html` dans le bon dossier de catégorie. Le catalogue se recharge automatiquement au prochain accès.

## Module JS

Le catalogue de wireframes est géré par deux modules :

- `builder-wireframes.js` — gère le catalogue dans la sidebar Bibliothèque
- `builder-canvas.js` — gère le catalogue dans le panneau éditeur

Les deux modules utilisent l'API commune :

| Méthode | Description |
|---|---|
| `BuilderAPI.wireframesCatalog()` | Récupère la liste complète des catégories et fichiers wireframes disponibles. |
| `BuilderAPI.wireframeRead(category, file)` | Lit le contenu HTML d'un wireframe spécifique à partir de sa catégorie et de son nom de fichier. |

## Voir aussi

- [Wireframes](wireframes.md)
- [Builder — Pages](builder-pages.md)
- [Builder — Vue d'ensemble](builder-overview.md)
- [Composants](components.md)
