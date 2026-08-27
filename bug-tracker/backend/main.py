from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BugReport(BaseModel):
    description: str
    expected: str = ""
    actual: str = ""


@app.get("/")
def home():
    return {"message": "BugMind backend is running"}


@app.post("/analyze")
def analyze_bug(bug: BugReport):
    return {
        "title": bug.description[:60],
        "severity": "High",
        "priority": "P2",
        "category": "Application Error",
        "root_cause": "Possible input validation or application logic failure.",
        "suggested_test": "Test valid, empty, invalid and edge-case inputs."
    }