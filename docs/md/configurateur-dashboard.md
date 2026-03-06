# Configurateur — Dashboard

Le Dashboard est l'écran d'accueil du Configurateur. Il offre une vue d'ensemble du projet : statistiques, actions rapides et pages récentes.

## Vue d'ensemble

Le Dashboard est le premier panel affiché lorsque l'utilisateur ouvre le Configurateur. Il centralise les informations essentielles du projet et permet d'accéder rapidement aux fonctionnalités les plus utilisées.

Toutes les données affichées sont calculées dynamiquement depuis le registre `pages.json`, qui contient la liste complète des pages du site avec leur statut, leur chemin et leur date de dernière modification.

## Statistiques

Le haut du dashboard affiche **3 cartes de statistiques**, calculées en temps réel depuis `pages.json` :

| Carte | Donnée | Description |
|---|---|---|
| **Pages totales** | Nombre total d'entrées | Compte toutes les pages enregistrées dans le registre, quel que soit leur statut. |
| **Pages publiées** | Pages avec statut `published` | Nombre de pages actuellement publiées et accessibles en production. |
| **Brouillons** | Pages avec statut `draft` | Nombre de pages en cours de rédaction, non encore publiées. |

Les compteurs se mettent à jour automatiquement à chaque rafraîchissement du dashboard.

## Actions rapides

Sous les statistiques, **4 cartes cliquables** permettent d'accéder aux actions les plus courantes :

| Action | Comportement | Destination |
|---|---|---|
| **Nouvelle page** | Ouvre un modal de création de page | Modal inline — permet de saisir le titre, le slug et le template de la nouvelle page. |
| **Configurer le site** | Navigue vers un autre panel | Panel **Configurateur** — pour modifier les tokens, la configuration globale, etc. |
| **Documentation** | Ouvre un lien externe | Redirige vers la documentation du framework (`docs/`). |
| **Wireframes** | Navigue vers un autre panel | Panel **Bibliothèque > Wireframes** — accès aux 375+ sections prêtes à l'emploi. |

Chaque carte affiche une icône, un titre et une courte description. Au survol, un effet visuel indique que la carte est cliquable.

## Pages récentes

La section inférieure du dashboard liste les **5 dernières pages modifiées**. Chaque entrée affiche :

- **Titre** — le nom de la page tel que défini dans le registre
- **Chemin** — le chemin relatif du fichier HTML (ex : `/index.html`, `/blog.html`)
- **Date de modification** — la date de dernière mise à jour, formatée en français (ex : *6 mars 2026*)

Les pages sont triées par date de modification décroissante (la plus récente en premier). Si le registre contient moins de 5 pages, seules les pages disponibles sont affichées.

## Rafraîchissement automatique

Le dashboard se **rafraîchit automatiquement** à chaque fois que l'utilisateur revient sur ce panel. Cela garantit que les statistiques, les actions rapides et les pages récentes reflètent toujours l'état actuel du projet.

Le rafraîchissement recharge les données depuis `pages.json` et met à jour le DOM sans rechargement complet de la page.

## API JavaScript

Le dashboard est géré par le module `builder-dashboard.js`. Il expose une méthode publique via l'objet global `window.BuilderDashboard`.

| Méthode | Description |
|---|---|
| `window.BuilderDashboard.refresh()` | Recharge les données depuis `pages.json` et met à jour l'affichage complet du dashboard (statistiques, actions rapides, pages récentes). |

### Exemple d'utilisation

```js
// Rafraîchir le dashboard manuellement
window.BuilderDashboard.refresh();

// Exemple : rafraîchir après une action utilisateur
document.querySelector('.btn-save').addEventListener('click', () => {
  savePage().then(() => {
    window.BuilderDashboard.refresh();
  });
});
```

### Module source

Le fichier source du module est `builder-dashboard.js`. Il est chargé par le Configurateur et initialisé automatiquement lorsque le panel Dashboard est activé.

## Voir aussi

- [Composants](components.md)
- [Wireframes](wireframes.md)
- [Démarrer un projet](getting-started.md)
