.PHONY: help docker-build docker-up docker-down docker-logs docker-db-init docker-index-vault docker-list-notes

help:
	@echo "Available commands:"
	@echo "  make docker-build       - Build backend container"
	@echo "  make docker-up          - Start backend via docker compose"
	@echo "  make docker-down        - Stop backend containers"
	@echo "  make docker-logs        - Show backend logs"
	@echo "  make docker-db-init     - Initialize SQLite database"
	@echo "  make docker-index-vault - Index configured vault"
	@echo "  make docker-list-notes  - List indexed notes"

docker-build:
	docker compose build

docker-up:
	docker compose up --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-db-init:
	docker compose run --rm backend python -m app.db.init_db

docker-index-vault:
	docker compose run --rm backend python scripts/index_vault.py

docker-list-notes:
	docker compose run --rm backend python scripts/list_notes.py