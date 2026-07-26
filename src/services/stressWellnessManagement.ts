import { moodDetection, MoodData, MoodType } from './moodDetection';
import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface WellnessSuggestion {
  id: string;
  type: WellnessType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  category: WellnessCategory;
  context: WellnessContext;
  implementation: {
    steps: string[];
    duration: string; // e.g., "5 minutes", "30 minutes"
    difficulty: 'easy' | 'medium' | 'hard';
    resources: string[];
    alternatives: string[];
  };
  expectedBenefits: {
    stressReduction: number; // 0-100
    energyBoost: number; // 0-100
    moodImprovement: number; // 0-100
    focusEnhancement: number; // 0-100
    sleepQuality: number; // 0-100
    overallWellness: number; // 0-100
  };
  timing: {
    optimalTime: string; // e.g., "morning", "afternoon", "evening"
    frequency: 'once' | 'daily' | 'weekly' | 'as_needed';
    duration: number; // minutes
    flexibility: 'fixed' | 'flexible' | 'urgent';
  };
  personalization: {
    targetMoods: MoodType[];
    learningStyle: string[];
    personalityType: string[];
    interests: string[];
  };
  tracking: {
    metrics: string[];
    successIndicators: string[];
    followUpActions: string[];
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

export type WellnessType = 
  | 'breathing_exercise' | 'meditation' | 'mindfulness' | 'progressive_relaxation'
  | 'physical_exercise' | 'stretching' | 'yoga' | 'walking' | 'dancing'
  | 'nutrition_advice' | 'hydration' | 'healthy_snack' | 'meal_planning'
  | 'sleep_optimization' | 'sleep_hygiene' | 'nap_guidance' | 'bedtime_routine'
  | 'social_connection' | 'peer_support' | 'family_time' | 'friend_interaction'
  | 'hobby_engagement' | 'creative_activity' | 'music_therapy' | 'art_therapy'
  | 'environment_optimization' | 'space_organization' | 'lighting_adjustment' | 'noise_control'
  | 'time_management' | 'break_scheduling' | 'workload_balancing' | 'priority_setting'
  | 'cognitive_techniques' | 'positive_thinking' | 'gratitude_practice' | 'goal_reframing'
  | 'sensory_therapy' | 'aromatherapy' | 'sound_therapy' | 'visual_calm'
  | 'professional_support' | 'counseling_referral' | 'therapy_suggestion' | 'crisis_support';

export type WellnessCategory = 
  | 'mental_health' | 'physical_health' | 'emotional_wellness' | 'social_wellness'
  | 'environmental_wellness' | 'intellectual_wellness' | 'spiritual_wellness' | 'occupational_wellness';

export interface WellnessContext {
  currentMood: MoodType;
  moodIntensity: number;
  stressLevel: number; // 0-100
  energyLevel: number; // 0-100
  sleepQuality: number; // 0-100
  socialConnection: number; // 0-100
  academicPressure: number; // 0-100
  timeAvailable: number; // minutes
  environment: {
    location: 'home' | 'school' | 'library' | 'outdoor' | 'other';
    noiseLevel: 'quiet' | 'moderate' | 'loud';
    lighting: 'dim' | 'moderate' | 'bright';
    privacy: 'private' | 'semi-private' | 'public';
  };
  recentActivity: {
    studyHours: number;
    breakTime: number;
    physicalActivity: number;
    socialInteraction: number;
  };
  personalFactors: {
    age: number;
    healthConditions: string[];
    preferences: string[];
    limitations: string[];
  };
}

export interface WellnessPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  goals: string[];
  suggestions: WellnessSuggestion[];
  schedule: {
    daily: WellnessSuggestion[];
    weekly: WellnessSuggestion[];
    asNeeded: WellnessSuggestion[];
  };
  tracking: {
    metrics: string[];
    checkpoints: Date[];
    successCriteria: string[];
  };
  personalization: {
    targetMoods: MoodType[];
    learningStyle: string[];
    interests: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WellnessProgress {
  id: string;
  suggestionId: string;
  completedAt: Date;
  effectiveness: number; // 0-100
  moodBefore: MoodType;
  moodAfter: MoodType;
  stressBefore: number;
  stressAfter: number;
  energyBefore: number;
  energyAfter: number;
  notes: string;
  rating: number; // 1-5
}

export class StressWellnessManagementService {
  private wellnessSuggestions: WellnessSuggestion[] = [];
  private wellnessPlans: WellnessPlan[] = [];
  private wellnessProgress: WellnessProgress[] = [];
  private userProfile: UserProfile | null = null;
  private stressHistory: { timestamp: Date; level: number; triggers: string[] }[] = [];

  constructor() {
    this.loadUserData();
    this.initializeWellnessSuggestions();
  }

  // Generate wellness suggestions based on current context
  generateWellnessSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Generate stress-specific suggestions
    if (context.stressLevel > 70) {
      suggestions.push(...this.generateStressReliefSuggestions(context));
    }

    // Generate energy-boosting suggestions
    if (context.energyLevel < 40) {
      suggestions.push(...this.generateEnergyBoostSuggestions(context));
    }

    // Generate mood-improvement suggestions
    if (['frustrated', 'overwhelmed', 'anxious', 'stressed', 'tired', 'discouraged'].includes(context.currentMood)) {
      suggestions.push(...this.generateMoodImprovementSuggestions(context));
    }

    // Generate sleep optimization suggestions
    if (context.sleepQuality < 60) {
      suggestions.push(...this.generateSleepOptimizationSuggestions(context));
    }

    // Generate social wellness suggestions
    if (context.socialConnection < 50) {
      suggestions.push(...this.generateSocialWellnessSuggestions(context));
    }

    // Generate academic stress management suggestions
    if (context.academicPressure > 70) {
      suggestions.push(...this.generateAcademicStressSuggestions(context));
    }

    // Generate general wellness suggestions
    suggestions.push(...this.generateGeneralWellnessSuggestions(context));

    return this.prioritizeSuggestions(suggestions, context);
  }

  // Generate stress relief suggestions
  private generateStressReliefSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Breathing exercises
    suggestions.push({
      id: `wellness-${Date.now()}-breathing`,
      type: 'breathing_exercise',
      priority: context.stressLevel > 80 ? 'urgent' : 'high',
      title: 'Deep Breathing Exercise',
      description: 'Take a moment to focus on your breathing. Deep, slow breaths can quickly reduce stress and help you feel more centered.',
      category: 'mental_health',
      context,
      implementation: {
        steps: [
          'Find a comfortable position',
          'Close your eyes or focus on a point',
          'Breathe in slowly for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly for 6 counts',
          'Repeat 5-10 times'
        ],
        duration: '5-10 minutes',
        difficulty: 'easy',
        resources: ['Quiet space', 'Timer'],
        alternatives: ['Box breathing', '4-7-8 breathing', 'Alternate nostril breathing']
      },
      expectedBenefits: {
        stressReduction: 40,
        energyBoost: 10,
        moodImprovement: 30,
        focusEnhancement: 25,
        sleepQuality: 15,
        overallWellness: 35
      },
      timing: {
        optimalTime: 'anytime',
        frequency: 'as_needed',
        duration: 10,
        flexibility: 'urgent'
      },
      personalization: {
        targetMoods: ['stressed', 'anxious', 'overwhelmed', 'frustrated'],
        learningStyle: ['all'],
        personalityType: ['all'],
        interests: ['all']
      },
      tracking: {
        metrics: ['Stress level', 'Heart rate', 'Breathing pattern'],
        successIndicators: ['Feeling calmer', 'Slower breathing', 'Reduced tension'],
        followUpActions: ['Practice daily', 'Try other breathing techniques']
      },
      gamification: {
        points: 50,
        badges: ['Breathing Master', 'Stress Buster'],
        achievements: ['Daily Breathing Practice'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    });

    // Progressive muscle relaxation
    if (context.timeAvailable >= 15) {
      suggestions.push({
        id: `wellness-${Date.now()}-pmr`,
        type: 'progressive_relaxation',
        priority: 'high',
        title: 'Progressive Muscle Relaxation',
        description: 'Systematically tense and relax different muscle groups to release physical tension and stress.',
        category: 'physical_health',
        context,
        implementation: {
          steps: [
            'Find a quiet, comfortable place',
            'Start with your toes, tense for 5 seconds, then relax',
            'Move up to your calves, tense and relax',
            'Continue with thighs, abdomen, arms, shoulders, neck, and face',
            'Focus on the contrast between tension and relaxation',
            'End with deep breathing'
          ],
          duration: '15-20 minutes',
          difficulty: 'medium',
          resources: ['Quiet space', 'Comfortable seating'],
          alternatives: ['Body scan meditation', 'Guided relaxation', 'Yoga nidra']
        },
        expectedBenefits: {
          stressReduction: 50,
          energyBoost: 20,
          moodImprovement: 35,
          focusEnhancement: 30,
          sleepQuality: 25,
          overallWellness: 40
        },
        timing: {
          optimalTime: 'evening',
          frequency: 'daily',
          duration: 20,
          flexibility: 'flexible'
        },
        personalization: {
          targetMoods: ['stressed', 'anxious', 'tired', 'overwhelmed'],
          learningStyle: ['kinesthetic', 'visual'],
          personalityType: ['all'],
          interests: ['wellness', 'relaxation']
        },
        tracking: {
          metrics: ['Muscle tension', 'Stress level', 'Sleep quality'],
          successIndicators: ['Feeling more relaxed', 'Better sleep', 'Reduced physical tension'],
          followUpActions: ['Practice before bed', 'Use during study breaks']
        },
        gamification: {
          points: 75,
          badges: ['Relaxation Expert', 'Tension Buster'],
          achievements: ['Weekly PMR Practice'],
          streakBonus: true
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
      });
    }

    return suggestions;
  }

  // Generate energy boost suggestions
  private generateEnergyBoostSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Physical exercise
    if (context.timeAvailable >= 10) {
      suggestions.push({
        id: `wellness-${Date.now()}-exercise`,
        type: 'physical_exercise',
        priority: 'medium',
        title: 'Quick Energy Boost Workout',
        description: 'A short burst of physical activity can increase your energy levels and improve focus.',
        category: 'physical_health',
        context,
        implementation: {
          steps: [
            'Start with light stretching',
            'Do 20 jumping jacks',
            'Perform 10 push-ups or wall push-ups',
            'Do 15 squats',
            'Finish with 30 seconds of high knees',
            'Cool down with light stretching'
          ],
          duration: '10-15 minutes',
          difficulty: 'medium',
          resources: ['Space to move', 'Comfortable clothes'],
          alternatives: ['Walking', 'Dancing', 'Yoga', 'Stretching']
        },
        expectedBenefits: {
          stressReduction: 25,
          energyBoost: 60,
          moodImprovement: 40,
          focusEnhancement: 45,
          sleepQuality: 20,
          overallWellness: 50
        },
        timing: {
          optimalTime: 'afternoon',
          frequency: 'daily',
          duration: 15,
          flexibility: 'flexible'
        },
        personalization: {
          targetMoods: ['tired', 'bored', 'low energy'],
          learningStyle: ['kinesthetic', 'visual'],
          personalityType: ['active', 'energetic'],
          interests: ['fitness', 'movement']
        },
        tracking: {
          metrics: ['Energy level', 'Heart rate', 'Mood'],
          successIndicators: ['Feeling more energetic', 'Improved focus', 'Better mood'],
          followUpActions: ['Schedule regular exercise', 'Try different activities']
        },
        gamification: {
          points: 60,
          badges: ['Energy Booster', 'Fitness Enthusiast'],
          achievements: ['Daily Exercise Streak'],
          streakBonus: true
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
      });
    }

    // Hydration reminder
    suggestions.push({
      id: `wellness-${Date.now()}-hydration`,
      type: 'hydration',
      priority: 'medium',
      title: 'Stay Hydrated',
      description: 'Dehydration can cause fatigue and reduce cognitive performance. Make sure you\'re drinking enough water.',
      category: 'physical_health',
      context,
      implementation: {
        steps: [
          'Drink a full glass of water',
          'Set a reminder to drink water every hour',
          'Keep a water bottle nearby',
          'Add lemon or cucumber for flavor',
          'Monitor your urine color (should be light yellow)'
        ],
        duration: '2-3 minutes',
        difficulty: 'easy',
        resources: ['Water', 'Glass or bottle'],
        alternatives: ['Herbal tea', 'Coconut water', 'Fruit-infused water']
      },
      expectedBenefits: {
        stressReduction: 15,
        energyBoost: 30,
        moodImprovement: 20,
        focusEnhancement: 25,
        sleepQuality: 10,
        overallWellness: 30
      },
      timing: {
        optimalTime: 'anytime',
        frequency: 'daily',
        duration: 5,
        flexibility: 'flexible'
      },
      personalization: {
        targetMoods: ['tired', 'low energy', 'foggy'],
        learningStyle: ['all'],
        personalityType: ['all'],
        interests: ['health', 'wellness']
      },
      tracking: {
        metrics: ['Water intake', 'Energy level', 'Focus'],
        successIndicators: ['Feeling more alert', 'Better focus', 'Improved energy'],
        followUpActions: ['Track daily water intake', 'Set hydration reminders']
      },
      gamification: {
        points: 30,
        badges: ['Hydration Hero', 'Water Warrior'],
        achievements: ['Daily Hydration Goal'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
    });

    return suggestions;
  }

  // Generate mood improvement suggestions
  private generateMoodImprovementSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Gratitude practice
    suggestions.push({
      id: `wellness-${Date.now()}-gratitude`,
      type: 'cognitive_techniques',
      priority: 'medium',
      title: 'Gratitude Practice',
      description: 'Focusing on positive aspects of your life can improve mood and reduce stress.',
      category: 'mental_health',
      context,
      implementation: {
        steps: [
          'Take a moment to reflect',
          'Write down 3 things you\'re grateful for today',
          'Think about why each thing matters to you',
          'Share your gratitude with someone if possible',
          'Notice how this makes you feel'
        ],
        duration: '5-10 minutes',
        difficulty: 'easy',
        resources: ['Paper and pen', 'Quiet space'],
        alternatives: ['Gratitude journal', 'Gratitude meditation', 'Gratitude sharing']
      },
      expectedBenefits: {
        stressReduction: 30,
        energyBoost: 20,
        moodImprovement: 50,
        focusEnhancement: 25,
        sleepQuality: 20,
        overallWellness: 40
      },
      timing: {
        optimalTime: 'morning',
        frequency: 'daily',
        duration: 10,
        flexibility: 'flexible'
      },
      personalization: {
        targetMoods: ['discouraged', 'sad', 'frustrated', 'overwhelmed'],
        learningStyle: ['reading', 'visual'],
        personalityType: ['reflective', 'positive'],
        interests: ['mindfulness', 'personal growth']
      },
      tracking: {
        metrics: ['Mood level', 'Positive thoughts', 'Gratitude frequency'],
        successIndicators: ['Feeling more positive', 'Better mood', 'Increased optimism'],
        followUpActions: ['Keep a gratitude journal', 'Share gratitude daily']
      },
      gamification: {
        points: 40,
        badges: ['Gratitude Guru', 'Positive Thinker'],
        achievements: ['30-Day Gratitude Challenge'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    });

    // Music therapy
    suggestions.push({
      id: `wellness-${Date.now()}-music`,
      type: 'music_therapy',
      priority: 'low',
      title: 'Music Therapy',
      description: 'Listening to uplifting music can improve mood and reduce stress.',
      category: 'emotional_wellness',
      context,
      implementation: {
        steps: [
          'Choose uplifting or calming music',
          'Find a comfortable place to listen',
          'Close your eyes and focus on the music',
          'Let the rhythm and melody affect your mood',
          'Sing along or move to the music if you feel like it'
        ],
        duration: '10-15 minutes',
        difficulty: 'easy',
        resources: ['Music player', 'Headphones', 'Comfortable space'],
        alternatives: ['Nature sounds', 'Instrumental music', 'Upbeat songs']
      },
      expectedBenefits: {
        stressReduction: 35,
        energyBoost: 25,
        moodImprovement: 45,
        focusEnhancement: 20,
        sleepQuality: 15,
        overallWellness: 35
      },
      timing: {
        optimalTime: 'anytime',
        frequency: 'as_needed',
        duration: 15,
        flexibility: 'flexible'
      },
      personalization: {
        targetMoods: ['sad', 'discouraged', 'stressed', 'anxious'],
        learningStyle: ['auditory'],
        personalityType: ['creative', 'emotional'],
        interests: ['music', 'arts']
      },
      tracking: {
        metrics: ['Mood level', 'Stress reduction', 'Energy level'],
        successIndicators: ['Feeling happier', 'More relaxed', 'Better mood'],
        followUpActions: ['Create mood playlists', 'Explore new music genres']
      },
      gamification: {
        points: 35,
        badges: ['Music Lover', 'Mood Booster'],
        achievements: ['Music Therapy Regular'],
        streakBonus: false
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    });

    return suggestions;
  }

  // Generate sleep optimization suggestions
  private generateSleepOptimizationSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Sleep hygiene
    suggestions.push({
      id: `wellness-${Date.now()}-sleep-hygiene`,
      type: 'sleep_hygiene',
      priority: 'high',
      title: 'Improve Sleep Hygiene',
      description: 'Good sleep habits can significantly improve your sleep quality and overall well-being.',
      category: 'physical_health',
      context,
      implementation: {
        steps: [
          'Establish a consistent bedtime routine',
          'Avoid screens 1 hour before bed',
          'Keep your bedroom cool, dark, and quiet',
          'Avoid caffeine after 2 PM',
          'Don\'t eat large meals before bed',
          'Try relaxation techniques before sleep'
        ],
        duration: '30-60 minutes',
        difficulty: 'medium',
        resources: ['Comfortable bedroom', 'Blackout curtains', 'Earplugs'],
        alternatives: ['Sleep meditation', 'White noise machine', 'Sleep mask']
      },
      expectedBenefits: {
        stressReduction: 40,
        energyBoost: 50,
        moodImprovement: 35,
        focusEnhancement: 45,
        sleepQuality: 70,
        overallWellness: 60
      },
      timing: {
        optimalTime: 'evening',
        frequency: 'daily',
        duration: 60,
        flexibility: 'flexible'
      },
      personalization: {
        targetMoods: ['tired', 'stressed', 'overwhelmed'],
        learningStyle: ['all'],
        personalityType: ['all'],
        interests: ['health', 'wellness']
      },
      tracking: {
        metrics: ['Sleep duration', 'Sleep quality', 'Energy level'],
        successIndicators: ['Better sleep', 'More energy', 'Improved mood'],
        followUpActions: ['Track sleep patterns', 'Adjust bedtime routine']
      },
      gamification: {
        points: 100,
        badges: ['Sleep Master', 'Rest Champion'],
        achievements: ['7-Day Sleep Streak'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return suggestions;
  }

  // Generate social wellness suggestions
  private generateSocialWellnessSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Social connection
    suggestions.push({
      id: `wellness-${Date.now()}-social`,
      type: 'social_connection',
      priority: 'medium',
      title: 'Connect with Others',
      description: 'Social connections are important for mental health and well-being.',
      category: 'social_wellness',
      context,
      implementation: {
        steps: [
          'Reach out to a friend or family member',
          'Join a study group or club',
          'Participate in online communities',
          'Volunteer for a cause you care about',
          'Attend social events or gatherings'
        ],
        duration: '30-60 minutes',
        difficulty: 'medium',
        resources: ['Phone', 'Computer', 'Transportation'],
        alternatives: ['Video calls', 'Group activities', 'Community events']
      },
      expectedBenefits: {
        stressReduction: 30,
        energyBoost: 25,
        moodImprovement: 40,
        focusEnhancement: 20,
        sleepQuality: 15,
        overallWellness: 35
      },
      timing: {
        optimalTime: 'afternoon',
        frequency: 'weekly',
        duration: 60,
        flexibility: 'flexible'
      },
      personalization: {
        targetMoods: ['lonely', 'isolated', 'sad'],
        learningStyle: ['auditory', 'kinesthetic'],
        personalityType: ['extrovert', 'social'],
        interests: ['social', 'community']
      },
      tracking: {
        metrics: ['Social interactions', 'Mood level', 'Connection quality'],
        successIndicators: ['Feeling more connected', 'Better mood', 'Increased social support'],
        followUpActions: ['Schedule regular social time', 'Join new groups']
      },
      gamification: {
        points: 80,
        badges: ['Social Butterfly', 'Connection Builder'],
        achievements: ['Weekly Social Goal'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return suggestions;
  }

  // Generate academic stress management suggestions
  private generateAcademicStressSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Time management
    suggestions.push({
      id: `wellness-${Date.now()}-time-management`,
      type: 'time_management',
      priority: 'high',
      title: 'Academic Time Management',
      description: 'Better time management can reduce academic stress and improve productivity.',
      category: 'occupational_wellness',
      context,
      implementation: {
        steps: [
          'Create a study schedule',
          'Break large tasks into smaller ones',
          'Use the Pomodoro Technique (25 min work, 5 min break)',
          'Prioritize tasks by importance and urgency',
          'Set realistic goals and deadlines',
          'Take regular breaks'
        ],
        duration: '30-45 minutes',
        difficulty: 'medium',
        resources: ['Calendar', 'Timer', 'Study materials'],
        alternatives: ['Study apps', 'Time tracking tools', 'Study groups']
      },
      expectedBenefits: {
        stressReduction: 50,
        energyBoost: 30,
        moodImprovement: 40,
        focusEnhancement: 60,
        sleepQuality: 25,
        overallWellness: 45
      },
      timing: {
        optimalTime: 'morning',
        frequency: 'daily',
        duration: 45,
        flexibility: 'flexible'
      },
      personalization: {
        targetMoods: ['overwhelmed', 'stressed', 'anxious'],
        learningStyle: ['all'],
        personalityType: ['organized', 'achiever'],
        interests: ['productivity', 'organization']
      },
      tracking: {
        metrics: ['Task completion', 'Stress level', 'Productivity'],
        successIndicators: ['Feeling more organized', 'Reduced stress', 'Better productivity'],
        followUpActions: ['Review and adjust schedule', 'Track progress']
      },
      gamification: {
        points: 90,
        badges: ['Time Master', 'Productivity Pro'],
        achievements: ['Weekly Planning Streak'],
        streakBonus: true
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
    });

    return suggestions;
  }

  // Generate general wellness suggestions
  private generateGeneralWellnessSuggestions(context: WellnessContext): WellnessSuggestion[] {
    const suggestions: WellnessSuggestion[] = [];

    // Mindfulness meditation
    if (context.timeAvailable >= 10) {
      suggestions.push({
        id: `wellness-${Date.now()}-mindfulness`,
        type: 'mindfulness',
        priority: 'low',
        title: 'Mindfulness Meditation',
        description: 'Practice mindfulness to improve focus, reduce stress, and enhance overall well-being.',
        category: 'mental_health',
        context,
        implementation: {
          steps: [
            'Find a quiet, comfortable place',
            'Sit or lie down comfortably',
            'Close your eyes and focus on your breath',
            'Notice thoughts without judgment',
            'Return focus to breathing when mind wanders',
            'Start with 5-10 minutes'
          ],
          duration: '10-20 minutes',
          difficulty: 'medium',
          resources: ['Quiet space', 'Timer', 'Comfortable seating'],
          alternatives: ['Guided meditation', 'Walking meditation', 'Body scan']
        },
        expectedBenefits: {
          stressReduction: 45,
          energyBoost: 20,
          moodImprovement: 35,
          focusEnhancement: 50,
          sleepQuality: 30,
          overallWellness: 40
        },
        timing: {
          optimalTime: 'morning',
          frequency: 'daily',
          duration: 15,
          flexibility: 'flexible'
        },
        personalization: {
          targetMoods: ['all'],
          learningStyle: ['all'],
          personalityType: ['reflective', 'calm'],
          interests: ['mindfulness', 'meditation']
        },
        tracking: {
          metrics: ['Stress level', 'Focus', 'Mood'],
          successIndicators: ['Feeling more centered', 'Better focus', 'Reduced stress'],
          followUpActions: ['Practice daily', 'Try different meditation types']
        },
        gamification: {
          points: 70,
          badges: ['Mindfulness Master', 'Zen Seeker'],
          achievements: ['30-Day Meditation Challenge'],
          streakBonus: true
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
      });
    }

    return suggestions;
  }

  // Prioritize suggestions based on context and impact
  private prioritizeSuggestions(suggestions: WellnessSuggestion[], context: WellnessContext): WellnessSuggestion[] {
    return suggestions.sort((a, b) => {
      // Priority weight
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Expected benefits score
      const aBenefits = a.expectedBenefits.stressReduction + a.expectedBenefits.moodImprovement + a.expectedBenefits.overallWellness;
      const bBenefits = b.expectedBenefits.stressReduction + b.expectedBenefits.moodImprovement + b.expectedBenefits.overallWellness;
      
      return bBenefits - aBenefits;
    });
  }

  // Initialize wellness suggestions
  private initializeWellnessSuggestions(): void {
    // This would be populated with a comprehensive set of wellness suggestions
    // For now, we'll generate them dynamically based on context
  }

  // Load user data
  private loadUserData(): void {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }

      const progress = localStorage.getItem('wellnessProgress');
      if (progress) {
        this.wellnessProgress = JSON.parse(progress).map((p: any) => ({
          ...p,
          completedAt: new Date(p.completedAt)
        }));
      }

      const stressHistory = localStorage.getItem('stressHistory');
      if (stressHistory) {
        this.stressHistory = JSON.parse(stressHistory).map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  }

  // Save user data
  private saveUserData(): void {
    localStorage.setItem('wellnessProgress', JSON.stringify(this.wellnessProgress));
    localStorage.setItem('stressHistory', JSON.stringify(this.stressHistory));
  }

  // Record wellness progress
  recordWellnessProgress(progress: WellnessProgress): void {
    this.wellnessProgress.push(progress);
    this.saveUserData();
  }

  // Get wellness progress
  getWellnessProgress(): WellnessProgress[] {
    return this.wellnessProgress;
  }

  // Get stress history
  getStressHistory(): { timestamp: Date; level: number; triggers: string[] }[] {
    return this.stressHistory;
  }

  // Record stress level
  recordStressLevel(level: number, triggers: string[]): void {
    this.stressHistory.push({
      timestamp: new Date(),
      level,
      triggers
    });
    this.saveUserData();
  }

  // Get active wellness suggestions
  getActiveWellnessSuggestions(): WellnessSuggestion[] {
    const now = new Date();
    return this.wellnessSuggestions.filter(suggestion => 
      !suggestion.expiresAt || suggestion.expiresAt > now
    );
  }

  // Get wellness suggestions by category
  getWellnessSuggestionsByCategory(category: WellnessCategory): WellnessSuggestion[] {
    return this.wellnessSuggestions.filter(suggestion => suggestion.category === category);
  }

  // Get wellness suggestions by type
  getWellnessSuggestionsByType(type: WellnessType): WellnessSuggestion[] {
    return this.wellnessSuggestions.filter(suggestion => suggestion.type === type);
  }
}

export const stressWellnessManagement = new StressWellnessManagementService();
