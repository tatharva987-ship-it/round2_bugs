from app.database.database import SessionLocal

from app.models.bug import Bug
from app.services.duplicate_detector import (
    build_bug_text,
    get_embedding,
)


db = SessionLocal()

try:
    bugs = (
        db.query(Bug)
        .filter(Bug.embedding.is_(None))
        .all()
    )

    print(f"Found {len(bugs)} bugs without embeddings.")

    for bug in bugs:
        text = build_bug_text(
            description=bug.description,
            expected=bug.expected,
            actual=bug.actual,
        )

        print(f"Generating embedding for BUG-{bug.id:03d}...")

        bug.embedding = get_embedding(text)

    db.commit()

    print("Embedding backfill complete.")

finally:
    db.close()