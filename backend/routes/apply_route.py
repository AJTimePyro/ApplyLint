import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.db import get_db
from schemas.apply import ApplyRequest, ApplyResponse
from services.apply_service import ApplyService

router = APIRouter()


@router.post("", response_model=ApplyResponse)
async def create_application(
    request: ApplyRequest,
    db: AsyncSession = Depends(get_db),
) -> ApplyResponse:
    service = ApplyService(db)

    return await service.create_application(request)


@router.get("/{application_id}/stream")
async def stream_application(
    application_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = ApplyService(db)

    try:
        workflow_stream = service.run_workflow(application_id)

        async def event_generator():
            async for update in workflow_stream:
                yield f"data: {json.dumps(update, default=str)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc
