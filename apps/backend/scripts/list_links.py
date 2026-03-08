import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from app.db.session import SessionLocal
from app.models.link import Link


def main() -> None:
    session = SessionLocal()

    try:
        links = session.query(Link).order_by(Link.source_note_id).all()

        for link in links:
            print(f"source_note_id={link.source_note_id}")
            print(f"target_note_path={link.target_note_path}")
            print(f"link_text={link.link_text}")
            print("-" * 40)

    finally:
        session.close()


if __name__ == "__main__":
    main()