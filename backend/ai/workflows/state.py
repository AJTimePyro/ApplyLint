from typing import Any, TypedDict

from schemas.job_applications import CoverLetter
from schemas.match import MatchAnalysis
from schemas.recruiter_response import RecruiterLintResult


class ApplicationState(TypedDict):
    resume: dict[str, Any]
    job_description: str

    match_analysis: MatchAnalysis | None
    cover_letter: CoverLetter | None
    recruiter_lint: RecruiterLintResult | None
