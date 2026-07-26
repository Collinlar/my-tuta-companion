export interface UserReflection {
  id: string;
  questionId: string;
  question: string;
  answer: string;
  timestamp: Date;
  topic: string;
  subject: string;
  revisionPlanId: string;
}

export interface UserStudyProgress {
  id: string;
  revisionPlanId: string;
  topic: string;
  subject: string;
  completedSteps: string[];
  completedActivities: string[];
  activityResults: Record<string, string>;
  reflectionAnswers: Record<string, string>;
  studyToolScores: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  revisionPlanId: string;
  topic: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  completedSteps: string[];
  reflections: UserReflection[];
  notes: string;
  rating?: number; // 1-5 stars
  feedback?: string;
}

export class UserFeedbackService {
  private static readonly STORAGE_KEYS = {
    REFLECTIONS: 'mytuta_user_reflections',
    STUDY_PROGRESS: 'mytuta_study_progress',
    STUDY_SESSIONS: 'mytuta_study_sessions',
    CURRENT_SESSION: 'mytuta_current_session'
  };

  // Reflection Management
  static saveReflection(reflection: Omit<UserReflection, 'id' | 'timestamp'>): UserReflection {
    const newReflection: UserReflection = {
      ...reflection,
      id: this.generateId(),
      timestamp: new Date()
    };

    const existingReflections = this.getReflections();
    existingReflections.push(newReflection);
    
    localStorage.setItem(this.STORAGE_KEYS.REFLECTIONS, JSON.stringify(existingReflections));
    
    console.log('💭 Reflection saved:', newReflection);
    return newReflection;
  }

  static getReflections(): UserReflection[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.REFLECTIONS);
      if (!stored) return [];
      
      const reflections = JSON.parse(stored);
      return reflections.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }));
    } catch (error) {
      console.error('Error loading reflections:', error);
      return [];
    }
  }

  static getReflectionsByTopic(topic: string): UserReflection[] {
    return this.getReflections().filter(r => 
      r.topic.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(r.topic.toLowerCase())
    );
  }

  static getReflectionsByPlan(revisionPlanId: string): UserReflection[] {
    return this.getReflections().filter(r => r.revisionPlanId === revisionPlanId);
  }

  // Study Progress Management
  static saveStudyProgress(progress: Partial<UserStudyProgress> & { revisionPlanId: string; topic: string; subject: string }): UserStudyProgress {
    const existingProgress = this.getStudyProgress(progress.revisionPlanId);
    
    const updatedProgress: UserStudyProgress = {
      id: existingProgress?.id || this.generateId(),
      revisionPlanId: progress.revisionPlanId,
      topic: progress.topic,
      subject: progress.subject,
      completedSteps: progress.completedSteps || existingProgress?.completedSteps || [],
      completedActivities: progress.completedActivities || existingProgress?.completedActivities || [],
      activityResults: progress.activityResults || existingProgress?.activityResults || {},
      reflectionAnswers: progress.reflectionAnswers || existingProgress?.reflectionAnswers || {},
      studyToolScores: progress.studyToolScores || existingProgress?.studyToolScores || {},
      createdAt: existingProgress?.createdAt || new Date(),
      updatedAt: new Date()
    };

    const allProgress = this.getAllStudyProgress();
    const existingIndex = allProgress.findIndex(p => p.id === updatedProgress.id);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = updatedProgress;
    } else {
      allProgress.push(updatedProgress);
    }

    localStorage.setItem(this.STORAGE_KEYS.STUDY_PROGRESS, JSON.stringify(allProgress));
    
    console.log('📚 Study progress saved:', updatedProgress);
    return updatedProgress;
  }

  static getStudyProgress(revisionPlanId: string): UserStudyProgress | null {
    const allProgress = this.getAllStudyProgress();
    return allProgress.find(p => p.revisionPlanId === revisionPlanId) || null;
  }

  static getAllStudyProgress(): UserStudyProgress[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.STUDY_PROGRESS);
      if (!stored) return [];
      
      const progress = JSON.parse(stored);
      return progress.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading study progress:', error);
      return [];
    }
  }

  // Study Session Management
  static startStudySession(revisionPlanId: string, topic: string, subject: string): StudySession {
    const session: StudySession = {
      id: this.generateId(),
      revisionPlanId,
      topic,
      subject,
      startTime: new Date(),
      completedSteps: [],
      reflections: [],
      notes: ''
    };

    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    
    console.log('🚀 Study session started:', session);
    return session;
  }

  static getCurrentSession(): StudySession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      return {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      };
    } catch (error) {
      console.error('Error loading current session:', error);
      return null;
    }
  }

  static updateCurrentSession(updates: Partial<StudySession>): StudySession | null {
    const current = this.getCurrentSession();
    if (!current) return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updated));
    
    return updated;
  }

  static endStudySession(rating?: number, feedback?: string): StudySession | null {
    const current = this.getCurrentSession();
    if (!current) return null;

    const completedSession: StudySession = {
      ...current,
      endTime: new Date(),
      rating,
      feedback
    };

    // Save to completed sessions
    const allSessions = this.getCompletedSessions();
    allSessions.push(completedSession);
    localStorage.setItem(this.STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(allSessions));

    // Clear current session
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
    
    console.log('✅ Study session completed:', completedSession);
    return completedSession;
  }

  static getCompletedSessions(): StudySession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.STUDY_SESSIONS);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined
      }));
    } catch (error) {
      console.error('Error loading completed sessions:', error);
      return [];
    }
  }

  static getSessionsByTopic(topic: string): StudySession[] {
    return this.getCompletedSessions().filter(s => 
      s.topic.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(s.topic.toLowerCase())
    );
  }

  // Analytics and Insights
  static getLearningInsights(topic: string): {
    totalSessions: number;
    averageRating: number;
    totalStudyTime: number;
    commonChallenges: string[];
    progressTrend: 'improving' | 'stable' | 'declining';
  } {
    const sessions = this.getSessionsByTopic(topic);
    const reflections = this.getReflectionsByTopic(topic);

    const totalSessions = sessions.length;
    const averageRating = sessions
      .filter(s => s.rating)
      .reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.filter(s => s.rating).length || 0;
    
    const totalStudyTime = sessions.reduce((total, s) => {
      if (s.endTime) {
        return total + (s.endTime.getTime() - s.startTime.getTime());
      }
      return total;
    }, 0);

    // Analyze reflection answers for common challenges
    const commonChallenges = this.extractCommonChallenges(reflections);
    
    // Simple progress trend based on ratings
    const recentSessions = sessions.slice(-3).filter(s => s.rating);
    const progressTrend = this.calculateProgressTrend(recentSessions);

    return {
      totalSessions,
      averageRating,
      totalStudyTime: Math.round(totalStudyTime / (1000 * 60)), // Convert to minutes
      commonChallenges,
      progressTrend
    };
  }

  private static extractCommonChallenges(reflections: UserReflection[]): string[] {
    // Simple keyword extraction from reflection answers
    const challengeKeywords = ['difficult', 'challenging', 'hard', 'confusing', 'struggle', 'problem'];
    const challenges: string[] = [];

    reflections.forEach(reflection => {
      const answer = reflection.answer.toLowerCase();
      challengeKeywords.forEach(keyword => {
        if (answer.includes(keyword) && !challenges.includes(keyword)) {
          challenges.push(keyword);
        }
      });
    });

    return challenges;
  }

  private static calculateProgressTrend(sessions: StudySession[]): 'improving' | 'stable' | 'declining' {
    if (sessions.length < 2) return 'stable';
    
    const ratings = sessions.map(s => s.rating || 0);
    const firstHalf = ratings.slice(0, Math.floor(ratings.length / 2));
    const secondHalf = ratings.slice(Math.floor(ratings.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  // Utility functions
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All user feedback data cleared');
  }

  // Export/Import functionality
  static exportUserData(): string {
    const data = {
      reflections: this.getReflections(),
      studyProgress: this.getAllStudyProgress(),
      studySessions: this.getCompletedSessions(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.reflections) {
        localStorage.setItem(this.STORAGE_KEYS.REFLECTIONS, JSON.stringify(data.reflections));
      }
      
      if (data.studyProgress) {
        localStorage.setItem(this.STORAGE_KEYS.STUDY_PROGRESS, JSON.stringify(data.studyProgress));
      }
      
      if (data.studySessions) {
        localStorage.setItem(this.STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(data.studySessions));
      }
      
      console.log('📥 User data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}
