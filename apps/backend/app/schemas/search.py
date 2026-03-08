from pydantic import BaseModel


class NoteSearchResult(BaseModel):
    id: int
    path: str
    title: str


class TagSearchResult(BaseModel):
    id: int
    name: str


class SectionSearchResult(BaseModel):
    id: int
    note_id: int
    heading_text: str
    content: str


class LinkSearchResult(BaseModel):
    id: int
    source_note_id: int
    target_note_path: str
    link_text: str