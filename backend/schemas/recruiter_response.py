from typing import Literal

from pydantic import BaseModel, Field, model_validator

RejectionReasonCode = Literal[
    "missing_required_skill",
    "missing_required_certification",
    "experience_level_mismatch",
    "insufficient_relevant_experience",
    "insufficient_scope_or_scale",
    "missing_required_responsibility",
    "education_mismatch",
    "missing_domain_experience",
    "weak_role_alignment",
    "technology_or_use_case_mismatch",
    "unsupported_candidate_claim",
    "jd_derived_claim",
    "unsupported_inference",
    "exaggerated_experience_or_responsibility",
    "exaggerated_achievement_or_metric",
    "evidence_conflation",
    "factual_inconsistency",
    "timeline_misrepresentation",
    "generic_application",
    "resume_repetition",
    "irrelevant_emphasis",
    "weak_evidence_to_claim_ratio",
    "insufficient_concrete_evidence",
    "poor_role_connection",
    "repetitive_positioning",
    "technology_dumping",
    "irrelevant_content",
    "overly_generic_or_sales_like",
    "formulaic_writing",
    "employment_timeline_conflict",
    "education_timeline_conflict",
    "requirement_timeline_conflict",
]

class RejectionReason(BaseModel):
    code: RejectionReasonCode
    severity: Literal["critical", "high", "medium", "low"]
    evidence: str
    sources: list[
        Literal[
            "job_description",
            "candidate_data",
            "application",
        ]
    ] = Field(min_length=1)
    explanation: str

class RecruiterLintResult(BaseModel):
    decision: Literal[
        "reject",
        "advance",
        "incomplete_evaluation",
    ]
    reasons: list[RejectionReason]
    summary: str

    @model_validator(mode="after")
    def check_consistency(self):
        if self.decision == "reject" and not self.reasons:
            raise ValueError("reject requires at least one reason")

        if self.decision in ("advance", "incomplete_evaluation") and self.reasons:
            raise ValueError(f"{self.decision} must not include reasons")

        return self
