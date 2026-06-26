from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db, PlannerDayModel
from schemas import PlannerDay, PlannerTask

router = APIRouter()

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _row_to_schema(row: PlannerDayModel) -> PlannerDay:
    tasks = [PlannerTask(**t) for t in (row.tasks or [])]
    return PlannerDay(dayName=row.day_name, tasks=tasks)


def _ensure_days(db: Session):
    """Seed empty planner rows for all 7 days if they don't exist."""
    for day in DAYS:
        if not db.query(PlannerDayModel).filter_by(day_name=day).first():
            db.add(PlannerDayModel(day_name=day, tasks=[]))
    db.commit()


@router.get("", response_model=List[PlannerDay])
def get_planner(db: Session = Depends(get_db)):
    _ensure_days(db)
    rows = db.query(PlannerDayModel).all()
    rows.sort(key=lambda r: DAYS.index(r.day_name))
    return [_row_to_schema(r) for r in rows]


@router.put("/{day_name}", response_model=PlannerDay)
def update_day(day_name: str, body: PlannerDay, db: Session = Depends(get_db)):
    row = db.query(PlannerDayModel).filter_by(day_name=day_name).first()
    if not row:
        row = PlannerDayModel(day_name=day_name)
        db.add(row)
    row.tasks = [t.model_dump() for t in body.tasks]
    db.commit()
    db.refresh(row)
    return _row_to_schema(row)