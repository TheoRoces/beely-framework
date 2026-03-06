# Cookies & Analytics

Bandeau de consentement RGPD/CNIL avec gestion granulaire par catégorie, expiration automatique (13 mois), preuve de consentement côté serveur (PHP/CSV), nettoyage des cookies tiers au refus, et injection des scripts analytics.

## Configuration

Ouvrez `config-site.js` à la racine du projet et remplissez les IDs de vos plateformes :

```js
window.COOKIES_CONFIG = {
  ga4: 'G-XXXXXXXXXX',
  gtm: 'GTM-XXXXXXX',
  clarity: 'xxxxxxxxxx',
  fbPixel: '123456789012345',
  hotjar: '1234567',
  linkedin: '123456',
  tiktok: 'XXXXXXXXXX',

  categories: {
    functional: {
      label: 'Fonctionnel',
      description: 'Propagation des UTM (URL uniquement, aucun stockage).',
      services: [],
      required: true
    },
    analytics: {
      label: 'Analytique',
      description: 'Mesure d\'audience et analyse du trafic.',
      services: ['ga4', 'gtm', 'clarity', 'hotjar']
    },
    marketing: {
      label: 'Marketing',
      description: 'Publicite ciblee et suivi des conversions.',
      services: ['fbPixel', 'linkedin', 'tiktok']
    }
  },

  banner: {
    title: 'Ce site utilise des cookies',
    text: 'Nous utilisons des cookies pour analyser le trafic...',
    acceptText: 'Tout accepter',
    rejectText: 'Tout refuser',
    settingsText: 'Personnaliser',
    saveText: 'Enregistrer mes choix',
    cookieName: 'cookie_consent',
    cookieDuration: 395,           // ~13 mois (CNIL max)
    consentVersion: '1.0',         // Changer pour re-demander le consentement
    privacyUrl: '/confidentialite.html',  // Lien politique de confidentialite
    privacyText: 'Politique de confidentialite'
  },

  // Endpoint PHP intégré (preuve de consentement)
  consentEndpoint: '/api/consent.php'
};
```

Vous pouvez aussi utiliser `consentWebhook` à la place de `consentEndpoint` pour envoyer la preuve de consentement vers un webhook externe (ex : Make.com, Zapier).

## Plateformes supportées

| Clé | Plateforme | Format de l'ID |
|---|---|---|
| `ga4` | Google Analytics 4 | G-XXXXXXXXXX |
| `gtm` | Google Tag Manager | GTM-XXXXXXX |
| `clarity` | Microsoft Clarity | xxxxxxxxxx |
| `fbPixel` | Facebook Pixel | 123456789012345 |
| `hotjar` | Hotjar | 1234567 |
| `linkedin` | LinkedIn Insight Tag | 123456 |
| `tiktok` | TikTok Pixel | XXXXXXXXXX |

Laissez un champ vide (`''`) pour désactiver un service. Les catégories sans service configuré sont automatiquement masquées.

## Catégories de consentement

Les services sont regroupés en catégories. L'utilisateur peut accepter ou refuser chaque catégorie indépendamment via le panneau « Personnaliser ».

| Propriété | Description |
|---|---|
| `label` | Nom affiché dans le panneau de consentement |
| `description` | Description courte de la catégorie |
| `services` | Tableau des clés de services associés (`['ga4', 'clarity']`) |
| `required` | Si `true`, la catégorie est toujours active (toggle grisé, badge « requis ») |

### Catégorie Fonctionnel (UTM)

La catégorie `functional` est marquée `required: true` par défaut. Elle documente la propagation des paramètres UTM entre les pages. Cette propagation fonctionne **sans aucun stockage** (pas de cookie, pas de localStorage) : le script `params.js` lit l'URL et ajoute les paramètres aux liens internes.

## Conformité CNIL / RGPD

Le système respecte les recommandations de la CNIL :

| Règle CNIL | Implémentation |
|---|---|
| Durée max du consentement | 13 mois (395 jours). Le script plafonne automatiquement à cette valeur. |
| Re-demande après expiration | Le consentement est horodaté. Après 13 mois, le cookie est effacé et le bandeau réapparaît. |
| Refus aussi facile qu'acceptation | Les boutons « Tout accepter » et « Tout refuser » sont au même niveau. |
| Consentement granulaire | Chaque catégorie peut être acceptée ou refusée individuellement. |
| Preuve de consentement | Enregistrement automatique dans un fichier CSV côté serveur (PHP). |
| Modification du choix | Bouton `data-cookies-settings` ou `openCookieSettings()` pour réouvrir. |
| Nettoyage au refus | Les cookies déposés par les services tiers sont supprimés au refus/retrait. |
| Lien confidentialité | Lien configurable vers la politique de confidentialité dans la bannière. |
| Gestion de version | Changez `consentVersion` pour re-demander le consentement après modification des catégories. |

### Preuve de consentement (PHP / CSV)

Le fichier `api/consent.php` reçoit chaque choix en POST et l'enregistre dans `data/consents.csv`.

#### Fonctionnement

1. L'utilisateur fait un choix (accepter, refuser, personnaliser)
2. Le JS envoie les données en POST à `/api/consent.php`
3. Le PHP écrit une ligne dans `data/consents.csv`
4. Le dossier `data/` est protégé par `.htaccess` (créé automatiquement)

#### Format du fichier CSV

```
timestamp,ip_hash,consent,url,user_agent,expiry_date
"2026-02-26T14:30:00.000Z","a1b2c3...","functional=1;analytics=1;marketing=0","https://monsite.fr/",
"Mozilla/5.0 ...","2027-03-27T14:30:00.000Z"
```

| Colonne | Description |
|---|---|
| `timestamp` | Date ISO du choix |
| `ip_hash` | Hash SHA-256 de l'IP (anonymisée, RGPD) |
| `consent` | Choix par catégorie (`key=1` ou `key=0`) |
| `url` | Page où le choix a été fait (sans query string) |
| `user_agent` | Navigateur |
| `expiry_date` | Date d'expiration du consentement |

#### Sécurité

- **IP anonymisée** : l'IP est hashée avec un sel mensuel (SHA-256), jamais stockée en clair
- **.htaccess** : le dossier `data/` est protégé par `Deny from all` (créé automatiquement)
- **Verrouillage** : écriture avec `LOCK_EX` pour éviter les conflits
- **CORS restreint** : configurable via `SITE_ORIGIN` dans `.env`
- **POST uniquement** : le endpoint refuse GET, PUT, DELETE

#### Configuration .env

Pour restreindre l'accès au endpoint :

```
# .env (racine du projet)
SITE_ORIGIN=https://monsite.fr
```

#### Désactiver la preuve serveur

Laissez `consentEndpoint` vide dans `config-site.js` :

```js
consentEndpoint: ''  // Pas de preuve serveur
```

### Nettoyage des cookies tiers

Quand l'utilisateur refuse ou retire son consentement pour une catégorie, les cookies déposés par les services tiers associés sont automatiquement supprimés.

Les patterns de cookies connus sont gérés automatiquement pour chaque service :

| Service | Cookies supprimés |
|---|---|
| GA4 / GTM | `_ga`, `_ga_*`, `_gid`, `_gat` |
| Clarity | `_clck`, `_clsk`, `CLID`, `ANONCHK` |
| Hotjar | `_hj*`, `_hjSession*`, `_hjid` |
| Facebook Pixel | `_fbp`, `_fbc`, `fr` |
| LinkedIn | `_li*`, `li_sugr`, `bcookie`, `lidc` |
| TikTok | `_ttp`, `_tt_enable_cookie`, `tt_*` |

### Gestion de version

Si vous modifiez les catégories ou ajoutez des services, changez `consentVersion` dans la config. Tous les visiteurs seront re-sollicités :

```js
banner: {
  consentVersion: '2.0',  // Etait '1.0' → re-demande automatique
  // ...
}
```

### Lien politique de confidentialité

Ajoutez `privacyUrl` et `privacyText` dans la config de la bannière :

```js
banner: {
  privacyUrl: '/confidentialite.html',
  privacyText: 'Politique de confidentialite',
  // ...
}
```

Le lien s'affiche automatiquement après le texte de la bannière.

### Format du cookie

Le consentement est stocké en JSON avec horodatage et version :

```json
// Cookie cookie_consent
{
  "choices": { "functional": true, "analytics": true, "marketing": false },
  "timestamp": 1740576600000,
  "version": "1.0"
}
```

## Fonctionnement

**Aucun cookie ni script tiers n'est déposé avant le consentement.** Tant que le visiteur n'a pas cliqué sur « Tout accepter » ou personnalisé ses choix, aucun tracker n'est chargé. Cela garantit la conformité RGPD/CNIL.

- Au premier chargement, le bandeau de consentement s'affiche
- **Tout accepter** : active toutes les catégories, injecte les scripts correspondants + preuve serveur
- **Tout refuser** : refuse les catégories non requises, aucun script injecté + preuve serveur
- **Personnaliser** : ouvre le panneau avec un toggle par catégorie
- Les catégories `required` ont un toggle grisé avec badge « requis »
- Seuls les scripts des catégories acceptées sont injectés
- Si un visiteur **change d'avis** et refuse après avoir accepté, les cookies tiers sont automatiquement supprimés
- Le consentement expire automatiquement après 13 mois (effacement + re-demande)
- Un changement de `consentVersion` déclenche aussi la re-demande

## Bouton de réouverture

Ajoutez l'attribut `data-cookies-settings` sur n'importe quel élément pour réouvrir le gestionnaire de consentement :

```html
<!-- Lien dans le footer -->
<a href="#" data-cookies-settings>Gerer les cookies</a>

<!-- Ou un bouton -->
<button data-cookies-settings>Paramètres cookies</button>
```

Le panneau de personnalisation s'ouvre directement, avec les choix actuels pré-cochés.

Vous pouvez aussi appeler la fonction JavaScript `openCookieSettings()` pour ouvrir le gestionnaire programmatiquement.

## Personnalisation du bandeau

Le bandeau utilise les classes BEM `.cookies`. Modifiez `core/css/cookies.css` pour personnaliser l'apparence.

```css
/* Exemple : bandeau en haut au lieu d'en bas */
.cookies {
  bottom: auto;
  top: 0;
  border-top: none;
  border-bottom: 1px solid var(--color-border);
  transform: translateY(-100%);
}
```

## Inclure dans une page

```html
<!-- Synchrone (avant les composants) -->
<script src="config-site.js"></script>

<!-- CSS -->
<link rel="stylesheet" href="core/css/cookies.css">

<!-- Defer -->
<script src="core/js/cookies.js" defer></script>
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `config-site.js` | Configuration (IDs analytics, catégories, bannière, endpoint) |
| `core/js/cookies.js` | Logique JS (bandeau, injection, preuve, nettoyage) |
| `core/css/cookies.css` | Styles du bandeau |
| `api/consent.php` | Endpoint PHP (enregistrement CSV) |
| `data/consents.csv` | Fichier de preuves (créé automatiquement, protégé par .htaccess) |
| `.env` | Variable `SITE_ORIGIN` pour restreindre le CORS |
| `core/js/legal.js` | Rendu dynamique des pages légales (mentions, confidentialité) |
| `mentions-legales.html` | Page des mentions légales (racine du projet) |
| `confidentialite.html` | Politique de confidentialité / cookies (racine du projet) |

## Pages légales

Deux pages prêtes à l'emploi sont fournies : **Mentions légales** (`mentions-legales.html`) et **Politique de confidentialité** (`confidentialite.html`). Elles contiennent un texte générique conforme (loi 2004-575, RGPD, CNIL).

**Important :** ces textes sont des modèles. Faites-les valider par un professionnel du droit avant mise en production.

### Configuration LEGAL_CONFIG

Ouvrez `config-site.js` et remplissez le bloc `LEGAL_CONFIG` :

```js
window.LEGAL_CONFIG = {
  company: 'Ma Societe SAS',
  legalForm: 'SAS',
  siret: '123 456 789 00000',
  registration: 'RCS Paris',
  representative: 'Jean Dupont',
  address: '123 rue Exemple, 75000 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'contact@monsite.fr',
  website: 'https://monsite.fr',

  hosting: {
    name: 'OVH',
    address: '2 rue Kellermann, 59100 Roubaix',
    url: 'https://www.ovh.com',
    contact: 'https://www.ovh.com/fr/support/'
  },

  developer: {
    name: 'Beely Studio',
    url: 'https://beely.studio',
    address: '20 chemin du Chateau, 79370 Ville'
  }
};
```

### Champs LEGAL_CONFIG

| Champ | Description | Obligatoire |
|---|---|---|
| `company` | Nom de l'entreprise ou raison sociale | Oui |
| `legalForm` | Forme juridique (SAS, SARL, Auto-entrepreneur, etc.) | Oui |
| `siret` | Numéro SIRET (14 chiffres) | Oui |
| `registration` | Immatriculation RCS ou RM | Oui |
| `representative` | Nom du responsable de la publication | Oui |
| `address` | Adresse complète du siège social | Oui |
| `phone` | Numéro de téléphone | Recommandé |
| `email` | Email de contact (aussi utilisé pour le RGPD) | Oui |
| `website` | URL complète du site (`https://...`) | Oui |
| `hosting.name` | Nom de l'hébergeur | Oui |
| `hosting.address` | Adresse de l'hébergeur | Oui |
| `hosting.url` | Site web de l'hébergeur | Recommandé |
| `hosting.contact` | URL de contact de l'hébergeur | Recommandé |
| `developer.name` | Nom du développeur / agence | Non (section masquée si vide) |
| `developer.url` | Site web du développeur | Non |
| `developer.address` | Adresse du développeur | Non |

### Fonctionnement dynamique

Le script `core/js/legal.js` remplit automatiquement les pages légales :

- **Attribut `data-legal`** : chaque élément portant cet attribut est rempli avec la valeur correspondante de `LEGAL_CONFIG`. Exemple : `<span data-legal="company"></span>` affiche le nom de l'entreprise.
- **Liens automatiques** : les balises `<a data-legal="email">` reçoivent automatiquement un `href="mailto:..."`. Idem pour `phone` (`tel:`) et `website` / `url` (lien externe).
- **Champs vides** : si un champ est vide dans la config, le placeholder `[NOM_DU_CHAMP]` reste visible pour identifier ce qui doit être rempli.
- **Section développeur** : masquée automatiquement (`display:none`) si `developer.name` est vide.

### Section cookies dynamique

Sur la page `confidentialite.html`, la section cookies génère automatiquement un tableau listant les services actifs (ceux avec un ID configuré dans `COOKIES_CONFIG`).

- Si des services sont configurés : un tableau affiche le nom, l'éditeur, la finalité, les cookies déposés et leur durée
- Si aucun service n'est configuré : le texte « Ce site n'utilise aucun cookie tiers » s'affiche
- Le cookie technique de consentement est toujours mentionné
- Un bouton « Gérer mes préférences cookies » est présent pour ouvrir le bandeau

### Inclure dans une page légale

```html
<!-- Synchrone (avant les composants) -->
<script src="config-site.js"></script>

<!-- Defer -->
<script src="core/js/legal.js" defer></script>
<script src="core/js/cookies.js" defer></script>
```

### Liens dans le footer

Les liens footer sont déclarés directement dans chaque page via le slot `content` du composant footer :

```html
<div data-component="footer"
     data-copyright="&copy; 2026 MonSite">
  <template data-slot="content">
    <nav class="footer__links">
      <a href="/mentions-legales.html">Mentions legales</a>
      <a href="/confidentialite.html">Politique de confidentialite</a>
    </nav>
  </template>
</div>
```

## Problèmes courants

- **Le bandeau ne s'affiche pas :** vérifiez que `cookies.js` est chargé avec `defer` et que `COOKIES_CONFIG` est défini dans `config-site.js`.
- **Les scripts analytics ne sont pas injectés :** ouvrez la console et vérifiez que le consentement a été accepté. Les identifiants (GA4, GTM, etc.) doivent être renseignés dans `COOKIES_CONFIG.categories[].services`.
- **Le bandeau réapparaît à chaque visite :** si vous changez `consentVersion`, le bandeau se réaffiche pour demander un nouveau consentement. C'est le comportement attendu.
- **Erreur CORS sur l'endpoint de consentement :** vérifiez `SITE_ORIGIN` dans `.env` et que `api/consent.php` est accessible.

## Voir aussi

- [Démarrer un projet](getting-started.html)
- [Formulaires](forms.html)
- [Paramètres URL](params.html)
