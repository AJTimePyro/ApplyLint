# Cover Letter Generation

The second stage of ApplyLint generates a targeted job application email / cover letter from the candidate data parsed from the resume and a specific job description.

It supports two modes:

- **With Match Analysis:** Uses the analysis to prioritize the strongest relevant candidate experience.
- **Without Match Analysis:** Evaluates the candidate data and job description directly to determine what experience to emphasize.

## Generation Behavior

- **Subject:** Generates a clear, role-specific subject line, preferably under 70 characters.
- **Body:** Generates a 150–220 word application email in 3 short paragraphs. The word count applies to the full body, including the greeting and sign-off.
- **Relevant experience:** Focuses on 2–3 candidate experiences most relevant to the role.
- **Role alignment:** Connects those experiences to the role without turning job requirements into claims about the candidate.

When the hiring manager's name is available in the job or application context, use it. Otherwise, use `Dear Hiring Manager`.

If relevant evidence is limited, keep the claims and tone modest rather than compensating with generic or exaggerated language.

## Grounding

The candidate data is the source of truth.

The generator must not:

- Invent skills, experience, responsibilities, achievements, or qualifications.
- Treat Match Analysis inferences or phrasing as candidate facts.
- Infer skills, seniority, or responsibilities beyond what the candidate data supports.
- Alter, approximate, or invent job titles, employers, dates, figures, or metrics.
- Claim experience with any technology or responsibility that appears only in the job description and not in the candidate data.

Tools and skills may be paraphrased naturally, but the underlying experience must be explicitly supported by the candidate data.

## Style

The generated application should be:

- Concise and role-specific
- Professional and understated
- Focused on concrete candidate experience
- Written like a real engineer contacting a hiring manager

It should avoid:

- Generic filler
- Unrelated technologies
- Repeating the resume as a list
- Overly enthusiastic or sales-like language
- Mentioning match scores, concerns, missing requirements, or the Match Analysis itself

## Match Analysis

When provided, `MatchAnalysis` is used to prioritize which candidate experiences to emphasize. It is not an additional source of candidate facts.

The `MatchAnalysis` schema is defined in `schemas/match.py`.

The candidate data schema is defined in `schemas/candidate.py`.

Candidate data must always be used to verify factual claims, even when the Match Analysis provides supporting evidence or recommendations.

## Output

The result is returned as a structured `CoverLetter` Pydantic model with two fields:

- `subject`
- `body`

The schema is defined in `schemas/application.py`.

### Example

```json
{
  "subject": "Application for Full Stack Developer - Abhijeet Gupta",
  "body": "Dear Hiring Manager,\n\nI am writing to apply for the Full Stack Developer position. As a Founding Engineer at Eshway, I led the development of LTD, an AI-powered project management platform serving 500+ active users. I also engineered AI capabilities including a RAG-based chatbot and AI-generated standups that automated daily reporting workflows.\n\nMy experience spans Python, FastAPI, React, Next.js, PostgreSQL, and Azure. At Eshway, I managed Azure infrastructure including Container Apps, Redis, Blob Storage, and PostgreSQL, maintaining 99.9% system uptime while executing a zero-downtime PostgreSQL migration from Neon to Azure. I also integrated ClickUp, Google Calendar, and Slack to enable real-time synchronization.\n\nI would welcome the opportunity to bring my experience in full-stack development, AI integration, and cloud infrastructure to your team. Thank you for considering my application.\n\nBest regards,\nAbhijeet Gupta"
}
```

## Pipeline

### With Match Analysis:

```text
Resume + Job Description
          ↓
    Match Analysis
          ↓
   MatchAnalysis object
          ↓
    Cover Letter
```

### Without Match Analysis:

```text
Resume + Job Description
          ↓
    Cover Letter
```
