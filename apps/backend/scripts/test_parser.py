import sys
from pathlib import Path
from pprint import pprint

# Ensure backend root is on PYTHONPATH
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from app.services.markdown_parser import parse_markdown


def main() -> None:
    repo_root = BACKEND_ROOT.parents[1]
    sample_vault = repo_root/"apps"/"backend"/"examples"/"sample-vault"

    files = [
        sample_vault / "Control Systems.md",
        sample_vault / "Fourier Transform.md",
        sample_vault / "Meeting Notes" / "Lab Sync.md",
    ]

    for file_path in files:
        print(f"\n--- Parsing: {file_path.name} ---")
        parsed = parse_markdown(file_path)
        pprint(parsed)


if __name__ == "__main__":
    main()