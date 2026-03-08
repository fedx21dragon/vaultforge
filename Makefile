.PHONY: help backend-run db-init index-sample list-notes docker-build docker-run docker-stop docker-logs

help:
	@echo "Available commands:"
	@echo "  make backend-run   - Run FastAPI backend locally"
	@echo "  make db-init       - Initialize SQLite database"
	@echo "  make index-sample  - Index the sample vault"
	@echo "  make list-notes    - List indexed notes from SQLite"
	@echo "  make docker-build  - Build backend Docker image"
	@echo "  make docker-run    - Run backend in Docker"
	@echo "  make docker-stop   - Stop Docker container"
	@echo "  make docker-logs   - Show Docker container logs"

backend-run:
	cd apps/backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

db-init:
	cd apps/backend && python -m app.db.init_db

index-sample:
	cd apps/backend && python scripts/index_sample_vault.py

list-notes:
	cd apps/backend && python scripts/list_notes.py

docker-build:
	docker build -t vaultforge-backend ./apps/backend
docker-db-init:
	docker run --rm \
		-v $(PWD)/apps/backend/data:/app/data \
		vaultforge-backend \
		python -m app.db.init_db

docker-index-sample:
	docker run --rm \
		-e VAULT_PATH=/workspace/examples/sample-vault \
		-v $(PWD)/apps/backend/data:/app/data \
		-v $(PWD)/examples/sample-vault:/workspace/examples/sample-vault \
		vaultforge-backend \
		python scripts/index_sample_vault.py

docker-list-notes:
	docker run --rm \
		-v $(PWD)/apps/backend/data:/app/data \
		vaultforge-backend \
		python scripts/list_notes.py
