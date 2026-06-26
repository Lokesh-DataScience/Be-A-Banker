from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, AttemptResultModel
from schemas import AttemptResult

router = APIRouter()


def _row_to_schema(row: AttemptResultModel) -> AttemptResult:
    return AttemptResult(
        id=row.id,
        testId=row.test_id,
        testTitle=row.test_title,
        date=row.date,
        score=row.score,
        totalQuestions=row.total_questions,
        attempted=row.attempted,
        correct=row.correct,
        incorrect=row.incorrect,
        timeTakenMinutes=row.time_taken_minutes,
        sectionBreakdown=row.section_breakdown or {},
    )


@router.get("", response_model=List[AttemptResult])
def get_attempts(db: Session = Depends(get_db)):
    return [_row_to_schema(r) for r in db.query(AttemptResultModel).order_by(AttemptResultModel.date.desc()).all()]


@router.post("", response_model=AttemptResult, status_code=201)
def add_attempt(body: AttemptResult, db: Session = Depends(get_db)):
    if db.query(AttemptResultModel).filter_by(id=body.id).first():
        raise HTTPException(status_code=409, detail="Attempt already exists.")
    row = AttemptResultModel(
        id=body.id,
        test_id=body.testId,
        test_title=body.testTitle,
        date=body.date,
        score=body.score,
        total_questions=body.totalQuestions,
        attempted=body.attempted,
        correct=body.correct,
        incorrect=body.incorrect,
        time_taken_minutes=body.timeTakenMinutes,
        section_breakdown={k: v.model_dump() for k, v in body.sectionBreakdown.items()},
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _row_to_schema(row)


@router.delete("/{attempt_id}", status_code=204)
def delete_attempt(attempt_id: str, db: Session = Depends(get_db)):
    row = db.query(AttemptResultModel).filter_by(id=attempt_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Attempt not found.")
    db.delete(row)
    db.commit()