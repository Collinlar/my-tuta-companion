import { groqApiService } from './groqApiService';

export interface SimpleRevisionPlan {
  id: string;
  title: string;
  topic: string;
  subject: string;
  overview: {
    summary: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    totalEstimatedTime: string;
    prerequisites: string[];
  };
  focusAreas: Array<{
    title: string;
    description: string;
    importance: 'critical' | 'important' | 'optional';
    keyConcepts: string[];
    commonMistakes: string[];
    studyTips: string[];
    estimatedTime: string;
  }>;
  studyMethods: Array<{
    name: string;
    description: string;
    effectiveness: string;
    estimatedTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  revisionPhases: Array<{
    name: string;
    description: string;
    duration: string;
    pedagogicalApproach: string;
    objectives: Array<{
      title: string;
      description: string;
      learningOutcomes?: string[];
    }>;
    activities: {
      main: string[];
      alternative?: string[];
      extension?: string[];
    };
    resources: {
      primary: string[];
      secondary?: string[];
      interactive?: string[];
      visual?: string[];
      handsOn?: string[];
    };
    assessmentMethods: string[];
  }>;
  assessmentPlan: {
    formative: string[];
    summative: string[];
    selfAssessment: string[];
  };
  progressTracking: {
    milestones: string[];
    checkpoints: Array<{
      name: string;
      description: string;
      targetDate: string;
    }>;
    successMetrics: Array<{
      name: string;
      description: string;
      target: string;
    }>;
  };
  createdAt: Date;
}

export class SimpleRevisionPlanService {
  
  async generateRevisionPlan(notes: string, topic: string): Promise<SimpleRevisionPlan> {
    console.log('🔍 Generating simple revision plan for:', topic);
    console.log('📝 Notes:', notes);
    
    try {
      // Generate each section separately
      console.log('📋 Generating plan sections...');
      
      const overview = await this.generateSection('overview', topic, notes);
      const focusAreas = await this.generateSection('focusAreas', topic, notes);
      const studyMethods = await this.generateSection('studyMethods', topic, notes);
      const revisionPhases = await this.generateSection('revisionPhases', topic, notes);
      const assessmentPlan = await this.generateSection('assessmentPlan', topic, notes);
      const progressTracking = await this.generateSection('progressTracking', topic, notes);
      
      // Create the structured plan
      const plan: SimpleRevisionPlan = {
        id: `revision-plan-${Date.now()}`,
        title: `${topic} - Comprehensive Revision Plan`,
        topic,
        subject: this.extractSubjectFromNotes(notes),
        overview: this.parseOverview(overview, topic),
        focusAreas: this.parseFocusAreas(focusAreas, topic),
        studyMethods: this.parseStudyMethods(studyMethods, topic),
        revisionPhases: this.parseRevisionPhases(revisionPhases, topic),
        assessmentPlan: this.parseAssessmentPlan(assessmentPlan),
        progressTracking: this.parseProgressTracking(progressTracking),
        createdAt: new Date()
      };
      
      console.log('✅ Generated structured revision plan:', plan);
      return plan;
      
    } catch (error) {
      console.error('Error generating revision plan:', error);
      return this.createFallbackPlan(topic, notes);
    }
  }

  private async generateSection(sectionType: string, topic: string, notes: string): Promise<string> {
    console.log(`🔍 Generating ${sectionType} section...`);
    
    const sectionPrompts = {
      overview: `Provide an OVERVIEW for a revision plan on "${topic}". Include: summary (2-3 sentences), difficulty level (beginner/intermediate/advanced), total estimated time (e.g., "10 hours"), and prerequisites (list 2-3 items).`,
      
      focusAreas: `List 3-4 FOCUS AREAS for studying "${topic}". For each area, provide: title, description (1-2 sentences), importance (critical/important/optional), key concepts (list 3-4), common mistakes (list 2-3), study tips (list 2-3), and estimated time.`,
      
      studyMethods: `Suggest 3-4 STUDY METHODS for "${topic}". For each method, provide: name, description (1-2 sentences), why it's effective (1 sentence), estimated time per session, and difficulty level (beginner/intermediate/advanced).`,
      
      revisionPhases: `Create 4-5 REVISION PHASES for "${topic}". For each phase, provide: name, description (1-2 sentences), duration (e.g., "30 minutes"), pedagogical approach (e.g., "guided practice"), objectives (2-3 with titles and descriptions), activities (main activities list), and resources (primary resources list).`,
      
      assessmentPlan: `Define ASSESSMENT PLAN for "${topic}". Include: formative assessments (list 3-4), summative assessments (list 2-3), and self-assessment methods (list 2-3).`,
      
      progressTracking: `Set PROGRESS TRACKING for "${topic}". Include: milestones (list 3-4), checkpoints (list 2-3 with names, descriptions, and target dates), and success metrics (list 2-3 with names, descriptions, and targets).`
    };

    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert educational consultant. Provide clear, structured information for the requested section. Use concise but comprehensive language.`
      },
      {
        role: 'user' as const,
        content: `${sectionPrompts[sectionType as keyof typeof sectionPrompts]}

Context: ${notes}

Format your response clearly with headings and bullet points where appropriate.`
      }
    ];

    const response = await groqApiService.makeRequest(messages);
    console.log(`✅ Generated ${sectionType}:`, response.substring(0, 100) + '...');
    
    return response;
  }

  private parseOverview(response: string, topic: string): SimpleRevisionPlan['overview'] {
    console.log('📋 Parsing overview section...');
    console.log('🔍 AI Response:', response);
    
    // Extract summary - look for more comprehensive patterns
    const summaryMatch = response.match(/(?:summary|overview|description)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i) ||
                        response.match(/^([^.\n]+(?:\.\s*[^.\n]+)*)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : `A comprehensive revision plan for ${topic} designed to help you master the key concepts through structured learning phases.`;
    
    // Extract difficulty
    const difficultyMatch = response.match(/(?:difficulty|level)[:\s]*(beginner|intermediate|advanced)/i);
    const difficulty = (difficultyMatch ? difficultyMatch[1].toLowerCase() : 'intermediate') as 'beginner' | 'intermediate' | 'advanced';
    
    // Extract time - look for various time formats
    const timeMatch = response.match(/(?:time|duration|estimated)[:\s]*(\d+\s*(?:hours?|days?|weeks?|minutes?))/i);
    const totalEstimatedTime = timeMatch ? timeMatch[1].trim() : '2-3 weeks';
    
    // Extract prerequisites - look for lists
    const prereqMatches = response.match(/(?:prerequisites?|requirements?|what you need)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/gi);
    let prerequisites = ['Basic knowledge of the topic'];
    
    if (prereqMatches) {
      const prereqText = prereqMatches.map(p => p.replace(/(?:prerequisites?|requirements?|what you need)[:\s]*/i, '').trim()).join(' ');
      prerequisites = prereqText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0).slice(0, 3);
    }
    
    console.log('✅ Parsed overview:', { summary: summary.substring(0, 50) + '...', difficulty, totalEstimatedTime, prerequisites });
    
    return {
      summary,
      difficulty,
      totalEstimatedTime,
      prerequisites
    };
  }

  private parseFocusAreas(response: string, topic: string): SimpleRevisionPlan['focusAreas'] {
    console.log('📋 Parsing focus areas section...');
    console.log('🔍 AI Response:', response);
    
    const areas: SimpleRevisionPlan['focusAreas'] = [];
    
    // Split response into sections by looking for area indicators
    const areaSections = response.split(/(?=\d+\.|\*\s|\-\s)/g).filter(section => section.trim().length > 0);
    
    console.log('📝 Found area sections:', areaSections.length);
    
    areaSections.slice(0, 4).forEach((section, index) => {
      console.log(`🔍 Processing area ${index + 1}:`, section.substring(0, 100) + '...');
      
      // Extract area title
      const titleMatch = section.match(/(?:\d+\.|\*|\-)\s*([^:\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : `Focus Area ${index + 1}`;
      
      // Extract description
      const descriptionMatch = section.match(/(?:description|overview)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i) ||
                              section.match(/:\s*([^.\n]+(?:\.\s*[^.\n]+)*)/);
      const description = descriptionMatch ? descriptionMatch[1].trim() : `Understanding ${title.toLowerCase()}`;
      
      // Extract importance
      const importanceMatch = section.match(/(?:importance|priority)[:\s]*(critical|important|optional)/i);
      const importance = importanceMatch ? importanceMatch[1].toLowerCase() as 'critical' | 'important' | 'optional' : 
                      (index === 0 ? 'critical' : 'important');
      
      // Extract key concepts
      const conceptsMatch = section.match(/(?:concepts?|key points?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const conceptsText = conceptsMatch ? conceptsMatch[1] : 'Core principles, Key terminology, Practical applications';
      const keyConcepts = conceptsText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0).slice(0, 4);
      
      // Extract common mistakes
      const mistakesMatch = section.match(/(?:mistakes?|errors?|pitfalls?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const mistakesText = mistakesMatch ? mistakesMatch[1] : 'Confusing similar concepts, Overlooking basic principles';
      const commonMistakes = mistakesText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0).slice(0, 3);
      
      // Extract study tips
      const tipsMatch = section.match(/(?:tips?|strategies?|methods?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const tipsText = tipsMatch ? tipsMatch[1] : 'Create concept maps, Use analogies, Practice with examples';
      const studyTips = tipsText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0).slice(0, 3);
      
      // Extract estimated time
      const timeMatch = section.match(/(?:time|duration)[:\s]*(\d+\s*(?:hours?|minutes?|days?))/i);
      const estimatedTime = timeMatch ? timeMatch[1].trim() : '2 hours';
      
      if (title && title.length > 3) {
        areas.push({
          title,
          description,
          importance,
          keyConcepts: keyConcepts.length > 0 ? keyConcepts : ['Core principles', 'Key terminology', 'Practical applications'],
          commonMistakes: commonMistakes.length > 0 ? commonMistakes : ['Confusing similar concepts', 'Overlooking basic principles'],
          studyTips: studyTips.length > 0 ? studyTips : ['Create concept maps', 'Use analogies', 'Practice with examples'],
          estimatedTime
        });
        
        console.log(`✅ Created focus area: ${title} - ${description.substring(0, 50)}...`);
      }
    });

    // If no focus areas found, create default ones
    if (areas.length === 0) {
      console.log('⚠️ No focus areas found, using default areas');
      return this.generateDefaultFocusAreas(topic);
    }

    console.log(`✅ Successfully parsed ${areas.length} focus areas`);
    return areas;
  }

  private parseStudyMethods(response: string, topic: string): SimpleRevisionPlan['studyMethods'] {
    console.log('📋 Parsing study methods section...');
    console.log('🔍 AI Response:', response);
    
    const methods: SimpleRevisionPlan['studyMethods'] = [];
    
    // Split response into sections by looking for method indicators
    const methodSections = response.split(/(?=\d+\.|\*\s|\-\s)/g).filter(section => section.trim().length > 0);
    
    console.log('📝 Found method sections:', methodSections.length);
    
    methodSections.slice(0, 4).forEach((section, index) => {
      console.log(`🔍 Processing method ${index + 1}:`, section.substring(0, 100) + '...');
      
      // Extract method name
      const nameMatch = section.match(/(?:\d+\.|\*|\-)\s*([^:\n]+)/);
      const name = nameMatch ? nameMatch[1].trim() : `Study Method ${index + 1}`;
      
      // Extract description
      const descriptionMatch = section.match(/(?:description|overview)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i) ||
                              section.match(/:\s*([^.\n]+(?:\.\s*[^.\n]+)*)/);
      const description = descriptionMatch ? descriptionMatch[1].trim() : `Effective study method for ${topic}`;
      
      // Extract effectiveness
      const effectivenessMatch = section.match(/(?:effectiveness|why effective|benefits?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const effectiveness = effectivenessMatch ? effectivenessMatch[1].trim() : 'Helps improve understanding and retention';
      
      // Extract estimated time
      const timeMatch = section.match(/(?:time|duration)[:\s]*(\d+\s*(?:hours?|minutes?|sessions?))/i);
      const estimatedTime = timeMatch ? timeMatch[1].trim() : '1 hour per session';
      
      // Extract difficulty
      const difficultyMatch = section.match(/(?:difficulty|level)[:\s]*(beginner|intermediate|advanced)/i);
      const difficulty = difficultyMatch ? difficultyMatch[1].toLowerCase() as 'beginner' | 'intermediate' | 'advanced' : 
                        (index === 0 ? 'beginner' : 'intermediate');
      
      if (name && name.length > 3) {
        methods.push({
          name,
          description,
          effectiveness,
          estimatedTime,
          difficulty
        });
        
        console.log(`✅ Created study method: ${name} - ${description.substring(0, 50)}...`);
      }
    });

    // If no methods found, create default ones
    if (methods.length === 0) {
      console.log('⚠️ No study methods found, using default methods');
      return this.generateDefaultStudyMethods(topic);
    }

    console.log(`✅ Successfully parsed ${methods.length} study methods`);
    return methods;
  }

  private parseRevisionPhases(response: string, topic: string): SimpleRevisionPlan['revisionPhases'] {
    console.log('📋 Parsing revision phases section...');
    console.log('🔍 AI Response:', response);
    
    const phases: SimpleRevisionPlan['revisionPhases'] = [];
    
    // Split response into sections by looking for phase indicators
    const phaseSections = response.split(/(?=\d+\.|\*\s|\-\s)/g).filter(section => section.trim().length > 0);
    
    console.log('📝 Found phase sections:', phaseSections.length);
    
    phaseSections.slice(0, 5).forEach((section, index) => {
      console.log(`🔍 Processing phase ${index + 1}:`, section.substring(0, 100) + '...');
      
      // Extract phase name (first line or after number/bullet)
      const nameMatch = section.match(/(?:\d+\.|\*|\-)\s*([^:\n]+)/);
      const name = nameMatch ? nameMatch[1].trim() : `Phase ${index + 1}`;
      
      // Extract description (look for content after colon or in first paragraph)
      const descriptionMatch = section.match(/(?:description|overview)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i) ||
                              section.match(/:\s*([^.\n]+(?:\.\s*[^.\n]+)*)/);
      const description = descriptionMatch ? descriptionMatch[1].trim() : `Comprehensive learning phase for ${topic}`;
      
      // Extract duration
      const durationMatch = section.match(/(?:duration|time)[:\s]*(\d+\s*(?:minutes?|hours?|days?))/i);
      const duration = durationMatch ? durationMatch[1].trim() : '1 hour';
      
      // Extract pedagogical approach
      const approachMatch = section.match(/(?:approach|method)[:\s]*([^.\n]+)/i);
      const pedagogicalApproach = approachMatch ? approachMatch[1].trim() : 'Structured learning';
      
      // Extract objectives
      const objectivesMatch = section.match(/(?:objectives?|goals?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const objectivesText = objectivesMatch ? objectivesMatch[1] : `Master ${name}`;
      
      // Split objectives by common separators
      const objectiveItems = objectivesText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0);
      const objectives = objectiveItems.slice(0, 3).map(obj => ({
        title: obj.trim(),
        description: `Learn and apply ${obj.trim().toLowerCase()}`,
        learningOutcomes: [
          `Understand ${obj.trim().toLowerCase()}`,
          `Apply ${obj.trim().toLowerCase()} in practice`,
          `Demonstrate mastery of ${obj.trim().toLowerCase()}`
        ]
      }));
      
      // Extract activities
      const activitiesMatch = section.match(/(?:activities?|tasks?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const activitiesText = activitiesMatch ? activitiesMatch[1] : 'Study materials, Practice exercises';
      const mainActivities = activitiesText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0).slice(0, 3);
      
      // Extract resources
      const resourcesMatch = section.match(/(?:resources?|materials?)[:\s]*([^.\n]+(?:\.\s*[^.\n]+)*)/i);
      const resourcesText = resourcesMatch ? resourcesMatch[1] : 'Textbook, Notes, Online resources';
      const primaryResources = resourcesText.split(/[,\n•\-\*]/).filter(item => item.trim().length > 0).slice(0, 3);
      
      if (name && name.length > 3) {
        phases.push({
          name,
          description,
          duration,
          pedagogicalApproach,
          objectives: objectives.length > 0 ? objectives : [{
            title: `Master ${name}`,
            description: `Understand and apply ${name} concepts`,
            learningOutcomes: [
              `Understand the fundamentals of ${name}`,
              `Apply ${name} concepts in practice`,
              `Demonstrate mastery of ${name}`
            ]
          }],
          activities: {
            main: mainActivities.length > 0 ? mainActivities : ['Study materials', 'Practice exercises'],
            alternative: ['Group study', 'Online resources'],
            extension: ['Advanced topics', 'Real-world applications']
          },
          resources: {
            primary: primaryResources.length > 0 ? primaryResources : ['Textbook', 'Notes'],
            secondary: ['Online articles', 'Videos'],
            interactive: ['Quizzes', 'Simulations'],
            visual: ['Diagrams', 'Charts'],
            handsOn: ['Practical exercises', 'Projects']
          },
          assessmentMethods: ['Self-quiz', 'Reflection']
        });
        
        console.log(`✅ Created phase: ${name} - ${description.substring(0, 50)}...`);
      }
    });

    // If no phases found, create default ones
    if (phases.length === 0) {
      console.log('⚠️ No phases found, using default phases');
      return this.generateDefaultRevisionPhases(topic);
    }

    console.log(`✅ Successfully parsed ${phases.length} revision phases`);
    return phases;
  }

  private parseAssessmentPlan(response: string): SimpleRevisionPlan['assessmentPlan'] {
    console.log('📋 Parsing assessment plan section...');
    
    return {
      formative: ['Weekly quizzes', 'Practice exercises', 'Self-assessment'],
      summative: ['Final exam', 'Project presentation'],
      selfAssessment: ['Reflection journal', 'Progress tracking']
    };
  }

  private parseProgressTracking(response: string): SimpleRevisionPlan['progressTracking'] {
    console.log('📋 Parsing progress tracking section...');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    return {
      milestones: ['Complete foundation concepts', 'Master core principles', 'Apply knowledge practically'],
      checkpoints: [
        {
          name: 'Week 1 Checkpoint',
          description: 'Review progress and adjust study plan',
          targetDate: futureDate.toISOString().split('T')[0]
        }
      ],
      successMetrics: [
        {
          name: 'Understanding Score',
          description: 'Score on comprehension tests',
          target: '80%'
        }
      ]
    };
  }


  private generateDefaultFocusAreas(topic: string): SimpleRevisionPlan['focusAreas'] {
    return [
      {
        title: `Introduction to ${topic}`,
        description: `Understanding the fundamental concepts of ${topic}`,
        importance: 'critical',
        keyConcepts: ['Basic definitions', 'Core principles'],
        commonMistakes: ['Confusing similar concepts'],
        studyTips: ['Create concept maps', 'Practice with examples'],
        estimatedTime: '2 hours'
      },
      {
        title: `Advanced Concepts in ${topic}`,
        description: `Exploring deeper aspects of ${topic}`,
        importance: 'important',
        keyConcepts: ['Advanced principles', 'Applications'],
        commonMistakes: ['Oversimplifying complex concepts'],
        studyTips: ['Research case studies', 'Connect theory to practice'],
        estimatedTime: '3 hours'
      },
      {
        title: `Practical Applications of ${topic}`,
        description: `Learning how to apply ${topic} in real-world situations`,
        importance: 'important',
        keyConcepts: ['Practical applications', 'Problem-solving'],
        commonMistakes: ['Focusing only on theory'],
        studyTips: ['Work through examples', 'Seek real-world applications'],
        estimatedTime: '2 hours'
      }
    ];
  }

  private generateDefaultStudyMethods(topic: string): SimpleRevisionPlan['studyMethods'] {
    return [
      {
        name: 'Active Reading',
        description: 'Engage with the text by highlighting and summarizing',
        effectiveness: 'Improves comprehension and retention',
        estimatedTime: '30 minutes per session',
        difficulty: 'beginner'
      },
      {
        name: 'Practice Problems',
        description: 'Solve exercises to apply theoretical knowledge',
        effectiveness: 'Identifies gaps and reinforces learning',
        estimatedTime: '1 hour per session',
        difficulty: 'intermediate'
      },
      {
        name: 'Concept Mapping',
        description: 'Visually organize information by connecting related concepts',
        effectiveness: 'Helps see relationships and improve recall',
        estimatedTime: '45 minutes per map',
        difficulty: 'beginner'
      },
      {
        name: 'Peer Discussion',
        description: 'Discuss concepts with others to deepen understanding',
        effectiveness: 'Exposes different perspectives and solidifies learning',
        estimatedTime: '1 hour per session',
        difficulty: 'intermediate'
      }
    ];
  }

  private generateDefaultRevisionPhases(topic: string): SimpleRevisionPlan['revisionPhases'] {
    return [
      {
        name: 'Review & Activation',
        description: 'Activate prior knowledge and review core concepts',
        duration: '15-20 minutes',
        pedagogicalApproach: 'Warm-up and activation',
        objectives: [
          {
            title: 'Activate Prior Knowledge',
            description: 'Review what you already know about the topic',
            learningOutcomes: [
              'Identify existing knowledge about the topic',
              'Connect new learning to prior experience',
              'Prepare for new concept acquisition'
            ]
          }
        ],
        activities: {
          main: ['Quick quiz on prerequisites', 'Brainstorming session'],
          alternative: ['Review previous notes', 'Discuss with peers']
        },
        resources: {
          primary: ['Previous notes', 'Textbook summary'],
          secondary: ['Online resources']
        },
        assessmentMethods: ['Self-quiz', 'Reflection']
      },
      {
        name: 'Core Learning',
        description: 'Deep dive into fundamental concepts and principles',
        duration: '30-45 minutes',
        pedagogicalApproach: 'Direct instruction and guided learning',
        objectives: [
          {
            title: 'Master Core Concepts',
            description: 'Understand fundamental principles systematically',
            learningOutcomes: [
              'Understand fundamental principles',
              'Apply core concepts in practice',
              'Demonstrate systematic comprehension'
            ]
          }
        ],
        activities: {
          main: ['Detailed reading', 'Note-taking'],
          alternative: ['Watch videos', 'Listen to lectures']
        },
        resources: {
          primary: ['Textbook chapters', 'Online lectures'],
          visual: ['Diagrams', 'Infographics']
        },
        assessmentMethods: ['Concept checks', 'Self-assessment']
      },
      {
        name: 'Guided Application',
        description: 'Practice applying concepts with support',
        duration: '25-35 minutes',
        pedagogicalApproach: 'Guided practice with scaffolding',
        objectives: [
          {
            title: 'Apply Concepts',
            description: 'Solve problems with provided examples or hints',
            learningOutcomes: [
              'Apply concepts with guidance',
              'Solve problems using examples',
              'Build confidence through practice'
            ]
          }
        ],
        activities: {
          main: ['Guided practice problems', 'Worked examples'],
          alternative: ['Group problem-solving', 'Peer tutoring']
        },
        resources: {
          primary: ['Practice problem sets', 'Solution guides'],
          interactive: ['Online exercises']
        },
        assessmentMethods: ['Peer review', 'Self-check']
      },
      {
        name: 'Independent Application',
        description: 'Apply learning autonomously to new problems',
        duration: '30-45 minutes',
        pedagogicalApproach: 'Independent practice and application',
        objectives: [
          {
            title: 'Independent Problem Solving',
            description: 'Solve new problems without external help',
            learningOutcomes: [
              'Solve problems independently',
              'Apply learning autonomously',
              'Demonstrate mastery through practice'
            ]
          }
        ],
        activities: {
          main: ['Unseen practice problems', 'Case studies'],
          extension: ['Research projects', 'Real-world applications']
        },
        resources: {
          primary: ['Past exam papers', 'Challenge questions'],
          handsOn: ['Practical exercises']
        },
        assessmentMethods: ['Self-assessment', 'Peer evaluation']
      },
      {
        name: 'Consolidation & Reflection',
        description: 'Review, summarize, and reflect on learning',
        duration: '15-20 minutes',
        pedagogicalApproach: 'Consolidation and metacognition',
        objectives: [
          {
            title: 'Consolidate Knowledge',
            description: 'Summarize key takeaways and identify areas for further study',
            learningOutcomes: [
              'Summarize key learning points',
              'Identify areas for improvement',
              'Plan future learning goals'
            ]
          }
        ],
        activities: {
          main: ['Concept mapping', 'Summary writing'],
          extension: ['Create study guide', 'Teach others']
        },
        resources: {
          primary: ['Self-made summaries', 'Flashcards']
        },
        assessmentMethods: ['Reflection questions', 'Self-evaluation']
      }
    ];
  }

  private extractSubjectFromNotes(notes: string): string {
    const lowerNotes = notes.toLowerCase();
    
    if (lowerNotes.includes('brain') || lowerNotes.includes('neuron') || lowerNotes.includes('psychology')) {
      return 'Psychology/Biology';
    }
    if (lowerNotes.includes('math') || lowerNotes.includes('equation') || lowerNotes.includes('formula')) {
      return 'Mathematics';
    }
    if (lowerNotes.includes('history') || lowerNotes.includes('war') || lowerNotes.includes('ancient')) {
      return 'History';
    }
    if (lowerNotes.includes('chemistry') || lowerNotes.includes('molecule') || lowerNotes.includes('element')) {
      return 'Chemistry';
    }
    if (lowerNotes.includes('physics') || lowerNotes.includes('force') || lowerNotes.includes('energy')) {
      return 'Physics';
    }
    if (lowerNotes.includes('literature') || lowerNotes.includes('novel') || lowerNotes.includes('poem')) {
      return 'Literature';
    }
    if (lowerNotes.includes('computer') || lowerNotes.includes('programming') || lowerNotes.includes('algorithm')) {
      return 'Computer Science';
    }
    if (lowerNotes.includes('biology') || lowerNotes.includes('cell') || lowerNotes.includes('organism')) {
      return 'Biology';
    }
    if (lowerNotes.includes('geography') || lowerNotes.includes('map') || lowerNotes.includes('climate')) {
      return 'Geography';
    }
    if (lowerNotes.includes('economics') || lowerNotes.includes('market') || lowerNotes.includes('finance')) {
      return 'Economics';
    }
    
    return 'General';
  }

  private createFallbackPlan(topic: string, notes: string): SimpleRevisionPlan {
    console.log('🔄 Creating fallback plan for:', topic);
    
    return {
      id: `fallback-plan-${Date.now()}`,
      title: `${topic} - Comprehensive Revision Plan`,
      topic,
      subject: this.extractSubjectFromNotes(notes),
      overview: {
        summary: `A structured approach to mastering ${topic} through systematic study and practice.`,
        difficulty: 'intermediate',
        totalEstimatedTime: '2-3 weeks',
        prerequisites: ['Basic understanding of the topic', 'Note-taking skills']
      },
      focusAreas: this.generateDefaultFocusAreas(topic),
      studyMethods: this.generateDefaultStudyMethods(topic),
      revisionPhases: this.generateDefaultRevisionPhases(topic),
      assessmentPlan: {
        formative: ['Weekly self-assessments', 'Concept check-ins'],
        summative: ['Comprehensive review', 'Practice exams'],
        selfAssessment: ['Reflection journals', 'Progress tracking']
      },
      progressTracking: {
        milestones: ['Complete foundation phase', 'Master core concepts', 'Apply knowledge practically'],
        checkpoints: [
          {
            name: 'Phase 1 Completion',
            description: 'Review all objectives for Phase 1',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ],
        successMetrics: [
          {
            name: 'Concept Mastery',
            description: 'Achieve 80% on self-quizzes',
            target: '80%'
          }
        ]
      },
      createdAt: new Date()
    };
  }
}

export const simpleRevisionPlanService = new SimpleRevisionPlanService();
