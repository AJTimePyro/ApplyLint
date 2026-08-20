import json
from pathlib import Path
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ai.workflows.application import application_workflow
from ai.workflows.state import ApplicationState
from models.ai_workflow import AIWorkflow, AIWorkflowStatus
from schemas.apply import ApplyRequest, ApplyResponse


class ApplyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_application(
        self,
        request: ApplyRequest,
    ) -> ApplyResponse:
        workflow = AIWorkflow(
            job_description=request.job_description,
        )

        self.db.add(workflow)
        await self.db.commit()
        await self.db.refresh(workflow)

        return ApplyResponse(
            application_id=workflow.id,
        )

    async def run_workflow(self, workflow_id: str):
        workflow = await self._get_workflow(workflow_id)
        if workflow is None:
            raise ValueError("Workflow not found")

        resume = await ApplyService.get_resume()

        workflow.status = AIWorkflowStatus.RUNNING
        await self.db.commit()

        workflow_input: ApplicationState = {
            "resume": resume,
            "job_description": workflow.job_description,
            "match_analysis": None,
            "cover_letter": None,
            "recruiter_lint": None,
        }

        async for update in application_workflow.astream(
            workflow_input,
            stream_mode="updates",
        ):
            yield update

    async def _get_workflow(
        self,
        workflow_id: str,
    ) -> AIWorkflow | None:
        return await self.db.get(AIWorkflow, workflow_id)

    @staticmethod
    async def get_resume() -> dict[str, Any]:
        file_path = Path("playground/user_resume.json")

        if not file_path.is_file():
            raise FileNotFoundError(f"Resume file not found at: {file_path.resolve()}")

        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
