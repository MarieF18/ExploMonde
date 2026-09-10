# ExploMonde

Application web accessible permettant d'explorer les pays et leurs informations principales.

## Comment lancer le projet

### Prérequis

- Node.js installé ;
- une clé API REST Countries v5.

### Démarrage

Le proxy REST Countries nécessite une clé API v5. Dans PowerShell :

```powershell
$env:REST_COUNTRIES_API_KEY = "votre-cle-rest-countries"
npm start
```

Puis ouvrir [http://127.0.0.1:5500/index.html](http://127.0.0.1:5500/index.html).

La clé API ne doit pas être ajoutée dans les fichiers du projet ni commitée dans Git.
Le serveur Node doit être utilisé à la place de Live Server, car il fournit la route proxy `/api/restcountries`.

## Fonctionnalités

- chargement initial des pays avec Europe sélectionnée par défaut ;
- récupération des régions disponibles dans le select ;
- affichage de tous les pays lorsqu'aucune région n'est sélectionnée ;
- recherche avec anti-rebond de 300 ms ;
- résultats limités aux noms qui commencent par la saisie ;
- filtrage des cartes par région ;
- affichage du détail d'un pays dans un dialogue ;
- ouverture des cartes au clic ou au clavier ;
- états chargement, succès, vide et erreur ;
- bouton `Réessayer` en cas d'erreur ;
- lien d'évitement et focus visible pour la navigation clavier ;
- thème sombre automatique selon les préférences du système ;
- interface responsive mobile-first.

## Choix techniques

- HTML sémantique avec `header`, `main`, `section`, `article`, `dialog` et des labels associés aux champs ;
- CSS séparé en tokens, styles de base et composants ;
- variables CSS pour les couleurs, espacements, rayons et ombres ;
- grille responsive avec `auto-fit` et `minmax(260px, 1fr)` ;
- titres fluides avec `clamp()` ;
- JavaScript natif en modules ES ;
- création des cartes avec l'API DOM et `textContent`, sans `innerHTML` ;
- `DocumentFragment` pour insérer les cartes en une seule opération ;
- délégation d'événements sur le conteneur des cartes ;
- API REST Countries v5 pour les données ;
- proxy Node local pour éviter les problèmes CORS et protéger la clé API côté serveur ;
- pagination des résultats pour récupérer tous les pays et toutes les régions.

## Organisation

```text
index.html             Structure de la page
css/token.css          Variables de design et thème sombre
css/base.css           Styles globaux et responsive
css/components.css     Styles des contrôles et cartes
js/api.js              Appels REST Countries et normalisation
js/data.js             Données de référence du module initial
js/ui.js               Création des cartes
js/main.js             Logique de recherche, filtrage et affichage
server.js              Serveur statique et proxy REST Countries
package.json           Script de démarrage Node.js
```