# Animations

Animations d'entrée au scroll, de sortie, et au clic. Respect automatique de `prefers-reduced-motion`.

## Animations d'entrée (scroll)

Ajoutez simplement une classe CSS. L'élément s'anime quand il entre dans le viewport :

| Classe | Effet |
|---|---|
| `anim-fade-in` | Fondu |
| `anim-fade-in-up` | Fondu + montée |
| `anim-fade-in-down` | Fondu + descente |
| `anim-fade-in-left` | Fondu depuis la gauche |
| `anim-fade-in-right` | Fondu depuis la droite |
| `anim-scale-in` | Zoom avant |
| `anim-scale-in-up` | Zoom + montée |
| `anim-slide-in-up` | Glissement depuis le bas (fort) |
| `anim-slide-in-down` | Glissement depuis le haut (fort) |
| `anim-slide-in-left` | Glissement depuis la gauche |
| `anim-slide-in-right` | Glissement depuis la droite |
| `anim-rotate-in` | Rotation + zoom |

```html
<div class="anim-fade-in-up">Je m'anime au scroll</div>
```

## Modificateurs

### Délai

| Classe | Délai |
|---|---|
| `anim--delay-1` à `anim--delay-10` | 100ms à 1000ms (incréments de 100ms) |

### Durée

| Classe | Durée |
|---|---|
| `anim--duration-fast` | 300ms |
| `anim--duration-slow` | 1000ms |
| `anim--duration-slower` | 1500ms |

### Easing

| Classe | Effet |
|---|---|
| `anim--ease-bounce` | Rebond à l'arrivée |
| `anim--ease-elastic` | Élastique |
| `anim--ease-smooth` | Doux (décélération) |

```html
<div class="anim-fade-in-up anim--delay-3 anim--ease-bounce">
  Fondu + montée, délai 300ms, rebond
</div>
```

## Animations de sortie

Ajoutez `data-anim-exit="true"` pour que l'animation se redéclenche quand l'élément sort et revient dans le viewport :

```html
<div class="anim-fade-in-up" data-anim-exit="true">
  Animation re-déclenchable
</div>
```

## Animations au clic

| Classe | Effet |
|---|---|
| `anim-click-pulse` | Pulsation |
| `anim-click-shake` | Secousse |
| `anim-click-bounce` | Rebond vertical |
| `anim-click-ripple` | Effet ripple Material Design |

```html
<button class="btn btn--primary anim-click-ripple">
  Cliquez-moi
</button>
```

## Animations SVG

Animez vos SVG au scroll avec des classes simples. Idéal pour les icônes, graphiques et illustrations.

### Dessin de tracé (stroke)

Utilisez `--svg-length` pour définir la longueur du tracé (approximative, en pixels) :

```html
<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3">
  <circle class="anim-svg-draw" style="--svg-length: 283;"
          cx="60" cy="60" r="45" />
  <path class="anim-svg-draw anim--delay-3" style="--svg-length: 60;"
        d="M40 60 L55 75 L80 45" />
</svg>
```

| Classe | Effet |
|---|---|
| `anim-svg-draw` | Dessin progressif du tracé (stroke) |
| `anim-svg-draw-fade` | Dessin + fondu d'apparition |
| `anim-svg-fade` | Fondu simple (pour les éléments fill) |
| `anim-svg-fade-up` | Fondu + montée |
| `anim-svg-fill` | Animation de remplissage (fill-opacity) |

### Variable `--svg-length`

Définissez la longueur approximative du tracé SVG pour que l'animation fonctionne correctement. Vous pouvez obtenir cette valeur avec `path.getTotalLength()` dans la console.

### Modificateurs SVG

| Classe | Durée |
|---|---|
| `anim-svg--fast` | 0.8s |
| `anim-svg--slow` | 2.5s |
| `anim-svg--slower` | 4s |

Les modificateurs de délai standards (`anim--delay-1` à `anim--delay-10`) fonctionnent également avec les animations SVG.

## Animations Variable Font

Animez le poids des polices variables (comme Inter). Si la police n'est pas variable, l'animation est ignorée.

| Classe | Effet |
|---|---|
| `anim-font-weight-hover` | Poids 400 → 700 au survol |
| `anim-font-weight-scroll` | Poids 400 → 700 au scroll |
| `anim-font-weight-loop` | Boucle 400 ↔ 700 infinie |

```html
<h2 class="anim-font-weight-hover">Survolez-moi</h2>
<h2 class="anim-font-weight-scroll">Au scroll</h2>
<h2 class="anim-font-weight-loop">Boucle</h2>

<!-- Custom -->
<h2 class="anim-font-weight-loop"
    data-font-from="200"
    data-font-to="900"
    data-font-duration="3s">
  Boucle custom
</h2>
```

| Attribut | Défaut | Description |
|---|---|---|
| `data-font-from` | 400 | Poids de départ |
| `data-font-to` | 700 | Poids d'arrivée |
| `data-font-duration` | 0.4s / 2s (loop) | Durée |

## Créateur d'animations

Un outil interactif est intégré directement dans [la page docs Animations](animations.html#animation-creator). Il permet de :

1. Choisir un type d'animation (fade, scale, slide, rotate)
2. Configurer la durée, l'easing et le délai
3. Voir l'aperçu en direct
4. Copier le code HTML généré

Les animations au clic (pulse, shake, bounce, ripple) sont également disponibles avec copie rapide.

## Accessibilité

Toutes les animations (y compris SVG) respectent `prefers-reduced-motion: reduce`. Si l'utilisateur a désactivé les animations dans son système, tous les éléments apparaissent immédiatement sans animation.

## Problèmes courants

- **L'animation ne se déclenche pas :** vérifiez que `animations.js` est chargé avec `defer` et que l'élément a une classe `anim-*`.
- **L'élément reste invisible :** les animations démarrent à `opacity: 0`. Si l'élément n'est jamais dans le viewport, l'animation ne se déclenchera pas. Vérifiez qu'il n'est pas caché par un parent.
- **L'animation de sortie ne fonctionne pas :** ajoutez `data-anim-exit="true"` sur l'élément. L'animation s'inverse quand l'élément sort du viewport.
- **Les délais ne vont que jusqu'à 10 :** les classes `anim--delay-1` à `anim--delay-10` couvrent 100ms à 1000ms. Pour des délais plus longs, utilisez un style inline `transition-delay`.

## Voir aussi

- [Icônes (animations SVG)](icons.html)
- [Éléments interactifs](elements.html)
- [Design Tokens (variable font)](tokens.html#animations-variable-font)
