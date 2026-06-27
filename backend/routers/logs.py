from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, StudyLogModel, UserModel
from dependencies import get_current_user
from schemas import StudyLog

router = APIRouter()


def _row_to_schema(row: StudyLogModel) -> StudyLog:
    return StudyLog(
        id=row.id, date=row.date, subject=row.subject,
        topic=row.topic, type=row.type, durationMinutes=row.duration_minutes,
    )


@router.get("", response_model=List[StudyLog])
def get_logs(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    rows = (
        db.query(StudyLogModel)
        .filter_by(user_id=current_user.id)
        .order_by(StudyLogModel.date.desc())
        .all()
    )
    return [_row_to_schema(r) for r in rows]


@router.post("", response_model=StudyLog, status_code=201)
def add_log(
    body: StudyLog,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if db.query(StudyLogModel).filter_by(id=body.id).first():
        raise HTTPException(status_code=409, detail="Log already exists.")
    row = StudyLogModel(
        id=body.id, user_id=current_user.id, date=body.date,
        subject=body.subject, topic=body.topic,
        type=body.type, duration_minutes=body.durationMinutes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _row_to_schema(row)


@router.delete("/{log_id}", status_code=204)
def delete_log(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    row = db.query(StudyLogModel).filter_by(id=log_id, user_id=current_user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Log not found.")
    db.delete(row)
    db.commit()