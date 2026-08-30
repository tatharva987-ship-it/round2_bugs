from app.database.database import SessionLocal
from app.models.bug import Bug
from app.services.duplicate_detector import (
    build_bug_text,
    get_embedding,
    cosine_similarity,
)


db = SessionLocal()

try:
    bugs = (
        db.query(Bug)
        .filter(Bug.embedding.is_not(None))
        .all()
    )

    print(f"Existing bugs with embeddings: {len(bugs)}")

    new_bug_text = build_bug_text(
        description=(
            "When I click the Login button with an incorrect "
            "password, the page freezes and the loading spinner "
            "keeps running forever."
        ),
        expected=(
            "The application should display an invalid password "
            "message and allow the user to try again."
        ),
        actual=(
            "The page becomes unresponsive and the loading spinner "
            "never stops after the failed login attempt."
        ),
    )

    print("Generating embedding for new bug...")

    new_embedding = get_embedding(new_bug_text)

    print("Comparing against existing bugs...")

    for bug in bugs:
        similarity = cosine_similarity(
            new_embedding,
            bug.embedding,
        )

        print(
            f"BUG-{bug.id:03d} | "
            f"{bug.title} | "
            f"{similarity * 100:.2f}%"
        )

finally:
    db.close()