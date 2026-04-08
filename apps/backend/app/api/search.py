from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
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
def search_notes_endpoint(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> list[NoteSearchResult]:
    results = search_notes(db, q)
    return [NoteSearchResult(id=n.id, path=n.path, title=n.title) for n in results]


@router.get("/tags", response_model=list[TagSearchResult])
def search_tags_endpoint(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> list[TagSearchResult]:
    results = search_tags(db, q)
    return [TagSearchResult(id=t.id, name=t.name) for t in results]


@router.get("/sections", response_model=list[SectionSearchResult])
def search_sections_endpoint(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> list[SectionSearchResult]:
    results = search_sections(db, q)
    return [
        SectionSearchResult(
            id=s.id,
            note_id=s.note_id,
            heading_text=s.heading_text,
            content=s.content,
        )
        for s in results
    ]


@router.get("/links", response_model=list[LinkSearchResult])
def search_links_endpoint(
    note_path: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> list[LinkSearchResult]:
    results = search_links_by_note_path(db, note_path)
    return [
        LinkSearchResult(
            id=lnk.id,
            source_note_id=lnk.source_note_id,
            target_note_path=lnk.target_note_path,
            link_text=lnk.link_text,
        )
        for lnk in results
    ]