import { LearningGoal } from "@/components/dashboard/GoalSelection";

export interface LearningResource {
  id: string;
  type: 'text' | 'pdf' | 'video' | 'link' | 'interactive';
  title: string;
  content?: string; // Full text content for text resources
  url?: string; // For videos, links, PDFs
  duration?: string; // For videos
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  thumbnail?: string;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  learningObjectives: (string | { title: string; preview: string; })[];
  resources: LearningResource[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  progress: number; // 0-100
}

export interface LearningPath {
  id: string;
  topic: string;
  subject: string;
  description: string;
  steps: LearningStep[];
  totalEstimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

class AILearningPathGenerator {
  generateLearningPath(notes: string, goals: LearningGoal[], userTopic?: string): LearningPath {
    const analysis = this.analyzeNotes(notes);
    const topic = this.extractTopic(notes, userTopic);
    const subject = this.determineSubject(notes, topic);
    
    const steps = this.generateLearningSteps(notes, topic, subject, analysis);
    
    const totalTime = this.calculateTotalTime(steps);
    
    return {
      id: `path-${Date.now()}`,
      topic,
      subject,
      description: `Guided learning pathway to master ${topic} with curated resources and step-by-step progression`,
      steps,
      totalEstimatedTime: totalTime,
      difficulty: this.determineOverallDifficulty(steps),
      createdAt: new Date()
    };
  }

  private analyzeNotes(notes: string) {
    const lowerNotes = notes.toLowerCase();
    return {
      hasFormulas: lowerNotes.includes('formula') || lowerNotes.includes('equation'),
      hasDefinitions: lowerNotes.includes('definition') || lowerNotes.includes('define'),
      hasExamples: lowerNotes.includes('example') || lowerNotes.includes('for instance'),
      hasProblems: lowerNotes.includes('problem') || lowerNotes.includes('solve'),
      complexity: this.assessComplexity(notes),
      keyConcepts: this.extractKeyConcepts(notes)
    };
  }

  private extractTopic(notes: string, userTopic?: string): string {
    if (userTopic) return userTopic;
    
    // Simple topic extraction logic
    if (notes.toLowerCase().includes('quadratic')) return 'Quadratic Equations';
    if (notes.toLowerCase().includes('newton') || notes.toLowerCase().includes('force')) return "Newton's Laws";
    if (notes.toLowerCase().includes('periodic table') || notes.toLowerCase().includes('element')) return 'Periodic Table';
    
    return 'Study Topic';
  }

  private determineSubject(notes: string, topic: string): string {
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('equation') || lowerNotes.includes('formula') || lowerNotes.includes('algebra')) {
      return 'Mathematics';
    } else if (lowerNotes.includes('force') || lowerNotes.includes('motion') || lowerNotes.includes('physics')) {
      return 'Physics';
    } else if (lowerNotes.includes('element') || lowerNotes.includes('chemistry') || lowerNotes.includes('compound')) {
      return 'Chemistry';
    }
    return 'General';
  }

  private assessComplexity(notes: string): 'beginner' | 'intermediate' | 'advanced' {
    const wordCount = notes.split(' ').length;
    const lowerNotes = notes.toLowerCase();
    
    if (wordCount < 200) return 'beginner';
    if (wordCount > 1000 && (lowerNotes.includes('advanced') || lowerNotes.includes('complex'))) {
      return 'advanced';
    }
    return 'intermediate';
  }

  private extractKeyConcepts(notes: string): string[] {
    // Simple key concept extraction
    const concepts = [];
    if (notes.toLowerCase().includes('quadratic')) concepts.push('Quadratic Equations', 'Discriminant', 'Quadratic Formula');
    if (notes.toLowerCase().includes('newton')) concepts.push("Newton's Laws", 'Force', 'Motion', 'Inertia');
    if (notes.toLowerCase().includes('periodic')) concepts.push('Periodic Table', 'Elements', 'Atomic Structure');
    return concepts;
  }

  private generateLearningSteps(notes: string, topic: string, subject: string, analysis: any): LearningStep[] {
    const steps: LearningStep[] = [];
    
    // Step 1: Foundation Understanding
    steps.push({
      id: 'step-1',
      title: 'Foundation: Understanding Core Concepts',
      description: `Build a solid foundation by understanding the fundamental concepts of ${topic}`,
      order: 1,
      prerequisites: [],
      learningObjectives: [
        `Define key terms and concepts in ${topic}`,
        `Understand the basic principles underlying ${topic}`,
        `Identify the main components of ${topic}`
      ],
      resources: this.generateFoundationResources(topic, subject, analysis),
      estimatedTime: '30-45 min',
      difficulty: 'beginner',
      completed: false,
      progress: 0
    });

    // Step 2: Deep Dive
    steps.push({
      id: 'step-2',
      title: 'Deep Dive: Exploring Advanced Concepts',
      description: `Dive deeper into the more complex aspects and applications of ${topic}`,
      order: 2,
      prerequisites: ['step-1'],
      learningObjectives: [
        `Apply ${topic} concepts to solve problems`,
        `Understand the relationships between different aspects of ${topic}`,
        `Analyze real-world applications of ${topic}`
      ],
      resources: this.generateDeepDiveResources(topic, subject, analysis),
      estimatedTime: '45-60 min',
      difficulty: 'intermediate',
      completed: false,
      progress: 0
    });

    // Step 3: Application & Practice
    steps.push({
      id: 'step-3',
      title: 'Application: Practice and Mastery',
      description: `Apply your knowledge through practice problems and real-world scenarios`,
      order: 3,
      prerequisites: ['step-1', 'step-2'],
      learningObjectives: [
        `Solve complex problems using ${topic} knowledge`,
        `Apply ${topic} concepts in various contexts`,
        `Demonstrate mastery of ${topic}`
      ],
      resources: this.generateApplicationResources(topic, subject, analysis),
      estimatedTime: '60-90 min',
      difficulty: 'advanced',
      completed: false,
      progress: 0
    });

    return steps;
  }

  private generateFoundationResources(topic: string, subject: string, analysis: any): LearningResource[] {
    const resources: LearningResource[] = [];

    // Interactive Text Resource
    resources.push({
      id: 'foundation-text-1',
      type: 'text',
      title: `${topic} Fundamentals: Complete Guide`,
      content: this.generateFoundationText(topic, analysis),
      description: `Comprehensive guide covering the fundamental concepts of ${topic}`,
      difficulty: 'beginner',
      estimatedTime: '20-25 min'
    });

    // Video Resource
    resources.push({
      id: 'foundation-video-1',
      type: 'video',
      title: `Understanding ${topic}: Visual Explanation`,
      url: `https://example.com/videos/${topic.toLowerCase().replace(/\s+/g, '-')}-fundamentals`,
      duration: '15 min',
      description: `Visual explanation of ${topic} concepts with animations and examples`,
      difficulty: 'beginner',
      estimatedTime: '15 min',
      thumbnail: `https://example.com/thumbnails/${topic.toLowerCase().replace(/\s+/g, '-')}-video.jpg`
    });

    // Interactive Resource
    resources.push({
      id: 'foundation-interactive-1',
      type: 'interactive',
      title: `${topic} Concept Explorer`,
      url: `https://example.com/interactive/${topic.toLowerCase().replace(/\s+/g, '-')}-explorer`,
      description: `Interactive tool to explore and visualize ${topic} concepts`,
      difficulty: 'beginner',
      estimatedTime: '10 min'
    });

    return resources;
  }

  private generateDeepDiveResources(topic: string, subject: string, analysis: any): LearningResource[] {
    const resources: LearningResource[] = [];

    // PDF Resource
    resources.push({
      id: 'deepdive-pdf-1',
      type: 'pdf',
      title: `Advanced ${topic}: Detailed Analysis`,
      url: `https://example.com/pdfs/${topic.toLowerCase().replace(/\s+/g, '-')}-advanced.pdf`,
      description: `Detailed PDF guide covering advanced concepts and applications of ${topic}`,
      difficulty: 'intermediate',
      estimatedTime: '25-30 min'
    });

    // Video Resource
    resources.push({
      id: 'deepdive-video-1',
      type: 'video',
      title: `${topic} in Practice: Real-World Applications`,
      url: `https://example.com/videos/${topic.toLowerCase().replace(/\s+/g, '-')}-applications`,
      duration: '20 min',
      description: `See how ${topic} is applied in real-world scenarios and case studies`,
      difficulty: 'intermediate',
      estimatedTime: '20 min',
      thumbnail: `https://example.com/thumbnails/${topic.toLowerCase().replace(/\s+/g, '-')}-applications.jpg`
    });

    // Link Resource
    resources.push({
      id: 'deepdive-link-1',
      type: 'link',
      title: `${topic} Research Papers and Studies`,
      url: `https://example.com/research/${topic.toLowerCase().replace(/\s+/g, '-')}`,
      description: `Collection of research papers and studies related to ${topic}`,
      difficulty: 'intermediate',
      estimatedTime: '15 min'
    });

    return resources;
  }

  private generateApplicationResources(topic: string, subject: string, analysis: any): LearningResource[] {
    const resources: LearningResource[] = [];

    // Interactive Practice
    resources.push({
      id: 'application-interactive-1',
      type: 'interactive',
      title: `${topic} Problem Solver`,
      url: `https://example.com/practice/${topic.toLowerCase().replace(/\s+/g, '-')}-problems`,
      description: `Interactive problem-solving environment with ${topic} challenges`,
      difficulty: 'advanced',
      estimatedTime: '30-40 min'
    });

    // Video Resource
    resources.push({
      id: 'application-video-1',
      type: 'video',
      title: `Mastering ${topic}: Expert Techniques`,
      url: `https://example.com/videos/${topic.toLowerCase().replace(/\s+/g, '-')}-mastery`,
      duration: '25 min',
      description: `Expert techniques and advanced problem-solving strategies for ${topic}`,
      difficulty: 'advanced',
      estimatedTime: '25 min',
      thumbnail: `https://example.com/thumbnails/${topic.toLowerCase().replace(/\s+/g, '-')}-mastery.jpg`
    });

    // Comprehensive Text
    resources.push({
      id: 'application-text-1',
      type: 'text',
      title: `${topic} Mastery: Complete Practice Guide`,
      content: this.generateApplicationText(topic, analysis),
      description: `Comprehensive practice guide with problems and solutions for ${topic}`,
      difficulty: 'advanced',
      estimatedTime: '35-45 min'
    });

    return resources;
  }

  private generateFoundationText(topic: string, analysis: any): string {
    return `# ${topic} Fundamentals

## Introduction
Welcome to your comprehensive guide to understanding ${topic}. This resource will help you build a solid foundation in the core concepts.

## Key Concepts
${analysis.keyConcepts.map(concept => `- ${concept}`).join('\n')}

## Core Principles
Understanding ${topic} requires grasping these fundamental principles:

1. **Basic Definition**: ${topic} is a fundamental concept that...
2. **Key Components**: The main elements include...
3. **Important Relationships**: These concepts work together by...

## Examples and Applications
Let's look at some basic examples:
- Example 1: [Detailed explanation]
- Example 2: [Step-by-step breakdown]
- Example 3: [Common applications]

## Practice Questions
Test your understanding with these foundational questions:
1. Define the main concept of ${topic}
2. Identify the key components
3. Explain how the components work together

## Summary
You've now covered the fundamental concepts of ${topic}. Make sure you understand these basics before moving to more advanced topics.`;
  }

  private generateApplicationText(topic: string, analysis: any): string {
    return `# ${topic} Mastery: Advanced Practice

## Advanced Problem Solving
Now that you understand the fundamentals, let's tackle more complex problems and applications.

## Complex Scenarios
1. **Scenario A**: [Detailed problem with solution]
2. **Scenario B**: [Multi-step problem]
3. **Scenario C**: [Real-world application]

## Problem-Solving Strategies
- Strategy 1: [Detailed approach]
- Strategy 2: [Alternative method]
- Strategy 3: [Expert techniques]

## Practice Problems
Work through these advanced problems:
1. [Complex problem with step-by-step solution]
2. [Multi-part question]
3. [Real-world case study]

## Mastery Checklist
- [ ] Can solve basic problems confidently
- [ ] Can apply concepts to new situations
- [ ] Can explain concepts to others
- [ ] Can identify when to use different approaches

## Next Steps
Congratulations! You've mastered ${topic}. Consider exploring related topics or applying your knowledge to new challenges.`;
  }

  private calculateTotalTime(steps: LearningStep[]): string {
    const totalMinutes = steps.reduce((total, step) => {
      const timeStr = step.estimatedTime;
      const match = timeStr.match(/(\d+)-(\d+)\s*min/);
      if (match) {
        const avgTime = (parseInt(match[1]) + parseInt(match[2])) / 2;
        return total + avgTime;
      }
      return total;
    }, 0);

    if (totalMinutes > 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      return `${hours}h ${minutes}min`;
    }
    return `${Math.round(totalMinutes)} min`;
  }

  private determineOverallDifficulty(steps: LearningStep[]): 'beginner' | 'intermediate' | 'advanced' {
    const difficulties = steps.map(step => step.difficulty);
    if (difficulties.includes('advanced')) return 'advanced';
    if (difficulties.includes('intermediate')) return 'intermediate';
    return 'beginner';
  }
}

export const aiLearningPathGenerator = new AILearningPathGenerator();
