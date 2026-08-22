# ApplyLint

ApplyLint is an AI workflow that prepares, audits, and refines job application cover letters before submission.

Instead of generating unverified text, ApplyLint runs an adversarial review loop: it evaluates candidate fit, drafts an initial letter, checks it against 32 canonical recruiter rejection codes, and rewrites the content to fix grounding errors without inventing missing qualifications.

## Demo
<video src="https://github.com/user-attachments/assets/2cc3c7d4-ff4e-497a-9ff2-2bed5ca1a48b" autoplay loop muted playsinline width="100%">
</video>

---

```text
Resume + Job Description
           ↓
     Match Analysis
      ↙          ↘
[not_a_fit]    [fit]
    ↓             ↓
   END      Cover Letter Generation
                  ↓
            Recruiter Lint (Attack)
                  ↓
       Cover Letter Improvement (Defense)
                  ↓
                 END
```

---

## Core Principles

1. **Candidate Data is the source of truth:** The model cannot invent skills, metrics, job titles, or dates.
2. **Transferable experience boundary:** Adjacent experience explains adaptability, but is never presented as existing experience with an unfamiliar tool.
3. **Adversarial evaluation:** Recruiter Lint flags claims unsupported by Candidate Data or in conflict with timeline constraints.
4. **Candidate in control:** ApplyLint prepares, analyzes, and improves applications. It never submits them on the user's behalf.

---

## Technical Documentation

Detailed documentation for each stage of the pipeline:

* [AI Workflow Overview](docs/ai-workflow.md): Complete multi-stage LangGraph pipeline and streaming state lifecycle.
* [Match Analysis](docs/match-analysis.md): Candidate-job requirement matching, scoring caps, and fit recommendations.
* [Cover Letter Generation](docs/cover-letter-gen.md): Initial generation modes and grounding constraints.
* [Recruiter Lint](docs/recruiter-lint.md): 32 canonical reason codes, severity levels, and adversarial validation contracts.
* [Cover Letter Improvement](docs/cover-letter-improv.md): Strategy matrix for resolving findings truthfully.

---

## Tech Stack

* **AI & Orchestration:** LangGraph, LangChain, Ollama
* **Backend:** FastAPI, Python 3.10+, SQLAlchemy, aiosqlite, Alembic
* **Frontend:** Angular 22, Tailwind CSS, Spartan UI
* **Streaming:** Server-Sent Events (SSE) for live node updates

---

## Getting Started

### Prerequisites

* Python 3.10+
* Node.js (tested on v24.19.0) and npm
* [Ollama](https://ollama.com/) running locally

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn main:app
```

The API runs at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
npm run start
```

The frontend runs at `http://localhost:4200`.

---

## Origin

ApplyLint started as a 48-hour build-in-public marathon project to address hallucinations and ungrounded claims in AI job applications. It is under active development to add resume tailoring, automated file ingestion, and a dedicated verification stage.
