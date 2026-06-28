from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import (
    get_db, UserModel,
    UserStatsModel, StudyLogModel, HabitModel,
    PlannerDayModel, AttemptResultModel,
)
from dependencies import get_current_user

router = APIRouter()


@router.delete("", status_code=200)
def reset_all_data(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    uid = current_user.id

    # Delete all user data
    db.query(AttemptResultModel).filter_by(user_id=uid).delete()
    db.query(PlannerDayModel).filter_by(user_id=uid).delete()
    db.query(HabitModel).filter_by(user_id=uid).delete()
    db.query(StudyLogModel).filter_by(user_id=uid).delete()
    db.query(UserStatsModel).filter_by(user_id=uid).delete()

    # Recreate default stats
    db.add(UserStatsModel(id=uid, user_id=uid))

    db.commit()

    return {"message": "All data reset successfully."}