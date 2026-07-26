import { Task, Resource } from "@/types/task";
import { groqApiService } from "./groqApiService";
import { profileAwareAI } from "./profileAwareAI";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  source: string; // which resource this came from
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  source: string;
  subjectAlignment?: string;
  goalAlignment?: string;
}

export interface ContestProblem {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  points: number;
  category: string;
  source: string;
}

class AIResourceService {
  // Generate AI resources for a task based on its type
  async generateTaskResources(task: any): Promise<Resource[]> {
    console.log('=== GENERATING TASK RESOURCES ===');
    console.log('Task type:', task.type);
    console.log('Task has originalNotes:', !!(task as any).originalNotes);
    console.log('Original notes length:', (task as any).originalNotes ? (task as any).originalNotes.length : 'undefined');
    
    const resources: Resource[] = [];
    
    // Generate resources based on task type
    if (task.type === 'quiz') {
      const quizQuestions = await this.generateQuizQuestions(task);
      resources.push({
        id: `quiz-${task.id}`,
        title: `${task.title} - Quiz`,
        type: 'quiz',
        description: `AI-generated quiz with ${quizQuestions.length} questions based on ${task.title}`,
        difficulty: task.difficulty,
        source: 'AI Generated',
        content: {
          questions: quizQuestions,
          timeLimit: this.getTimeLimitForTask(task),
          totalQuestions: quizQuestions.length
        }
      });
    }
    
    if (task.type === 'flashcard') {
      const flashcards = await this.generateFlashcards(task);
      resources.push({
        id: `flashcards-${task.id}`,
        title: `${task.title} - Flashcards`,
        type: 'flashcard',
        description: `AI-generated flashcard set with ${flashcards.length} cards for ${task.title}`,
        difficulty: task.difficulty,
        source: 'AI Generated',
        content: {
          flashcards: flashcards,
          totalCards: flashcards.length
        }
      });
    }
    
    if (task.type === 'contest') {
      const contestProblems = await this.generateContestProblems(task);
      resources.push({
        id: `contest-${task.id}`,
        title: `${task.title} - Contest`,
        type: 'contest',
        description: `AI-generated contest with ${contestProblems.length} problems for ${task.title}`,
        difficulty: task.difficulty,
        source: 'AI Generated',
        content: {
          problems: contestProblems,
          timeLimit: this.getTimeLimitForTask(task),
          totalProblems: contestProblems.length,
          rules: this.getContestRules(task)
        }
      });
    }
    
    return resources;
  }

  // Generate flashcards from task resources and learning objectives
  async generateFlashcards(task: Task): Promise<Flashcard[]> {
    console.log('generateFlashcards called with task:', task);
    console.log('task.learningObjectives:', task.learningObjectives);
    console.log('typeof task.learningObjectives:', typeof task.learningObjectives);
    console.log('Array.isArray(task.learningObjectives):', Array.isArray(task.learningObjectives));
    
    try {
      // Use profile-aware AI to generate personalized flashcards
      const learningObjectives = task.learningObjectives && Array.isArray(task.learningObjectives) 
        ? task.learningObjectives.join(', ') 
        : 'General learning objectives';
      console.log('Processed learningObjectives:', learningObjectives);
      
      // Use original notes if available, otherwise fall back to task description
      const originalNotes = (task as any).originalNotes;
      const notes = originalNotes || `${task.title}: ${task.description}. Learning objectives: ${learningObjectives}`;
      
      console.log('Using original notes:', !!originalNotes);
      console.log('Notes length:', notes.length);
      console.log('Final notes for AI:', notes.substring(0, 300) + '...');
      const apiFlashcards = await profileAwareAI.generatePersonalizedFlashcards(notes, task.title);
      console.log('Profile-Aware AI returned flashcards:', apiFlashcards);
      console.log('Number of flashcards returned:', apiFlashcards ? apiFlashcards.length : 'undefined');
      
      return apiFlashcards.map((card, index) => ({
        id: `flashcard-${task.id}-${index}`,
        front: card.front,
        back: card.back,
        difficulty: this.getDifficultyFromTask(card.difficulty),
        category: task.type,
        source: 'Profile-Aware AI Generated'
      }));
    } catch (error) {
      console.error('Error generating flashcards with Profile-Aware AI:', error);
      // Fallback to standard Groq API
      try {
        const learningObjectives = task.learningObjectives && Array.isArray(task.learningObjectives) 
          ? task.learningObjectives.join(', ') 
          : 'General learning objectives';
        
        // Use original notes if available, otherwise fall back to task description
        const originalNotes = (task as any).originalNotes;
        const notes = originalNotes || `${task.title}: ${task.description}. Learning objectives: ${learningObjectives}`;
        
        console.log('Flashcard fallback - Using original notes:', !!originalNotes);
        const apiFlashcards = await groqApiService.generateFlashcards(notes, task.title);
        
        return apiFlashcards.map((card, index) => ({
          id: `flashcard-${task.id}-${index}`,
          front: card.front,
          back: card.back,
          difficulty: this.getDifficultyFromTask(card.difficulty),
          category: task.type,
          source: 'AI Generated'
        }));
      } catch (fallbackError) {
        console.error('Fallback also failed, using mock flashcards:', fallbackError);
        return this.generateMockFlashcards(task);
      }
    }
  }

  private generateMockFlashcards(task: Task): Flashcard[] {
    const flashcards: Flashcard[] = [];
    
    // Generate flashcards based on learning objectives
    if (task.learningObjectives && Array.isArray(task.learningObjectives)) {
      task.learningObjectives.forEach((objective, index) => {
        flashcards.push({
          id: `obj-${task.id}-${index}`,
          front: `What is the key concept: ${objective.split(' ').slice(0, 3).join(' ')}?`,
          back: objective,
          difficulty: this.getDifficultyFromTask(task.difficulty),
          category: task.type,
          source: 'Learning Objective'
        });
      });
    }

    // Generate flashcards based on resources
    task.resources.forEach((resource, index) => {
      if (resource.type === 'video' || resource.type === 'article') {
        flashcards.push({
          id: `res-${task.id}-${index}`,
          front: `Key concept from ${resource.source}: ${resource.title}`,
          back: resource.description,
          difficulty: this.getDifficultyFromResource(resource.difficulty),
          category: resource.type,
          source: resource.source
        });
      }
    });

    // Generate subject-specific flashcards
    if (task.title.toLowerCase().includes('quadratic')) {
      flashcards.push(
        {
          id: `quad-${task.id}-1`,
          front: 'What is the standard form of a quadratic equation?',
          back: 'ax² + bx + c = 0, where a ≠ 0',
          difficulty: 'easy',
          category: 'formula',
          source: 'AI Generated'
        },
        {
          id: `quad-${task.id}-2`,
          front: 'What is the quadratic formula?',
          back: 'x = (-b ± √(b² - 4ac)) / 2a',
          difficulty: 'medium',
          category: 'formula',
          source: 'AI Generated'
        },
        {
          id: `quad-${task.id}-3`,
          front: 'What does the discriminant tell us?',
          back: 'b² - 4ac determines the nature of roots: positive = 2 real roots, zero = 1 real root, negative = no real roots',
          difficulty: 'medium',
          category: 'concept',
          source: 'AI Generated'
        }
      );
    }

    if (task.title.toLowerCase().includes('newton')) {
      flashcards.push(
        {
          id: `newton-${task.id}-1`,
          front: 'What is Newton\'s First Law?',
          back: 'An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force',
          difficulty: 'easy',
          category: 'law',
          source: 'AI Generated'
        },
        {
          id: `newton-${task.id}-2`,
          front: 'What is inertia?',
          back: 'The tendency of an object to resist changes in its state of motion',
          difficulty: 'medium',
          category: 'concept',
          source: 'AI Generated'
        }
      );
    }

    if (task.title.toLowerCase().includes('periodic')) {
      flashcards.push(
        {
          id: `periodic-${task.id}-1`,
          front: 'What are periodic trends?',
          back: 'Patterns in properties of elements that repeat across periods and groups in the periodic table',
          difficulty: 'easy',
          category: 'concept',
          source: 'AI Generated'
        },
        {
          id: `periodic-${task.id}-2`,
          front: 'How does atomic radius change across a period?',
          back: 'Atomic radius decreases from left to right across a period due to increasing nuclear charge',
          difficulty: 'medium',
          category: 'trend',
          source: 'AI Generated'
        }
      );
    }

    return flashcards;
  }

  // Generate quiz questions from task resources and learning objectives with profile context
  async generateQuizQuestions(task: Task): Promise<QuizQuestion[]> {
    try {
      // Use profile-aware AI to generate personalized quiz questions
      const learningObjectives = task.learningObjectives && Array.isArray(task.learningObjectives) 
        ? task.learningObjectives.join(', ') 
        : 'General learning objectives';
      
      // Use original notes if available, otherwise fall back to task description
      const originalNotes = (task as any).originalNotes;
      const notes = originalNotes || `${task.title}: ${task.description}. Learning objectives: ${learningObjectives}`;
      
      console.log('Quiz generation - Using original notes:', !!originalNotes);
      const apiQuestions = await profileAwareAI.generatePersonalizedQuizQuestions(notes, task.title);
      
      return apiQuestions.map((q, index) => ({
        id: `quiz-${task.id}-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: this.getDifficultyFromTask(q.difficulty),
        category: task.type,
        source: 'Profile-Aware AI Generated',
        subjectAlignment: q.subjectAlignment || task.type,
        goalAlignment: q.goalAlignment || 'General Learning'
      }));
    } catch (error) {
      console.error('Error generating quiz questions with Profile-Aware AI:', error);
      // Fallback to standard Groq API
      try {
        const learningObjectives = task.learningObjectives && Array.isArray(task.learningObjectives) 
          ? task.learningObjectives.join(', ') 
          : 'General learning objectives';
        
        // Use original notes if available, otherwise fall back to task description
        const originalNotes = (task as any).originalNotes;
        const notes = originalNotes || `${task.title}: ${task.description}. Learning objectives: ${learningObjectives}`;
        
        console.log('Quiz fallback - Using original notes:', !!originalNotes);
        const apiQuestions = await groqApiService.generateQuizQuestions(notes, task.title);
        
        return apiQuestions.map((q, index) => ({
          id: `quiz-${task.id}-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: this.getDifficultyFromTask(q.difficulty),
          category: task.type,
          source: 'AI Generated'
        }));
      } catch (fallbackError) {
        console.error('Fallback also failed, using mock questions:', fallbackError);
        // Final fallback to mock questions
        return this.generateMockQuizQuestions(task);
      }
    }
  }

  private generateMockQuizQuestions(task: Task): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    // Generate questions based on learning objectives
    task.learningObjectives.forEach((objective, index) => {
      if (objective.toLowerCase().includes('understand')) {
        questions.push({
          id: `obj-q-${task.id}-${index}`,
          question: `Which of the following best describes: ${objective}?`,
          options: [
            'A fundamental concept in the subject',
            'A complex mathematical formula',
            'A simple memorization task',
            'An advanced research topic'
          ],
          correctAnswer: 0,
          explanation: `This question tests your understanding of: ${objective}`,
          difficulty: this.getDifficultyFromTask(task.difficulty),
          category: 'understanding',
          source: 'Learning Objective'
        });
      }
    });

    // Generate subject-specific questions
    if (task.title.toLowerCase().includes('quadratic')) {
      questions.push(
        {
          id: `quad-q-${task.id}-1`,
          question: 'What is the solution to the quadratic equation x² - 5x + 6 = 0?',
          options: ['x = 2, x = 3', 'x = -2, x = -3', 'x = 1, x = 6', 'x = -1, x = -6'],
          correctAnswer: 0,
          explanation: 'Using factoring: (x-2)(x-3) = 0, so x = 2 or x = 3',
          difficulty: 'medium',
          category: 'solving',
          source: 'AI Generated'
        },
        {
          id: `quad-q-${task.id}-2`,
          question: 'What is the discriminant of the equation 2x² + 3x - 1 = 0?',
          options: ['17', '1', '9', '25'],
          correctAnswer: 0,
          explanation: 'Discriminant = b² - 4ac = 3² - 4(2)(-1) = 9 + 8 = 17',
          difficulty: 'hard',
          category: 'discriminant',
          source: 'AI Generated'
        }
      );
    }

    if (task.title.toLowerCase().includes('newton')) {
      questions.push(
        {
          id: `newton-q-${task.id}-1`,
          question: 'A book is at rest on a table. According to Newton\'s First Law, what keeps it at rest?',
          options: [
            'The table exerts an upward force equal to the book\'s weight',
            'The book has no forces acting on it',
            'Gravity is not acting on the book',
            'The book is too heavy to move'
          ],
          correctAnswer: 0,
          explanation: 'The book is at rest because the normal force from the table balances the gravitational force',
          difficulty: 'medium',
          category: 'application',
          source: 'AI Generated'
        }
      );
    }

    if (task.title.toLowerCase().includes('periodic')) {
      questions.push(
        {
          id: `periodic-q-${task.id}-1`,
          question: 'Which element has the largest atomic radius in Period 2?',
          options: ['Lithium (Li)', 'Fluorine (F)', 'Neon (Ne)', 'Carbon (C)'],
          correctAnswer: 0,
          explanation: 'Lithium has the largest atomic radius in Period 2 because atomic radius decreases from left to right',
          difficulty: 'medium',
          category: 'trends',
          source: 'AI Generated'
        }
      );
    }

    return questions;
  }

  // Generate contest problems from task resources
  async generateContestProblems(task: Task): Promise<ContestProblem[]> {
    try {
      // Use real Groq API to generate contest problems
      const learningObjectives = task.learningObjectives && Array.isArray(task.learningObjectives) 
        ? task.learningObjectives.join(', ') 
        : 'General learning objectives';
      const notes = `${task.title}: ${task.description}. Learning objectives: ${learningObjectives}`;
      const apiProblems = await groqApiService.generateContestProblems(notes, task.title);
      
      return apiProblems.map((p, index) => ({
        id: `contest-${task.id}-${index}`,
        title: `${task.title} Problem ${index + 1}`,
        description: 'AI-generated contest problem',
        problem: p.problem,
        solution: p.solution,
        hints: ['Think about the key concepts', 'Apply the principles you learned', 'Break down the problem step by step'],
        difficulty: this.getDifficultyFromTask(p.difficulty),
        timeLimit: parseInt(p.timeLimit) || 15,
        points: p.points || 20,
        category: task.type,
        source: 'AI Generated'
      }));
    } catch (error) {
      console.error('Error generating contest problems with Groq API:', error);
      // Fallback to mock problems
      return this.generateMockContestProblems(task);
    }
  }

  private generateMockContestProblems(task: Task): ContestProblem[] {
    const problems: ContestProblem[] = [];

    if (task.title.toLowerCase().includes('quadratic')) {
      problems.push(
        {
          id: `quad-contest-${task.id}-1`,
          title: 'Quadratic Formula Challenge',
          description: 'Solve this quadratic equation using the quadratic formula',
          problem: 'Find all real solutions to the equation: 3x² - 7x + 2 = 0',
          solution: 'Using the quadratic formula: x = (7 ± √(49-24))/6 = (7 ± 5)/6, so x = 2 or x = 1/3',
          hints: [
            'Identify the coefficients: a=3, b=-7, c=2',
            'Apply the quadratic formula: x = (-b ± √(b²-4ac))/(2a)',
            'Calculate the discriminant first: b²-4ac = 49-24 = 25'
          ],
          difficulty: 'medium',
          timeLimit: 10,
          points: 20,
          category: 'solving',
          source: 'AI Generated'
        },
        {
          id: `quad-contest-${task.id}-2`,
          title: 'Discriminant Analysis',
          description: 'Analyze the nature of roots without solving',
          problem: 'Without solving, determine the nature of roots for: x² + 4x + 5 = 0',
          solution: 'Discriminant = 16 - 20 = -4 < 0, so there are no real roots (two complex conjugate roots)',
          hints: [
            'Calculate the discriminant: b² - 4ac',
            'If discriminant > 0: two real roots',
            'If discriminant = 0: one real root',
            'If discriminant < 0: no real roots'
          ],
          difficulty: 'easy',
          timeLimit: 5,
          points: 15,
          category: 'analysis',
          source: 'AI Generated'
        }
      );
    }

    if (task.title.toLowerCase().includes('newton')) {
      problems.push(
        {
          id: `newton-contest-${task.id}-1`,
          title: 'Force Analysis Problem',
          description: 'Apply Newton\'s First Law to solve this problem',
          problem: 'A 5kg box is at rest on a horizontal surface. If the coefficient of static friction is 0.3, what is the minimum force needed to start moving the box?',
          solution: 'F_min = μ_s × N = μ_s × mg = 0.3 × 5 × 9.8 = 14.7 N',
          hints: [
            'The box is at rest, so forces are balanced',
            'Normal force N = mg',
            'Maximum static friction = μ_s × N',
            'Minimum force needed = maximum static friction'
          ],
          difficulty: 'medium',
          timeLimit: 15,
          points: 25,
          category: 'application',
          source: 'AI Generated'
        }
      );
    }

    if (task.title.toLowerCase().includes('periodic')) {
      problems.push(
        {
          id: `periodic-contest-${task.id}-1`,
          title: 'Periodic Trends Challenge',
          description: 'Compare properties of elements using periodic trends',
          problem: 'Arrange these elements in order of increasing atomic radius: Na, Mg, Al, Si, P',
          solution: 'P < Si < Al < Mg < Na (atomic radius decreases from left to right across a period)',
          hints: [
            'All elements are in the same period (Period 3)',
            'Atomic radius decreases from left to right',
            'Consider the effective nuclear charge',
            'More protons = stronger attraction = smaller radius'
          ],
          difficulty: 'medium',
          timeLimit: 8,
          points: 20,
          category: 'trends',
          source: 'AI Generated'
        }
      );
    }

    return problems;
  }

  private getDifficultyFromTask(difficulty: string): 'easy' | 'medium' | 'hard' {
    switch (difficulty) {
      case 'beginner': return 'easy';
      case 'intermediate': return 'medium';
      case 'advanced': return 'hard';
      default: return 'medium';
    }
  }

  private getDifficultyFromResource(difficulty: string): 'easy' | 'medium' | 'hard' {
    switch (difficulty) {
      case 'beginner': return 'easy';
      case 'intermediate': return 'medium';
      case 'advanced': return 'hard';
      default: return 'medium';
    }
  }

  private getTimeLimitForTask(task: Task): number {
    // Parse time estimate and return in minutes
    const timeStr = task.timeEstimate.toLowerCase();
    if (timeStr.includes('min')) {
      return parseInt(timeStr) || 15;
    }
    if (timeStr.includes('hour')) {
      return (parseInt(timeStr) || 1) * 60;
    }
    return 15; // default 15 minutes
  }

  private getContestRules(task: Task): string[] {
    const baseRules = [
      "Complete all problems within the time limit",
      "Use the provided hints if needed",
      "Submit your answers when ready",
      "Review explanations after completion"
    ];

    if (task.type === 'contest') {
      baseRules.unshift("Each problem has a specific time limit based on difficulty");
      baseRules.push("Top performers will be ranked on the leaderboard");
    }

    return baseRules;
  }
}

export const aiResourceService = new AIResourceService();
