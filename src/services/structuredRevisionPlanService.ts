import { groqApiService } from './groqApiService';

export interface Mission {
  id: string;
  day: number;
  topic: string;
  emoji: string;
  focus: string;
  activities: Activity[];
  rewards: Rewards;
  aiRecommendations: string;
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  xpEarned: number;
}

export interface Activity {
  id: string;
  title: string;
  type: 'reading' | 'video' | 'flashcards' | 'quiz' | 'game' | 'simulation' | 'contest';
  duration: number; // in minutes
  description: string;
  completed: boolean;
  xpValue: number;
}

export interface Rewards {
  xp: number;
  badge?: string;
  tutaCoins?: number;
  unlockContent?: string;
}

export interface WeeklyPlan {
  week: number;
  title: string;
  description: string;
  missions: Mission[];
  weeklyContest?: WeeklyContest;
}

export interface WeeklyContest {
  title: string;
  description: string;
  duration: number; // in minutes
  questionCount: number;
  xpReward: number;
  badge: string;
  type: 'timed' | 'unlimited';
}

export interface GamificationStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: string[];
  tutaCoins: number;
  level: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AIFeedback {
  message: string;
  type: 'encouragement' | 'suggestion' | 'warning' | 'achievement';
  actionable?: string;
  relatedContent?: string;
}

export interface StructuredRevisionPlan {
  id: string;
  title: string;
  subject: string;
  topic: string;
  duration: string; // e.g., "14 Days (2 Weeks)"
  goal: string;
  weeklyPlans: WeeklyPlan[];
  gamification: GamificationStats;
  aiFeedback: AIFeedback[];
  createdAt: Date;
  currentDay: number;
  totalDays: number;
}

export class StructuredRevisionPlanService {
  async generateStructuredPlan(notes: string, topic: string, subject: string = 'General'): Promise<StructuredRevisionPlan> {
    console.log('🎯 Generating structured revision plan for:', topic);
    console.log('📝 Subject:', subject);
    console.log('📄 Notes:', notes.substring(0, 200) + '...');

    try {
      // Generate the structured plan using AI
      const planData = await this.generatePlanStructure(notes, topic, subject);
      
      // Create the structured plan
      const plan: StructuredRevisionPlan = {
        id: `structured-plan-${Date.now()}`,
        title: `mytuta AI Revision Plan - ${topic}`,
        subject,
        topic,
        duration: '14 Days (2 Weeks)',
        goal: 'Deep Revision + Gamified Learning + Assessment Readiness',
        weeklyPlans: planData.weeklyPlans,
        gamification: {
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
          badgesEarned: [],
          tutaCoins: 0,
          level: 1,
          rank: 'bronze'
        },
        aiFeedback: planData.aiFeedback,
        createdAt: new Date(),
        currentDay: 1,
        totalDays: 14
      };

      console.log('✅ Generated structured revision plan:', plan);
      return plan;

    } catch (error) {
      console.error('Error generating structured revision plan:', error);
      return this.createFallbackStructuredPlan(topic, subject);
    }
  }

  private async generatePlanStructure(notes: string, topic: string, subject: string): Promise<{
    weeklyPlans: WeeklyPlan[];
    aiFeedback: AIFeedback[];
  }> {
    console.log('🔍 Generating plan structure with AI...');

    const prompt = `Create a comprehensive 14-day structured revision plan for the topic "${topic}" in ${subject}.

Based on these notes: ${notes}

Create a plan with this exact structure:

WEEK 1: Foundation Building & Concept Mastery (Days 1-7)
WEEK 2: Application & Advanced Understanding (Days 8-14)

For each day, provide:
- Day number
- Topic/Mission with emoji
- Focus area
- 3-4 specific activities with types (reading, video, flashcards, quiz, game, simulation, contest)
- XP rewards (100-300 XP)
- Badge name
- AI recommendation for next steps

Include weekly contests on days 7 and 14.

Format as structured JSON with this structure:
{
  "weeklyPlans": [
    {
      "week": 1,
      "title": "Foundation Building & Concept Mastery",
      "description": "Build strong foundations",
      "missions": [
        {
          "day": 1,
          "topic": "Topic Name",
          "emoji": "🌱",
          "focus": "What to focus on",
          "activities": [
            {
              "title": "Activity Name",
              "type": "reading|video|flashcards|quiz|game|simulation|contest",
              "duration": 5,
              "description": "What to do",
              "xpValue": 50
            }
          ],
          "rewards": {
            "xp": 100,
            "badge": "Badge Name"
          },
          "aiRecommendations": "Next steps suggestion",
          "estimatedTime": 30,
          "difficulty": "easy|medium|hard"
        }
      ],
      "weeklyContest": {
        "title": "Contest Name",
        "description": "Contest description",
        "duration": 10,
        "questionCount": 20,
        "xpReward": 500,
        "badge": "Contest Badge",
        "type": "timed"
      }
    }
  ],
  "aiFeedback": [
    {
      "message": "Encouraging message",
      "type": "encouragement|suggestion|warning|achievement"
    }
  ]
}`;

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert educational consultant specializing in structured, gamified learning plans. Create detailed, engaging revision plans with clear daily missions, activities, and rewards.'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    const response = await groqApiService.makeRequest(messages);
    console.log('🤖 AI Response:', response.substring(0, 200) + '...');

    try {
      // Try to parse the JSON response
      const cleanedResponse = this.cleanJsonResponse(response);
      const planData = JSON.parse(cleanedResponse);
      
      // Validate and enhance the structure
      const weeklyPlans = this.validateAndEnhanceWeeklyPlans(planData.weeklyPlans || []);
      const aiFeedback = this.validateAndEnhanceAIFeedback(planData.aiFeedback || []);

      return { weeklyPlans, aiFeedback };

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('🔄 Falling back to structured template...');
      return this.createStructuredTemplate(topic, subject);
    }
  }

  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any text before the first {
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  private validateAndEnhanceWeeklyPlans(weeklyPlans: any[]): WeeklyPlan[] {
    return weeklyPlans.map((week, weekIndex) => ({
      week: week.week || weekIndex + 1,
      title: week.title || `Week ${weekIndex + 1}`,
      description: week.description || 'Structured learning week',
      missions: this.validateAndEnhanceMissions(week.missions || []),
      weeklyContest: week.weeklyContest ? this.validateAndEnhanceWeeklyContest(week.weeklyContest) : undefined
    }));
  }

  private validateAndEnhanceMissions(missions: any[]): Mission[] {
    return missions.map((mission, index) => ({
      id: mission.id || `mission-${index + 1}`,
      day: mission.day || index + 1,
      topic: mission.topic || `Mission ${index + 1}`,
      emoji: mission.emoji || '📚',
      focus: mission.focus || 'Focus on key concepts',
      activities: this.validateAndEnhanceActivities(mission.activities || []),
      rewards: {
        xp: mission.rewards?.xp || 100,
        badge: mission.rewards?.badge || 'Learner Badge',
        tutaCoins: mission.rewards?.tutaCoins || 10
      },
      aiRecommendations: mission.aiRecommendations || 'Keep up the great work!',
      estimatedTime: mission.estimatedTime || 30,
      difficulty: mission.difficulty || 'medium',
      completed: false,
      xpEarned: 0
    }));
  }

  private validateAndEnhanceActivities(activities: any[]): Activity[] {
    return activities.map((activity, index) => ({
      id: activity.id || `activity-${index + 1}`,
      title: activity.title || `Activity ${index + 1}`,
      type: this.validateActivityType(activity.type),
      duration: activity.duration || 5,
      description: activity.description || 'Complete this activity',
      completed: false,
      xpValue: activity.xpValue || 25
    }));
  }

  private validateActivityType(type: string): Activity['type'] {
    const validTypes: Activity['type'][] = ['reading', 'video', 'flashcards', 'quiz', 'game', 'simulation', 'contest'];
    return validTypes.includes(type as Activity['type']) ? type as Activity['type'] : 'reading';
  }

  private validateAndEnhanceWeeklyContest(contest: any): WeeklyContest {
    return {
      title: contest.title || 'Weekly Contest',
      description: contest.description || 'Test your knowledge',
      duration: contest.duration || 10,
      questionCount: contest.questionCount || 20,
      xpReward: contest.xpReward || 500,
      badge: contest.badge || 'Contest Winner',
      type: contest.type === 'unlimited' ? 'unlimited' : 'timed'
    };
  }

  private validateAndEnhanceAIFeedback(feedback: any[]): AIFeedback[] {
    return feedback.map(fb => ({
      message: fb.message || 'Keep up the great work!',
      type: this.validateFeedbackType(fb.type),
      actionable: fb.actionable,
      relatedContent: fb.relatedContent
    }));
  }

  private validateFeedbackType(type: string): AIFeedback['type'] {
    const validTypes: AIFeedback['type'][] = ['encouragement', 'suggestion', 'warning', 'achievement'];
    return validTypes.includes(type as AIFeedback['type']) ? type as AIFeedback['type'] : 'encouragement';
  }

  private createStructuredTemplate(topic: string, subject: string): {
    weeklyPlans: WeeklyPlan[];
    aiFeedback: AIFeedback[];
  } {
    console.log('📋 Creating structured template for:', topic);

    const weeklyPlans: WeeklyPlan[] = [
      {
        week: 1,
        title: 'Foundation Building & Concept Mastery',
        description: 'Build strong foundations and master core concepts',
        missions: this.createWeek1Missions(topic),
        weeklyContest: {
          title: 'Week 1 Foundation Contest',
          description: 'Test your understanding of foundational concepts',
          duration: 15,
          questionCount: 20,
          xpReward: 500,
          badge: 'Foundation Master',
          type: 'timed'
        }
      },
      {
        week: 2,
        title: 'Application & Advanced Understanding',
        description: 'Apply knowledge and develop advanced understanding',
        missions: this.createWeek2Missions(topic),
        weeklyContest: {
          title: 'Final Mastery Contest',
          description: 'Comprehensive test of all learned concepts',
          duration: 20,
          questionCount: 25,
          xpReward: 700,
          badge: 'Mastery Champion',
          type: 'timed'
        }
      }
    ];

    const aiFeedback: AIFeedback[] = [
      {
        message: `Welcome to your ${topic} revision journey! You're about to embark on an exciting learning adventure.`,
        type: 'encouragement'
      },
      {
        message: 'Complete daily missions to earn XP and unlock new content. Consistency is key!',
        type: 'suggestion',
        actionable: 'Start with Day 1 mission'
      }
    ];

    return { weeklyPlans, aiFeedback };
  }

  private createWeek1Missions(topic: string): Mission[] {
    const baseMissions = [
      {
        day: 1,
        topic: `Introduction to ${topic}`,
        emoji: '🌱',
        focus: 'Understand basic concepts and terminology',
        activities: [
          { title: 'Read AI Summary', type: 'reading', duration: 5, description: 'Review key concepts', xpValue: 25 },
          { title: 'Watch Concept Video', type: 'video', duration: 8, description: 'Visual learning', xpValue: 30 },
          { title: 'Flashcard Review', type: 'flashcards', duration: 10, description: 'Test your memory', xpValue: 40 },
          { title: 'Quick Quiz', type: 'quiz', duration: 7, description: 'Check understanding', xpValue: 35 }
        ],
        rewards: { xp: 130, badge: 'Foundation Starter' },
        aiRecommendations: 'Great start! Move to advanced concepts next.',
        estimatedTime: 30,
        difficulty: 'easy' as const
      },
      {
        day: 2,
        topic: `Core Concepts of ${topic}`,
        emoji: '🔬',
        focus: 'Master fundamental principles',
        activities: [
          { title: 'Study Notes', type: 'reading', duration: 10, description: 'Deep dive into concepts', xpValue: 35 },
          { title: 'Interactive Simulation', type: 'simulation', duration: 12, description: 'Explore concepts', xpValue: 45 },
          { title: 'Practice Quiz', type: 'quiz', duration: 8, description: 'Test knowledge', xpValue: 40 }
        ],
        rewards: { xp: 120, badge: 'Concept Master' },
        aiRecommendations: 'Excellent progress! Ready for practical applications.',
        estimatedTime: 30,
        difficulty: 'medium' as const
      }
    ];

    return baseMissions.map((mission, index) => ({
      id: `week1-mission-${index + 1}`,
      day: mission.day,
      topic: mission.topic,
      emoji: mission.emoji,
      focus: mission.focus,
      activities: mission.activities.map((activity, actIndex) => ({
        id: `week1-${index + 1}-activity-${actIndex + 1}`,
        title: activity.title,
        type: activity.type,
        duration: activity.duration,
        description: activity.description,
        completed: false,
        xpValue: activity.xpValue
      })),
      rewards: mission.rewards,
      aiRecommendations: mission.aiRecommendations,
      estimatedTime: mission.estimatedTime,
      difficulty: mission.difficulty,
      completed: false,
      xpEarned: 0
    }));
  }

  private createWeek2Missions(topic: string): Mission[] {
    const baseMissions = [
      {
        day: 8,
        topic: `Advanced ${topic} Concepts`,
        emoji: '💡',
        focus: 'Apply knowledge to complex scenarios',
        activities: [
          { title: 'Advanced Reading', type: 'reading', duration: 12, description: 'Complex concepts', xpValue: 40 },
          { title: 'Problem Solving', type: 'game', duration: 15, description: 'Apply knowledge', xpValue: 50 },
          { title: 'Advanced Quiz', type: 'quiz', duration: 10, description: 'Challenge yourself', xpValue: 45 }
        ],
        rewards: { xp: 135, badge: 'Advanced Learner' },
        aiRecommendations: 'Outstanding! You\'re ready for the final challenges.',
        estimatedTime: 37,
        difficulty: 'hard' as const
      },
      {
        day: 14,
        topic: `Mastery Assessment`,
        emoji: '🏁',
        focus: 'Demonstrate complete understanding',
        activities: [
          { title: 'Final Review', type: 'reading', duration: 15, description: 'Comprehensive review', xpValue: 50 },
          { title: 'Final Contest', type: 'contest', duration: 20, description: 'Ultimate challenge', xpValue: 100 }
        ],
        rewards: { xp: 150, badge: 'Mastery Champion' },
        aiRecommendations: 'Congratulations! You\'ve mastered this topic!',
        estimatedTime: 35,
        difficulty: 'hard' as const
      }
    ];

    return baseMissions.map((mission, index) => ({
      id: `week2-mission-${index + 1}`,
      day: mission.day,
      topic: mission.topic,
      emoji: mission.emoji,
      focus: mission.focus,
      activities: mission.activities.map((activity, actIndex) => ({
        id: `week2-${index + 1}-activity-${actIndex + 1}`,
        title: activity.title,
        type: activity.type,
        duration: activity.duration,
        description: activity.description,
        completed: false,
        xpValue: activity.xpValue
      })),
      rewards: mission.rewards,
      aiRecommendations: mission.aiRecommendations,
      estimatedTime: mission.estimatedTime,
      difficulty: mission.difficulty,
      completed: false,
      xpEarned: 0
    }));
  }

  private createFallbackStructuredPlan(topic: string, subject: string): StructuredRevisionPlan {
    console.log('🔄 Creating fallback structured plan for:', topic);
    
    const template = this.createStructuredTemplate(topic, subject);
    
    return {
      id: `fallback-structured-plan-${Date.now()}`,
      title: `mytuta AI Revision Plan - ${topic}`,
      subject,
      topic,
      duration: '14 Days (2 Weeks)',
      goal: 'Deep Revision + Gamified Learning + Assessment Readiness',
      weeklyPlans: template.weeklyPlans,
      gamification: {
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        badgesEarned: [],
        tutaCoins: 0,
        level: 1,
        rank: 'bronze'
      },
      aiFeedback: template.aiFeedback,
      createdAt: new Date(),
      currentDay: 1,
      totalDays: 14
    };
  }

  // Utility methods for plan management
  completeMission(plan: StructuredRevisionPlan, missionId: string): StructuredRevisionPlan {
    const updatedPlan = { ...plan };
    
    updatedPlan.weeklyPlans = updatedPlan.weeklyPlans.map(week => ({
      ...week,
      missions: week.missions.map(mission => {
        if (mission.id === missionId) {
          const completedMission = {
            ...mission,
            completed: true,
            xpEarned: mission.rewards.xp
          };
          
          // Update gamification stats
          updatedPlan.gamification.totalXP += mission.rewards.xp;
          updatedPlan.gamification.tutaCoins += mission.rewards.tutaCoins || 10;
          updatedPlan.gamification.currentStreak += 1;
          
          if (mission.rewards.badge) {
            updatedPlan.gamification.badgesEarned.push(mission.rewards.badge);
          }
          
          return completedMission;
        }
        return mission;
      })
    }));
    
    return updatedPlan;
  }

  completeActivity(plan: StructuredRevisionPlan, activityId: string): StructuredRevisionPlan {
    const updatedPlan = { ...plan };
    
    updatedPlan.weeklyPlans = updatedPlan.weeklyPlans.map(week => ({
      ...week,
      missions: week.missions.map(mission => ({
        ...mission,
        activities: mission.activities.map(activity => {
          if (activity.id === activityId) {
            const completedActivity = { ...activity, completed: true };
            
            // Update gamification stats
            updatedPlan.gamification.totalXP += activity.xpValue;
            
            return completedActivity;
          }
          return activity;
        })
      }))
    }));
    
    return updatedPlan;
  }

  generateDailyAIFeedback(plan: StructuredRevisionPlan): AIFeedback {
    const totalXP = plan.gamification.totalXP;
    const currentStreak = plan.gamification.currentStreak;
    const badgesCount = plan.gamification.badgesEarned.length;
    
    if (currentStreak >= 7) {
      return {
        message: `🔥 Amazing! You've maintained a ${currentStreak}-day streak! You're unstoppable!`,
        type: 'achievement',
        actionable: 'Keep the momentum going!'
      };
    }
    
    if (totalXP >= 1000) {
      return {
        message: `🎉 Congratulations! You've earned ${totalXP} XP! You're becoming a true scholar!`,
        type: 'achievement',
        actionable: 'Unlock new challenges!'
      };
    }
    
    if (badgesCount >= 5) {
      return {
        message: `🏅 Fantastic! You've earned ${badgesCount} badges! Your dedication is impressive!`,
        type: 'achievement',
        actionable: 'Show off your achievements!'
      };
    }
    
    const encouragingMessages = [
      "You're doing great! Every step forward is progress.",
      "Keep pushing forward! Your future self will thank you.",
      "Learning is a journey, not a destination. Enjoy the process!",
      "You're building knowledge that will last a lifetime.",
      "Every expert was once a beginner. Keep going!"
    ];
    
    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    
    return {
      message: randomMessage,
      type: 'encouragement',
      actionable: 'Complete your next mission!'
    };
  }
}

export const structuredRevisionPlanService = new StructuredRevisionPlanService();
