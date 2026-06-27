import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from database import init_db
from routers import stats, logs, habits, planner, attempts
from dotenv import load_dotenv

load_dotenv()

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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router,   prefix="/api/stats",    tags=["Stats"])
app.include_router(logs.router,    prefix="/api/logs",     tags=["Study Logs"])
app.include_router(habits.router,  prefix="/api/habits",   tags=["Habits"])
app.include_router(planner.router, prefix="/api/planner",  tags=["Planner"])
app.include_router(attempts.router,prefix="/api/attempts", tags=["Attempts"])


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)