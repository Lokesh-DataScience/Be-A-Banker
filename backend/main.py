from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import uvicorn

from database import init_db, get_db
from dependencies import get_current_user
from routers import stats, logs, habits, planner, attempts, reset


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Be A Banker API",
    description="Backend for Be A Banker exam prep app",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Capacitor Android uses capacitor:// scheme
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router,   prefix="/api/stats",    tags=["Stats"])
app.include_router(logs.router,    prefix="/api/logs",     tags=["Study Logs"])
app.include_router(habits.router,  prefix="/api/habits",   tags=["Habits"])
app.include_router(planner.router, prefix="/api/planner",  tags=["Planner"])
app.include_router(attempts.router,prefix="/api/attempts", tags=["Attempts"])
app.include_router(reset.router,   prefix="/api/reset",    tags=["Reset"])


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


@app.delete("/api/reset", status_code=204)
def reset_all_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from database import StudyLogModel, HabitModel, PlannerDayModel, AttemptResultModel, UserStatsModel
    uid = current_user.id
    db.query(StudyLogModel).filter_by(user_id=uid).delete()
    db.query(HabitModel).filter_by(user_id=uid).delete()
    db.query(PlannerDayModel).filter_by(user_id=uid).delete()
    db.query(AttemptResultModel).filter_by(user_id=uid).delete()
    db.query(UserStatsModel).filter_by(user_id=uid).delete()
    db.commit()