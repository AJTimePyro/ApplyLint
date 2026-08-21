# Cover Letter Improvement

The Cover Letter Improvement stage updates an initial cover letter using findings from Recruiter Lint and facts from Candidate Data. It produces a more relevant letter while keeping every claim truthful, grounded, and backed by evidence.

> [!NOTE]
> **Related documentation:**
> - [Cover Letter Generation](./cover-letter-gen.md): initial application generation
> - [Recruiter Lint](./recruiter-lint.md): adversarial evaluation and reason codes
> - [Match Analysis](./match-analysis.md): candidate-job fit analysis and scoring

---

## 1. Pipeline and Architectural Integration

```text
Resume + Job Description
           ↓
     Match Analysis
           ↓
   Cover Letter (Gen)
           ↓
     Recruiter Lint
           ↓
RecruiterLintResult + CoverLetter + Candidate Data (+ MatchAnalysis)
           ↓
 Cover Letter Improvement
           ↓
    Improved CoverLetter
```

### Node Execution
* **Node:** `improve_node` in [`backend/ai/workflows/application.py`](../backend/ai/workflows/application.py)
* **Invocation:** `improve_cover_letter` in [`backend/ai/nodes/generate.py`](../backend/ai/nodes/generate.py)
* **Signature:**
  ```python
  def improve_cover_letter(
      resume: dict[str, Any],
      rejection_feedback: RecruiterLintResult,
      cover_letter: CoverLetter,
      match_analysis: MatchAnalysis | None = None,
  ) -> CoverLetter: ...
  ```

### State and Fallback Behavior
* **Conditional Execution:** If `cover_letter` or `recruiter_lint` is `None` (such as when the workflow ends early after a `not_a_fit` match recommendation), `improve_node` returns `{"cover_letter": None}`.
* **State Update:** When active, the node stores the updated `CoverLetter` in state.

---

## 2. Inputs and Schema Contracts

### Input Sources

| Input | Parameter | Type | Description |
|:---|:---|:---|:---|
| **Original Cover Letter** | `cover_letter` | `CoverLetter` | The initial cover letter to revise. |
| **Recruiter Lint Findings** | `rejection_feedback` | `RecruiterLintResult` | Findings that identify qualification gaps, grounding errors, or quality issues. |
| **Candidate Data** | `resume` | `dict[str, Any]` | Parsed candidate data derived from the resume and used as the source of truth for candidate facts (skills, experience, dates, metrics, education). |
| **Match Analysis** | `match_analysis` | `MatchAnalysis \| None` | Optional guide prioritizing the candidate's strongest matching points. |

When Match Analysis is unavailable, the improvement stage determines relevant evidence directly from Recruiter Lint and Candidate Data.

### Schema Definitions

Defined in [`backend/schemas/job_applications.py`](../backend/schemas/job_applications.py):

```python
class CoverLetter(BaseModel):
    subject: str
    body: str
```

TypeScript interface in [`frontend/src/app/apply/application.model.ts`](../frontend/src/app/apply/application.model.ts):

```typescript
export interface CoverLetter {
  subject: string;
  body: string;
}
```

---

## 3. Improvement Strategy by Reason Category

The improvement stage resolves findings using strategies tied to each Recruiter Lint reason code:

### 3.1 Requirement Gaps
Addresses missing qualifications without inventing experience.

| Canonical code | Finding description | Typical improvement strategy |
|:---|:---|:---|
| `missing_required_skill` | Required skill or tool missing from candidate data | Highlight adjacent or transferable skills; leave gap intact if none exist |
| `missing_required_certification` | Required license or certification not documented | Highlight practical domain experience without claiming the credential |
| `experience_level_mismatch` | Seniority or years of experience below requirement | Focus on high-impact projects, ownership, and demonstrated complexity |
| `insufficient_relevant_experience` | Relevant experience is shallow or too brief | Contextualize work depth and practical outcomes from candidate data |
| `insufficient_scope_or_scale` | Project complexity, ownership, or scale falls short | Highlight system throughput, architecture, or team collaboration |
| `missing_required_responsibility` | Mandatory role duty unsupported by candidate data | Highlight adjacent responsibilities without claiming full ownership |
| `education_mismatch` | Degree or major does not match requirements | Highlight practical technical achievements and engineering background |
| `missing_domain_experience` | Industry or specialized domain background missing | Highlight transferable technical patterns relevant to the domain |
| `weak_role_alignment` | Background misaligned with primary role duties | Focus on the candidate's strongest overlapping competencies |
| `technology_or_use_case_mismatch` | Missing specific technology ecosystem | Detail experience with comparable tools and architectural patterns |

> [!IMPORTANT]
> - **Non-fabrication:** If Candidate Data contains no relevant transferable evidence, the gap remains unaddressed. Do not invent experience to satisfy a requirement.
> - **Forward-looking statements:** If a relevant transferable skill is unavailable, a truthful forward-looking statement about learning or adapting may be used when appropriate, but it must not imply existing experience or replace a missing required qualification.

### 3.2 Application Grounding
Keeps all claims grounded in Candidate Data.

| Canonical code | Finding description | Typical improvement strategy |
|:---|:---|:---|
| `unsupported_candidate_claim` | Skill, project, or role not in Candidate Data | Remove the claim or narrow it to verified candidate facts |
| `jd_derived_claim` | Job requirement echoed as candidate experience | Replace with actual candidate background from Candidate Data |
| `unsupported_inference` | Speculative conclusions beyond documented facts | Restrict statements to verifiable metrics and documented facts |
| `exaggerated_experience_or_responsibility` | Inflated seniority, scope, or leadership | Accurately describe candidate's documented contribution and role |
| `exaggerated_achievement_or_metric` | Inflated quantitative metrics or outcomes | Restore exact figures or descriptive outcomes from Candidate Data |
| `evidence_conflation` | Merged distinct facts into an unverified claim | Separate distinct experiences and report each accurately |
| `factual_inconsistency` | Contradicts titles, employers, dates, or tools | Correct details to match Candidate Data |
| `timeline_misrepresentation` | Misrepresents current vs. past employment status | Correct employment status and role tenure |

### 3.3 Timeline and Requirement consistency
Ensures candidate availability, tenure, and sequence match documented constraints.

| Canonical code | Finding description | Typical improvement strategy |
|:---|:---|:---|
| `employment_timeline_conflict` | Employment dates conflict with role tenure requirements | State dates and tenure accurately without obscuring intervals |
| `education_timeline_conflict` | Graduation or enrollment dates conflict with prerequisites | State educational timeline and current status accurately |
| `requirement_timeline_conflict` | Fails explicit time-based constraints (such as recency) | Present recent verifiable experience without distorting dates |

### 3.4 Application Quality
Improves writing structure, clarity, and relevance.

| Canonical code | Finding description | Typical improvement strategy |
|:---|:---|:---|
| `generic_application` | Template-like phrasing lacking role tailoring | Integrate specific role-relevant projects from Candidate Data |
| `resume_repetition` | Raw bullet points listed without role context | Connect concrete achievements directly to role requirements |
| `irrelevant_emphasis` | Focuses on minor or tangential background | Focus on the candidate's strongest matching evidence |
| `weak_evidence_to_claim_ratio` | Broad claims without supporting proof | Support claims with concrete tools, projects, or metrics |
| `insufficient_concrete_evidence` | Abstract assertions lacking specificity | Anchor statements to specific technologies and demonstrated results |
| `poor_role_connection` | Experience mentioned but not connected to role | Explain how prior work applies to target role needs |
| `repetitive_positioning` | Same selling point repeated across paragraphs | Diversify evidence across technical depth, scale, and execution |
| `technology_dumping` | Keyword lists without context or application | Detail how specific tools were applied to solve practical problems |
| `irrelevant_content` | Tangential details that add no value to the role | Remove distractions and refocus paragraphs on core role alignment |
| `overly_generic_or_sales_like` | Promotional buzzwords instead of technical detail | Replace sales phrases with concise engineering specifics |
| `formulaic_writing` | Stilted, formulaic, or robotic sentence patterns | Rewrite paragraphs for natural, professional flow |

---

## 4. Grounding and Style Constraints

### Style Guidelines

| Dimension | Target Specification | Patterns to Avoid |
|:---|:---|:---|
| **Word Count** | 150 to 220 words total (including greeting and sign-off) | Fluffy padding, generic filler, or single-sentence brevity |
| **Structure** | Clear subject line (< 70 chars) and 3 short paragraphs | Walls of text, excessive bullet lists, or disjointed fragments |
| **Tone** | Understated, confident engineering tone | Sales language, exaggerated claims, or generic enthusiasm |
| **Grounding** | Strict adherence to Candidate Data | Fabricated metrics, assumed technologies, or JD echo |
| **Process Disclosure** | Cover Letter contains only natural candidate-facing content | Mentioning Recruiter Lint, revision steps, or AI generation |

> [!CAUTION]
> The revised cover letter must never mention Recruiter Lint, rejection codes, revision instructions, or AI generation.

---

## 5. Input and Output Example

### Input State (Abbreviated)

**Original Cover Letter:**
```json
{
  "subject": "Application for Senior Backend Engineer",
  "body": "Dear Hiring Manager,\n\nI am excited to apply for the Senior Backend Engineer role. I have extensive experience architecting distributed streaming systems with Apache Kafka and Flink for financial data processing...\n\nSincerely,\nCandidate"
}
```

**Recruiter Lint Findings:**
```json
{
  "decision": "reject",
  "reasons": [
    {
      "code": "unsupported_candidate_claim",
      "severity": "high",
      "evidence": "Cover letter states experience with Apache Kafka and Flink. Candidate Data only documents RabbitMQ and PostgreSQL queues.",
      "sources": ["application", "candidate_data"],
      "explanation": "The candidate has message queue experience but lacks documented Kafka/Flink experience."
    }
  ],
  "summary": "Application makes unsupported claims regarding Apache Kafka and Flink."
}
```

### Example Output

**Revised `CoverLetter`:**
```json
{
  "subject": "Application for Senior Backend Engineer - Candidate Name",
  "body": "Dear Hiring Manager,\n\nI am writing to apply for the Senior Backend Engineer position. In my previous role as a Backend Engineer, I designed and maintained event-driven backend architectures using Python, FastAPI, and RabbitMQ. My work centered on handling high-throughput asynchronous job queues, ensuring reliable message delivery across distributed microservices, and maintaining 99.9% service uptime during peak traffic periods.\n\nMy experience also covers database optimization and core API design. At my previous company, I optimized complex PostgreSQL queries and indexing strategies to reduce API latency by 40%, built robust RESTful services, and established automated end-to-end testing pipelines. I also implemented structured logging and metrics collection across distributed services to improve overall system observability and debugging speed.\n\nI welcome the opportunity to bring my hands-on experience in backend service design, reliable message queuing, and database performance to your engineering team. Thank you for your time and consideration.\n\nBest regards,\nCandidate Name"
}
```
