# Cover Letter Generation

The second stage of ApplyLint drafts an initial cover letter from parsed Candidate Data and a job description.

> [!NOTE]
> **Related documentation:**
> - [AI Workflow](./ai-workflow.md): complete multi-stage pipeline overview
> - [Match Analysis](./match-analysis.md): upstream role fit evaluation

---

## 1. Pipeline and Architectural Integration

```text
Resume + Job Description
           ↓
     Match Analysis
           ↓
Cover Letter Generation (with or without MatchAnalysis)
           ↓
     Recruiter Lint
           ↓
 Cover Letter Improvement
```

### Node Execution
* **Node:** `generate_node` in [`backend/ai/workflows/application.py`](../backend/ai/workflows/application.py)
* **Invocation:** `generate_cover_letter` in [`backend/ai/nodes/generate.py`](../backend/ai/nodes/generate.py)
* **Signature:**
  ```python
  def generate_cover_letter(
      resume: dict[str, Any],
      job_description: str,
      match_analysis: MatchAnalysis | None = None,
  ) -> CoverLetter: ...
  ```

### Operating Modes
The node operates in two modes:
1. **With Match Analysis:** Uses the upstream `MatchAnalysis` object to prioritize the candidate's strongest matching experiences and alignment points.
2. **Without Match Analysis:** Directly evaluates candidate data and the job description to decide which experiences to emphasize.

---

## 2. Generation Behavior

- **Subject Line:** Produces a clear, role-specific subject line under 70 characters.
- **Body:** Drafts a 150 to 220 word letter in 3 short paragraphs, including greeting and sign-off.
- **Relevant Experience:** Highlights 2 to 3 candidate experiences most relevant to the role.
- **Role Alignment:** Connects candidate background to role needs without turning job requirements into unsubstantiated candidate claims.
- **Greeting:** Uses the hiring manager's name when available; defaults to `Dear Hiring Manager` otherwise.

If relevant evidence is limited, it keeps claims modest rather than compensating with exaggerated language.

---

## 3. Grounding and Style Constraints

Candidate Data is the source of truth for all candidate facts:
- Never invent skills, experience, responsibilities, metrics, or achievements.
- Do not treat Match Analysis inferences or job description requirements as candidate facts.
- Do not alter or approximate titles, employers, dates, or figures.
- Never claim experience with a technology or responsibility that appears only in the job description.

### Style Guidelines
- Written in a concise, professional, understated engineering tone.
- Avoid generic filler, uncontextualized keyword lists, or repeating the resume as a bulleted summary.
- Avoid promotional sales phrasing or claims of being a "perfect fit."
- Do not mention match scores, evaluation concerns, missing requirements, or Match Analysis in the letter text.

---

## 4. Schema Definitions and Example Output

The output is returned as a structured `CoverLetter` Pydantic model defined in [`backend/schemas/job_applications.py`](../backend/schemas/job_applications.py):

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

### Example Payload

```json
{
  "subject": "Application for Full Stack Developer - Abhijeet Gupta",
  "body": "Dear Hiring Manager,\n\nI am writing to apply for the Full Stack Developer position. As a Founding Engineer at Eshway, I led the development of LTD, an AI-powered project management platform serving 500+ active users. I also engineered AI capabilities including a RAG-based chatbot and AI-generated standups that automated daily reporting workflows.\n\nMy experience spans Python, FastAPI, React, Next.js, PostgreSQL, and Azure. At Eshway, I managed Azure infrastructure including Container Apps, Redis, Blob Storage, and PostgreSQL, maintaining 99.9% system uptime while executing a zero-downtime PostgreSQL migration from Neon to Azure. I also integrated ClickUp, Google Calendar, and Slack to enable real-time synchronization.\n\nI would welcome the opportunity to bring my experience in full-stack development, AI integration, and cloud infrastructure to your team. Thank you for considering my application.\n\nBest regards,\nAbhijeet Gupta"
}
```
