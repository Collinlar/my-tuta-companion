import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface LearningStyleProfile {
  visual: LearningStyleScore;
  auditory: LearningStyleScore;
  kinesthetic: LearningStyleScore;
  reading: LearningStyleScore;
  dominant: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  confidence: number; // 0-100
  lastUpdated: Date;
  evidence: LearningStyleEvidence;
}

export interface LearningStyleScore {
  score: number; // 0-100
  confidence: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  evidence: string[];
}

export interface LearningStyleEvidence {
  visual: {
    diagramUsage: number;
    colorPreferences: number;
    spatialReasoning: number;
    imageEngagement: number;
    chartEffectiveness: number;
  };
  auditory: {
    audioEngagement: number;
    discussionParticipation: number;
    musicPreference: number;
    verbalExplanation: number;
    soundEffectiveness: number;
  };
  kinesthetic: {
    handsOnActivities: number;
    movementEngagement: number;
    tactileLearning: number;
    interactiveContent: number;
    physicalDemonstration: number;
  };
  reading: {
    textEngagement: number;
    readingSpeed: number;
    noteTaking: number;
    writtenInstructions: number;
    textRetention: number;
  };
}

export interface LearningBehavior {
  sessionId: string;
  timestamp: Date;
  subject: string;
  topic: string;
  behaviors: {
    // Visual behaviors
    viewedDiagrams: boolean;
    usedColors: boolean;
    createdMaps: boolean;
    watchedVideos: boolean;
    usedCharts: boolean;
    
    // Auditory behaviors
    listenedToAudio: boolean;
    hadDiscussions: boolean;
    usedMusic: boolean;
    verbalExplanation: boolean;
    soundEffects: boolean;
    
    // Kinesthetic behaviors
    handsOnActivity: boolean;
    movedWhileLearning: boolean;
    tactileMaterials: boolean;
    interactiveContent: boolean;
    physicalDemonstration: boolean;
    
    // Reading behaviors
    readText: boolean;
    tookNotes: boolean;
    followedWrittenInstructions: boolean;
    readAloud: boolean;
    summarizedText: boolean;
  };
  effectiveness: number; // 1-10 scale
  engagement: number; // 1-10 scale
  retention: number; // 1-10 scale (measured later)
}

export interface LearningStyleRecommendation {
  id: string;
  style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  type: 'content' | 'method' | 'environment' | 'tools';
  title: string;
  description: string;
  reasoning: string;
  implementation: {
    steps: string[];
    resources: string[];
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  expectedBenefits: string[];
  priority: 'low' | 'medium' | 'high';
}

export class LearningStyleDetection {
  private userProfile: UserProfile | null = null;
  private learningStyleProfile: LearningStyleProfile | null = null;
  private learningBehaviors: LearningBehavior[] = [];
  private studySessions: StudySession[] = [];

  constructor() {
    this.loadUserData();
    this.initializeLearningStyleProfile();
  }

  private loadUserData(): void {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }

      const behaviors = localStorage.getItem('learningBehaviors');
      if (behaviors) {
        this.learningBehaviors = JSON.parse(behaviors).map((b: any) => ({
          ...b,
          timestamp: new Date(b.timestamp)
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

      const styleProfile = localStorage.getItem('learningStyleProfile');
      if (styleProfile) {
        this.learningStyleProfile = {
          ...JSON.parse(styleProfile),
          lastUpdated: new Date(JSON.parse(styleProfile).lastUpdated)
        };
      }
    } catch (error) {
      console.error('Error loading learning style data:', error);
    }
  }

  private initializeLearningStyleProfile(): void {
    this.learningStyleProfile = {
      visual: {
        score: 25,
        confidence: 20,
        trend: 'stable',
        evidence: []
      },
      auditory: {
        score: 25,
        confidence: 20,
        trend: 'stable',
        evidence: []
      },
      kinesthetic: {
        score: 25,
        confidence: 20,
        trend: 'stable',
        evidence: []
      },
      reading: {
        score: 25,
        confidence: 20,
        trend: 'stable',
        evidence: []
      },
      dominant: 'mixed',
      confidence: 20,
      lastUpdated: new Date(),
      evidence: {
        visual: {
          diagramUsage: 0,
          colorPreferences: 0,
          spatialReasoning: 0,
          imageEngagement: 0,
          chartEffectiveness: 0
        },
        auditory: {
          audioEngagement: 0,
          discussionParticipation: 0,
          musicPreference: 0,
          verbalExplanation: 0,
          soundEffectiveness: 0
        },
        kinesthetic: {
          handsOnActivities: 0,
          movementEngagement: 0,
          tactileLearning: 0,
          interactiveContent: 0,
          physicalDemonstration: 0
        },
        reading: {
          textEngagement: 0,
          readingSpeed: 0,
          noteTaking: 0,
          writtenInstructions: 0,
          textRetention: 0
        }
      }
    };
  }

  // Record learning behavior during a study session
  recordLearningBehavior(behavior: LearningBehavior): void {
    this.learningBehaviors.push(behavior);
    this.saveLearningBehaviors();
    this.updateLearningStyleProfile();
  }

  // Update learning style profile based on behaviors
  private updateLearningStyleProfile(): void {
    if (!this.learningStyleProfile || this.learningBehaviors.length === 0) return;

    const recentBehaviors = this.learningBehaviors.slice(-20); // Last 20 behaviors
    
    // Analyze visual behaviors
    const visualAnalysis = this.analyzeVisualBehaviors(recentBehaviors);
    this.learningStyleProfile.visual = visualAnalysis;
    
    // Analyze auditory behaviors
    const auditoryAnalysis = this.analyzeAuditoryBehaviors(recentBehaviors);
    this.learningStyleProfile.auditory = auditoryAnalysis;
    
    // Analyze kinesthetic behaviors
    const kinestheticAnalysis = this.analyzeKinestheticBehaviors(recentBehaviors);
    this.learningStyleProfile.kinesthetic = kinestheticAnalysis;
    
    // Analyze reading behaviors
    const readingAnalysis = this.analyzeReadingBehaviors(recentBehaviors);
    this.learningStyleProfile.reading = readingAnalysis;
    
    // Determine dominant style
    this.determineDominantStyle();
    
    // Calculate overall confidence
    this.calculateOverallConfidence();
    
    this.learningStyleProfile.lastUpdated = new Date();
    this.saveLearningStyleProfile();
  }

  private analyzeVisualBehaviors(behaviors: LearningBehavior[]): LearningStyleScore {
    const visualBehaviors = behaviors.map(b => ({
      viewedDiagrams: b.behaviors.viewedDiagrams,
      usedColors: b.behaviors.usedColors,
      createdMaps: b.behaviors.createdMaps,
      watchedVideos: b.behaviors.watchedVideos,
      usedCharts: b.behaviors.usedCharts,
      effectiveness: b.effectiveness,
      engagement: b.engagement
    }));

    const totalBehaviors = visualBehaviors.length;
    if (totalBehaviors === 0) return { score: 25, confidence: 0, trend: 'stable', evidence: [] };

    // Calculate visual behavior frequency
    const diagramUsage = visualBehaviors.filter(b => b.viewedDiagrams).length / totalBehaviors;
    const colorUsage = visualBehaviors.filter(b => b.usedColors).length / totalBehaviors;
    const mapCreation = visualBehaviors.filter(b => b.createdMaps).length / totalBehaviors;
    const videoWatching = visualBehaviors.filter(b => b.watchedVideos).length / totalBehaviors;
    const chartUsage = visualBehaviors.filter(b => b.usedCharts).length / totalBehaviors;

    // Calculate effectiveness when visual behaviors are used
    const visualEffectiveness = visualBehaviors
      .filter(b => b.viewedDiagrams || b.usedColors || b.createdMaps || b.watchedVideos || b.usedCharts)
      .reduce((sum, b) => sum + b.effectiveness, 0) / 
      Math.max(1, visualBehaviors.filter(b => b.viewedDiagrams || b.usedColors || b.createdMaps || b.watchedVideos || b.usedCharts).length);

    // Calculate engagement when visual behaviors are used
    const visualEngagement = visualBehaviors
      .filter(b => b.viewedDiagrams || b.usedColors || b.createdMaps || b.watchedVideos || b.usedCharts)
      .reduce((sum, b) => sum + b.engagement, 0) / 
      Math.max(1, visualBehaviors.filter(b => b.viewedDiagrams || b.usedColors || b.createdMaps || b.watchedVideos || b.usedCharts).length);

    const visualScore = Math.round(
      (diagramUsage * 20) + 
      (colorUsage * 20) + 
      (mapCreation * 20) + 
      (videoWatching * 20) + 
      (chartUsage * 20)
    );

    const confidence = Math.min(100, totalBehaviors * 5);
    const trend = this.calculateTrend(visualScore, this.learningStyleProfile?.visual.score || 25);

    const evidence = [];
    if (diagramUsage > 0.3) evidence.push('Frequently uses diagrams and visual aids');
    if (colorUsage > 0.2) evidence.push('Prefers colorful and visually organized content');
    if (mapCreation > 0.1) evidence.push('Creates mind maps and visual representations');
    if (videoWatching > 0.4) evidence.push('Engages well with video content');
    if (chartUsage > 0.2) evidence.push('Uses charts and graphs effectively');
    if (visualEffectiveness > 7) evidence.push('High effectiveness with visual learning methods');

    return {
      score: Math.min(100, visualScore),
      confidence,
      trend,
      evidence
    };
  }

  private analyzeAuditoryBehaviors(behaviors: LearningBehavior[]): LearningStyleScore {
    const auditoryBehaviors = behaviors.map(b => ({
      listenedToAudio: b.behaviors.listenedToAudio,
      hadDiscussions: b.behaviors.hadDiscussions,
      usedMusic: b.behaviors.usedMusic,
      verbalExplanation: b.behaviors.verbalExplanation,
      soundEffects: b.behaviors.soundEffects,
      effectiveness: b.effectiveness,
      engagement: b.engagement
    }));

    const totalBehaviors = auditoryBehaviors.length;
    if (totalBehaviors === 0) return { score: 25, confidence: 0, trend: 'stable', evidence: [] };

    // Calculate auditory behavior frequency
    const audioUsage = auditoryBehaviors.filter(b => b.listenedToAudio).length / totalBehaviors;
    const discussionParticipation = auditoryBehaviors.filter(b => b.hadDiscussions).length / totalBehaviors;
    const musicUsage = auditoryBehaviors.filter(b => b.usedMusic).length / totalBehaviors;
    const verbalExplanation = auditoryBehaviors.filter(b => b.verbalExplanation).length / totalBehaviors;
    const soundEffectUsage = auditoryBehaviors.filter(b => b.soundEffects).length / totalBehaviors;

    // Calculate effectiveness when auditory behaviors are used
    const auditoryEffectiveness = auditoryBehaviors
      .filter(b => b.listenedToAudio || b.hadDiscussions || b.usedMusic || b.verbalExplanation || b.soundEffects)
      .reduce((sum, b) => sum + b.effectiveness, 0) / 
      Math.max(1, auditoryBehaviors.filter(b => b.listenedToAudio || b.hadDiscussions || b.usedMusic || b.verbalExplanation || b.soundEffects).length);

    const auditoryScore = Math.round(
      (audioUsage * 20) + 
      (discussionParticipation * 20) + 
      (musicUsage * 20) + 
      (verbalExplanation * 20) + 
      (soundEffectUsage * 20)
    );

    const confidence = Math.min(100, totalBehaviors * 5);
    const trend = this.calculateTrend(auditoryScore, this.learningStyleProfile?.auditory.score || 25);

    const evidence = [];
    if (audioUsage > 0.3) evidence.push('Frequently listens to audio content');
    if (discussionParticipation > 0.2) evidence.push('Engages well in discussions and group learning');
    if (musicUsage > 0.1) evidence.push('Uses music to enhance learning');
    if (verbalExplanation > 0.3) evidence.push('Prefers verbal explanations and instructions');
    if (soundEffectUsage > 0.1) evidence.push('Benefits from sound effects and audio cues');
    if (auditoryEffectiveness > 7) evidence.push('High effectiveness with auditory learning methods');

    return {
      score: Math.min(100, auditoryScore),
      confidence,
      trend,
      evidence
    };
  }

  private analyzeKinestheticBehaviors(behaviors: LearningBehavior[]): LearningStyleScore {
    const kinestheticBehaviors = behaviors.map(b => ({
      handsOnActivity: b.behaviors.handsOnActivity,
      movedWhileLearning: b.behaviors.movedWhileLearning,
      tactileMaterials: b.behaviors.tactileMaterials,
      interactiveContent: b.behaviors.interactiveContent,
      physicalDemonstration: b.behaviors.physicalDemonstration,
      effectiveness: b.effectiveness,
      engagement: b.engagement
    }));

    const totalBehaviors = kinestheticBehaviors.length;
    if (totalBehaviors === 0) return { score: 25, confidence: 0, trend: 'stable', evidence: [] };

    // Calculate kinesthetic behavior frequency
    const handsOnUsage = kinestheticBehaviors.filter(b => b.handsOnActivity).length / totalBehaviors;
    const movementUsage = kinestheticBehaviors.filter(b => b.movedWhileLearning).length / totalBehaviors;
    const tactileUsage = kinestheticBehaviors.filter(b => b.tactileMaterials).length / totalBehaviors;
    const interactiveUsage = kinestheticBehaviors.filter(b => b.interactiveContent).length / totalBehaviors;
    const physicalUsage = kinestheticBehaviors.filter(b => b.physicalDemonstration).length / totalBehaviors;

    // Calculate effectiveness when kinesthetic behaviors are used
    const kinestheticEffectiveness = kinestheticBehaviors
      .filter(b => b.handsOnActivity || b.movedWhileLearning || b.tactileMaterials || b.interactiveContent || b.physicalDemonstration)
      .reduce((sum, b) => sum + b.effectiveness, 0) / 
      Math.max(1, kinestheticBehaviors.filter(b => b.handsOnActivity || b.movedWhileLearning || b.tactileMaterials || b.interactiveContent || b.physicalDemonstration).length);

    const kinestheticScore = Math.round(
      (handsOnUsage * 20) + 
      (movementUsage * 20) + 
      (tactileUsage * 20) + 
      (interactiveUsage * 20) + 
      (physicalUsage * 20)
    );

    const confidence = Math.min(100, totalBehaviors * 5);
    const trend = this.calculateTrend(kinestheticScore, this.learningStyleProfile?.kinesthetic.score || 25);

    const evidence = [];
    if (handsOnUsage > 0.3) evidence.push('Prefers hands-on activities and experiments');
    if (movementUsage > 0.2) evidence.push('Learns better with movement and physical activity');
    if (tactileUsage > 0.1) evidence.push('Benefits from tactile materials and touch-based learning');
    if (interactiveUsage > 0.3) evidence.push('Engages well with interactive content and simulations');
    if (physicalUsage > 0.1) evidence.push('Learns through physical demonstration and modeling');
    if (kinestheticEffectiveness > 7) evidence.push('High effectiveness with kinesthetic learning methods');

    return {
      score: Math.min(100, kinestheticScore),
      confidence,
      trend,
      evidence
    };
  }

  private analyzeReadingBehaviors(behaviors: LearningBehavior[]): LearningStyleScore {
    const readingBehaviors = behaviors.map(b => ({
      readText: b.behaviors.readText,
      tookNotes: b.behaviors.tookNotes,
      followedWrittenInstructions: b.behaviors.followedWrittenInstructions,
      readAloud: b.behaviors.readAloud,
      summarizedText: b.behaviors.summarizedText,
      effectiveness: b.effectiveness,
      engagement: b.engagement
    }));

    const totalBehaviors = readingBehaviors.length;
    if (totalBehaviors === 0) return { score: 25, confidence: 0, trend: 'stable', evidence: [] };

    // Calculate reading behavior frequency
    const textReading = readingBehaviors.filter(b => b.readText).length / totalBehaviors;
    const noteTaking = readingBehaviors.filter(b => b.tookNotes).length / totalBehaviors;
    const writtenInstructions = readingBehaviors.filter(b => b.followedWrittenInstructions).length / totalBehaviors;
    const readAloud = readingBehaviors.filter(b => b.readAloud).length / totalBehaviors;
    const textSummarization = readingBehaviors.filter(b => b.summarizedText).length / totalBehaviors;

    // Calculate effectiveness when reading behaviors are used
    const readingEffectiveness = readingBehaviors
      .filter(b => b.readText || b.tookNotes || b.followedWrittenInstructions || b.readAloud || b.summarizedText)
      .reduce((sum, b) => sum + b.effectiveness, 0) / 
      Math.max(1, readingBehaviors.filter(b => b.readText || b.tookNotes || b.followedWrittenInstructions || b.readAloud || b.summarizedText).length);

    const readingScore = Math.round(
      (textReading * 20) + 
      (noteTaking * 20) + 
      (writtenInstructions * 20) + 
      (readAloud * 20) + 
      (textSummarization * 20)
    );

    const confidence = Math.min(100, totalBehaviors * 5);
    const trend = this.calculateTrend(readingScore, this.learningStyleProfile?.reading.score || 25);

    const evidence = [];
    if (textReading > 0.5) evidence.push('Prefers reading text-based content');
    if (noteTaking > 0.3) evidence.push('Takes detailed notes while studying');
    if (writtenInstructions > 0.4) evidence.push('Follows written instructions well');
    if (readAloud > 0.2) evidence.push('Reads aloud to enhance comprehension');
    if (textSummarization > 0.2) evidence.push('Summarizes and synthesizes written content');
    if (readingEffectiveness > 7) evidence.push('High effectiveness with reading-based learning methods');

    return {
      score: Math.min(100, readingScore),
      confidence,
      trend,
      evidence
    };
  }

  private determineDominantStyle(): void {
    if (!this.learningStyleProfile) return;

    const scores = [
      { style: 'visual' as const, score: this.learningStyleProfile.visual.score },
      { style: 'auditory' as const, score: this.learningStyleProfile.auditory.score },
      { style: 'kinesthetic' as const, score: this.learningStyleProfile.kinesthetic.score },
      { style: 'reading' as const, score: this.learningStyleProfile.reading.score }
    ];

    scores.sort((a, b) => b.score - a.score);

    const highest = scores[0];
    const second = scores[1];

    // Check if there's a clear dominant style (difference > 15 points)
    if (highest.score - second.score > 15) {
      this.learningStyleProfile.dominant = highest.style;
    } else {
      this.learningStyleProfile.dominant = 'mixed';
    }
  }

  private calculateOverallConfidence(): void {
    if (!this.learningStyleProfile) return;

    const confidences = [
      this.learningStyleProfile.visual.confidence,
      this.learningStyleProfile.auditory.confidence,
      this.learningStyleProfile.kinesthetic.confidence,
      this.learningStyleProfile.reading.confidence
    ];

    this.learningStyleProfile.confidence = Math.round(
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
    );
  }

  private calculateTrend(currentScore: number, previousScore: number): 'increasing' | 'stable' | 'decreasing' {
    const difference = currentScore - previousScore;
    if (difference > 5) return 'increasing';
    if (difference < -5) return 'decreasing';
    return 'stable';
  }

  // Generate learning style recommendations
  generateLearningStyleRecommendations(): LearningStyleRecommendation[] {
    if (!this.learningStyleProfile) return [];

    const recommendations: LearningStyleRecommendation[] = [];

    // Visual recommendations
    if (this.learningStyleProfile.visual.score > 60) {
      recommendations.push({
        id: 'visual-content',
        style: 'visual',
        type: 'content',
        title: 'Enhance Visual Learning',
        description: 'Use more diagrams, charts, and visual aids in your study materials.',
        reasoning: `Your visual learning score is ${this.learningStyleProfile.visual.score}%, indicating strong visual learning preferences.`,
        implementation: {
          steps: [
            'Create mind maps for complex topics',
            'Use color coding for different concepts',
            'Watch educational videos and animations',
            'Draw diagrams to explain concepts',
            'Use flashcards with visual elements'
          ],
          resources: ['Mind mapping tools', 'Educational videos', 'Visual flashcards', 'Diagramming software'],
          estimatedTime: '10-15 minutes per session',
          difficulty: 'easy'
        },
        expectedBenefits: ['Better concept retention', 'Improved understanding of relationships', 'Enhanced memory recall'],
        priority: 'high'
      });
    }

    // Auditory recommendations
    if (this.learningStyleProfile.auditory.score > 60) {
      recommendations.push({
        id: 'auditory-methods',
        style: 'auditory',
        type: 'method',
        title: 'Leverage Auditory Learning',
        description: 'Incorporate more audio-based learning methods into your study routine.',
        reasoning: `Your auditory learning score is ${this.learningStyleProfile.auditory.score}%, showing strong preference for audio content.`,
        implementation: {
          steps: [
            'Listen to educational podcasts and audiobooks',
            'Read notes aloud while studying',
            'Participate in study groups and discussions',
            'Use text-to-speech for reading materials',
            'Create audio summaries of topics'
          ],
          resources: ['Educational podcasts', 'Audiobooks', 'Text-to-speech tools', 'Study groups'],
          estimatedTime: '20-30 minutes per session',
          difficulty: 'easy'
        },
        expectedBenefits: ['Better comprehension through hearing', 'Improved retention of spoken information', 'Enhanced discussion skills'],
        priority: 'high'
      });
    }

    // Kinesthetic recommendations
    if (this.learningStyleProfile.kinesthetic.score > 60) {
      recommendations.push({
        id: 'kinesthetic-activities',
        style: 'kinesthetic',
        type: 'method',
        title: 'Engage in Hands-on Learning',
        description: 'Include more physical and interactive activities in your learning process.',
        reasoning: `Your kinesthetic learning score is ${this.learningStyleProfile.kinesthetic.score}%, indicating preference for hands-on learning.`,
        implementation: {
          steps: [
            'Take breaks to move around while studying',
            'Use manipulatives and physical objects',
            'Create models and demonstrations',
            'Engage in interactive simulations',
            'Practice with hands-on experiments'
          ],
          resources: ['Physical manipulatives', 'Interactive simulations', 'Laboratory equipment', 'Movement breaks'],
          estimatedTime: '15-25 minutes per session',
          difficulty: 'medium'
        },
        expectedBenefits: ['Better understanding through doing', 'Improved focus through movement', 'Enhanced problem-solving skills'],
        priority: 'high'
      });
    }

    // Reading recommendations
    if (this.learningStyleProfile.reading.score > 60) {
      recommendations.push({
        id: 'reading-enhancement',
        style: 'reading',
        type: 'content',
        title: 'Optimize Reading-based Learning',
        description: 'Focus on text-based materials and written learning methods.',
        reasoning: `Your reading learning score is ${this.learningStyleProfile.reading.score}%, showing strong preference for written content.`,
        implementation: {
          steps: [
            'Take detailed written notes',
            'Create written summaries and outlines',
            'Use written instructions and guides',
            'Practice reading comprehension exercises',
            'Write explanations of concepts'
          ],
          resources: ['Note-taking apps', 'Written study guides', 'Reading comprehension tools', 'Writing materials'],
          estimatedTime: '25-35 minutes per session',
          difficulty: 'easy'
        },
        expectedBenefits: ['Better written comprehension', 'Improved note-taking skills', 'Enhanced written expression'],
        priority: 'high'
      });
    }

    return recommendations;
  }

  // Public methods
  getLearningStyleProfile(): LearningStyleProfile | null {
    return this.learningStyleProfile;
  }

  getLearningBehaviors(): LearningBehavior[] {
    return this.learningBehaviors;
  }

  getRecommendations(): LearningStyleRecommendation[] {
    return this.generateLearningStyleRecommendations();
  }

  // Save data to localStorage
  private saveLearningStyleProfile(): void {
    localStorage.setItem('learningStyleProfile', JSON.stringify(this.learningStyleProfile));
  }

  private saveLearningBehaviors(): void {
    localStorage.setItem('learningBehaviors', JSON.stringify(this.learningBehaviors));
  }
}

export const learningStyleDetection = new LearningStyleDetection();
