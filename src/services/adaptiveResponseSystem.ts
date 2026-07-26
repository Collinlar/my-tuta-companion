import { moodDetection, MoodData, MoodType } from './moodDetection';
import { aiCompanionService, AICompanionMessage } from './aiCompanionService';

export interface AdaptiveResponse {
  id: string;
  messageId: string;
  originalResponse: string;
  adaptedResponse: string;
  adaptationType: AdaptationType;
  emotionalContext: EmotionalContext;
  confidence: number;
  timestamp: Date;
}

export type AdaptationType = 
  | 'tone_adjustment' | 'encouragement_boost' | 'calming_approach' 
  | 'motivation_enhancement' | 'empathy_increase' | 'clarity_improvement'
  | 'urgency_adjustment' | 'support_enhancement' | 'celebration_amplification';

export interface EmotionalContext {
  currentMood: MoodType;
  moodIntensity: number;
  moodConfidence: number;
  emotionalTrend: 'improving' | 'declining' | 'stable';
  stressLevel: number;
  energyLevel: number;
  socialContext: 'isolated' | 'supported' | 'neutral';
  academicPressure: 'low' | 'moderate' | 'high' | 'overwhelming';
}

export interface ResponseAdaptation {
  moodType: MoodType;
  adaptations: {
    tone: string[];
    language: string[];
    approach: string[];
    suggestions: string[];
    encouragement: string[];
    support: string[];
  };
  triggers: string[];
  avoid: string[];
}

export class AdaptiveResponseSystem {
  private responseHistory: AdaptiveResponse[] = [];
  private adaptationPatterns: Map<MoodType, ResponseAdaptation> = new Map();
  private emotionalContext: EmotionalContext | null = null;

  constructor() {
    this.initializeAdaptationPatterns();
    this.loadResponseHistory();
  }

  // Initialize adaptation patterns for different moods
  private initializeAdaptationPatterns(): void {
    // Positive moods
    this.adaptationPatterns.set('excited', {
      moodType: 'excited',
      adaptations: {
        tone: ['enthusiastic', 'energetic', 'celebratory'],
        language: ['amazing', 'fantastic', 'brilliant', 'wonderful', 'awesome'],
        approach: ['channel energy', 'build momentum', 'maintain enthusiasm'],
        suggestions: ['tackle challenging topics', 'explore new concepts', 'share your excitement'],
        encouragement: ['keep that energy going', 'you\'re on fire', 'this is your moment'],
        support: ['I love your enthusiasm', 'your energy is contagious', 'let\'s ride this wave']
      },
      triggers: ['energy', 'excitement', 'momentum', 'breakthrough'],
      avoid: ['dampening enthusiasm', 'being too cautious', 'slowing down']
    });

    this.adaptationPatterns.set('motivated', {
      moodType: 'motivated',
      adaptations: {
        tone: ['supportive', 'encouraging', 'confident'],
        language: ['ready', 'determined', 'focused', 'driven', 'committed'],
        approach: ['build on motivation', 'set clear goals', 'maintain momentum'],
        suggestions: ['set ambitious goals', 'create action plans', 'track progress'],
        encouragement: ['you\'ve got this', 'stay focused', 'keep pushing forward'],
        support: ['I believe in you', 'your determination shows', 'let\'s make it happen']
      },
      triggers: ['goals', 'progress', 'achievement', 'success'],
      avoid: ['doubt', 'hesitation', 'overwhelming']
    });

    this.adaptationPatterns.set('confident', {
      moodType: 'confident',
      adaptations: {
        tone: ['affirming', 'respectful', 'collaborative'],
        language: ['capable', 'skilled', 'competent', 'proficient', 'expert'],
        approach: ['acknowledge strengths', 'build on confidence', 'challenge appropriately'],
        suggestions: ['tackle advanced topics', 'help others learn', 'take on leadership roles'],
        encouragement: ['you\'re doing great', 'trust your abilities', 'you know what you\'re doing'],
        support: ['your confidence is well-deserved', 'I trust your judgment', 'you\'ve earned this']
      },
      triggers: ['competence', 'mastery', 'expertise', 'leadership'],
      avoid: ['undermining confidence', 'excessive praise', 'doubt']
    });

    // Challenging moods
    this.adaptationPatterns.set('frustrated', {
      moodType: 'frustrated',
      adaptations: {
        tone: ['calm', 'understanding', 'patient'],
        language: ['I understand', 'it\'s okay', 'let\'s work through this', 'step by step'],
        approach: ['acknowledge frustration', 'break down problems', 'offer alternatives'],
        suggestions: ['take a short break', 'try a different approach', 'ask for help'],
        encouragement: ['frustration is part of learning', 'you\'re not alone', 'we\'ll figure this out'],
        support: ['I\'m here to help', 'let\'s tackle this together', 'everyone gets frustrated']
      },
      triggers: ['understanding', 'patience', 'alternatives', 'support'],
      avoid: ['dismissing feelings', 'being impatient', 'adding pressure']
    });

    this.adaptationPatterns.set('overwhelmed', {
      moodType: 'overwhelmed',
      adaptations: {
        tone: ['gentle', 'reassuring', 'calm'],
        language: ['breathe', 'one step at a time', 'we\'ll get through this', 'it\'s manageable'],
        approach: ['simplify', 'prioritize', 'break down', 'offer support'],
        suggestions: ['make a simple list', 'focus on one thing', 'ask for help', 'take breaks'],
        encouragement: ['you\'re stronger than you think', 'this feeling will pass', 'you\'ve overcome challenges before'],
        support: ['I\'m here with you', 'let\'s take this slowly', 'you don\'t have to do this alone']
      },
      triggers: ['simplicity', 'support', 'breathing', 'one step'],
      avoid: ['complexity', 'pressure', 'rushing', 'overwhelming tasks']
    });

    this.adaptationPatterns.set('anxious', {
      moodType: 'anxious',
      adaptations: {
        tone: ['calm', 'reassuring', 'grounding'],
        language: ['breathe', 'present moment', 'safe', 'grounded', 'centered'],
        approach: ['grounding techniques', 'focus on present', 'reduce uncertainty'],
        suggestions: ['practice deep breathing', 'focus on what you can control', 'use grounding techniques'],
        encouragement: ['you\'re safe', 'this feeling will pass', 'you\'re stronger than anxiety'],
        support: ['I\'m here with you', 'let\'s breathe together', 'you\'re not alone in this']
      },
      triggers: ['safety', 'breathing', 'present', 'control'],
      avoid: ['uncertainty', 'pressure', 'future worries', 'catastrophizing']
    });

    this.adaptationPatterns.set('stressed', {
      moodType: 'stressed',
      adaptations: {
        tone: ['supportive', 'calm', 'understanding'],
        language: ['manageable', 'one thing at a time', 'you\'ve got this', 'breathe'],
        approach: ['stress management', 'prioritization', 'self-care'],
        suggestions: ['practice stress relief', 'prioritize tasks', 'take care of yourself'],
        encouragement: ['stress is temporary', 'you\'re handling this well', 'you\'ll get through this'],
        support: ['I understand the pressure', 'let\'s manage this together', 'your wellbeing matters']
      },
      triggers: ['management', 'care', 'breathing', 'one thing'],
      avoid: ['adding stress', 'pressure', 'rushing', 'perfectionism']
    });

    this.adaptationPatterns.set('tired', {
      moodType: 'tired',
      adaptations: {
        tone: ['gentle', 'caring', 'understanding'],
        language: ['rest', 'recharge', 'gentle', 'slow', 'careful'],
        approach: ['encourage rest', 'suggest lighter activities', 'prioritize wellbeing'],
        suggestions: ['take a break', 'get some rest', 'try lighter activities'],
        encouragement: ['rest is important', 'you deserve a break', 'listen to your body'],
        support: ['I care about your wellbeing', 'rest when you need to', 'your health comes first']
      },
      triggers: ['rest', 'care', 'gentle', 'wellbeing'],
      avoid: ['pressure', 'intense activities', 'ignoring fatigue']
    });

    this.adaptationPatterns.set('bored', {
      moodType: 'bored',
      adaptations: {
        tone: ['engaging', 'curious', 'energetic'],
        language: ['interesting', 'exciting', 'discover', 'explore', 'create'],
        approach: ['increase engagement', 'add variety', 'spark curiosity'],
        suggestions: ['try different methods', 'explore new topics', 'make it interactive'],
        encouragement: ['let\'s make this interesting', 'there\'s always something new to learn'],
        support: ['I\'ll help you find excitement', 'let\'s explore together', 'boredom can lead to creativity']
      },
      triggers: ['interest', 'variety', 'exploration', 'creativity'],
      avoid: ['monotony', 'repetition', 'dullness']
    });

    this.adaptationPatterns.set('discouraged', {
      moodType: 'discouraged',
      adaptations: {
        tone: ['encouraging', 'hopeful', 'supportive'],
        language: ['progress', 'growth', 'learning', 'improvement', 'potential'],
        approach: ['focus on progress', 'celebrate small wins', 'build hope'],
        suggestions: ['acknowledge what you\'ve learned', 'set small achievable goals', 'remember past successes'],
        encouragement: ['every expert was once a beginner', 'progress takes time', 'you\'re growing'],
        support: ['I believe in your potential', 'you\'re not alone', 'this feeling will pass']
      },
      triggers: ['progress', 'growth', 'hope', 'potential'],
      avoid: ['perfectionism', 'comparison', 'doubt']
    });

    this.adaptationPatterns.set('lonely', {
      moodType: 'lonely',
      adaptations: {
        tone: ['warm', 'connecting', 'supportive'],
        language: ['together', 'connection', 'community', 'support', 'belonging'],
        approach: ['foster connection', 'encourage social interaction', 'provide companionship'],
        suggestions: ['connect with others', 'join study groups', 'share your learning'],
        encouragement: ['you\'re not alone', 'I\'m here with you', 'connection is important'],
        support: ['I care about you', 'let\'s learn together', 'you belong here']
      },
      triggers: ['connection', 'together', 'community', 'belonging'],
      avoid: ['isolation', 'alone', 'disconnection']
    });

    // Neutral mood
    this.adaptationPatterns.set('neutral', {
      moodType: 'neutral',
      adaptations: {
        tone: ['balanced', 'supportive', 'encouraging'],
        language: ['steady', 'consistent', 'reliable', 'stable'],
        approach: ['maintain balance', 'gentle encouragement', 'steady progress'],
        suggestions: ['maintain your routine', 'try something new', 'set small goals'],
        encouragement: ['steady progress is good', 'consistency matters', 'you\'re doing well'],
        support: ['I\'m here to support you', 'let\'s keep moving forward', 'you\'re on track']
      },
      triggers: ['balance', 'consistency', 'progress', 'support'],
      avoid: ['dramatic changes', 'pressure', 'instability']
    });
  }

  // Adapt a response based on current emotional context
  adaptResponse(originalResponse: string, messageId: string): AdaptiveResponse {
    const currentMood = moodDetection.getCurrentMood();
    this.updateEmotionalContext();

    if (!currentMood || !this.emotionalContext) {
      return {
        id: `adaptation-${Date.now()}`,
        messageId,
        originalResponse,
        adaptedResponse: originalResponse,
        adaptationType: 'tone_adjustment',
        emotionalContext: this.emotionalContext || this.getDefaultContext(),
        confidence: 50,
        timestamp: new Date()
      };
    }

    const adaptation = this.adaptationPatterns.get(currentMood.mood);
    if (!adaptation) {
      return this.createDefaultAdaptation(originalResponse, messageId, currentMood);
    }

    const adaptedResponse = this.applyAdaptation(originalResponse, adaptation, currentMood);
    const adaptationType = this.determineAdaptationType(originalResponse, adaptedResponse);

    const adaptiveResponse: AdaptiveResponse = {
      id: `adaptation-${Date.now()}`,
      messageId,
      originalResponse,
      adaptedResponse,
      adaptationType,
      emotionalContext: this.emotionalContext,
      confidence: this.calculateAdaptationConfidence(currentMood, adaptation),
      timestamp: new Date()
    };

    this.recordAdaptation(adaptiveResponse);
    return adaptiveResponse;
  }

  // Apply adaptation to a response
  private applyAdaptation(originalResponse: string, adaptation: ResponseAdaptation, moodData: MoodData): string {
    let adaptedResponse = originalResponse;

    // Adjust tone based on mood
    adaptedResponse = this.adjustTone(adaptedResponse, adaptation, moodData);

    // Add appropriate language
    adaptedResponse = this.addAppropriateLanguage(adaptedResponse, adaptation, moodData);

    // Modify approach based on mood
    adaptedResponse = this.modifyApproach(adaptedResponse, adaptation, moodData);

    // Add encouragement if needed
    adaptedResponse = this.addEncouragement(adaptedResponse, adaptation, moodData);

    // Add support elements
    adaptedResponse = this.addSupport(adaptedResponse, adaptation, moodData);

    return adaptedResponse;
  }

  // Adjust tone based on mood
  private adjustTone(response: string, adaptation: ResponseAdaptation, moodData: MoodData): string {
    const intensity = moodData.intensity / 100;
    let adjustedResponse = response;

    // For high-intensity moods, make the response more energetic
    if (intensity > 0.7) {
      if (['excited', 'motivated', 'confident'].includes(moodData.mood)) {
        adjustedResponse = this.makeResponseMoreEnergetic(adjustedResponse);
      } else if (['frustrated', 'overwhelmed', 'anxious', 'stressed'].includes(moodData.mood)) {
        adjustedResponse = this.makeResponseMoreCalming(adjustedResponse);
      }
    }

    // For low-intensity moods, make the response more gentle
    if (intensity < 0.4) {
      adjustedResponse = this.makeResponseMoreGentle(adjustedResponse);
    }

    return adjustedResponse;
  }

  // Add appropriate language based on mood
  private addAppropriateLanguage(response: string, adaptation: ResponseAdaptation, moodData: MoodData): string {
    let enhancedResponse = response;

    // Add mood-appropriate words
    const appropriateWords = adaptation.adaptations.language;
    if (appropriateWords.length > 0) {
      const randomWord = appropriateWords[Math.floor(Math.random() * appropriateWords.length)];
      
      // Add the word naturally to the response
      if (response.includes('great') || response.includes('good')) {
        enhancedResponse = response.replace(/great|good/g, randomWord);
      } else {
        enhancedResponse = `${randomWord}! ${response}`;
      }
    }

    return enhancedResponse;
  }

  // Modify approach based on mood
  private modifyApproach(response: string, adaptation: ResponseAdaptation, moodData: MoodData): string {
    let modifiedResponse = response;

    // Add approach-specific suggestions
    const approaches = adaptation.adaptations.approach;
    if (approaches.length > 0 && !response.includes('let\'s')) {
      const approach = approaches[Math.floor(Math.random() * approaches.length)];
      modifiedResponse = `${response} Let's ${approach}.`;
    }

    return modifiedResponse;
  }

  // Add encouragement based on mood
  private addEncouragement(response: string, adaptation: ResponseAdaptation, moodData: MoodData): string {
    let encouragedResponse = response;

    // Add encouragement for challenging moods
    if (['frustrated', 'overwhelmed', 'anxious', 'stressed', 'tired', 'discouraged'].includes(moodData.mood)) {
      const encouragements = adaptation.adaptations.encouragement;
      if (encouragements.length > 0 && !response.includes('you') && !response.includes('I believe')) {
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        encouragedResponse = `${response} ${encouragement}.`;
      }
    }

    return encouragedResponse;
  }

  // Add support elements based on mood
  private addSupport(response: string, adaptation: ResponseAdaptation, moodData: MoodData): string {
    let supportedResponse = response;

    // Add support for emotional moods
    if (['frustrated', 'overwhelmed', 'anxious', 'stressed', 'tired', 'discouraged', 'lonely'].includes(moodData.mood)) {
      const support = adaptation.adaptations.support;
      if (support.length > 0 && !response.includes('I\'m here') && !response.includes('together')) {
        const supportMessage = support[Math.floor(Math.random() * support.length)];
        supportedResponse = `${response} ${supportMessage}.`;
      }
    }

    return supportedResponse;
  }

  // Helper methods for response modification
  private makeResponseMoreEnergetic(response: string): string {
    return response
      .replace(/good/g, 'amazing')
      .replace(/great/g, 'fantastic')
      .replace(/nice/g, 'brilliant')
      .replace(/\./g, '!')
      .replace(/let's/g, 'let\'s go!');
  }

  private makeResponseMoreCalming(response: string): string {
    return response
      .replace(/!/g, '.')
      .replace(/amazing/g, 'good')
      .replace(/fantastic/g, 'great')
      .replace(/brilliant/g, 'nice');
  }

  private makeResponseMoreGentle(response: string): string {
    return response
      .replace(/!/g, '.')
      .replace(/let's/g, 'let\'s gently')
      .replace(/go/g, 'proceed')
      .replace(/do/g, 'try');
  }

  // Determine adaptation type
  private determineAdaptationType(original: string, adapted: string): AdaptationType {
    if (adapted.length > original.length * 1.2) return 'encouragement_boost';
    if (adapted.includes('breathe') || adapted.includes('calm')) return 'calming_approach';
    if (adapted.includes('amazing') || adapted.includes('fantastic')) return 'celebration_amplification';
    if (adapted.includes('I understand') || adapted.includes('I\'m here')) return 'empathy_increase';
    if (adapted.includes('step by step') || adapted.includes('one thing')) return 'clarity_improvement';
    return 'tone_adjustment';
  }

  // Calculate adaptation confidence
  private calculateAdaptationConfidence(moodData: MoodData, adaptation: ResponseAdaptation): number {
    let confidence = moodData.confidence;

    // Increase confidence for high-intensity moods
    if (moodData.intensity > 70) {
      confidence += 10;
    }

    // Increase confidence for recent mood data
    const timeSinceMood = Date.now() - moodData.timestamp.getTime();
    if (timeSinceMood < 5 * 60 * 1000) { // Less than 5 minutes
      confidence += 15;
    }

    return Math.min(100, confidence);
  }

  // Update emotional context
  private updateEmotionalContext(): void {
    const currentMood = moodDetection.getCurrentMood();
    const moodHistory = moodDetection.getMoodHistory(7);
    
    if (!currentMood) {
      this.emotionalContext = this.getDefaultContext();
      return;
    }

    // Calculate emotional trend
    const recentMoods = moodHistory.slice(-5);
    const positiveMoods = ['excited', 'motivated', 'confident', 'focused', 'curious', 'satisfied'];
    const recentPositiveCount = recentMoods.filter(m => positiveMoods.includes(m.mood)).length;
    const trend = recentPositiveCount > recentMoods.length / 2 ? 'improving' : 
                 recentPositiveCount < recentMoods.length / 2 ? 'declining' : 'stable';

    // Calculate stress level based on mood and context
    const stressLevel = this.calculateStressLevel(currentMood, recentMoods);

    // Calculate energy level
    const energyLevel = this.calculateEnergyLevel(currentMood, recentMoods);

    // Determine social context
    const socialContext = this.determineSocialContext(currentMood, recentMoods);

    // Determine academic pressure
    const academicPressure = this.determineAcademicPressure(currentMood, recentMoods);

    this.emotionalContext = {
      currentMood: currentMood.mood,
      moodIntensity: currentMood.intensity,
      moodConfidence: currentMood.confidence,
      emotionalTrend: trend,
      stressLevel,
      energyLevel,
      socialContext,
      academicPressure
    };
  }

  // Calculate stress level
  private calculateStressLevel(currentMood: MoodData, recentMoods: MoodData[]): number {
    const stressMoods = ['stressed', 'overwhelmed', 'anxious', 'frustrated'];
    let stressLevel = 0;

    if (stressMoods.includes(currentMood.mood)) {
      stressLevel += 40;
    }

    const recentStressCount = recentMoods.filter(m => stressMoods.includes(m.mood)).length;
    stressLevel += (recentStressCount / recentMoods.length) * 30;

    if (currentMood.context.academicPressure?.workloadLevel === 'overwhelming') {
      stressLevel += 30;
    }

    return Math.min(100, stressLevel);
  }

  // Calculate energy level
  private calculateEnergyLevel(currentMood: MoodData, recentMoods: MoodData[]): number {
    const highEnergyMoods = ['excited', 'motivated', 'confident'];
    const lowEnergyMoods = ['tired', 'bored', 'discouraged'];

    if (highEnergyMoods.includes(currentMood.mood)) {
      return Math.min(100, 60 + currentMood.intensity * 0.4);
    }

    if (lowEnergyMoods.includes(currentMood.mood)) {
      return Math.max(0, 40 - currentMood.intensity * 0.4);
    }

    return 50;
  }

  // Determine social context
  private determineSocialContext(currentMood: MoodData, recentMoods: MoodData[]): 'isolated' | 'supported' | 'neutral' {
    if (currentMood.mood === 'lonely') return 'isolated';
    
    const socialMoods = recentMoods.filter(m => m.context.socialContext?.hasStudyBuddy || m.context.socialContext?.recentSocialInteraction);
    return socialMoods.length > recentMoods.length / 2 ? 'supported' : 'neutral';
  }

  // Determine academic pressure
  private determineAcademicPressure(currentMood: MoodData, recentMoods: MoodData[]): 'low' | 'moderate' | 'high' | 'overwhelming' {
    const pressureMoods = ['stressed', 'overwhelmed', 'anxious'];
    const pressureCount = recentMoods.filter(m => pressureMoods.includes(m.mood)).length;
    
    if (currentMood.context.academicPressure?.workloadLevel === 'overwhelming') return 'overwhelming';
    if (pressureCount > recentMoods.length * 0.6) return 'high';
    if (pressureCount > recentMoods.length * 0.3) return 'moderate';
    return 'low';
  }

  // Get default emotional context
  private getDefaultContext(): EmotionalContext {
    return {
      currentMood: 'neutral',
      moodIntensity: 50,
      moodConfidence: 50,
      emotionalTrend: 'stable',
      stressLevel: 30,
      energyLevel: 50,
      socialContext: 'neutral',
      academicPressure: 'moderate'
    };
  }

  // Create default adaptation
  private createDefaultAdaptation(originalResponse: string, messageId: string, moodData: MoodData): AdaptiveResponse {
    return {
      id: `adaptation-${Date.now()}`,
      messageId,
      originalResponse,
      adaptedResponse: originalResponse,
      adaptationType: 'tone_adjustment',
      emotionalContext: this.getDefaultContext(),
      confidence: moodData.confidence,
      timestamp: new Date()
    };
  }

  // Record adaptation
  private recordAdaptation(adaptation: AdaptiveResponse): void {
    this.responseHistory.push(adaptation);
    this.saveResponseHistory();
  }

  // Get adaptation history
  getAdaptationHistory(): AdaptiveResponse[] {
    return this.responseHistory;
  }

  // Get emotional context
  getEmotionalContext(): EmotionalContext | null {
    return this.emotionalContext;
  }

  // Save and load methods
  private saveResponseHistory(): void {
    localStorage.setItem('adaptiveResponseHistory', JSON.stringify(this.responseHistory));
  }

  private loadResponseHistory(): void {
    try {
      const history = localStorage.getItem('adaptiveResponseHistory');
      if (history) {
        this.responseHistory = JSON.parse(history).map((response: any) => ({
          ...response,
          timestamp: new Date(response.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading response history:', error);
    }
  }
}

export const adaptiveResponseSystem = new AdaptiveResponseSystem();
