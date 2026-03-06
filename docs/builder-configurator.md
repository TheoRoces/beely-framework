# Builder — Configurateur

Le configurateur permet de modifier les fichiers de configuration du site directement depuis l'interface du builder, sans éditer manuellement les fichiers.

## Intégration dans le builder

Le configurateur est intégré nativement dans le builder — il ne s'agit pas d'un iframe séparé. Le fichier `configurator.html` est chargé et injecté dans le DOM du builder au moment où l'utilisateur accède au panel de configuration.

- Les **styles sont scopés** pour éviter les conflits avec le reste du builder
- Les **scripts sont exécutés** dans le contexte du builder (accès au DOM principal)
- Module JS : `builder-configurator.js`

## Fichiers configurables

Le configurateur permet de modifier trois fichiers de configuration distincts :

| Fichier | Description | Visibilité |
|---------|-------------|------------|
| `config-site.js` | Configuration principale du site | Public (côté client) |
| `.env` | Variables d'environnement sensibles (tokens API, webhooks) | Privé (serveur uniquement) |
| `.deploy.env` | Configuration SSH pour le déploiement | Privé (serveur uniquement) |

## SITE_CONFIG (config-site.js)

Configuration générale du site, définie dans l'objet `window.SITE_CONFIG`.

| Propriété | Description | Exemple |
|-----------|-------------|---------|
| `name` | Nom du site | `"Mon Site"` |
| `favicon` | Chemin vers le favicon | `"assets/favicon.ico"` |
| `domains.prod` | URL de production | `"https://monsite.fr"` |
| `domains.preprod` | URL de pré-production | `"https://preprod.monsite.fr"` |

```js
window.SITE_CONFIG = {
  name: 'Mon Site',
  favicon: 'assets/favicon.ico',
  domains: {
    prod: 'https://monsite.fr',
    preprod: 'https://preprod.monsite.fr'
  }
};
```

## COOKIES_CONFIG (config-site.js)

Identifiants des services de tracking et analytics, injectés uniquement après consentement RGPD.

| Propriété | Description | Format |
|-----------|-------------|--------|
| `googleAnalytics` | ID Google Analytics (GA4) | `G-XXXXXXXXXX` |
| `googleTagManager` | ID Google Tag Manager | `GTM-XXXXXXX` |
| `facebookPixel` | ID Facebook Pixel | `123456789012345` |
| `hotjar` | ID Hotjar | `1234567` |
| `clarity` | ID Microsoft Clarity | `xxxxxxxxxx` |
| `linkedinInsight` | ID LinkedIn Insight Tag | `123456` |
| `tiktokPixel` | ID TikTok Pixel | `XXXXXXXXXX` |

## BLOG_CONFIG (config-site.js)

Configuration du blog dynamique connecté à Baserow (headless CMS).

### Connexion Baserow

| Propriété | Description |
|-----------|-------------|
| `baserow.tableId` | ID de la table Baserow contenant les articles |
| `baserow.proxyUrl` | URL du proxy PHP — `/api/baserow.php` (le token API reste côté serveur) |

### Options d'affichage

| Propriété | Description | Défaut |
|-----------|-------------|--------|
| `display.postsPerPage` | Nombre d'articles par page | `9` |
| `display.showCategories` | Afficher les catégories | `true` |
| `display.showReadTime` | Afficher le temps de lecture | `true` |

```js
window.BLOG_CONFIG = {
  baserow: {
    tableId: 12345,
    proxyUrl: '/api/baserow.php'
  },
  display: {
    postsPerPage: 9,
    showCategories: true,
    showReadTime: true
  }
};
```

## LEGAL_CONFIG (config-site.js)

Informations légales utilisées pour générer automatiquement les pages `mentions-legales.html` et `confidentialite.html`.

| Propriété | Description |
|-----------|-------------|
| `companyName` | Raison sociale de l'entreprise |
| `companyType` | Forme juridique (SAS, SARL, auto-entrepreneur…) |
| `address` | Adresse du siège social |
| `email` | Email de contact |
| `phone` | Numéro de téléphone |
| `siret` | Numéro SIRET |
| `tvaNumber` | Numéro de TVA intracommunautaire |
| `capitalSocial` | Capital social |
| `hostingProvider` | Nom de l'hébergeur |
| `hostingAddress` | Adresse de l'hébergeur |
| `dpoEmail` | Email du délégué à la protection des données (DPO) |

```js
window.LEGAL_CONFIG = {
  companyName: 'Ma Société',
  companyType: 'SAS',
  address: '123 rue de Paris, 75001 Paris',
  email: 'contact@monsite.fr',
  phone: '+33 1 23 45 67 89',
  siret: '123 456 789 00010',
  tvaNumber: 'FR12345678901',
  capitalSocial: '10 000 €',
  hostingProvider: 'Hostinger',
  hostingAddress: 'Kaunas, Lituanie',
  dpoEmail: 'dpo@monsite.fr'
};
```

## Variables d'environnement (.env)

Fichier `.env` à la racine du projet. Contient les tokens et credentials sensibles. Ce fichier n'est **jamais commité** ni **jamais déployé** (protégé par `.gitignore`, `.rsync-exclude` et `.htaccess`).

| Variable | Description |
|----------|-------------|
| `BASEROW_TOKEN` | Token API Baserow (lecture seule) — utilisé par `api/baserow.php` |
| `FORM_WEBHOOK_URL` | URL du webhook Make.com pour les formulaires |
| `FORM_NOTIFICATION_EMAIL` | Email de notification à la réception d'un formulaire |
| `MAKE_API_KEY` | Clé API Make.com |
| `MAKE_ZONE` | Zone Make.com (ex : `eu1.make.com`) |
| `MAKE_TEAM_ID` | ID de l'équipe Make.com |

```bash
# .env — ne jamais commiter ce fichier
BASEROW_TOKEN=votre-token-baserow
FORM_WEBHOOK_URL=https://hook.eu1.make.com/xxx
FORM_NOTIFICATION_EMAIL=contact@monsite.fr
MAKE_API_KEY=votre-cle-api
MAKE_ZONE=eu1.make.com
MAKE_TEAM_ID=12345
```

## Configuration de déploiement (.deploy.env)

Fichier `.deploy.env` à la racine du projet. Contient les coordonnées SSH pour le déploiement via `deploy.sh`. Même protection que `.env` : jamais commité, jamais déployé.

### Production

| Variable | Description |
|----------|-------------|
| `PROD_HOST` | Adresse IP ou hostname du serveur de production |
| `PROD_PORT` | Port SSH (généralement `22` ou `65002`) |
| `PROD_USER` | Nom d'utilisateur SSH |
| `PROD_PATH` | Chemin absolu du répertoire distant |
| `PROD_URL` | URL publique du site en production |

### Pré-production

| Variable | Description |
|----------|-------------|
| `PREPROD_HOST` | Adresse IP ou hostname du serveur de pré-production |
| `PREPROD_PORT` | Port SSH |
| `PREPROD_USER` | Nom d'utilisateur SSH |
| `PREPROD_PATH` | Chemin absolu du répertoire distant |
| `PREPROD_URL` | URL publique du site en pré-production |

```bash
# .deploy.env — ne jamais commiter ce fichier
PROD_HOST=92.113.28.181
PROD_PORT=65002
PROD_USER=u937866772
PROD_PATH=/home/u937866772/domains/monsite.fr/public_html/
PROD_URL=https://monsite.fr

PREPROD_HOST=92.113.28.181
PREPROD_PORT=65002
PREPROD_USER=u937866772
PREPROD_PATH=/home/u937866772/domains/preprod.monsite.fr/public_html/
PREPROD_URL=https://preprod.monsite.fr
```

## Sauvegarde

Le configurateur utilise l'API backend du builder pour lire et écrire les fichiers de configuration.

- Chaque section dispose d'un **bouton « Sauvegarder »** indépendant
- Les fichiers sont écrits via l'API backend : `BuilderAPI.cfgSave`
- La lecture se fait via `BuilderAPI.cfgRead`
- Les fichiers sensibles (`.env`, `.deploy.env`) ne sont **jamais exposés côté client** en dehors du builder local

```js
// Lecture d'un fichier de configuration
const config = await BuilderAPI.cfgRead('config-site.js');

// Sauvegarde après modification
await BuilderAPI.cfgSave('config-site.js', newContent);
```

> **Sécurité** : Les fichiers `.env` et `.deploy.env` sont uniquement accessibles via le serveur Python local (port 5555). Ils ne sont jamais commités dans git, jamais déployés via rsync, et protégés par `.htaccess` côté Apache.

## Voir aussi

- [Builder — Vue d'ensemble](builder-overview.md)
- [Builder — Dashboard](builder-dashboard.md)
- [Builder — Pages](builder-pages.md)
- [Builder — Wireframes](builder-wireframes.md)
- [Cookies & Analytics](cookies.md)
- [Démarrer un projet](getting-started.md)
