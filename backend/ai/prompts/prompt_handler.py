import re
from functools import cache
from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate

PROMPT_PATH = Path("ai/prompts")

_SECTION_RE = re.compile(r"^#\s*(System|Human)\s*$", re.MULTILINE)


@cache
def get_prompt(prompt_name: str) -> ChatPromptTemplate:
    """Load a prompt file and build a ChatPromptTemplate from its '# System' and '# Human' sections.

    Raises:
        FileNotFoundError: if the prompt file doesn't exist.
        ValueError: if the file is malformed or a section is empty.
    """

    prompt_file = PROMPT_PATH / f"{prompt_name}.md"
    if not prompt_file.exists():
        raise FileNotFoundError(f"Prompt file '{prompt_name}' not found")

    raw_prompt = prompt_file.read_text(encoding="utf-8")

    matches = list(_SECTION_RE.finditer(raw_prompt))
    headers = [m.group(1) for m in matches]

    if "System" not in headers:
        raise ValueError(f"Prompt '{prompt_name}' is missing a '# System' section")
    if "Human" not in headers:
        raise ValueError(f"Prompt '{prompt_name}' is missing a '# Human' section")

    sections: dict[str, str] = {}
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw_prompt)
        sections[m.group(1)] = raw_prompt[start:end].strip()

    system_prompt = sections["System"]
    human_prompt = sections["Human"]

    if not system_prompt:
        raise ValueError(f"Prompt '{prompt_name}' has an empty '# System' section")
    if not human_prompt:
        raise ValueError(f"Prompt '{prompt_name}' has an empty '# Human' section")

    return ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt),
    ])
