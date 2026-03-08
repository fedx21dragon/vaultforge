from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.tag import Tag
from app.models.section import Section
from app.models.link import Link
from app.models.note_tag import NoteTag


def search_notes(session: Session, query: str) -> list[Note]:
    return (
        session.query(Note)
        .filter(
            (Note.title.ilike(f"%{query}%")) |
            (Note.path.ilike(f"%{query}%"))
        )
        .order_by(Note.path)
        .all()
    )


def search_tags(session: Session, query: str) -> list[Tag]:
    return (
        session.query(Tag)
        .filter(Tag.name.ilike(f"%{query}%"))
        .order_by(Tag.name)
        .all()
    )


def search_sections(session: Session, query: str) -> list[Section]:
    return (
        session.query(Section)
        .filter(
            (Section.heading_text.ilike(f"%{query}%")) |
            (Section.content.ilike(f"%{query}%"))
        )
        .order_by(Section.note_id, Section.section_order)
        .all()
    )


def search_links_by_note_path(session: Session, note_path: str) -> list[Link]:
    note = session.query(Note).filter_by(path=note_path).first()

    if note is None:
        return []

    return (
        session.query(Link)
        .filter(Link.source_note_id == note.id)
        .order_by(Link.target_note_path)
        .all()
    )