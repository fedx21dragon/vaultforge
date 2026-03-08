import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from app.services.indexer import index_vault


def main() -> None:
    vault_path = os.getenv("VAULT_PATH")

    if vault_path:
        sample_vault = Path(vault_path)
    else:
        repo_root = BACKEND_ROOT.parents[1]
        sample_vault = repo_root / "examples" / "sample-vault"

    print(f"Indexing vault: {sample_vault}")
    index_vault(sample_vault)
    print("Indexing complete.")


if __name__ == "__main__":
    main()