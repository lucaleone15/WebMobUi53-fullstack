# HEIG-VD DévProdMéd Course - Mini-projet

Ce dépôt contient le mini-projet à réaliser dans le cadre du cours
_"[Développement de produit média (DévProdMéd)](https://github.com/heig-vd-devprodmed-course/heig-vd-devprodmed-course)"_
enseigné à la
[Haute Ecole d'Ingénierie et de Gestion du Canton de Vaud (HEIG-VD)](https://heig-vd.ch),
Suisse.

## Objectif du mini-projet

L'objectif de ce mini-projet est de créer un réseau social simple en utilisant le
framework [Laravel](https://laravel.com/). Ce projet permettra de mettre en pratique les concepts
appris dans le cours.

## Pré-requis

Afin de lancer ce projet, une stack compatible avec Laravel, est requise.

Voici les pré-requis nécessaires :

- PHP >= 8.0.
- Composer.
- Node.js et npm.
- Une base de données (MySQL, PostgreSQL, SQLite, etc.).
- Un serveur web (Apache, Nginx, etc.).

[Laravel Herd](https://helm.sh/docs/charts/laravel/) est recommandé pour une installation facile de Laravel et de ses dépendances.

## Développement local

Pour développer et tester le mini-projet en local, voici les étapes à suivre :

1. Cloner ce dépôt sur votre machine locale :

    ```bash
    git clone git@github.com:heig-vd-devprodmed-course/heig-vd-devprodmed-mini-projet.git

    cd heig-vd-devprodmed-mini-projet
    ```

2. Installer les dépendances avec npm et Composer :

    ```bash
    npm install && npm run build

    composer install
    ```

3. Copier le fichier `.env.example` en `.env`.
4. Modifier les variables d'environnement si nécessaire (optionnel).
5. Générer la clé d'application Laravel :

    ```bash
    php artisan key:generate
    ```

6. Créer le lien symbolique pour les fichiers téléversés :

    ```bash
    php artisan storage:link
    ```

7. Créer la base de données et exécuter les migrations :

    ```bash
    php artisan migrate
    ```

    S'il est nécessaire de réinitialiser la base de données, utiliser la commande `php artisan migrate:reset` puis `php artisan migrate` à nouveau.

8. Optionnel : en mode développement, il est possible de peupler la base de données avec des données fictives :

    ```bash
    php artisan db:seed
    ```

9. Démarrer le serveur de développement Laravel :

    ```bash
    composer run dev
    ```

L'application sera accessible à l'adresse <http://127.0.0.1:8000>.

---

## Système de sondage

### Fonctionnalités implémentées

- Dashboard des sondages de la personne connectée (brouillons, programmés, actifs, terminés)
- Création, édition et suppression d'un sondage
- Gestion des options de réponse (ajout, modification, suppression)
- Paramètres : brouillon, choix multiple, modification du vote, résultats publics, dates de début et de fin
- Lancement d'un brouillon depuis le dashboard
- Lien de partage via token (copie en un clic)
- Page de vote accessible sans compte via un lien contenant le token
- Vote pour les utilisateurs authentifiés, avec unicité garantie côté frontend et API
- Modification du vote si le sondage l'autorise
- Affichage conditionnel des résultats selon les droits (propriétaire, résultats publics, déjà voté)
- Résultats en temps réel via polling toutes les 5 secondes, avec graphique à barres
- Indication claire qu'un sondage est terminé et que le vote n'est plus possible

### Endpoints API

| Méthode  | URL                          | Description                         | Auth |
| -------- | ---------------------------- | ----------------------------------- | ---- |
| `GET`    | `/api/v1/polls`              | Liste des sondages de l'utilisateur | ✓    |
| `POST`   | `/api/v1/polls`              | Créer un sondage                    | ✓    |
| `PUT`    | `/api/v1/polls/{id}`         | Modifier un sondage                 | ✓    |
| `DELETE` | `/api/v1/polls/{id}`         | Supprimer un sondage                | ✓    |
| `POST`   | `/api/v1/polls/{id}/launch`  | Lancer un brouillon                 | ✓    |
| `GET`    | `/api/v1/polls/{token}`      | Afficher un sondage via token       | —    |
| `POST`   | `/api/v1/polls/{token}/vote` | Voter                               | ✓    |

### Choix techniques

**Modèles**

Les modèles sont fournis par le projet de base et utilisés tels quels, avec les ajouts suivants :

- `Poll` — `$fillable`, `$casts` (booleans et dates castés automatiquement), `$appends` avec les accesseurs `has_started` et `has_ended` calculés à chaque requête. Relation `user`, `options`, `votes`.
- `PollOption` — `$fillable` avec `poll_id` et `label`. Relations `poll` et `votes`.
- `PollVote` — `$fillable` avec `poll_id`, `poll_option_id`, `user_id`. Relations `poll`, `user`, `option`.

**Timezone**

`APP_TIMEZONE=Europe/Zurich` dans `.env`. Laravel interprète et compare toutes les dates en heure de Zurich. Le frontend envoie les dates sans conversion UTC via `toIsoLocal()` (pas de `Z` final), ce qui évite un décalage de 2h.

**Statut calculé côté backend**

`has_started` et `has_ended` sont des accesseurs Eloquent inclus automatiquement dans chaque réponse JSON via `$appends`. Le frontend ne recalcule jamais le statut depuis les dates brutes — il fait confiance aux valeurs du backend, évitant toute divergence.

**Polling**

`usePolling` est utilisé uniquement sur la page de vote (`PollShow`), toutes les 5 secondes, pour rafraîchir les résultats en direct. Le dashboard ne fait pas de polling — les sondages de l'utilisateur ne changent que suite à ses propres actions, qui déclenchent elles-mêmes un rechargement via `fetchNow()`.

**Unicité du vote**

Pour les sondages à choix unique, le frontend envoie `option_id` (entier seul). L'API supprime les votes existants de l'utilisateur avant d'insérer le nouveau. Pour les sondages à choix multiples, le frontend envoie `option_ids` (tableau).
