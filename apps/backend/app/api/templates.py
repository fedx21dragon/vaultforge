from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.template import TemplateRequest, TemplateResponse
from app.services.template_service import generate_template

router = APIRouter(prefix="/templates", tags=["templates"])


@router.post("/generate", response_model=TemplateResponse)
def generate_template_endpoint(
    request: TemplateRequest,
    db: Session = Depends(get_db),
) -> TemplateResponse:
    content, source = generate_template(
        db=db,
        note_type=request.note_type,
        title=request.title,
        extra_tags=request.extra_tags,
    )
    return TemplateResponse(
        note_type=request.note_type,
        title=request.title,
        content=content,
        source=source,
    )
