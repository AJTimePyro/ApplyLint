# AI Workflow

ApplyLint uses a multi-stage AI workflow to prepare a job application from a
candidate's experience and a specific job description.

The current MVP focuses on generating a targeted cover letter / email.

## Workflow

```mermaid
flowchart TD
    A[User Resume] --> C[Match Analysis]
    B[Job Description] --> C

    C -->|Not a Fit| D[End]
    C -->|Fit| E[Generate Application]

    E -->|Generating Application| F[Cover Letter / Application Email]

    F --> H[User Reviews Application]
```
