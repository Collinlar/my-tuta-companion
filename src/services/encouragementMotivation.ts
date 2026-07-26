import { moodDetection, MoodData, MoodType } from './moodDetection';
import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface EncouragementMessage {
  id: string;
  type: EncouragementType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  context: EncouragementContext;
  triggers: string[];
  expectedImpact: {
    moodImprovement: number; // 0-100
    motivationBoost: number; // 0-100
    confidenceIncrease: number; // 0-100
    engagementIncrease: number; // 0-100
  };
  delivery: {
    timing: 'immediate' | 'scheduled' | 'contextual';
    frequency: 'once' | 'daily' | 'weekly' | 'as_needed';
    channels: ('chat' | 'notification' | 'email' | 'push')[];
    personalization: boolean;
  };
  gamification: {
    points: number;
    badges: string[];
    achievements: string[];
    streakBonus: boolean;
  };
  timestamp: Date;
  expiresAt?: Date;
}

export type EncouragementType = 
  | 'achievement_celebration' | 'progress_recognition' | 'effort_appreciation'
  | 'challenge_encouragement' | 'difficulty_support' | 'breakthrough_celebration'
  | 'consistency_praise' | 'improvement_recognition' | 'resilience_acknowledgment'
  | 'creativity_celebration' | 'collaboration_praise' | 'leadership_recognition'
  | 'perseverance_support' | 'growth_mindset' | 'self_compassion'
  | 'goal_reminder' | 'motivation_boost' | 'confidence_building';

export interface EncouragementContext {
  mood: MoodType;
  moodIntensity: number;
  studySession?: {
    duration: number;
    subject: string;
    difficulty: string;
    performance: number;
  };
  recentAchievements: string[];
  currentChallenges: string[];
  learningGoals: string[];
  personalStrengths: string[];
  areasForGrowth: string[];
  socialContext: {
    hasStudyBuddy: boolean;
    recentSocialInteraction: boolean;
    peerSupport: boolean;
  };
  academicContext: {
    recentGrades: number[];
    upcomingDeadlines: number;
    workloadLevel: string;
    stressLevel: number;
  };
}

export interface MotivationStrategy {
  id: string;
  name: string;
  description: string;
  targetMoods: MoodType[];
  effectiveness: number; // 0-100
  implementation: {
    triggers: string[];
    actions: string[];
    timing: string;
    frequency: string;
  };
  personalization: {
    learningStyle: string[];
    personalityType: string[];
    interests: string[];
  };
  gamification: {
    points: number;
    badges: string[];
    challenges: string[];
  };
}

export interface Achievement {
  id: string;
  type: 'study_streak' | 'subject_mastery' | 'goal_completion' | 'challenge_overcome' | 'social_learning' | 'creative_project';
  title: string;
  description: string;
  criteria: string[];
  reward: {
    points: number;
    badges: string[];
    unlocks: string[];
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: number; // 0-100
}

export class EncouragementMotivationService {
  private encouragementHistory: EncouragementMessage[] = [];
  private motivationStrategies: MotivationStrategy[] = [];
  private achievements: Achievement[] = [];
  private userProfile: UserProfile | null = null;
  private studyStreak: number = 0;
  private lastStudyDate: Date | null = null;

  constructor() {
    this.loadUserData();
    this.initializeMotivationStrategies();
    this.initializeAchievements();
  }

  // Generate encouragement based on current context
  generateEncouragement(context: EncouragementContext): EncouragementMessage[] {
    const encouragements: EncouragementMessage[] = [];

    // Generate mood-specific encouragement
    const moodEncouragements = this.generateMoodSpecificEncouragement(context);
    encouragements.push(...moodEncouragements);

    // Generate achievement-based encouragement
    const achievementEncouragements = this.generateAchievementEncouragement(context);
    encouragements.push(...achievementEncouragements);

    // Generate progress-based encouragement
    const progressEncouragements = this.generateProgressEncouragement(context);
    encouragements.push(...progressEncouragements);

    // Generate challenge-based encouragement
    const challengeEncouragements = this.generateChallengeEncouragement(context);
    encouragements.push(...challengeEncouragements);

    // Generate consistency encouragement
    const consistencyEncouragements = this.generateConsistencyEncouragement(context);
    encouragements.push(...consistencyEncouragements);

    return this.prioritizeEncouragements(encouragements, context);
  }

  // Generate mood-specific encouragement
  private generateMoodSpecificEncouragement(context: EncouragementContext): EncouragementMessage[] {
    const encouragements: EncouragementMessage[] = [];

    switch (context.mood) {
      case 'frustrated':
        encouragements.push(this.createFrustrationEncouragement(context));
        break;
      case 'overwhelmed':
        encouragements.push(this.createOverwhelmedEncouragement(context));
        break;
      case 'discouraged':
        encouragements.push(this.createDiscouragementEncouragement(context));
        break;
      case 'tired':
        encouragements.push(this.createTirednessEncouragement(context));
        break;
      case 'bored':
        encouragements.push(this.createBoredomEncouragement(context));
        break;
      case 'anxious':
        encouragements.push(this.createAnxietyEncouragement(context));
        break;
      case 'stressed':
        encouragements.push(this.createStressEncouragement(context));
        break;
      case 'excited':
      case 'motivated':
      case 'confident':
        encouragements.push(this.createPositiveMoodEncouragement(context));
        break;
    }

    return encouragements;
  }

  // Generate achievement-based encouragement
  private generateAchievementEncouragement(context: EncouragementContext): EncouragementMessage[] {
    const encouragements: EncouragementMessage[] = [];

    // Check for study streak achievements
    if (this.studyStreak >= 7) {
      encouragements.push(this.createStreakAchievementEncouragement(context));
    }

    // Check for subject mastery
    if (context.studySession && context.studySession.performance >= 90) {
      encouragements.push(this.createMasteryEncouragement(context));
    }

    // Check for goal completion
    if (context.learningGoals.length > 0) {
      encouragements.push(this.createGoalProgressEncouragement(context));
    }

    return encouragements;
  }

  // Generate progress-based encouragement
  private generateProgressEncouragement(context: EncouragementContext): EncouragementMessage[] {
    const encouragements: EncouragementMessage[] = [];

    if (context.studySession) {
      const { duration, performance } = context.studySession;

      // Long study session encouragement
      if (duration >= 60) {
        encouragements.push(this.createLongSessionEncouragement(context));
      }

      // Performance improvement encouragement
      if (performance >= 80) {
        encouragements.push(this.createPerformanceEncouragement(context));
      }

      // Effort recognition
      if (duration >= 30 && performance >= 60) {
        encouragements.push(this.createEffortEncouragement(context));
      }
    }

    return encouragements;
  }

  // Generate challenge-based encouragement
  private generateChallengeEncouragement(context: EncouragementContext): EncouragementMessage[] {
    const encouragements: EncouragementMessage[] = [];

    if (context.currentChallenges.length > 0) {
      encouragements.push(this.createChallengeEncouragement(context));
    }

    if (context.studySession && context.studySession.difficulty === 'hard') {
      encouragements.push(this.createDifficultyEncouragement(context));
    }

    return encouragements;
  }

  // Generate consistency encouragement
  private generateConsistencyEncouragement(context: EncouragementContext): EncouragementMessage[] {
    const encouragements: EncouragementMessage[] = [];

    if (this.studyStreak >= 3) {
      encouragements.push(this.createConsistencyEncouragement(context));
    }

    if (context.academicContext.recentGrades.length > 0) {
      const averageGrade = context.academicContext.recentGrades.reduce((a, b) => a + b, 0) / context.academicContext.recentGrades.length;
      if (averageGrade >= 85) {
        encouragements.push(this.createAcademicExcellenceEncouragement(context));
      }
    }

    return encouragements;
  }

  // Create specific encouragement messages
  private createFrustrationEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-frustration`,
      type: 'difficulty_support',
      priority: 'high',
      title: 'You\'re Growing Through This Challenge',
      message: 'I can see you\'re feeling frustrated, and that\'s completely normal when learning something challenging. Remember, every expert was once a beginner. You\'re not stuck - you\'re growing! Take a deep breath and let\'s tackle this one step at a time.',
      context,
      triggers: ['frustration', 'difficulty', 'challenge'],
      expectedImpact: {
        moodImprovement: 25,
        motivationBoost: 20,
        confidenceIncrease: 15,
        engagementIncrease: 10
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 50,
        badges: ['Resilient Learner'],
        achievements: ['Overcoming Challenges'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }

  private createOverwhelmedEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-overwhelmed`,
      type: 'self_compassion',
      priority: 'urgent',
      title: 'It\'s Okay to Feel Overwhelmed',
      message: 'Feeling overwhelmed is a sign that you care deeply about your learning. You don\'t have to tackle everything at once. Let\'s break this down into smaller, manageable pieces. I\'m here to support you every step of the way.',
      context,
      triggers: ['overwhelm', 'pressure', 'too much'],
      expectedImpact: {
        moodImprovement: 30,
        motivationBoost: 15,
        confidenceIncrease: 20,
        engagementIncrease: 15
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 75,
        badges: ['Self-Care Champion'],
        achievements: ['Managing Overwhelm'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    };
  }

  private createDiscouragementEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-discouraged`,
      type: 'confidence_building',
      priority: 'high',
      title: 'Your Progress Matters',
      message: 'I know it might not feel like it right now, but you\'re making progress every day. Learning isn\'t always linear, and setbacks are part of the journey. Look at how far you\'ve come and trust in your ability to keep growing.',
      context,
      triggers: ['discouraged', 'down', 'progress'],
      expectedImpact: {
        moodImprovement: 35,
        motivationBoost: 30,
        confidenceIncrease: 40,
        engagementIncrease: 25
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 100,
        badges: ['Progress Champion'],
        achievements: ['Building Confidence'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
    };
  }

  private createTirednessEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-tired`,
      type: 'self_compassion',
      priority: 'medium',
      title: 'Rest is Part of Learning',
      message: 'Your brain needs rest to process and consolidate what you\'ve learned. Taking breaks isn\'t giving up - it\'s being smart about your learning. Listen to your body and give yourself the rest you need.',
      context,
      triggers: ['tired', 'exhausted', 'rest'],
      expectedImpact: {
        moodImprovement: 20,
        motivationBoost: 10,
        confidenceIncrease: 15,
        engagementIncrease: 5
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 30,
        badges: ['Self-Care Aware'],
        achievements: ['Balanced Learning'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    };
  }

  private createBoredomEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-bored`,
      type: 'motivation_boost',
      priority: 'medium',
      title: 'Let\'s Make This Interesting',
      message: 'Boredom can actually be a sign that you\'re ready for a new challenge! Let\'s find a way to make this more engaging. Sometimes the most exciting discoveries come from looking at familiar things in a new way.',
      context,
      triggers: ['bored', 'boring', 'uninteresting'],
      expectedImpact: {
        moodImprovement: 25,
        motivationBoost: 35,
        confidenceIncrease: 20,
        engagementIncrease: 40
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 60,
        badges: ['Curiosity Catalyst'],
        achievements: ['Finding Interest'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }

  private createAnxietyEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-anxious`,
      type: 'self_compassion',
      priority: 'high',
      title: 'You\'re Safe and Capable',
      message: 'Anxiety is your mind\'s way of trying to protect you, but you\'re safe and capable of handling this. Take a moment to breathe and remember all the times you\'ve overcome challenges before. You\'ve got this.',
      context,
      triggers: ['anxious', 'worried', 'nervous'],
      expectedImpact: {
        moodImprovement: 30,
        motivationBoost: 20,
        confidenceIncrease: 35,
        engagementIncrease: 20
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 80,
        badges: ['Anxiety Warrior'],
        achievements: ['Facing Fears'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }

  private createStressEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-stressed`,
      type: 'self_compassion',
      priority: 'high',
      title: 'You\'re Handling This Well',
      message: 'Stress is a natural response to challenges, and you\'re handling it better than you might think. Remember to take care of yourself - your wellbeing is just as important as your academic success.',
      context,
      triggers: ['stressed', 'pressure', 'overwhelmed'],
      expectedImpact: {
        moodImprovement: 25,
        motivationBoost: 15,
        confidenceIncrease: 20,
        engagementIncrease: 15
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 70,
        badges: ['Stress Manager'],
        achievements: ['Balanced Approach'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }

  private createPositiveMoodEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-positive`,
      type: 'achievement_celebration',
      priority: 'low',
      title: 'Your Positive Energy is Contagious!',
      message: 'I love seeing you in such a great mood! Your enthusiasm and positive energy are amazing. Let\'s channel this energy into tackling some exciting challenges and making the most of this momentum.',
      context,
      triggers: ['excited', 'motivated', 'confident'],
      expectedImpact: {
        moodImprovement: 10,
        motivationBoost: 25,
        confidenceIncrease: 15,
        engagementIncrease: 30
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 40,
        badges: ['Positive Energy'],
        achievements: ['Momentum Builder'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    };
  }

  private createStreakAchievementEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-streak`,
      type: 'achievement_celebration',
      priority: 'medium',
      title: `Amazing ${this.studyStreak}-Day Study Streak!`,
      message: `Wow! You\'ve been studying for ${this.studyStreak} days in a row! This kind of consistency is what separates good learners from great ones. You\'re building incredible habits that will serve you well throughout your academic journey.`,
      context,
      triggers: ['streak', 'consistency', 'achievement'],
      expectedImpact: {
        moodImprovement: 40,
        motivationBoost: 50,
        confidenceIncrease: 45,
        engagementIncrease: 35
      },
      delivery: {
        timing: 'immediate',
        frequency: 'once',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 200,
        badges: ['Streak Master', 'Consistency Champion'],
        achievements: ['Study Streak Legend'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  private createMasteryEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-mastery`,
      type: 'breakthrough_celebration',
      priority: 'medium',
      title: 'You\'re Mastering This Subject!',
      message: `Your performance of ${context.studySession?.performance}% shows you\'re really getting the hang of ${context.studySession?.subject}! This level of mastery doesn\'t happen by accident - it\'s the result of your dedication and hard work.`,
      context,
      triggers: ['mastery', 'excellence', 'performance'],
      expectedImpact: {
        moodImprovement: 35,
        motivationBoost: 40,
        confidenceIncrease: 50,
        engagementIncrease: 30
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 150,
        badges: ['Subject Master', 'Excellence Achiever'],
        achievements: ['Mastery Unlocked'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
    };
  }

  private createGoalProgressEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-goal`,
      type: 'progress_recognition',
      priority: 'medium',
      title: 'You\'re Making Great Progress Toward Your Goals!',
      message: `I can see you\'re working hard on your learning goals. Every study session, every challenge you face, and every concept you master is bringing you closer to achieving what you set out to accomplish. Keep going!`,
      context,
      triggers: ['goals', 'progress', 'achievement'],
      expectedImpact: {
        moodImprovement: 30,
        motivationBoost: 45,
        confidenceIncrease: 35,
        engagementIncrease: 40
      },
      delivery: {
        timing: 'immediate',
        frequency: 'weekly',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 100,
        badges: ['Goal Crusher', 'Progress Maker'],
        achievements: ['Goal Achievement'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
    };
  }

  private createLongSessionEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-long-session`,
      type: 'effort_appreciation',
      priority: 'low',
      title: 'Incredible Focus and Dedication!',
      message: `You\'ve been studying for ${context.studySession?.duration} minutes straight! That kind of sustained focus and dedication is impressive. Your commitment to learning is truly admirable.`,
      context,
      triggers: ['long session', 'focus', 'dedication'],
      expectedImpact: {
        moodImprovement: 20,
        motivationBoost: 30,
        confidenceIncrease: 25,
        engagementIncrease: 20
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 80,
        badges: ['Focus Master', 'Dedication Champion'],
        achievements: ['Marathon Learner'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }

  private createPerformanceEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-performance`,
      type: 'improvement_recognition',
      priority: 'low',
      title: 'Outstanding Performance!',
      message: `Your ${context.studySession?.performance}% performance shows you\'re really understanding the material! This level of comprehension is a testament to your hard work and effective study strategies.`,
      context,
      triggers: ['performance', 'excellence', 'understanding'],
      expectedImpact: {
        moodImprovement: 25,
        motivationBoost: 35,
        confidenceIncrease: 40,
        engagementIncrease: 25
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 60,
        badges: ['High Performer', 'Excellence Achiever'],
        achievements: ['Performance Star'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
    };
  }

  private createEffortEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-effort`,
      type: 'effort_appreciation',
      priority: 'low',
      title: 'Your Effort is Paying Off!',
      message: 'I can see you\'re putting in consistent effort, and it\'s making a difference! Every minute you spend studying, every challenge you tackle, and every concept you work through is building your knowledge and skills.',
      context,
      triggers: ['effort', 'consistency', 'hard work'],
      expectedImpact: {
        moodImprovement: 20,
        motivationBoost: 25,
        confidenceIncrease: 30,
        engagementIncrease: 20
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 50,
        badges: ['Effort Appreciator', 'Hard Worker'],
        achievements: ['Consistent Effort'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }

  private createChallengeEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-challenge`,
      type: 'challenge_encouragement',
      priority: 'medium',
      title: 'Challenges Make You Stronger!',
      message: 'I know you\'re facing some challenges right now, but remember - challenges are opportunities for growth in disguise. Every challenge you overcome makes you more resilient and capable. You\'ve got what it takes!',
      context,
      triggers: ['challenge', 'difficulty', 'struggle'],
      expectedImpact: {
        moodImprovement: 30,
        motivationBoost: 35,
        confidenceIncrease: 40,
        engagementIncrease: 25
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 90,
        badges: ['Challenge Warrior', 'Resilience Builder'],
        achievements: ['Overcoming Obstacles'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    };
  }

  private createDifficultyEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-difficulty`,
      type: 'difficulty_support',
      priority: 'medium',
      title: 'You\'re Tackling Advanced Material!',
      message: 'I can see you\'re working on challenging material, and that\'s fantastic! The fact that you\'re willing to take on difficult concepts shows your commitment to learning and growth. Don\'t be discouraged if it takes time - mastery comes with practice.',
      context,
      triggers: ['difficulty', 'hard', 'advanced'],
      expectedImpact: {
        moodImprovement: 25,
        motivationBoost: 30,
        confidenceIncrease: 35,
        engagementIncrease: 20
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 70,
        badges: ['Advanced Learner', 'Challenge Seeker'],
        achievements: ['Difficulty Master'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
    };
  }

  private createConsistencyEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-consistency`,
      type: 'consistency_praise',
      priority: 'low',
      title: 'Your Consistency is Impressive!',
      message: `You\'ve been studying consistently for ${this.studyStreak} days, and that kind of dedication is what leads to real mastery. Consistency is often more important than intensity when it comes to learning.`,
      context,
      triggers: ['consistency', 'dedication', 'routine'],
      expectedImpact: {
        moodImprovement: 20,
        motivationBoost: 30,
        confidenceIncrease: 25,
        engagementIncrease: 25
      },
      delivery: {
        timing: 'immediate',
        frequency: 'weekly',
        channels: ['chat'],
        personalization: true
      },
      gamification: {
        points: 60,
        badges: ['Consistency Champion', 'Routine Master'],
        achievements: ['Steady Progress'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
    };
  }

  private createAcademicExcellenceEncouragement(context: EncouragementContext): EncouragementMessage {
    return {
      id: `encouragement-${Date.now()}-academic`,
      type: 'achievement_celebration',
      priority: 'medium',
      title: 'Academic Excellence!',
      message: 'Your recent academic performance shows you\'re not just learning - you\'re excelling! This level of achievement reflects your hard work, dedication, and effective study strategies. Keep up the amazing work!',
      context,
      triggers: ['academic', 'excellence', 'grades'],
      expectedImpact: {
        moodImprovement: 35,
        motivationBoost: 40,
        confidenceIncrease: 45,
        engagementIncrease: 30
      },
      delivery: {
        timing: 'immediate',
        frequency: 'as_needed',
        channels: ['chat', 'notification'],
        personalization: true
      },
      gamification: {
        points: 120,
        badges: ['Academic Star', 'Excellence Achiever'],
        achievements: ['Academic Excellence'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
    };
  }

  // Prioritize encouragements based on context and impact
  private prioritizeEncouragements(encouragements: EncouragementMessage[], context: EncouragementContext): EncouragementMessage[] {
    return encouragements.sort((a, b) => {
      // Priority weight
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Expected impact
      const aImpact = a.expectedImpact.moodImprovement + a.expectedImpact.motivationBoost + a.expectedImpact.confidenceIncrease;
      const bImpact = b.expectedImpact.moodImprovement + b.expectedImpact.motivationBoost + b.expectedImpact.confidenceIncrease;
      
      return bImpact - aImpact;
    });
  }

  // Initialize motivation strategies
  private initializeMotivationStrategies(): void {
    this.motivationStrategies = [
      {
        id: 'growth-mindset',
        name: 'Growth Mindset Reinforcement',
        description: 'Encourage students to view challenges as opportunities for growth',
        targetMoods: ['frustrated', 'discouraged', 'overwhelmed'],
        effectiveness: 85,
        implementation: {
          triggers: ['challenge', 'difficulty', 'struggle'],
          actions: ['Reframe challenges as growth opportunities', 'Celebrate effort over results', 'Emphasize learning process'],
          timing: 'During difficult moments',
          frequency: 'As needed'
        },
        personalization: {
          learningStyle: ['all'],
          personalityType: ['perfectionist', 'achiever'],
          interests: ['all']
        },
        gamification: {
          points: 100,
          badges: ['Growth Mindset Champion'],
          challenges: ['Embrace 5 challenges this week']
        }
      },
      {
        id: 'progress-celebration',
        name: 'Progress Celebration',
        description: 'Regularly acknowledge and celebrate student progress',
        targetMoods: ['all'],
        effectiveness: 90,
        implementation: {
          triggers: ['achievement', 'progress', 'improvement'],
          actions: ['Acknowledge specific improvements', 'Celebrate milestones', 'Highlight growth'],
          timing: 'After study sessions',
          frequency: 'Daily'
        },
        personalization: {
          learningStyle: ['all'],
          personalityType: ['all'],
          interests: ['all']
        },
        gamification: {
          points: 50,
          badges: ['Progress Celebrator'],
          challenges: ['Track progress daily']
        }
      },
      {
        id: 'social-support',
        name: 'Social Support Activation',
        description: 'Encourage peer interaction and collaborative learning',
        targetMoods: ['lonely', 'isolated', 'discouraged'],
        effectiveness: 75,
        implementation: {
          triggers: ['loneliness', 'isolation', 'need for connection'],
          actions: ['Suggest study groups', 'Encourage peer interaction', 'Facilitate collaboration'],
          timing: 'When social needs are detected',
          frequency: 'Weekly'
        },
        personalization: {
          learningStyle: ['auditory', 'kinesthetic'],
          personalityType: ['extrovert', 'collaborator'],
          interests: ['social', 'teamwork']
        },
        gamification: {
          points: 75,
          badges: ['Social Learner'],
          challenges: ['Join a study group']
        }
      }
    ];
  }

  // Initialize achievements
  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'study-streak-7',
        type: 'study_streak',
        title: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        criteria: ['Study for at least 30 minutes each day', 'Maintain streak for 7 days'],
        reward: {
          points: 500,
          badges: ['Week Warrior'],
          unlocks: ['Advanced study tools', 'Premium features']
        },
        rarity: 'uncommon',
        progress: 0
      },
      {
        id: 'subject-mastery-90',
        type: 'subject_mastery',
        title: 'Subject Master',
        description: 'Achieve 90% or higher in any subject',
        criteria: ['Score 90% or higher on assessments', 'Maintain performance for 3 sessions'],
        reward: {
          points: 300,
          badges: ['Subject Master'],
          unlocks: ['Advanced content', 'Expert level materials']
        },
        rarity: 'rare',
        progress: 0
      },
      {
        id: 'challenge-overcome-5',
        type: 'challenge_overcome',
        title: 'Challenge Conqueror',
        description: 'Successfully overcome 5 difficult challenges',
        criteria: ['Face 5 difficult study challenges', 'Complete each challenge successfully'],
        reward: {
          points: 400,
          badges: ['Challenge Conqueror'],
          unlocks: ['Resilience tools', 'Advanced problem-solving']
        },
        rarity: 'rare',
        progress: 0
      }
    ];
  }

  // Load user data
  private loadUserData(): void {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }

      const streak = localStorage.getItem('studyStreak');
      if (streak) {
        this.studyStreak = parseInt(streak);
      }

      const lastStudy = localStorage.getItem('lastStudyDate');
      if (lastStudy) {
        this.lastStudyDate = new Date(lastStudy);
      }

      const history = localStorage.getItem('encouragementHistory');
      if (history) {
        this.encouragementHistory = JSON.parse(history).map((enc: any) => ({
          ...enc,
          timestamp: new Date(enc.timestamp),
          expiresAt: enc.expiresAt ? new Date(enc.expiresAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading encouragement data:', error);
    }
  }

  // Save user data
  private saveUserData(): void {
    localStorage.setItem('studyStreak', this.studyStreak.toString());
    if (this.lastStudyDate) {
      localStorage.setItem('lastStudyDate', this.lastStudyDate.toISOString());
    }
    localStorage.setItem('encouragementHistory', JSON.stringify(this.encouragementHistory));
  }

  // Update study streak
  updateStudyStreak(): void {
    const today = new Date();
    const todayStr = today.toDateString();

    if (this.lastStudyDate) {
      const lastStudyStr = this.lastStudyDate.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastStudyStr === todayStr) {
        // Already studied today, no change
        return;
      } else if (lastStudyStr === yesterdayStr) {
        // Studied yesterday, increment streak
        this.studyStreak++;
      } else {
        // Gap in streak, reset
        this.studyStreak = 1;
      }
    } else {
      // First study session
      this.studyStreak = 1;
    }

    this.lastStudyDate = today;
    this.saveUserData();
  }

  // Get active encouragements
  getActiveEncouragements(): EncouragementMessage[] {
    const now = new Date();
    return this.encouragementHistory.filter(enc => 
      !enc.expiresAt || enc.expiresAt > now
    );
  }

  // Get encouragement history
  getEncouragementHistory(): EncouragementMessage[] {
    return this.encouragementHistory;
  }

  // Get achievements
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get study streak
  getStudyStreak(): number {
    return this.studyStreak;
  }
}

export const encouragementMotivation = new EncouragementMotivationService();
