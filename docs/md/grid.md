# Grid / Bento

Système de grille flexible et layouts bento via classes CSS et attributs `data-*`. Responsive par défaut, zero dépendance.

## Grille simple

Ajoutez la classe `grid` et définissez le nombre de colonnes avec `data-cols` :

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
| `data-gap="md"` ou `grid--gap-md` | var(--space-6) — défaut |
| `data-gap="lg"` ou `grid--gap-lg` | var(--space-8) |
| `data-gap="xl"` ou `grid--gap-xl` | var(--space-12) grille / var(--space-10) bento |

### Alignement vertical

| Attribut | Effet |
|---|---|
| `data-align="start"` | Aligne en haut |
| `data-align="center"` | Centre verticalement |
| `data-align="end"` | Aligne en bas |
| `data-align="stretch"` | Étire (défaut) |

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
| `data-col-span="2"` à `"6"` | Occupe N colonnes |
| `data-col-span="full"` | Toute la largeur |
| `data-row-span="2"` à `"4"` | Occupe N lignes |

## Bento

Le système bento est une grille 4 colonnes avec des tailles prédéfinies pour créer des layouts asymétriques rapidement :

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

Pour un contrôle plus fin, utilisez `data-col-span` et `data-row-span` directement sur les `.bento__item`.

### Hauteur des lignes

| Attribut | Hauteur minimum |
|---|---|
| `data-row-height="sm"` | 120px |
| `data-row-height="md"` | 180px (défaut) |
| `data-row-height="lg"` | 240px |
| `data-row-height="xl"` | 320px |

## Layouts prédéfinis

Des layouts courants sont disponibles via `data-layout` :

| Layout | Description |
|---|---|
| `data-layout="sidebar"` | 2/3 + 1/3 (contenu + sidebar droite) |
| `data-layout="sidebar-left"` | 1/3 + 2/3 (sidebar gauche + contenu) |
| `data-layout="feature"` | 1 grande carte à gauche + 2 petites empilées à droite |

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

Les spans trop larges pour l'écran sont automatiquement réduits.

### Responsive personnalisé

Pour un contrôle fin du nombre de colonnes par breakpoint, **nommez votre grille** avec une classe CSS et ajoutez des media queries dans votre feuille de style :

```html
<!-- HTML -->
<div class="grid grid-services" data-cols="4" data-gap="md">
  <div>Service 1</div>
  <div>Service 2</div>
  <div>Service 3</div>
  <div>Service 4</div>
</div>

<!-- CSS responsive -->
<style>
@media (max-width: 991px) {
  .grid-services { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767px) {
  .grid-services { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 478px) {
  .grid-services { grid-template-columns: 1fr; }
}
</style>
```

Le [créateur de grilles](grid.html#grid-creator) génère automatiquement ce CSS quand vous configurez le responsive.

## Inclure dans une page

```html
<link rel="stylesheet" href="core/css/grid.css">
```

Aucun JavaScript nécessaire. Tout fonctionne en CSS pur.

## Problèmes courants

- **Les colonnes ne s'affichent pas côte à côte :** vérifiez que `grid.css` est bien chargé. L'attribut `data-cols` définit le nombre de colonnes.
- **Le bento est tout en une colonne :** la grille bento passe à 1 colonne sous 478px. Testez sur un écran plus large ou réduisez le nombre de colonnes.
- **Un item déborde de la grille :** un `data-col-span` supérieur au nombre de colonnes disponibles provoque un débordement. Le span est réduit automatiquement en responsive.

## Créateur de grilles

Un outil interactif est intégré directement dans [la page docs Grid](grid.html#grid-creator). Il permet de configurer visuellement vos layouts grille et bento, puis de copier le code HTML et CSS généré.

### Fonctionnalités

- **Deux modes :** *Grille flexible* (nombre de colonnes libre, spans personnalisés) et *Bento* (tailles prédéfinies, layouts).
- **Responsive complet :** nommez votre grille pour activer la barre de breakpoints et configurer colonnes et spans par breakpoint.
- **Aperçu adaptatif :** la preview change de largeur selon le breakpoint sélectionné (Desktop = 100%, Tablette = 768px, Mobile L = 480px, Mobile = 375px).
- **Sortie HTML + CSS :** le code généré inclut le HTML et, si un nom est défini, le CSS responsive complet avec media queries.

### Barre de breakpoints

Dès qu'un **nom de grille** est renseigné (ex : `grid-services`), une barre de breakpoints style Webflow apparaît avec 4 niveaux :

| Breakpoint | Seuil | Largeur de preview |
|---|---|---|
| Desktop | — | 100% |
| Tablette | ≤ 991px | 768px |
| Mobile L | ≤ 767px | 480px |
| Mobile | ≤ 478px | 375px |

Cliquez sur un breakpoint pour configurer le nombre de colonnes et les spans à ce niveau. Les breakpoints inférieurs **héritent** automatiquement des valeurs du breakpoint supérieur (système de cascade). Un bouton **Auto** permet de rétablir l'héritage si une valeur a été personnalisée.

### Nom de la grille et classes auto

Quand un nom est défini, le créateur génère des classes CSS automatiques pour chaque item :

```html
<!-- Avec nom "grid-services" -->
<div class="grid grid-services" data-cols="4">
  <div class="grid-services__item-1">Contenu 1</div>
  <div class="grid-services__item-2">Contenu 2</div>
  <div class="grid-services__item-3">Contenu 3</div>
  <div class="grid-services__item-4">Contenu 4</div>
</div>
```

Sans nom, le comportement classique avec `data-col-span` / `data-row-span` est utilisé.

### CSS responsive généré

Le bloc CSS inclut les media queries complètes :

- **Desktop :** les spans sont définis en CSS sans media query.
- **Breakpoints non-desktop :** chaque niveau génère une `@media (max-width: ...)` avec le `grid-template-columns` et les spans par item.

```css
/* Exemple de CSS généré */
/* Desktop */
.grid-services__item-1 {
  grid-column: span 2;
}

/* Tablette */
@media (max-width: 991px) {
  .grid-services {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-services__item-1 {
    grid-column: span 2;
  }
}

/* Mobile */
@media (max-width: 478px) {
  .grid-services {
    grid-template-columns: 1fr;
  }
}
```

### Utilisation du créateur

1. Choisissez le mode : **Grille flexible** ou **Bento**.
2. (Grille) Renseignez un **nom de grille** pour activer le responsive personnalisé.
3. Configurez les options globales (colonnes, gap, alignement).
4. Si un nom est défini, naviguez entre les **breakpoints** pour ajuster colonnes et spans.
5. **Cliquez sur un item** dans l'aperçu pour modifier son col-span et row-span (les valeurs héritées sont signalées par une bordure en pointillés).
6. Copiez le **code HTML** et le **CSS responsive** générés.

Le code généré utilise les attributs `data-*` du framework et fonctionne immédiatement avec `grid.css`.

## Voir aussi

- [Design Tokens (espacements)](tokens.html#espacements)
- [Animations](animations.html)
- [Wireframes](wireframes.html)
