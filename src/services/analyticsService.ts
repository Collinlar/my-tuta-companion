import { StudyAnalytics, proactiveAI } from './proactiveAI';
import { UserFeedbackService } from './userFeedbackService';
import { interestMapping } from './interestMapping';
import { retentionPatternAnalysis } from './retentionPatternAnalysis';
import { smartStorage } from './smartStorageService';

export interface ComprehensiveAnalytics {
  // Study Time Analytics
  totalStudyTime: number; // minutes
  sessionsCompleted: number;
  averageSessionLength: number;
  studyStreak: number;
  lastActiveDate: Date;
  
  // Subject Analytics
  subjectsStudied: { [subject: string]: number }; // minutes per subject
  subjectProgress: Array<{
    subject: string;
    timeSpent: number;
    sessions: number;
    averageScore: number;
    lastStudied: Date;
  }>;
  
  // Goal Progress
  goalProgress: { [goal: string]: number }; // percentage
  completedGoals: string[];
  
  // Learning Activities
  flashcardsCompleted: number;
  quizzesCompleted: number;
  contestsCompleted: number;
  learningPathsCompleted: number;
  revisionPlansCompleted: number;
  
  // Performance Metrics
  averageQuizScore: number;
  averageFlashcardAccuracy: number;
  difficultyProgression: { [subject: string]: 'improving' | 'stable' | 'struggling' };
  
  // Weekly Activity
  weeklyActivity: Array<{
    day: string;
    studyTime: number;
    quizzes: number;
    flashcards: number;
    sessions: number;
  }>;
  
  // Achievements
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earned: boolean;
    date?: string;
    progress: number;
    maxProgress: number;
  }>;
  
  // Recent Activity
  recentActivity: Array<{
    id: string;
    type: 'study' | 'quiz' | 'flashcard' | 'contest' | 'learning-path' | 'revision-plan';
    title: string;
    subject: string;
    timestamp: Date;
    duration?: number;
    score?: number;
  }>;
}

export class AnalyticsService {
  private proactiveAI: typeof proactiveAI;
  private userFeedback: UserFeedbackService;
  private interestMapping: typeof interestMapping;
  private retentionAnalysis: typeof retentionPatternAnalysis;
  private smartStorage: typeof smartStorage;

  constructor() {
    this.proactiveAI = proactiveAI;
    this.userFeedback = new UserFeedbackService();
    this.interestMapping = interestMapping;
    this.retentionAnalysis = retentionPatternAnalysis;
    this.smartStorage = smartStorage;
  }

  // Get comprehensive analytics for the user
  getComprehensiveAnalytics(): ComprehensiveAnalytics {
    const studyAnalytics = this.proactiveAI.getAnalytics();
    const studySessions = this.getStudySessions();
    const studyProgress = this.getAllStudyProgress();
    const quizResults = this.getQuizResults();
    const flashcardResults = this.getFlashcardResults();
    const interestData = this.interestMapping.getInterestData();
    const retentionData = this.retentionAnalysis.getRetentionData();
    
    // Calculate comprehensive metrics
    const totalStudyTime = this.calculateTotalStudyTime(studySessions, quizResults, flashcardResults);
    const sessionsCompleted = studySessions.filter(s => s.endTime).length;
    const averageSessionLength = this.calculateAverageSessionLength(studySessions);
    const studyStreak = this.calculateStudyStreak(studySessions, quizResults, flashcardResults);
    const lastActiveDate = this.getLastActiveDate(studySessions, quizResults, flashcardResults);
    
    // Subject analytics
    const subjectsStudied = this.calculateSubjectsStudied(studySessions, studyProgress, quizResults, flashcardResults);
    const subjectProgress = this.calculateSubjectProgress(subjectsStudied, studyProgress);
    
    // Goal progress
    const goalProgress = studyAnalytics?.goalProgress || {};
    const completedGoals = Object.entries(goalProgress)
      .filter(([_, progress]) => progress >= 100)
      .map(([goal, _]) => goal);
    
    // Learning activities
    const learningActivities = this.calculateLearningActivities(studyProgress, quizResults, flashcardResults);
    
    // Performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(studyProgress, retentionData, quizResults, flashcardResults);
    
    // Weekly activity
    const weeklyActivity = this.calculateWeeklyActivity(studySessions, quizResults, flashcardResults);
    
    // Achievements
    const achievements = this.calculateAchievements(studySessions, studyProgress, learningActivities, quizResults, flashcardResults);
    
    // Recent activity
    const recentActivity = this.calculateRecentActivity(studySessions, studyProgress, quizResults, flashcardResults);
    
    return {
      totalStudyTime,
      sessionsCompleted,
      averageSessionLength,
      studyStreak,
      lastActiveDate,
      subjectsStudied,
      subjectProgress,
      goalProgress,
      completedGoals,
      ...learningActivities,
      ...performanceMetrics,
      weeklyActivity,
      achievements,
      recentActivity
    };
  }

  // Get study sessions from localStorage
  private getStudySessions(): any[] {
    try {
      const sessions = localStorage.getItem('mytuta_study_sessions');
      return sessions ? JSON.parse(sessions).map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading study sessions:', error);
      return [];
    }
  }

  // Get all study progress from localStorage
  private getAllStudyProgress(): any[] {
    try {
      const progress = localStorage.getItem('mytuta_study_progress');
      return progress ? JSON.parse(progress).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      })) : [];
    } catch (error) {
      console.error('Error loading study progress:', error);
      return [];
    }
  }

  // Get quiz results from localStorage
  private getQuizResults(): any[] {
    try {
      const results = localStorage.getItem('quizResults');
      return results ? JSON.parse(results).map((r: any) => ({
        ...r,
        completedAt: new Date(r.completedAt)
      })) : [];
    } catch (error) {
      console.error('Error loading quiz results:', error);
      return [];
    }
  }

  // Get flashcard results from localStorage
  private getFlashcardResults(): any[] {
    try {
      const results = localStorage.getItem('flashcardResults');
      return results ? JSON.parse(results).map((r: any) => ({
        ...r,
        completedAt: new Date(r.completedAt)
      })) : [];
    } catch (error) {
      console.error('Error loading flashcard results:', error);
      return [];
    }
  }

  // Calculate total study time in minutes
  private calculateTotalStudyTime(sessions: any[], quizResults: any[], flashcardResults: any[]): number {
    let total = sessions.reduce((sum, session) => {
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        return sum + duration;
      }
      return sum;
    }, 0);

    // Add quiz time (timeSpent is in seconds, convert to minutes)
    total += quizResults.reduce((sum, quiz) => sum + (quiz.timeSpent || 0) / 60, 0);

    // Add flashcard time (timeSpent is in seconds, convert to minutes)
    total += flashcardResults.reduce((sum, flashcard) => sum + (flashcard.timeSpent || 0) / 60, 0);

    return total;
  }

  // Calculate average session length
  private calculateAverageSessionLength(sessions: any[]): number {
    const completedSessions = sessions.filter(s => s.endTime);
    if (completedSessions.length === 0) return 0;
    
    const totalTime = completedSessions.reduce((total, session) => {
      const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      return total + duration;
    }, 0);
    
    return totalTime / completedSessions.length;
  }

  // Calculate study streak
  private calculateStudyStreak(sessions: any[], quizResults: any[], flashcardResults: any[]): number {
    // Combine all activity dates
    const allDates: Date[] = [];
    
    sessions.filter(s => s.endTime).forEach(s => allDates.push(s.startTime));
    quizResults.forEach(q => allDates.push(q.completedAt));
    flashcardResults.forEach(f => allDates.push(f.completedAt));
    
    if (allDates.length === 0) return 0;
    
    const sortedDates = allDates.sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const activityDate = new Date(sortedDates[i]);
      activityDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  }

  // Get last active date
  private getLastActiveDate(sessions: any[], quizResults: any[], flashcardResults: any[]): Date {
    const allDates: Date[] = [];
    
    sessions.filter(s => s.endTime).forEach(s => allDates.push(s.startTime));
    quizResults.forEach(q => allDates.push(q.completedAt));
    flashcardResults.forEach(f => allDates.push(f.completedAt));
    
    if (allDates.length === 0) return new Date();
    
    return new Date(Math.max(...allDates.map(d => d.getTime())));
  }

  // Calculate subjects studied
  private calculateSubjectsStudied(sessions: any[], progress: any[], quizResults: any[], flashcardResults: any[]): { [subject: string]: number } {
    const subjectTime: { [subject: string]: number } = {};
    
    // From sessions
    sessions.forEach(session => {
      if (session.endTime && session.subject) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        subjectTime[session.subject] = (subjectTime[session.subject] || 0) + duration;
      }
    });
    
    // From progress
    progress.forEach(p => {
      if (p.subject) {
        subjectTime[p.subject] = (subjectTime[p.subject] || 0) + 30; // Estimate 30 min per progress entry
      }
    });

    // From quiz results
    quizResults.forEach(quiz => {
      if (quiz.subject && quiz.timeSpent) {
        const duration = quiz.timeSpent / 60; // Convert seconds to minutes
        subjectTime[quiz.subject] = (subjectTime[quiz.subject] || 0) + duration;
      }
    });

    // From flashcard results
    flashcardResults.forEach(flashcard => {
      if (flashcard.subject && flashcard.timeSpent) {
        const duration = flashcard.timeSpent / 60; // Convert seconds to minutes
        subjectTime[flashcard.subject] = (subjectTime[flashcard.subject] || 0) + duration;
      }
    });
    
    return subjectTime;
  }

  // Calculate subject progress
  private calculateSubjectProgress(subjectsStudied: { [subject: string]: number }, progress: any[]): Array<{
    subject: string;
    timeSpent: number;
    sessions: number;
    averageScore: number;
    lastStudied: Date;
  }> {
    return Object.entries(subjectsStudied).map(([subject, timeSpent]) => {
      const subjectProgress = progress.filter(p => p.subject === subject);
      const sessions = subjectProgress.length;
      const averageScore = this.calculateAverageScore(subjectProgress);
      const lastStudied = subjectProgress.length > 0 
        ? new Date(Math.max(...subjectProgress.map(p => p.updatedAt.getTime())))
        : new Date();
      
      return {
        subject,
        timeSpent,
        sessions,
        averageScore,
        lastStudied
      };
    });
  }

  // Calculate average score from progress data
  private calculateAverageScore(progress: any[]): number {
    if (progress.length === 0) return 0;
    
    const scores = progress
      .map(p => p.studyToolScores)
      .filter(scores => scores && Object.keys(scores).length > 0)
      .map(scores => Object.values(scores))
      .flat()
      .filter(score => typeof score === 'number');
    
    if (scores.length === 0) return 0;
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // Calculate learning activities
  private calculateLearningActivities(progress: any[], quizResults: any[], flashcardResults: any[]): {
    flashcardsCompleted: number;
    quizzesCompleted: number;
    contestsCompleted: number;
    learningPathsCompleted: number;
    revisionPlansCompleted: number;
  } {
    let flashcardsCompleted = flashcardResults.length; // Count actual flashcard sessions
    let quizzesCompleted = quizResults.length; // Count actual quiz sessions
    let contestsCompleted = 0;
    let learningPathsCompleted = 0;
    let revisionPlansCompleted = 0;
    
    progress.forEach(p => {
      if (p.completedActivities) {
        p.completedActivities.forEach((activity: string) => {
          if (activity.includes('contest')) contestsCompleted++;
          if (activity.includes('learning-path')) learningPathsCompleted++;
          if (activity.includes('revision-plan')) revisionPlansCompleted++;
        });
      }
    });
    
    return {
      flashcardsCompleted,
      quizzesCompleted,
      contestsCompleted,
      learningPathsCompleted,
      revisionPlansCompleted
    };
  }

  // Calculate performance metrics
  private calculatePerformanceMetrics(progress: any[], retentionData: any[], quizResults: any[], flashcardResults: any[]): {
    averageQuizScore: number;
    averageFlashcardAccuracy: number;
    difficultyProgression: { [subject: string]: 'improving' | 'stable' | 'struggling' };
  } {
    const quizScores: number[] = [];
    const flashcardScores: number[] = [];
    const difficultyProgression: { [subject: string]: 'improving' | 'stable' | 'struggling' } = {};
    
    // Get scores from actual quiz results
    quizResults.forEach(quiz => {
      if (quiz.percentage !== undefined) {
        quizScores.push(quiz.percentage);
      }
    });

    // Get scores from actual flashcard results
    flashcardResults.forEach(flashcard => {
      if (flashcard.accuracy !== undefined) {
        flashcardScores.push(flashcard.accuracy);
      }
    });

    // Also check progress data for any additional scores
    progress.forEach(p => {
      if (p.studyToolScores) {
        Object.entries(p.studyToolScores).forEach(([tool, score]) => {
          if (typeof score === 'number') {
            if (tool.includes('quiz')) {
              quizScores.push(score);
            } else if (tool.includes('flashcard')) {
              flashcardScores.push(score);
            }
          }
        });
      }
    });
    
    const averageQuizScore = quizScores.length > 0 
      ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
      : 0;
    
    const averageFlashcardAccuracy = flashcardScores.length > 0 
      ? flashcardScores.reduce((sum, score) => sum + score, 0) / flashcardScores.length 
      : 0;
    
    // Calculate difficulty progression based on recent performance
    Object.keys(difficultyProgression).forEach(subject => {
      const subjectScores = quizScores; // Simplified - would need more complex logic
      if (subjectScores.length >= 3) {
        const recent = subjectScores.slice(-3);
        const older = subjectScores.slice(-6, -3);
        if (recent.length >= 3 && older.length >= 3) {
          const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
          const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
          
          if (recentAvg > olderAvg + 5) {
            difficultyProgression[subject] = 'improving';
          } else if (recentAvg < olderAvg - 5) {
            difficultyProgression[subject] = 'struggling';
          } else {
            difficultyProgression[subject] = 'stable';
          }
        }
      }
    });
    
    return {
      averageQuizScore,
      averageFlashcardAccuracy,
      difficultyProgression
    };
  }

  // Calculate weekly activity
  private calculateWeeklyActivity(sessions: any[], quizResults: any[], flashcardResults: any[]): Array<{
    day: string;
    studyTime: number;
    quizzes: number;
    flashcards: number;
    sessions: number;
  }> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    return days.map((day, index) => {
      const dayStart = new Date(weekStart);
      dayStart.setDate(dayStart.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      const dayQuizzes = quizResults.filter(q => {
        const quizDate = new Date(q.completedAt);
        return quizDate >= dayStart && quizDate < dayEnd;
      });

      const dayFlashcards = flashcardResults.filter(f => {
        const flashcardDate = new Date(f.completedAt);
        return flashcardDate >= dayStart && flashcardDate < dayEnd;
      });
      
      let studyTime = daySessions.reduce((total, session) => {
        if (session.endTime) {
          const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
          return total + duration;
        }
        return total;
      }, 0);

      // Add quiz time
      studyTime += dayQuizzes.reduce((total, quiz) => total + (quiz.timeSpent || 0) / 60, 0);

      // Add flashcard time
      studyTime += dayFlashcards.reduce((total, flashcard) => total + (flashcard.timeSpent || 0) / 60, 0);
      
      return {
        day,
        studyTime: Math.round(studyTime),
        quizzes: dayQuizzes.length,
        flashcards: dayFlashcards.length,
        sessions: daySessions.length
      };
    });
  }

  // Calculate achievements
  private calculateAchievements(
    sessions: any[], 
    progress: any[], 
    activities: any,
    quizResults: any[],
    flashcardResults: any[]
  ): Array<{
    id: string;
    title: string;
    description: string;
    earned: boolean;
    date?: string;
    progress: number;
    maxProgress: number;
  }> {
    const achievements = [
      {
        id: 'first-session',
        title: 'Getting Started',
        description: 'Complete your first study session',
        maxProgress: 1,
        earned: sessions.length > 0,
        progress: Math.min(sessions.length, 1),
        date: sessions.length > 0 ? sessions[0].startTime.toLocaleDateString() : undefined
      },
      {
        id: 'study-streak-7',
        title: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        maxProgress: 7,
        earned: this.calculateStudyStreak(sessions, quizResults, flashcardResults) >= 7,
        progress: Math.min(this.calculateStudyStreak(sessions, quizResults, flashcardResults), 7)
      },
      {
        id: 'quiz-master',
        title: 'Quiz Master',
        description: 'Complete 10 quizzes',
        maxProgress: 10,
        earned: activities.quizzesCompleted >= 10,
        progress: Math.min(activities.quizzesCompleted, 10)
      },
      {
        id: 'flashcard-champion',
        title: 'Flashcard Champion',
        description: 'Complete 50 flashcards',
        maxProgress: 50,
        earned: activities.flashcardsCompleted >= 50,
        progress: Math.min(activities.flashcardsCompleted, 50)
      },
      {
        id: 'time-master',
        title: 'Time Master',
        description: 'Study for 10 hours total',
        maxProgress: 600, // 10 hours in minutes
        earned: this.calculateTotalStudyTime(sessions, [], []) >= 600,
        progress: Math.min(this.calculateTotalStudyTime(sessions, [], []), 600)
      }
    ];
    
    return achievements;
  }

  // Calculate recent activity
  private calculateRecentActivity(sessions: any[], progress: any[], quizResults: any[], flashcardResults: any[]): Array<{
    id: string;
    type: 'study' | 'quiz' | 'flashcard' | 'contest' | 'learning-path' | 'revision-plan';
    title: string;
    subject: string;
    timestamp: Date;
    duration?: number;
    score?: number;
  }> {
    const activities: any[] = [];
    
    // Add sessions
    sessions.forEach(session => {
      activities.push({
        id: `session-${session.id || Math.random()}`,
        type: 'study',
        title: `Study Session - ${session.subject || 'General'}`,
        subject: session.subject || 'General',
        timestamp: session.startTime,
        duration: session.endTime ? 
          Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)) : 
          undefined
      });
    });

    // Add quiz results
    quizResults.forEach(quiz => {
      activities.push({
        id: quiz.id,
        type: 'quiz',
        title: `Quiz - ${quiz.topic || 'General'}`,
        subject: quiz.subject || 'General',
        timestamp: quiz.completedAt,
        duration: Math.round((quiz.timeSpent || 0) / 60),
        score: quiz.percentage
      });
    });

    // Add flashcard results
    flashcardResults.forEach(flashcard => {
      activities.push({
        id: flashcard.id,
        type: 'flashcard',
        title: `Flashcards - ${flashcard.topic || 'General'}`,
        subject: flashcard.subject || 'General',
        timestamp: flashcard.completedAt,
        duration: Math.round((flashcard.timeSpent || 0) / 60),
        score: flashcard.accuracy
      });
    });
    
    // Add progress activities
    progress.forEach(p => {
      if (p.completedActivities) {
        p.completedActivities.forEach((activity: string) => {
          let type: any = 'study';
          if (activity.includes('contest')) type = 'contest';
          else if (activity.includes('learning-path')) type = 'learning-path';
          else if (activity.includes('revision-plan')) type = 'revision-plan';
          
          activities.push({
            id: `activity-${activity}`,
            type,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${p.topic}`,
            subject: p.subject || 'General',
            timestamp: p.updatedAt,
            score: p.studyToolScores?.[activity]
          });
        });
      }
    });
    
    // Sort by timestamp (most recent first) and return last 10
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }
}

export const analyticsService = new AnalyticsService();
