# Design Tokens

Fichier `core/css/tokens.css` -- le seul fichier à modifier pour configurer la charte graphique du client.

## Couleurs

Modifiez **uniquement les 4 couleurs de base** -- toutes les variantes (transparent, light, dark) se génèrent automatiquement via `color-mix()`.

```css
:root {
  --primary: #1E69FE;   /* A modifier */
  --secondary: #8b5cf6; /* A modifier */
  --tertiary: #ec4899;  /* A modifier */
  --accent: #f59e0b;    /* A modifier */
}
```

### Couleurs de base

- `--primary`
- `--secondary`
- `--tertiary`
- `--accent`

### Variantes auto-générées (primary)

Changez `--primary` et toutes ces variantes se recalculent :

**Transparent (t)**

`--primary-t-1`, `--primary-t-2`, `--primary-t-3`, `--primary-t-4`, `--primary-t-5`, `--primary-t-6`

**Light (l)**

`--primary-l-1`, `--primary-l-2`, `--primary-l-3`, `--primary-l-4`, `--primary-l-5`, `--primary-l-6`

**Dark (d)**

`--primary-d-1`, `--primary-d-2`, `--primary-d-3`, `--primary-d-4`, `--primary-d-5`, `--primary-d-6`

Le même système existe pour `--secondary-*`, `--tertiary-*`, `--accent-*` et `--neutral-*`.

### Semantique & fond

- `--success`
- `--error`
- `--warning`
- `--neutral`
- `--black`
- `--white`

### Nomenclature des variantes

| Suffixe | Type | Exemple |
|---------|------|---------|
| `-t-1` a `-t-6` | Transparent (opacite decroissante) | `var(--primary-t-3)` |
| `-l-1` a `-l-6` | Light (melange avec blanc) | `var(--primary-l-4)` |
| `-d-1` a `-d-6` | Dark (melange avec noir) | `var(--primary-d-2)` |

## Polices

Le système utilise des **polices locales uniquement** (RGPD, pas d'appel vers Google Fonts). Les fichiers sont dans `assets/fonts/`.

### Configuration

```css
:root {
  --font-body: 'Inter', system-ui, sans-serif;    /* Texte courant */
  --font-heading: 'Inter', system-ui, sans-serif;  /* Titres h1-h6 */
  --font-mono: 'SF Mono', 'Fira Code', monospace;  /* Code */
}
```

`--font-body` s'applique au body, `--font-heading` s'applique automatiquement aux titres h1-h6. Vous pouvez utiliser deux polices différentes pour le body et les titres.

### Changer de police

1. Placez vos fichiers `.ttf` ou `.woff2` dans `assets/fonts/`
2. Modifiez les `@font-face` en haut de `tokens.css`
3. Mettez a jour `--font-body` et/ou `--font-heading`

```css
/* Exemple : police statique (non-variable) */
@font-face {
  font-family: 'MaPolice';
  src: url('../../assets/fonts/MaPolice-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'MaPolice';
  src: url('../../assets/fonts/MaPolice-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-body: 'MaPolice', system-ui, sans-serif;
  --font-heading: 'MaPolice', system-ui, sans-serif;
}
```

### Animations Variable Font

Si votre police est **variable** (comme Inter), vous pouvez animer le poids de la police. Si la police n'est pas variable, l'animation est ignoree silencieusement.

```html
<!-- Poids 400→700 au hover -->
<h2 class="anim-font-weight-hover">Survolez-moi</h2>

<!-- Poids 400→700 au scroll -->
<h2 class="anim-font-weight-scroll">Apparition au scroll</h2>

<!-- Boucle infinie -->
<h2 class="anim-font-weight-loop">Boucle infinie</h2>
```

```html
<!-- Custom : poids et duree personnalises -->
<h2 class="anim-font-weight-loop"
    data-font-from="200"
    data-font-to="900"
    data-font-duration="3s">
  Boucle custom
</h2>
```

| Attribut | Défaut | Description |
|----------|--------|-------------|
| `data-font-from` | 400 | Poids de depart |
| `data-font-to` | 700 | Poids d'arrivee |
| `data-font-duration` | 0.4s (hover/scroll), 2s (loop) | Duree de la transition |

## Tailles de texte (dynamiques)

Les tailles utilisent `clamp()` pour s'adapter automatiquement entre mobile et desktop :

```css
:root {
  --text-xs:  clamp(0.7rem, 0.66rem + 0.2vw, 0.75rem);
  --text-sm:  clamp(0.8rem, 0.76rem + 0.2vw, 0.875rem);
  --text-base: clamp(0.9rem, 0.86rem + 0.2vw, 1rem);
  --text-lg:  clamp(1rem, 0.93rem + 0.35vw, 1.125rem);
  --text-xl:  clamp(1.1rem, 1rem + 0.5vw, 1.25rem);
  --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-3xl: clamp(1.5rem, 1.2rem + 1.5vw, 1.875rem);
  --text-4xl: clamp(1.75rem, 1.35rem + 2vw, 2.25rem);
  --text-5xl: clamp(2rem, 1.4rem + 3vw, 3rem);
}
```

## Border Radius

```css
:root {
  --radius-sm: 0.25rem;    /* 4px  — inputs, badges */
  --radius-md: 0.5rem;     /* 8px  — boutons, cards */
  --radius-lg: 0.75rem;    /* 12px — modals, sections */
  --radius-xl: 1rem;       /* 16px — grandes cards */
  --radius-2xl: 1.5rem;    /* 24px — hero sections */
  --radius-full: 9999px;   /* pills, avatars */
}
```

## Ombres

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## Mapping interne

Le bas du fichier `tokens.css` contient un mapping qui connecte vos variables simples aux noms utilisés par les composants. **Ne modifiez pas cette section** -- elle garantit que tout le système utilise vos valeurs.

```css
/* Mapping interne — Ne pas modifier */
--color-primary: var(--primary);
--color-primary-dark: var(--primary-d-2);
--color-secondary: var(--secondary);
/* ... etc */
```

## Mode sombre (Dark Mode)

Le système de theme sombre fonctionne par surcharge des variables CSS dans `tokens.css`.

### Fonctionnement

Un bloc `[data-theme="dark"]` a la fin de `tokens.css` surcharge les variables brutes (`--text`, `--bg`, `--bg-alt`, etc.). Les mappings internes (`--color-text`, `--color-bg`...) heritent automatiquement.

### Inclure le script

Ajoutez le script **en synchrone** dans le `<head>`, avant les CSS, pour eviter un flash de theme :

```html
<script src="core/js/darkmode.js"></script>
```

### Bouton toggle

Le header intègre automatiquement un bouton toggle soleil/lune avec animation. Vous pouvez aussi créer votre propre toggle avec l'attribut `data-theme-toggle` :

```html
<!-- Toggle SVG soleil/lune (intégré dans le header) -->
<button class="header__theme-toggle" data-theme-toggle
        aria-label="Basculer le theme">
  <!-- Soleil (visible en light) -->
  <svg class="header__theme-icon header__theme-icon--sun" ...>...</svg>
  <!-- Lune (visible en dark) -->
  <svg class="header__theme-icon header__theme-icon--moon" ...>...</svg>
</button>

<!-- Toggle simple (texte) -->
<button data-theme-toggle>Mode sombre</button>
```

### Comportement

- Vérifie d'abord `localStorage`, puis `prefers-color-scheme` du système
- Persiste le choix dans `localStorage` (cle : `site-system-theme`)
- Si l'utilisateur n'a pas fait de choix, suit la préférence système automatiquement
- Fonction globale : `window.toggleTheme()`

### Personnaliser les couleurs sombres

Modifiez le bloc `[data-theme="dark"]` en fin de `tokens.css` :

```css
[data-theme="dark"] {
  --text: #e5e7eb;
  --text-light: #9ca3af;
  --bg: #111827;
  --bg-alt: #1f2937;
  --border: #374151;
  --border-dark: #4b5563;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}
```

## Espacements

Utilisés pour les marges, paddings et gaps dans tout le framework :

| Token | Valeur |
|-------|--------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |
| `--space-20` | 5rem (80px) |
| `--space-24` | 6rem (96px) |

## Font weights

| Token | Valeur |
|-------|--------|
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

## Transitions

Utilisees pour les animations hover, focus et changements d'etat :

| Token | Valeur |
|-------|--------|
| `--transition-fast` | 150ms ease |
| `--transition-base` | 250ms ease |
| `--transition-slow` | 400ms ease |

## Layout

Definissent la largeur maximale et le padding du conteneur `.container` :

| Token | Valeur | Description |
|-------|--------|-------------|
| `--container-max` | 1200px | Largeur maximale du conteneur |
| `--container-padding` | var(--space-6) (1.5rem) | Padding horizontal du conteneur |

### Problèmes courants

- **Les couleurs ne changent pas :** vérifiez que `tokens.css` est bien charge *avant* les autres fichiers CSS.
- **La police ne s'affiche pas :** vérifiez que les fichiers `.woff2` sont dans `assets/fonts/` et que le `@font-face` dans `tokens.css` pointe vers le bon chemin.
- **Le dark mode ne fonctionne pas :** assurez-vous que `darkmode.js` est charge de facon synchrone (sans `defer`) dans le `<head>`, avant les CSS.
- **L'animation de poids de police ne fonctionne pas :** seules les polices **variables** supportent cette animation. Vérifiez que votre police est au format variable font.

### Voir aussi

- [Animations](animations.md)
- [Icones](icons.md)
- [Grid / Bento](grid.md)
- [Démarrer un projet](getting-started.md)
