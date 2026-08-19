from pydantic import BaseModel


class Application(BaseModel):
    pass

class CoverLetter(Application):
    subject: str
    body: str
