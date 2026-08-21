# Match Analysis

The first stage of ApplyLint evaluates how well a candidate matches a specific job before generating an application.

It takes candidate data parsed from the resume and a job description, evaluating the candidate against core role requirements from the perspective of a technical recruiter.

> [!NOTE]
> **Related documentation:**
> - [AI Workflow](./ai-workflow.md): complete multi-stage pipeline overview

---

## 1. Pipeline and Architectural Integration

```text
Resume + Job Description
           ↓
     Match Analysis
      ↙          ↘
[not_a_fit]    [fit]
    ↓             ↓
   END      Cover Letter Generation
```

### Node Execution
* **Node:** `match_node` in [`backend/ai/workflows/application.py`](../backend/ai/workflows/application.py)
* **Invocation:** `analyze_match` in [`backend/ai/nodes/match.py`](../backend/ai/nodes/match.py)
* **Signature:**
  ```python
  def analyze_match(
      resume: dict[str, Any],
      job_description: str,
  ) -> MatchAnalysis: ...
  ```

### Routing Behavior
After `match_node` completes, the workflow runs the `should_generate` conditional router:
* **Early termination (`not_a_fit`):** If `recommendation == "not_a_fit"`, the workflow stops immediately at `END`, avoiding generation for incompatible roles.
* **Proceed to generation (`fit`):** For `strong_fit`, `potential_fit`, or `weak_fit`, the workflow advances to `generate_node` with the `MatchAnalysis` object in state.

---

## 2. What It Analyzes

- **Requirements:** Extracts up to 8 core requirements from the job description and classifies each as `critical`, `important`, or `nice_to_have`.
- **Requirement matches:** Evaluates whether candidate evidence shows a strong match, partial match, or missing requirement.
- **Evidence:** Cites supporting facts from Candidate Data. Missing requirements receive an empty evidence list.
- **Score breakdown:** Scores technical skills, relevant experience, education, role alignment, and overall fit from 0 to 100.
- **Experience match:** Compares required seniority with documented candidate experience.
- **Timeline awareness:** Uses the current runtime date to interpret employment and education timelines without making assumptions.
- **Education match:** Compares documented degrees and majors against stated prerequisites.
- **Strengths:** Highlights the candidate's strongest advantages for the role.
- **Concerns:** Identifies gaps or missing skills that could raise questions.
- **Recommendation:** Returns `strong_fit`, `potential_fit`, `weak_fit`, or `not_a_fit`.

---

## 3. Grounding and Score Constraints

The analysis stays grounded in Candidate Data:
- Never invent skills, qualifications, metrics, or achievements.
- Do not assume missing evidence means the candidate lacks the skill in real life.
- Do not treat unrelated experience as direct evidence.
- Do not add speculative recruiter concerns.

### Score Caps
To prevent inflated scores when mandatory qualifications are missing:
* A missing `critical` requirement caps the overall match score at **60**.
* A partial match on a `critical` requirement caps the overall match score at **75**.

---

## 4. Schema and Output Structure

The output is returned as a structured `MatchAnalysis` Pydantic model defined in [`backend/schemas/match.py`](../backend/schemas/match.py):

```python
class MatchAnalysis(BaseModel):
    score_breakdown: ScoreBreakdown
    experience_match: ExperienceMatch | None
    education_match: EducationMatch | None
    requirements: list[RequirementAssessment]
    strengths: list[Strength]
    concerns: list[Concern]
    recommendation: Literal["strong_fit", "potential_fit", "weak_fit", "not_a_fit"]
    summary: str
```

TypeScript interface in [`frontend/src/app/apply/application.model.ts`](../frontend/src/app/apply/application.model.ts):

```typescript
export interface MatchAnalysis {
  score_breakdown: ScoreBreakdown;
  requirements: RequirementItem[];
  strengths: { point: string; impact: string; evidence: string[] }[];
  concerns: { concern: string; severity: string }[];
  recommendation: string;
  summary: string;
}
```

### Example Payload

```json
{
  "score_breakdown": {
    "skills": 95,
    "experience": 90,
    "education": 100,
    "role_alignment": 85,
    "overall": 92
  },
  "experience_match": {
    "min_years": 0,
    "max_years": 2
  },
  "education_match": {
    "required": "Bachelor's degree",
    "candidate": "B.Tech CSE",
    "status": "match",
    "evidence": [
      "Bachelor of Technology in Computer Science and Engineering"
    ]
  },
  "requirements": [
    {
      "requirement": "Backend & API Design",
      "importance": "critical",
      "status": "strong_match",
      "evidence": [
        "FastAPI, Flask, Express.js, Node.js"
      ]
    },
    {
      "requirement": "Zoho/Deluge Experience",
      "importance": "important",
      "status": "missing",
      "evidence": []
    }
  ],
  "strengths": [
    {
      "point": "Strong full-stack and AI experience relevant to the role",
      "impact": "high",
      "evidence": [
        "Built full-stack applications",
        "Built RAG-based AI features"
      ]
    }
  ],
  "concerns": [
    {
      "concern": "No explicit Zoho/Deluge experience",
      "severity": "medium"
    }
  ],
  "recommendation": "strong_fit",
  "summary": "Strong match with a specific gap in Zoho/Deluge experience."
}
```
