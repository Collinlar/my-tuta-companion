import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface StudyPattern {
  preferredStudyTimes: string[];
  averageSessionLength: number; // in minutes
  mostProductiveSubjects: string[];
  strugglingSubjects: string[];
  studyStreak: number;
  lastStudyDate: Date;
  weeklyGoal: number; // hours per week
  weeklyProgress: number; // hours studied this week
}

export interface ProactiveSuggestion {
  id: string;
  type: 'reminder' | 'encouragement' | 'break' | 'study_plan' | 'difficulty_adjustment' | 'goal_progress';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action?: {
    type: string;
    label: string;
    data?: any;
  };
  timestamp: Date;
  expiresAt?: Date;
}

export interface StudyAnalytics {
  totalStudyTime: number; // minutes
  sessionsCompleted: number;
  averageSessionLength: number;
  subjectsStudied: { [subject: string]: number }; // minutes per subject
  difficultyProgression: { [subject: string]: 'improving' | 'stable' | 'struggling' };
  goalProgress: { [goal: string]: number }; // percentage
  studyStreak: number;
  lastActiveDate: Date;
}

export class ProactiveAIService {
  private studyPatterns: StudyPattern | null = null;
  private userProfile: UserProfile | null = null;
  private studySessions: StudySession[] = [];
  private suggestions: ProactiveSuggestion[] = [];
  private analytics: StudyAnalytics | null = null;

  constructor() {
    this.loadUserData();
    this.initializeStudyPatterns();
  }

  private loadUserData(): void {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
        // Ensure userProfile has required properties
        if (!this.userProfile.subjects) {
          this.userProfile.subjects = [];
        }
        if (!this.userProfile.goals) {
          this.userProfile.goals = [];
        }
      }

      const sessions = localStorage.getItem('studySessions');
      if (sessions) {
        this.studySessions = JSON.parse(sessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
      }

      const patterns = localStorage.getItem('studyPatterns');
      if (patterns) {
        this.studyPatterns = {
          ...JSON.parse(patterns),
          lastStudyDate: new Date(JSON.parse(patterns).lastStudyDate)
        };
      }
    } catch (error) {
      console.error('Error loading user data for proactive AI:', error);
    }
  }

  private initializeStudyPatterns(): void {
    if (!this.userProfile) return;

    this.studyPatterns = {
      preferredStudyTimes: ['09:00', '14:00', '19:00'], // Default times
      averageSessionLength: 45, // Default 45 minutes
      mostProductiveSubjects: this.userProfile.subjects.slice(0, 2),
      strugglingSubjects: [],
      studyStreak: 0,
      lastStudyDate: new Date(),
      weeklyGoal: 10, // 10 hours per week
      weeklyProgress: 0
    };
  }

  // Analyze study patterns and generate suggestions
  async analyzeAndSuggest(): Promise<ProactiveSuggestion[]> {
    if (!this.userProfile || !this.studyPatterns) return [];

    this.updateAnalytics();
    const suggestions: ProactiveSuggestion[] = [];

    // Check for study streak maintenance
    const streakSuggestion = this.checkStudyStreak();
    if (streakSuggestion) suggestions.push(streakSuggestion);

    // Check for break reminders
    const breakSuggestion = this.checkBreakNeeded();
    if (breakSuggestion) suggestions.push(breakSuggestion);

    // Check for goal progress
    const goalSuggestions = this.checkGoalProgress();
    suggestions.push(...goalSuggestions);

    // Check for difficulty adjustments
    const difficultySuggestions = this.checkDifficultyAdjustments();
    suggestions.push(...difficultySuggestions);

    // Check for study time optimization
    const timeSuggestions = this.checkStudyTimeOptimization();
    suggestions.push(...timeSuggestions);

    // Check for subject balance
    const balanceSuggestions = this.checkSubjectBalance();
    suggestions.push(...balanceSuggestions);

    this.suggestions = suggestions;
    this.saveSuggestions();
    return suggestions;
  }

  // Check if user needs to maintain study streak
  private checkStudyStreak(): ProactiveSuggestion | null {
    if (!this.studyPatterns) return null;

    const daysSinceLastStudy = Math.floor(
      (Date.now() - this.studyPatterns.lastStudyDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastStudy >= 2) {
      return {
        id: `streak-${Date.now()}`,
        type: 'reminder',
        title: 'Keep Your Streak Going! 🔥',
        message: `You haven't studied in ${daysSinceLastStudy} days. Your ${this.studyPatterns.studyStreak}-day streak is at risk! Ready to get back on track?`,
        priority: 'high',
        action: {
          type: 'start_study',
          label: 'Start Studying Now',
          data: { subject: this.studyPatterns.mostProductiveSubjects[0] }
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
      };
    }

    return null;
  }

  // Check if user needs a break
  private checkBreakNeeded(): ProactiveSuggestion | null {
    const currentSession = aiCompanionService.getCurrentSession();
    if (!currentSession) return null;

    const sessionDuration = Date.now() - currentSession.startTime.getTime();
    const sessionMinutes = Math.floor(sessionDuration / (1000 * 60));

    if (sessionMinutes >= 60) { // 1 hour
      return {
        id: `break-${Date.now()}`,
        type: 'break',
        title: 'Time for a Break! ☕',
        message: `You've been studying for ${sessionMinutes} minutes. Research shows that taking breaks improves focus and retention. How about a 10-minute break?`,
        priority: 'medium',
        action: {
          type: 'take_break',
          label: 'Take a Break',
          data: { duration: 10 }
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Expires in 30 minutes
      };
    }

    return null;
  }

  // Check goal progress and provide encouragement
  private checkGoalProgress(): ProactiveSuggestion[] {
    if (!this.userProfile || !this.analytics) return [];

    const suggestions: ProactiveSuggestion[] = [];

    // Check weekly study goal
    const weeklyProgressPercentage = (this.analytics.weeklyProgress / this.studyPatterns!.weeklyGoal) * 100;
    
    if (weeklyProgressPercentage >= 80) {
      suggestions.push({
        id: `goal-progress-${Date.now()}`,
        type: 'goal_progress',
        title: 'Amazing Progress! 🎉',
        message: `You've completed ${Math.round(weeklyProgressPercentage)}% of your weekly study goal! You're on track for success.`,
        priority: 'medium',
        timestamp: new Date()
      });
    } else if (weeklyProgressPercentage < 30) {
      suggestions.push({
        id: `goal-reminder-${Date.now()}`,
        type: 'reminder',
        title: 'Let\'s Pick Up the Pace! 💪',
        message: `You've completed ${Math.round(weeklyProgressPercentage)}% of your weekly goal. A little extra effort will get you back on track!`,
        priority: 'high',
        action: {
          type: 'create_study_plan',
          label: 'Create Study Plan',
          data: { focus: 'catch_up' }
        },
        timestamp: new Date()
      });
    }

    // Check specific learning goals
    this.userProfile.goals.forEach((goal, index) => {
      const progress = this.analytics!.goalProgress[goal] || 0;
      if (progress > 0 && progress < 100) {
        suggestions.push({
          id: `goal-${goal}-${Date.now()}`,
          type: 'encouragement',
          title: `Great Work on ${goal}! 🌟`,
          message: `You're making progress on "${goal}". Keep up the excellent work!`,
          priority: 'low',
          timestamp: new Date()
        });
      }
    });

    return suggestions;
  }

  // Check if difficulty adjustments are needed
  private checkDifficultyAdjustments(): ProactiveSuggestion[] {
    if (!this.analytics) return [];

    const suggestions: ProactiveSuggestion[] = [];

    Object.entries(this.analytics.difficultyProgression).forEach(([subject, status]) => {
      if (status === 'struggling') {
        suggestions.push({
          id: `difficulty-${subject}-${Date.now()}`,
          type: 'difficulty_adjustment',
          title: `Need Help with ${subject}? 🤔`,
          message: `I noticed you're finding ${subject} challenging. Would you like me to suggest some easier practice problems or explain the basics?`,
          priority: 'medium',
          action: {
            type: 'help_with_subject',
            label: 'Get Help',
            data: { subject }
          },
          timestamp: new Date()
        });
      } else if (status === 'improving') {
        suggestions.push({
          id: `difficulty-${subject}-improving-${Date.now()}`,
          type: 'encouragement',
          title: `${subject} Skills Improving! 📈`,
          message: `Great job! Your ${subject} skills are getting stronger. Ready for some more challenging problems?`,
          priority: 'low',
          action: {
            type: 'increase_difficulty',
            label: 'Try Harder Problems',
            data: { subject }
          },
          timestamp: new Date()
        });
      }
    });

    return suggestions;
  }

  // Check study time optimization
  private checkStudyTimeOptimization(): ProactiveSuggestion[] {
    if (!this.studyPatterns || !this.analytics) return [];

    const suggestions: ProactiveSuggestion[] = [];
    const currentHour = new Date().getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

    // Check if current time is optimal for studying
    if (this.studyPatterns.preferredStudyTimes.includes(currentTime)) {
      suggestions.push({
        id: `optimal-time-${Date.now()}`,
        type: 'study_plan',
        title: 'Perfect Study Time! ⏰',
        message: `This is one of your most productive study times. Ready to make the most of it?`,
        priority: 'medium',
        action: {
          type: 'start_optimal_study',
          label: 'Start Studying',
          data: { time: currentTime }
        },
        timestamp: new Date()
      });
    }

    return suggestions;
  }

  // Check subject balance
  private checkSubjectBalance(): ProactiveSuggestion[] {
    if (!this.userProfile || !this.analytics) return [];

    const suggestions: ProactiveSuggestion[] = [];
    const totalStudyTime = Object.values(this.analytics.subjectsStudied).reduce((a, b) => a + b, 0);
    
    if (totalStudyTime === 0) return suggestions;

    // Find most and least studied subjects
    const subjectTimes = Object.entries(this.analytics.subjectsStudied);
    const mostStudied = subjectTimes.reduce((a, b) => a[1] > b[1] ? a : b);
    const leastStudied = subjectTimes.reduce((a, b) => a[1] < b[1] ? a : b);

    const mostStudiedPercentage = (mostStudied[1] / totalStudyTime) * 100;
    const leastStudiedPercentage = (leastStudied[1] / totalStudyTime) * 100;

    if (mostStudiedPercentage > 60) {
      suggestions.push({
        id: `balance-${Date.now()}`,
        type: 'study_plan',
        title: 'Balance Your Studies! ⚖️',
        message: `You've been focusing heavily on ${mostStudied[0]}. Consider spending some time on ${leastStudied[0]} to maintain a balanced approach.`,
        priority: 'low',
        action: {
          type: 'study_subject',
          label: `Study ${leastStudied[0]}`,
          data: { subject: leastStudied[0] }
        },
        timestamp: new Date()
      });
    }

    return suggestions;
  }

  // Update study analytics
  private updateAnalytics(): void {
    if (!this.userProfile || !this.studyPatterns) return;

    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    // Calculate weekly progress
    const weeklySessions = this.studySessions.filter(session => 
      session.startTime >= weekStart
    );
    const weeklyProgress = weeklySessions.reduce((total, session) => {
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60); // minutes
        return total + duration;
      }
      return total;
    }, 0) / 60; // Convert to hours

    this.analytics = {
      totalStudyTime: this.studySessions.reduce((total, session) => {
        if (session.endTime) {
          return total + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        }
        return total;
      }, 0),
      sessionsCompleted: this.studySessions.filter(s => s.endTime).length,
      averageSessionLength: this.calculateAverageSessionLength(),
      subjectsStudied: this.calculateSubjectTime(),
      difficultyProgression: this.calculateDifficultyProgression(),
      goalProgress: this.calculateGoalProgress(),
      studyStreak: this.calculateStudyStreak(),
      lastActiveDate: this.studySessions.length > 0 ? 
        this.studySessions[this.studySessions.length - 1].startTime : new Date()
    };

    // Update weekly progress
    this.studyPatterns.weeklyProgress = weeklyProgress;
    this.saveStudyPatterns();
  }

  private calculateAverageSessionLength(): number {
    const completedSessions = this.studySessions.filter(s => s.endTime);
    if (completedSessions.length === 0) return 0;

    const totalMinutes = completedSessions.reduce((total, session) => {
      return total + (session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60);
    }, 0);

    return totalMinutes / completedSessions.length;
  }

  private calculateSubjectTime(): { [subject: string]: number } {
    const subjectTimes: { [subject: string]: number } = {};
    
    this.studySessions.forEach(session => {
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        subjectTimes[session.subject] = (subjectTimes[session.subject] || 0) + duration;
      }
    });

    return subjectTimes;
  }

  private calculateDifficultyProgression(): { [subject: string]: 'improving' | 'stable' | 'struggling' } {
    // This is a simplified implementation
    // In a real app, this would analyze quiz scores, completion rates, etc.
    const progression: { [subject: string]: 'improving' | 'stable' | 'struggling' } = {};
    
    if (this.userProfile) {
      (this.userProfile.subjects || []).forEach(subject => {
        // Placeholder logic - in reality, this would analyze performance data
        progression[subject] = 'stable';
      });
    }

    return progression;
  }

  private calculateGoalProgress(): { [goal: string]: number } {
    const progress: { [goal: string]: number } = {};
    
    if (this.userProfile) {
      this.userProfile.goals.forEach(goal => {
        // Placeholder logic - in reality, this would track actual progress
        progress[goal] = Math.floor(Math.random() * 100);
      });
    }

    return progress;
  }

  private calculateStudyStreak(): number {
    // Simplified streak calculation
    // In reality, this would check consecutive days with study sessions
    return this.studyPatterns?.studyStreak || 0;
  }

  // Record a study session
  recordStudySession(session: StudySession): void {
    this.studySessions.push(session);
    this.saveStudySessions();
    this.updateStudyPatterns(session);
  }

  private updateStudyPatterns(session: StudySession): void {
    if (!this.studyPatterns) return;

    // Update last study date
    this.studyPatterns.lastStudyDate = session.startTime;

    // Update average session length
    if (session.endTime) {
      const sessionLength = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      this.studyPatterns.averageSessionLength = 
        (this.studyPatterns.averageSessionLength + sessionLength) / 2;
    }

    // Update most productive subjects
    const subjectTime = this.calculateSubjectTime();
    this.studyPatterns.mostProductiveSubjects = Object.entries(subjectTime)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([subject]) => subject);

    this.saveStudyPatterns();
  }

  // Get current suggestions
  getSuggestions(): ProactiveSuggestion[] {
    return this.suggestions.filter(suggestion => 
      !suggestion.expiresAt || suggestion.expiresAt > new Date()
    );
  }

  // Dismiss a suggestion
  dismissSuggestion(suggestionId: string): void {
    this.suggestions = this.suggestions.filter(s => s.id !== suggestionId);
    this.saveSuggestions();
  }

  // Get study analytics
  getAnalytics(): StudyAnalytics | null {
    return this.analytics;
  }

  // Get study patterns
  getStudyPatterns(): StudyPattern | null {
    return this.studyPatterns;
  }

  // Save data to localStorage
  private saveStudySessions(): void {
    localStorage.setItem('studySessions', JSON.stringify(this.studySessions));
  }

  private saveStudyPatterns(): void {
    if (this.studyPatterns) {
      localStorage.setItem('studyPatterns', JSON.stringify(this.studyPatterns));
    }
  }

  private saveSuggestions(): void {
    localStorage.setItem('proactiveSuggestions', JSON.stringify(this.suggestions));
  }
}

export const proactiveAI = new ProactiveAIService();
