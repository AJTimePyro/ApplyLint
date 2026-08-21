# Recruiter Lint

Recruiter Lint runs an adversarial check on a generated application against candidate data and the job description. Its purpose is to find evidence-backed reasons a hiring team might reject the candidate.

The cover letter improvement stage uses these findings to fix problems in the text.

---

## 1. Pipeline and architectural integration

```
Resume + Job Description
           ↓
     Match Analysis
           ↓
    Cover Letter (Gen)
           ↓
     Recruiter Lint  <─── [Candidate Data + Job Description + Application]
           ↓
  RecruiterLintResult
           ↓
 Cover Letter Improvement
```

### Node execution
- Node: `recruiter_lint_node` in [`backend/ai/workflows/application.py`](../backend/ai/workflows/application.py)
- Invocation: [`backend/ai/nodes/recruiter_lint.py`](../backend/ai/nodes/recruiter_lint.py)
- Signature:
  ```python
  def generate_recruiter_lint(
      candidate_data: dict[str, Any],
      job_description: str,
      application: Application,
  ) -> RecruiterLintResult: ...
  ```

### Inputs
1. `candidate_data`: Structured resume data covering skills, work history, education, dates, and achievements. This is the source of truth for candidate facts.
2. `job_description`: Target role requirements, responsibilities, constraints, and qualifications.
3. `application`: The generated cover letter or application text under evaluation.

---

## 2. Evaluation dimensions and reason codes

Evaluation falls into four areas with 32 reason codes:

### 2.1 Match and qualification
Compares the job description to candidate data. Only requirements explicitly marked as mandatory count toward rejection. Preferred and bonus qualifications are ignored.

| Canonical code | Trigger condition |
|---|---|
| `missing_required_skill` | An explicitly required skill, tool, or technology lacks evidence in candidate data. |
| `missing_required_certification` | An explicitly required certification or license is not documented. |
| `experience_level_mismatch` | Demonstrated experience does not satisfy the required seniority or level. |
| `insufficient_relevant_experience` | Relevant experience exists, but the total depth or duration is insufficient. |
| `insufficient_scope_or_scale` | Relevant experience exists, but documented complexity, ownership, or scale falls short. |
| `missing_required_responsibility` | A mandatory role responsibility is unsupported by candidate data. |
| `education_mismatch` | Documented education does not meet explicit degree or major requirements. |
| `missing_domain_experience` | Mandatory domain or industry-specific experience is missing. |
| `weak_role_alignment` | Candidate background does not align with core role responsibilities overall. |
| `technology_or_use_case_mismatch` | Relevant background exists, but lacks the specific technology or ecosystem required. |

### 2.2 Application grounding
Checks claims in the application against candidate data. Every factual claim must have backing evidence in candidate data. A requirement in the job description is never evidence that the candidate has that skill.

| Canonical code | Trigger condition |
|---|---|
| `unsupported_candidate_claim` | Application claims a skill, project, or qualification not found in candidate data. |
| `jd_derived_claim` | Application echoes a job requirement as a candidate capability without factual basis. |
| `unsupported_inference` | Application draws conclusions about achievements or scope beyond documented facts. |
| `exaggerated_experience_or_responsibility` | Application inflates the candidate's seniority, ownership, or responsibility. |
| `exaggerated_achievement_or_metric` | Application inflates, alters, or invents quantitative metrics or outcomes. |
| `evidence_conflation` | Application merges distinct candidate facts into an unsupported broader claim. |
| `factual_inconsistency` | Application contradicts candidate data on titles, employers, dates, or tools. |
| `timeline_misrepresentation` | Application misrepresents employment or education status, such as current versus past roles. |

### 2.3 Application quality
Evaluates writing clarity, relevance, and role fit.

| Canonical code | Trigger condition |
|---|---|
| `generic_application` | Application lacks role tailoring and reads as an interchangeable template. |
| `resume_repetition` | Application lists resume points without contextualizing them for the role. |
| `irrelevant_emphasis` | Highlights minor background while omitting stronger relevant qualifications. |
| `weak_evidence_to_claim_ratio` | Makes broad assertions unsupported by concrete evidence in the text. |
| `insufficient_concrete_evidence` | Relies on abstract assertions rather than specific projects, tools, or outcomes. |
| `poor_role_connection` | Relevant candidate experience is mentioned but not connected to role needs. |
| `repetitive_positioning` | Repeats the same selling point across paragraphs instead of diversifying evidence. |
| `technology_dumping` | Lists technologies without showing how they were used in practice. |
| `irrelevant_content` | Includes details that add no value for the specific role. |
| `overly_generic_or_sales_like` | Uses promotional phrases instead of concrete technical details. |
| `formulaic_writing` | Stilted, repetitive, or overly patterned phrasing that harms readability. |

### 2.4 Timeline and requirement consistency
Compares documented dates and availability against constraints in the job description.

| Canonical code | Trigger condition |
|---|---|
| `employment_timeline_conflict` | Documented employment dates conflict with explicit role tenure or availability requirements. |
| `education_timeline_conflict` | Graduation dates or enrollment status conflict with explicit role prerequisites. |
| `requirement_timeline_conflict` | Candidate history fails explicit time-based constraints, such as recent experience or start date. |

---

## 3. Core evaluation principles

1. **Grounding in candidate data**: Candidate data is the source of truth. Missing evidence means only that the data does not support the requirement, not that the candidate lacks the skill in real life.
2. **Objective findings**: The evaluator does not guess at salary, culture fit, or interview performance, and does not add advice or praise.
3. **Specific reason selection**: When multiple codes fit a problem, use the single most specific code instead of a broad one.
4. **Natural tone allowed**: Paraphrasing and confident phrasing are not penalized as long as the underlying facts remain accurate.

---

## 4. Severity and Source matrix

### Severity levels
- `critical`: A mandatory requirement is unsupported by candidate data, or a major factual contradiction or grounding violation exists.
- `high`: Substantial mismatch or ungrounded claim that could reasonably cause rejection.
- `medium`: Meaningful weakness or poor role alignment that reduces application strength.
- `low`: Minor quality or phrasing weakness unlikely to cause rejection on its own.

### Source attribution
Each reason lists the source inputs needed to establish the finding:

| Evaluation area | Expected sources |
|---|---|
| Match and qualification | `["job_description", "candidate_data"]` |
| Application grounding | `["application", "candidate_data"]` |
| Application quality | `["application"]` (plus `"job_description"` when role tailoring is at issue) |
| Timeline consistency | `["job_description", "candidate_data"]` |

---

## 5. Decision and validation contract

The evaluation returns one of three decisions:

- `reject`: At least one material rejection reason was identified. The `reasons` list must contain one or more items.
- `advance`: No material rejection reasons found. Low-severity quality observations are suppressed; `reasons` must be empty (`[]`).
- `incomplete_evaluation`: A required input is missing. The `reasons` list must be empty (`[]`).

> [!IMPORTANT]
> The schema enforces strict consistency: returning `advance` or `incomplete_evaluation` with non-empty reasons or returning `reject` with an empty reasons list raises a validation error.

---

## 6. Data schema and types

Defined in [`backend/schemas/recruiter_response.py`](../backend/schemas/recruiter_response.py):

```python
class RejectionReason(BaseModel):
    code: RejectionReasonCode
    severity: Literal["critical", "high", "medium", "low"]
    evidence: str
    sources: list[Literal["job_description", "candidate_data", "application"]] = Field(min_length=1)
    explanation: str

class RecruiterLintResult(BaseModel):
    decision: Literal["reject", "advance", "incomplete_evaluation"]
    reasons: list[RejectionReason]
    summary: str
```

TypeScript interface ([`frontend/src/app/apply/application.model.ts`](../frontend/src/app/apply/application.model.ts)):

```typescript
export interface LintReason {
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  evidence: string;
  explanation: string;
  sources: ('job_description' | 'candidate_data' | 'application')[];
}

export interface RecruiterLint {
  decision: 'reject' | 'advance' | 'incomplete_evaluation';
  reasons: LintReason[];
  summary: string;
}
```

---

## 7. Example output payload

```json
{
  "decision": "reject",
  "reasons": [
    {
      "code": "missing_required_skill",
      "severity": "critical",
      "evidence": "Job description requires: 'Write occasional custom scripts (using Zoho Deluge) to ensure our core application data syncs with Zoho CRM.' CANDIDATE_DATA contains no supporting evidence of Zoho Deluge experience.",
      "sources": [
        "job_description",
        "candidate_data"
      ],
      "explanation": "The job description explicitly requires Zoho Deluge scripting. The candidate has Python, Node.js, and cloud experience, but lacks documented Zoho Deluge background."
    },
    {
      "code": "unsupported_candidate_claim",
      "severity": "high",
      "evidence": "Cover letter states: 'I architected real-time WebSocket feeds for financial market data.' CANDIDATE_DATA mentions REST APIs and PostgreSQL, but no WebSocket or financial market data feeds.",
      "sources": [
        "application",
        "candidate_data"
      ],
      "explanation": "The application claims specialized financial WebSocket architecture experience that is not supported by candidate data."
    }
  ],
  "summary": "Application rejected due to an unsupported mandatory skill (Zoho Deluge) and an ungrounded claim regarding WebSocket financial feed architecture."
}
```
