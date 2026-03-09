# Icônes

324 icônes Heroicons en outline et solid. Cliquez sur une icône pour copier le snippet ou le SVG brut.

## Utilisation

Ajoutez l'attribut `data-icon` sur n'importe quel élément :

```html
<span data-icon="heart"></span>

<!-- Avec options -->
<span data-icon="heart"
      data-icon-type="solid"
      data-icon-size="32"
      data-icon-color="#ef4444"
      data-icon-animate="no"></span>
```

### Attributs

| Attribut | Valeur | Description |
|---|---|---|
| `data-icon="nom"` | Nom de l'icône | Requis — nom du fichier SVG (sans extension) |
| `data-icon-type` | `outline` \| `solid` | Style (défaut : `outline`) |
| `data-icon-size` | Nombre en px | Taille (défaut : `24`) |
| `data-icon-color` | Couleur CSS | Couleur (défaut : `currentColor`) |
| `data-icon-animate` | `draw-fade` \| `draw` \| `fade-up` \| `fade` \| `no` | Animation SVG au scroll (défaut : aucune) |

### Animation

Par défaut, les icônes sont statiques. Ajoutez `data-icon-animate` pour activer une animation au scroll :

| Valeur | Effet | Ideal pour |
|---|---|---|
| `draw-fade` | Dessin progressif + fondu (défaut outline) | Icônes outline |
| `draw` | Dessin progressif seul | Icônes outline |
| `fade-up` | Fondu + montée (défaut solid) | Icônes solid |
| `fade` | Fondu simple | Tous types |
| `no` | Aucune animation | — |

En plus, un léger `scale(1.15)` s'applique au survol du parent (`<a>`, `<button>`).

```html
<!-- Icône statique (par défaut) -->
<span data-icon="heart"></span>

<!-- Activer l'animation au scroll -->
<span data-icon="heart" data-icon-animate="true"></span>

<!-- Animation spécifique -->
<span data-icon="heart" data-icon-animate="draw"></span>

<!-- Sans animation (explicite) -->
<span data-icon="heart" data-icon-animate="no"></span>
```

### Inclure dans une page

```html
<link rel="stylesheet" href="core/css/icons.css">
<script src="core/js/icons.js" defer></script>
```

## Toutes les icônes

La page HTML contient une galerie interactive avec :

- **Recherche** : filtrage en temps réel par nom
- **Filtre outline/solid** : bascule entre les deux styles
- **Copie au clic** : snippet `data-icon` ou SVG brut selon le mode choisi
- **Configurateur d'animation** : sélecteur d'animation SVG avec preview en live et bouton "Rejouer". L'animation choisie est automatiquement incluse dans le snippet copié (`data-icon-animate="..."`)

### Animations disponibles dans le configurateur

Les animations proposées s'adaptent automatiquement au type d'icône sélectionné :

**Outline** (animations de tracé) :

| Animation | Effet |
|---|---|
| Draw + Fade | Dessin progressif du tracé + fondu |
| Draw | Dessin progressif du tracé seul |

**Solid** (animations d'opacité) :

| Animation | Effet |
|---|---|
| Fade Up | Fondu + montée |
| Fade | Fondu simple |

Liste complète des 324 icônes disponibles :

`academic-cap`, `adjustments-horizontal`, `adjustments-vertical`, `archive-box`, `archive-box-arrow-down`, `archive-box-x-mark`, `arrow-down`, `arrow-down-circle`, `arrow-down-left`, `arrow-down-on-square`, `arrow-down-on-square-stack`, `arrow-down-right`, `arrow-down-tray`, `arrow-left`, `arrow-left-circle`, `arrow-left-end-on-rectangle`, `arrow-left-on-rectangle`, `arrow-left-start-on-rectangle`, `arrow-long-down`, `arrow-long-left`, `arrow-long-right`, `arrow-long-up`, `arrow-path`, `arrow-path-rounded-square`, `arrow-right`, `arrow-right-circle`, `arrow-right-end-on-rectangle`, `arrow-right-on-rectangle`, `arrow-right-start-on-rectangle`, `arrow-small-down`, `arrow-small-left`, `arrow-small-right`, `arrow-small-up`, `arrow-top-right-on-square`, `arrow-trending-down`, `arrow-trending-up`, `arrow-turn-down-left`, `arrow-turn-down-right`, `arrow-turn-left-down`, `arrow-turn-left-up`, `arrow-turn-right-down`, `arrow-turn-right-up`, `arrow-turn-up-left`, `arrow-turn-up-right`, `arrow-up`, `arrow-up-circle`, `arrow-up-left`, `arrow-up-on-square`, `arrow-up-on-square-stack`, `arrow-up-right`, `arrow-up-tray`, `arrow-uturn-down`, `arrow-uturn-left`, `arrow-uturn-right`, `arrow-uturn-up`, `arrows-pointing-in`, `arrows-pointing-out`, `arrows-right-left`, `arrows-up-down`, `at-symbol`, `backspace`, `backward`, `banknotes`, `bars-2`, `bars-3`, `bars-3-bottom-left`, `bars-3-bottom-right`, `bars-3-center-left`, `bars-4`, `bars-arrow-down`, `bars-arrow-up`, `battery-0`, `battery-100`, `battery-50`, `beaker`, `bell`, `bell-alert`, `bell-slash`, `bell-snooze`, `bold`, `bolt`, `bolt-slash`, `book-open`, `bookmark`, `bookmark-slash`, `bookmark-square`, `briefcase`, `bug-ant`, `building-library`, `building-office`, `building-office-2`, `building-storefront`, `cake`, `calculator`, `calendar`, `calendar-date-range`, `calendar-days`, `camera`, `chart-bar`, `chart-bar-square`, `chart-pie`, `chat-bubble-bottom-center`, `chat-bubble-bottom-center-text`, `chat-bubble-left`, `chat-bubble-left-ellipsis`, `chat-bubble-left-right`, `chat-bubble-oval-left`, `chat-bubble-oval-left-ellipsis`, `check`, `check-badge`, `check-circle`, `chevron-double-down`, `chevron-double-left`, `chevron-double-right`, `chevron-double-up`, `chevron-down`, `chevron-left`, `chevron-right`, `chevron-up`, `chevron-up-down`, `circle-stack`, `clipboard`, `clipboard-document`, `clipboard-document-check`, `clipboard-document-list`, `clock`, `cloud`, `cloud-arrow-down`, `cloud-arrow-up`, `code-bracket`, `code-bracket-square`, `cog`, `cog-6-tooth`, `cog-8-tooth`, `command-line`, `computer-desktop`, `cpu-chip`, `credit-card`, `cube`, `cube-transparent`, `currency-bangladeshi`, `currency-dollar`, `currency-euro`, `currency-pound`, `currency-rupee`, `currency-yen`, `cursor-arrow-rays`, `cursor-arrow-ripple`, `device-phone-mobile`, `device-tablet`, `divide`, `document`, `document-arrow-down`, `document-arrow-up`, `document-chart-bar`, `document-check`, `document-currency-bangladeshi`, `document-currency-dollar`, `document-currency-euro`, `document-currency-pound`, `document-currency-rupee`, `document-currency-yen`, `document-duplicate`, `document-magnifying-glass`, `document-minus`, `document-plus`, `document-text`, `ellipsis-horizontal`, `ellipsis-horizontal-circle`, `ellipsis-vertical`, `envelope`, `envelope-open`, `equals`, `exclamation-circle`, `exclamation-triangle`, `eye`, `eye-dropper`, `eye-slash`, `face-frown`, `face-smile`, `film`, `finger-print`, `fire`, `flag`, `folder`, `folder-arrow-down`, `folder-minus`, `folder-open`, `folder-plus`, `forward`, `funnel`, `gif`, `gift`, `gift-top`, `globe-alt`, `globe-americas`, `globe-asia-australia`, `globe-europe-africa`, `h1`, `h2`, `h3`, `hand-raised`, `hand-thumb-down`, `hand-thumb-up`, `hashtag`, `heart`, `home`, `home-modern`, `identification`, `inbox`, `inbox-arrow-down`, `inbox-stack`, `information-circle`, `italic`, `key`, `language`, `lifebuoy`, `light-bulb`, `link`, `link-slash`, `list-bullet`, `lock-closed`, `lock-open`, `magnifying-glass`, `magnifying-glass-circle`, `magnifying-glass-minus`, `magnifying-glass-plus`, `map`, `map-pin`, `megaphone`, `microphone`, `minus`, `minus-circle`, `minus-small`, `moon`, `musical-note`, `newspaper`, `no-symbol`, `numbered-list`, `paint-brush`, `paper-airplane`, `paper-clip`, `pause`, `pause-circle`, `pencil`, `pencil-square`, `percent-badge`, `phone`, `phone-arrow-down-left`, `phone-arrow-up-right`, `phone-x-mark`, `photo`, `play`, `play-circle`, `play-pause`, `plus`, `plus-circle`, `plus-small`, `power`, `presentation-chart-bar`, `presentation-chart-line`, `printer`, `puzzle-piece`, `qr-code`, `question-mark-circle`, `queue-list`, `radio`, `receipt-percent`, `receipt-refund`, `rectangle-group`, `rectangle-stack`, `rocket-launch`, `rss`, `scale`, `scissors`, `server`, `server-stack`, `share`, `shield-check`, `shield-exclamation`, `shopping-bag`, `shopping-cart`, `signal`, `signal-slash`, `slash`, `sparkles`, `speaker-wave`, `speaker-x-mark`, `square-2-stack`, `square-3-stack-3d`, `squares-2x2`, `squares-plus`, `star`, `stop`, `stop-circle`, `strikethrough`, `sun`, `swatch`, `table-cells`, `tag`, `ticket`, `trash`, `trophy`, `truck`, `tv`, `underline`, `user`, `user-circle`, `user-group`, `user-minus`, `user-plus`, `users`, `variable`, `video-camera`, `video-camera-slash`, `view-columns`, `viewfinder-circle`, `wallet`, `wifi`, `window`, `wrench`, `wrench-screwdriver`, `x-circle`, `x-mark`

## Problèmes courants

- **L'icône ne s'affiche pas :** vérifiez que `icons.js` est chargé avec `defer` et que le nom de l'icône existe dans `assets/icons/`.
- **L'icône reste invisible :** ne pas ajouter `data-icon-animate` sur de petites icônes (<24px) dans des boutons — l'animation démarre à `opacity: 0` et attend le scroll.
- **La couleur ne change pas :** l'icône hérite de `currentColor` via CSS. Appliquez la couleur sur le parent (`color: red`) ou utilisez `data-icon-color`.

## Voir aussi

- [Animations SVG](animations.md#animations-svg)
- [Éléments interactifs](elements.md)
- [Design Tokens](tokens.md)
