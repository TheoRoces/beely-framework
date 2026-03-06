# Claude Code

Skills, commandes rapides et automatisations avec Claude Code pour Site System.

## Qu'est-ce qu'un Skill ?

Un **Skill** est une extension réutilisable de Claude Code. C'est un fichier `SKILL.md` contenant des instructions structurées que Claude charge automatiquement (selon le contexte) ou manuellement via une commande `/nom-du-skill`.

Contrairement aux commandes figées (`/help`, `/compact`), les skills sont des **playbooks** que Claude orchestre avec ses outils : lecture de fichiers, recherche dans le code, édition, exécution de commandes, etc.

### Différence avec CLAUDE.md

| Aspect | CLAUDE.md | Skills |
|---|---|---|
| Chargement | Toujours chargé en contexte | Chargé à la demande ou selon le contexte |
| Invocation | Automatique (directives permanentes) | Via `/skill-name` ou détection auto |
| Usage | Règles globales, conventions, config | Tâches spécifiques et répétitives |
| Taille | Compact (toujours en mémoire) | Peut être détaillé (chargé à la demande) |

## Structure d'un Skill

Les skills sont stockés dans `.claude/skills/` à deux niveaux :

| Portée | Chemin | Disponible pour |
|---|---|---|
| Projet | `.claude/skills/mon-skill/SKILL.md` | Ce projet uniquement |
| Personnel | `~/.claude/skills/mon-skill/SKILL.md` | Tous vos projets |

### Format du fichier SKILL.md

```markdown
---
name: mon-skill
description: Quand et pourquoi utiliser ce skill
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
argument-hint: [argument-optionnel]
---

# Instructions en markdown

Claude suivra ces instructions quand le skill est invoqué.
Utiliser $ARGUMENTS pour référencer les arguments passés.
```

### Options du frontmatter

| Champ | Défaut | Description |
|---|---|---|
| `name` | Nom du dossier | Nom affiché et commande `/slash`. Minuscules, tirets uniquement. |
| `description` | — | Décrit quand utiliser le skill. Claude l'utilise pour le chargement auto. |
| `user-invocable` | `true` | Visible dans le menu `/`. Mettre à `false` pour un skill invisible. |
| `disable-model-invocation` | `false` | Empêche Claude de charger le skill automatiquement. Pour les actions manuelles. |
| `allowed-tools` | Tous | Restreint les outils utilisables (ex: `Read, Grep` pour un skill lecture seule). |
| `argument-hint` | — | Indication dans l'autocomplete (ex: `[fichier.html]`). |
| `context` | — | Mettre à `fork` pour exécuter dans un sous-agent isolé. |
| `model` | Hérité | Forcer un modèle spécifique (ex: `claude-opus-4-6`). |

## Skills du projet

Site System inclut **6 skills personnalisés** dans `.claude/skills/`, conçus pour accélérer le développement.

### /design-check

Vérifie la qualité design d'une page ou d'un composant selon la checklist complète : alignement, hiérarchie visuelle, responsive (375px, 768px, 1200px+), espacements avec tokens, contraste WCAG, typographie, états interactifs, code CSS propre.

```bash
/design-check index.html
/design-check core/css/elements.css
```

Retourne un tableau avec score /10 et corrections prioritaires.

### /new-page

Crée une nouvelle page HTML complète avec le template standard Site System : imports CSS/JS, composants Header/Footer, structure sémantique.

```bash
/new-page contact
/new-page a-propos
```

Génère le fichier `contact.html` ou `a-propos.html` à la racine, prêt à personnaliser.

### /wireframe

Intègre une section pré-faite (wireframe) dans une page. Accède aux 375+ sections disponibles dans `wireframes/` : heros, banners, CTAs, FAQs, testimonials, etc.

```bash
/wireframe hero-03
/wireframe cta
/wireframe banner-07
```

Si un type est donné sans numéro (ex: `cta`), Claude liste les options disponibles et vous laisse choisir.

### /deploy-check

Vérification pré-déploiement complète. Recherche les problèmes courants avant de pousser en production :

- `console.log`, `debugger`, `TODO` restants
- URLs `localhost` en dur
- Fichiers `.env` protégés et tokens non exposés
- Headers de sécurité Apache
- Meta tags SEO, `sitemap.xml`, `robots.txt`
- Configuration `config-site.js` cohérente

```bash
/deploy-check
```

### /seo-check

Audit SEO on-page d'une page HTML. Vérifie les balises meta (title, description, Open Graph), la structure des titres (h1/h2/h3), les images (alt), les liens, la sémantique HTML, et l'accessibilité.

```bash
/seo-check index.html
/seo-check blog.html
```

Retourne un score /10 avec recommandations priorisées.

### /component

Crée un nouveau composant réutilisable dans `components/` en suivant le pattern `registerComponent()` du framework. Génère le fichier JS avec la bonne structure, les slots, et le nommage BEM.

```bash
/component pricing-card
/component sidebar
```

## Commandes rapides

En plus des skills, des commandes rapides sont définies dans `CLAUDE.md` pour les actions fréquentes. Elles s'exécutent **sans confirmation**.

### Git

| Commande | Action |
|---|---|
| `commit` | `git add -A && git commit -m "<message auto>"` |
| `push` / `pousse` | `git add -A && git commit -m "<message auto>" && git push` |
| `status` / `état` | `git status` |
| `log` | `git log --oneline -10` |
| `diff` | `git diff` |

### Déploiement

| Commande | Action |
|---|---|
| `push prod` / `p prod` | Déploie en production via rsync/SSH |
| `push preprod` / `p preprod` | Déploie en pré-production |
| `push git` / `p git` | Commit + push GitHub |
| `push all` / `p all` | Commit + push + déploiement prod & preprod |
| `push pgit` / `p pgit` | Commit + push + déploiement prod |
| `push ppgit` / `p ppgit` | Commit + push + déploiement preprod |

## Créer un skill personnalisé

Pour créer votre propre skill :

### 1. Créer le dossier

```bash
mkdir -p .claude/skills/mon-skill
```

### 2. Écrire le SKILL.md

```markdown
---
name: mon-skill
description: Description claire de quand utiliser ce skill
user-invocable: true
allowed-tools: Read, Grep
---

# Instructions

Décrivez ce que Claude doit faire quand ce skill est invoqué.
Utilisez $ARGUMENTS pour les arguments passés par l'utilisateur.
```

### 3. Tester

```bash
/mon-skill argument1 argument2
```

### Bonnes pratiques

- **Description claire** : inclure des mots-clés que Claude peut détecter pour le chargement auto
- **Une responsabilité** : un skill = une tâche précise
- **Concis** : moins de 500 lignes, déplacer les détails dans des fichiers annexes
- **Désactiver l'auto pour les actions destructives** : `disable-model-invocation: true` pour `/deploy`, `/commit`, etc.
- **Restreindre les outils** : utiliser `allowed-tools` pour les skills en lecture seule

## Variables disponibles

| Variable | Description |
|---|---|
| `$ARGUMENTS` | Tous les arguments passés après `/skill-name` |
| `$ARGUMENTS[0]` / `$0` | Premier argument (index 0) |
| `$ARGUMENTS[1]` / `$1` | Deuxième argument |
| `${CLAUDE_SESSION_ID}` | ID de la session Claude en cours |

### Contexte dynamique

Vous pouvez injecter la sortie d'une commande shell dans le skill avec la syntaxe `` !`commande` ``. La commande est exécutée avant que Claude ne lise le skill :

```markdown
---
name: pr-summary
description: Résume la PR en cours
---

## Contexte
- Diff : !`git diff main...HEAD`
- Branch : !`git branch --show-current`

Résume les changements de cette PR.
```

## Skills intégrés à Claude Code

Claude Code inclut également des skills pré-installés :

| Skill | Description |
|---|---|
| `/simplify` | Revue du code modifié pour la qualité, la réutilisation et l'efficacité |
| `/review` | Revue de pull request |
| `/security-review` | Audit de sécurité du code |
| `/debug` | Débogage de la session Claude Code |
| `/batch` | Changements parallèles sur 5-30 worktrees isolés |
| `/insights` | Analyse des sessions Claude |

## Voir aussi

- [Démarrer un projet](getting-started.md)
- [Composants](components.md)
- [Wireframes](wireframes.md)
