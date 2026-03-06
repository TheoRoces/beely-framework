# Composants / Slots

Système de composants réutilisables en pur JS. Chaque composant est une fonction qui reçoit des **slots** (contenus injectables) et retourne du HTML.

## Principe

Un composant est défini dans un fichier JS via `registerComponent()`. Il est ensuite utilise dans le HTML via l'attribut `data-component`. Les contenus sont injectes via des **slots**.

```js
// 1. Definir le composant (components/mon-composant.js)
registerComponent('monComposant', function (slots) {
  return `
    <div class="mon-composant">
      <h3>${slots.title || 'Titre par defaut'}</h3>
      <p>${slots.text || ''}</p>
    </div>
  `;
});

// 2. Utiliser dans le HTML
// <div data-component="monComposant">
//   <template data-slot="title">Mon titre</template>
//   <template data-slot="text">Du contenu <strong>HTML</strong></template>
// </div>
```

## Injection de slots

Deux methodes pour passer du contenu a un composant :

### Methode 1 : `<template data-slot>`

Pour du contenu riche (HTML, liens, boutons, images). Le contenu HTML du `<template>` est injecte tel quel.

```html
<div data-component="card">
  <template data-slot="title">Mon titre</template>
  <template data-slot="text">Du <strong>HTML</strong> riche</template>
  <template data-slot="footer">
    <a href="#" class="btn btn--primary">Action</a>
  </template>
</div>
```

### Methode 2 : attributs data-*

Pour des valeurs simples (texte, URLs). Les tirets sont convertis en camelCase. Tous les attributs `data-*` (sauf `data-component`) sont disponibles dans `slots`.

```html
<!-- data-site-name → slots.siteName -->
<!-- data-logo-src  → slots.logoSrc  -->
<div data-component="header"
     data-site-name="MonSite"
     data-logo-src="logo.png"
     data-logo-link="/index.html">
</div>
```

| Attribut HTML | Cle dans slots |
|---------------|----------------|
| `data-site-name` | `slots.siteName` |
| `data-logo-src` | `slots.logoSrc` |
| `data-image-alt` | `slots.imageAlt` |
| `data-copyright` | `slots.copyright` |

L'ancienne syntaxe `data-slot-*` reste compatible.

## API JavaScript

| Fonction | Description |
|----------|-------------|
| `registerComponent(name, fn)` | Enregistre un composant. `fn(slots)` reçoit un objet et retourne du HTML. |
| `renderComponents(root)` | Rend les `[data-component]` dans `root` (defaut : `document.body`). Appele auto au DOMContentLoaded. |

Vous pouvez appeler `renderComponents(el)` manuellement apres avoir injecté du HTML dynamique contenant des `data-component`.

## Composants inclus

### Header

Fichier : `components/header.js`

Le header est configuré entierement par attributs et slots :

| Slot | Methode | Description |
|------|---------|-------------|
| `siteName` | Attribut | Nom du site (texte logo si pas d'image). Defaut : `Logo` |
| `logoSrc` | Attribut | URL de l'image logo (vide = texte siteName) |
| `logoLink` | Attribut | Lien du logo. Defaut : `/` |
| `nav` | Template | Liens de navigation (HTML) |
| `cta` | Template | Bouton d'action (optionnel) |
| `search` | Template | Active le bouton de recherche (declarer vide) |

```html
<!-- Header minimal -->
<div data-component="header"
     data-site-name="MonSite"
     data-logo-link="/index.html">
  <template data-slot="nav">
    <a href="/index.html">Accueil</a>
    <a href="/contact.html">Contact</a>
  </template>
</div>

<!-- Header complet (logo image + CTA + recherche) -->
<div data-component="header"
     data-site-name="MonSite"
     data-logo-src="/assets/logo.svg"
     data-logo-link="/index.html">
  <template data-slot="nav">
    <a href="/index.html">Accueil</a>
    <a href="/docs/index.html">Documentation</a>
  </template>
  <template data-slot="cta">
    <button class="btn btn--primary">Contact</button>
  </template>
  <template data-slot="search"></template>
</div>
```

### Footer

Fichier : `components/footer.js`

Le footer est configuré par attributs et slots :

| Slot | Methode | Description |
|------|---------|-------------|
| `copyright` | Attribut | Texte copyright. L'annee est **mise a jour automatiquement**. Defaut : `&copy; YYYY` |
| `content` | Template | Contenu du footer (liens, nav, etc.) |

```html
<div data-component="footer"
     data-copyright="&copy; 2026 MonSite">
  <template data-slot="content">
    <nav class="footer__links">
      <a href="/mentions-legales.html">Mentions legales</a>
      <a href="/confidentialite.html">Confidentialite</a>
    </nav>
  </template>
</div>
```

### Card

Fichier : `components/card.js`

| Slot | Type | Description |
|------|------|-------------|
| `image` | URL | Image de la card (optionnel) |
| `imageAlt` | Texte | Alt de l'image |
| `title` | Texte | Titre de la card |
| `text` | Texte | Contenu texte |
| `footer` | HTML | Pied de card (boutons, liens, etc.) |

```html
<div data-component="card">
  <template data-slot="image">photo.jpg</template>
  <template data-slot="title">Titre</template>
  <template data-slot="text">Description de la card.</template>
  <template data-slot="footer">
    <a href="#" class="btn btn--primary">En savoir plus</a>
  </template>
</div>
```

## Créer un composant custom

Créez un fichier dans `components/`, enregistrez-le, puis incluez le script dans vos pages.

```js
// components/testimonial.js
registerComponent('testimonial', function (slots) {
  return `
    <blockquote class="testimonial">
      <p class="testimonial__text">"${slots.quote || ''}"</p>
      <footer class="testimonial__author">
        ${slots.avatar ? `<img src="${slots.avatar}" alt="">` : ''}
        <cite>${slots.name || 'Anonyme'}</cite>
      </footer>
    </blockquote>
  `;
});
```

```html
<!-- Dans le HTML -->
<script src="components/testimonial.js"></script>

<div data-component="testimonial">
  <template data-slot="quote">Un produit incroyable !</template>
  <template data-slot="name">Marie Dupont</template>
  <template data-slot="avatar">img/marie.jpg</template>
</div>
```

## Bonnes pratiques

- Toujours prevoir des valeurs par defaut : `slots.title || 'Defaut'`
- Rendre les slots optionnels : `slots.footer ? '...' : ''`
- Nommer les composants en **camelCase** : `registerComponent('heroSection', ...)`
- Convention BEM pour les classes CSS du composant
- Un composant peut contenir d'autres `data-component` (rendu recursif automatique)
- Charger `core/js/components.js` **avant** les scripts de composants

### Problèmes courants

- **Le composant ne s'affiche pas :** vérifiez que `components.js` est charge *avant* le script du composant, et que l'attribut `data-component` est correct.
- **Un slot est vide :** vérifiez l'orthographe du `data-slot`. Les noms sont convertis en camelCase : `data-logo-src` devient `slots.logoSrc`.
- **Les animations ne marchent pas dans un composant :** les composants sont rendus au `DOMContentLoaded`. Les animations et elements interactifs sont re-initialises automatiquement apres le rendu.

### Voir aussi

- [Elements interactifs](elements.md)
- [Icones](icons.md)
- [Démarrer un projet](getting-started.md)
