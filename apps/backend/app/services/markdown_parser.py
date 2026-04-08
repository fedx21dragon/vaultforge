import re
from pathlib import Path
from typing import Any


WIKILINK_PATTERN = re.compile(r"\[\[([^\]]+)\]\]")
HEADING_PATTERN = re.compile(r"^(#{2,6})\s+(.+)$")


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    """
    Parse simple YAML-like frontmatter at the top of a markdown file.
    Returns (frontmatter_dict, remaining_body).
    """
    lines = text.splitlines()

    if not lines or lines[0].strip() != "---":
        return {}, text

    end_index = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_index = i
            break

    if end_index is None:
        return {}, text

    frontmatter_lines = lines[1:end_index]
    body_lines = lines[end_index + 1 :]

    frontmatter: dict[str, Any] = {}

    for line in frontmatter_lines:
        line = line.strip()
        if not line or ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()

        if value.startswith("[") and value.endswith("]"):
            items = value[1:-1].split(",")
            frontmatter[key] = [item.strip() for item in items if item.strip()]
        else:
            frontmatter[key] = value

    return frontmatter, "\n".join(body_lines)


def extract_wikilinks(text: str) -> list[str]:
    return WIKILINK_PATTERN.findall(text)


def parse_sections(body: str) -> tuple[str | None, list[dict[str, Any]]]:
    lines = body.splitlines()

    title: str | None = None
    sections: list[dict[str, Any]] = []

    current_section: dict[str, Any] | None = None
    buffer: list[str] = []

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("# ") and not stripped.startswith("## "):
            title = stripped.removeprefix("# ").strip()
            continue

        heading_match = HEADING_PATTERN.match(stripped)
        if heading_match:
            if current_section is not None:
                current_section["content"] = "\n".join(buffer).strip()
                sections.append(current_section)

            level = len(heading_match.group(1))
            current_section = {
                "heading": heading_match.group(2).strip(),
                "level": level,
            }
            buffer = []
            continue

        if current_section is not None:
            buffer.append(line)

    if current_section is not None:
        current_section["content"] = "\n".join(buffer).strip()
        sections.append(current_section)

    return title, sections


def parse_markdown(file_path: Path) -> dict[str, Any]:
    text = file_path.read_text(encoding="utf-8")

    frontmatter, body = parse_frontmatter(text)
    title, sections = parse_sections(body)
    wikilinks = extract_wikilinks(body)

    tags = frontmatter.get("tags", [])
    if not isinstance(tags, list):
        tags = []

    return {
        "path": str(file_path),
        "title": title,
        "frontmatter": frontmatter,
        "tags": tags,
        "wikilinks": wikilinks,
        "sections": sections,
        "raw_content": body,
    }
