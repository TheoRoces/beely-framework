# Mise en production

Déployez votre site sur un hébergement Hostinger (ou tout serveur Apache avec accès SSH) et vérifiez que tout est prêt avant le lancement.

## Déploiement (Hostinger / Apache)

Déployez votre site via `rsync` pour des mises à jour rapides et automatiques.

### Prérequis

- Serveur Apache avec `mod_rewrite` et `mod_headers` activés
- PHP 7+ (pour `api/baserow.php` et `api/consent.php`)
- Certificat SSL (Let's Encrypt ou autre)
- Accès SSH activé sur l'hébergement (Hostinger : plan Premium ou supérieur)

### 1. Activer et configurer SSH

Sur Hostinger, allez dans **hPanel > Avancé > Accès SSH** et notez :

- **IP** du serveur
- **Port** (généralement `65002` chez Hostinger)
- **Nom d'utilisateur** (ex: `u123456789`)

### 2. Générer une clé SSH (si pas déjà fait)

```bash
# Générer une clé SSH ed25519
ssh-keygen -t ed25519 -C "votre@email.com"

# Appuyer sur Entrée pour accepter le chemin par défaut
# Choisir un mot de passe (ou Entrée pour aucun)
```

### 3. Première connexion SSH

Connectez-vous une première fois pour accepter l'empreinte du serveur :

```bash
# Remplacez USER, IP et PORT par vos valeurs
ssh -p PORT USER@IP

# Tapez "yes" pour accepter l'empreinte
# Entrez votre mot de passe SSH
# Une fois connecté, tapez "exit" pour revenir en local
```

### 4. Copier la clé publique sur le serveur

Pour ne plus avoir à taper le mot de passe à chaque déploiement :

```bash
# Copier la clé publique (demande le mot de passe une dernière fois)
ssh-copy-id -p PORT USER@IP

# Vérifier que la connexion fonctionne sans mot de passe
ssh -p PORT USER@IP "echo 'SSH OK'"
```

### 5. Identifier le dossier du domaine

Sur Hostinger, chaque domaine a son propre dossier. Connectez-vous en SSH pour le trouver :

```bash
ssh -p PORT USER@IP
ls ~/domains/
# Résultat : monsite.fr  autre-site.com  ...
exit
```

Le chemin de déploiement sera : `/home/USER/domains/monsite.fr/public_html/`

### 6. Créer le fichier d'exclusions

Créez un fichier `.rsync-exclude` à la racine du projet pour lister les fichiers à ne pas envoyer sur le serveur :

```
# .rsync-exclude

# Git
.git/
.gitignore

# Dev tools
CLAUDE.md
.claude/

# Deploy config (reste en local)
.deploy.env
.deploy.env.example

# Fichiers de dev
generate-sitemap.js
deploy.sh
.rsync-exclude

# OS files
.DS_Store
Thumbs.db
```

**Note :** le fichier `.env` n'est **pas** exclu du déploiement : il est envoyé sur le serveur par rsync et protégé par le `.htaccess`. Seuls les fichiers de développement et de configuration SSH sont exclus.

### 7. Configurer le déploiement

Le script `deploy.sh` lit les informations de connexion depuis un fichier `.deploy.env` (non committé dans git). Copiez le template et remplissez-le :

```bash
cp .deploy.env.example .deploy.env
```

Contenu de `.deploy.env` :

```bash
# Production
PROD_HOST=92.113.28.181
PROD_PORT=65002
PROD_USER=u937866772
PROD_PATH=/home/u937866772/domains/monsite.fr/public_html/
PROD_URL=https://monsite.fr

# Pré-production (optionnel)
PREPROD_HOST=
PREPROD_PORT=
PREPROD_USER=
PREPROD_PATH=
PREPROD_URL=
```

Rendez le script exécutable (une seule fois) :

```bash
chmod +x deploy.sh
```

### 8. Déployer

```bash
# Simuler le déploiement en production (dry-run)
./deploy.sh prod --dry-run

# Déployer en production
./deploy.sh prod

# Déployer en pré-production
./deploy.sh preprod

# Dry-run pré-production
./deploy.sh preprod --dry-run
```

**Comment ça marche :**

- `rsync` ne transfère que les fichiers modifiés (très rapide après le premier déploiement)
- `--delete` supprime sur le serveur les fichiers supprimés en local (synchronisation miroir)
- `--dry-run` simule sans rien modifier, parfait pour vérifier avant de déployer

### 9. Configurer le fichier `.env`

Créez un fichier `.env` à la racine de votre projet dans VSCode. Ce fichier contient les variables utilisées par les API PHP côté serveur :

```bash
# .env (à la racine du projet)
SITE_ORIGIN=https://monsite.fr
BASEROW_TOKEN=votre_token_api_ici
BASEROW_URL=https://api.baserow.io
FORM_WEBHOOK_URL=https://hook.eu2.make.com/votre-webhook-id
FORM_NOTIFICATION_EMAIL=contact@monsite.fr
```

Le fichier `.env` est **inclus dans le déploiement rsync** et sera envoyé automatiquement sur le serveur. Il est protégé par le `.htaccess` (inaccessible depuis le web) et exclu du versionning Git via `.gitignore`.

**Aucun accès SSH à Hostinger n'est nécessaire** pour la configuration : tout se fait en local dans VSCode.

| Variable | Utilisé par | Description |
|---|---|---|
| `SITE_ORIGIN` | Tous les proxies | Domaine autorisé pour les requêtes CORS |
| `BASEROW_TOKEN` | `api/baserow.php` | Token API Baserow (read-only) |
| `BASEROW_URL` | `api/baserow.php` | URL de l'instance Baserow |
| `FORM_WEBHOOK_URL` | `api/form.php` | Webhook Make.com pour les formulaires |
| `FORM_NOTIFICATION_EMAIL` | `api/form.php` | Email de notification (ajouté au payload) |
| `MAKE_API_KEY` | Commande « crée le formulaire » | Token API Make.com ([voir Formulaires](forms.md#creation-automatique-du-scenario-make-com)) |
| `MAKE_ZONE` | Commande « crée le formulaire » | Zone Make (eu1, eu2, us1, us2) |
| `MAKE_TEAM_ID` | Commande « crée le formulaire » | ID de l'équipe Make.com |

### 10. Vérifier le `.htaccess`

Le fichier `.htaccess` fourni gère automatiquement :

- **HTTPS** : redirection HTTP > HTTPS (301)
- **URLs propres** : `/blog` au lieu de `/blog.html`
- **Page 404** : page d'erreur personnalisée
- **Sécurité** : headers (HSTS, X-Frame-Options, X-Content-Type-Options), tous les dotfiles bloqués (`.env`, `.deploy.env`, etc.), dossier `data/` protégé, rate limiting sur les endpoints PHP
- **Anti-cache CDN** : désactive le cache LiteSpeed/HCDN sur les fichiers CSS, JS et HTML pour que chaque déploiement soit immédiatement visible (headers `no-cache`, `CDN-Cache-Control: no-store`, `CacheLookup off`)

Testez que `mod_rewrite` fonctionne en accédant à `https://votre-site.fr/blog` (sans .html).

### 11. Sitemap

Le sitemap est **généré automatiquement à chaque déploiement** par `deploy.sh`. Il utilise l'URL du site configurée dans `.deploy.env` (`PROD_URL` ou `PREPROD_URL`).

Vous pouvez aussi le générer manuellement :

```bash
node generate-sitemap.js https://votre-site.fr
```

Cela crée `sitemap.xml` et `robots.txt` avec les URLs propres. Soumettez le sitemap dans [Google Search Console](https://search.google.com/search-console).

### Récap : fichiers à personnaliser par projet

Chaque nouveau projet nécessite de remplir **3 fichiers** :

| Fichier | Contenu | Committé ? |
|---|---|---|
| `config-site.js` | Nom du site, favicon, analytics, informations légales, config blog (tableId) | Oui |
| `.env` | Secrets : tokens Baserow & Make.com, webhook URL, email notification, CORS origin | Non |
| `.deploy.env` | Connexion SSH : host, port, user, path pour prod et préprod | Non |

Les fichiers `.env.example` et `.deploy.env.example` servent de templates documentés (committés dans git).

Pour le **dépôt Git**, configurez le remote au démarrage du projet :

```bash
git remote add origin https://github.com/votre-user/votre-projet.git
git push -u origin main
```

### Récap : workflow quotidien

Une fois tout configuré, le cycle de développement-déploiement est simple :

```bash
# 1. Modifier le code en local (Live Server pour prévisualiser)

# 2. Commiter les changements
git add -A
git commit -m "Update hero section design"

# 3. Pousser sur GitHub
git push

# 4. Déployer en production
./deploy.sh prod
```

## Déploiement manuel (FTP / cPanel)

Si vous n'utilisez pas SSH/rsync, vous pouvez déployer manuellement via le **gestionnaire de fichiers cPanel** ou un **client FTP** (FileZilla, Cyberduck, etc.). Cette méthode fonctionne avec tous les hébergeurs (o2switch, OVH, Infomaniak, etc.).

### 1. Uploader les fichiers

Connectez-vous à votre espace d'hébergement et accédez au dossier de votre domaine (généralement `public_html/`).

- **cPanel** : Gestionnaire de fichiers > naviguez dans `public_html/` > glissez-déposez vos fichiers
- **FTP** : connectez votre client avec les identifiants fournis par votre hébergeur et uploadez dans le dossier du domaine

### 2. Fichiers à ne pas envoyer

Excluez ces fichiers/dossiers du transfert (ils sont inutiles en production) :

```
.git/                  # Historique Git
.claude/               # Configuration Claude Code
CLAUDE.md              # Instructions Claude Code
.deploy.env            # Config SSH locale
.rsync-exclude         # Liste d'exclusion rsync
deploy.sh              # Script de déploiement
generate-sitemap.js    # Générateur de sitemap (Node.js)
docs/                  # Documentation (sauf si souhaitée en ligne)
```

### 3. Créer le `.env` sur le serveur

Le fichier `.env` n'est pas dans Git, il faut le créer manuellement sur le serveur. Dans le gestionnaire de fichiers cPanel, créez un nouveau fichier `.env` à la racine du site :

```bash
# .env (racine du site sur le serveur)
SITE_ORIGIN=https://votre-site.fr
BASEROW_TOKEN=votre-token-baserow
BASEROW_URL=https://api.baserow.io
FORM_WEBHOOK_URL=https://hook.eu2.make.com/xxx
FORM_NOTIFICATION_EMAIL=contact@votre-site.fr
```

Le `.htaccess` fourni bloque automatiquement l'accès à ce fichier depuis le navigateur.

### 4. Vérifications après upload

- [ ] **PHP actif** : la plupart des hébergeurs mutualisés l'activent par défaut
- [ ] **`.htaccess` lu** : testez que les URLs propres fonctionnent (`/blog` au lieu de `/blog.html`)
- [ ] **HTTPS actif** : activez le certificat SSL dans votre panneau d'hébergement si ce n'est pas fait
- [ ] **`.env` inaccessible** : vérifiez que `https://votre-site.fr/.env` retourne une erreur 403
- [ ] **Dossier `data/`** : il sera créé automatiquement par `consent.php` au premier consentement cookies

Le projet étant **zéro-dépendance**, il n'y a aucun `npm install` ou build à lancer. Les fichiers fonctionnent tels quels.

## Checklist de lancement

Vérifiez chaque point avant de considérer le site comme prêt à être lancé.

### Charte graphique

- [ ] `tokens.css` : couleurs principales (`--color-primary`, `--color-secondary`)
- [ ] `tokens.css` : polices personnalisées (`--font-heading`, `--font-body`)
- [ ] `tokens.css` : arrondis, ombres, conteneur max-width si besoin
- [ ] Test dark mode : toutes les pages lisibles en mode sombre

### Configuration (`config-site.js`)

- [ ] **SITE_CONFIG** : nom du site (`name`) renseigné
- [ ] **SITE_CONFIG** : favicon (`favicon`) renseigné
- [ ] **COOKIES_CONFIG** : IDs analytics renseignés (ou vides si non utilisés)
- [ ] **COOKIES_CONFIG** : textes du bandeau cookies adaptés
- [ ] **COOKIES_CONFIG** : `privacyUrl` pointe vers `/confidentialite.html`
- [ ] **COOKIES_CONFIG** : `consentEndpoint` configuré (`/api/consent.php`)
- [ ] **BLOG_CONFIG** : connexion Baserow renseignée (si blog), `token` vide (le proxy PHP utilise `.env`)
- [ ] **LEGAL_CONFIG** : toutes les infos entreprise remplies (company, SIRET, adresse, etc.)
- [ ] **LEGAL_CONFIG** : infos hébergeur remplies (nom, adresse, URL)
- [ ] **LEGAL_CONFIG** : section développeur remplie ou laissée vide (masquée automatiquement)

### Pages légales & RGPD

- [ ] `mentions-legales.html` : ouvrir et vérifier que toutes les infos s'affichent (pas de `[...]`)
- [ ] `confidentialite.html` : vérifier le tableau cookies (doit lister les services configurés)
- [ ] Bouton « Gérer mes préférences cookies » fonctionnel sur la page confidentialité
- [ ] Bandeau cookies : lien vers la politique de confidentialité visible
- [ ] Footer de chaque page : liens vers mentions légales et confidentialité
- [ ] Textes légaux validés par un professionnel du droit
- [ ] `api/consent.php` fonctionnel (tester un accept/refus et vérifier `data/consents.csv`)

### Contenu & SEO

- [ ] Header : logo, navigation finale, liens corrects
- [ ] Footer : copyright à jour, liens légaux présents
- [ ] Toutes les balises `<title>` uniques et descriptives
- [ ] Toutes les balises `<meta description>` renseignées
- [ ] `404.html` : texte et lien personnalisés
- [ ] `generate-sitemap.js` exécuté avec l'URL finale
- [ ] `robots.txt` généré et correct

### Serveur & Sécurité

- [ ] `.env` : `SITE_ORIGIN` renseigné avec l'URL de production
- [ ] `.env` : `BASEROW_TOKEN` renseigné (si blog)
- [ ] HTTPS actif et fonctionnel
- [ ] URLs propres fonctionnelles (`/blog` au lieu de `/blog.html`)
- [ ] `.htaccess` : vérifier que `.env` et tous les dotfiles sont inaccessibles depuis le navigateur
- [ ] `data/` : vérifier que le dossier est inaccessible depuis le navigateur
- [ ] HSTS actif (header `Strict-Transport-Security`)
- [ ] Rate limiting actif sur les endpoints PHP (`api/rate-limit.php`)
- [ ] Page 404 accessible (`/page-inexistante`)

### Tests finaux

- [ ] Test mobile : toutes les pages responsive
- [ ] Test dark mode : lisibilité de toutes les pages
- [ ] Test bandeau cookies : accepter, refuser, personnaliser
- [ ] Test pages légales : infos dynamiques correctes
- [ ] Test blog : listing, article, filtres (si blog actif)
- [ ] Test 404 : page d'erreur personnalisée
- [ ] Test formulaires : validation, envoi (si formulaires actifs)
- [ ] Supprimer les fichiers inutiles du serveur (`docs/`, `.git/`, `snippets/`)

## Problèmes courants

- **Le déploiement échoue :** vérifiez que `.deploy.env` est bien rempli et que la clé SSH est configurée (`ssh-keygen -t ed25519`).
- **Le `.env` n'est pas envoyé :** vérifiez qu'il n'est pas listé dans `.rsync-exclude` (il ne devrait pas y être).
- **Les URLs propres ne fonctionnent pas :** vérifiez que `mod_rewrite` est activé sur le serveur Apache et que le `.htaccess` est bien déployé.
- **Le CSS/JS n'est pas à jour après déploiement :** le `.htaccess` désactive déjà le cache CDN. Videz le cache navigateur (`Ctrl+Shift+R`).

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Cookies & RGPD](cookies.md)
- [Sitemap](sitemap.md)
- [Formulaires](forms.md)
