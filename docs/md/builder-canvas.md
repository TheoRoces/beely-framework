# Builder — Canvas & Navigator

Le Canvas et le Navigator sont les deux piliers de l'éditeur visuel. Le Canvas affiche la page dans une iframe interactive, tandis que le Navigator fournit un arbre DOM hiérarchique pour naviguer et manipuler la structure de la page.

---

## Système de sections

Les pages HTML du builder sont découpées en **sections** identifiées par des commentaires HTML spéciaux. Ce découpage permet de réorganiser, supprimer ou renommer chaque bloc de contenu indépendamment.

### Syntaxe des commentaires

Chaque section est délimitée par une paire de commentaires HTML :

```html
<!-- #section:nom-de-la-section -->
  ... contenu de la section ...
<!-- /section:nom-de-la-section -->
```

Le nom de la section (ici `nom-de-la-section`) sert d'identifiant unique. Il est affiché dans le Navigator et peut être modifié.

### Détection automatique

Certains éléments sont détectés automatiquement sans nécessiter de commentaires :

- **Header** : tout élément avec l'attribut `data-component="header"` est identifié comme la section Header
- **Footer** : tout élément avec l'attribut `data-component="footer"` est identifié comme la section Footer

Le contenu HTML qui n'est encadré par aucun commentaire de section est automatiquement regroupé dans une section générique nommée **« Contenu »**.

### Opérations sur les sections

- **Réordonner** : glisser-déposer les sections dans le Navigator pour changer leur ordre d'apparition
- **Supprimer** : retirer une section entière de la page
- **Renommer** : modifier le nom d'une section (met à jour les commentaires HTML correspondants)
- **Ajouter** : insérer une nouvelle section via le bouton **+** dans le header du Navigator, ou via le catalogue de wireframes (375+ sections prêtes à l'emploi)

---

## Navigator (arbre DOM)

Le Navigator est un **arbre hiérarchique** qui reflète en temps réel la structure DOM de la page affichée dans le Canvas. Il permet de visualiser, sélectionner et réorganiser tous les éléments.

### Icônes par type d'élément

Chaque nœud de l'arbre affiche une icône SVG correspondant à son type HTML. Les éléments supportés :

| Catégorie | Éléments |
|---|---|
| Structure | `section`, `div`, `main`, `article`, `aside` |
| Navigation | `header`, `nav`, `footer` |
| Média | `img`, `video`, `audio`, `iframe`, `picture`, `svg`, `figure` |
| Texte | `p`, `span`, `blockquote` |
| Listes | `ul`, `ol`, `li` |
| Liens & boutons | `a`, `button` |
| Formulaires | `form`, `input`, `textarea` |
| Tableau | `table` |
| Autres | `details` |

### Expand / Collapse

Chaque nœud parent possède un **triangle cliquable** (▸) pour déplier ou replier ses enfants. L'état expand/collapse de chaque nœud est **préservé entre les rebuilds** de l'arbre (lors de modifications du DOM, undo/redo, etc.).

### Noms personnalisables

Par défaut, chaque nœud affiche le nom de sa balise HTML (ex : `div`, `p`, `section`). Vous pouvez **double-cliquer** sur le nom d'un nœud pour le renommer. Les noms personnalisés sont stockés dans un `Map` en mémoire et persistent tant que l'éditeur est ouvert.

### Indentation visuelle

Chaque niveau de profondeur dans le DOM est reflété par un **padding-left** croissant, ce qui rend immédiatement visible la hiérarchie des éléments imbriqués.

### Sélection

Un **clic sur un nœud** dans le Navigator sélectionne l'élément correspondant dans le Canvas. L'élément sélectionné reçoit un **outline bleu** visible dans l'iframe, et le panneau de propriétés s'affiche en bas de la sidebar.

### Drag & drop

Les éléments peuvent être réorganisés par glisser-déposer directement dans l'arbre. Trois modes de dépôt sont disponibles :

- **Before** (avant) : insère l'élément avant le nœud cible — indicateur visuel : ligne bleue au-dessus
- **After** (après) : insère l'élément après le nœud cible — indicateur visuel : ligne bleue en-dessous
- **Inside** (à l'intérieur) : insère l'élément comme enfant du nœud cible — indicateur visuel : fond bleu sur le nœud

---

## Canvas (iframe)

Le Canvas est une **iframe** qui affiche la page en cours d'édition en rendu réel. Toutes les modifications sont immédiatement visibles.

### Rendu via srcdoc

L'iframe utilise l'attribut `srcdoc` pour injecter le HTML de la page. Les chemins relatifs (images, CSS, scripts) sont **résolus automatiquement** grâce à la fonction `resolveRelativePaths()`, qui convertit les chemins relatifs en chemins absolus pour garantir un rendu correct dans l'iframe.

### Sandbox

L'iframe est configurée avec les permissions de sandbox suivantes :

```html
sandbox="allow-same-origin allow-scripts"
```

Cela permet l'exécution des scripts nécessaires au rendu des composants tout en maintenant une isolation de sécurité.

### Interactions dans le Canvas

- **Clic simple** sur un élément : sélectionne l'élément et le met en surbrillance dans le Navigator (outline bleu)
- **Double-clic** sur un élément texte : active l'**édition inline** via `contenteditable`. Le texte peut alors être modifié directement dans le Canvas
- **Outline bleu** : l'élément actuellement sélectionné est entouré d'un outline bleu visible

### Synchronisation bidirectionnelle

Le Canvas et le Navigator sont synchronisés en permanence :

- Toute **modification dans l'iframe** (texte édité, élément déplacé) déclenche une mise à jour du tableau `sections[]`
- Le tableau `sections[]` est la source de vérité : après chaque mutation, l'arbre du Navigator est **reconstruit** pour refléter l'état actuel
- Les modifications dans le Navigator (drag & drop, suppression) mettent à jour `sections[]` puis rafraîchissent le Canvas

---

## Panneau de propriétés

Le panneau de propriétés s'affiche en **bas de la sidebar** lorsqu'un élément est sélectionné dans le Canvas ou le Navigator.

### En-tête du panneau

L'en-tête affiche le **tag HTML** de l'élément sélectionné (ex : `div`, `p`, `a`) et un **bouton fermer** (×) pour désélectionner l'élément.

### Champs disponibles

Les champs affichés dépendent du type de l'élément sélectionné :

| Champ | Type de contrôle | Éléments concernés | Description |
|---|---|---|---|
| **Contenu** | `textarea` | `p`, `h1`–`h6`, `span`, `a`, `li`, `td`, `th`, `button`, `label`, `blockquote`, `figcaption`, `summary` | Contenu textuel de l'élément |
| **Classes** | Input extensible | Tous | Liste des classes CSS séparées par des espaces |
| **ID** | Input extensible | Tous | Identifiant unique de l'élément |
| **Lien href** | Input extensible | `a` | URL de destination + checkbox « Ouvrir dans un nouvel onglet » (`target="_blank"`) |
| **Source src** | Input extensible + bouton Parcourir | `img` | Chemin de l'image, avec accès au picker médiathèque |
| **Alt** | Input extensible | `img` | Texte alternatif pour l'accessibilité |

### Inputs extensibles

Chaque champ de saisie dispose d'un **bouton toggle** qui permet de basculer entre un `input` (une ligne) et un `textarea` (multi-lignes). Cela est particulièrement utile pour les longues listes de classes CSS ou les URL complexes.

### Actions

Trois boutons d'action sont disponibles en bas du panneau :

- **Monter** : déplace l'élément avant son frère précédent dans le DOM
- **Descendre** : déplace l'élément après son frère suivant dans le DOM
- **Supprimer** : supprime l'élément (avec **confirmation modale** avant suppression)

### Mise à jour

Toute modification effectuée dans le panneau de propriétés déclenche automatiquement :

1. `pushUndo()` — sauvegarde de l'état pour l'historique undo/redo
2. `markDirty()` — marque la page comme modifiée (indicateur visuel de modifications non sauvegardées)
3. `syncFromIframe()` — synchronise le contenu de l'iframe vers le tableau `sections[]`

---

## Tracking CSS Path

Le builder utilise un système de **chemin CSS** pour tracker les éléments plutôt que des références DOM directes. Ce choix architectural est essentiel au bon fonctionnement de l'éditeur.

### Pourquoi pas de références DOM directes ?

L'iframe du Canvas est reconstruite via `srcdoc` à chaque mutation significative. Cette reconstruction **invalide toutes les références DOM** précédentes : un élément sélectionné avant la reconstruction n'existe plus dans le nouveau document.

### `getCssPath(el)`

Cette fonction génère un **sélecteur CSS unique** pour chaque élément du DOM. Le chemin est construit en remontant l'arbre DOM et en utilisant des sélecteurs `:nth-of-type()` pour garantir l'unicité.

Exemple de chemin généré :

```
section > div:nth-of-type(2) > p
```

### `resolveElement(cssPath)`

Fonction inverse : à partir d'un chemin CSS, elle **retrouve l'élément correspondant** dans le document iframe actuel. C'est cette fonction qui permet de :

- **Restaurer la sélection** après un undo/redo
- **Maintenir la sélection** après chaque rebuild de l'iframe
- **Synchroniser** le Navigator et le Canvas même après des modifications lourdes

### Cycle complet

1. L'utilisateur sélectionne un élément → `getCssPath(el)` stocke le chemin
2. Une modification déclenche la reconstruction de l'iframe (`srcdoc`)
3. Après reconstruction, `resolveElement(cssPath)` retrouve l'élément dans le nouveau DOM
4. L'outline bleu est réappliqué et le panneau de propriétés reste affiché
