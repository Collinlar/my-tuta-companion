import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface RetentionData {
  id: string;
  subject: string;
  topic: string;
  concept: string;
  firstLearned: Date;
  lastReviewed: Date;
  nextReview: Date;
  difficulty: number; // 1-10 scale
  stability: number; // days until next review
  retrievability: number; // 0-1, probability of recall
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  averageResponseTime: number; // seconds
  masteryLevel: 'new' | 'learning' | 'practicing' | 'mastered' | 'expert';
  forgettingCurve: {
    [days: number]: number; // retention percentage at different time intervals
  };
}

export interface RetentionPattern {
  overallRetention: number; // 0-100
  averageRetrievability: number; // 0-1
  forgettingRate: number; // percentage per day
  optimalReviewInterval: number; // days
  subjectRetention: {
    [subject: string]: {
      retention: number;
      difficulty: number;
      reviewFrequency: number;
      masteryLevel: string;
    };
  };
  conceptRetention: {
    [concept: string]: {
      retention: number;
      stability: number;
      retrievability: number;
      reviewCount: number;
      masteryLevel: string;
    };
  };
  spacedRepetitionSchedule: {
    [conceptId: string]: {
      nextReview: Date;
      interval: number;
      easeFactor: number;
      repetitions: number;
    };
  };
  retentionInsights: {
    strongAreas: string[];
    weakAreas: string[];
    overstudied: string[];
    understudied: string[];
    optimalStudyFrequency: number; // days
  };
  lastUpdated: Date;
}

export interface RetentionRecommendation {
  id: string;
  type: 'review' | 'practice' | 'consolidate' | 'advance' | 'spaced_repetition';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string;
  target: {
    subject?: string;
    topic?: string;
    concept?: string;
    masteryLevel?: string;
  };
  implementation: {
    steps: string[];
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    resources: string[];
  };
  expectedOutcomes: {
    retentionImprovement: number;
    masteryAdvancement: string;
    timeToMastery: string;
  };
  urgency: {
    daysUntilForgetting: number;
    reviewOverdue: boolean;
    conceptDifficulty: number;
  };
  timestamp: Date;
}

export interface ForgettingCurveAnalysis {
  conceptId: string;
  concept: string;
  subject: string;
  curveData: {
    time: number; // days since last review
    retention: number; // 0-100
    confidence: number; // 0-100
  }[];
  optimalReviewPoints: number[]; // days when review should occur
  currentRetention: number;
  predictedRetention: {
    [days: number]: number; // predicted retention at future time points
  };
  forgettingRate: number; // percentage per day
}

export class RetentionPatternAnalysis {
  private userProfile: UserProfile | null = null;
  private retentionData: RetentionData[] = [];
  private retentionPattern: RetentionPattern | null = null;
  private studySessions: StudySession[] = [];
  private forgettingCurves: { [conceptId: string]: ForgettingCurveAnalysis } = {};

  constructor() {
    this.loadUserData();
    this.initializeRetentionPattern();
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

      const retentionData = localStorage.getItem('retentionData');
      if (retentionData) {
        this.retentionData = JSON.parse(retentionData).map((d: any) => ({
          ...d,
          firstLearned: new Date(d.firstLearned),
          lastReviewed: new Date(d.lastReviewed),
          nextReview: new Date(d.nextReview)
        }));
      }

      const sessions = localStorage.getItem('studySessions');
      if (sessions) {
        this.studySessions = JSON.parse(sessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
      }

      const pattern = localStorage.getItem('retentionPattern');
      if (pattern) {
        this.retentionPattern = {
          ...JSON.parse(pattern),
          lastUpdated: new Date(JSON.parse(pattern).lastUpdated)
        };
      }

      const curves = localStorage.getItem('forgettingCurves');
      if (curves) {
        this.forgettingCurves = JSON.parse(curves);
      }
    } catch (error) {
      console.error('Error loading retention data:', error);
    }
  }

  private initializeRetentionPattern(): void {
    this.retentionPattern = {
      overallRetention: 50,
      averageRetrievability: 0.5,
      forgettingRate: 20, // 20% per day default
      optimalReviewInterval: 3,
      subjectRetention: {},
      conceptRetention: {},
      spacedRepetitionSchedule: {},
      retentionInsights: {
        strongAreas: [],
        weakAreas: [],
        overstudied: [],
        understudied: [],
        optimalStudyFrequency: 3
      },
      lastUpdated: new Date()
    };

    // Initialize subject retention if user profile exists
    if (this.userProfile) {
      (this.userProfile.subjects || []).forEach(subject => {
        this.retentionPattern!.subjectRetention[subject] = {
          retention: 50,
          difficulty: 50,
          reviewFrequency: 3,
          masteryLevel: 'learning'
        };
      });
    }
  }

  // Record new learning or review session
  recordLearningEvent(conceptId: string, subject: string, topic: string, concept: string, 
                     performance: { correct: boolean; responseTime: number; difficulty: number }): void {
    
    const now = new Date();
    let retentionItem = this.retentionData.find(item => item.id === conceptId);

    if (!retentionItem) {
      // New concept
      retentionItem = {
        id: conceptId,
        subject,
        topic,
        concept,
        firstLearned: now,
        lastReviewed: now,
        nextReview: this.calculateNextReview(now, 1, 2.5, 0), // First review in 1 day
        difficulty: performance.difficulty,
        stability: 1,
        retrievability: 1.0,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        averageResponseTime: performance.responseTime,
        masteryLevel: 'new',
        forgettingCurve: {}
      };
      this.retentionData.push(retentionItem);
    } else {
      // Existing concept - update retention data
      retentionItem.lastReviewed = now;
      retentionItem.reviewCount++;
      retentionItem.averageResponseTime = 
        (retentionItem.averageResponseTime * (retentionItem.reviewCount - 1) + performance.responseTime) / 
        retentionItem.reviewCount;

      if (performance.correct) {
        retentionItem.correctCount++;
      } else {
        retentionItem.incorrectCount++;
      }

      // Update difficulty and stability based on performance
      const newDifficulty = this.updateDifficulty(retentionItem.difficulty, performance.correct);
      const newStability = this.updateStability(retentionItem.stability, performance.correct, retentionItem.reviewCount);
      const newEaseFactor = this.updateEaseFactor(retentionItem.difficulty, performance.correct);

      retentionItem.difficulty = newDifficulty;
      retentionItem.stability = newStability;
      retentionItem.nextReview = this.calculateNextReview(now, newStability, newEaseFactor, retentionItem.reviewCount);
      
      // Update retrievability based on time since last review
      retentionItem.retrievability = this.calculateRetrievability(retentionItem.stability, now, retentionItem.lastReviewed);
      
      // Update mastery level
      retentionItem.masteryLevel = this.updateMasteryLevel(retentionItem.correctCount, retentionItem.reviewCount);
    }

    // Update forgetting curve
    this.updateForgettingCurve(conceptId, retentionItem);

    this.saveRetentionData();
    this.updateRetentionPattern();
  }

  private calculateNextReview(now: Date, stability: number, easeFactor: number, repetitions: number): Date {
    let interval: number;

    if (repetitions === 0) {
      interval = 1; // First review in 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second review in 6 days
    } else {
      interval = Math.round(stability * easeFactor);
    }

    // Cap interval at 365 days
    interval = Math.min(interval, 365);

    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + interval);
    return nextReview;
  }

  private updateDifficulty(currentDifficulty: number, correct: boolean): number {
    // Simplified difficulty adjustment
    if (correct) {
      return Math.max(1, currentDifficulty - 0.1);
    } else {
      return Math.min(10, currentDifficulty + 0.3);
    }
  }

  private updateStability(currentStability: number, correct: boolean, reviewCount: number): number {
    if (correct) {
      // Increase stability for correct answers
      return currentStability * (1.3 + (reviewCount * 0.1));
    } else {
      // Decrease stability for incorrect answers
      return Math.max(1, currentStability * 0.8);
    }
  }

  private updateEaseFactor(currentEase: number, correct: boolean): number {
    // Simplified ease factor (similar to Anki algorithm)
    if (correct) {
      return Math.min(2.5, currentEase + 0.1);
    } else {
      return Math.max(1.3, currentEase - 0.2);
    }
  }

  private calculateRetrievability(stability: number, now: Date, lastReviewed: Date): number {
    const daysSinceReview = (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24);
    // Exponential decay formula: R = e^(-daysSinceReview / stability)
    return Math.exp(-daysSinceReview / stability);
  }

  private updateMasteryLevel(correctCount: number, reviewCount: number): string {
    if (reviewCount === 0) return 'new';
    
    const accuracy = correctCount / reviewCount;
    
    if (accuracy >= 0.9 && reviewCount >= 5) return 'expert';
    if (accuracy >= 0.8 && reviewCount >= 3) return 'mastered';
    if (accuracy >= 0.6 && reviewCount >= 2) return 'practicing';
    if (reviewCount >= 1) return 'learning';
    return 'new';
  }

  private updateForgettingCurve(conceptId: string, retentionItem: RetentionData): void {
    const curve: ForgettingCurveAnalysis = {
      conceptId,
      concept: retentionItem.concept,
      subject: retentionItem.subject,
      curveData: [],
      optimalReviewPoints: [],
      currentRetention: retentionItem.retrievability * 100,
      predictedRetention: {},
      forgettingRate: 20
    };

    // Generate forgetting curve data
    for (let days = 0; days <= 30; days++) {
      const retention = Math.max(0, 100 * Math.exp(-days / (retentionItem.stability * 0.8)));
      const confidence = Math.max(20, 100 - (days * 2));
      
      curve.curveData.push({
        time: days,
        retention,
        confidence
      });

      curve.predictedRetention[days] = retention;
    }

    // Calculate optimal review points (when retention drops to 80%, 60%, 40%)
    curve.optimalReviewPoints = [1, 3, 7, 14, 30]; // Default intervals
    curve.forgettingRate = (100 - curve.predictedRetention[1]) / 1;

    this.forgettingCurves[conceptId] = curve;
  }

  private updateRetentionPattern(): void {
    if (!this.retentionPattern || this.retentionData.length === 0) return;

    // Calculate overall retention metrics
    const totalRetrievability = this.retentionData.reduce((sum, item) => sum + item.retrievability, 0);
    this.retentionPattern.averageRetrievability = totalRetrievability / this.retentionData.length;
    this.retentionPattern.overallRetention = this.retentionPattern.averageRetrievability * 100;

    // Calculate forgetting rate
    const totalForgettingRate = Object.values(this.forgettingCurves).reduce((sum, curve) => sum + curve.forgettingRate, 0);
    this.retentionPattern.forgettingRate = totalForgettingRate / Object.keys(this.forgettingCurves).length;

    // Update subject retention
    const subjectGroups: { [subject: string]: RetentionData[] } = {};
    this.retentionData.forEach(item => {
      if (!subjectGroups[item.subject]) {
        subjectGroups[item.subject] = [];
      }
      subjectGroups[item.subject].push(item);
    });

    Object.entries(subjectGroups).forEach(([subject, items]) => {
      const avgRetention = items.reduce((sum, item) => sum + item.retrievability, 0) / items.length;
      const avgDifficulty = items.reduce((sum, item) => sum + item.difficulty, 0) / items.length;
      const avgReviewFreq = items.reduce((sum, item) => sum + item.reviewCount, 0) / items.length;
      
      // Determine mastery level for subject
      const masteryLevels = items.map(item => item.masteryLevel);
      const mostCommonMastery = this.getMostCommonMasteryLevel(masteryLevels);

      this.retentionPattern!.subjectRetention[subject] = {
        retention: avgRetention * 100,
        difficulty: avgDifficulty * 10,
        reviewFrequency: avgReviewFreq,
        masteryLevel: mostCommonMastery
      };
    });

    // Update concept retention
    this.retentionData.forEach(item => {
      this.retentionPattern!.conceptRetention[item.id] = {
        retention: item.retrievability * 100,
        stability: item.stability,
        retrievability: item.retrievability,
        reviewCount: item.reviewCount,
        masteryLevel: item.masteryLevel
      };
    });

    // Update spaced repetition schedule
    this.retentionData.forEach(item => {
      this.retentionPattern!.spacedRepetitionSchedule[item.id] = {
        nextReview: item.nextReview,
        interval: item.stability,
        easeFactor: item.difficulty,
        repetitions: item.reviewCount
      };
    });

    // Generate retention insights
    this.generateRetentionInsights();

    this.retentionPattern.lastUpdated = new Date();
    this.saveRetentionPattern();
    this.saveForgettingCurves();
  }

  private getMostCommonMasteryLevel(levels: string[]): string {
    const counts: { [level: string]: number } = {};
    levels.forEach(level => {
      counts[level] = (counts[level] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  private generateRetentionInsights(): void {
    if (!this.retentionPattern) return;

    const insights = this.retentionPattern.retentionInsights;

    // Find strong areas (high retention)
    const strongSubjects = Object.entries(this.retentionPattern.subjectRetention)
      .filter(([_, data]) => data.retention >= 80)
      .map(([subject, _]) => subject);
    insights.strongAreas = strongSubjects;

    // Find weak areas (low retention)
    const weakSubjects = Object.entries(this.retentionPattern.subjectRetention)
      .filter(([_, data]) => data.retention < 60)
      .map(([subject, _]) => subject);
    insights.weakAreas = weakSubjects;

    // Find overstudied areas (high review frequency but good retention)
    const overstudiedSubjects = Object.entries(this.retentionPattern.subjectRetention)
      .filter(([_, data]) => data.retention >= 90 && data.reviewFrequency > 5)
      .map(([subject, _]) => subject);
    insights.overstudied = overstudiedSubjects;

    // Find understudied areas (low review frequency)
    const understudiedSubjects = Object.entries(this.retentionPattern.subjectRetention)
      .filter(([_, data]) => data.reviewFrequency < 2)
      .map(([subject, _]) => subject);
    insights.understudied = understudiedSubjects;

    // Calculate optimal study frequency
    const avgInterval = this.retentionData.reduce((sum, item) => sum + item.stability, 0) / this.retentionData.length;
    insights.optimalStudyFrequency = Math.round(avgInterval);
  }

  // Generate retention recommendations
  generateRetentionRecommendations(): RetentionRecommendation[] {
    if (!this.retentionPattern) return [];

    const recommendations: RetentionRecommendation[] = [];
    const now = new Date();

    // Overdue reviews
    const overdueItems = this.retentionData.filter(item => 
      item.nextReview < now && item.masteryLevel !== 'expert'
    );

    overdueItems.forEach(item => {
      const daysOverdue = Math.floor((now.getTime() - item.nextReview.getTime()) / (1000 * 60 * 60 * 24));
      
      recommendations.push({
        id: `overdue-${item.id}`,
        type: 'review',
        priority: daysOverdue > 7 ? 'urgent' : 'high',
        title: `Review Overdue: ${item.concept}`,
        description: `Review "${item.concept}" in ${item.subject} - it's ${daysOverdue} days overdue.`,
        reasoning: `Your retention for this concept is likely declining. Immediate review needed to maintain learning.`,
        target: {
          subject: item.subject,
          topic: item.topic,
          concept: item.concept,
          masteryLevel: item.masteryLevel
        },
        implementation: {
          steps: [
            'Review the concept immediately',
            'Test your understanding with practice questions',
            'Identify any knowledge gaps',
            'Schedule follow-up review in 1-2 days'
          ],
          estimatedTime: '10-15 minutes',
          difficulty: 'easy',
          resources: ['Study notes', 'Practice questions', 'Concept explanations']
        },
        expectedOutcomes: {
          retentionImprovement: 20,
          masteryAdvancement: item.masteryLevel === 'new' ? 'learning' : item.masteryLevel,
          timeToMastery: '1-2 weeks'
        },
        urgency: {
          daysUntilForgetting: -daysOverdue,
          reviewOverdue: true,
          conceptDifficulty: item.difficulty
        },
        timestamp: new Date()
      });
    });

    // Low retention concepts
    const lowRetentionItems = this.retentionData.filter(item => 
      item.retrievability < 0.6 && item.masteryLevel !== 'expert'
    );

    lowRetentionItems.forEach(item => {
      recommendations.push({
        id: `low-retention-${item.id}`,
        type: 'practice',
        priority: 'medium',
        title: `Improve Retention: ${item.concept}`,
        description: `Focus on improving retention for "${item.concept}" - current retention is ${Math.round(item.retrievability * 100)}%.`,
        reasoning: `Low retention indicates need for more practice and spaced repetition.`,
        target: {
          subject: item.subject,
          concept: item.concept,
          masteryLevel: item.masteryLevel
        },
        implementation: {
          steps: [
            'Practice with varied question types',
            'Use active recall techniques',
            'Create connections to other concepts',
            'Increase review frequency temporarily'
          ],
          estimatedTime: '20-30 minutes',
          difficulty: 'medium',
          resources: ['Practice questions', 'Concept maps', 'Flashcards', 'Study groups']
        },
        expectedOutcomes: {
          retentionImprovement: 25,
          masteryAdvancement: item.masteryLevel === 'learning' ? 'practicing' : item.masteryLevel,
          timeToMastery: '2-3 weeks'
        },
        urgency: {
          daysUntilForgetting: Math.round(item.stability * 0.5),
          reviewOverdue: false,
          conceptDifficulty: item.difficulty
        },
        timestamp: new Date()
      });
    });

    // Consolidation recommendations
    const learningItems = this.retentionData.filter(item => 
      item.masteryLevel === 'learning' && item.reviewCount >= 2
    );

    learningItems.forEach(item => {
      recommendations.push({
        id: `consolidate-${item.id}`,
        type: 'consolidate',
        priority: 'medium',
        title: `Consolidate Learning: ${item.concept}`,
        description: `Consolidate your understanding of "${item.concept}" to advance to practicing level.`,
        reasoning: `You've reviewed this concept multiple times but haven't reached practicing level yet.`,
        target: {
          subject: item.subject,
          concept: item.concept,
          masteryLevel: item.masteryLevel
        },
        implementation: {
          steps: [
            'Create a comprehensive summary of the concept',
            'Explain the concept to someone else',
            'Apply the concept in different contexts',
            'Connect it to related concepts'
          ],
          estimatedTime: '25-35 minutes',
          difficulty: 'medium',
          resources: ['Study materials', 'Practice problems', 'Concept explanations']
        },
        expectedOutcomes: {
          retentionImprovement: 15,
          masteryAdvancement: 'practicing',
          timeToMastery: '1-2 weeks'
        },
        urgency: {
          daysUntilForgetting: Math.round(item.stability),
          reviewOverdue: false,
          conceptDifficulty: item.difficulty
        },
        timestamp: new Date()
      });
    });

    return recommendations;
  }

  // Get concepts due for review
  getConceptsDueForReview(): RetentionData[] {
    const now = new Date();
    return this.retentionData.filter(item => 
      item.nextReview <= now && item.masteryLevel !== 'expert'
    );
  }

  // Get forgetting curves for visualization
  getForgettingCurves(): { [conceptId: string]: ForgettingCurveAnalysis } {
    return this.forgettingCurves;
  }

  // Public methods
  getRetentionPattern(): RetentionPattern | null {
    return this.retentionPattern;
  }

  getRetentionData(): RetentionData[] {
    return this.retentionData;
  }

  getRetentionRecommendations(): RetentionRecommendation[] {
    return this.generateRetentionRecommendations();
  }

  // Save data to localStorage
  private saveRetentionData(): void {
    localStorage.setItem('retentionData', JSON.stringify(this.retentionData));
  }

  private saveRetentionPattern(): void {
    localStorage.setItem('retentionPattern', JSON.stringify(this.retentionPattern));
  }

  private saveForgettingCurves(): void {
    localStorage.setItem('forgettingCurves', JSON.stringify(this.forgettingCurves));
  }
}

export const retentionPatternAnalysis = new RetentionPatternAnalysis();
