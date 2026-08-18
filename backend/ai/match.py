from typing import Any

from ai.prompts.prompt_handler import get_prompt
from ai.providers.ollama import llm
from schemas.match import MatchAnalysis


def analyze_match(resume: dict[str, Any], job_description: str) -> MatchAnalysis:
    prompt = get_prompt("match")
    structured_llm = llm.with_structured_output(MatchAnalysis)

    chain = prompt | structured_llm
    result = chain.invoke(
        {
            "resume": resume,
            "job_description": job_description,
        }
    )
    return MatchAnalysis.model_validate(result)
