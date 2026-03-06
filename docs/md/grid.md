# Grid / Bento

Système de grille flexible et layouts bento via classes CSS et attributs `data-*`. Responsive par defaut, zero dependance.

## Grille simple

Ajoutez la classe `grid` et definissez le nombre de colonnes avec `data-cols` :

```html
<div class="grid" data-cols="3" data-gap="md">
  <div>Colonne 1</div>
  <div>Colonne 2</div>
  <div>Colonne 3</div>
</div>
```

### Colonnes

| Attribut / Classe | Colonnes |
|---|---|
| `data-cols="1"` ou `grid--1` | 1 colonne |
| `data-cols="2"` ou `grid--2` | 2 colonnes |
| `data-cols="3"` ou `grid--3` | 3 colonnes |
| `data-cols="4"` ou `grid--4` | 4 colonnes |
| `data-cols="5"` ou `grid--5` | 5 colonnes |
| `data-cols="6"` ou `grid--6` | 6 colonnes |

### Gap (espacement)

| Attribut / Classe | Espacement |
|---|---|
| `data-gap="none"` ou `grid--gap-none` | 0 |
| `data-gap="xs"` ou `grid--gap-xs` | var(--space-2) |
| `data-gap="sm"` ou `grid--gap-sm` | var(--space-4) |
| `data-gap="md"` ou `grid--gap-md` | var(--space-6) — defaut |
| `data-gap="lg"` ou `grid--gap-lg` | var(--space-8) |
| `data-gap="xl"` ou `grid--gap-xl` | var(--space-12) grille / var(--space-10) bento |

### Alignement vertical

| Attribut | Effet |
|---|---|
| `data-align="start"` | Aligne en haut |
| `data-align="center"` | Centre verticalement |
| `data-align="end"` | Aligne en bas |
| `data-align="stretch"` | Etire (defaut) |

## Span (items)

Un élément enfant peut occuper plusieurs colonnes ou lignes :

```html
<div class="grid" data-cols="3">
  <div data-col-span="2">Je prends 2 colonnes</div>
  <div>1 colonne</div>
  <div data-col-span="full">Toute la largeur</div>
</div>
```

| Attribut | Effet |
|---|---|
| `data-col-span="2"` a `"6"` | Occupe N colonnes |
| `data-col-span="full"` | Toute la largeur |
| `data-row-span="2"` a `"4"` | Occupe N lignes |

## Bento

Le système bento est une grille 4 colonnes avec des tailles prédéfinies pour créer des layouts asymetriques rapidement :

```html
<div class="bento" data-gap="md">
  <div class="bento__item" data-size="large">Grande carte</div>
  <div class="bento__item">Normal</div>
  <div class="bento__item">Normal</div>
  <div class="bento__item" data-size="wide">Large</div>
  <div class="bento__item" data-size="tall">Haute</div>
  <div class="bento__item">Normal</div>
</div>
```

### Tailles prédéfinies

| Attribut | Effet |
|---|---|
| (aucun) | 1 colonne, 1 ligne |
| `data-size="wide"` | 2 colonnes, 1 ligne |
| `data-size="tall"` | 1 colonne, 2 lignes |
| `data-size="large"` | 2 colonnes, 2 lignes |
| `data-size="full"` | Toute la largeur |

Pour un controle plus fin, utilisez `data-col-span` et `data-row-span` directement sur les `.bento__item`.

### Hauteur des lignes

| Attribut | Hauteur minimum |
|---|---|
| `data-row-height="sm"` | 120px |
| `data-row-height="md"` | 180px (defaut) |
| `data-row-height="lg"` | 240px |
| `data-row-height="xl"` | 320px |

## Layouts prédéfinis

Des layouts courants sont disponibles via `data-layout` :

| Layout | Description |
|---|---|
| `data-layout="sidebar"` | 2/3 + 1/3 (contenu + sidebar droite) |
| `data-layout="sidebar-left"` | 1/3 + 2/3 (sidebar gauche + contenu) |
| `data-layout="feature"` | 1 grande carte a gauche + 2 petites empilees a droite |

```html
<!-- Layout feature : 1 grande + 2 petites -->
<div class="bento" data-layout="feature" data-gap="md">
  <div class="bento__item">Mise en avant</div>
  <div class="bento__item">Detail 1</div>
  <div class="bento__item">Detail 2</div>
</div>
```

## Responsive

Toutes les grilles s'adaptent automatiquement selon 4 breakpoints :

| Breakpoint | Range | Grille |
|---|---|---|
| Desktop | >= 992px | Toutes les colonnes |
| Tablette | <= 991px | 5-6 cols → 3, bento → 3 colonnes |
| Mobile landscape | <= 767px | 3-6 cols → 2, bento → 2 cols, layouts → 1 col |
| Mobile | <= 478px | Tout passe en 1 colonne |

Les spans trop larges pour l'ecran sont automatiquement reduits.

## Inclure dans une page

```html
<link rel="stylesheet" href="core/css/grid.css">
```

Aucun JavaScript nécessaire. Tout fonctionne en CSS pur.

## Problèmes courants

- **Les colonnes ne s'affichent pas côté a côté :** vérifiez que `grid.css` est bien charge. L'attribut `data-cols` définit le nombre de colonnes.
- **Le bento est tout en une colonne :** la grille bento passe a 1 colonne sous 478px. Testez sur un ecran plus large ou reduisez le nombre de colonnes.
- **Un item deborde de la grille :** un `data-col-span` superieur au nombre de colonnes disponibles provoque un debordement. Le span est reduit automatiquement en responsive.

## Grid Builder (dans le Builder)

Le Builder inclut un panel **Grille** qui permet de configurer visuellement les layouts grille et bento :

1. Ouvrir le Builder et cliquer sur **Grille** dans la sidebar
2. Choisir le type : **Grille flexible** ou **Bento**
3. Configurer les options (colonnes, gap, alignement, layout prédéfini…)
4. Cliquer sur un item dans l'aperçu pour modifier son span (grille) ou sa taille (bento)
5. Copier le code HTML généré et le coller dans votre page

Le code généré utilise les attributs `data-*` du framework et fonctionne immédiatement avec `grid.css`.

## Voir aussi

- [Design Tokens (espacements)](tokens.html#espacements)
- [Animations](animations.html)
- [Wireframes](wireframes.html)
