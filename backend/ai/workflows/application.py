from langgraph.graph import END, START, StateGraph

from ai.nodes.generate import generate_cover_letter
from ai.nodes.match import analyze_match
from ai.nodes.recruiter_lint import generate_recruiter_lint
from ai.workflows.state import ApplicationState


def match_node(state: ApplicationState):
    return {
        "match_analysis": analyze_match(
            state["resume"],
            state["job_description"],
        )
    }


def generate_node(state: ApplicationState):
    return {
        "cover_letter": generate_cover_letter(
            resume=state["resume"],
            job_description=state["job_description"],
            match_analysis=state["match_analysis"],
        )
    }


def recruiter_lint_node(state: ApplicationState):
    cover_letter = state.get("cover_letter")
    if cover_letter is None:
        return {"recruiter_lint": None}

    return {
        "recruiter_lint": generate_recruiter_lint(
            candidate_data=state["resume"],
            job_description=state["job_description"],
            application=cover_letter,
        )
    }


def should_generate(state: ApplicationState):
    match_analysis = state.get("match_analysis")
    if match_analysis is not None and match_analysis.recommendation == "not_a_fit":
        return "end"

    return "generate"


builder = (
    StateGraph(ApplicationState)
    .add_node("match", match_node)
    .add_node("generate", generate_node)
    .add_node("recruiter_lint", recruiter_lint_node)
    .add_edge(START, "match")
    .add_conditional_edges(
        "match",
        should_generate,
        {
            "generate": "generate",
            END: END,
        },
    )
    .add_edge("generate", "recruiter_lint")
    .add_edge("recruiter_lint", END)
)

application_workflow = builder.compile()
