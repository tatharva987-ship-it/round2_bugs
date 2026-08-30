import json
import os

import requests
from dotenv import load_dotenv
from pydantic import BaseModel, Field


load_dotenv()


OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434",
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen3:8b",
)


class BugAnalysis(BaseModel):
    title: str = Field(
        description="A concise developer-friendly bug title."
    )

    severity: str = Field(
        description="One of: Critical, High, Medium, Low."
    )

    priority: str = Field(
        description="One of: P0, P1, P2, P3."
    )

    category: str = Field(
        description=(
            "A useful software bug category such as UI, "
            "API, Authentication, Database, Performance, "
            "Security, or Application Error."
        )
    )

    reproduction_steps: list[str]

    root_cause: str

    suggested_fix: str

    test_cases: list[str]


def analyze_bug(
    description: str,
    expected: str,
    actual: str,
) -> BugAnalysis:

    schema = BugAnalysis.model_json_schema()

    prompt = f"""
You are BugMind, an expert software bug triage assistant.

Analyze the following software bug report.

BUG DESCRIPTION:
{description}

EXPECTED RESULT:
{expected or "Not provided"}

ACTUAL RESULT:
{actual or "Not provided"}

Return ONLY valid JSON matching the provided schema.

Rules:

1. severity must be exactly one of:
   Critical, High, Medium, Low

2. priority must be exactly one of:
   P0, P1, P2, P3

3. Do not invent evidence.

4. Reproduction steps must be practical and ordered.

5. If the root cause is uncertain, clearly say it is a
   possible or likely cause.

6. Suggested fix should be actionable without pretending
   the source-code cause is confirmed.

7. Test cases should be useful regression tests.

JSON SCHEMA:
{json.dumps(schema)}
"""

    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": schema,
        },
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    raw_response = data.get("response", "").strip()

    if not raw_response:
        raise RuntimeError("Ollama returned an empty response.")

    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Ollama returned invalid JSON: {raw_response}"
        ) from exc

    return BugAnalysis.model_validate(parsed)