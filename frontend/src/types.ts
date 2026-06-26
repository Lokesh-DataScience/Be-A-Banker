export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  subject: 'Quant' | 'Reasoning' | 'English';
  topic: string;
  type: 'Video' | 'Practice' | 'Revision';
  durationMinutes: number;
}

export interface SpeedMathChallenge {
  question: string;
  answer: number;
  type: string;
}

export interface VocabularyWord {
  word: string;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface FormulaCard {
  title: string;
  category: string;
  formula: string;
  description: string;
  example: string;
}

export interface PuzzleChallenge {
  title: string;
  description: string;
  category: 'Linear Arrangement' | 'Circular Arrangement' | 'Floor Puzzle' | 'Box Puzzle' | 'Scheduling';
  dataPoints: string[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface MockTest {
  id: string;
  title: string;
  type: 'Full-Length' | 'Sectional' | 'Topic';
  subject?: 'Quant' | 'Reasoning' | 'English';
  durationMinutes: number;
  totalQuestions: number;
  sections: {
    name: 'Quant' | 'Reasoning' | 'English';
    questionsCount: number;
    durationMinutes: number;
    questions?: {
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  }[];
}

export interface AttemptResult {
  id: string;
  testId: string;
  testTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  timeTakenMinutes: number;
  sectionBreakdown: {
    [key: string]: {
      score: number;
      correct: number;
      incorrect: number;
      attempted: number;
    };
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  xpValue: number;
  iconName: string;
  category: string;
}

export interface Habit {
  id: string;
  name: string;
  subject: 'Quant' | 'Reasoning' | 'English' | 'General';
  type: 'Video' | 'Practice' | 'Revision';
  durationMinutes: number;
  completedDates: string[]; // dates of completion YYYY-MM-DD
  isCustom?: boolean;
}

export interface PlannerDay {
  dayName: string; // e.g. Mon, Tue, etc.
  tasks: {
    id: string;
    task: string;
    subject: 'Quant' | 'Reasoning' | 'English' | 'Mock';
    durationMinutes: number;
    completed: boolean;
  }[];
}

export interface UserStats {
  xp: number;
  level: 'Beginner Banker' | 'Clerk Aspirant' | 'Probationary Officer' | 'Banking Expert' | 'Future Banker';
  streak: number;
  streakHistory: string[]; // YYYY-MM-DD
  dailyStudyHoursGoal: number;
  weeklyPracticeHoursGoal: number;
  monthlyMockTestsGoal: number;
  targetExamScore: number;
  preferredTheme: 'light' | 'dark' | 'banking';
  accentColor: string;
}
