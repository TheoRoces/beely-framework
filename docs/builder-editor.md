# Builder — Éditeur

L'éditeur est le cœur du builder. Il permet de modifier visuellement les pages HTML. On y accède en double-cliquant sur une page dans le panel Pages.

---

## Layout de l'éditeur

L'éditeur est organisé en **4 zones** distinctes qui fonctionnent ensemble pour offrir une expérience d'édition visuelle complète.

### 1. Toolbar (en haut)

La barre d'outils horizontale occupe toute la largeur en haut de l'éditeur. Elle regroupe les actions principales :

| Élément | Description |
|---|---|
| **Bouton Retour** | Revient au panel Pages. Si des modifications n'ont pas été sauvegardées, un modal de confirmation s'affiche. |
| **Nom de la page** | Affiche le nom du fichier HTML en cours d'édition. |
| **Toggle responsive** | Boutons pour basculer entre les différents breakpoints (Desktop, Tablette, Mobile Paysage, Mobile). |
| **Bouton Wireframes** | Ouvre le catalogue de wireframes (panneau droit) pour insérer des sections pré-faites. |
| **Bouton Sauvegarder** | Sauvegarde la page en cours. Équivalent au raccourci `Cmd+S` / `Ctrl+S`. |
| **Lien Aperçu** | Ouvre la page dans un nouvel onglet via l'URL du serveur pour prévisualiser le rendu final. |

### 2. Sidebar gauche (Navigator)

La sidebar gauche est divisée en deux parties :

- **Arbre DOM** (partie supérieure) : représentation hiérarchique de la structure HTML de la page. Permet de sélectionner, réordonner et identifier les éléments.
- **Panneau propriétés** (partie inférieure) : affiche et permet de modifier les propriétés de l'élément sélectionné (texte, classes, attributs, styles).

### 3. Canvas central

Zone principale d'édition. Le canvas est une `<iframe>` qui charge la page en direct. C'est ici que les modifications sont visibles en temps réel. Le canvas s'adapte au breakpoint sélectionné dans la toolbar.

### 4. Catalogue (panneau droit, caché par défaut)

Le panneau de droite affiche le **catalogue de wireframes**. Il s'ouvre en cliquant sur le bouton « Wireframes » dans la toolbar. Il permet de parcourir et d'insérer des sections HTML pré-faites directement dans la page en cours d'édition.

---

## Responsive viewport

L'éditeur intègre un système de simulation responsive complet pour tester le rendu de la page sur différents appareils.

### Breakpoints prédéfinis

4 breakpoints sont disponibles via les boutons de la toolbar :

| Breakpoint | Largeur | Custom property CSS |
|---|---|---|
| Desktop | 100% (pleine largeur) | — |
| Tablette | 991px | `--bp-tablet` |
| Mobile Paysage | 767px | `--bp-mobile-landscape` |
| Mobile | 478px | `--bp-mobile` |

Les valeurs sont lues dynamiquement depuis les **CSS custom properties** `--bp-tablet`, `--bp-mobile-landscape` et `--bp-mobile` définies dans `tokens.css`. Si vous modifiez ces tokens, les breakpoints de l'éditeur s'adaptent automatiquement.

### Affichage de la taille

La taille actuelle du canvas est affichée en pixels (`px`) en temps réel à côté des boutons de breakpoint. Cette valeur se met à jour lors du changement de breakpoint, lors du redimensionnement manuel, et lors de la saisie d'une largeur personnalisée.

### Saisie manuelle

En plus des boutons prédéfinis, il est possible de saisir manuellement une largeur en pixels. La plage acceptée va de **320px** à **2560px**. Le canvas se redimensionne instantanément à la valeur saisie.

### Resize à la souris

Un **handle** (poignée de redimensionnement) est positionné sur le bord droit du canvas. Il permet de glisser pour ajuster la largeur librement. La taille affichée se met à jour en temps réel pendant le drag.

---

## Panels redimensionnables

Les panels de l'éditeur peuvent être redimensionnés par l'utilisateur pour s'adapter à différents écrans et workflows :

| Panel | Direction | Minimum | Maximum |
|---|---|---|---|
| Sidebar Navigator | Horizontal (largeur) | 200px | 400px |
| Panneau propriétés | Vertical (hauteur) | 100px | 400px |

Le redimensionnement se fait par **drag** sur le bord du panel concerné. Un curseur de redimensionnement apparaît au survol de la zone de drag.

---

## Raccourcis clavier

L'éditeur supporte les raccourcis clavier suivants :

| Action | macOS | Windows / Linux |
|---|---|---|
| Sauvegarder la page | `Cmd+S` | `Ctrl+S` |
| Annuler (undo) | `Cmd+Z` | `Ctrl+Z` |
| Rétablir (redo) | `Shift+Cmd+Z` | `Shift+Ctrl+Z` |

Ces raccourcis fonctionnent à la fois dans le **document principal** (toolbar, sidebar) et dans l'**iframe** du canvas.

---

## Undo / Redo

L'éditeur dispose d'un système d'annulation et de rétablissement basé sur des **snapshots**.

### Fonctionnement

- **Source de vérité** : le tableau `sections[]` qui représente la structure complète de la page. Chaque snapshot est une copie de ce tableau à un instant donné.
- **Profondeur maximale** : **50 niveaux** d'annulation. Au-delà, les snapshots les plus anciens sont supprimés automatiquement.
- **Création de snapshot** : chaque mutation de la page déclenche un nouveau snapshot. Cela inclut :
  - Modification de texte (contenu éditable)
  - Modification de propriétés (classes, attributs, styles)
  - Drag & drop (réordonnancement de sections)
  - Insertion d'une nouvelle section (depuis le catalogue wireframes)
  - Suppression d'une section
- **Restauration de la sélection** : après un undo ou un redo, l'élément qui était sélectionné au moment du snapshot est automatiquement re-sélectionné dans le Navigator et le canvas.

### Contexte de capture

Les raccourcis `Cmd+Z` / `Ctrl+Z` et `Shift+Cmd+Z` / `Shift+Ctrl+Z` sont écoutés à la fois sur le document principal et dans l'iframe. Quel que soit l'endroit où le focus se trouve, l'action est correctement routée vers le système d'undo/redo de l'éditeur.

---

## Modifications non sauvegardées

L'éditeur suit en permanence l'état des modifications via un flag interne `editorDirty`.

### Détection

Le flag `editorDirty` passe à `true` dès qu'une modification est effectuée sur la page (texte, propriétés, drag & drop, insertion, suppression). Il repasse à `false` après une sauvegarde réussie.

### Modal de confirmation

Lorsque l'utilisateur tente de quitter l'éditeur (bouton Retour, navigation, etc.) alors que des modifications n'ont pas été sauvegardées, un **modal de confirmation** s'affiche avec 3 choix :

| Action | Comportement |
|---|---|
| **Sauvegarder** | Sauvegarde les modifications, puis navigue vers la destination demandée. |
| **Abandonner** | Annule toutes les modifications non sauvegardées et navigue vers la destination. |
| **Annuler** (`Échap` / clic sur l'overlay) | Ferme le modal et reste sur l'éditeur. Aucune modification n'est perdue ni sauvegardée. |

---

## Sauvegarde et aperçu

### Sauvegarde

La sauvegarde est déclenchée par le **bouton Sauvegarder** de la toolbar ou par le raccourci `Cmd+S` / `Ctrl+S`.

Le processus de sauvegarde :

1. Le HTML complet de la page est **reconstruit** à partir du tableau `sections[]` (source de vérité).
2. Le HTML reconstruit est **envoyé au serveur** pour écraser le fichier existant.
3. Le flag `editorDirty` repasse à `false`.

### Aperçu

Le **bouton Aperçu** (ou lien dans la toolbar) ouvre la page dans un **nouvel onglet** via l'URL du serveur. Cela permet de voir le rendu final tel qu'il apparaîtra en production, avec tous les scripts et styles chargés normalement (en dehors du contexte de l'éditeur).

---

## Modules JS

L'éditeur repose sur deux modules JavaScript principaux :

| Fichier | Rôle |
|---|---|
| `builder-canvas.js` | Module principal de l'éditeur. Gère le canvas (iframe), le responsive viewport, le Navigator (arbre DOM + propriétés), le système undo/redo, le drag & drop, l'insertion de wireframes, et la sauvegarde. |
| `builder-app.js` | Gère la navigation et l'état global du builder. Contrôle la transition entre les panels (Pages, Éditeur), la détection des modifications non sauvegardées, et le routage interne. |

---

## Voir aussi

- [Wireframes](wireframes.md) — catalogue des 375+ sections disponibles
- [Design Tokens](tokens.md) — custom properties CSS dont les breakpoints
- [Composants](components.md) — système de composants réutilisables
