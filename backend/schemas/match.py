from typing import Literal

from pydantic import BaseModel, Field


class RequirementAssessment(BaseModel):
    requirement: str
    importance: Literal["critical", "important", "nice_to_have"]
    status: Literal["strong_match", "partial_match", "missing"]
    evidence: list[str]

class ScoreBreakdown(BaseModel):
    skills: int = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=100)
    education: int = Field(ge=0, le=100)
    role_alignment: int = Field(ge=0, le=100)
    overall: int = Field(ge=0, le=100)

class ExperienceMatch(BaseModel):
    min_years: float | None
    max_years: float | None

class EducationMatch(BaseModel):
    required: str | None
    candidate: str | None
    status: Literal[
        "match",
        "partial_match",
        "missing",
        "not_specified",
    ]
    evidence: list[str]

class Strength(BaseModel):
    point: str
    impact: Literal["high", "medium", "low"]
    evidence: list[str]

class Concern(BaseModel):
    concern: str
    severity: Literal["high", "medium", "low"]

class MatchAnalysis(BaseModel):
    score_breakdown: ScoreBreakdown
    experience_match: ExperienceMatch | None
    education_match: EducationMatch | None
    requirements: list[RequirementAssessment]
    strengths: list[Strength]
    concerns: list[Concern]
    recommendation: Literal[
        "strong_fit",
        "potential_fit",
        "weak_fit",
        "not_a_fit",
    ]
    summary: str
