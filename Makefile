PYTHON ?= python3
VENV ?= .venv
FRONTEND := apps/frontend
BACKEND := apps/backend
MSG ?= migration

.PHONY: install install-backend install-backend-dev install-frontend db migrate migration dev-backend dev-frontend build test up down

install: install-backend install-frontend

install-backend: $(VENV)/bin/uvicorn

install-backend-dev: $(VENV)/bin/pytest

$(VENV)/bin/uvicorn: $(BACKEND)/api/requirements.txt
	$(PYTHON) -m venv $(VENV)
	$(VENV)/bin/pip install -r $<
	@touch $@

$(VENV)/bin/pytest: $(BACKEND)/requirements-dev.txt $(BACKEND)/api/requirements.txt | $(VENV)/bin/uvicorn
	$(VENV)/bin/pip install -r $(BACKEND)/requirements-dev.txt
	@touch $@

install-frontend:
	pnpm --dir $(FRONTEND) install --frozen-lockfile

db:
	docker compose up -d database

# Apply pending migrations (runs automatically at backend startup too).
migrate:
	API_DB="$${API_DB:-postgresql://postgres:password@localhost:5432/postgres}" \
		$(VENV)/bin/alembic -c $(BACKEND)/alembic.ini upgrade head

# Generate a migration from the current models: make migration MSG="add foo"
migration:
	API_DB="$${API_DB:-postgresql://postgres:password@localhost:5432/postgres}" \
		$(VENV)/bin/alembic -c $(BACKEND)/alembic.ini revision --autogenerate -m "$(MSG)"

dev-backend: install-backend
	API_DB="$${API_DB:-postgresql://postgres:password@localhost:5432/postgres}" \
		$(VENV)/bin/uvicorn api.main:app --app-dir $(BACKEND) --reload --port 8000

dev-frontend:
	REACT_APP_API_BASE_URL="$${REACT_APP_API_BASE_URL:-http://localhost:8000}" \
		pnpm --dir $(FRONTEND) start

build:
	NODE_OPTIONS="$${NODE_OPTIONS:---openssl-legacy-provider}" \
		REACT_APP_API_BASE_URL="$${REACT_APP_API_BASE_URL:-http://localhost:8000}" \
		pnpm --dir $(FRONTEND) build

test: install-backend-dev
	API_DB="sqlite:///:memory:" PYTHONPATH=$(BACKEND) $(VENV)/bin/pytest -q $(BACKEND)/tests
	CI=true NODE_OPTIONS="$${NODE_OPTIONS:---openssl-legacy-provider}" \
		pnpm --dir $(FRONTEND) test --watchAll=false

up:
	docker compose up --build

down:
	docker compose down
