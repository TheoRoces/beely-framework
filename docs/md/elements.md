# Elements interactifs

Popup, Tooltip, Accordion, Tabs et Slider. Tous les elements sont **emboîtables** (nestable) et initialises automatiquement au chargement.

## Popup / Modal

Système de popup/modal avec overlay, fermeture par clic exterieur, touche Escape et bouton. Les popups sont empilables (nestable).

### Structure HTML

```html
<button data-popup-target="demo">Ouvrir le popup</button>

<div class="popup" data-popup="demo">
  <div class="popup__overlay"></div>
  <div class="popup__content">
    <button class="popup__close" data-popup-close>&times;</button>
    <h2>Titre du popup</h2>
    <p>Contenu du popup.</p>
  </div>
</div>
```

### Attributs

| Attribut | Role |
|---|---|
| `data-popup-target="id"` | Bouton qui ouvre le popup correspondant |
| `data-popup="id"` | Identifiant du popup |
| `data-popup-close` | Bouton de fermeture (dans le popup) |

### Fermeture

- Clic sur `.popup__overlay`
- Clic sur `[data-popup-close]`
- Touche `Escape` (ferme le dernier ouvert)

### Popups imbriqués

Les popups peuvent etre imbriqués. Le z-index est gere automatiquement par CSS (`.popup .popup` → z-index superieur). La touche Escape ferme toujours le dernier popup ouvert.

### Variantes de position

Ajoutez `data-popup-position` sur le `.popup` pour changer l'animation et la disposition :

| Valeur | Comportement |
|---|---|
| (aucune) | Centre (defaut) — animation scale + fade |
| `right` | Panneau lateral droit — pleine hauteur, max 480px, glisse depuis la droite |
| `left` | Panneau lateral gauche — pleine hauteur, max 480px, glisse depuis la gauche |
| `bottom` | Bottom sheet — pleine largeur, max 80vh, glisse depuis le bas |
| `top` | Panneau superieur — pleine largeur, max 80vh, glisse depuis le haut |

#### Popup centre (defaut)

```html
<button data-popup-target="demo">Ouvrir</button>
<div class="popup" data-popup="demo">
  <div class="popup__overlay"></div>
  <div class="popup__content">
    <button class="popup__close" data-popup-close>&times;</button>
    <h2>Titre</h2>
    <p>Contenu du popup.</p>
  </div>
</div>
```

#### Panneau droit

```html
<button data-popup-target="menu">Menu</button>
<div class="popup" data-popup="menu" data-popup-position="right">
  <div class="popup__overlay"></div>
  <div class="popup__content">
    <button class="popup__close" data-popup-close>&times;</button>
    <h2>Menu</h2>
  </div>
</div>
```

#### Panneau gauche

```html
<button data-popup-target="sidebar">Sidebar</button>
<div class="popup" data-popup="sidebar" data-popup-position="left">
  <div class="popup__overlay"></div>
  <div class="popup__content">
    <button class="popup__close" data-popup-close>&times;</button>
    <h2>Sidebar</h2>
  </div>
</div>
```

#### Bottom sheet

```html
<button data-popup-target="sheet">Bottom sheet</button>
<div class="popup" data-popup="sheet" data-popup-position="bottom">
  <div class="popup__overlay"></div>
  <div class="popup__content">
    <button class="popup__close" data-popup-close>&times;</button>
    <p>Contenu en bas.</p>
  </div>
</div>
```

#### Panneau haut

```html
<button data-popup-target="top-panel">Panneau haut</button>
<div class="popup" data-popup="top-panel" data-popup-position="top">
  <div class="popup__overlay"></div>
  <div class="popup__content">
    <button class="popup__close" data-popup-close>&times;</button>
    <p>Contenu en haut.</p>
  </div>
</div>
```

Sur mobile (≤ 767px), les panneaux lateraux passent en pleine largeur automatiquement.

### Classes CSS

| Classe | Description |
|---|---|
| `.popup` | Conteneur principal (cache par defaut) |
| `.popup--active` | Popup visible (ajoute par JS) |
| `.popup__overlay` | Fond semi-transparent |
| `.popup__content` | Boite de contenu (animation scale + fade) |
| `.popup__close` | Bouton de fermeture (positionne en haut a droite) |

### Attributs recapitulatifs

| Attribut | Role |
|---|---|
| `data-popup-target="id"` | Bouton qui ouvre le popup correspondant |
| `data-popup="id"` | Identifiant du popup |
| `data-popup-close` | Bouton de fermeture (dans le popup) |
| `data-popup-position="right\|left\|bottom\|top"` | Variante de position (optionnel) |

## Tooltip

Bulle d'information au survol ou au focus. Repositionnement automatique si la bulle deborde de la fenetre.

### Utilisation

```html
<span data-tooltip="Texte de la bulle">Survolez-moi</span>

<!-- Avec position -->
<span data-tooltip="Info" data-tooltip-pos="bottom">En bas</span>
<span data-tooltip="Info" data-tooltip-pos="left">A gauche</span>
<span data-tooltip="Info" data-tooltip-pos="right">A droite</span>
```

### Attributs

| Attribut | Description |
|---|---|
| `data-tooltip="texte"` | Texte de la bulle |
| `data-tooltip-pos` | Position : `top` (defaut), `bottom`, `left`, `right` |

### Repositionnement automatique

Si la bulle deborde du viewport, elle se repositionne automatiquement (ex. `top` → `bottom` si pas de place en haut).

### Classes CSS

| Classe | Description |
|---|---|
| `.tooltip` | Ajoutée automatiquement a l'element parent |
| `.tooltip__bubble` | Bulle de texte (creee dynamiquement) |
| `.tooltip__bubble--top/bottom/left/right` | Variantes de position |
| `.tooltip__bubble--visible` | Bulle visible (avec transition) |

## Accordion

Panneaux depliables avec animation CSS Grid. Support du mode multiple et de l'imbrication.

### Structure HTML

```html
<div class="accordion">
  <div class="accordion__item">
    <button class="accordion__header">Section 1</button>
    <div class="accordion__body">
      <div>Contenu du panneau 1.</div>
    </div>
  </div>
  <div class="accordion__item">
    <button class="accordion__header">Section 2</button>
    <div class="accordion__body">
      <div>Contenu du panneau 2.</div>
    </div>
  </div>
</div>
```

### Mode multiple

Par defaut, un seul panneau est ouvert a la fois. Ajoutez `data-accordion-multi` pour permettre l'ouverture de plusieurs panneaux simultanement :

```html
<div class="accordion" data-accordion-multi>
  ...
</div>
```

### Accordion imbrique

Les accordeons peuvent etre imbriqués. Chaque niveau gere ses propres items independamment :

```html
<div class="accordion">
  <div class="accordion__item">
    <button class="accordion__header">Parent</button>
    <div class="accordion__body">
      <div>
        <div class="accordion">
          <div class="accordion__item">
            <button class="accordion__header">Enfant</button>
            <div class="accordion__body">
              <div>Contenu imbrique.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Classes CSS

| Classe | Description |
|---|---|
| `.accordion` | Conteneur principal (bordure + arrondi) |
| `.accordion__item` | Un panneau individuel |
| `.accordion__item--active` | Panneau ouvert (ajoute par JS) |
| `.accordion__header` | En-tete cliquable (bouton) |
| `.accordion__body` | Contenu (animation via `grid-template-rows`) |

## Tabs

Système d'onglets avec navigation et panneaux. Support de l'imbrication.

### Scroll automatique

Quand les onglets debordent, la barre de navigation scrolle horizontalement avec des dégradés indicateurs. Le tab actif est automatiquement centre.

### Structure HTML

```html
<div class="tabs">
  <div class="tabs__nav">
    <button class="tabs__tab" data-tab="tab1">Onglet 1</button>
    <button class="tabs__tab" data-tab="tab2">Onglet 2</button>
    <button class="tabs__tab" data-tab="tab3">Onglet 3</button>
  </div>
  <div class="tabs__panel" data-tab-panel="tab1">Contenu 1</div>
  <div class="tabs__panel" data-tab-panel="tab2">Contenu 2</div>
  <div class="tabs__panel" data-tab-panel="tab3">Contenu 3</div>
</div>
```

### Onglet actif par defaut

Par defaut, le premier onglet est actif. Ajoutez `data-tab-active` pour choisir un autre :

```html
<button class="tabs__tab" data-tab="tab2" data-tab-active>Onglet 2</button>
```

### Attributs

| Attribut | Description |
|---|---|
| `data-tab="id"` | Identifiant de l'onglet (sur le bouton) |
| `data-tab-panel="id"` | Identifiant du panneau associe |
| `data-tab-active` | Onglet actif au chargement (optionnel) |

### Classes CSS

| Classe | Description |
|---|---|
| `.tabs` | Conteneur principal |
| `.tabs__nav` | Barre de navigation (scroll horizontal automatique avec fades indicateurs) |
| `.tabs__nav-wrapper` | Wrapper auto-généré par JS — affiche des dégradés gauche/droite quand la nav deborde |
| `.tabs__tab` | Bouton d'onglet |
| `.tabs__tab--active` | Onglet actif (souligne en couleur primaire) |
| `.tabs__panel` | Panneau de contenu (cache par defaut) |
| `.tabs__panel--active` | Panneau visible |

## Slider / Carousel

Carousel avec navigation par boutons, dots, swipe tactile, drag souris, autoplay et boucle. Support multi-slides.

### Structure HTML

```html
<!-- Slider basique (1 slide visible) -->
<div class="slider">
  <div class="slider__track">
    <div class="slider__slide">Slide 1</div>
    <div class="slider__slide">Slide 2</div>
    <div class="slider__slide">Slide 3</div>
  </div>
  <button class="slider__prev"></button>
  <button class="slider__next"></button>
  <div class="slider__dots"></div>
</div>

<!-- Slider responsive multi-slides -->
<div class="slider"
     data-slider-per-view="3 2 2 1"
     data-slider-loop="true"
     data-slider-drag="true"
     data-slider-gap="md">
  <div class="slider__track">
    <div class="slider__slide">Slide 1</div>
    <div class="slider__slide">Slide 2</div>
    <div class="slider__slide">Slide 3</div>
    <div class="slider__slide">Slide 4</div>
    <div class="slider__slide">Slide 5</div>
    <div class="slider__slide">Slide 6</div>
  </div>
  <button class="slider__prev"></button>
  <button class="slider__next"></button>
  <div class="slider__dots"></div>
</div>
```

Le format `data-slider-per-view="3 2 2 1"` définit le nombre de slides visibles par breakpoint : **desktop** **tablette** **mobile-paysage** **mobile**. Les valeurs cascadent : `"3"` = 3 slides sur tous les ecrans, `"3 2"` = 3 desktop + 2 pour le reste.

### Attributs

| Attribut | Valeur | Description |
|---|---|---|
| `data-slider-per-view` | `"3"` ou `"4 3 2 1"` | Slides visibles par breakpoint : `desktop [tablet] [mobile-landscape] [mobile]`. Cascade auto si moins de 4 valeurs. |
| `data-slider-loop` | `true` | Boucle infinie |
| `data-slider-auto` | `3000` | Defilement auto en ms (pause au survol) |
| `data-slider-drag` | `true` | Drag a la souris (en plus du swipe tactile) |
| `data-slider-gap` | `xs` \| `sm` \| `md` \| `lg` \| `xl` | Espacement entre les slides |
| `data-slider-dots` | `false` | Masquer les dots de navigation |
| `data-slider-arrows` | `false` | Masquer les fleches de navigation |

### Personnalisation des fleches

Les fleches utilisent par defaut les icones chevron. Personnalisez-les via ces attributs sur le `.slider` :

| Attribut | Valeur | Description |
|---|---|---|
| `data-slider-arrow-prev` | Nom d'icone | Icone du bouton precedent (ex: `arrow-left`) |
| `data-slider-arrow-next` | Nom d'icone | Icone du bouton suivant (ex: `arrow-right`) |
| `data-slider-arrow-type` | `outline` \| `solid` | Type d'icone (defaut : `outline`) |
| `data-slider-arrow-size` | Nombre en px | Taille de l'icone SVG (defaut : `20`) |

```html
<div class="slider"
     data-slider-arrow-prev="arrow-left"
     data-slider-arrow-next="arrow-right"
     style="--slider-arrow-color: #fff; --slider-arrow-bg: var(--color-primary);">
  ...
</div>
```

Les icones sont chargées depuis le système d'icones (`icons.js`). Les styles peuvent aussi etre definis via les CSS custom properties `--slider-arrow-*` directement en CSS.

### CSS custom properties

| Variable | Description |
|---|---|
| `--slider-arrow-size` | Taille du bouton |
| `--slider-arrow-color` | Couleur de l'icone |
| `--slider-arrow-hover-color` | Couleur au survol |
| `--slider-arrow-bg` | Fond du bouton |
| `--slider-arrow-hover-bg` | Fond au survol |
| `--slider-arrow-border` | Couleur de bordure |

### Navigation

- **Boutons** : `.slider__prev` et `.slider__next` (optionnels)
- **Dots** : `.slider__dots` (générés automatiquement par JS, optionnel)
- **Swipe** : tactile natif (seuil 50px)
- **Drag souris** : active via `data-slider-drag="true"`

### Exemple complet

```html
<div class="slider"
     data-slider-per-view="2"
     data-slider-loop="true"
     data-slider-auto="4000"
     data-slider-drag="true"
     data-slider-gap="md"
     data-slider-arrow-prev="arrow-left"
     data-slider-arrow-next="arrow-right"
     style="--slider-arrow-color: #fff; --slider-arrow-bg: var(--color-primary);">
  <div class="slider__track">
    <div class="slider__slide"><img src="img/1.jpg" alt=""></div>
    <div class="slider__slide"><img src="img/2.jpg" alt=""></div>
    <div class="slider__slide"><img src="img/3.jpg" alt=""></div>
    <div class="slider__slide"><img src="img/4.jpg" alt=""></div>
  </div>
  <button class="slider__prev"></button>
  <button class="slider__next"></button>
  <div class="slider__dots"></div>
</div>
```

### Classes CSS

| Classe | Description |
|---|---|
| `.slider` | Conteneur principal (`overflow: hidden`) |
| `.slider__track` | Piste flex (`translateX` pour la navigation) |
| `.slider__slide` | Un slide individuel |
| `.slider__prev`, `.slider__next` | Boutons fleches (positionnes en absolu) |
| `.slider__dots` | Conteneur des points de navigation |
| `.slider__dot` | Point individuel (créé par JS) |
| `.slider__dot--active` | Point actif |

## API JavaScript

| Fonction | Fichier | Description |
|---|---|---|
| `initElements(root)` | elements.js | Initialise popups, tooltips, accordions, tabs, sliders dans `root` (defaut : `document`). |
| `initAnimations(root)` | animations.js | Initialise les animations scroll + clic dans `root`. |
| `initIcons(root)` | icons.js | Charge les icones SVG `[data-icon]` dans `root`. |
| `initForms(root)` | forms.js | Initialise formulaires, validation, multi-steps dans `root`. |
| `renderComponents(root)` | components.js | Rend les `[data-component]` dans `root`. |
| `showToast(message, type, duration)` | forms.js | Affiche une notification toast. Types : `'success'`, `'error'`, `'warning'`, `'info'`. |
| `toggleTheme()` | darkmode.js | Bascule entre light et dark mode. |
| `openCookieSettings()` | cookies.js | Ouvre le panneau de gestion des cookies. |
| `getUrlParams()` | params.js | Retourne un objet avec tous les paramètres URL. |
| `getUTMs()` | params.js | Retourne un objet avec les UTMs persistants. |
| `fetchIconSvg(type, name, cb)` | icons.js | Recupere le SVG brut d'une icone via callback. |
| `registerComponent(name, fn)` | components.js | Enregistre un composant. `fn(slots)` retourne du HTML. |
| `escapeSlotHtml(str)` | components.js | Echappe les caracteres HTML (anti-XSS pour les slots texte). |

Toutes ces fonctions sont appelees automatiquement au `DOMContentLoaded`. Appelez-les manuellement apres avoir injecte du HTML dynamique :

```js
// Apres injection de HTML dynamique
initElements(monConteneur);
initAnimations(monConteneur);
initIcons(monConteneur);
```

## Inclure dans une page

```html
<link rel="stylesheet" href="core/css/elements.css">
<script src="core/js/elements.js" defer></script>
```

## Problèmes courants

- **Le slider ne fonctionne pas :** vérifiez que `elements.js` est charge avec `defer`. La classe `.slider` doit etre presente sur le conteneur.
- **Le popup ne s'ouvre pas :** le `data-popup-target` du bouton doit correspondre exactement au `data-popup` du popup.
- **Les tabs ne changent pas :** chaque `data-tab` doit avoir un `data-tab-panel` correspondant avec la même valeur.
- **L'accordion ne se deplie pas :** l'attribut `data-accordion-multi` est nécessaire pour permettre l'ouverture simultanee de plusieurs panneaux.
- **Le slider drag ne marche pas sur mobile :** ajoutez `data-slider-drag="true"` au conteneur.

## Accessibilite

- Les **popups** se ferment avec la touche `Escape`.
- Les **accordions** s'ouvrent/ferment au clic.
- Les **tooltips** apparaissent au focus clavier en plus du hover.
- Les **tabs** changent de panneau au clic.
- Les **sliders** se controlent via les boutons, le drag tactile et l'autoplay.
- Toutes les animations respectent `prefers-reduced-motion`.

## Voir aussi

- [Animations](animations.html)
- [Icones](icons.html)
- [Formulaires](forms.html)
- [Composants](components.html)
