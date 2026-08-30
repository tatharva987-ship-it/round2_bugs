from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.analyzer import analyze_bug as run_ai_analysis
from app.database.database import Base, engine, get_db
from app.models.bug import Bug
from app.models.comment import BugComment
from app.models.history import BugHistory
from app.services.duplicate_detector import (
    build_bug_text,
    find_duplicates,
    get_embedding,
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="BugMind API",
    description="AI-powered bug tracking and triage platform",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================


class BugReport(BaseModel):
    description: str
    expected: str = ""
    actual: str = ""


class BugUpdate(BaseModel):
    status: str | None = None
    assignee: str | None = None


class CommentCreate(BaseModel):
    author: str
    content: str


# ============================================================
# HOME
# ============================================================


@app.get("/")
def home():
    return {
        "message": "BugMind backend is running",
        "version": "1.0.0",
    }


# ============================================================
# CREATE BUG
# AI ANALYSIS
# DUPLICATE DETECTION
# DATABASE PERSISTENCE
# ============================================================


@app.post("/analyze")
def analyze_bug(
    bug: BugReport,
    db: Session = Depends(get_db),
):
    try:
        # ------------------------------------------------------
        # 1. AI analysis
        # ------------------------------------------------------

        analysis = run_ai_analysis(
            description=bug.description,
            expected=bug.expected,
            actual=bug.actual,
        )

        # ------------------------------------------------------
        # 2. Create semantic embedding
        # ------------------------------------------------------

        bug_text = build_bug_text(
            description=bug.description,
            expected=bug.expected,
            actual=bug.actual,
        )

        embedding = get_embedding(bug_text)

        # ------------------------------------------------------
        # 3. Detect similar existing bugs
        # ------------------------------------------------------

        possible_duplicates = find_duplicates(
            db=db,
            embedding=embedding,
            threshold=0.78,
            limit=5,
        )

        # ------------------------------------------------------
        # 4. Save the new bug
        # ------------------------------------------------------

        new_bug = Bug(
            title=analysis.title,
            description=bug.description,
            expected=bug.expected,
            actual=bug.actual,
            severity=analysis.severity,
            priority=analysis.priority,
            category=analysis.category,
            reproduction_steps=analysis.reproduction_steps,
            root_cause=analysis.root_cause,
            suggested_fix=analysis.suggested_fix,
            test_cases=analysis.test_cases,
            embedding=embedding,
            suggested_test="\n".join(
                f"{index + 1}. {test}"
                for index, test in enumerate(
                    analysis.test_cases
                )
            ),
            status="Reported",
            assignee=None,
        )

        db.add(new_bug)
        db.commit()
        db.refresh(new_bug)

        # ------------------------------------------------------
        # 5. Record creation in activity history
        # ------------------------------------------------------

        creation_history = BugHistory(
            bug_id=new_bug.id,
            actor="system",
            action="BUG_CREATED",
            old_value=None,
            new_value="Reported",
        )

        db.add(creation_history)
        db.commit()

        # ------------------------------------------------------
        # 6. Return complete response
        # ------------------------------------------------------

        return {
            "id": new_bug.id,
            "title": new_bug.title,
            "description": new_bug.description,
            "expected": new_bug.expected,
            "actual": new_bug.actual,
            "severity": new_bug.severity,
            "priority": new_bug.priority,
            "category": new_bug.category,
            "reproduction_steps": new_bug.reproduction_steps,
            "root_cause": new_bug.root_cause,
            "suggested_fix": new_bug.suggested_fix,
            "test_cases": new_bug.test_cases,
            "possible_duplicates": possible_duplicates,
            "status": new_bug.status,
            "assignee": new_bug.assignee,
            "created_at": new_bug.created_at,
        }

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Bug analysis failed: {exc}",
        ) from exc


# ============================================================
# GET ALL BUGS
# ============================================================


@app.get("/bugs")
def get_bugs(
    db: Session = Depends(get_db),
):
    bugs = (
        db.query(Bug)
        .order_by(Bug.created_at.desc())
        .all()
    )

    return [
        {
            "id": bug.id,
            "title": bug.title,
            "description": bug.description,
            "severity": bug.severity,
            "priority": bug.priority,
            "category": bug.category,
            "status": bug.status,
            "assignee": bug.assignee,
            "created_at": bug.created_at,
        }
        for bug in bugs
    ]


# ============================================================
# GET SINGLE BUG
# ============================================================


@app.get("/bugs/{bug_id}")
def get_bug(
    bug_id: int,
    db: Session = Depends(get_db),
):
    bug = (
        db.query(Bug)
        .filter(Bug.id == bug_id)
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found",
        )

    return {
        "id": bug.id,
        "title": bug.title,
        "description": bug.description,
        "expected": bug.expected,
        "actual": bug.actual,
        "severity": bug.severity,
        "priority": bug.priority,
        "category": bug.category,
        "reproduction_steps": bug.reproduction_steps,
        "root_cause": bug.root_cause,
        "suggested_fix": bug.suggested_fix,
        "test_cases": bug.test_cases,
        "status": bug.status,
        "assignee": bug.assignee,
        "created_at": bug.created_at,
    }


# ============================================================
# UPDATE BUG
# STATUS + ASSIGNEE
# ============================================================


@app.patch("/bugs/{bug_id}")
def update_bug(
    bug_id: int,
    update: BugUpdate,
    db: Session = Depends(get_db),
):
    bug = (
        db.query(Bug)
        .filter(Bug.id == bug_id)
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found",
        )

    allowed_statuses = {
        "Reported",
        "Assigned",
        "In Progress",
        "Testing",
        "Resolved",
        "Closed",
    }

    history_events = []

    # ----------------------------------------------------------
    # STATUS
    # ----------------------------------------------------------

    if update.status is not None:

        if update.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid status. Allowed values: "
                    + ", ".join(
                        sorted(allowed_statuses)
                    )
                ),
            )

        if update.status != bug.status:

            old_status = bug.status

            bug.status = update.status

            history_events.append(
                BugHistory(
                    bug_id=bug.id,
                    actor="developer",
                    action="STATUS_CHANGED",
                    old_value=old_status,
                    new_value=update.status,
                )
            )

    # ----------------------------------------------------------
    # ASSIGNEE
    # ----------------------------------------------------------

    if update.assignee is not None:

        new_assignee = update.assignee.strip()

        if not new_assignee:
            new_assignee = None

        if new_assignee != bug.assignee:

            old_assignee = bug.assignee

            bug.assignee = new_assignee

            history_events.append(
                BugHistory(
                    bug_id=bug.id,
                    actor="developer",
                    action="ASSIGNEE_CHANGED",
                    old_value=old_assignee,
                    new_value=new_assignee,
                )
            )

    # ----------------------------------------------------------
    # SAVE CHANGES
    # ----------------------------------------------------------

    if history_events:
        db.add_all(history_events)

    db.commit()
    db.refresh(bug)

    return {
        "id": bug.id,
        "title": bug.title,
        "status": bug.status,
        "assignee": bug.assignee,
        "message": "Bug updated successfully",
    }


# ============================================================
# BUG HISTORY
# ============================================================


@app.get("/bugs/{bug_id}/history")
def get_bug_history(
    bug_id: int,
    db: Session = Depends(get_db),
):
    bug = (
        db.query(Bug)
        .filter(Bug.id == bug_id)
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found",
        )

    history = (
        db.query(BugHistory)
        .filter(BugHistory.bug_id == bug_id)
        .order_by(BugHistory.created_at.desc())
        .all()
    )

    return [
        {
            "id": event.id,
            "actor": event.actor,
            "action": event.action,
            "old_value": event.old_value,
            "new_value": event.new_value,
            "created_at": event.created_at,
        }
        for event in history
    ]


# ============================================================
# GET COMMENTS
# ============================================================


@app.get("/bugs/{bug_id}/comments")
def get_comments(
    bug_id: int,
    db: Session = Depends(get_db),
):
    bug = (
        db.query(Bug)
        .filter(Bug.id == bug_id)
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found",
        )

    comments = (
        db.query(BugComment)
        .filter(BugComment.bug_id == bug_id)
        .order_by(BugComment.created_at.asc())
        .all()
    )

    return [
        {
            "id": comment.id,
            "author": comment.author,
            "content": comment.content,
            "created_at": comment.created_at,
        }
        for comment in comments
    ]


# ============================================================
# CREATE COMMENT
# ============================================================


@app.post("/bugs/{bug_id}/comments")
def create_comment(
    bug_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
):
    bug = (
        db.query(Bug)
        .filter(Bug.id == bug_id)
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found",
        )

    author = comment.author.strip()
    content = comment.content.strip()

    if not author or not content:
        raise HTTPException(
            status_code=400,
            detail="Author and comment content are required.",
        )

    # ----------------------------------------------------------
    # Save comment
    # ----------------------------------------------------------

    new_comment = BugComment(
        bug_id=bug_id,
        author=author,
        content=content,
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    # ----------------------------------------------------------
    # Record comment activity
    # ----------------------------------------------------------

    history = BugHistory(
        bug_id=bug_id,
        actor=author,
        action="COMMENT_ADDED",
        old_value=None,
        new_value=content,
    )

    db.add(history)
    db.commit()

    return {
        "id": new_comment.id,
        "author": new_comment.author,
        "content": new_comment.content,
        "created_at": new_comment.created_at,
    }