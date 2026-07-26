// Storage Type Definitions for mytuta AI

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  userType: 'student' | 'teacher';
  school?: string;
  grade?: string;
  subjects?: string[];
  goals?: string[];
  bio?: string;
  avatar?: string;
  parentContact?: string;
  teachingExperience?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySession {
  id: string;
  userId?: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  contentType: 'notes' | 'flashcards' | 'quiz' | 'contest' | 'learning-path';
  contentId?: string;
  performance?: {
    accuracy?: number;
    questionsAnswered?: number;
    correctAnswers?: number;
    score?: number;
  };
  mood?: 'energetic' | 'focused' | 'tired' | 'stressed' | 'confident';
  notes?: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  userId?: string;
  subject: string;
  topic?: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  reviewCount: number;
  lastReviewed?: string;
  nextReview?: string;
  masteryLevel: number; // 0-100
  createdAt: string;
  updatedAt?: string;
}

export interface FlashcardSet {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  subject: string;
  flashcardIds: string[];
  totalCards: number;
  masteredCards: number;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  subject: string;
  topic?: string;
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  subject: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  totalPoints: number;
  createdAt: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  userId?: string;
  quizId: string;
  answers: number[];
  score: number;
  totalPoints: number;
  percentage: number;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  createdAt: string;
}

export interface LearningPath {
  id: string;
  userId?: string;
  subject: string;
  title: string;
  description?: string;
  totalSteps: number;
  completedSteps: number;
  steps: LearningStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  contentType: 'reading' | 'video' | 'practice' | 'assessment';
  contentId?: string;
  completed: boolean;
  completedAt?: string;
  feedback?: string;
}

export interface RevisionPlan {
  id: string;
  userId?: string;
  subject: string;
  topic: string;
  scheduledDates: string[];
  completedDates: string[];
  feedback?: RevisionFeedback[];
  createdAt: string;
  updatedAt?: string;
}

export interface RevisionFeedback {
  date: string;
  confidence: 'low' | 'medium' | 'high';
  notes: string;
  questionsNeedingReview?: string[];
}

export interface ProgressMetrics {
  userId?: string;
  subject: string;
  totalStudyTime: number; // in minutes
  sessionsCompleted: number;
  averageSessionDuration: number;
  streakDays: number;
  lastStudyDate: string;
  topicsStudied: string[];
  masteryLevels: { [topic: string]: number };
  weeklyGoalMinutes: number;
  weeklyProgress: number;
  updatedAt: string;
}

export interface UserPreferences {
  userId?: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    studyReminders: boolean;
    achievementAlerts: boolean;
    dailyGoals: boolean;
    emailNotifications: boolean;
  };
  studyPreferences: {
    sessionDuration: number; // in minutes
    breakDuration: number; // in minutes
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    studyDaysPerWeek: number;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    shareProgress: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId?: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'progress' | 'milestone' | 'social';
  earnedAt: string;
}

export interface Contest {
  id: string;
  userId?: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  participants: number;
  bestScore?: number;
  createdAt: string;
}

export interface ContestAttempt {
  id: string;
  userId?: string;
  contestId: string;
  answers: number[];
  score: number;
  totalPoints: number;
  percentage: number;
  rank?: number;
  startTime: string;
  endTime: string;
  duration: number;
  createdAt: string;
}

// Teacher-specific types
export interface TeacherClass {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  grade: string;
  studentIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface StudentProgress {
  studentId: string;
  classId: string;
  subject: string;
  overallProgress: number;
  recentActivities: StudySession[];
  strengths: string[];
  needsImprovement: string[];
  updatedAt: string;
}

export interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  contentType: 'quiz' | 'notes' | 'project';
  contentId?: string;
  submittedBy: string[];
  createdAt: string;
}

