import { aiCompanionService, StudySession } from './aiCompanionService';

export interface MoodData {
  id: string;
  timestamp: Date;
  mood: MoodType;
  confidence: number; // 0-100
  intensity: number; // 0-100
  context: MoodContext;
  triggers: string[];
  duration: number; // minutes
  source: MoodSource;
}

export type MoodType = 
  | 'excited' | 'motivated' | 'confident' | 'focused' | 'curious' | 'satisfied'
  | 'frustrated' | 'overwhelmed' | 'anxious' | 'stressed' | 'confused' | 'bored'
  | 'tired' | 'discouraged' | 'lonely' | 'angry' | 'sad' | 'neutral';

export type MoodSource = 'text_analysis' | 'behavioral_patterns' | 'study_performance' | 'interaction_frequency' | 'manual_input' | 'facial_analysis' | 'voice_analysis';

export interface MoodContext {
  studySession?: {
    duration: number;
    subject: string;
    difficulty: string;
    performance: number;
  };
  timeOfDay?: string;
  dayOfWeek?: string;
  recentActivity?: string[];
  environmentalFactors?: string[];
  socialContext?: {
    hasStudyBuddy: boolean;
    recentSocialInteraction: boolean;
    peerSupport: boolean;
  };
  academicPressure?: {
    upcomingDeadlines: number;
    recentGrades: number[];
    workloadLevel: 'light' | 'moderate' | 'heavy' | 'overwhelming';
  };
  personalFactors?: {
    sleepQuality: number; // 1-10
    physicalActivity: number; // 1-10
    nutrition: number; // 1-10
    stressLevel: number; // 1-10
  };
}

export interface MoodPattern {
  dominantMood: MoodType;
  moodFrequency: Record<MoodType, number>;
  moodStability: number; // 0-100
  moodTrends: {
    improving: MoodType[];
    declining: MoodType[];
    stable: MoodType[];
  };
  contextualTriggers: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  timeBasedPatterns: {
    morning: MoodType[];
    afternoon: MoodType[];
    evening: MoodType[];
    night: MoodType[];
  };
  studyCorrelation: {
    highPerformance: MoodType[];
    lowPerformance: MoodType[];
    optimalMood: MoodType[];
  };
}

export interface MoodRecommendation {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  moodTarget: MoodType;
  confidence: number;
  implementation: {
    steps: string[];
    estimatedTime: string;
    resources: string[];
    alternatives: string[];
  };
  tracking: {
    metrics: string[];
    successIndicators: string[];
    followUpActions: string[];
  };
}

export class MoodDetectionService {
  private moodHistory: MoodData[] = [];
  private moodPatterns: MoodPattern | null = null;
  private sentimentKeywords: Record<MoodType, string[]> = {
    excited: ['excited', 'thrilled', 'amazing', 'awesome', 'fantastic', 'brilliant', 'wonderful', 'great', 'love', 'adore'],
    motivated: ['motivated', 'ready', 'determined', 'focused', 'driven', 'inspired', 'pumped', 'eager', 'keen', 'enthusiastic'],
    confident: ['confident', 'sure', 'certain', 'capable', 'able', 'competent', 'skilled', 'proficient', 'master', 'expert'],
    focused: ['focused', 'concentrated', 'attentive', 'alert', 'sharp', 'clear', 'present', 'engaged', 'immersed', 'absorbed'],
    curious: ['curious', 'interested', 'intrigued', 'fascinated', 'wondering', 'questioning', 'exploring', 'discovering', 'learning', 'investigating'],
    satisfied: ['satisfied', 'content', 'pleased', 'happy', 'fulfilled', 'accomplished', 'proud', 'successful', 'achieved', 'completed'],
    frustrated: ['frustrated', 'annoyed', 'irritated', 'aggravated', 'bothered', 'upset', 'mad', 'angry', 'furious', 'rage'],
    overwhelmed: ['overwhelmed', 'swamped', 'buried', 'drowning', 'stressed', 'pressured', 'crushed', 'suffocated', 'trapped', 'stuck'],
    anxious: ['anxious', 'worried', 'nervous', 'uneasy', 'restless', 'tense', 'jittery', 'fidgety', 'apprehensive', 'concerned'],
    stressed: ['stressed', 'strained', 'pressured', 'tension', 'burden', 'weight', 'load', 'demand', 'challenge', 'difficulty'],
    confused: ['confused', 'lost', 'bewildered', 'puzzled', 'perplexed', 'mystified', 'baffled', 'disoriented', 'unclear', 'uncertain'],
    bored: ['bored', 'tired', 'dull', 'monotonous', 'repetitive', 'tedious', 'uninteresting', 'lifeless', 'stale', 'flat'],
    tired: ['tired', 'exhausted', 'drained', 'fatigued', 'weary', 'spent', 'worn', 'depleted', 'burned', 'zapped'],
    discouraged: ['discouraged', 'disheartened', 'demoralized', 'dejected', 'down', 'low', 'blue', 'sad', 'gloomy', 'melancholy'],
    lonely: ['lonely', 'isolated', 'alone', 'disconnected', 'separated', 'detached', 'solitary', 'abandoned', 'forgotten', 'ignored'],
    angry: ['angry', 'mad', 'furious', 'rage', 'irate', 'livid', 'incensed', 'outraged', 'enraged', 'hostile'],
    sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'sorrowful', 'mournful', 'dejected', 'despondent'],
    neutral: ['okay', 'fine', 'alright', 'normal', 'regular', 'standard', 'typical', 'usual', 'average', 'moderate']
  };

  private moodIntensityModifiers: Record<string, number> = {
    'very': 1.5,
    'really': 1.4,
    'extremely': 1.6,
    'super': 1.3,
    'incredibly': 1.5,
    'totally': 1.2,
    'completely': 1.3,
    'absolutely': 1.4,
    'slightly': 0.7,
    'a bit': 0.8,
    'somewhat': 0.9,
    'kind of': 0.8,
    'sort of': 0.8,
    'not very': 0.6,
    'barely': 0.5,
    'hardly': 0.4
  };

  constructor() {
    this.loadMoodHistory();
    this.analyzeMoodPatterns();
  }

  // Detect mood from text input
  detectMoodFromText(text: string, context?: Partial<MoodContext>): MoodData {
    const lowerText = text.toLowerCase();
    let bestMood: MoodType = 'neutral';
    let bestScore = 0;
    let confidence = 0;
    let intensity = 50;

    // Analyze sentiment keywords
    for (const [mood, keywords] of Object.entries(this.sentimentKeywords)) {
      let score = 0;
      let keywordCount = 0;

      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          score += 1;
          keywordCount++;
        }
      }

      // Check for intensity modifiers
      for (const [modifier, multiplier] of Object.entries(this.moodIntensityModifiers)) {
        if (lowerText.includes(modifier)) {
          score *= multiplier;
          intensity = Math.min(100, intensity * multiplier);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMood = mood as MoodType;
      }
    }

    // Calculate confidence based on keyword matches and context
    confidence = Math.min(100, (bestScore / Math.max(1, text.split(' ').length)) * 100);
    
    // Adjust based on context
    if (context?.studySession) {
      confidence = this.adjustConfidenceForStudyContext(confidence, context.studySession, bestMood);
    }

    // Detect mood from behavioral patterns
    const behavioralMood = this.detectMoodFromBehavior(context);
    if (behavioralMood && behavioralMood.confidence > confidence) {
      bestMood = behavioralMood.mood;
      confidence = behavioralMood.confidence;
    }

    const moodData: MoodData = {
      id: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      mood: bestMood,
      confidence: Math.round(confidence),
      intensity: Math.round(intensity),
      context: context || {},
      triggers: this.extractTriggers(text, bestMood),
      duration: this.estimateMoodDuration(bestMood, intensity),
      source: 'text_analysis'
    };

    this.recordMood(moodData);
    return moodData;
  }

  // Detect mood from behavioral patterns
  detectMoodFromBehavior(context?: Partial<MoodContext>): { mood: MoodType; confidence: number } | null {
    if (!context) return null;

    let mood: MoodType = 'neutral';
    let confidence = 0;

    // Study performance analysis
    if (context.studySession) {
      const { performance, duration, difficulty } = context.studySession;
      
      if (performance >= 80) {
        mood = 'satisfied';
        confidence = 70;
      } else if (performance >= 60) {
        mood = 'neutral';
        confidence = 50;
      } else if (performance < 40) {
        mood = 'frustrated';
        confidence = 60;
      }

      // Adjust based on duration
      if (duration > 120 && performance < 60) {
        mood = 'tired';
        confidence = Math.max(confidence, 60);
      }

      // Adjust based on difficulty
      if (difficulty === 'hard' && performance < 50) {
        mood = 'overwhelmed';
        confidence = Math.max(confidence, 65);
      }
    }

    // Time-based mood patterns
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      if (mood === 'neutral') {
        mood = 'tired';
        confidence = Math.max(confidence, 40);
      }
    }

    // Academic pressure analysis
    if (context.academicPressure) {
      const { upcomingDeadlines, workloadLevel } = context.academicPressure;
      
      if (upcomingDeadlines > 3 || workloadLevel === 'overwhelming') {
        if (mood === 'neutral' || mood === 'satisfied') {
          mood = 'stressed';
          confidence = Math.max(confidence, 70);
        }
      }
    }

    // Personal factors analysis
    if (context.personalFactors) {
      const { sleepQuality, stressLevel } = context.personalFactors;
      
      if (sleepQuality < 4) {
        mood = 'tired';
        confidence = Math.max(confidence, 60);
      }
      
      if (stressLevel > 7) {
        mood = 'stressed';
        confidence = Math.max(confidence, 70);
      }
    }

    return confidence > 30 ? { mood, confidence } : null;
  }

  // Detect mood from study session data
  detectMoodFromStudySession(session: StudySession): MoodData {
    const context: MoodContext = {
      studySession: {
        duration: session.duration,
        subject: session.subject,
        difficulty: session.difficulty || 'medium',
        performance: this.calculateSessionPerformance(session)
      },
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      recentActivity: this.getRecentActivity(),
      environmentalFactors: this.getEnvironmentalFactors()
    };

    const behavioralMood = this.detectMoodFromBehavior(context);
    
    const moodData: MoodData = {
      id: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      mood: behavioralMood?.mood || 'neutral',
      confidence: behavioralMood?.confidence || 50,
      intensity: this.calculateMoodIntensity(session),
      context,
      triggers: this.extractStudyTriggers(session),
      duration: this.estimateMoodDuration(behavioralMood?.mood || 'neutral', this.calculateMoodIntensity(session)),
      source: 'study_performance'
    };

    this.recordMood(moodData);
    return moodData;
  }

  // Record mood data
  recordMood(moodData: MoodData): void {
    this.moodHistory.push(moodData);
    this.saveMoodHistory();
    this.analyzeMoodPatterns();
  }

  // Get current mood
  getCurrentMood(): MoodData | null {
    if (this.moodHistory.length === 0) return null;
    
    // Return the most recent mood
    return this.moodHistory[this.moodHistory.length - 1];
  }

  // Get mood history
  getMoodHistory(days: number = 7): MoodData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.moodHistory.filter(mood => mood.timestamp >= cutoffDate);
  }

  // Analyze mood patterns
  analyzeMoodPatterns(): MoodPattern | null {
    if (this.moodHistory.length < 5) return null;

    const recentMoods = this.getMoodHistory(30);
    const moodFrequency: Record<MoodType, number> = {} as Record<MoodType, number>;
    
    // Initialize mood frequency
    Object.keys(this.sentimentKeywords).forEach(mood => {
      moodFrequency[mood as MoodType] = 0;
    });

    // Count mood occurrences
    recentMoods.forEach(moodData => {
      moodFrequency[moodData.mood]++;
    });

    // Find dominant mood
    const dominantMood = Object.entries(moodFrequency).reduce((a, b) => 
      moodFrequency[a[0] as MoodType] > moodFrequency[b[0] as MoodType] ? a : b
    )[0] as MoodType;

    // Calculate mood stability
    const moodStability = this.calculateMoodStability(recentMoods);

    // Analyze trends
    const trends = this.analyzeMoodTrends(recentMoods);

    // Analyze contextual triggers
    const triggers = this.analyzeContextualTriggers(recentMoods);

    // Analyze time-based patterns
    const timePatterns = this.analyzeTimeBasedPatterns(recentMoods);

    // Analyze study correlation
    const studyCorrelation = this.analyzeStudyCorrelation(recentMoods);

    this.moodPatterns = {
      dominantMood,
      moodFrequency,
      moodStability,
      moodTrends: trends,
      contextualTriggers: triggers,
      timeBasedPatterns: timePatterns,
      studyCorrelation
    };

    return this.moodPatterns;
  }

  // Generate mood-based recommendations
  generateMoodRecommendations(): MoodRecommendation[] {
    const currentMood = this.getCurrentMood();
    const patterns = this.moodPatterns;
    
    if (!currentMood || !patterns) return [];

    const recommendations: MoodRecommendation[] = [];

    // Generate recommendations based on current mood
    switch (currentMood.mood) {
      case 'frustrated':
        recommendations.push(this.createFrustrationRecommendation(currentMood));
        break;
      case 'overwhelmed':
        recommendations.push(this.createOverwhelmedRecommendation(currentMood));
        break;
      case 'anxious':
        recommendations.push(this.createAnxietyRecommendation(currentMood));
        break;
      case 'stressed':
        recommendations.push(this.createStressRecommendation(currentMood));
        break;
      case 'bored':
        recommendations.push(this.createBoredomRecommendation(currentMood));
        break;
      case 'tired':
        recommendations.push(this.createTirednessRecommendation(currentMood));
        break;
      case 'discouraged':
        recommendations.push(this.createDiscouragementRecommendation(currentMood));
        break;
      case 'lonely':
        recommendations.push(this.createLonelinessRecommendation(currentMood));
        break;
      case 'excited':
      case 'motivated':
      case 'confident':
        recommendations.push(this.createPositiveMoodRecommendation(currentMood));
        break;
    }

    // Generate general mood improvement recommendations
    if (currentMood.confidence < 70) {
      recommendations.push(this.createMoodStabilizationRecommendation());
    }

    return recommendations;
  }

  // Helper methods
  private adjustConfidenceForStudyContext(confidence: number, studySession: any, mood: MoodType): number {
    let adjustedConfidence = confidence;

    // Increase confidence for mood-study alignment
    if (mood === 'focused' && studySession.duration > 30) {
      adjustedConfidence += 10;
    }
    if (mood === 'frustrated' && studySession.performance < 50) {
      adjustedConfidence += 15;
    }
    if (mood === 'satisfied' && studySession.performance > 80) {
      adjustedConfidence += 10;
    }

    return Math.min(100, adjustedConfidence);
  }

  private extractTriggers(text: string, mood: MoodType): string[] {
    const triggers: string[] = [];
    const lowerText = text.toLowerCase();

    // Common trigger patterns
    const triggerPatterns = {
      academic: ['test', 'exam', 'quiz', 'assignment', 'homework', 'deadline', 'grade'],
      social: ['friend', 'classmate', 'group', 'team', 'alone', 'lonely', 'social'],
      time: ['late', 'early', 'time', 'schedule', 'rushed', 'hurry', 'deadline'],
      performance: ['score', 'grade', 'result', 'performance', 'mistake', 'error', 'wrong'],
      difficulty: ['hard', 'difficult', 'confusing', 'complex', 'challenging', 'easy', 'simple']
    };

    for (const [category, patterns] of Object.entries(triggerPatterns)) {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        triggers.push(category);
      }
    }

    return triggers;
  }

  private estimateMoodDuration(mood: MoodType, intensity: number): number {
    const baseDuration: Record<MoodType, number> = {
      excited: 30,
      motivated: 60,
      confident: 45,
      focused: 40,
      curious: 35,
      satisfied: 50,
      frustrated: 25,
      overwhelmed: 20,
      anxious: 30,
      stressed: 35,
      confused: 20,
      bored: 45,
      tired: 60,
      discouraged: 40,
      lonely: 50,
      angry: 20,
      sad: 45,
      neutral: 30
    };

    // Adjust duration based on intensity
    const intensityMultiplier = intensity / 100;
    return Math.round(baseDuration[mood] * (0.5 + intensityMultiplier));
  }

  private calculateSessionPerformance(session: StudySession): number {
    // This would be calculated based on actual performance metrics
    // For now, return a mock value
    return Math.random() * 100;
  }

  private calculateMoodIntensity(session: StudySession): number {
    // Calculate intensity based on session characteristics
    let intensity = 50;

    if (session.duration > 60) intensity += 10;
    if (session.difficulty === 'hard') intensity += 15;
    if (session.difficulty === 'easy') intensity -= 10;

    return Math.max(0, Math.min(100, intensity));
  }

  private extractStudyTriggers(session: StudySession): string[] {
    const triggers: string[] = [];
    
    if (session.duration > 90) triggers.push('long_session');
    if (session.difficulty === 'hard') triggers.push('difficult_content');
    if (session.subject) triggers.push(`subject_${session.subject.toLowerCase()}`);
    
    return triggers;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private getDayOfWeek(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }

  private getRecentActivity(): string[] {
    // This would be populated from actual activity data
    return ['study_session', 'break', 'social_interaction'];
  }

  private getEnvironmentalFactors(): string[] {
    // This would be populated from environmental sensors or user input
    return ['quiet', 'comfortable', 'good_lighting'];
  }

  private calculateMoodStability(moods: MoodData[]): number {
    if (moods.length < 2) return 100;

    let stability = 100;
    let moodChanges = 0;

    for (let i = 1; i < moods.length; i++) {
      if (moods[i].mood !== moods[i - 1].mood) {
        moodChanges++;
      }
    }

    stability = Math.max(0, 100 - (moodChanges / (moods.length - 1)) * 100);
    return Math.round(stability);
  }

  private analyzeMoodTrends(moods: MoodData[]): { improving: MoodType[]; declining: MoodType[]; stable: MoodType[] } {
    const positiveMoods: MoodType[] = ['excited', 'motivated', 'confident', 'focused', 'curious', 'satisfied'];
    const negativeMoods: MoodType[] = ['frustrated', 'overwhelmed', 'anxious', 'stressed', 'confused', 'bored', 'tired', 'discouraged', 'lonely', 'angry', 'sad'];

    const recentMoods = moods.slice(-7); // Last 7 moods
    const earlierMoods = moods.slice(-14, -7); // Previous 7 moods

    const improving: MoodType[] = [];
    const declining: MoodType[] = [];
    const stable: MoodType[] = [];

    // Analyze trends for each mood type
    for (const mood of [...positiveMoods, ...negativeMoods]) {
      const recentCount = recentMoods.filter(m => m.mood === mood).length;
      const earlierCount = earlierMoods.filter(m => m.mood === mood).length;

      if (recentCount > earlierCount) {
        if (positiveMoods.includes(mood)) {
          improving.push(mood);
        } else {
          declining.push(mood);
        }
      } else if (recentCount === earlierCount) {
        stable.push(mood);
      }
    }

    return { improving, declining, stable };
  }

  private analyzeContextualTriggers(moods: MoodData[]): { positive: string[]; negative: string[]; neutral: string[] } {
    const positive: string[] = [];
    const negative: string[] = [];
    const neutral: string[] = [];

    const triggerCounts: Record<string, { positive: number; negative: number; neutral: number }> = {};

    moods.forEach(mood => {
      mood.triggers.forEach(trigger => {
        if (!triggerCounts[trigger]) {
          triggerCounts[trigger] = { positive: 0, negative: 0, neutral: 0 };
        }

        const isPositive = ['excited', 'motivated', 'confident', 'focused', 'curious', 'satisfied'].includes(mood.mood);
        const isNegative = ['frustrated', 'overwhelmed', 'anxious', 'stressed', 'confused', 'bored', 'tired', 'discouraged', 'lonely', 'angry', 'sad'].includes(mood.mood);

        if (isPositive) triggerCounts[trigger].positive++;
        else if (isNegative) triggerCounts[trigger].negative++;
        else triggerCounts[trigger].neutral++;
      });
    });

    Object.entries(triggerCounts).forEach(([trigger, counts]) => {
      const total = counts.positive + counts.negative + counts.neutral;
      const positiveRatio = counts.positive / total;
      const negativeRatio = counts.negative / total;

      if (positiveRatio > 0.6) positive.push(trigger);
      else if (negativeRatio > 0.6) negative.push(trigger);
      else neutral.push(trigger);
    });

    return { positive, negative, neutral };
  }

  private analyzeTimeBasedPatterns(moods: MoodData[]): { morning: MoodType[]; afternoon: MoodType[]; evening: MoodType[]; night: MoodType[] } {
    const patterns = { morning: [] as MoodType[], afternoon: [] as MoodType[], evening: [] as MoodType[], night: [] as MoodType[] };

    moods.forEach(mood => {
      const hour = mood.timestamp.getHours();
      if (hour < 6) patterns.night.push(mood.mood);
      else if (hour < 12) patterns.morning.push(mood.mood);
      else if (hour < 18) patterns.afternoon.push(mood.mood);
      else patterns.evening.push(mood.mood);
    });

    return patterns;
  }

  private analyzeStudyCorrelation(moods: MoodData[]): { highPerformance: MoodType[]; lowPerformance: MoodType[]; optimalMood: MoodType[] } {
    const highPerformance: MoodType[] = [];
    const lowPerformance: MoodType[] = [];
    const optimalMood: MoodType[] = [];

    moods.forEach(mood => {
      if (mood.context.studySession) {
        const performance = mood.context.studySession.performance;
        
        if (performance >= 80) {
          if (!highPerformance.includes(mood.mood)) highPerformance.push(mood.mood);
        } else if (performance < 50) {
          if (!lowPerformance.includes(mood.mood)) lowPerformance.push(mood.mood);
        }
      }
    });

    // Optimal moods for study
    optimalMood.push('focused', 'motivated', 'curious', 'confident');

    return { highPerformance, lowPerformance, optimalMood };
  }

  // Create specific mood recommendations
  private createFrustrationRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `frustration-${Date.now()}`,
      type: 'immediate',
      priority: 'high',
      title: 'Take a Break and Reset',
      description: 'You seem frustrated. Let\'s take a step back and approach this differently.',
      action: 'Take a 10-minute break, then try a different study approach',
      expectedOutcome: 'Reduced frustration and improved focus',
      moodTarget: 'focused',
      confidence: 75,
      implementation: {
        steps: [
          'Step away from your study area',
          'Take deep breaths for 2 minutes',
          'Do light stretching or walk around',
          'Return with a fresh perspective',
          'Try breaking the problem into smaller parts'
        ],
        estimatedTime: '10-15 minutes',
        resources: ['Timer', 'Comfortable space', 'Water'],
        alternatives: ['Switch to a different subject', 'Ask for help', 'Use a different learning method']
      },
      tracking: {
        metrics: ['Frustration level', 'Focus improvement', 'Problem-solving success'],
        successIndicators: ['Feeling calmer', 'Able to approach problems differently', 'Increased patience'],
        followUpActions: ['Check in after 15 minutes', 'Adjust study approach if needed']
      }
    };
  }

  private createOverwhelmedRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `overwhelmed-${Date.now()}`,
      type: 'immediate',
      priority: 'urgent',
      title: 'Break Down the Task',
      description: 'You\'re feeling overwhelmed. Let\'s simplify and focus on one thing at a time.',
      action: 'Create a simple, manageable task list and focus on one item',
      expectedOutcome: 'Reduced overwhelm and increased sense of control',
      moodTarget: 'focused',
      confidence: 80,
      implementation: {
        steps: [
          'Write down everything you need to do',
          'Prioritize tasks by importance and urgency',
          'Choose the smallest, easiest task first',
          'Set a timer for 25 minutes',
          'Focus only on that one task',
          'Take a 5-minute break when done'
        ],
        estimatedTime: '30-45 minutes',
        resources: ['Paper and pen', 'Timer', 'Priority matrix'],
        alternatives: ['Ask for help prioritizing', 'Delegate some tasks', 'Postpone non-urgent items']
      },
      tracking: {
        metrics: ['Overwhelm level', 'Task completion', 'Sense of control'],
        successIndicators: ['Feeling more organized', 'Completing tasks', 'Reduced anxiety'],
        followUpActions: ['Review progress in 30 minutes', 'Adjust approach if needed']
      }
    };
  }

  private createAnxietyRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `anxiety-${Date.now()}`,
      type: 'immediate',
      priority: 'high',
      title: 'Practice Calming Techniques',
      description: 'You seem anxious. Let\'s use some calming techniques to help you feel better.',
      action: 'Practice deep breathing and grounding techniques',
      expectedOutcome: 'Reduced anxiety and improved focus',
      moodTarget: 'calm',
      confidence: 70,
      implementation: {
        steps: [
          'Find a quiet, comfortable space',
          'Sit or stand with good posture',
          'Breathe in slowly for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly for 6 counts',
          'Repeat 5-10 times',
          'Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste'
        ],
        estimatedTime: '5-10 minutes',
        resources: ['Quiet space', 'Timer', 'Comfortable seating'],
        alternatives: ['Progressive muscle relaxation', 'Meditation app', 'Gentle exercise']
      },
      tracking: {
        metrics: ['Anxiety level', 'Heart rate', 'Breathing pattern'],
        successIndicators: ['Feeling calmer', 'Slower breathing', 'Reduced tension'],
        followUpActions: ['Check in after 10 minutes', 'Continue if needed']
      }
    };
  }

  private createStressRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `stress-${Date.now()}`,
      type: 'immediate',
      priority: 'high',
      title: 'Stress Relief Activity',
      description: 'You\'re feeling stressed. Let\'s do something to help you relax and recharge.',
      action: 'Engage in a stress-relieving activity for 15-20 minutes',
      expectedOutcome: 'Reduced stress and improved mood',
      moodTarget: 'relaxed',
      confidence: 75,
      implementation: {
        steps: [
          'Choose a stress-relief activity you enjoy',
          'Set aside 15-20 minutes for this activity',
          'Focus completely on the activity',
          'Notice how your body feels during and after',
          'Take a moment to appreciate the break'
        ],
        estimatedTime: '15-20 minutes',
        resources: ['Activity materials', 'Timer', 'Comfortable space'],
        alternatives: ['Listen to music', 'Take a walk', 'Call a friend', 'Do gentle exercise']
      },
      tracking: {
        metrics: ['Stress level', 'Mood improvement', 'Energy level'],
        successIndicators: ['Feeling more relaxed', 'Improved mood', 'Increased energy'],
        followUpActions: ['Reflect on what helped', 'Plan regular stress relief']
      }
    };
  }

  private createBoredomRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `boredom-${Date.now()}`,
      type: 'immediate',
      priority: 'medium',
      title: 'Add Variety to Your Study',
      description: 'You seem bored. Let\'s make your study session more interesting and engaging.',
      action: 'Try a different study method or add interactive elements',
      expectedOutcome: 'Increased engagement and interest in learning',
      moodTarget: 'curious',
      confidence: 70,
      implementation: {
        steps: [
          'Switch to a different study method',
          'Add visual elements like diagrams or charts',
          'Create a game or quiz about the material',
          'Teach the concept to someone else (or pretend to)',
          'Find real-world applications of what you\'re learning'
        ],
        estimatedTime: '20-30 minutes',
        resources: ['Study materials', 'Visual aids', 'Creative tools'],
        alternatives: ['Take a break and return later', 'Study with a friend', 'Use multimedia resources']
      },
      tracking: {
        metrics: ['Engagement level', 'Interest in material', 'Retention'],
        successIndicators: ['Feeling more interested', 'Better focus', 'Enjoying the process'],
        followUpActions: ['Continue with varied methods', 'Share what worked']
      }
    };
  }

  private createTirednessRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `tiredness-${Date.now()}`,
      type: 'immediate',
      priority: 'high',
      title: 'Rest and Recharge',
      description: 'You seem tired. It\'s important to rest when you need it for better learning.',
      action: 'Take a proper break or rest to recharge your energy',
      expectedOutcome: 'Restored energy and improved focus',
      moodTarget: 'refreshed',
      confidence: 85,
      implementation: {
        steps: [
          'Stop studying for now',
          'Take a 20-30 minute nap or rest',
          'Drink water and have a light snack',
          'Do some light stretching or movement',
          'Return to studying when you feel refreshed'
        ],
        estimatedTime: '20-30 minutes',
        resources: ['Comfortable place to rest', 'Water', 'Light snack'],
        alternatives: ['Take a walk', 'Do light exercise', 'Listen to calming music']
      },
      tracking: {
        metrics: ['Energy level', 'Alertness', 'Focus ability'],
        successIndicators: ['Feeling more alert', 'Better concentration', 'Increased energy'],
        followUpActions: ['Resume studying when ready', 'Consider sleep schedule']
      }
    };
  }

  private createDiscouragementRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `discouragement-${Date.now()}`,
      type: 'immediate',
      priority: 'high',
      title: 'Celebrate Small Wins',
      description: 'You seem discouraged. Let\'s focus on what you\'ve accomplished and build from there.',
      action: 'Acknowledge your progress and set small, achievable goals',
      expectedOutcome: 'Improved confidence and motivation',
      moodTarget: 'motivated',
      confidence: 70,
      implementation: {
        steps: [
          'Write down 3 things you\'ve learned today',
          'List 2 things you did well recently',
          'Set one small, achievable goal for the next 30 minutes',
          'Focus on progress, not perfection',
          'Celebrate when you complete the small goal'
        ],
        estimatedTime: '15-20 minutes',
        resources: ['Paper and pen', 'Positive mindset', 'Small rewards'],
        alternatives: ['Talk to a supportive person', 'Review past successes', 'Take a break']
      },
      tracking: {
        metrics: ['Confidence level', 'Motivation', 'Progress made'],
        successIndicators: ['Feeling more positive', 'Increased motivation', 'Sense of accomplishment'],
        followUpActions: ['Continue with small goals', 'Regular progress check-ins']
      }
    };
  }

  private createLonelinessRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `loneliness-${Date.now()}`,
      type: 'immediate',
      priority: 'medium',
      title: 'Connect with Others',
      description: 'You seem to be feeling lonely. Let\'s find ways to connect with others while studying.',
      action: 'Reach out to study partners or join a study group',
      expectedOutcome: 'Reduced loneliness and increased social connection',
      moodTarget: 'connected',
      confidence: 65,
      implementation: {
        steps: [
          'Reach out to a classmate or friend',
          'Ask if they want to study together',
          'Join an online study group or forum',
          'Share what you\'re learning with someone',
          'Consider joining a study buddy program'
        ],
        estimatedTime: '30-45 minutes',
        resources: ['Contact list', 'Study materials', 'Online platforms'],
        alternatives: ['Study in a public place', 'Join virtual study sessions', 'Participate in online discussions']
      },
      tracking: {
        metrics: ['Loneliness level', 'Social connection', 'Study engagement'],
        successIndicators: ['Feeling more connected', 'Enjoying social interaction', 'Better study experience'],
        followUpActions: ['Maintain connections', 'Regular social study sessions']
      }
    };
  }

  private createPositiveMoodRecommendation(mood: MoodData): MoodRecommendation {
    return {
      id: `positive-${Date.now()}`,
      type: 'immediate',
      priority: 'low',
      title: 'Leverage Your Positive Energy',
      description: 'You\'re in a great mood! Let\'s use this positive energy to tackle challenging topics.',
      action: 'Take on more difficult or complex learning tasks',
      expectedOutcome: 'Maximized learning potential and continued positive mood',
      moodTarget: 'accomplished',
      confidence: 80,
      implementation: {
        steps: [
          'Identify a challenging topic or problem',
          'Set an ambitious but achievable goal',
          'Use your positive energy to stay focused',
          'Celebrate small victories along the way',
          'Share your success with others'
        ],
        estimatedTime: '45-60 minutes',
        resources: ['Challenging material', 'Positive mindset', 'Goal tracking'],
        alternatives: ['Help others learn', 'Explore new topics', 'Create something new']
      },
      tracking: {
        metrics: ['Goal achievement', 'Learning progress', 'Mood maintenance'],
        successIndicators: ['Completing challenging tasks', 'Feeling accomplished', 'Maintaining positive mood'],
        followUpActions: ['Build on success', 'Set new challenges']
      }
    };
  }

  private createMoodStabilizationRecommendation(): MoodRecommendation {
    return {
      id: `stabilization-${Date.now()}`,
      type: 'short_term',
      priority: 'medium',
      title: 'Build Emotional Resilience',
      description: 'Let\'s work on building your emotional resilience and mood stability.',
      action: 'Practice daily mood tracking and emotional awareness',
      expectedOutcome: 'Improved emotional stability and self-awareness',
      moodTarget: 'stable',
      confidence: 60,
      implementation: {
        steps: [
          'Start a daily mood journal',
          'Identify mood triggers and patterns',
          'Practice mindfulness or meditation',
          'Develop healthy coping strategies',
          'Regular check-ins with yourself'
        ],
        estimatedTime: '10-15 minutes daily',
        resources: ['Mood journal', 'Mindfulness app', 'Support system'],
        alternatives: ['Professional counseling', 'Support groups', 'Wellness apps']
      },
      tracking: {
        metrics: ['Mood stability', 'Self-awareness', 'Coping skills'],
        successIndicators: ['More consistent mood', 'Better self-understanding', 'Effective coping'],
        followUpActions: ['Continue daily practice', 'Adjust strategies as needed']
      }
    };
  }

  // Save and load methods
  private saveMoodHistory(): void {
    localStorage.setItem('moodHistory', JSON.stringify(this.moodHistory));
  }

  private loadMoodHistory(): void {
    try {
      const history = localStorage.getItem('moodHistory');
      if (history) {
        this.moodHistory = JSON.parse(history).map((mood: any) => ({
          ...mood,
          timestamp: new Date(mood.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  }
}

export const moodDetection = new MoodDetectionService();
