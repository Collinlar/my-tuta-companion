import { groqApiService } from './groqApiService';

export interface StudyMethod {
  name: string;
  description: string;
  whyEffective: string;
  howToUse: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface FocusArea {
  title: string;
  description: string;
  importance: 'critical' | 'important' | 'supplementary';
  keyConcepts: string[];
  commonMistakes: string[];
  studyTips: string[];
  estimatedTime: string;
}

export interface LearningObjective {
  title: string;
  description: string;
  prerequisites: string[];
  learningOutcomes: string[];
  assessmentCriteria: string[];
}

export interface RevisionPhase {
  name: string;
  description: string;
  duration: string;
  pedagogicalApproach: 'warm-up' | 'instruction' | 'guided-practice' | 'independent-practice' | 'consolidation' | 'extension';
  objectives: LearningObjective[];
  activities: {
    main: string[];
    alternative: string[];
    extension: string[];
  };
  studyMethods: StudyMethod[];
  resources: {
    primary: string[];
    secondary: string[];
    interactive: string[];
    visual: string[];
    handsOn: string[];
  };
  assessmentMethods: string[];
  scaffolding: {
    forStruggling: string[];
    forAdvanced: string[];
  };
}

export interface ComprehensiveRevisionPlan {
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
  focusAreas: FocusArea[];
  studyMethods: StudyMethod[];
  revisionPhases: RevisionPhase[];
  assessmentPlan: {
    formative: string[];
    summative: string[];
    selfAssessment: string[];
  };
  progressTracking: {
    milestones: string[];
    checkpoints: string[];
    successMetrics: string[];
  };
  createdAt: Date;
}

export class ComprehensiveRevisionPlanService {
  
  async generateComprehensiveRevisionPlan(notes: string, topic: string): Promise<ComprehensiveRevisionPlan> {
    console.log('🔍 Generating comprehensive revision plan for:', topic);
    console.log('📝 Notes:', notes);
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are an expert educational consultant creating comprehensive revision plans for student self-study.

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations, no backticks. Ensure all JSON is properly closed.

Generate a complete revision plan with ALL sections populated:

The JSON object must contain:

{
  "overview": {
    "summary": "Comprehensive overview of the topic and learning approach",
    "difficulty": "beginner|intermediate|advanced",
    "totalEstimatedTime": "X hours/days",
    "prerequisites": ["prerequisite1", "prerequisite2"]
  },
  "focusAreas": [
    {
      "title": "Specific focus area within the topic",
      "description": "Why this area is important and what it covers",
      "importance": "critical|important|supplementary",
      "keyConcepts": ["concept1", "concept2"],
      "commonMistakes": ["mistake1", "mistake2"],
      "studyTips": ["tip1", "tip2"],
      "estimatedTime": "X hours"
    }
  ],
  "studyMethods": [
    {
      "name": "Method name",
      "description": "What this method involves",
      "whyEffective": "Why this method works well for this topic",
      "howToUse": "Step-by-step instructions",
      "estimatedTime": "X minutes/hours",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "revisionPhases": [
    {
      "name": "Phase name (e.g., Review & Activation, Core Learning, Guided Application)",
      "description": "What happens in this phase",
      "duration": "X minutes/hours",
      "pedagogicalApproach": "warm-up|instruction|guided-practice|independent-practice|consolidation|extension",
      "objectives": [
        {
          "title": "Objective title",
          "description": "What student will achieve",
          "prerequisites": ["prereq1"],
          "learningOutcomes": ["outcome1", "outcome2"],
          "assessmentCriteria": ["criteria1"]
        }
      ],
      "activities": {
        "main": ["Primary activity for this phase"],
        "alternative": ["Alternative approach if main doesn't work"],
        "extension": ["Advanced activity for deeper understanding"]
      },
      "studyMethods": ["Method1", "Method2"],
      "resources": {
        "primary": ["Core textbooks, notes"],
        "secondary": ["Additional readings"],
        "interactive": ["Online simulations, apps"],
        "visual": ["Diagrams, videos, infographics"],
        "handsOn": ["Physical models, experiments"]
      },
      "assessmentMethods": ["Self-quiz", "Reflection questions"],
      "scaffolding": {
        "forStruggling": ["Simplified explanations", "Visual aids", "Step-by-step guides"],
        "forAdvanced": ["Advanced research topics", "Design experiments", "Critical analysis"]
      }
    }
  ],
  "assessmentPlan": {
    "formative": ["formative assessment 1"],
    "summative": ["summative assessment 1"],
    "selfAssessment": ["self assessment 1"]
  },
  "progressTracking": {
    "milestones": ["milestone1", "milestone2"],
    "checkpoints": ["checkpoint1"],
    "successMetrics": ["metric1", "metric2"]
  }
}

GUIDELINES:
- ADAPT TEACHER LESSON PLAN STRUCTURE: Use proven pedagogical phases (warm-up, instruction, guided practice, independent practice, closure, extension)
- Make it topic-specific: For "Photosynthesis", include equation, components, process steps, real-world applications
- Include multiple study methods: Visual diagrams, case studies, interactive models, hands-on activities
- Create progressive phases: Review & Activation → Core Learning → Guided Application → Independent Practice → Consolidation → Extension
- Focus on deep understanding, not just memorization
- Include practical applications and real-world connections
- Provide specific, actionable activities (like the teacher's lesson plan activities)
- Consider different learning styles and preferences
- Include differentiated instruction: scaffolding for struggling students, extensions for advanced students
- Include self-assessment and progress tracking methods
- Use time-bound activities like the teacher's plan (5 min warm-up, 10 min instruction, etc.)

PEDAGOGICAL ACTIVITY EXAMPLES (adapt these for student self-study):
- Warm-Up: "Review your notes and identify 3 key concepts you already know"
- Instruction: "Watch the Khan Academy video on [topic] and take notes"
- Guided Practice: "Complete the practice problems with the answer key nearby"
- Independent Practice: "Solve similar problems without looking at solutions"
- Extension: "Research advanced applications of [topic] in real-world scenarios"

Keep all text concise but comprehensive. Use \\n for line breaks where needed.`
        },
        {
          role: 'user' as const,
          content: `Create a comprehensive revision plan for: "${topic}"

Context: ${notes}

IMPORTANT: Generate ALL sections with meaningful content:
- overview: summary, difficulty, time, prerequisites
- focusAreas: 3-4 areas with title, description, importance, keyConcepts, studyTips, estimatedTime
- studyMethods: 3-4 methods with name, description, effectiveness, estimatedTime
- revisionPhases: 4-5 phases with name, description, duration, pedagogicalApproach, objectives, activities, resources
- assessmentPlan: formative, summative, selfAssessment arrays
- progressTracking: milestones, checkpoints, successMetrics arrays

Each section must have content, not empty arrays.`
        }
      ];

      const response = await groqApiService.makeRequest(messages);
      console.log('Raw AI response for comprehensive revision plan:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', response?.length);
      
      // Check for potential truncation
      if (response && response.length < 500) {
        console.log('⚠️ Response seems too short, might be truncated');
      }
      
      // Check if response ends abruptly
      if (response && !response.trim().endsWith('}')) {
        console.log('⚠️ Response does not end with closing brace, likely truncated');
      }
      
      try {
        console.log('Attempting to parse JSON...');
        
        // Clean the response before parsing
        const cleanedResponse = this.cleanJsonResponse(response);
        console.log('Cleaned response:', cleanedResponse);
        
        // Try multiple parsing strategies
        let planData;
        try {
          planData = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.log('🔄 First parse attempt failed, trying advanced repair...');
          const repairedResponse = this.advancedJsonRepair(cleanedResponse);
          console.log('Repaired response:', repairedResponse);
          
          try {
            planData = JSON.parse(repairedResponse);
          } catch (secondParseError) {
            console.log('🔄 Second parse attempt failed, trying truncation recovery...');
            const recoveredResponse = this.recoverFromTruncation(cleanedResponse, topic, notes);
            console.log('Recovered response:', recoveredResponse);
            planData = JSON.parse(recoveredResponse);
          }
        }
        
        console.log('✅ Successfully parsed JSON:', planData);
        console.log('Plan data keys:', Object.keys(planData));
        console.log('Focus areas:', planData.focusAreas);
        console.log('Revision phases:', planData.revisionPhases);
        
        return {
          id: `comprehensive-plan-${Date.now()}`,
          title: `${topic} - Comprehensive Revision Plan`,
          topic,
          subject: this.extractSubjectFromNotes(notes),
          overview: planData.overview,
          focusAreas: planData.focusAreas,
          studyMethods: planData.studyMethods,
          revisionPhases: planData.revisionPhases,
          assessmentPlan: planData.assessmentPlan,
          progressTracking: planData.progressTracking,
          createdAt: new Date()
        };
      } catch (parseError) {
        console.error('❌ Error parsing comprehensive revision plan:', parseError);
        console.error('Raw response that failed to parse:', response);
        console.log('🔄 Falling back to default plan structure');
        return this.createFallbackPlan(topic, notes);
      }
    } catch (error) {
      console.error('Error generating comprehensive revision plan:', error);
      return this.createFallbackPlan(topic, notes);
    }
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
    
    return 'General';
  }

  private cleanJsonResponse(response: string): string {
    console.log('🧹 Cleaning JSON response...');
    
    // Remove markdown code blocks if present
    let cleaned = response.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Try to extract JSON object if wrapped in other text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    // Fix common JSON structural issues
    cleaned = this.repairJsonStructure(cleaned);
    
    console.log('✅ JSON cleaned successfully');
    return cleaned;
  }

  private repairJsonStructure(json: string): string {
    console.log('🔧 Repairing JSON structure...');
    
    // Fix common structural issues
    let repaired = json
      // Fix missing commas between properties
      .replace(/"\s*}\s*"/g, '", "')
      .replace(/"\s*}\s*\[/g, '", [')
      .replace(/"\s*}\s*{/g, '", {')
      // Fix trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix missing quotes around property names
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Fix unescaped quotes in strings
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, (match, content) => {
        const escaped = content.replace(/"/g, '\\"');
        return `"${escaped}":`;
      })
      // Fix control characters in strings
      .replace(/"([^"]*[\u0000-\u001F\u007F-\u009F][^"]*)"/g, (match, content) => {
        const cleaned = content
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f')
          .replace(/\b/g, '\\b');
        return `"${cleaned}"`;
      });

    // Try to fix malformed object structures
    repaired = this.fixMalformedObjects(repaired);
    
    console.log('✅ JSON structure repaired');
    return repaired;
  }

  private fixMalformedObjects(json: string): string {
    // Fix cases where properties are outside their parent objects
    // e.g., {"overview": {...}, "prerequisites": [...]} should be {"overview": {...}, "prerequisites": [...]}
    
    // Find the main object structure
    const mainObjectMatch = json.match(/^\{[\s\S]*\}$/);
    if (!mainObjectMatch) {
      return json;
    }
    
    let fixed = json;
    
    // Fix misplaced properties that should be inside overview
    if (fixed.includes('"overview":') && fixed.includes('"prerequisites":')) {
      // Check if prerequisites is outside overview when it should be inside
      const overviewMatch = fixed.match(/"overview":\s*\{([^}]*)\}/);
      if (overviewMatch && !overviewMatch[1].includes('"prerequisites"')) {
        // Move prerequisites inside overview
        const prerequisitesMatch = fixed.match(/"prerequisites":\s*\[[^\]]*\]/);
        if (prerequisitesMatch) {
          const prerequisites = prerequisitesMatch[0];
          fixed = fixed.replace(prerequisites, '');
          fixed = fixed.replace(/"overview":\s*\{([^}]*)\}/, `"overview": {$1, ${prerequisites}}`);
        }
      }
    }
    
    // Ensure proper comma placement
    fixed = fixed
      .replace(/\}\s*"/g, '}, "')
      .replace(/\}\s*\[/g, '}, [')
      .replace(/\}\s*\{/g, '}, {')
      .replace(/\]\s*"/g, '], "')
      .replace(/\]\s*\[/g, '], [')
      .replace(/\]\s*\{/g, '], {');
    
    return fixed;
  }

  private advancedJsonRepair(json: string): string {
    console.log('🔧 Advanced JSON repair...');
    
    // Handle specific syntax errors we've seen
    let repaired = json;
    
    // Fix the specific error: "Expected ',' or '}' after property value"
    // This often happens when there's a missing comma or malformed structure
    
    // Fix cases like: "totalEstimatedTime": "10 hours"}, { "prerequisites"
    repaired = repaired.replace(/"totalEstimatedTime":\s*"[^"]*"\s*}\s*,\s*{\s*"prerequisites"/g, 
      '"totalEstimatedTime": "$1", "prerequisites"');
    
    // Fix cases where properties are outside their parent objects
    // Move prerequisites inside overview if it's outside
    if (repaired.includes('"overview":') && repaired.includes('"prerequisites":')) {
      const overviewEndMatch = repaired.match(/"overview":\s*\{[^}]*\}/);
      if (overviewEndMatch) {
        const overviewEnd = overviewEndMatch[0];
        const afterOverview = repaired.substring(overviewEnd.length);
        
        // Check if prerequisites comes right after overview
        if (afterOverview.trim().startsWith('}, {"prerequisites"')) {
          // Extract prerequisites
          const prerequisitesMatch = afterOverview.match(/"prerequisites":\s*\[[^\]]*\]/);
          if (prerequisitesMatch) {
            const prerequisites = prerequisitesMatch[0];
            // Remove prerequisites from outside
            const beforePrerequisites = afterOverview.substring(0, afterOverview.indexOf(prerequisites));
            const afterPrerequisites = afterOverview.substring(afterOverview.indexOf(prerequisites) + prerequisites.length);
            
            // Reconstruct with prerequisites inside overview
            repaired = overviewEnd.replace(/\}$/, `, ${prerequisites}}`) + beforePrerequisites + afterPrerequisites;
          }
        }
      }
    }
    
    // Fix missing commas between major sections
    repaired = repaired
      .replace(/"overview":\s*\{[^}]*\}\s*"focusAreas"/g, '"overview": {$1}, "focusAreas"')
      .replace(/"focusAreas":\s*\[[^\]]*\]\s*"studyMethods"/g, '"focusAreas": [$1], "studyMethods"')
      .replace(/"studyMethods":\s*\[[^\]]*\]\s*"revisionPhases"/g, '"studyMethods": [$1], "revisionPhases"');
    
    // Ensure proper object structure
    repaired = this.ensureValidObjectStructure(repaired);
    
    console.log('✅ Advanced JSON repair completed');
    return repaired;
  }

  private ensureValidObjectStructure(json: string): string {
    // Ensure the JSON has the basic structure we expect
    let structured = json;
    
    // If it doesn't start with {, add it
    if (!structured.trim().startsWith('{')) {
      structured = '{' + structured;
    }
    
    // If it doesn't end with }, add it
    if (!structured.trim().endsWith('}')) {
      structured = structured + '}';
    }
    
    // Ensure we have the required top-level properties
    const requiredProps = ['overview', 'focusAreas', 'studyMethods', 'revisionPhases'];
    const hasAllProps = requiredProps.every(prop => structured.includes(`"${prop}"`));
    
    if (!hasAllProps) {
      console.log('⚠️ Missing required properties, using fallback structure');
      return this.createMinimalValidJson(json);
    }
    
    return structured;
  }

  private createMinimalValidJson(originalJson: string): string {
    // Extract what we can from the original JSON and create a minimal valid structure
    const overviewMatch = originalJson.match(/"overview":\s*\{[^}]*\}/);
    const focusAreasMatch = originalJson.match(/"focusAreas":\s*\[[^\]]*\]/);
    
    return JSON.stringify({
      overview: overviewMatch ? JSON.parse(overviewMatch[0].split(':')[1].trim()) : {
        summary: "Comprehensive revision plan",
        difficulty: "intermediate",
        totalEstimatedTime: "10 hours",
        prerequisites: ["Basic knowledge"]
      },
      focusAreas: focusAreasMatch ? JSON.parse(focusAreasMatch[0].split(':')[1].trim()) : [
        {
          title: "Core Concepts",
          description: "Fundamental principles and key ideas",
          importance: "critical",
          keyConcepts: ["Basic definitions", "Key principles"],
          commonMistakes: ["Confusing similar concepts"],
          studyTips: ["Create concept maps", "Use examples"],
          estimatedTime: "2 hours"
        }
      ],
      studyMethods: [],
      revisionPhases: [],
      assessmentPlan: {
        formative: ["Self-assessments"],
        summative: ["Practice tests"],
        selfAssessment: ["Reflection journals"]
      },
      progressTracking: {
        milestones: ["Complete core concepts"],
        checkpoints: ["Weekly reviews"],
        successMetrics: ["Understanding depth"]
      }
    });
  }

  private recoverFromTruncation(json: string, topic: string, notes: string): string {
    console.log('🔧 Recovering from truncated JSON...');
    
    // Try to extract what we can from the partial JSON
    const extractedData = this.extractPartialData(json, topic, notes);
    
    // Create a complete JSON structure with the extracted data
    const completeJson = JSON.stringify(extractedData);
    
    console.log('✅ Truncation recovery completed');
    return completeJson;
  }

  private extractPartialData(json: string, topic: string, notes: string): any {
    console.log('🔍 Extracting partial data from truncated JSON...');
    
    const extracted: any = {
      overview: {
        summary: `Comprehensive revision plan for ${topic}`,
        difficulty: 'intermediate',
        totalEstimatedTime: '10 hours',
        prerequisites: ['Basic knowledge']
      },
      focusAreas: [],
      studyMethods: [],
      revisionPhases: [],
      assessmentPlan: {
        formative: ['Self-assessments'],
        summative: ['Practice tests'],
        selfAssessment: ['Reflection journals']
      },
      progressTracking: {
        milestones: ['Complete core concepts'],
        checkpoints: ['Weekly reviews'],
        successMetrics: ['Understanding depth']
      }
    };

    // Try to extract overview data
    const overviewMatch = json.match(/"overview":\s*\{([^}]*?)(?:"[^"]*":\s*"[^"]*")*?/);
    if (overviewMatch) {
      try {
        const overviewStr = '{' + overviewMatch[1] + '}';
        const overviewData = JSON.parse(overviewStr);
        extracted.overview = { ...extracted.overview, ...overviewData };
      } catch (e) {
        console.log('Could not parse overview, using defaults');
      }
    }

    // Try to extract focus areas
    const focusAreasMatch = json.match(/"focusAreas":\s*\[([^\]]*?)(?:\{[^}]*\})*?/);
    if (focusAreasMatch) {
      try {
        // Find complete focus area objects
        const focusAreasStr = '[' + focusAreasMatch[1] + ']';
        const focusAreasData = JSON.parse(focusAreasStr);
        if (Array.isArray(focusAreasData)) {
          extracted.focusAreas = focusAreasData;
        }
      } catch (e) {
        // Try to extract individual focus areas
        const individualAreas = this.extractIndividualFocusAreas(json);
        if (individualAreas.length > 0) {
          extracted.focusAreas = individualAreas;
        }
      }
    }

    // If no focus areas found, create some based on the topic
    if (extracted.focusAreas.length === 0) {
      extracted.focusAreas = this.generateFocusAreasFromTopic(topic, notes);
    }

    console.log('✅ Partial data extraction completed');
    return extracted;
  }

  private extractIndividualFocusAreas(json: string): any[] {
    const focusAreas: any[] = [];
    
    // Look for individual focus area objects
    const focusAreaPattern = /"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)",\s*"importance":\s*"([^"]+)"/g;
    let match;
    
    while ((match = focusAreaPattern.exec(json)) !== null) {
      focusAreas.push({
        title: match[1],
        description: match[2],
        importance: match[3],
        keyConcepts: ['Key concept 1', 'Key concept 2'],
        commonMistakes: ['Common mistake 1'],
        studyTips: ['Study tip 1', 'Study tip 2'],
        estimatedTime: '2 hours'
      });
    }
    
    return focusAreas;
  }

  private generateFocusAreasFromTopic(topic: string, notes: string): any[] {
    console.log('🎯 Generating focus areas from topic:', topic);
    
    // Create focus areas based on the topic
    const focusAreas = [
      {
        title: `Introduction to ${topic}`,
        description: `Understanding the fundamental concepts and principles of ${topic}`,
        importance: 'critical',
        keyConcepts: ['Basic definitions', 'Core principles', 'Key terminology'],
        commonMistakes: ['Confusing similar concepts', 'Overlooking basic principles'],
        studyTips: ['Create concept maps', 'Use analogies', 'Practice with examples'],
        estimatedTime: '2 hours'
      },
      {
        title: `Advanced Concepts in ${topic}`,
        description: `Exploring deeper aspects and applications of ${topic}`,
        importance: 'important',
        keyConcepts: ['Advanced principles', 'Real-world applications', 'Complex scenarios'],
        commonMistakes: ['Oversimplifying complex concepts', 'Missing practical applications'],
        studyTips: ['Research case studies', 'Practice problem-solving', 'Connect theory to practice'],
        estimatedTime: '3 hours'
      },
      {
        title: `Practical Applications of ${topic}`,
        description: `Learning how to apply ${topic} knowledge in real-world situations`,
        importance: 'important',
        keyConcepts: ['Practical applications', 'Problem-solving techniques', 'Best practices'],
        commonMistakes: ['Focusing only on theory', 'Ignoring practical considerations'],
        studyTips: ['Work through examples', 'Practice hands-on exercises', 'Seek real-world applications'],
        estimatedTime: '2 hours'
      }
    ];
    
    return focusAreas;
  }

  private createFallbackPlan(topic: string, notes: string): ComprehensiveRevisionPlan {
    console.log('🔄 Creating fallback plan for:', topic);
    const fallbackPlan = {
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
      focusAreas: [
        {
          title: 'Core Concepts',
          description: 'Fundamental principles and key ideas that form the foundation of the topic.',
          importance: 'critical',
          keyConcepts: ['Basic definitions', 'Key principles', 'Fundamental relationships'],
          commonMistakes: ['Confusing similar concepts', 'Overlooking basic principles'],
          studyTips: ['Create concept maps', 'Use analogies', 'Practice with examples'],
          estimatedTime: '5-7 hours'
        }
      ],
      studyMethods: [
        {
          name: 'Active Recall',
          description: 'Testing yourself on the material without looking at notes.',
          whyEffective: 'Strengthens memory and identifies knowledge gaps.',
          howToUse: 'Cover your notes and try to recall key points, then check your accuracy.',
          estimatedTime: '20-30 minutes per session',
          difficulty: 'beginner'
        }
      ],
      revisionPhases: [
        {
          name: 'Review & Activation',
          description: 'Activate prior knowledge and review core concepts.',
          duration: '15-20 minutes',
          pedagogicalApproach: 'warm-up',
          objectives: [
            {
              title: 'Activate Prior Knowledge',
              description: 'Review what you already know about the topic.',
              prerequisites: ['Basic reading comprehension'],
              learningOutcomes: ['Identify existing knowledge', 'Connect to new concepts'],
              assessmentCriteria: ['Can list 3 key concepts', 'Can explain basic terms']
            }
          ],
          activities: {
            main: ['Review your notes and identify 3 key concepts you already know', 'Create a mind map of your current understanding'],
            alternative: ['Skim through textbook headings', 'Watch a quick overview video'],
            extension: ['Research current applications of this topic', 'Connect to recent news or developments']
          },
          studyMethods: ['Mind Mapping', 'Quick Review'],
          resources: {
            primary: ['Your notes', 'Previous assignments'],
            secondary: ['Overview videos', 'Quick reference guides'],
            interactive: ['Concept mapping tools', 'Quick quizzes'],
            visual: ['Infographics', 'Summary diagrams'],
            handsOn: ['Drawing concept maps', 'Physical note organization']
          },
          assessmentMethods: ['Self-reflection questions', 'Concept inventory'],
          scaffolding: {
            forStruggling: ['Start with just 1-2 concepts', 'Use visual aids', 'Break into smaller chunks'],
            forAdvanced: ['Connect to advanced topics', 'Research current developments', 'Challenge assumptions']
          }
        },
        {
          name: 'Core Learning',
          description: 'Deep dive into fundamental concepts and principles.',
          duration: '30-45 minutes',
          pedagogicalApproach: 'instruction',
          objectives: [
            {
              title: 'Master Core Concepts',
              description: 'Understand fundamental principles and definitions systematically.',
              prerequisites: ['Prior knowledge activation'],
              learningOutcomes: ['Define key terms accurately', 'Explain core principles', 'Understand relationships'],
              assessmentCriteria: ['Can explain concepts without notes', 'Can identify examples', 'Can connect related ideas']
            }
          ],
          activities: {
            main: ['Watch educational videos and take detailed notes', 'Read textbook sections systematically', 'Create detailed concept maps'],
            alternative: ['Use interactive simulations', 'Listen to educational podcasts', 'Join study groups'],
            extension: ['Research advanced applications', 'Compare different perspectives', 'Analyze case studies']
          },
          studyMethods: ['Note-taking', 'Concept Mapping', 'Active Reading'],
          resources: {
            primary: ['Textbook chapters', 'Educational videos', 'Your notes'],
            secondary: ['Academic articles', 'Study guides', 'Online courses'],
            interactive: ['Interactive simulations', 'Virtual labs', 'Educational games'],
            visual: ['Diagrams', 'Charts', 'Infographics', 'Videos'],
            handsOn: ['Building models', 'Conducting simple experiments', 'Creating visual aids']
          },
          assessmentMethods: ['Self-testing', 'Teaching concepts to others', 'Practice problems'],
          scaffolding: {
            forStruggling: ['Use simplified language', 'Provide visual aids', 'Break into smaller steps', 'Offer multiple explanations'],
            forAdvanced: ['Research advanced topics', 'Analyze complex scenarios', 'Design experiments', 'Critical analysis']
          }
        }
      ],
      assessmentPlan: {
        formative: ['Weekly self-assessments', 'Concept check-ins'],
        summative: ['Comprehensive review', 'Practice exams'],
        selfAssessment: ['Reflection journals', 'Progress tracking']
      },
      progressTracking: {
        milestones: ['Complete foundation phase', 'Master core concepts'],
        checkpoints: ['Weekly progress reviews'],
        successMetrics: ['Understanding depth', 'Retention rate', 'Application ability']
      },
      createdAt: new Date()
    };
    console.log('✅ Fallback plan created:', fallbackPlan);
    return fallbackPlan;
  }
}

export const comprehensiveRevisionPlanService = new ComprehensiveRevisionPlanService();
