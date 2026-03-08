from pydantic import BaseModel, Field


class TemplateFromVaultRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    max_notes: int = Field(default=5, ge=1, le=20)


class TemplateFromVaultResponse(BaseModel):
    title: str
    content: str
    source_notes: list[str]