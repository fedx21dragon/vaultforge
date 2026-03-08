import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from app.db.session import SessionLocal
from app.models.tag import Tag
from app.models.note_tag import NoteTag


def main() -> None:
    session = SessionLocal()

    try:
        tags = session.query(Tag).order_by(Tag.name).all()
        note_tags = session.query(NoteTag).order_by(NoteTag.note_id).all()

        print("Tags:")
        for tag in tags:
            print(f"id={tag.id}, name={tag.name}")

        print("\nNote-Tag Links:")
        for nt in note_tags:
            print(f"note_id={nt.note_id}, tag_id={nt.tag_id}")

    finally:
        session.close()


if __name__ == "__main__":
    main()