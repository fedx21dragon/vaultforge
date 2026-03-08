import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from app.db.session import SessionLocal
from app.models.section import Section


def main() -> None:
    session = SessionLocal()

    try:
        sections = session.query(Section).order_by(Section.note_id, Section.section_order).all()

        for section in sections:
            print(f"note_id={section.note_id}")
            print(f"heading={section.heading_text}")
            print(f"level={section.heading_level}")
            print(f"order={section.section_order}")
            print(f"content={section.content}")
            print("-" * 40)

    finally:
        session.close()


if __name__ == "__main__":
    main()