import hashlib
from pathlib import Path
from datetime import datetime

from app.db.session import SessionLocal
from app.models.note import Note
from app.models.section import Section
from app.models.tag import Tag
from app.models.note_tag import NoteTag
from app.models.link import Link
from app.services.markdown_parser import parse_markdown


# hashing for change detection
def compute_file_hash(file_path: Path) -> str:
    content = file_path.read_bytes()
    return hashlib.sha256(content).hexdigest()

# upsert note based on file path, creating or updating as needed
def upsert_note(file_path: Path, vault_root: Path) -> str:
    """Index a single note. Returns 'created', 'updated', or 'skipped'."""
    file_hash = compute_file_hash(file_path)
    relative_path = file_path.relative_to(vault_root)

    session = SessionLocal()

    try:
        existing_note = session.query(Note).filter_by(path=str(relative_path)).first()

        if existing_note is not None and existing_note.file_hash == file_hash:
            return "skipped"

        parsed = parse_markdown(file_path)
        stat = file_path.stat()
        created_at = datetime.fromtimestamp(stat.st_ctime)
        updated_at = datetime.fromtimestamp(stat.st_mtime)

        if existing_note is None:
            note = Note(
                path=str(relative_path),
                title=parsed["title"] or file_path.stem,
                created_at=created_at,
                updated_at=updated_at,
                file_hash=file_hash,
            )
            session.add(note)
            session.flush()
            action = "created"
        else:
            note = existing_note
            note.title = parsed["title"] or file_path.stem
            note.updated_at = updated_at
            note.file_hash = file_hash

            clear_note_dependencies(session, note.id)
            action = "updated"

        for idx, section in enumerate(parsed["sections"]):
            db_section = Section(
                note_id=note.id,
                heading_level=section["level"],
                heading_text=section["heading"],
                section_order=idx,
                content=section["content"],
            )
            session.add(db_section)

        for tag_name in parsed["tags"]:
            tag = get_or_create_tag(session, tag_name)

            note_tag = NoteTag(
                note_id=note.id,
                tag_id=tag.id,
            )
            session.add(note_tag)

        for wikilink in parsed["wikilinks"]:
            link = Link(
                source_note_id=note.id,
                target_note_path=wikilink,
                link_text=wikilink,
            )
            session.add(link)

        session.commit()
        return action

    finally:
        session.close()

# index vault
def index_vault(vault_root: Path) -> None:
    markdown_files = list(vault_root.rglob("*.md"))

    for file_path in markdown_files:
        action = upsert_note(file_path, vault_root)
        print(f"[{action}] {file_path.relative_to(vault_root)}")

# helper to get or create tags by name
def get_or_create_tag(session, tag_name: str) -> Tag:
    existing_tag = session.query(Tag).filter_by(name=tag_name).first()

    if existing_tag is not None:
        return existing_tag

    tag = Tag(name=tag_name)
    session.add(tag)
    session.flush()
    return tag

def clear_note_dependencies(session, note_id: int) -> None:
    session.query(Section).filter_by(note_id=note_id).delete()
    session.query(NoteTag).filter_by(note_id=note_id).delete()
    session.query(Link).filter_by(source_note_id=note_id).delete()