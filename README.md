# Climbing

Application web de suivi d'escalade pour les adhérents et les administrateurs
d'une salle. Elle permet d'enregistrer ses séances sur un plan interactif, de
suivre sa progression et d'administrer les voies. Un module public de gestion de
compétitions est également présent.

> Le projet est aujourd'hui un prototype hérité de deux dépôts historiques. Il
> fonctionne comme une base de reprise, mais nécessite une passe de
> modernisation et de sécurisation avant une mise en production.

## Fonctionnalités

### Adhérent

- création de compte et authentification par jeton JWT ;
- tableau de bord : niveau maximal, nombre de séances, pratique en tête et
  couverture des différents profils du mur ;
- saisie d'une séance depuis le plan interactif de la salle ;
- historique mensuel dans un calendrier, palmarès et vue de progression.

### Administration

- consultation des utilisateurs ;
- création, modification et suppression de voies ;
- versionnement du plan de voies et choix explicite de la version active ;
- consultation des utilisateurs.

### Compétitions

- création de compétitions, zones, blocs et voies ;
- inscription des participants ;
- saisie des résultats bloc, difficulté et vitesse ;
- affichage des classements.

## Stack technique

| Couche | Technologies |
| --- | --- |
| Frontend | React 17, Create React App 4, React Router 5, Material UI 5 |
| Données UI | Axios, Chart.js, FullCalendar, i18next, react-img-mapper |
| API | FastAPI, Pydantic 2, SQLAlchemy |
| Authentification | OAuth2 password flow, JWT, bcrypt |
| Base de données | PostgreSQL 15 |
| Exécution | Docker Compose, Nginx, Uvicorn |

### Comparaison avec la T3 Stack

La [T3 Stack](https://create.t3.gg/en/introduction) privilégie une application
full-stack TypeScript autour de Next.js. TypeScript et Next.js en sont le cœur ;
tRPC, Tailwind CSS, Auth.js et Prisma ou Drizzle peuvent être ajoutés selon le
besoin.

Pour ce projet, une réécriture complète en T3 n'est pas prioritaire. FastAPI est
bien adapté à la logique métier et aux futurs traitements de données, tandis
que PostgreSQL reste un choix solide. Les bénéfices les plus utiles de T3
peuvent être obtenus progressivement :

- migrer React vers TypeScript et remplacer Create React App par Vite ou
  Next.js ;
- générer le client TypeScript depuis le schéma OpenAPI de FastAPI afin de
  retrouver des contrats typés de bout en bout, proches de l'expérience tRPC ;
- conserver Material UI, déjà cohérent dans l'application, plutôt que cumuler
  une migration fonctionnelle avec un remplacement par Tailwind.

Une T3 Stack neuve serait pertinente si l'équipe voulait un seul langage sur
toute la plateforme, du rendu serveur Next.js ou un déploiement full-stack
TypeScript. Pour faire évoluer cette base sans interrompre le produit, la
modernisation incrémentale offre un meilleur rapport coût/bénéfice.

```text
Navigateur
   │
   ├── :3000 ── Nginx ── React
   │                         │ HTTP/JSON + JWT
   └── :8000 ─────────── FastAPI ── SQLAlchemy ── PostgreSQL
```

## Organisation du dépôt

```text
.
├── apps/
│   ├── backend/
│   │   ├── api/
│   │   │   ├── main.py       # routes FastAPI
│   │   │   ├── crud.py       # accès aux données et logique métier
│   │   │   ├── models.py     # modèles SQLAlchemy
│   │   │   ├── schemas.py    # schémas Pydantic
│   │   │   └── populate.py   # données de démonstration
│   │   └── Dockerfile
│   └── frontend/
│       ├── public/
│       ├── src/components/   # écrans et composants React
│       └── Dockerfile
├── compose.yaml
├── Makefile
└── .env.example
```

Les historiques Git des anciens dépôts `gdo-api` et `gdo-front` sont conservés
dans ce monorepo.

## Démarrage avec Docker

### Prérequis

- Docker avec le plugin Compose ;
- ports `3000` et `8000` disponibles.

### Installation

```sh
cp .env.example .env
docker compose up --build
```

Services exposés :

- application : <http://localhost:3000> ;
- API : <http://localhost:8000> ;
- documentation OpenAPI : <http://localhost:8000/docs>.

La base est créée automatiquement, mais elle est vide. Pour charger les données
de démonstration dans un nouvel environnement :

```sh
docker compose exec backend python -m api.populate
```

Le script crée notamment un compte administrateur de développement
`admin@gmail.com` / `change-me` et un jeu de voies. Il est
idempotent, mais ces identifiants ne doivent jamais être utilisés en production.

Pour arrêter les services :

```sh
docker compose down
```

Les données PostgreSQL restent dans le volume Docker `postgres-data`.

## Développement local

Prérequis : Python 3, Node.js 22, pnpm 12 et Docker. Corepack peut installer la
version déclarée par le projet : `corepack enable`.

```sh
cp .env.example .env
make install
make db
```

Le frontend utilise exclusivement `pnpm-lock.yaml`. Le Dockerfile conserve le
store de pnpm dans un cache BuildKit : les reconstructions qui ne changent pas
le lockfile réutilisent les paquets déjà téléchargés.

Lancez ensuite l'API et le frontend dans deux terminaux :

```sh
make dev-backend
```

```sh
make dev-frontend
```

Pour initialiser une base locale vide :

```sh
API_DB=postgresql://postgres:password@localhost:5432/postgres \
  PYTHONPATH=apps/backend .venv/bin/python -m api.populate
```

### Migrations

Le schéma SQL est versionné avec Alembic dans `apps/backend/migrations/`. Les
migrations en attente sont appliquées automatiquement au démarrage du backend
(et via `python -m api.populate`) ; une base créée avant l'introduction
d'Alembic est mise à niveau puis marquée à la révision initiale lors du premier
démarrage.

Pour faire évoluer le schéma, modifiez `apps/backend/api/models.py` puis
générez une révision :

```sh
make db                                  # PostgreSQL doit tourner
make migration MSG="ajout table topos"   # génère un fichier dans migrations/versions/
```

Relisez et ajustez le fichier généré (les migrations automatiques ne détectent
pas tout : renommages, conversions de données, suppression de colonnes), puis
appliquez-la et vérifiez le résultat :

```sh
make migrate
```

## Configuration

| Variable | Valeur locale par défaut | Description |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | `password` | mot de passe PostgreSQL utilisé par Compose |
| `VITE_API_BASE_URL` | `http://localhost:8000` | URL de l'API injectée lors du build du frontend |
| `API_DB` | définie par Compose | URL SQLAlchemy de connexion à PostgreSQL |
| `JWT_SECRET_KEY` | valeur locale non sûre | clé de signature des jetons JWT |
| `CORS_ORIGINS` | `http://localhost:3000` | origines autorisées, séparées par des virgules |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` | durée de validité d'un jeton |
| `DEMO_ADMIN_EMAIL` | `admin@gmail.com` | adresse du compte créé par le peuplement local |
| `DEMO_ADMIN_PASSWORD` | `change-me` | mot de passe du compte de démonstration |

Les valeurs de `.env.example` sont destinées au développement. Utilisez des
secrets distincts en production.

## Commandes utiles

| Commande | Effet |
| --- | --- |
| `make install` | installe les dépendances backend et frontend |
| `make db` | démarre uniquement PostgreSQL |
| `make migrate` | applique les migrations Alembic en attente |
| `make migration MSG="..."` | génère une migration depuis les modèles SQLAlchemy |
| `make dev-backend` | démarre FastAPI avec rechargement automatique |
| `make dev-frontend` | démarre le serveur de développement React |
| `make build` | produit le build statique du frontend |
| `make test` | lance les tests backend et frontend |
| `make up` | construit et démarre tous les services |
| `make down` | arrête les services |

## API

L'API est décrite de façon interactive par Swagger sur `/docs`. Les groupes de
routes principaux sont :

- `/signup`, `/token`, `/me/` pour les comptes et l'authentification ;
- `/dashboard`, `/progression`, `/userseance*`, `/palmares` pour le suivi personnel ;
- `/voies`, `/voie`, `/versionvoie`, `/colors` pour le mur et ses voies ;
- `/userseance` et `/userseance_days` pour la saisie et l'historique des séances ;
- `/contest*` pour les compétitions et classements.

Les routes privées attendent l'en-tête suivant :

```http
Authorization: Bearer <token>
```

## Qualité et limites connues

- les dépendances frontend sont anciennes et contiennent encore plusieurs
  bibliothèques héritées ;
- la couverture de tests reste limitée aux parcours critiques récents ;
- plusieurs règles métier et coordonnées du mur sont codées directement dans
  les composants ;
- les jetons sont encore stockés dans `localStorage` et le module public de
  compétition nécessite une revue d'autorisations avant exposition publique.

## Priorités proposées

1. Ajouter une suite de tests métier/API et des parcours end-to-end critiques.
2. Migrer progressivement le frontend vers TypeScript et découper les gros
   composants.
3. Auditer et retirer progressivement les dépendances frontend héritées.
4. Migrer l'authentification vers des cookies sécurisés avec rotation des jetons.

### Roadmap produit et interface

- ajouter un onboarding expliquant le plan du mur et la saisie d'une tentative ;
- permettre de modifier son profil et son mot de passe ;
- offrir des filtres par cotation, couleur et secteur ainsi qu'un export de
  l'historique ;
- adapter le plan interactif aux petits écrans avec zoom et légende persistante ;
- terminer l'audit d'accessibilité au clavier et du contraste sur les écrans
  historiques et compétition.
