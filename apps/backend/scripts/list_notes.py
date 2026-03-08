import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from app.db.session import SessionLocal
from app.models.note import Note


def main() -> None:
    session = SessionLocal()

    try:
        notes = session.query(Note).order_by(Note.path).all()

        if not notes:
            print("No notes found.")
            return

        for note in notes:
            print(f"id={note.id}")
            print(f"path={note.path}")
            print(f"title={note.title}")
            print(f"updated_at={note.updated_at}")
            print(f"file_hash={note.file_hash}")
            print("-" * 40)

    finally:
        session.close()


if __name__ == "__main__":
    main()