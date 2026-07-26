import { groqApiService } from './groqApiService';

export interface RevisionObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
  extractedFrom: string;
}

export interface RevisionStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'reading' | 'visual' | 'concept' | 'application' | 'recap';
  activities: RevisionActivity[];
  completed: boolean;
  xpReward: number;
  badge?: string;
}

export interface RevisionActivity {
  id: string;
  title: string;
  description: string;
  type: 'highlight' | 'match' | 'recall' | 'scenario' | 'summary';
  instructions: string;
  completed: boolean;
  result?: string;
}

export interface StudyAid {
  id: string;
  type: 'flashcards' | 'quiz' | 'contest' | 'learning-path';
  title: string;
  description: string;
  count?: number;
  duration?: number;
  unlocked: boolean;
}

export interface ReflectionQuestion {
  id: string;
  question: string;
  answer?: string;
  category: 'recall' | 'significance' | 'review';
}

export interface PerformanceFeedback {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string[];
  readiness: 'ready' | 'needs-review' | 'excellent';
}

export interface LessonPlanRevisionPlan {
  id: string;
  title: string;
  topic: string;
  subject: string;
  gradeLevel: string;
  goal: string;
  overview: {
    duration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    mode: string;
  };
  objectives: RevisionObjective[];
  noteBreakdown: NoteSection[];
  revisionSteps: RevisionStep[];
  gamifiedProgress: {
    totalXP: number;
    badgesEarned: string[];
    currentStep: number;
  };
  studyAids: StudyAid[];
  reflection: ReflectionQuestion[];
  completionSummary?: {
    totalDuration: number;
    xpEarned: number;
    badgesEarned: string[];
    performance: PerformanceFeedback;
  };
  aiTips: string[];
  createdAt: Date;
}

export class LessonPlanRevisionService {
  async generateLessonPlanRevision(notes: string, topic: string, subject: string = 'General', gradeLevel: string = 'Grade 8'): Promise<LessonPlanRevisionPlan> {
    console.log('📚 Generating lesson plan revision for:', topic);
    console.log('📝 Subject:', subject);
    console.log('📄 Notes:', notes.substring(0, 200) + '...');

    try {
      // Generate the lesson plan structure using AI
      const planData = await this.generateLessonPlanStructure(notes, topic, subject, gradeLevel);
      
      // Create the lesson plan revision
      const plan: LessonPlanRevisionPlan = {
        id: `lesson-plan-revision-${Date.now()}`,
        title: `mytuta AI Revision Plan - ${topic}`,
        topic,
        subject,
        gradeLevel,
        goal: `To deeply revise and master the concept of ${topic.toLowerCase()} through reading, recall, and practice.`,
        overview: {
          duration: planData.duration || 40,
          difficulty: planData.difficulty || 'medium',
          mode: 'Solo Revision / Self-paced'
        },
        objectives: planData.objectives || [],
        noteBreakdown: planData.noteBreakdown || [],
        revisionSteps: planData.revisionSteps || [],
        gamifiedProgress: {
          totalXP: 0,
          badgesEarned: [],
          currentStep: 0
        },
        studyAids: planData.studyAids || [],
        reflection: planData.reflection || [],
        aiTips: planData.aiTips || [],
        createdAt: new Date()
      };

      console.log('✅ Generated lesson plan revision:', plan);
      return plan;

    } catch (error) {
      console.error('Error generating lesson plan revision:', error);
      return this.createFallbackLessonPlan(topic, subject, gradeLevel, notes);
    }
  }

  private async generateLessonPlanStructure(notes: string, topic: string, subject: string, gradeLevel: string): Promise<{
    duration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    objectives: RevisionObjective[];
    noteBreakdown: NoteSection[];
    revisionSteps: RevisionStep[];
    studyAids: StudyAid[];
    reflection: ReflectionQuestion[];
    aiTips: string[];
  }> {
    console.log('🔍 Generating lesson plan structure with AI...');

    const prompt = `Create a comprehensive lesson plan-style revision plan for the topic "${topic}" in ${subject} for ${gradeLevel}.

Based on these notes: ${notes}

Create a structured revision plan following this exact format:

1. OBJECTIVES (3-4 learning objectives)
2. NOTE BREAKDOWN (extract 4-6 main sections from the notes)
3. REVISION STEPS (5 guided steps: Read, Visual Recall, Concept Connection, Application Challenge, Recap)
4. STUDY AIDS (flashcards, quiz, contest, learning path)
5. REFLECTION QUESTIONS (3 questions about recall, significance, review)

Format as structured JSON:
{
  "duration": 40,
  "difficulty": "medium",
  "objectives": [
    {
      "id": "obj1",
      "description": "Identify and locate major landmarks in Africa",
      "completed": false
    }
  ],
  "noteBreakdown": [
    {
      "id": "section1",
      "title": "Meaning of a Landmark",
      "content": "Brief summary of this section",
      "importance": "high",
      "extractedFrom": "Original notes section"
    }
  ],
  "revisionSteps": [
    {
      "id": "step1",
      "title": "Read and Highlight",
      "description": "Review the AI-condensed summary of your notes",
      "duration": 10,
      "type": "reading",
      "activities": [
        {
          "id": "act1",
          "title": "Review AI Summary",
          "description": "Read through the condensed notes",
          "type": "highlight",
          "instructions": "Highlight key definitions and examples",
          "completed": false
        }
      ],
      "completed": false,
      "xpReward": 100,
      "badge": "Focused Learner"
    }
  ],
  "studyAids": [
    {
      "id": "aid1",
      "type": "flashcards",
      "title": "Key Facts Flashcards",
      "description": "12 key facts about the topic",
      "count": 12,
      "unlocked": true
    }
  ],
  "reflection": [
    {
      "id": "ref1",
      "question": "Which concepts were easiest to recall?",
      "category": "recall"
    }
  ],
  "aiTips": [
    "Focus more on the 'importance' section — it forms the basis for most exam questions."
  ]
}`;

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert educational consultant specializing in lesson plan design and structured revision strategies. Create detailed, pedagogical revision plans that follow teaching best practices.'
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
      return {
        duration: planData.duration || 40,
        difficulty: planData.difficulty || 'medium',
        objectives: this.validateObjectives(planData.objectives || []),
        noteBreakdown: this.validateNoteBreakdown(planData.noteBreakdown || []),
        revisionSteps: this.validateRevisionSteps(planData.revisionSteps || []),
        studyAids: this.validateStudyAids(planData.studyAids || []),
        reflection: this.validateReflection(planData.reflection || []),
        aiTips: Array.isArray(planData.aiTips) ? planData.aiTips : [planData.aiTips || 'Focus on understanding key concepts']
      };

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('🔄 Falling back to structured template...');
      return this.createLessonPlanTemplate(topic, subject, gradeLevel, notes);
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

  private validateObjectives(objectives: any[]): RevisionObjective[] {
    return objectives.map((obj, index) => ({
      id: obj.id || `obj${index + 1}`,
      description: obj.description || `Learning objective ${index + 1}`,
      completed: false
    }));
  }

  private validateNoteBreakdown(sections: any[]): NoteSection[] {
    return sections.map((section, index) => ({
      id: section.id || `section${index + 1}`,
      title: section.title || `Section ${index + 1}`,
      content: section.content || 'Content summary',
      importance: section.importance || 'medium',
      extractedFrom: section.extractedFrom || 'Original notes'
    }));
  }

  private validateRevisionSteps(steps: any[]): RevisionStep[] {
    return steps.map((step, index) => ({
      id: step.id || `step${index + 1}`,
      title: step.title || `Step ${index + 1}`,
      description: step.description || 'Revision step description',
      duration: step.duration || 10,
      type: step.type || 'reading',
      activities: this.validateActivities(step.activities || []),
      completed: false,
      xpReward: step.xpReward || 100,
      badge: step.badge
    }));
  }

  private validateActivities(activities: any[]): RevisionActivity[] {
    return activities.map((activity, index) => ({
      id: activity.id || `act${index + 1}`,
      title: activity.title || `Activity ${index + 1}`,
      description: activity.description || 'Activity description',
      type: activity.type || 'highlight',
      instructions: activity.instructions || 'Follow the instructions',
      completed: false
    }));
  }

  private validateStudyAids(aids: any[]): StudyAid[] {
    return aids.map((aid, index) => ({
      id: aid.id || `aid${index + 1}`,
      type: aid.type || 'flashcards',
      title: aid.title || `Study Aid ${index + 1}`,
      description: aid.description || 'Study aid description',
      count: aid.count,
      duration: aid.duration,
      unlocked: aid.unlocked !== false
    }));
  }

  private validateReflection(reflections: any[]): ReflectionQuestion[] {
    return reflections.map((reflection, index) => ({
      id: reflection.id || `ref${index + 1}`,
      question: reflection.question || `Reflection question ${index + 1}`,
      category: reflection.category || 'recall'
    }));
  }

  private createLessonPlanTemplate(topic: string, subject: string, gradeLevel: string, notes: string): {
    duration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    objectives: RevisionObjective[];
    noteBreakdown: NoteSection[];
    revisionSteps: RevisionStep[];
    studyAids: StudyAid[];
    reflection: ReflectionQuestion[];
    aiTips: string[];
  } {
    console.log('📋 Creating lesson plan template for:', topic);

    return {
      duration: 40,
      difficulty: 'medium',
      objectives: [
        {
          id: 'obj1',
          description: `Understand the key concepts of ${topic}`,
          completed: false
        },
        {
          id: 'obj2',
          description: `Apply knowledge of ${topic} in practical scenarios`,
          completed: false
        },
        {
          id: 'obj3',
          description: `Analyze the significance and importance of ${topic}`,
          completed: false
        }
      ],
      noteBreakdown: [
        {
          id: 'section1',
          title: `Introduction to ${topic}`,
          content: `Basic concepts and definitions related to ${topic}`,
          importance: 'high',
          extractedFrom: 'Opening sections of notes'
        },
        {
          id: 'section2',
          title: `Key Components`,
          content: `Main elements and parts of ${topic}`,
          importance: 'high',
          extractedFrom: 'Main content sections'
        },
        {
          id: 'section3',
          title: `Examples and Applications`,
          content: `Real-world examples and practical applications`,
          importance: 'medium',
          extractedFrom: 'Examples sections'
        },
        {
          id: 'section4',
          title: `Importance and Significance`,
          content: `Why this topic matters and its relevance`,
          importance: 'high',
          extractedFrom: 'Conclusion and importance sections'
        }
      ],
      revisionSteps: [
        {
          id: 'step1',
          title: 'Study and Take Notes',
          description: 'Review the key concepts and take your own notes',
          duration: 10,
          type: 'reading',
          activities: [
            {
              id: 'act1',
              title: 'Study Key Concepts',
              description: 'Read through the important topics',
              type: 'highlight',
              instructions: 'Take notes on the most important points and examples',
              completed: false
            }
          ],
          completed: false,
          xpReward: 100,
          badge: 'Knowledge Seeker'
        },
        {
          id: 'step2',
          title: 'Visual Learning',
          description: 'Use images and diagrams to remember better',
          duration: 5,
          type: 'visual',
          activities: [
            {
              id: 'act2',
              title: 'Picture Perfect Memory',
              description: 'Connect ideas with visual representations',
              type: 'match',
              instructions: 'Look at the images and connect them to what you learned',
              completed: false
            }
          ],
          completed: false,
          xpReward: 150,
          badge: 'Visual Learner'
        },
        {
          id: 'step3',
          title: 'Test Your Understanding',
          description: 'Answer questions to see how well you understand',
          duration: 10,
          type: 'concept',
          activities: [
            {
              id: 'act3',
              title: 'Quick Check Questions',
              description: 'Answer some questions about what you learned',
              type: 'recall',
              instructions: 'Write your answers to show what you understand',
              completed: false
            }
          ],
          completed: false,
          xpReward: 200,
          badge: 'Study Champion'
        },
        {
          id: 'step4',
          title: 'Real-World Practice',
          description: 'Apply what you learned to real situations',
          duration: 10,
          type: 'application',
          activities: [
            {
              id: 'act4',
              title: 'Practice Scenarios',
              description: 'Use your knowledge in real situations',
              type: 'scenario',
              instructions: 'Think about how you would use this knowledge and write 3 key points',
              completed: false
            }
          ],
          completed: false,
          xpReward: 250,
          badge: 'Smart Thinker'
        },
        {
          id: 'step5',
          title: 'Celebrate Your Learning',
          description: 'Review what you accomplished and feel proud!',
          duration: 5,
          type: 'recap',
          activities: [
            {
              id: 'act5',
              title: 'Create Your Success Summary',
              description: 'Summarize what you learned and achieved',
              type: 'summary',
              instructions: 'Write down the most important things you learned today',
              completed: false
            }
          ],
          completed: false,
          xpReward: 300,
          badge: `${topic} Expert`
        }
      ],
      studyAids: [
        {
          id: 'aid1',
          type: 'flashcards',
          title: 'Study Cards',
          description: `Fun flashcards to help you remember key facts about ${topic}`,
          count: 12,
          unlocked: true
        },
        {
          id: 'aid2',
          type: 'quiz',
          title: 'Quick Check Quiz',
          description: 'Test yourself with these fun questions',
          count: 10,
          duration: 5,
          unlocked: true
        },
        {
          id: 'aid3',
          type: 'contest',
          title: `${topic} Speed Challenge`,
          description: 'Race against time and test your knowledge!',
          duration: 5,
          unlocked: false
        },
        {
          id: 'aid4',
          type: 'learning-path',
          title: `Keep Learning: ${topic}`,
          description: `Explore more about this topic when you're ready`,
          unlocked: false
        }
      ],
      reflection: [
        {
          id: 'ref1',
          question: `What did you find most interesting about ${topic}?`,
          category: 'recall'
        },
        {
          id: 'ref2',
          question: `How will you use what you learned about ${topic} in real life?`,
          category: 'significance'
        },
        {
          id: 'ref3',
          question: `What would you like to explore more about this topic?`,
          category: 'review'
        }
      ],
      aiTips: [
        `Focus on the most important parts first — these are usually the key concepts that help you understand everything else about ${topic}.`,
        'Use the visual learning step to help you remember better - pictures and diagrams make learning more fun!',
        'The real-world practice helps you see why this topic matters and how to use it.'
      ]
    };
  }

  private createFallbackLessonPlan(topic: string, subject: string, gradeLevel: string, notes: string): LessonPlanRevisionPlan {
    console.log('🔄 Creating fallback lesson plan for:', topic);
    
    const template = this.createLessonPlanTemplate(topic, subject, gradeLevel, notes);
    
    return {
      id: `fallback-lesson-plan-${Date.now()}`,
      title: `mytuta AI Revision Plan - ${topic}`,
      topic,
      subject,
      gradeLevel,
      goal: `To deeply revise and master the concept of ${topic.toLowerCase()} through reading, recall, and practice.`,
      overview: {
        duration: template.duration,
        difficulty: template.difficulty,
        mode: 'Solo Revision / Self-paced'
      },
      objectives: template.objectives,
      noteBreakdown: template.noteBreakdown,
      revisionSteps: template.revisionSteps,
      gamifiedProgress: {
        totalXP: 0,
        badgesEarned: [],
        currentStep: 0
      },
      studyAids: template.studyAids,
      reflection: template.reflection,
      aiTips: template.aiTips,
      createdAt: new Date()
    };
  }

  // Utility methods for plan management
  completeStep(plan: LessonPlanRevisionPlan, stepId: string): LessonPlanRevisionPlan {
    const updatedPlan = { ...plan };
    
    updatedPlan.revisionSteps = updatedPlan.revisionSteps.map(step => {
      if (step.id === stepId) {
        const completedStep = {
          ...step,
          completed: true
        };
        
        // Update gamification stats
        updatedPlan.gamifiedProgress.totalXP += step.xpReward;
        updatedPlan.gamifiedProgress.currentStep += 1;
        
        if (step.badge) {
          updatedPlan.gamifiedProgress.badgesEarned.push(step.badge);
        }
        
        return completedStep;
      }
      return step;
    });
    
    return updatedPlan;
  }

  completeActivity(plan: LessonPlanRevisionPlan, stepId: string, activityId: string): LessonPlanRevisionPlan {
    const updatedPlan = { ...plan };
    
    updatedPlan.revisionSteps = updatedPlan.revisionSteps.map(step => ({
      ...step,
      activities: step.activities.map(activity => {
        if (activity.id === activityId) {
          return { ...activity, completed: true };
        }
        return activity;
      })
    }));
    
    return updatedPlan;
  }

  generateCompletionSummary(plan: LessonPlanRevisionPlan): PerformanceFeedback {
    const completedSteps = plan.revisionSteps.filter(step => step.completed).length;
    const totalSteps = plan.revisionSteps.length;
    const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    let readiness: 'ready' | 'needs-review' | 'excellent';
    let overallScore: number;
    
    if (completionRate >= 90) {
      readiness = 'excellent';
      overallScore = 95;
    } else if (completionRate >= 70) {
      readiness = 'ready';
      overallScore = 80;
    } else {
      readiness = 'needs-review';
      overallScore = 60;
    }
    
    return {
      overallScore,
      strengths: [
        'Strong understanding of key concepts',
        'Good completion rate',
        'Engaged with revision activities'
      ],
      areasForImprovement: completionRate < 100 ? [
        'Complete all revision steps',
        'Review missed concepts'
      ] : [],
      nextSteps: [
        'Attempt practice quizzes',
        'Join timed contests',
        'Explore related learning paths'
      ],
      readiness
    };
  }
}

export const lessonPlanRevisionService = new LessonPlanRevisionService();
