from fastapi import FastAPI

from routes.apply_route import router as application_router

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "FastAPI is up and running!"}


app.include_router(application_router, prefix="/api/apply", tags=["Apply"])
