# Match Analysis

The first stage of ApplyLint is figuring out how well a candidate matches a specific job before generating an application.

It takes two inputs: candidate data parsed from the resume, and a job description. The AI acts as a technical recruiter, evaluating the candidate against the most important requirements in the job description.

## What It Analyzes

- **Requirements.** Extracts up to 8 important requirements from the job description and classifies each as `critical`, `important`, or `nice_to_have`.
- **Requirement matches.** Determines whether the candidate has strong, partial, or no supporting evidence for each requirement.
- **Evidence.** Records only facts directly supported by the candidate data. Missing requirements get no evidence entry, not an explanation of the absence.
- **Score breakdown.** Scores across technical skills, relevant experience, education, role alignment, and overall match.
- **Experience match.** Compares the experience or seniority the job requires with what the candidate has demonstrated.
- **Education match.** Compares the job's education requirements with the candidate's education.
- **Strengths.** The candidate's strongest advantages specifically relevant to the role.
- **Concerns.** Realistic reasons a recruiter might hesitate or reject the candidate.
- **Recommendation.** One of `strong_fit`, `potential_fit`, `weak_fit`, or `not_a_fit`.

## Constraints

The analysis has to stay grounded in the supplied candidate data. It must not:

- Invent skills, experience, qualifications, or achievements
- Assume missing evidence means the candidate lacks the skill
- Treat unrelated experience as direct evidence
- Add speculative recruiter concerns

Critical requirements also cap the score: a missing critical requirement caps the overall score at 60, and a partial match on one caps it at 75.

## Output

The result comes back as a structured Pydantic model instead of free text, so later pipeline stages get predictable data to work with.

Match Analysis isn't the final application evaluation. It hands off the context the next stage, Generate, needs.

## Output Structure

Match Analysis returns a structured `MatchAnalysis` object.

### Example

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

## Pipeline

```text
Resume + Job Description
          ↓
    Match Analysis
          ↓
   MatchAnalysis object
          ↓
       Generate
```
