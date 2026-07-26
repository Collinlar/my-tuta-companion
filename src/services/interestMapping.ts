import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface InterestData {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  concept: string;
  interestLevel: number; // 0-100
  engagementScore: number; // 0-100
  timeSpent: number; // minutes
  interactionCount: number;
  lastInteraction: Date;
  engagementHistory: {
    timestamp: Date;
    engagementScore: number;
    duration: number;
    activity: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  relatedInterests: string[];
  difficulty: number; // 1-10
  masteryLevel: 'new' | 'learning' | 'practicing' | 'mastered' | 'expert';
  interestTrend: 'increasing' | 'stable' | 'decreasing';
  confidence: number; // 0-100
}

export interface EngagementPattern {
  overallEngagement: number; // 0-100
  averageSessionDuration: number; // minutes
  peakEngagementTime: number; // hour of day
  engagementBySubject: {
    [subject: string]: {
      engagement: number;
      timeSpent: number;
      interactionCount: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    };
  };
  engagementByTopic: {
    [topic: string]: {
      engagement: number;
      timeSpent: number;
      interactionCount: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    };
  };
  engagementByActivity: {
    [activity: string]: {
      engagement: number;
      frequency: number;
      averageDuration: number;
      satisfaction: number;
    };
  };
  motivationalFactors: {
    [factor: string]: {
      impact: number; // 0-100
      frequency: number;
      effectiveness: number; // 0-100
    };
  };
  demotivationalFactors: {
    [factor: string]: {
      impact: number; // 0-100
      frequency: number;
      severity: number; // 0-100
    };
  };
  optimalEngagementConditions: {
    timeOfDay: number[];
    sessionLength: number;
    breakFrequency: number;
    environmentFactors: string[];
    socialFactors: string[];
  };
  lastUpdated: Date;
}

export interface InterestRecommendation {
  id: string;
  type: 'explore' | 'deepen' | 'connect' | 'challenge' | 'gamify' | 'socialize';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reasoning: string;
  target: {
    subject?: string;
    topic?: string;
    concept?: string;
    interestLevel?: number;
  };
  implementation: {
    steps: string[];
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    resources: string[];
    activities: string[];
  };
  expectedOutcomes: {
    engagementIncrease: number;
    interestGrowth: number;
    timeInvestment: string;
    skillDevelopment: string;
  };
  personalization: {
    learningStyle: string[];
    timePreference: string;
    difficultyLevel: string;
    socialPreference: string;
  };
  gamification: {
    points: number;
    badges: string[];
    challenges: string[];
    rewards: string[];
  };
  timestamp: Date;
}

export interface InterestCluster {
  id: string;
  name: string;
  topics: string[];
  concepts: string[];
  averageInterest: number;
  averageEngagement: number;
  trend: 'growing' | 'stable' | 'declining';
  connections: string[]; // related clusters
  opportunities: string[];
  challenges: string[];
}

export class InterestMapping {
  private userProfile: UserProfile | null = null;
  private interestData: InterestData[] = [];
  private engagementPattern: EngagementPattern | null = null;
  private studySessions: StudySession[] = [];
  private interestClusters: InterestCluster[] = [];

  constructor() {
    this.loadUserData();
    this.initializeEngagementPattern();
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

      const interestData = localStorage.getItem('interestData');
      if (interestData) {
        this.interestData = JSON.parse(interestData).map((d: any) => ({
          ...d,
          lastInteraction: new Date(d.lastInteraction),
          engagementHistory: d.engagementHistory.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp)
          }))
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

      const pattern = localStorage.getItem('engagementPattern');
      if (pattern) {
        this.engagementPattern = {
          ...JSON.parse(pattern),
          lastUpdated: new Date(JSON.parse(pattern).lastUpdated)
        };
      }

      const clusters = localStorage.getItem('interestClusters');
      if (clusters) {
        this.interestClusters = JSON.parse(clusters);
      }
    } catch (error) {
      console.error('Error loading interest mapping data:', error);
    }
  }

  private initializeEngagementPattern(): void {
    this.engagementPattern = {
      overallEngagement: 50,
      averageSessionDuration: 30,
      peakEngagementTime: 14, // 2 PM default
      engagementBySubject: {},
      engagementByTopic: {},
      engagementByActivity: {
        'reading': { engagement: 50, frequency: 0, averageDuration: 15, satisfaction: 50 },
        'watching': { engagement: 60, frequency: 0, averageDuration: 20, satisfaction: 60 },
        'practicing': { engagement: 70, frequency: 0, averageDuration: 25, satisfaction: 70 },
        'discussing': { engagement: 80, frequency: 0, averageDuration: 30, satisfaction: 80 },
        'creating': { engagement: 85, frequency: 0, averageDuration: 35, satisfaction: 85 }
      },
      motivationalFactors: {
        'achievement': { impact: 70, frequency: 0, effectiveness: 70 },
        'progress': { impact: 65, frequency: 0, effectiveness: 65 },
        'challenge': { impact: 60, frequency: 0, effectiveness: 60 },
        'social': { impact: 55, frequency: 0, effectiveness: 55 },
        'creativity': { impact: 75, frequency: 0, effectiveness: 75 }
      },
      demotivationalFactors: {
        'difficulty': { impact: 40, frequency: 0, severity: 40 },
        'repetition': { impact: 35, frequency: 0, severity: 35 },
        'isolation': { impact: 30, frequency: 0, severity: 30 },
        'time_pressure': { impact: 45, frequency: 0, severity: 45 }
      },
      optimalEngagementConditions: {
        timeOfDay: [14, 15, 16], // 2-4 PM default
        sessionLength: 30,
        breakFrequency: 1,
        environmentFactors: ['quiet', 'comfortable'],
        socialFactors: ['occasional_interaction']
      },
      lastUpdated: new Date()
    };

    // Initialize subject engagement if user profile exists
    if (this.userProfile) {
      (this.userProfile.subjects || []).forEach(subject => {
        this.engagementPattern!.engagementBySubject[subject] = {
          engagement: 50,
          timeSpent: 0,
          interactionCount: 0,
          trend: 'stable'
        };
      });
    }
  }

  // Record interest and engagement data
  recordEngagement(conceptId: string, subject: string, topic: string, concept: string,
                  engagement: { score: number; duration: number; activity: string; sentiment: 'positive' | 'neutral' | 'negative' }): void {
    
    const now = new Date();
    let interestItem = this.interestData.find(item => item.id === conceptId);

    if (!interestItem) {
      // New interest
      interestItem = {
        id: conceptId,
        subject,
        topic,
        concept,
        interestLevel: 50,
        engagementScore: engagement.score,
        timeSpent: engagement.duration,
        interactionCount: 1,
        lastInteraction: now,
        engagementHistory: [{
          timestamp: now,
          engagementScore: engagement.score,
          duration: engagement.duration,
          activity: engagement.activity,
          sentiment: engagement.sentiment
        }],
        relatedInterests: [],
        difficulty: 5,
        masteryLevel: 'new',
        interestTrend: 'stable',
        confidence: 20
      };
      this.interestData.push(interestItem);
    } else {
      // Update existing interest
      interestItem.interactionCount++;
      interestItem.timeSpent += engagement.duration;
      interestItem.lastInteraction = now;
      
      // Update engagement score with weighted average
      const weight = Math.min(0.3, 1 / interestItem.interactionCount);
      interestItem.engagementScore = (interestItem.engagementScore * (1 - weight)) + (engagement.score * weight);
      
      // Add to engagement history
      interestItem.engagementHistory.push({
        timestamp: now,
        engagementScore: engagement.score,
        duration: engagement.duration,
        activity: engagement.activity,
        sentiment: engagement.sentiment
      });
      
      // Keep only last 20 interactions
      if (interestItem.engagementHistory.length > 20) {
        interestItem.engagementHistory = interestItem.engagementHistory.slice(-20);
      }
      
      // Update interest level based on engagement
      this.updateInterestLevel(interestItem, engagement);
      
      // Update confidence
      interestItem.confidence = Math.min(100, 20 + (interestItem.interactionCount * 4));
    }

    this.saveInterestData();
    this.updateEngagementPattern();
    this.updateInterestClusters();
  }

  private updateInterestLevel(interestItem: InterestData, engagement: { score: number; duration: number; activity: string; sentiment: 'positive' | 'neutral' | 'negative' }): void {
    // Interest level changes based on engagement and sentiment
    let interestChange = 0;
    
    // Base change from engagement score
    if (engagement.score >= 80) {
      interestChange = 5;
    } else if (engagement.score >= 60) {
      interestChange = 2;
    } else if (engagement.score >= 40) {
      interestChange = 0;
    } else {
      interestChange = -2;
    }
    
    // Sentiment modifier
    switch (engagement.sentiment) {
      case 'positive':
        interestChange += 3;
        break;
      case 'negative':
        interestChange -= 3;
        break;
      case 'neutral':
        // No change
        break;
    }
    
    // Duration modifier (longer engagement = higher interest)
    if (engagement.duration > 30) {
      interestChange += 2;
    } else if (engagement.duration < 10) {
      interestChange -= 1;
    }
    
    // Apply change with bounds
    interestItem.interestLevel = Math.max(0, Math.min(100, interestItem.interestLevel + interestChange));
    
    // Update trend
    const recentEngagement = interestItem.engagementHistory.slice(-5);
    if (recentEngagement.length >= 3) {
      const recentAvg = recentEngagement.reduce((sum, h) => sum + h.engagementScore, 0) / recentEngagement.length;
      const olderAvg = interestItem.engagementHistory.slice(-10, -5).reduce((sum, h) => sum + h.engagementScore, 0) / 5;
      
      if (recentAvg > olderAvg + 10) {
        interestItem.interestTrend = 'increasing';
      } else if (recentAvg < olderAvg - 10) {
        interestItem.interestTrend = 'decreasing';
      } else {
        interestItem.interestTrend = 'stable';
      }
    }
  }

  private updateEngagementPattern(): void {
    if (!this.engagementPattern || this.interestData.length === 0) return;

    // Calculate overall engagement
    const totalEngagement = this.interestData.reduce((sum, item) => sum + item.engagementScore, 0);
    this.engagementPattern.overallEngagement = totalEngagement / this.interestData.length;

    // Calculate average session duration
    const totalTime = this.interestData.reduce((sum, item) => sum + item.timeSpent, 0);
    const totalInteractions = this.interestData.reduce((sum, item) => sum + item.interactionCount, 0);
    this.engagementPattern.averageSessionDuration = totalInteractions > 0 ? totalTime / totalInteractions : 30;

    // Update subject engagement
    const subjectGroups: { [subject: string]: InterestData[] } = {};
    this.interestData.forEach(item => {
      if (!subjectGroups[item.subject]) {
        subjectGroups[item.subject] = [];
      }
      subjectGroups[item.subject].push(item);
    });

    Object.entries(subjectGroups).forEach(([subject, items]) => {
      const avgEngagement = items.reduce((sum, item) => sum + item.engagementScore, 0) / items.length;
      const totalTime = items.reduce((sum, item) => sum + item.timeSpent, 0);
      const totalInteractions = items.reduce((sum, item) => sum + item.interactionCount, 0);
      
      // Calculate trend
      const recentItems = items.filter(item => {
        const daysSince = (new Date().getTime() - item.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      
      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (recentItems.length > 0) {
        const recentAvg = recentItems.reduce((sum, item) => sum + item.engagementScore, 0) / recentItems.length;
        const olderAvg = items.filter(item => !recentItems.includes(item)).reduce((sum, item) => sum + item.engagementScore, 0) / Math.max(1, items.length - recentItems.length);
        
        if (recentAvg > olderAvg + 10) {
          trend = 'increasing';
        } else if (recentAvg < olderAvg - 10) {
          trend = 'decreasing';
        }
      }

      this.engagementPattern!.engagementBySubject[subject] = {
        engagement: avgEngagement,
        timeSpent: totalTime,
        interactionCount: totalInteractions,
        trend
      };
    });

    // Update topic engagement
    const topicGroups: { [topic: string]: InterestData[] } = {};
    this.interestData.forEach(item => {
      if (!topicGroups[item.topic]) {
        topicGroups[item.topic] = [];
      }
      topicGroups[item.topic].push(item);
    });

    Object.entries(topicGroups).forEach(([topic, items]) => {
      const avgEngagement = items.reduce((sum, item) => sum + item.engagementScore, 0) / items.length;
      const totalTime = items.reduce((sum, item) => sum + item.timeSpent, 0);
      const totalInteractions = items.reduce((sum, item) => sum + item.interactionCount, 0);
      
      // Calculate trend
      const recentItems = items.filter(item => {
        const daysSince = (new Date().getTime() - item.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      
      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (recentItems.length > 0) {
        const recentAvg = recentItems.reduce((sum, item) => sum + item.engagementScore, 0) / recentItems.length;
        const olderAvg = items.filter(item => !recentItems.includes(item)).reduce((sum, item) => sum + item.engagementScore, 0) / Math.max(1, items.length - recentItems.length);
        
        if (recentAvg > olderAvg + 10) {
          trend = 'increasing';
        } else if (recentAvg < olderAvg - 10) {
          trend = 'decreasing';
        }
      }

      this.engagementPattern!.engagementByTopic[topic] = {
        engagement: avgEngagement,
        timeSpent: totalTime,
        interactionCount: totalInteractions,
        trend
      };
    });

    // Update activity engagement
    const activityGroups: { [activity: string]: any[] } = {};
    this.interestData.forEach(item => {
      item.engagementHistory.forEach(history => {
        if (!activityGroups[history.activity]) {
          activityGroups[history.activity] = [];
        }
        activityGroups[history.activity].push(history);
      });
    });

    Object.entries(activityGroups).forEach(([activity, histories]) => {
      const avgEngagement = histories.reduce((sum, h) => sum + h.engagementScore, 0) / histories.length;
      const avgDuration = histories.reduce((sum, h) => sum + h.duration, 0) / histories.length;
      const satisfaction = histories.filter(h => h.sentiment === 'positive').length / histories.length * 100;

      this.engagementPattern!.engagementByActivity[activity] = {
        engagement: avgEngagement,
        frequency: histories.length,
        averageDuration: avgDuration,
        satisfaction
      };
    });

    this.engagementPattern.lastUpdated = new Date();
    this.saveEngagementPattern();
  }

  private updateInterestClusters(): void {
    // Group related interests into clusters
    const clusters: { [key: string]: InterestData[] } = {};
    
    this.interestData.forEach(item => {
      // Simple clustering by subject and topic
      const clusterKey = `${item.subject}-${item.topic}`;
      if (!clusters[clusterKey]) {
        clusters[clusterKey] = [];
      }
      clusters[clusterKey].push(item);
    });

    this.interestClusters = Object.entries(clusters).map(([key, items]) => {
      const avgInterest = items.reduce((sum, item) => sum + item.interestLevel, 0) / items.length;
      const avgEngagement = items.reduce((sum, item) => sum + item.engagementScore, 0) / items.length;
      
      // Calculate trend
      const recentItems = items.filter(item => {
        const daysSince = (new Date().getTime() - item.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      
      let trend: 'growing' | 'stable' | 'declining' = 'stable';
      if (recentItems.length > 0) {
        const recentAvg = recentItems.reduce((sum, item) => sum + item.interestLevel, 0) / recentItems.length;
        const olderAvg = items.filter(item => !recentItems.includes(item)).reduce((sum, item) => sum + item.interestLevel, 0) / Math.max(1, items.length - recentItems.length);
        
        if (recentAvg > olderAvg + 10) {
          trend = 'growing';
        } else if (recentAvg < olderAvg - 10) {
          trend = 'declining';
        }
      }

      return {
        id: key,
        name: `${items[0].subject} - ${items[0].topic}`,
        topics: [...new Set(items.map(item => item.topic))],
        concepts: items.map(item => item.concept),
        averageInterest: avgInterest,
        averageEngagement: avgEngagement,
        trend,
        connections: [],
        opportunities: [],
        challenges: []
      };
    });

    this.saveInterestClusters();
  }

  // Generate interest-based recommendations
  generateInterestRecommendations(): InterestRecommendation[] {
    if (!this.engagementPattern) return [];

    const recommendations: InterestRecommendation[] = [];

    // High interest, low engagement - explore deeper
    const highInterestLowEngagement = this.interestData.filter(item => 
      item.interestLevel >= 70 && item.engagementScore < 60
    );

    highInterestLowEngagement.forEach(item => {
      recommendations.push({
        id: `explore-${item.id}`,
        type: 'explore',
        priority: 'high',
        title: `Explore ${item.concept} Further`,
        description: `You have high interest in ${item.concept} but low engagement. Let's find more engaging ways to explore this topic.`,
        reasoning: `High interest (${item.interestLevel}%) but low engagement (${Math.round(item.engagementScore)}%) suggests need for different approach.`,
        target: {
          subject: item.subject,
          topic: item.topic,
          concept: item.concept,
          interestLevel: item.interestLevel
        },
        implementation: {
          steps: [
            'Try different learning activities for this concept',
            'Look for interactive resources and simulations',
            'Connect this concept to your existing interests',
            'Experiment with creative approaches'
          ],
          estimatedTime: '30-45 minutes',
          difficulty: 'medium',
          resources: ['Interactive simulations', 'Creative projects', 'Real-world applications'],
          activities: ['Hands-on experiments', 'Creative projects', 'Discussion groups', 'Visual storytelling']
        },
        expectedOutcomes: {
          engagementIncrease: 25,
          interestGrowth: 10,
          timeInvestment: '30-45 minutes',
          skillDevelopment: 'Creative thinking and application'
        },
        personalization: {
          learningStyle: ['visual', 'kinesthetic'],
          timePreference: 'flexible',
          difficultyLevel: 'adaptive',
          socialPreference: 'optional'
        },
        gamification: {
          points: 100,
          badges: ['Explorer', 'Creative Thinker'],
          challenges: ['Find 3 real-world applications', 'Create a visual representation'],
          rewards: ['Unlock advanced content', 'Access to expert resources']
        },
        timestamp: new Date()
      });
    });

    // Low interest, high engagement - connect to interests
    const lowInterestHighEngagement = this.interestData.filter(item => 
      item.interestLevel < 50 && item.engagementScore >= 70
    );

    lowInterestHighEngagement.forEach(item => {
      recommendations.push({
        id: `connect-${item.id}`,
        type: 'connect',
        priority: 'medium',
        title: `Connect ${item.concept} to Your Interests`,
        description: `You engage well with ${item.concept} but interest is low. Let's connect it to topics you're passionate about.`,
        reasoning: `Low interest (${item.interestLevel}%) but high engagement (${Math.round(item.engagementScore)}%) suggests good learning potential.`,
        target: {
          subject: item.subject,
          topic: item.topic,
          concept: item.concept,
          interestLevel: item.interestLevel
        },
        implementation: {
          steps: [
            'Find connections to your high-interest topics',
            'Look for applications in areas you care about',
            'Create personal projects involving this concept',
            'Share your learning with others'
          ],
          estimatedTime: '20-30 minutes',
          difficulty: 'easy',
          resources: ['Connection mapping tools', 'Personal project ideas', 'Community discussions'],
          activities: ['Mind mapping', 'Project creation', 'Peer teaching', 'Interest journaling']
        },
        expectedOutcomes: {
          engagementIncrease: 15,
          interestGrowth: 20,
          timeInvestment: '20-30 minutes',
          skillDevelopment: 'Critical thinking and connections'
        },
        personalization: {
          learningStyle: ['visual', 'reading'],
          timePreference: 'flexible',
          difficultyLevel: 'easy',
          socialPreference: 'encouraged'
        },
        gamification: {
          points: 75,
          badges: ['Connector', 'Bridge Builder'],
          challenges: ['Find 5 connections', 'Create a mind map'],
          rewards: ['Access to related content', 'Community recognition']
        },
        timestamp: new Date()
      });
    });

    // Declining interest - re-engage
    const decliningInterest = this.interestData.filter(item => 
      item.interestTrend === 'decreasing' && item.interestLevel > 30
    );

    decliningInterest.forEach(item => {
      recommendations.push({
        id: `reengage-${item.id}`,
        type: 'gamify',
        priority: 'medium',
        title: `Re-engage with ${item.concept}`,
        description: `Your interest in ${item.concept} is declining. Let's add some fun elements to rekindle your enthusiasm.`,
        reasoning: `Interest trend is decreasing, but current level (${item.interestLevel}%) suggests potential for recovery.`,
        target: {
          subject: item.subject,
          topic: item.topic,
          concept: item.concept,
          interestLevel: item.interestLevel
        },
        implementation: {
          steps: [
            'Add gamification elements to your study',
            'Set up challenges and rewards',
            'Find study partners or groups',
            'Try new learning formats'
          ],
          estimatedTime: '25-35 minutes',
          difficulty: 'easy',
          resources: ['Gamification tools', 'Study groups', 'Challenge platforms'],
          activities: ['Quiz competitions', 'Progress tracking', 'Achievement systems', 'Social learning']
        },
        expectedOutcomes: {
          engagementIncrease: 30,
          interestGrowth: 15,
          timeInvestment: '25-35 minutes',
          skillDevelopment: 'Motivation and persistence'
        },
        personalization: {
          learningStyle: ['kinesthetic', 'auditory'],
          timePreference: 'structured',
          difficultyLevel: 'easy',
          socialPreference: 'encouraged'
        },
        gamification: {
          points: 150,
          badges: ['Comeback Kid', 'Motivated Learner'],
          challenges: ['Complete a week streak', 'Achieve 80% accuracy'],
          rewards: ['Unlock new content', 'Special recognition', 'Study buddy matching']
        },
        timestamp: new Date()
      });
    });

    return recommendations;
  }

  // Get high-interest topics for exploration
  getHighInterestTopics(limit: number = 5): InterestData[] {
    return this.interestData
      .filter(item => item.interestLevel >= 70)
      .sort((a, b) => b.interestLevel - a.interestLevel)
      .slice(0, limit);
  }

  // Get trending interests (increasing trend)
  getTrendingInterests(limit: number = 5): InterestData[] {
    return this.interestData
      .filter(item => item.interestTrend === 'increasing')
      .sort((a, b) => b.interestLevel - a.interestLevel)
      .slice(0, limit);
  }

  // Get engagement opportunities (low engagement but high potential)
  getEngagementOpportunities(limit: number = 5): InterestData[] {
    return this.interestData
      .filter(item => item.engagementScore < 60 && item.interestLevel >= 50)
      .sort((a, b) => b.interestLevel - a.interestLevel)
      .slice(0, limit);
  }

  // Public methods
  getEngagementPattern(): EngagementPattern | null {
    return this.engagementPattern;
  }

  getInterestData(): InterestData[] {
    return this.interestData;
  }

  getInterestClusters(): InterestCluster[] {
    return this.interestClusters;
  }

  getInterestRecommendations(): InterestRecommendation[] {
    return this.generateInterestRecommendations();
  }

  // Save data to localStorage
  private saveInterestData(): void {
    localStorage.setItem('interestData', JSON.stringify(this.interestData));
  }

  private saveEngagementPattern(): void {
    localStorage.setItem('engagementPattern', JSON.stringify(this.engagementPattern));
  }

  private saveInterestClusters(): void {
    localStorage.setItem('interestClusters', JSON.stringify(this.interestClusters));
  }
}

export const interestMapping = new InterestMapping();
