from typing import Any, TypedDict

from schemas.application import CoverLetter
from schemas.match import MatchAnalysis


class ApplicationState(TypedDict):
    resume: dict[str, Any]
    job_description: str

    match_analysis: MatchAnalysis | None
    cover_letter: CoverLetter | None
