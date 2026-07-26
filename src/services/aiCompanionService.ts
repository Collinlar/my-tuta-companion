import { groqApiService } from './groqApiService';
import { profileAwareAI, UserProfile } from './profileAwareAI';
import { advancedPatternRecognition } from './advancedPatternRecognition';
import { learningStyleDetection } from './learningStyleDetection';
import { optimalTimeDetection, TimeAnalysisData } from './optimalTimeDetection';
import { retentionPatternAnalysis } from './retentionPatternAnalysis';
import { interestMapping } from './interestMapping';
import { dynamicStudyRecommendations } from './dynamicStudyRecommendations';
import { moodDetection } from './moodDetection';
import { adaptiveResponseSystem } from './adaptiveResponseSystem';

export interface AICompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    studySession?: string;
    currentTask?: string;
    mood?: string;
    subject?: string;
    topic?: string;
  };
  metadata?: {
    suggestions?: string[];
    quickActions?: QuickAction[];
    emotion?: string;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  action: 'create_flashcards' | 'start_quiz' | 'view_progress' | 'take_break' | 'study_plan' | 'help_with_topic';
  icon: string;
  description: string;
}

export interface CompanionPersonality {
  name: string;
  tone: 'encouraging' | 'professional' | 'friendly' | 'mentor';
  expertise: string[];
  motivationalStyle: 'gentle' | 'challenging' | 'supportive';
  avatar: string;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  subject: string;
  topic: string;
  tasksCompleted: number;
  totalTasks: number;
  mood: string;
  productivity: number; // 1-10 scale
}

export class AICompanionService {
  private conversationHistory: AICompanionMessage[] = [];
  private currentSession: StudySession | null = null;
  private studySessions: StudySession[] = [];
  private personality: CompanionPersonality;
  private userProfile: UserProfile | null = null;

  constructor() {
    this.personality = {
      name: "StudyBuddy",
      tone: "encouraging",
      expertise: ["study strategies", "academic support", "motivation", "learning techniques"],
      motivationalStyle: "supportive",
      avatar: "🤖"
    };
    this.loadUserProfile();
    this.loadStudySessions();
  }

  private loadUserProfile(): void {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }
    } catch (error) {
      console.error('Error loading user profile for AI companion:', error);
    }
  }

  private loadStudySessions(): void {
    try {
      const sessions = localStorage.getItem('studySessions');
      if (sessions) {
        this.studySessions = JSON.parse(sessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading study sessions:', error);
    }
  }

  // Initialize conversation with personalized greeting
  async initializeConversation(): Promise<AICompanionMessage> {
    const greeting = await this.generatePersonalizedGreeting();
    const message: AICompanionMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
      context: {
        mood: 'excited'
      },
      metadata: {
        suggestions: this.getInitialSuggestions(),
        quickActions: this.getQuickActions()
      }
    };
    
    this.conversationHistory.push(message);
    return message;
  }

  // Send message and get AI response
  async sendMessage(userMessage: string, context?: any): Promise<AICompanionMessage> {
    // Add user message to history
    const userMsg: AICompanionMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      context: context || {}
    };
    this.conversationHistory.push(userMsg);

    // Generate AI response
    const aiResponse = await this.generateResponse(userMessage, context);
    
    // Add AI response to history
    this.conversationHistory.push(aiResponse);
    
    return aiResponse;
  }

  // Generate personalized greeting based on user profile, time, and learning style
  private async generatePersonalizedGreeting(): Promise<string> {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    if (!this.userProfile) {
      return `Good ${timeOfDay}! I'm ${this.personality.name}, your AI study companion. I'm here to help you learn and succeed! How can I assist you today?`;
    }

    const { name, grade, subjects, goals } = this.userProfile;
    const subjectList = subjects.slice(0, 2).join(' and ');
    const primaryGoal = goals[0] || 'your studies';

    // Get learning style information
    const learningStyle = learningStyleDetection.getLearningStyleProfile();
    const styleMessage = learningStyle ? ` I know you're a ${learningStyle.dominant} learner, so I'll tailor my suggestions accordingly.` : '';

    // Get optimal time information
    const timeStatus = optimalTimeDetection.isOptimalStudyTime();
    const timeMessage = timeStatus.isOptimal ? ` Great timing - this is one of your most productive study periods!` : timeStatus.confidence > 50 ? ` Consider studying during ${this.formatOptimalTime()} for better results.` : '';

    const greetings = [
      `Good ${timeOfDay}, ${name}! I'm ${this.personality.name}, your personal study companion. Ready to tackle ${subjectList} today?${styleMessage}${timeMessage}`,
      `Hey ${name}! Great to see you again. I'm here to help you with ${primaryGoal}.${styleMessage}${timeMessage} What would you like to work on?`,
      `Good ${timeOfDay}! I see you're in ${grade} studying ${subjectList}. Let's make today productive!${styleMessage}${timeMessage} How can I help?`,
      `Hello ${name}! Your AI study buddy is here and ready to help you excel in ${subjectList}.${styleMessage}${timeMessage} What's on your mind?`
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Generate AI response with context awareness
  private async generateResponse(userMessage: string, context?: any): Promise<AICompanionMessage> {
    const mood = this.detectMood(userMessage);
    const subject = this.extractSubject(userMessage);
    const topic = this.extractTopic(userMessage);

    // Detect mood using advanced mood detection
    const moodData = moodDetection.detectMoodFromText(userMessage, {
      studySession: this.currentSession ? {
        duration: this.currentSession.endTime ? 
          Math.floor((this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / (1000 * 60)) : 0,
        subject: this.currentSession.subject,
        difficulty: 'medium',
        performance: 75 // This would be calculated from actual performance
      } : undefined,
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      recentActivity: this.getRecentActivity(),
      environmentalFactors: this.getEnvironmentalFactors(),
      academicPressure: this.getAcademicPressure(),
      personalFactors: this.getPersonalFactors()
    });

    const systemPrompt = this.createSystemPrompt(moodData.mood, subject, topic);
    
    try {
      const response = await groqApiService.makeRequest([
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ]);

      // Apply adaptive response system
      const adaptiveResponse = adaptiveResponseSystem.adaptResponse(response, `msg-${Date.now()}`);

      const quickActions = this.generateQuickActions(userMessage, moodData.mood, subject);
      const suggestions = this.generateSuggestions(userMessage, moodData.mood, subject);

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: adaptiveResponse.adaptedResponse,
        timestamp: new Date(),
        context: {
          mood: moodData.mood,
          subject,
          topic,
          studySession: this.currentSession?.id
        },
        metadata: {
          suggestions,
          quickActions,
          emotion: this.getEmotionFromMood(moodData.mood)
        }
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(userMessage, moodData.mood);
    }
  }

  // Create personalized system prompt
  private createSystemPrompt(mood: string, subject?: string, topic?: string): string {
    const profileContext = this.userProfile ? `
PERSONALIZATION CONTEXT:
- Student Name: ${this.userProfile.name}
- Grade Level: ${this.userProfile.grade}
- School: ${this.userProfile.school}
- Subjects: ${this.userProfile.subjects.join(', ')}
- Goals: ${this.userProfile.goals.join(', ')}
- Current Mood: ${mood}
- Country: Ghana
- Curriculum: Ghana Education Service (GES)

GHANA EDUCATIONAL CONTEXT:
- You are an AI study companion specialized in the Ghanaian educational system
- Reference Ghana-specific examples, landmarks, and cultural context
- Align advice with Ghana Education Service (GES) curriculum standards
- Consider Ghana's exam systems (BECE for Grade 9, WASSCE for Grade 12)
- Use examples from Ghanaian geography, history, and culture
- Reference Ghanaian cities, regions, and local educational context
` : '';

    const subjectContext = subject ? `- Current Subject: ${subject}` : '';
    const topicContext = topic ? `- Current Topic: ${topic}` : '';

    // Get learning style information
    const learningStyle = learningStyleDetection.getLearningStyleProfile();
    const learningStyleContext = learningStyle ? `
LEARNING STYLE INFORMATION:
- Dominant Learning Style: ${learningStyle.dominant}
- Visual Learning: ${learningStyle.visual.score}% (confidence: ${learningStyle.visual.confidence}%)
- Auditory Learning: ${learningStyle.auditory.score}% (confidence: ${learningStyle.auditory.confidence}%)
- Kinesthetic Learning: ${learningStyle.kinesthetic.score}% (confidence: ${learningStyle.kinesthetic.confidence}%)
- Reading Learning: ${learningStyle.reading.score}% (confidence: ${learningStyle.reading.confidence}%)
- Overall Confidence: ${learningStyle.confidence}%

LEARNING STYLE GUIDANCE:
- Since they're a ${learningStyle.dominant} learner, tailor your suggestions to their preferred style
- For visual learners: suggest diagrams, charts, colors, videos, mind maps
- For auditory learners: suggest discussions, audio content, reading aloud, music
- For kinesthetic learners: suggest hands-on activities, movement, interactive content, physical demonstrations
- For reading learners: suggest written materials, note-taking, text-based resources, written summaries
` : '';

    // Get optimal time information
    const timeProfile = optimalTimeDetection.getOptimalTimeProfile();
    const timeStatus = optimalTimeDetection.isOptimalStudyTime();
    const optimalTimeContext = timeProfile ? `
OPTIMAL TIME INFORMATION:
- Peak Performance Hour: ${this.formatOptimalTime()}
- Peak Performance Day: ${timeProfile.peakPerformance.bestDay}
- Chronotype: ${timeProfile.circadianRhythm.chronotype}
- Current Time Status: ${timeStatus.isOptimal ? 'OPTIMAL' : 'SUBOPTIMAL'} (${timeStatus.confidence}% confidence)
- Current Time Reason: ${timeStatus.reason}
- Optimal Session Length: ${timeProfile.optimalConditions.sessionLength} minutes
- Optimal Break Frequency: ${timeProfile.optimalConditions.breakFrequency} per hour

TIME-BASED GUIDANCE:
- If current time is optimal: encourage focused study and challenging topics
- If current time is suboptimal: suggest lighter activities, review, or organization
- Recommend study during peak hours: ${this.formatOptimalTime()} on ${timeProfile.peakPerformance.bestDay}s
- Avoid study during low performance hours: ${this.formatHour(timeProfile.lowPerformance.worstHour)} on ${timeProfile.lowPerformance.worstDay}s
- Suggest session lengths around ${timeProfile.optimalConditions.sessionLength} minutes
- Recommend breaks every ${timeProfile.optimalConditions.breakDuration} minutes
` : '';

    // Get retention pattern information
    const retentionPattern = retentionPatternAnalysis.getRetentionPattern();
    const retentionRecommendations = retentionPatternAnalysis.getRetentionRecommendations();
    const retentionContext = retentionPattern ? `
RETENTION PATTERN INFORMATION:
- Overall Retention: ${Math.round(retentionPattern.overallRetention)}%
- Average Retrievability: ${Math.round(retentionPattern.averageRetrievability * 100)}%
- Forgetting Rate: ${Math.round(retentionPattern.forgettingRate)}% per day
- Optimal Review Interval: ${retentionPattern.optimalReviewInterval} days
- Strong Areas: ${retentionPattern.retentionInsights.strongAreas.join(', ') || 'None identified'}
- Weak Areas: ${retentionPattern.retentionInsights.weakAreas.join(', ') || 'None identified'}
- Overstudied Areas: ${retentionPattern.retentionInsights.overstudied.join(', ') || 'None'}
- Understudied Areas: ${retentionPattern.retentionInsights.understudied.join(', ') || 'None'}

RETENTION-BASED GUIDANCE:
- Focus on weak areas that need more practice and review
- Use spaced repetition for concepts with low retention
- Encourage review of overdue concepts (${retentionRecommendations.filter(r => r.urgency.reviewOverdue).length} overdue)
- Suggest consolidation activities for concepts at 'learning' level
- Recommend varied practice for low-retention concepts
- Use active recall techniques to improve retention
- Suggest connecting new concepts to well-retained concepts
` : '';

    // Get interest mapping information
    const engagementPattern = interestMapping.getEngagementPattern();
    const interestRecommendations = interestMapping.getInterestRecommendations();
    const highInterestTopics = interestMapping.getHighInterestTopics(3);
    const trendingInterests = interestMapping.getTrendingInterests(3);
    const interestContext = engagementPattern ? `
INTEREST & ENGAGEMENT INFORMATION:
- Overall Engagement: ${Math.round(engagementPattern.overallEngagement)}%
- Average Session Duration: ${Math.round(engagementPattern.averageSessionDuration)} minutes
- Peak Engagement Time: ${engagementPattern.peakEngagementTime}:00
- High Interest Topics: ${highInterestTopics.map(t => t.concept).join(', ') || 'None identified'}
- Trending Interests: ${trendingInterests.map(t => t.concept).join(', ') || 'None identified'}
- Interest Recommendations: ${interestRecommendations.length} available

INTEREST-BASED GUIDANCE:
- Leverage high-interest topics to boost motivation and engagement
- Connect new concepts to trending interests for better retention
- Use gamification and creative approaches for declining interests
- Suggest exploration of high-interest, low-engagement topics
- Encourage social learning and peer interaction for engagement
- Recommend personalized activities based on interest patterns
- Use interest clusters to create learning pathways
` : '';

    // Get dynamic recommendations information
    const activeRecommendations = dynamicStudyRecommendations.getActiveRecommendations();
    const urgentRecommendations = activeRecommendations.filter(r => r.priority === 'urgent');
    const highPriorityRecommendations = activeRecommendations.filter(r => r.priority === 'high');
    const dynamicContext = activeRecommendations.length > 0 ? `
DYNAMIC RECOMMENDATIONS INFORMATION:
- Active Recommendations: ${activeRecommendations.length} available
- Urgent Recommendations: ${urgentRecommendations.length} (${urgentRecommendations.map(r => r.title).join(', ') || 'None'})
- High Priority Recommendations: ${highPriorityRecommendations.length} (${highPriorityRecommendations.map(r => r.title).join(', ') || 'None'})
- Recommendation Types: ${[...new Set(activeRecommendations.map(r => r.type))].join(', ')}

DYNAMIC RECOMMENDATION GUIDANCE:
- Prioritize urgent recommendations (retention, deadlines, critical reviews)
- Suggest high-priority recommendations when student is ready to study
- Adapt recommendations to current mood, energy, and available time
- Use gamification elements to increase engagement and motivation
- Connect recommendations to student's learning goals and interests
- Provide encouragement and support for challenging recommendations
- Help student understand the reasoning behind each recommendation
` : '';

    return `You are ${this.personality.name}, a supportive AI study companion specialized in the Ghanaian educational system. Your role is to help Ghanaian students learn effectively while providing encouragement and motivation that resonates with their cultural and educational context.

${profileContext}
${learningStyleContext}
${optimalTimeContext}
${retentionContext}
${interestContext}
${dynamicContext}
${subjectContext}
${topicContext}

PERSONALITY GUIDELINES:
- Be encouraging and supportive, never judgmental
- Use a ${this.personality.tone} tone that's appropriate for ${this.userProfile?.grade || 'students'} in Ghana
- Provide specific, actionable advice tailored to their learning style and Ghanaian context
- Celebrate achievements and progress with Ghanaian cultural sensitivity
- Offer help when students seem ${mood}
- Reference their subjects and goals when relevant
- Use Ghana-specific examples, landmarks, and cultural references
- Align advice with Ghana Education Service (GES) curriculum standards
- Consider Ghana's exam systems (BECE for Grade 9, WASSCE for Grade 12)
- Keep responses conversational and engaging
- Ask follow-up questions to understand their needs better
- Adapt your suggestions to their dominant learning style

RESPONSE STYLE:
- Use emojis occasionally to add warmth
- Keep responses concise but helpful (2-3 sentences typically)
- Include specific suggestions when appropriate, tailored to their learning style
- Be encouraging about their academic journey
- Reference their profile context and learning style naturally

CURRENT CONTEXT:
- Student seems to be feeling: ${mood}
- ${subject ? `Working on: ${subject}` : 'No specific subject mentioned'}
- ${topic ? `Topic: ${topic}` : 'No specific topic mentioned'}
- ${learningStyle ? `Learning Style: ${learningStyle.dominant} (${learningStyle.confidence}% confidence)` : 'Learning style not yet determined'}
- ${timeProfile ? `Current Time Status: ${timeStatus.isOptimal ? 'OPTIMAL' : 'SUBOPTIMAL'} (${timeStatus.confidence}% confidence)` : 'Time analysis not yet available'}
- ${retentionPattern ? `Retention Level: ${Math.round(retentionPattern.overallRetention)}% overall, ${retentionRecommendations.filter(r => r.urgency.reviewOverdue).length} concepts overdue` : 'Retention analysis not yet available'}
- ${engagementPattern ? `Engagement Level: ${Math.round(engagementPattern.overallEngagement)}% overall, ${highInterestTopics.length} high-interest topics, ${trendingInterests.length} trending interests` : 'Interest analysis not yet available'}
- ${activeRecommendations.length > 0 ? `Active Recommendations: ${activeRecommendations.length} available, ${urgentRecommendations.length} urgent, ${highPriorityRecommendations.length} high priority` : 'No active recommendations available'}

Respond as their helpful study companion who knows their background, learning preferences, optimal timing, retention patterns, interests, engagement patterns, and current recommendations, and wants to see them succeed.`;
  }

  // Detect mood from user message
  private detectMood(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand') || lowerMessage.includes('help')) {
      return 'confused';
    }
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
      return 'frustrated';
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      return 'excited';
    }
    if (lowerMessage.includes('struggling') || lowerMessage.includes('can\'t') || lowerMessage.includes('stuck')) {
      return 'struggling';
    }
    if (lowerMessage.includes('confident') || lowerMessage.includes('easy') || lowerMessage.includes('got it')) {
      return 'confident';
    }
    
    return 'motivated';
  }

  // Extract subject from message
  private extractSubject(message: string): string | undefined {
    if (!this.userProfile) return undefined;
    
    const lowerMessage = message.toLowerCase();
    for (const subject of this.userProfile.subjects) {
      if (lowerMessage.includes(subject.toLowerCase())) {
        return subject;
      }
    }
    return undefined;
  }

  // Extract topic from message
  private extractTopic(message: string): string | undefined {
    // Simple topic extraction - could be enhanced with NLP
    const topicKeywords = ['about', 'on', 'regarding', 'topic', 'chapter', 'lesson'];
    for (const keyword of topicKeywords) {
      const index = message.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        return message.substring(index + keyword.length).trim().split(' ')[0];
      }
    }
    return undefined;
  }

  // Generate quick actions based on context
  private generateQuickActions(message: string, mood: string, subject?: string): QuickAction[] {
    const actions: QuickAction[] = [];

    if (mood === 'confused' || mood === 'struggling') {
      actions.push({
        id: 'help_topic',
        label: 'Get Help',
        action: 'help_with_topic',
        icon: '🆘',
        description: 'Get step-by-step help with this topic'
      });
    }

    if (subject) {
      actions.push({
        id: 'create_flashcards',
        label: 'Create Flashcards',
        action: 'create_flashcards',
        icon: '🧠',
        description: `Generate flashcards for ${subject}`
      });
      actions.push({
        id: 'start_quiz',
        label: 'Practice Quiz',
        action: 'start_quiz',
        icon: '📝',
        description: `Take a quiz on ${subject}`
      });
    }

    actions.push({
      id: 'view_progress',
      label: 'View Progress',
      action: 'view_progress',
      icon: '📊',
      description: 'Check your learning progress'
    });

    if (mood === 'frustrated') {
      actions.push({
        id: 'take_break',
        label: 'Take a Break',
        action: 'take_break',
        icon: '☕',
        description: 'Take a short break to refresh'
      });
    }

    return actions.slice(0, 4); // Limit to 4 actions
  }

  // Generate contextual suggestions
  private generateSuggestions(message: string, mood: string, subject?: string): string[] {
    const suggestions: string[] = [];

    if (mood === 'confused') {
      suggestions.push('Would you like me to explain this step by step?');
      suggestions.push('Should we start with the basics of this topic?');
    }

    if (mood === 'struggling') {
      suggestions.push('Let\'s try a different approach to this problem');
      suggestions.push('Would you like to practice with easier examples first?');
    }

    if (subject) {
      suggestions.push(`I can create flashcards for ${subject}`);
      suggestions.push(`Want to take a practice quiz on ${subject}?`);
    }

    if (mood === 'excited') {
      suggestions.push('Great energy! Let\'s tackle some challenging problems');
      suggestions.push('Your enthusiasm is awesome! Want to try some advanced topics?');
    }

    return suggestions.slice(0, 3);
  }

  // Get initial suggestions for new conversation
  private getInitialSuggestions(): string[] {
    if (!this.userProfile) {
      return [
        'Tell me what you\'d like to study today',
        'I can help you create flashcards',
        'Want to take a practice quiz?'
      ];
    }

    const { subjects, goals } = this.userProfile;
    return [
      `Ready to work on ${subjects[0]}?`,
      `Let's make progress on your goal: ${goals[0]}`,
      'I can help you create a study plan',
      'Want to review your recent progress?'
    ];
  }

  // Get quick actions for initial conversation
  private getQuickActions(): QuickAction[] {
    return [
      {
        id: 'study_plan',
        label: 'Study Plan',
        action: 'study_plan',
        icon: '📋',
        description: 'Create a personalized study plan'
      },
      {
        id: 'view_progress',
        label: 'Progress',
        action: 'view_progress',
        icon: '📊',
        description: 'View your learning progress'
      },
      {
        id: 'help_topic',
        label: 'Get Help',
        action: 'help_with_topic',
        icon: '🆘',
        description: 'Get help with any topic'
      }
    ];
  }

  // Get emotion emoji from mood
  private getEmotionFromMood(mood: string): string {
    const emotions: { [key: string]: string } = {
      'confused': '😕',
      'frustrated': '😤',
      'excited': '🤩',
      'struggling': '😰',
      'confident': '😎',
      'motivated': '💪',
      'focused': '🎯',
      'curious': '🤔',
      'satisfied': '😌',
      'overwhelmed': '😵'
    };
    return emotions[mood] || '😊';
  }

  // Fallback response when AI fails
  private getFallbackResponse(message: string, mood: string): AICompanionMessage {
    const fallbackMessages: { [key: string]: string } = {
      'confused': 'I understand you\'re feeling confused. Let me help you break this down into simpler steps. What specific part would you like to focus on?',
      'frustrated': 'I can see you\'re feeling frustrated. That\'s completely normal when learning something new. Let\'s take a step back and try a different approach.',
      'excited': 'I love your enthusiasm! Your positive energy is going to help you learn so much faster. What would you like to tackle first?',
      'struggling': 'It\'s okay to struggle - that\'s how we grow! Let\'s work through this together, one step at a time.',
      'confident': 'Your confidence is showing! That\'s great to see. Ready to take on some challenging problems?',
      'motivated': 'I can feel your motivation! That\'s the key to success. What would you like to work on today?'
    };

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: fallbackMessages[mood] || 'I\'m here to help you succeed! What would you like to work on today?',
      timestamp: new Date(),
      context: { mood },
      metadata: {
        suggestions: ['Tell me more about what you need help with', 'I can create study materials for you'],
        quickActions: this.getQuickActions()
      }
    };
  }

  // Start a new study session
  startStudySession(subject: string, topic: string): StudySession {
    this.currentSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      subject,
      topic,
      tasksCompleted: 0,
      totalTasks: 0,
      mood: 'motivated',
      productivity: 5
    };
    return this.currentSession;
  }

  // End current study session
  endStudySession(): StudySession | null {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      const session = this.currentSession;
      this.currentSession = null;
      return session;
    }
    return null;
  }

  // Get conversation history
  getConversationHistory(): AICompanionMessage[] {
    return [...this.conversationHistory];
  }

  // Clear conversation history
  clearConversation(): void {
    this.conversationHistory = [];
  }

  // Update user profile
  updateUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  // Record a study session
  recordStudySession(session: StudySession): void {
    this.studySessions.push(session);
    this.saveStudySessions();
    
    // Update advanced pattern recognition
    advancedPatternRecognition.recordStudySession(session);
  }

  // Get current study sessions
  getStudySessions(): StudySession[] {
    return this.studySessions;
  }

  // Save study sessions to localStorage
  private saveStudySessions(): void {
    localStorage.setItem('studySessions', JSON.stringify(this.studySessions));
  }

  // Format optimal time for display
  private formatOptimalTime(): string {
    const timeProfile = optimalTimeDetection.getOptimalTimeProfile();
    if (!timeProfile) return 'your peak hours';
    
    const bestHour = timeProfile.peakPerformance.bestHour;
    return this.formatHour(bestHour);
  }

  // Format hour for display
  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  // Helper methods for mood detection context
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

  private getAcademicPressure(): { upcomingDeadlines: number; recentGrades: number[]; workloadLevel: 'light' | 'moderate' | 'heavy' | 'overwhelming' } {
    // This would be calculated from actual academic data
    return {
      upcomingDeadlines: 2,
      recentGrades: [85, 92, 78],
      workloadLevel: 'moderate'
    };
  }

  private getPersonalFactors(): { sleepQuality: number; physicalActivity: number; nutrition: number; stressLevel: number } {
    // This would be populated from user input or health tracking
    return {
      sleepQuality: 7,
      physicalActivity: 6,
      nutrition: 8,
      stressLevel: 5
    };
  }
}

export const aiCompanionService = new AICompanionService();
