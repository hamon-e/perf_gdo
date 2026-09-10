PYTHON ?= python3
VENV ?= .venv
FRONTEND := apps/frontend
BACKEND := apps/backend

.PHONY: install install-backend install-frontend db dev-backend dev-frontend build test up down

install: install-backend install-frontend

install-backend: $(VENV)/bin/uvicorn

$(VENV)/bin/uvicorn: $(BACKEND)/api/requirements.txt
	$(PYTHON) -m venv $(VENV)
	$(VENV)/bin/pip install -r $<
	@touch $@

install-frontend:
	yarn --cwd $(FRONTEND) install

db:
	docker compose up -d database

dev-backend: install-backend
	API_DB="$${API_DB:-postgresql://postgres:password@localhost:5432/postgres}" \
		$(VENV)/bin/uvicorn api.main:app --app-dir $(BACKEND) --reload --port 8000

dev-frontend:
	REACT_APP_API_BASE_URL="$${REACT_APP_API_BASE_URL:-http://localhost:8000}" \
		yarn --cwd $(FRONTEND) start

build:
	REACT_APP_API_BASE_URL="$${REACT_APP_API_BASE_URL:-http://localhost:8000}" \
		yarn --cwd $(FRONTEND) build

test:
	$(PYTHON) -m compileall -q $(BACKEND)/api
	CI=true yarn --cwd $(FRONTEND) test --watchAll=false

up:
	docker compose up --build

down:
	docker compose down

