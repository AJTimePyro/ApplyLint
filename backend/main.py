from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.apply_route import router as application_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
)


@app.get("/")
def read_root():
    return {"message": "FastAPI is up and running!"}


app.include_router(application_router, prefix="/api/apply", tags=["Apply"])
