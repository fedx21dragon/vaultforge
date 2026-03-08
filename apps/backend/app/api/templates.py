from fastapi import APIRouter

from app.db.session import SessionLocal
from app.schemas.template import (
    TemplateFromVaultRequest,
    TemplateFromVaultResponse,
)
from app.services.template_service import (
    find_relevant_notes,
    find_sections_for_notes,
    generate_template_from_notes,
)

router = APIRouter(prefix="/template", tags=["template"])


@router.post("/from-vault", response_model=TemplateFromVaultResponse)
def create_template_from_vault(
    payload: TemplateFromVaultRequest,
) -> TemplateFromVaultResponse:
    session = SessionLocal()

    try:
        notes = find_relevant_notes(session, payload.topic, payload.max_notes)
        sections = find_sections_for_notes(session, [note.id for note in notes])

        content, source_notes = generate_template_from_notes(
            payload.topic,
            notes,
            sections,
        )

        return TemplateFromVaultResponse(
            title=f"{payload.topic} Template",
            content=content,
            source_notes=source_notes,
        )
    finally:
        session.close()