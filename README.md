# VaultForge

Local-first AI assistant for Obsidian.

## Planned Features

- sentence completion
- template generation
- vault search with RAG
- formula extraction from PDFs and images

## Architecture

- Obsidian plugin (TypeScript)
- local backend (Python + FastAPI)
- SQLite metadata/index database
- vector search for retrieval
- local LLM runtime

## Status

Work in progress.

## Roadmap

- [x] bootstrap repository
- [x] backend skeleton
- [x] database foundation
- [ ] sample vault + parser
- [ ] indexer
- [ ] obsidian plugin skeleton
- [ ] template generation
- [ ] retrieval
- [ ] formula extraction

## System Architecture

```mermaid
flowchart LR

    A[Obsidian Vault\Markdown Notes] --> B[Vault Parser]
    B --> C[Indexer]

    C --> D[(SQLite Metadata DB)]
    C --> E[(Vector Index)]

    F[Obsidian Plugin] --> G[FastAPI Backend]

    G --> H[Service Layer]

    H --> D
    H --> E

    H --> I[Local LLM Runtime]

    I --> G
    G --> F
```
