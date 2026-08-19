from pydantic import BaseModel


class CoverLetter(BaseModel):
    subject: str
    body: str
