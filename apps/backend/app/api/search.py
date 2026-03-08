from fastapi import APIRouter, Query

from app.db.session import SessionLocal
from app.schemas.search import (
    LinkSearchResult,
    NoteSearchResult,
    SectionSearchResult,
    TagSearchResult,
)
from app.services.search_service import (
    search_links_by_note_path,
    search_notes,
    search_sections,
    search_tags,
)

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/notes", response_model=list[NoteSearchResult])
def search_notes_endpoint(q: str = Query(..., min_length=1)) -> list[NoteSearchResult]:
    session = SessionLocal()
    try:
        results = search_notes(session, q)
        return [
            NoteSearchResult(id=n.id, path=n.path, title=n.title)
            for n in results
        ]
    finally:
        session.close()


@router.get("/tags", response_model=list[TagSearchResult])
def search_tags_endpoint(q: str = Query(..., min_length=1)) -> list[TagSearchResult]:
    session = SessionLocal()
    try:
        results = search_tags(session, q)
        return [
            TagSearchResult(id=t.id, name=t.name)
            for t in results
        ]
    finally:
        session.close()


@router.get("/sections", response_model=list[SectionSearchResult])
def search_sections_endpoint(q: str = Query(..., min_length=1)) -> list[SectionSearchResult]:
    session = SessionLocal()
    try:
        results = search_sections(session, q)
        return [
            SectionSearchResult(
                id=s.id,
                note_id=s.note_id,
                heading_text=s.heading_text,
                content=s.content,
            )
            for s in results
        ]
    finally:
        session.close()


@router.get("/links", response_model=list[LinkSearchResult])
def search_links_endpoint(note_path: str = Query(..., min_length=1)) -> list[LinkSearchResult]:
    session = SessionLocal()
    try:
        results = search_links_by_note_path(session, note_path)
        return [
            LinkSearchResult(
                id=l.id,
                source_note_id=l.source_note_id,
                target_note_path=l.target_note_path,
                link_text=l.link_text,
            )
            for l in results
        ]
    finally:
        session.close()