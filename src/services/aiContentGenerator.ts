import { Task, Resource } from "@/types/task";
import { LearningGoal } from "@/components/dashboard/GoalSelection";
import { aiLearningPathGenerator } from "./aiLearningPathGenerator";
import { groqApiService } from "./groqApiService";
import { profileAwareAI } from "./profileAwareAI";
import { webSearchService, EducationalResource } from "./webSearchService";
import { comprehensiveRevisionPlanService, ComprehensiveRevisionPlan } from "./comprehensiveRevisionPlan";

export interface GeneratedPlan {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  goals: LearningGoal[];
  tasks: Task[];
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

class AIContentGenerator {
  // Convert educational resources to Resource format
  private convertToResources(educationalResources: EducationalResource[]): Resource[] {
    return educationalResources.map((resource, index) => ({
      id: `resource-${Date.now()}-${index}`,
      title: resource.title,
      type: resource.type as 'video' | 'article' | 'practice' | 'interactive' | 'document' | 'pdf' | 'quiz' | 'flashcard' | 'contest',
      url: resource.url,
      description: resource.description,
      duration: resource.duration,
      difficulty: resource.difficulty,
      source: resource.source,
      thumbnail: resource.thumbnail
    }));
  }

  // Search for web resources based on topic and subject
  private async searchWebResources(topic: string, subject: string, gradeLevel: string): Promise<Resource[]> {
    try {
      const educationalResources = await webSearchService.searchGhanaEducationalContent(topic, subject, gradeLevel);
      return this.convertToResources(educationalResources);
    } catch (error) {
      console.error('Error searching web resources:', error);
      return [];
    }
  }

  // Get user profile from localStorage
  private getUserProfile(): any {
    try {
      const profile = localStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Generate comprehensive revision plan (new structured approach)
  async generateComprehensiveRevisionPlan(notes: string, topic: string): Promise<ComprehensiveRevisionPlan> {
    try {
      console.log('Generating comprehensive revision plan for topic:', topic);
      const plan = await comprehensiveRevisionPlanService.generateComprehensiveRevisionPlan(notes, topic);
      console.log('Comprehensive revision plan generated successfully:', plan.title);
      return plan;
    } catch (error) {
      console.error('Error generating comprehensive revision plan:', error);
      throw error;
    }
  }

  // Main function to generate personalized revision plan with profile context
  async generateRevisionPlan(notes: string, goals: LearningGoal[], fileName?: string): Promise<GeneratedPlan> {
    try {
      // Use profile-aware AI to analyze notes with personalized context
      const analysis = await profileAwareAI.analyzeNotesWithProfile(notes);
      const { subject, topic, difficulty } = analysis;
    
      const tasks = await this.generateTasksForGoals(notes, goals, analysis, topic, subject);
      
      return {
        id: `plan-${Date.now()}`,
        title: `${topic} - Personalized Revision Plan`,
        description: `AI-generated revision plan based on your notes, profile, and selected goals: ${goals.join(', ')}`,
        subject,
        topic,
        goals,
        tasks,
        estimatedDuration: this.calculateEstimatedDuration(tasks),
        difficulty: difficulty,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error generating revision plan with Profile-Aware AI:', error);
      // Fallback to standard Groq API
      try {
        const analysis = await groqApiService.analyzeNotes(notes);
        const { subject, topic, difficulty } = analysis;
      
        const tasks = await this.generateTasksForGoals(notes, goals, analysis, topic, subject);
        
        return {
          id: `plan-${Date.now()}`,
          title: `${topic} - Personalized Revision Plan`,
          description: `AI-generated revision plan based on your notes and selected goals: ${goals.join(', ')}`,
          subject,
          topic,
          goals,
          tasks,
          estimatedDuration: this.calculateEstimatedDuration(tasks),
          difficulty: difficulty,
          createdAt: new Date()
        };
      } catch (fallbackError) {
        console.error('Fallback also failed, using local analysis:', fallbackError);
        // Final fallback to local analysis
        const analysis = this.analyzeNotes(notes);
        const topic = this.extractTopic(notes, fileName);
        const subject = this.determineSubject(notes, topic);
        
        const tasks = await this.generateTasksForGoals(notes, goals, analysis, topic, subject);
        
        return {
          id: `plan-${Date.now()}`,
          title: `${topic} - Personalized Revision Plan`,
          description: `AI-generated revision plan based on your notes and selected goals: ${goals.join(', ')}`,
          subject,
          topic,
          goals,
          tasks,
          estimatedDuration: this.calculateEstimatedDuration(tasks),
          difficulty: this.determineOverallDifficulty(analysis),
          createdAt: new Date()
        };
      }
    }
  }

  // Analyze the content and structure of the notes
  private analyzeNotes(notes: string) {
    const lines = notes.split('\n').filter(line => line.trim());
    const words = notes.split(/\s+/).filter(word => word.length > 0);
    
    return {
      wordCount: words.length,
      lineCount: lines.length,
      hasFormulas: this.detectFormulas(notes),
      hasDefinitions: this.detectDefinitions(notes),
      hasExamples: this.detectExamples(notes),
      hasQuestions: this.detectQuestions(notes),
      complexity: this.assessComplexity(notes),
      keyConcepts: this.extractKeyConcepts(notes),
      topics: this.extractTopics(notes)
    };
  }

  // Extract the main topic from notes
  private extractTopic(notes: string, fileName?: string): string {
    // Try to extract from filename first
    if (fileName) {
      const cleanName = fileName.replace(/\.(txt|md)$/, '').replace(/[-_]/g, ' ');
      if (cleanName.length > 3) {
        return this.capitalizeWords(cleanName);
      }
    }

    // Extract from content
    const lines = notes.split('\n').slice(0, 10); // First 10 lines
    const titlePatterns = [
      /^#\s*(.+)$/m, // Markdown headers
      /^title:\s*(.+)$/im, // Title metadata
      /^subject:\s*(.+)$/im, // Subject metadata
      /^topic:\s*(.+)$/im // Topic metadata
    ];

    for (const pattern of titlePatterns) {
      const match = notes.match(pattern);
      if (match) {
        return this.capitalizeWords(match[1].trim());
      }
    }

    // Fallback: use first meaningful line
    const firstLine = lines.find(line => line.trim().length > 5);
    if (firstLine) {
      return this.capitalizeWords(firstLine.trim().substring(0, 50));
    }

    return "Study Notes";
  }

  // Determine subject based on content analysis
  private determineSubject(notes: string, topic: string): string {
    const mathKeywords = ['equation', 'formula', 'solve', 'calculate', 'algebra', 'geometry', 'trigonometry', 'calculus', 'quadratic', 'polynomial'];
    const scienceKeywords = ['physics', 'chemistry', 'biology', 'experiment', 'hypothesis', 'molecule', 'atom', 'force', 'energy', 'reaction'];
    const englishKeywords = ['literature', 'poetry', 'essay', 'grammar', 'vocabulary', 'analysis', 'theme', 'character', 'plot'];
    const historyKeywords = ['history', 'war', 'revolution', 'ancient', 'medieval', 'modern', 'timeline', 'event', 'century'];

    const lowerNotes = notes.toLowerCase();
    const lowerTopic = topic.toLowerCase();

    if (mathKeywords.some(keyword => lowerNotes.includes(keyword) || lowerTopic.includes(keyword))) {
      return 'Mathematics';
    }
    if (scienceKeywords.some(keyword => lowerNotes.includes(keyword) || lowerTopic.includes(keyword))) {
      return 'Science';
    }
    if (englishKeywords.some(keyword => lowerNotes.includes(keyword) || lowerTopic.includes(keyword))) {
      return 'English';
    }
    if (historyKeywords.some(keyword => lowerNotes.includes(keyword) || lowerTopic.includes(keyword))) {
      return 'History';
    }

    return 'General';
  }

  // Generate tasks based on selected goals
  private async generateTasksForGoals(notes: string, goals: LearningGoal[], analysis: any, topic: string, subject: string): Promise<Task[]> {
    const tasks: Task[] = [];
    let taskId = 1;

    // Get user profile for grade level
    const userProfile = this.getUserProfile();
    const gradeLevel = userProfile?.grade || 'Grade 10';

    // Search for web resources
    const webResources = await this.searchWebResources(topic, subject, gradeLevel);

    // Always start with a reading/understanding task
    tasks.push(await this.createReadingTask(taskId++, notes, analysis, topic, subject, webResources));

    // Generate tasks based on selected goals
    if (goals.includes('learning-path')) {
      const learningPathTasks = await this.createLearningPathTasks(taskId, notes, analysis, topic, subject, webResources);
      tasks.push(...learningPathTasks);
      taskId += 3;
    }

    if (goals.includes('flashcards')) {
      tasks.push(this.createFlashcardTask(taskId++, notes, analysis, topic, subject));
    }

    if (goals.includes('quizzes')) {
      tasks.push(this.createQuizTask(taskId++, notes, analysis, topic, subject));
    }

    if (goals.includes('contest')) {
      tasks.push(this.createContestTask(taskId++, notes, analysis, topic, subject));
    }

    if (goals.includes('revision-plan')) {
      tasks.push(...this.createRevisionPlanTasks(taskId, notes, analysis, topic, subject));
    }

    return tasks;
  }

  // Create a reading/understanding task
  private async createReadingTask(id: number, notes: string, analysis: any, topic: string, subject: string, webResources: Resource[] = []): Promise<Task> {
    // Filter web resources for reading materials
    const readingResources = webResources.filter(resource => 
      resource.type === 'article' || resource.type === 'document' || resource.type === 'pdf'
    );

    return {
      id: id.toString(),
      title: `Review ${topic} Notes`,
      description: 'Read and understand the key concepts from your notes and additional resources',
      completed: false,
      timeEstimate: this.estimateReadingTime(analysis.wordCount),
      type: 'reading',
      difficulty: analysis.complexity,
      learningObjectives: [
        'Understand the main concepts',
        'Identify key terms and definitions',
        'Recognize important relationships',
        'Connect with additional learning materials'
      ],
      resources: [
        {
          id: `notes-${id}`,
          title: 'Your Study Notes',
          type: 'document',
          description: 'Personal notes uploaded for this topic',
          difficulty: analysis.complexity,
          source: 'Personal Notes',
          content: { text: notes }
        },
        ...readingResources.slice(0, 3) // Include up to 3 reading resources
      ]
    };
  }

  // Create learning path tasks
  private async createLearningPathTasks(startId: number, notes: string, analysis: any, topic: string, subject: string, webResources: Resource[] = []): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Filter resources by type
    const videoResources = webResources.filter(r => r.type === 'video');
    const interactiveResources = webResources.filter(r => r.type === 'interactive');
    const articleResources = webResources.filter(r => r.type === 'article' || r.type === 'document');
    
    if (analysis.hasDefinitions) {
      tasks.push({
        id: startId.toString(),
        title: 'Master Key Definitions',
        description: 'Learn and understand all important definitions and terms',
        completed: false,
        timeEstimate: '20 min',
        type: 'reading',
        difficulty: 'beginner',
        learningObjectives: ['Memorize key definitions', 'Understand terminology'],
        resources: [
          ...articleResources.slice(0, 2), // Include up to 2 article resources
          ...videoResources.slice(0, 1)   // Include 1 video resource
        ]
      });
    }

    if (analysis.hasFormulas) {
      tasks.push({
        id: (startId + 1).toString(),
        title: 'Practice Formula Application',
        description: 'Work through examples using the formulas from your notes',
        completed: false,
        timeEstimate: '30 min',
        type: 'practice',
        difficulty: 'intermediate',
        learningObjectives: ['Apply formulas correctly', 'Solve practice problems'],
        resources: [
          ...interactiveResources.slice(0, 2), // Include interactive practice resources
          ...videoResources.slice(0, 1)       // Include 1 video resource
        ]
      });
    }

    tasks.push({
      id: (startId + 2).toString(),
      title: 'Synthesize Knowledge',
      description: 'Connect different concepts and create a comprehensive understanding',
      completed: false,
      timeEstimate: '25 min',
      type: 'review',
      difficulty: 'advanced',
      learningObjectives: ['Connect related concepts', 'Create mental models'],
      resources: [
        ...articleResources.slice(0, 1), // Include 1 comprehensive article
        ...videoResources.slice(0, 1)    // Include 1 review video
      ]
    });

    return tasks;
  }

  // Create flashcard task
  private createFlashcardTask(id: number, notes: string, analysis: any, topic: string, subject: string): Task {
    return {
      id: id.toString(),
      title: `Create ${topic} Flashcards`,
      description: 'Generate flashcards for key concepts and practice memorization',
      completed: false,
      timeEstimate: '20 min',
      type: 'flashcard',
      difficulty: analysis.complexity,
      learningObjectives: [
        'Memorize key concepts',
        'Improve recall speed',
        'Identify knowledge gaps'
      ],
      resources: []
    };
  }

  // Create quiz task
  private createQuizTask(id: number, notes: string, analysis: any, topic: string, subject: string): Task {
    return {
      id: id.toString(),
      title: `Take ${topic} Practice Quiz`,
      description: 'Test your understanding with AI-generated questions based on your notes',
      completed: false,
      timeEstimate: '25 min',
      type: 'quiz',
      difficulty: analysis.complexity,
      learningObjectives: [
        'Assess understanding',
        'Identify weak areas',
        'Practice under time pressure'
      ],
      resources: []
    };
  }

  // Create contest task
  private createContestTask(id: number, notes: string, analysis: any, topic: string, subject: string): Task {
    return {
      id: id.toString(),
      title: `Join ${topic} Contest`,
      description: 'Compete with challenging problems based on your notes',
      completed: false,
      timeEstimate: '30 min',
      type: 'contest',
      difficulty: 'advanced',
      learningObjectives: [
        'Apply knowledge under pressure',
        'Solve complex problems',
        'Compete with peers'
      ],
      resources: []
    };
  }

  // Create revision plan tasks
  private createRevisionPlanTasks(startId: number, notes: string, analysis: any, topic: string, subject: string): Task[] {
    return [
      {
        id: startId.toString(),
        title: 'Create Study Schedule',
        description: 'Plan your study sessions and set realistic goals',
        completed: false,
        timeEstimate: '15 min',
        type: 'review',
        difficulty: 'beginner',
        learningObjectives: ['Plan study time', 'Set achievable goals'],
        resources: []
      },
      {
        id: (startId + 1).toString(),
        title: 'Track Progress',
        description: 'Monitor your learning progress and adjust your approach',
        completed: false,
        timeEstimate: '10 min',
        type: 'review',
        difficulty: 'beginner',
        learningObjectives: ['Monitor progress', 'Adjust learning strategy'],
        resources: []
      }
    ];
  }

  // Helper methods for content analysis
  private detectFormulas(notes: string): boolean {
    const formulaPatterns = [
      /[a-zA-Z]\s*[=<>]\s*[a-zA-Z0-9+\-*/^()\s]+/,
      /\b\w+\s*=\s*\w+/,
      /[a-zA-Z]²|[a-zA-Z]³/,
      /sqrt\(|sin\(|cos\(|tan\(/
    ];
    return formulaPatterns.some(pattern => pattern.test(notes));
  }

  private detectDefinitions(notes: string): boolean {
    const definitionPatterns = [
      /is\s+(?:a|an|the)\s+\w+/i,
      /means?\s+that/i,
      /refers?\s+to/i,
      /can\s+be\s+defined\s+as/i
    ];
    return definitionPatterns.some(pattern => pattern.test(notes));
  }

  private detectExamples(notes: string): boolean {
    const examplePatterns = [
      /for\s+example/i,
      /such\s+as/i,
      /e\.g\./i,
      /instance/i
    ];
    return examplePatterns.some(pattern => pattern.test(notes));
  }

  private detectQuestions(notes: string): boolean {
    return notes.includes('?') || /what|how|why|when|where|which|who/i.test(notes);
  }

  private assessComplexity(notes: string): 'beginner' | 'intermediate' | 'advanced' {
    const wordCount = notes.split(/\s+/).length;
    const hasFormulas = this.detectFormulas(notes);
    const hasAdvancedTerms = /theorem|proof|derivation|hypothesis|analysis/i.test(notes);

    if (wordCount > 1000 || (hasFormulas && hasAdvancedTerms)) {
      return 'advanced';
    } else if (wordCount > 500 || hasFormulas) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  private extractKeyConcepts(notes: string): string[] {
    // Simple keyword extraction - in a real implementation, this would be more sophisticated
    const words = notes.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractTopics(notes: string): string[] {
    // Extract potential topics from headers or bullet points
    const lines = notes.split('\n');
    const topics: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const topic = trimmed.replace(/^[#\-*]\s*/, '').trim();
        if (topic.length > 3) {
          topics.push(topic);
        }
      }
    });

    return topics.slice(0, 5);
  }

  private estimateReadingTime(wordCount: number): string {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${Math.max(5, minutes)} min`;
  }

  private calculateEstimatedDuration(tasks: Task[]): string {
    const totalMinutes = tasks.reduce((total, task) => {
      const timeStr = task.timeEstimate.toLowerCase();
      const minutes = parseInt(timeStr) || 0;
      return total + minutes;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  private determineOverallDifficulty(analysis: any): 'beginner' | 'intermediate' | 'advanced' {
    return analysis.complexity;
  }

  private capitalizeWords(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

export const aiContentGenerator = new AIContentGenerator();
