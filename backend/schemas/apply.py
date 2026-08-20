from pydantic import BaseModel


class ApplyRequest(BaseModel):
    job_description: str


class ApplyResponse(BaseModel):
    application_id: str
