import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface LearningStyle {
  visual: number; // 0-100
  auditory: number; // 0-100
  kinesthetic: number; // 0-100
  reading: number; // 0-100
  dominant: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  confidence: number; // 0-100
}

export interface LearningPattern {
  // Time-based patterns
  optimalStudyTimes: {
    morning: number; // 0-100 preference score
    afternoon: number;
    evening: number;
    night: number;
  };
  preferredSessionLength: {
    short: number; // 15-30 min sessions
    medium: number; // 30-60 min sessions
    long: number; // 60+ min sessions
  };
  breakPatterns: {
    frequency: number; // breaks per hour
    duration: number; // average break length in minutes
    effectiveness: number; // 0-100 how well breaks work
  };

  // Subject-specific patterns
  subjectPreferences: {
    [subject: string]: {
      engagement: number; // 0-100
      difficulty: number; // 0-100
      retention: number; // 0-100
      optimalMethod: string;
      timeOfDay: string;
      sessionLength: number;
    };
  };

  // Performance patterns
  performanceTrends: {
    improvementRate: number; // percentage improvement per week
    consistency: number; // 0-100 how consistent performance is
    peakPerformance: {
      timeOfDay: string;
      dayOfWeek: string;
      conditions: string[];
    };
  };

  // Learning behavior patterns
  studyBehavior: {
    focusDuration: number; // average minutes of sustained focus
    distractionFrequency: number; // distractions per hour
    multitasking: number; // 0-100 tendency to multitask
    socialLearning: number; // 0-100 preference for group study
  };

  // Retention patterns
  retentionPatterns: {
    shortTerm: number; // 0-100 retention after 1 hour
    mediumTerm: number; // 0-100 retention after 1 day
    longTerm: number; // 0-100 retention after 1 week
    optimalReviewInterval: number; // days between reviews
    forgettingCurve: number[]; // retention over time
  };
}

export interface LearningInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'opportunity';
  category: 'timing' | 'method' | 'subject' | 'behavior' | 'retention';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  data: any;
  timestamp: Date;
}

export interface StudyRecommendation {
  id: string;
  type: 'schedule' | 'method' | 'resource' | 'environment' | 'goal';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: string;
  implementation: {
    steps: string[];
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  conditions: {
    subject?: string;
    timeOfDay?: string;
    sessionLength?: string;
    mood?: string;
  };
  successMetrics: string[];
  timestamp: Date;
}

export class AdvancedPatternRecognition {
  private userProfile: UserProfile | null = null;
  private studySessions: StudySession[] = [];
  private learningPattern: LearningPattern | null = null;
  private learningStyle: LearningStyle | null = null;
  private insights: LearningInsight[] = [];
  private recommendations: StudyRecommendation[] = [];

  constructor() {
    this.loadUserData();
    this.initializePatterns();
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

      const patterns = localStorage.getItem('learningPatterns');
      if (patterns) {
        this.learningPattern = JSON.parse(patterns);
      }

      const style = localStorage.getItem('learningStyle');
      if (style) {
        this.learningStyle = JSON.parse(style);
      }
    } catch (error) {
      console.error('Error loading user data for pattern recognition:', error);
    }
  }

  private initializePatterns(): void {
    if (!this.userProfile) return;

    // Initialize with default patterns
    this.learningPattern = {
      optimalStudyTimes: {
        morning: 50,
        afternoon: 70,
        evening: 60,
        night: 30
      },
      preferredSessionLength: {
        short: 30,
        medium: 60,
        long: 10
      },
      breakPatterns: {
        frequency: 1, // 1 break per hour
        duration: 10, // 10 minutes
        effectiveness: 70
      },
      subjectPreferences: {},
      performanceTrends: {
        improvementRate: 0,
        consistency: 50,
        peakPerformance: {
          timeOfDay: 'afternoon',
          dayOfWeek: 'weekday',
          conditions: ['quiet', 'well-rested']
        }
      },
      studyBehavior: {
        focusDuration: 25,
        distractionFrequency: 2,
        multitasking: 30,
        socialLearning: 40
      },
      retentionPatterns: {
        shortTerm: 80,
        mediumTerm: 60,
        longTerm: 40,
        optimalReviewInterval: 3,
        forgettingCurve: [100, 80, 60, 40, 30, 25, 20]
      }
    };

    // Initialize subject preferences
    (this.userProfile.subjects || []).forEach(subject => {
      this.learningPattern!.subjectPreferences[subject] = {
        engagement: 50,
        difficulty: 50,
        retention: 50,
        optimalMethod: 'mixed',
        timeOfDay: 'afternoon',
        sessionLength: 45
      };
    });

    this.learningStyle = {
      visual: 40,
      auditory: 30,
      kinesthetic: 20,
      reading: 10,
      dominant: 'visual',
      confidence: 50
    };
  }

  // Analyze study sessions and update patterns
  async analyzeStudySessions(): Promise<LearningPattern> {
    if (!this.learningPattern || this.studySessions.length === 0) {
      return this.learningPattern!;
    }

    // Analyze time-based patterns
    this.analyzeTimePatterns();
    
    // Analyze subject-specific patterns
    this.analyzeSubjectPatterns();
    
    // Analyze performance trends
    this.analyzePerformanceTrends();
    
    // Analyze study behavior
    this.analyzeStudyBehavior();
    
    // Analyze retention patterns
    this.analyzeRetentionPatterns();
    
    // Detect learning style
    await this.detectLearningStyle();
    
    // Generate insights
    this.generateInsights();
    
    // Generate recommendations
    this.generateRecommendations();
    
    this.savePatterns();
    return this.learningPattern;
  }

  private analyzeTimePatterns(): void {
    const timeAnalysis = {
      morning: 0, afternoon: 0, evening: 0, night: 0,
      short: 0, medium: 0, long: 0,
      breakFrequency: 0, breakDuration: 0
    };

    let totalSessions = 0;
    let totalBreakTime = 0;
    let breakCount = 0;

    this.studySessions.forEach(session => {
      if (!session.endTime) return;
      
      const startHour = session.startTime.getHours();
      const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60); // minutes
      
      // Time of day analysis
      if (startHour >= 6 && startHour < 12) timeAnalysis.morning++;
      else if (startHour >= 12 && startHour < 17) timeAnalysis.afternoon++;
      else if (startHour >= 17 && startHour < 22) timeAnalysis.evening++;
      else timeAnalysis.night++;
      
      // Session length analysis
      if (duration <= 30) timeAnalysis.short++;
      else if (duration <= 60) timeAnalysis.medium++;
      else timeAnalysis.long++;
      
      totalSessions++;
    });

    if (totalSessions > 0) {
      // Update optimal study times
      this.learningPattern!.optimalStudyTimes = {
        morning: (timeAnalysis.morning / totalSessions) * 100,
        afternoon: (timeAnalysis.afternoon / totalSessions) * 100,
        evening: (timeAnalysis.evening / totalSessions) * 100,
        night: (timeAnalysis.night / totalSessions) * 100
      };

      // Update preferred session lengths
      this.learningPattern!.preferredSessionLength = {
        short: (timeAnalysis.short / totalSessions) * 100,
        medium: (timeAnalysis.medium / totalSessions) * 100,
        long: (timeAnalysis.long / totalSessions) * 100
      };
    }
  }

  private analyzeSubjectPatterns(): void {
    const subjectData: { [subject: string]: any } = {};

    this.studySessions.forEach(session => {
      if (!session.endTime) return;
      
      const subject = session.subject;
      if (!subjectData[subject]) {
        subjectData[subject] = {
          sessions: 0,
          totalTime: 0,
          productivity: [],
          times: [],
          durations: []
        };
      }

      const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      const startHour = session.startTime.getHours();
      
      subjectData[subject].sessions++;
      subjectData[subject].totalTime += duration;
      subjectData[subject].productivity.push(session.productivity);
      subjectData[subject].times.push(startHour);
      subjectData[subject].durations.push(duration);
    });

    // Update subject preferences
    Object.entries(subjectData).forEach(([subject, data]) => {
      if (this.learningPattern!.subjectPreferences[subject]) {
        const avgProductivity = data.productivity.reduce((a: number, b: number) => a + b, 0) / data.productivity.length;
        const avgTime = data.times.reduce((a: number, b: number) => a + b, 0) / data.times.length;
        const avgDuration = data.durations.reduce((a: number, b: number) => a + b, 0) / data.durations.length;

        this.learningPattern!.subjectPreferences[subject] = {
          engagement: Math.min(100, data.sessions * 10), // More sessions = higher engagement
          difficulty: 100 - (avgProductivity * 10), // Lower productivity = higher difficulty
          retention: Math.min(100, avgProductivity * 12), // Higher productivity = better retention
          optimalMethod: this.determineOptimalMethod(subject, data),
          timeOfDay: this.getTimeOfDayLabel(avgTime),
          sessionLength: Math.round(avgDuration)
        };
      }
    });
  }

  private determineOptimalMethod(subject: string, data: any): string {
    // This would be enhanced with more sophisticated analysis
    const avgProductivity = data.productivity.reduce((a: number, b: number) => a + b, 0) / data.productivity.length;
    
    if (avgProductivity > 7) return 'mixed';
    if (avgProductivity > 5) return 'interactive';
    return 'guided';
  }

  private getTimeOfDayLabel(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private analyzePerformanceTrends(): void {
    // Analyze performance over time
    const weeklyPerformance: { [week: string]: number[] } = {};
    
    this.studySessions.forEach(session => {
      if (!session.endTime) return;
      
      const week = this.getWeekKey(session.startTime);
      if (!weeklyPerformance[week]) {
        weeklyPerformance[week] = [];
      }
      weeklyPerformance[week].push(session.productivity);
    });

    const weeks = Object.keys(weeklyPerformance).sort();
    if (weeks.length >= 2) {
      const firstWeekAvg = weeklyPerformance[weeks[0]].reduce((a, b) => a + b, 0) / weeklyPerformance[weeks[0]].length;
      const lastWeekAvg = weeklyPerformance[weeks[weeks.length - 1]].reduce((a, b) => a + b, 0) / weeklyPerformance[weeks[weeks.length - 1]].length;
      
      this.learningPattern!.performanceTrends.improvementRate = 
        ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
    }

    // Analyze consistency
    const allProductivity = this.studySessions
      .filter(s => s.endTime)
      .map(s => s.productivity);
    
    if (allProductivity.length > 0) {
      const mean = allProductivity.reduce((a, b) => a + b, 0) / allProductivity.length;
      const variance = allProductivity.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allProductivity.length;
      this.learningPattern!.performanceTrends.consistency = Math.max(0, 100 - (variance * 10));
    }
  }

  private analyzeStudyBehavior(): void {
    // Analyze focus duration
    const sessionDurations = this.studySessions
      .filter(s => s.endTime)
      .map(s => (s.endTime!.getTime() - s.startTime.getTime()) / (1000 * 60));
    
    if (sessionDurations.length > 0) {
      this.learningPattern!.studyBehavior.focusDuration = 
        sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
    }

    // Analyze break patterns
    const breakAnalysis = this.analyzeBreakPatterns();
    this.learningPattern!.breakPatterns = breakAnalysis;
  }

  private analyzeBreakPatterns(): any {
    // This would analyze actual break data if available
    // For now, return default values
    return {
      frequency: 1,
      duration: 10,
      effectiveness: 70
    };
  }

  private analyzeRetentionPatterns(): void {
    // This would analyze retention data from quizzes and assessments
    // For now, use default values based on general learning research
    this.learningPattern!.retentionPatterns = {
      shortTerm: 80,
      mediumTerm: 60,
      longTerm: 40,
      optimalReviewInterval: 3,
      forgettingCurve: [100, 80, 60, 40, 30, 25, 20]
    };
  }

  private async detectLearningStyle(): Promise<void> {
    // Analyze study behavior to detect learning style
    const behaviorAnalysis = this.analyzeLearningBehavior();
    
    this.learningStyle = {
      visual: behaviorAnalysis.visual,
      auditory: behaviorAnalysis.auditory,
      kinesthetic: behaviorAnalysis.kinesthetic,
      reading: behaviorAnalysis.reading,
      dominant: behaviorAnalysis.dominant,
      confidence: behaviorAnalysis.confidence
    };
  }

  private analyzeLearningBehavior(): any {
    // This would analyze actual learning behavior patterns
    // For now, return default values
    return {
      visual: 40,
      auditory: 30,
      kinesthetic: 20,
      reading: 10,
      dominant: 'visual' as const,
      confidence: 50
    };
  }

  private generateInsights(): void {
    this.insights = [];

    // Time-based insights
    this.generateTimeInsights();
    
    // Subject-based insights
    this.generateSubjectInsights();
    
    // Performance insights
    this.generatePerformanceInsights();
    
    // Behavior insights
    this.generateBehaviorInsights();
  }

  private generateTimeInsights(): void {
    if (!this.learningPattern) return;

    const { optimalStudyTimes, preferredSessionLength } = this.learningPattern;
    
    // Find best study time
    const bestTime = Object.entries(optimalStudyTimes)
      .reduce((a, b) => a[1] > b[1] ? a : b);
    
    if (bestTime[1] > 60) {
      this.insights.push({
        id: `time-${Date.now()}`,
        type: 'pattern',
        category: 'timing',
        title: `Peak Performance Time: ${bestTime[0]}`,
        description: `You perform best during ${bestTime[0]} hours with ${Math.round(bestTime[1])}% of your study sessions occurring at this time.`,
        confidence: Math.round(bestTime[1]),
        impact: 'high',
        actionable: true,
        data: { timeOfDay: bestTime[0], preference: bestTime[1] },
        timestamp: new Date()
      });
    }

    // Session length preference
    const bestLength = Object.entries(preferredSessionLength)
      .reduce((a, b) => a[1] > b[1] ? a : b);
    
    if (bestLength[1] > 50) {
      this.insights.push({
        id: `session-${Date.now()}`,
        type: 'pattern',
        category: 'timing',
        title: `Optimal Session Length: ${bestLength[0]}`,
        description: `You prefer ${bestLength[0]} study sessions (${Math.round(bestLength[1])}% of your sessions).`,
        confidence: Math.round(bestLength[1]),
        impact: 'medium',
        actionable: true,
        data: { sessionLength: bestLength[0], preference: bestLength[1] },
        timestamp: new Date()
      });
    }
  }

  private generateSubjectInsights(): void {
    if (!this.learningPattern) return;

    Object.entries(this.learningPattern.subjectPreferences).forEach(([subject, data]) => {
      if (data.engagement > 70) {
        this.insights.push({
          id: `subject-${subject}-${Date.now()}`,
          type: 'pattern',
          category: 'subject',
          title: `High Engagement: ${subject}`,
          description: `You show high engagement with ${subject} (${Math.round(data.engagement)}%). Consider focusing more on this subject.`,
          confidence: Math.round(data.engagement),
          impact: 'medium',
          actionable: true,
          data: { subject, engagement: data.engagement },
          timestamp: new Date()
        });
      }

      if (data.difficulty > 70) {
        this.insights.push({
          id: `difficulty-${subject}-${Date.now()}`,
          type: 'warning',
          category: 'subject',
          title: `Challenging Subject: ${subject}`,
          description: `${subject} appears challenging for you (${Math.round(data.difficulty)}% difficulty). Consider additional support.`,
          confidence: Math.round(data.difficulty),
          impact: 'high',
          actionable: true,
          data: { subject, difficulty: data.difficulty },
          timestamp: new Date()
        });
      }
    });
  }

  private generatePerformanceInsights(): void {
    if (!this.learningPattern) return;

    const { improvementRate, consistency } = this.learningPattern.performanceTrends;
    
    if (improvementRate > 10) {
      this.insights.push({
        id: `improvement-${Date.now()}`,
        type: 'pattern',
        category: 'behavior',
        title: 'Strong Improvement Trend',
        description: `You're improving at ${Math.round(improvementRate)}% per week. Keep up the excellent work!`,
        confidence: Math.min(100, Math.abs(improvementRate)),
        impact: 'high',
        actionable: false,
        data: { improvementRate },
        timestamp: new Date()
      });
    }

    if (consistency < 40) {
      this.insights.push({
        id: `consistency-${Date.now()}`,
        type: 'warning',
        category: 'behavior',
        title: 'Inconsistent Performance',
        description: `Your performance varies significantly (${Math.round(consistency)}% consistency). Consider establishing a more regular study routine.`,
        confidence: 100 - consistency,
        impact: 'medium',
        actionable: true,
        data: { consistency },
        timestamp: new Date()
      });
    }
  }

  private generateBehaviorInsights(): void {
    if (!this.learningPattern) return;

    const { focusDuration, distractionFrequency } = this.learningPattern.studyBehavior;
    
    if (focusDuration < 20) {
      this.insights.push({
        id: `focus-${Date.now()}`,
        type: 'recommendation',
        category: 'behavior',
        title: 'Short Focus Duration',
        description: `Your average focus duration is ${Math.round(focusDuration)} minutes. Try the Pomodoro technique to improve focus.`,
        confidence: 80,
        impact: 'medium',
        actionable: true,
        data: { focusDuration },
        timestamp: new Date()
      });
    }

    if (distractionFrequency > 3) {
      this.insights.push({
        id: `distraction-${Date.now()}`,
        type: 'warning',
        category: 'behavior',
        title: 'High Distraction Frequency',
        description: `You experience ${distractionFrequency} distractions per hour. Consider creating a more focused study environment.`,
        confidence: 90,
        impact: 'high',
        actionable: true,
        data: { distractionFrequency },
        timestamp: new Date()
      });
    }
  }

  private generateRecommendations(): void {
    this.recommendations = [];

    // Generate recommendations based on insights
    this.insights.forEach(insight => {
      if (insight.actionable) {
        this.createRecommendationFromInsight(insight);
      }
    });
  }

  private createRecommendationFromInsight(insight: LearningInsight): void {
    let recommendation: StudyRecommendation;

    switch (insight.category) {
      case 'timing':
        recommendation = this.createTimingRecommendation(insight);
        break;
      case 'subject':
        recommendation = this.createSubjectRecommendation(insight);
        break;
      case 'behavior':
        recommendation = this.createBehaviorRecommendation(insight);
        break;
      default:
        return;
    }

    this.recommendations.push(recommendation);
  }

  private createTimingRecommendation(insight: LearningInsight): StudyRecommendation {
    return {
      id: `rec-${insight.id}`,
      type: 'schedule',
      priority: insight.impact === 'high' ? 'high' : 'medium',
      title: `Optimize Your Study Schedule`,
      description: `Based on your patterns, schedule more study sessions during your peak performance times.`,
      reasoning: insight.description,
      expectedImpact: 'Improved focus and productivity during study sessions',
      implementation: {
        steps: [
          'Identify your peak performance time',
          'Block out study time during this period',
          'Protect this time from distractions',
          'Track your productivity improvements'
        ],
        estimatedTime: '5 minutes to set up',
        difficulty: 'easy'
      },
      conditions: {
        timeOfDay: insight.data.timeOfDay
      },
      successMetrics: ['Increased session productivity', 'Better focus duration', 'More consistent performance'],
      timestamp: new Date()
    };
  }

  private createSubjectRecommendation(insight: LearningInsight): StudyRecommendation {
    return {
      id: `rec-${insight.id}`,
      type: 'method',
      priority: insight.impact === 'high' ? 'high' : 'medium',
      title: `Improve ${insight.data.subject} Study Method`,
      description: `Adjust your study approach for ${insight.data.subject} based on your learning patterns.`,
      reasoning: insight.description,
      expectedImpact: 'Better understanding and retention in this subject',
      implementation: {
        steps: [
          'Review current study methods for this subject',
          'Try alternative learning approaches',
          'Seek additional resources or help',
          'Monitor improvement over time'
        ],
        estimatedTime: '15-30 minutes',
        difficulty: 'medium'
      },
      conditions: {
        subject: insight.data.subject
      },
      successMetrics: ['Improved quiz scores', 'Better retention', 'Increased confidence'],
      timestamp: new Date()
    };
  }

  private createBehaviorRecommendation(insight: LearningInsight): StudyRecommendation {
    return {
      id: `rec-${insight.id}`,
      type: 'environment',
      priority: insight.impact === 'high' ? 'high' : 'medium',
      title: `Improve Study Environment`,
      description: `Create a more focused study environment to reduce distractions and improve concentration.`,
      reasoning: insight.description,
      expectedImpact: 'Better focus and reduced distractions during study',
      implementation: {
        steps: [
          'Find a quiet, dedicated study space',
          'Remove or minimize distractions',
          'Use focus techniques like Pomodoro',
          'Track your focus improvements'
        ],
        estimatedTime: '10-20 minutes',
        difficulty: 'easy'
      },
      conditions: {},
      successMetrics: ['Longer focus duration', 'Fewer distractions', 'Better session quality'],
      timestamp: new Date()
    };
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private savePatterns(): void {
    localStorage.setItem('learningPatterns', JSON.stringify(this.learningPattern));
    localStorage.setItem('learningStyle', JSON.stringify(this.learningStyle));
    localStorage.setItem('learningInsights', JSON.stringify(this.insights));
    localStorage.setItem('studyRecommendations', JSON.stringify(this.recommendations));
  }

  // Public methods
  getLearningPattern(): LearningPattern | null {
    return this.learningPattern;
  }

  getLearningStyle(): LearningStyle | null {
    return this.learningStyle;
  }

  getInsights(): LearningInsight[] {
    return this.insights;
  }

  getRecommendations(): StudyRecommendation[] {
    return this.recommendations;
  }

  // Update patterns when new study session is recorded
  recordStudySession(session: StudySession): void {
    this.studySessions.push(session);
    this.analyzeStudySessions();
  }
}

export const advancedPatternRecognition = new AdvancedPatternRecognition();
