# Paramètres URL

Persistance automatique des paramètres d'URL (UTMs, etc.) entre les pages et pré-remplissage des champs de formulaire.

## Persistance entre les pages

Le script `core/js/params.js` détecte automatiquement les paramètres d'URL et les ajoute à tous les liens internes du site. Ainsi, si un visiteur arrive depuis :

```
https://monsite.fr/?utm_source=google&utm_medium=cpc&utm_campaign=promo
```

Tous les liens internes du site deviendront :

```html
<a href="blog?utm_source=google&utm_medium=cpc&utm_campaign=promo">
```

### Liens pris en charge

- Chemins relatifs : `blog`, `./contact`, `../index`
- Chemins absolus : `/contact`
- Liens avec même domaine

### Liens ignorés

- Ancres : `#section`
- Liens externes (domaine différent)
- Liens `mailto:`, `tel:`, `javascript:`

## UTMs automatiques

Les UTMs sont automatiquement collectés et envoyés avec chaque soumission de formulaire :

| Paramètre | Description |
|---|---|
| `utm_source` | Source du trafic (google, facebook, newsletter...) |
| `utm_medium` | Support (cpc, email, social...) |
| `utm_campaign` | Nom de la campagne |
| `utm_term` | Mot-clé (SEA) |
| `utm_content` | Variante de l'annonce (A/B test) |

## Pré-remplissage des champs

Les paramètres d'URL dont le nom correspond à l'attribut `name` d'un champ de formulaire le pré-remplissent automatiquement :

```
https://monsite.fr/contact?nom=Manon&email=manon@ex.fr&type_client=entreprise
```

- `?nom=Manon` → `<input name="nom">` aura la valeur « Manon »
- `?type_client=entreprise` → le radio « Entreprise » sera sélectionné

### Types de champs supportés

- **Inputs texte/email/tel** : valeur directe
- **Checkboxes/Radios** : cochés si la valeur correspond
- **Selects natifs** : option sélectionnée
- **Custom Select** (`data-name`) : option simulée
- **Custom Radio/Checkbox Group** (`data-name`) : option simulée

## API JavaScript

```js
// Récupérer tous les paramètres d'URL
var params = getUrlParams();
// { nom: 'Manon', utm_source: 'google', ... }

// Récupérer uniquement les UTMs
var utms = getUTMs();
// { utm_source: 'google', utm_medium: 'cpc', ... }
```

## Inclure dans une page

```html
<script src="core/js/params.js" defer></script>
```

Le script s'initialise automatiquement au chargement du DOM. Aucune configuration nécessaire.

## Voir aussi

- [Formulaires (pré-remplissage)](forms.html#pre-remplissage-par-url)
- [Cookies & Analytics](cookies.html)
- [Blog](blog.html)
