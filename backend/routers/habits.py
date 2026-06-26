from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, HabitModel
from schemas import Habit, HabitCompletionUpdate

router = APIRouter()


def _row_to_schema(row: HabitModel) -> Habit:
    return Habit(
        id=row.id,
        name=row.name,
        subject=row.subject,
        type=row.type,
        durationMinutes=row.duration_minutes,
        completedDates=row.completed_dates or [],
        isCustom=row.is_custom or False,
    )


@router.get("", response_model=List[Habit])
def get_habits(db: Session = Depends(get_db)):
    return [_row_to_schema(r) for r in db.query(HabitModel).all()]


@router.post("", response_model=Habit, status_code=201)
def create_habit(body: Habit, db: Session = Depends(get_db)):
    if db.query(HabitModel).filter_by(id=body.id).first():
        raise HTTPException(status_code=409, detail="Habit already exists.")
    row = HabitModel(
        id=body.id,
        name=body.name,
        subject=body.subject,
        type=body.type,
        duration_minutes=body.durationMinutes,
        completed_dates=body.completedDates,
        is_custom=body.isCustom,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _row_to_schema(row)


@router.patch("/{habit_id}/complete", response_model=Habit)
def update_completion(habit_id: str, body: HabitCompletionUpdate, db: Session = Depends(get_db)):
    row = db.query(HabitModel).filter_by(id=habit_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Habit not found.")
    row.completed_dates = body.completedDates
    db.commit()
    db.refresh(row)
    return _row_to_schema(row)


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: str, db: Session = Depends(get_db)):
    row = db.query(HabitModel).filter_by(id=habit_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Habit not found.")
    db.delete(row)
    db.commit()