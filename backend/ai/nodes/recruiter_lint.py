from typing import Any

from ai.prompts.prompt_handler import get_prompt
from ai.providers.ollama import llm
from schemas.job_applications import Application
from schemas.recruiter_response import RecruiterLintResult


def generate_recruiter_lint(
    candidate_data: dict[str, Any],
    job_description: str,
    application: Application,
) -> RecruiterLintResult:
    prompt = get_prompt("recruiter_lint")
    structured_llm = llm.with_structured_output(RecruiterLintResult)
    chain = prompt | structured_llm

    result = chain.invoke(
        {
            "candidate_data": candidate_data,
            "job_description": job_description,
            "application": application,
        }
    )
    return RecruiterLintResult.model_validate(result)
