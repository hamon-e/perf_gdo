# Climbing

Monorepo de l'application web de suivi des séances d'escalade.

## Structure

```text
apps/
├── backend/    API FastAPI et accès PostgreSQL
└── frontend/   application React
```

Les historiques Git des anciens dépôts `gdo-api` et `gdo-front` sont conservés
dans ce dépôt.

## Démarrage avec Docker

```sh
cp .env.example .env
docker compose up --build
```

Le frontend est alors disponible sur <http://localhost:3000> et l'API sur
<http://localhost:8000>. La documentation OpenAPI est exposée sur
<http://localhost:8000/docs>.

## Développement local

Prérequis : Python 3, Node.js, Yarn et Docker.

```sh
make install
make db
```

Puis, dans deux terminaux :

```sh
make dev-backend
make dev-frontend
```

Les principales commandes disponibles à la racine sont :

- `make build` : construit le frontend ;
- `make test` : vérifie le backend et lance les tests du frontend ;
- `make up` / `make down` : démarre ou arrête l'ensemble avec Docker Compose.

