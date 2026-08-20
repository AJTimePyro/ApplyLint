from typing import Any

from ai.prompts.prompt_handler import get_prompt
from ai.providers.ollama import llm
from schemas.job_applications import CoverLetter
from schemas.match import MatchAnalysis
from schemas.recruiter_response import RecruiterLintResult


### Cover Letters
def generate_cover_letter(
    resume: dict[str, Any],
    job_description: str,
    match_analysis: MatchAnalysis | None = None,
) -> CoverLetter:
    prompt = get_prompt("cover_letter")
    structured_llm = llm.with_structured_output(CoverLetter)
    chain = prompt | structured_llm

    match_analysis_data = (
        match_analysis.model_dump()
        if match_analysis is not None
        else "No match analysis was provided. Evaluate the candidate directly from the resume and job description."
    )

    result = chain.invoke(
        {
            "resume": resume,
            "job_description": job_description,
            "match_analysis": match_analysis_data,
        }
    )

    return CoverLetter.model_validate(result)

def improve_cover_letter(
    resume: dict[str, Any],
    rejection_feedback: RecruiterLintResult,
    cover_letter: CoverLetter,
    match_analysis: MatchAnalysis | None = None,
) -> CoverLetter:
    prompt = get_prompt("cover_letter_improv")
    structured_llm = llm.with_structured_output(CoverLetter)
    chain = prompt | structured_llm

    match_analysis_data = (
        match_analysis.model_dump()
        if match_analysis is not None
        else "No match analysis was provided. Evaluate the candidate directly from the resume and job description."
    )

    result = chain.invoke(
        {
            "candidate_data": resume,
            "recruiter_lint": rejection_feedback,
            "match_analysis": match_analysis_data,
            "application": cover_letter,
        }
    )

    return CoverLetter.model_validate(result)
