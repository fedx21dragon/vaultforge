from app.db.base import Base
from app.db.session import engine

# Wichtig: Modell importieren, damit SQLAlchemy die Tabelle kennt
from app.models.note import Note  
from app.models.section import Section  
from app.models.tag import Tag  
from app.models.note_tag import NoteTag  
from app.models.link import Link  


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized.")