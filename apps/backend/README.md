# VaultForge Backend

Local FastAPI backend for VaultForge.

## Responsibilities

- expose local API endpoints
- manage vault indexing
- handle retrieval and search
- process templates
- support OCR and formula extraction later

## API Architecture

```mermaid
flowchart TD

    A[Obsidian Plugin] --> B[FastAPI Backend]

    B --> C[/GET /health/]
    B --> D[/POST /template/generate/]
    B --> E[/POST /complete/]
    B --> F[/POST /search/]
    B --> G[/POST /formula/extract/]

    B --> H[Service Layer]

    H --> I[Vault Parser]
    H --> J[Retrieval Engine]
    H --> K[Template Service]
    H --> L[Formula Extraction]

    I --> M[(SQLite Index DB)]
    J --> M

    H --> N[Local LLM Runtime]
```
