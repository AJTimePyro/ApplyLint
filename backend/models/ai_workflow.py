from enum import Enum
from uuid import uuid4

from sqlalchemy import Enum as SQLEnum
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.db import Base


class AIWorkflowStatus(str, Enum):
    CREATED = "created"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AIWorkflow(Base):
    __tablename__: str = "ai_workflows"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    job_description: Mapped[str] = mapped_column(Text)

    status: Mapped[AIWorkflowStatus] = mapped_column(
        SQLEnum(AIWorkflowStatus),
        default=AIWorkflowStatus.CREATED,
    )
