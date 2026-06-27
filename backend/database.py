import os
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, JSON, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./banker.db")

# PostgreSQL needs no check_same_thread; SQLite does
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

DEFAULT_USER_ID = "demo-user"  # kept for reference only — no longer used in routers


# ── Models ────────────────────────────────────────────────────────────────────

class UserModel(Base):
    __tablename__ = "users"

    id    = Column(String, primary_key=True)   # will become Supabase auth UID in Phase 4
    name  = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)

    # relationships (optional — useful for eager loading later)
    stats    = relationship("UserStatsModel",    back_populates="user", uselist=False)
    logs     = relationship("StudyLogModel",     back_populates="user")
    habits   = relationship("HabitModel",        back_populates="user")
    planner  = relationship("PlannerDayModel",   back_populates="user")
    attempts = relationship("AttemptResultModel",back_populates="user")


class UserStatsModel(Base):
    __tablename__ = "user_stats"

    id      = Column(String, primary_key=True)  # same as user_id (1-to-1)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    xp                         = Column(Integer, default=0)
    level                      = Column(String,  default="Beginner Banker")
    streak                     = Column(Integer, default=0)
    streak_history             = Column(JSON,    default=list)
    daily_study_hours_goal     = Column(Float,   default=4.0)
    weekly_practice_hours_goal = Column(Float,   default=12.0)
    monthly_mock_tests_goal    = Column(Integer, default=5)
    target_exam_score          = Column(Float,   default=78.0)
    preferred_theme            = Column(String,  default="banking")
    accent_color               = Column(String,  default="indigo")

    user = relationship("UserModel", back_populates="stats")


class StudyLogModel(Base):
    __tablename__ = "study_logs"

    id               = Column(String,  primary_key=True)
    user_id          = Column(String,  ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date             = Column(String,  nullable=False)
    subject          = Column(String,  nullable=False)
    topic            = Column(String,  nullable=False)
    type             = Column(String,  nullable=False)
    duration_minutes = Column(Integer, nullable=False)

    user = relationship("UserModel", back_populates="logs")


class HabitModel(Base):
    __tablename__ = "habits"

    id               = Column(String,  primary_key=True)
    user_id          = Column(String,  ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name             = Column(String,  nullable=False)
    subject          = Column(String,  nullable=False)
    type             = Column(String,  nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    completed_dates  = Column(JSON,    default=list)
    is_custom        = Column(Boolean, default=False)

    user = relationship("UserModel", back_populates="habits")


class PlannerDayModel(Base):
    __tablename__ = "planner_days"

    id       = Column(String, primary_key=True)  # f"{user_id}:{day_name}"
    user_id  = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_name = Column(String, nullable=False)
    tasks    = Column(JSON,   default=list)

    user = relationship("UserModel", back_populates="planner")


class AttemptResultModel(Base):
    __tablename__ = "attempt_results"

    id                 = Column(String,  primary_key=True)
    user_id            = Column(String,  ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id            = Column(String,  nullable=False)
    test_title         = Column(String,  nullable=False)
    date               = Column(String,  nullable=False)
    score              = Column(Float,   nullable=False)
    total_questions    = Column(Integer, nullable=False)
    attempted          = Column(Integer, nullable=False)
    correct            = Column(Integer, nullable=False)
    incorrect          = Column(Integer, nullable=False)
    time_taken_minutes = Column(Integer, nullable=False)
    section_breakdown  = Column(JSON,    default=dict)

    user = relationship("UserModel", back_populates="attempts")


# ── Helpers ───────────────────────────────────────────────────────────────────

def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()