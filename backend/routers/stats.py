from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, UserStatsModel
from schemas import UserStats

router = APIRouter()


def _row_to_schema(row: UserStatsModel) -> UserStats:
    return UserStats(
        xp=row.xp,
        level=row.level,
        streak=row.streak,
        streakHistory=row.streak_history or [],
        dailyStudyHoursGoal=row.daily_study_hours_goal,
        weeklyPracticeHoursGoal=row.weekly_practice_hours_goal,
        monthlyMockTestsGoal=row.monthly_mock_tests_goal,
        targetExamScore=row.target_exam_score,
        preferredTheme=row.preferred_theme,
        accentColor=row.accent_color,
    )


@router.get("", response_model=UserStats)
def get_stats(db: Session = Depends(get_db)):
    row = db.query(UserStatsModel).filter_by(id=1).first()
    if not row:
        # Auto-create default stats on first request
        row = UserStatsModel(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return _row_to_schema(row)


@router.put("", response_model=UserStats)
def update_stats(body: UserStats, db: Session = Depends(get_db)):
    row = db.query(UserStatsModel).filter_by(id=1).first()
    if not row:
        row = UserStatsModel(id=1)
        db.add(row)

    row.xp                          = body.xp
    row.level                       = body.level
    row.streak                      = body.streak
    row.streak_history              = body.streakHistory
    row.daily_study_hours_goal      = body.dailyStudyHoursGoal
    row.weekly_practice_hours_goal  = body.weeklyPracticeHoursGoal
    row.monthly_mock_tests_goal     = body.monthlyMockTestsGoal
    row.target_exam_score           = body.targetExamScore
    row.preferred_theme             = body.preferredTheme
    row.accent_color                = body.accentColor

    db.commit()
    db.refresh(row)
    return _row_to_schema(row)