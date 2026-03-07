import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))
from datetime import datetime

from app.db.session import SessionLocal
from app.models.note import Note


def main() -> None:
    session = SessionLocal()

    try:
        note = Note(
            path="Control Systems.md",
            title="Control Systems",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            file_hash="dummyhash123",
        )

        session.add(note)
        session.commit()

        saved_note = session.query(Note).filter_by(path="Control Systems.md").first()

        if saved_note is None:
            print("Note not found.")
            return

        print("Saved note:")
        print(f"id={saved_note.id}")
        print(f"path={saved_note.path}")
        print(f"title={saved_note.title}")
        print(f"file_hash={saved_note.file_hash}")

    finally:
        session.close()


if __name__ == "__main__":
    main()