from collections import Counter
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.link import Link
from app.models.note import Note
from app.models.note_tag import NoteTag
from app.models.section import Section
from app.models.tag import Tag
from app.services.markdown_parser import parse_markdown


# ---------------------------------------------------------------------------
# Built-in fallback templates
# ---------------------------------------------------------------------------

_DEFAULTS: dict[str, dict] = {
    "meeting": {
        "frontmatter": {"status": "active"},
        "headings": ["Topics", "Action Items", "Decisions", "References"],
    },
    "research": {
        "frontmatter": {"status": "draft"},
        "headings": ["Definition", "Background", "Key Concepts", "References"],
    },
    "general": {
        "frontmatter": {"status": "draft"},
        "headings": ["Overview", "Notes", "References"],
    },
}


def _render_template(
    title: str,
    note_type: str,
    extra_tags: list[str],
    headings: list[str],
    extra_frontmatter: dict[str, str],
) -> str:
    all_tags = sorted({note_type, *extra_tags})
    tag_str = "[" + ", ".join(all_tags) + "]"

    lines: list[str] = ["---", f"tags: {tag_str}"]
    for key, value in extra_frontmatter.items():
        lines.append(f"{key}: {value}")
    lines += ["---", "", f"# {title}", ""]

    for heading in headings:
        lines += [f"## {heading}", "", ""]

    return "\n".join(lines)


def _most_common_headings(heading_counts: Counter, min_occurrences: int = 1, top_n: int = 6) -> list[str]:
    return [h for h, count in heading_counts.most_common(top_n) if count >= min_occurrences]


def generate_template(
    db: Session,
    note_type: str,
    title: str,
    extra_tags: list[str],
) -> tuple[str, str]:
    """
    Build a markdown template for the given note_type.

    Returns (rendered_template, source) where source is 'vault' or 'default'.
    """
    note_type_lower = note_type.lower()

    # 1. Find notes in the DB whose tags include the note_type
    matching_note_ids = _find_note_ids_by_tag(db, note_type_lower)

    if matching_note_ids:
        headings, extra_fm = _extract_patterns(db, matching_note_ids)
        source = "vault"
    else:
        fallback = _DEFAULTS.get(note_type_lower, _DEFAULTS["general"])
        headings = fallback["headings"]
        extra_fm = fallback["frontmatter"]
        source = "default"

    content = _render_template(title, note_type_lower, extra_tags, headings, extra_fm)
    return content, source


def _find_note_ids_by_tag(db: Session, tag_name: str) -> list[int]:
    tag = db.query(Tag).filter(Tag.name.ilike(tag_name)).first()
    if tag is None:
        return []
    rows = db.query(NoteTag.note_id).filter(NoteTag.tag_id == tag.id).all()
    return [r.note_id for r in rows]


def _extract_patterns(
    db: Session,
    note_ids: list[int],
) -> tuple[list[str], dict[str, str]]:
    """
    From a set of note IDs gather:
    - most common H2 section headings
    - common non-tags frontmatter keys (by re-reading files from vault)
    Returns (headings, extra_frontmatter_keys_with_empty_values).
    """
    # Gather section headings from DB (H2 only for the template skeleton)
    heading_counts: Counter = Counter()
    sections = (
        db.query(Section)
        .filter(Section.note_id.in_(note_ids), Section.heading_level == 2)
        .all()
    )
    for s in sections:
        heading_counts[s.heading_text] += 1

    headings = _most_common_headings(heading_counts, min_occurrences=1)

    # Gather extra frontmatter fields by re-reading the source files
    fm_key_counts: Counter = Counter()
    vault_root: Path = settings.vault_path
    notes = db.query(Note).filter(Note.id.in_(note_ids)).all()

    for note in notes:
        note_file = vault_root / note.path
        if not note_file.exists():
            continue
        try:
            parsed = parse_markdown(note_file)
        except Exception:
            continue
        for key in parsed["frontmatter"]:
            if key != "tags":
                fm_key_counts[key] += 1

    extra_fm = {key: "" for key, _ in fm_key_counts.most_common(4)}

    if not headings:
        headings = _DEFAULTS["general"]["headings"]

    return headings, extra_fm
