from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.section import Section


def find_relevant_notes(session: Session, topic: str, max_notes: int = 5) -> list[Note]:
    return (
        session.query(Note)
        .filter(
            (Note.title.ilike(f"%{topic}%")) |
            (Note.path.ilike(f"%{topic}%"))
        )
        .order_by(Note.path)
        .limit(max_notes)
        .all()
    )


def find_sections_for_notes(session: Session, note_ids: list[int]) -> list[Section]:
    if not note_ids:
        return []

    return (
        session.query(Section)
        .filter(Section.note_id.in_(note_ids))
        .order_by(Section.note_id, Section.section_order)
        .all()
    )


def generate_template_from_notes(topic: str, notes: list[Note], sections: list[Section]) -> tuple[str, list[str]]:
    headings: list[str] = []
    for section in sections:
        if section.heading_text not in headings:
            headings.append(section.heading_text)

    if not headings:
        headings = [
            "Overview",
            "Definitions",
            "Key Concepts",
            "Examples",
            "Open Questions",
        ]

    title = f"{topic} Template"

    lines: list[str] = [
        "---",
        f'tags: [{topic.lower().replace(" ", "-")}]',
        "type: generated-template",
        "---",
        "",
        f"# {topic}",
        "",
        "## Goal",
        "-",
        "",
    ]

    for heading in headings:
        lines.append(f"## {heading}")
        lines.append("-")
        lines.append("")

    lines.extend([
        "## Related Notes",
        *[f"- [[{note.title}]]" for note in notes],
        "",
    ])

    return "\n".join(lines), [note.path for note in notes]