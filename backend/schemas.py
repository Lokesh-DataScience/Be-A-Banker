from pydantic import BaseModel
from typing import Optional, Dict, List


class UserStats(BaseModel):
    xp: int = 0
    level: str = "Beginner Banker"
    streak: int = 0
    streakHistory: List[str] = []
    dailyStudyHoursGoal: float = 4.0
    weeklyPracticeHoursGoal: float = 12.0
    monthlyMockTestsGoal: int = 5
    targetExamScore: float = 78.0
    preferredTheme: str = "banking"
    accentColor: str = "indigo"


class StudyLog(BaseModel):
    id: str
    date: str
    subject: str
    topic: str
    type: str
    durationMinutes: int


class HabitCompletionUpdate(BaseModel):
    completedDates: List[str]


class Habit(BaseModel):
    id: str
    name: str
    subject: str
    type: str
    durationMinutes: int
    completedDates: List[str] = []
    isCustom: bool = False


class PlannerTask(BaseModel):
    id: str
    task: str
    subject: str
    durationMinutes: int
    completed: bool


class PlannerDay(BaseModel):
    dayName: str
    tasks: List[PlannerTask]


class SectionBreakdown(BaseModel):
    score: float
    correct: int
    incorrect: int
    attempted: int


class AttemptResult(BaseModel):
    id: str
    testId: str
    testTitle: str
    date: str
    score: float
    totalQuestions: int
    attempted: int
    correct: int
    incorrect: int
    timeTakenMinutes: int
    sectionBreakdown: Dict[str, SectionBreakdown]