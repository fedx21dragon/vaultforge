from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.search import router as search_router
from app.api.templates import router as template_router

app = FastAPI(
    title="VaultForge Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["app://obsidian.md", "http://127.0.0.1:8000", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(search_router)
app.include_router(template_router)