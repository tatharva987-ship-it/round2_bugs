from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Bug(Base):
    __tablename__ = "bugs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    expected: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    actual: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(50),
        default="Medium",
        nullable=False,
    )

    priority: Mapped[str] = mapped_column(
        String(50),
        default="P2",
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        default="Application Error",
        nullable=False,
    )

    reproduction_steps: Mapped[list[str] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    root_cause: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    suggested_fix: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    test_cases: Mapped[list[str] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    embedding: Mapped[list[float] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    suggested_test: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Reported",
        nullable=False,
    )

    assignee: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )