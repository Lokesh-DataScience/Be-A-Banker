from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./banker.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ── Models ──────────────────────────────────────────────────────────────────

class UserStatsModel(Base):
    __tablename__ = "user_stats"
    id              = Column(Integer, primary_key=True, default=1)
    xp              = Column(Integer, default=0)
    level           = Column(String, default="Beginner Banker")
    streak          = Column(Integer, default=0)
    streak_history  = Column(JSON, default=list)   # list of YYYY-MM-DD strings
    daily_study_hours_goal      = Column(Float, default=4.0)
    weekly_practice_hours_goal  = Column(Float, default=12.0)
    monthly_mock_tests_goal     = Column(Integer, default=5)
    target_exam_score           = Column(Float, default=78.0)
    preferred_theme             = Column(String, default="banking")
    accent_color                = Column(String, default="indigo")


class StudyLogModel(Base):
    __tablename__ = "study_logs"
    id               = Column(String, primary_key=True)
    date             = Column(String, nullable=False)   # YYYY-MM-DD
    subject          = Column(String, nullable=False)   # Quant | Reasoning | English
    topic            = Column(String, nullable=False)
    type             = Column(String, nullable=False)   # Video | Practice | Revision
    duration_minutes = Column(Integer, nullable=False)


class HabitModel(Base):
    __tablename__ = "habits"
    id               = Column(String, primary_key=True)
    name             = Column(String, nullable=False)
    subject          = Column(String, nullable=False)
    type             = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    completed_dates  = Column(JSON, default=list)       # list of YYYY-MM-DD
    is_custom        = Column(Boolean, default=False)


class PlannerDayModel(Base):
    __tablename__ = "planner_days"
    day_name = Column(String, primary_key=True)  # Monday … Sunday
    tasks    = Column(JSON, default=list)         # list of task dicts


class AttemptResultModel(Base):
    __tablename__ = "attempt_results"
    id                = Column(String, primary_key=True)
    test_id           = Column(String, nullable=False)
    test_title        = Column(String, nullable=False)
    date              = Column(String, nullable=False)
    score             = Column(Float, nullable=False)
    total_questions   = Column(Integer, nullable=False)
    attempted         = Column(Integer, nullable=False)
    correct           = Column(Integer, nullable=False)
    incorrect         = Column(Integer, nullable=False)
    time_taken_minutes= Column(Integer, nullable=False)
    section_breakdown = Column(JSON, default=dict)


# ── Helpers ──────────────────────────────────────────────────────────────────

def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()