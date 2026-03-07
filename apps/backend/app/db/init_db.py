from app.db.base import Base
from app.db.session import engine

# Wichtig: Modell importieren, damit SQLAlchemy die Tabelle kennt
from app.models.note import Note  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized.")