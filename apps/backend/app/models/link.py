from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Link(Base):
    __tablename__ = "links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), nullable=False, index=True)
    target_note_path: Mapped[str] = mapped_column(String, nullable=False, index=True)
    link_text: Mapped[str] = mapped_column(String, nullable=False)