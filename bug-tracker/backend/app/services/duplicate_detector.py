import math
import os

import requests
from sqlalchemy.orm import Session

from app.models.bug import Bug


OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434",
)

EMBEDDING_MODEL = "nomic-embed-text"


def get_embedding(text: str) -> list[float]:
    response = requests.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={
            "model": EMBEDDING_MODEL,
            "prompt": text,
        },
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    embedding = data.get("embedding")

    if not embedding:
        raise RuntimeError("Ollama returned no embedding.")

    return embedding


def cosine_similarity(
    vector_a: list[float],
    vector_b: list[float],
) -> float:
    if not vector_a or not vector_b:
        return 0.0

    if len(vector_a) != len(vector_b):
        return 0.0

    dot_product = sum(
        a * b
        for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)


def build_bug_text(
    description: str,
    expected: str = "",
    actual: str = "",
) -> str:
    return f"""
Description:
{description}

Expected:
{expected or "Not provided"}

Actual:
{actual or "Not provided"}
""".strip()


def find_duplicates(
    db: Session,
    embedding: list[float],
    threshold: float = 0.78,
    limit: int = 5,
) -> list[dict]:

    existing_bugs = (
        db.query(Bug)
        .filter(Bug.embedding.is_not(None))
        .all()
    )

    matches = []

    for bug in existing_bugs:
        similarity = cosine_similarity(
            embedding,
            bug.embedding,
        )

        if similarity >= threshold:
            matches.append(
                {
                    "id": bug.id,
                    "title": bug.title,
                    "severity": bug.severity,
                    "priority": bug.priority,
                    "status": bug.status,
                    "similarity": round(
                        similarity * 100,
                        1,
                    ),
                }
            )

    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return matches[:limit]