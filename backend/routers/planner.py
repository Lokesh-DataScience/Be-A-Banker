from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db, PlannerDayModel, UserModel
from dependencies import get_current_user
from schemas import PlannerDay, PlannerTask

router = APIRouter()
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _row_to_schema(row: PlannerDayModel) -> PlannerDay:
    return PlannerDay(dayName=row.day_name, tasks=[PlannerTask(**t) for t in (row.tasks or [])])


def _day_pk(user_id: str, day_name: str) -> str:
    return f"{user_id}:{day_name}"


def _ensure_days(db: Session, user_id: str):
    for day in DAYS:
        if not db.query(PlannerDayModel).filter_by(id=_day_pk(user_id, day)).first():
            db.add(PlannerDayModel(id=_day_pk(user_id, day), user_id=user_id, day_name=day, tasks=[]))
    db.commit()


@router.get("", response_model=List[PlannerDay])
def get_planner(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    _ensure_days(db, current_user.id)
    rows = db.query(PlannerDayModel).filter_by(user_id=current_user.id).all()
    rows.sort(key=lambda r: DAYS.index(r.day_name))
    return [_row_to_schema(r) for r in rows]


@router.put("/{day_name}", response_model=PlannerDay)
def update_day(
    day_name: str,
    body: PlannerDay,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    row = db.query(PlannerDayModel).filter_by(id=_day_pk(current_user.id, day_name)).first()
    if not row:
        row = PlannerDayModel(id=_day_pk(current_user.id, day_name), user_id=current_user.id, day_name=day_name)
        db.add(row)
    row.tasks = [t.model_dump() for t in body.tasks]
    db.commit()
    db.refresh(row)
    return _row_to_schema(row)