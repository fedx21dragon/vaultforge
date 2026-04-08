from pydantic import BaseModel, Field


class TemplateRequest(BaseModel):
    note_type: str = Field(
        default="general",
        description="Type of note to generate a template for (e.g. 'meeting', 'research', 'general').",
    )
    title: str = Field(
        default="Untitled",
        description="Title to embed in the template.",
    )
    extra_tags: list[str] = Field(
        default_factory=list,
        description="Additional tags to include in frontmatter.",
    )


class TemplateResponse(BaseModel):
    note_type: str
    title: str
    content: str
    source: str = Field(
        description="'vault' if derived from existing notes, 'default' if using built-in template."
    )
