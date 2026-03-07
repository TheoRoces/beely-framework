# Formulaires

Système de formulaires complet : multi-steps, logique conditionnelle, champs custom, validation, toasts, webhooks.

## Structure de base

```html
<form class="form" data-form-webhook="https://votre-webhook.com"
      data-form-redirect="/merci"
      data-form-success="Merci !"
      data-form-error="Erreur, reessayez.">

  <div class="form__field form__field--float">
    <input type="text" name="nom" class="form__input"
           placeholder=" " data-validate="required|min:2">
    <label class="form__label">Nom</label>
  </div>

  <div class="form__nav">
    <button type="submit" class="form__submit">Envoyer</button>
  </div>
</form>
```

| Attribut | Description |
|---|---|
| `data-form-webhook` | URL du webhook (POST JSON) |
| `data-form-redirect` | URL de redirection apres succes |
| `data-form-success` | Message toast de succes |
| `data-form-error` | Message toast d'erreur |

## Labels flottants

Ajoutez `form__field--float` pour activer l'animation de label flottant. Le label se place dans le champ quand il est vide, et monte en haut quand le champ est focus ou rempli.

**Important :** l'input doit etre place **avant** le label dans le HTML, et avoir `placeholder=" "` (espace).

```html
<!-- Label flottant : input AVANT label, placeholder=" " obligatoire -->
<div class="form__field form__field--float">
  <input type="text" name="nom" class="form__input"
         placeholder=" " data-validate="required|min:2">
  <label class="form__label">Nom complet</label>
</div>

<!-- Textarea flottant -->
<div class="form__field form__field--float">
  <textarea name="message" class="form__textarea"
            placeholder=" "></textarea>
  <label class="form__label">Votre message</label>
</div>
```

### Structure complete d'un champ

```html
<div class="form__field form__field--float">
  <input type="text" name="nom" class="form__input"
         placeholder=" " data-validate="required|min:2">
  <label class="form__label">Nom complet</label>
  <span class="form__label-hint">Optionnel</span>
  <div class="form__error"></div>
</div>
```

| Classe | Description |
|---|---|
| `form__field--float` | Active le label flottant sur le champ |
| `form__label-hint` | Texte d'indication sous le label (ex: "Optionnel", "Si vous avez deja un site") |
| `form__error` | Conteneur du message d'erreur de validation (rempli automatiquement par JS) |

- Le `placeholder=" "` (espace) est nécessaire pour le selecteur CSS `:placeholder-shown`. Si oublié, le JS l'ajoute automatiquement.
- L'input doit etre **avant** le label dans le DOM (ordre inverse).
- Le `form__error` est optionnel : s'il est present, le message d'erreur y sera injecte. Sinon, il est créé automatiquement.
- Compatible avec la validation, les etats d'erreur, et le pré-remplissage par URL.
- Pour les champs custom (select, radio, checkbox), le label classique au-dessus est recommande.

## Multi-Steps

```html
<form class="form" data-form-webhook="...">
  <div class="form__step-indicators"></div>
  <div class="form__progress">
    <div class="form__progress-bar"></div>
  </div>

  <div class="form__step" data-step-label="Infos">
    <!-- Champs step 1 -->
  </div>

  <div class="form__step" data-step-label="Projet">
    <!-- Champs step 2 -->
  </div>

  <div class="form__nav">
    <button type="button" class="form__prev">
      <span data-icon="arrow-left" data-icon-size="16"></span>
      Precedent
    </button>
    <button type="button" class="form__next">
      Suivant
      <span data-icon="arrow-right" data-icon-size="16"></span>
    </button>
    <button type="submit" class="form__submit">
      <span data-icon="paper-airplane" data-icon-size="16"></span>
      Envoyer
    </button>
  </div>
</form>
```

- Barre de progression et indicateurs générés automatiquement
- Validation par step avant de passer au suivant
- Boutons Precedent/Suivant/Envoyer geres automatiquement
- Les icones dans les boutons héritent de la couleur du texte (`currentColor`)
- Le bouton Precedent est a gauche, Suivant et Envoyer sont alignes a droite

## Validation

Ajoutez `data-validate` sur un input avec les regles separees par `|` :

| Regle | Description |
|---|---|
| `required` | Champ obligatoire |
| `email` | Format email valide |
| `phone` | Format telephone valide |
| `url` | Format URL (http/https) |
| `min:N` | Minimum N caracteres |
| `max:N` | Maximum N caracteres |

```html
<input data-validate="required|email">
<input data-validate="required|min:3|max:50">
<input data-validate="phone">
```

## Logique conditionnelle

Affichez/masquez des champs en fonction de la valeur d'un autre champ :

```html
<!-- Champ de reference -->
<div class="form__radio-group" data-name="type">
  <div class="form__radio-option" data-value="pro">Pro</div>
  <div class="form__radio-option" data-value="perso">Perso</div>
</div>

<!-- Visible uniquement si type = pro -->
<div class="form__field" data-condition="type=pro">
  <label class="form__label">Entreprise</label>
  <input name="entreprise" class="form__input">
</div>
```

| Format | Description |
|---|---|
| `champ=valeur` | Egalite |
| `champ!=valeur` | Different |
| `champ=val1,val2` | L'une des valeurs (OR) |
| `champ=*` | Non vide |
| `champ>5` | Superieur a |
| `champ<5` | Inferieur a |

Les champs masques ne sont **pas envoyes** dans le webhook.

## Champs custom (sans dependances)

Des elements de formulaire 100% stylisables en CSS, remplacant les elements natifs difficiles a styler :

### Custom Select

```html
<div class="form__select" data-name="pays">
  <div class="form__select-trigger" data-placeholder="Choisir...">Choisir...</div>
  <div class="form__select-options">
    <div class="form__select-option" data-value="fr">France</div>
    <div class="form__select-option" data-value="be">Belgique</div>
    <div class="form__select-option" data-value="ch">Suisse</div>
  </div>
</div>
```

### Custom Number

```html
<div class="form__number">
  <button type="button" class="form__number-minus">&minus;</button>
  <input type="number" name="qty" class="form__number-input"
         value="1" min="1" max="100" step="1">
  <button type="button" class="form__number-plus">+</button>
</div>
```

### Custom Radio Group

```html
<div class="form__radio-group" data-name="taille">
  <div class="form__radio-option" data-value="s">S</div>
  <div class="form__radio-option" data-value="m">M</div>
  <div class="form__radio-option" data-value="l">L</div>
</div>
```

### Custom Checkbox Group

```html
<div class="form__checkbox-group" data-name="options">
  <div class="form__checkbox-option" data-value="opt1">Option 1</div>
  <div class="form__checkbox-option" data-value="opt2">Option 2</div>
  <div class="form__checkbox-option" data-value="opt3">Option 3</div>
</div>
```

### Custom Multi Select

```html
<div class="form__multiselect" data-name="competences">
  <div class="form__multiselect-trigger" data-placeholder="Choisir...">Choisir...</div>
  <div class="form__multiselect-options">
    <div class="form__multiselect-option" data-value="html">HTML</div>
    <div class="form__multiselect-option" data-value="css">CSS</div>
    <div class="form__multiselect-option" data-value="js">JavaScript</div>
  </div>
</div>
```

## Webhook (payload)

### Proxy securise (recommande)

En production, utilisez le proxy `api/form.php` au lieu d'exposer l'URL webhook Make.com dans le HTML :

```html
<form class="form" data-form-webhook="/api/form.php">
```

Le proxy lit `FORM_WEBHOOK_URL` et `FORM_NOTIFICATION_EMAIL` depuis le fichier `.env` du serveur, ajoute l'email de notification et la date au payload, puis forward vers Make.com. Voir [Mise en production → .env](production.html#configurer-le-env) pour la configuration.

### Creation automatique du scenario Make.com

Si vous utilisez Claude Code, la commande **"créé le formulaire"** créé automatiquement :

1. Un **webhook** Make.com (Custom Webhook)
2. Un **scenario** : Webhook → Email (envoi des donnees du formulaire)
3. L'**activation** du scenario
4. La mise a jour du `.env` avec l'URL du webhook

Prerequis : renseigner `MAKE_API_KEY`, `MAKE_ZONE` et `MAKE_TEAM_ID` dans le fichier `.env`.

### Payload

Le formulaire envoie un `POST` JSON au webhook configuré. Le payload contient :

- Tous les champs **visibles** (respect de la logique conditionnelle)
- `date_now` : date francaise (ex: "2 Fevrier 2026, 10h52")
- `url` : URL de la page
- `user_agent` : navigateur de l'utilisateur
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` : UTMs depuis l'URL

### Exemple de payload

```json
{
  "nom": "Manon",
  "email": "manon@exemple.fr",
  "type_client": "entreprise",
  "entreprise": "Mon Agence",
  "projet": "site-vitrine",
  "services": "design,dev",
  "date_now": "26 Fevrier 2026, 14h30",
  "url": "https://monsite.fr/contact?utm_source=google",
  "user_agent": "Mozilla/5.0...",
  "utm_source": "google",
  "utm_medium": "cpc"
}
```

## Toasts

Les toasts sont automatiques (succes/erreur) mais utilisables aussi manuellement :

```js
// Afficher un toast manuellement
showToast('Message ici', 'success');  // success, error, warning, info
showToast('Attention !', 'warning', 6000);  // duree en ms
```

## Pré-remplissage par URL

Les paramètres d'URL correspondent aux attributs `name` des champs :

```
https://monsite.fr/contact?nom=Manon&email=manon@ex.fr&type_client=entreprise
```

Les inputs natifs, selects, radios et checkboxes sont pre-remplis automatiquement. Les champs custom (`data-name`) sont egalement supportes.

## Problèmes courants

- **Le formulaire ne s'envoie pas :** vérifiez que `data-form-webhook` pointe vers `/api/form.php` et que le fichier `.env` contient `FORM_WEBHOOK_URL`.
- **La validation ne fonctionne pas :** ajoutez l'attribut `data-validate` sur chaque champ avec les regles separees par `|` (ex : `data-validate="required|email"`). Le formulaire n'a pas besoin d'attribut special — le JS detecte automatiquement les champs portant `data-validate`.
- **Le multi-step ne passe pas a l'etape suivante :** chaque etape doit etre un `<div class="form__step">` et les boutons navigation doivent avoir les classes `.form__next` / `.form__prev`.
- **Le champ conditionnel ne s'affiche pas :** vérifiez la syntaxe de `data-condition` : le nom du champ doit correspondre a l'attribut `name` (pas l'`id`).
- **Le toast ne s'affiche pas :** appelez `showToast('message', 'success')` depuis la console pour tester. Vérifiez que `forms.css` est charge.

## Voir aussi

- [Paramètres URL & pré-remplissage](params.html)
- [Elements interactifs](elements.html)
- [Cookies & Analytics](cookies.html)
- [Animations](animations.html)
