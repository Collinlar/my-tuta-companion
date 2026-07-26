import { groqApiService } from './groqApiService';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface ContestChallenge {
  id: string;
  question: string;
  answer: string;
  timeLimit: number; // in seconds
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'video' | 'practice' | 'quiz' | 'project';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources: string[];
  prerequisites?: string[];
}

export interface StudyToolsContent {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  contest: ContestChallenge[];
  learningPath: LearningPathItem[];
}

export class StudyToolsGenerator {
  async generateFlashcards(topic: string, subject: string, count: number = 20): Promise<Flashcard[]> {
    console.log(`🃏 Generating ${count} flashcards for ${topic}`);
    
    try {
      const prompt = `Generate ${count} educational flashcards for the topic "${topic}" in ${subject}.

Each flashcard should have:
- Front: A question, term, or concept
- Back: A clear, concise answer or explanation
- Difficulty: easy, medium, or hard
- Category: A relevant category (optional)

Format as JSON array:
[
  {
    "id": "card1",
    "front": "What is a quadratic equation?",
    "back": "A polynomial equation of degree 2, typically in the form ax² + bx + c = 0",
    "difficulty": "easy",
    "category": "Definitions"
  }
]

Make the flashcards educational, accurate, and appropriate for students.`;

      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert educational content creator. Generate high-quality flashcards that help students learn effectively.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const response = await groqApiService.makeRequest(messages);
      const flashcards = this.parseFlashcardsResponse(response, count);
      
      console.log(`✅ Generated ${flashcards.length} flashcards`);
      return flashcards;

    } catch (error) {
      console.error('Error generating flashcards:', error);
      return this.createFallbackFlashcards(topic, count);
    }
  }

  async generateQuiz(topic: string, subject: string, count: number = 20): Promise<QuizQuestion[]> {
    console.log(`🧠 Generating ${count} quiz questions for ${topic}`);
    
    // Try up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 Retry attempt ${attempt} for quiz generation...`);
        }
      const prompt = `You must generate EXACTLY ${count} quiz questions specifically about "${topic}" in the subject of ${subject}.

CRITICAL: Return ONLY valid JSON array, no other text. Each question MUST be directly related to ${topic}.

Required format:
[
  {
    "id": "q1",
    "question": "What is the standard form of a quadratic equation?",
    "options": ["ax² + bx + c = 0", "y = mx + b", "x² = y", "ax + b = c"],
    "correctAnswer": 0,
    "explanation": "The standard form is ax² + bx + c = 0 where a ≠ 0.",
    "difficulty": "easy",
    "category": "Basic Concepts"
  },
  {
    "id": "q2",
    "question": "What is the discriminant of a quadratic equation ax² + bx + c = 0?",
    "options": ["b² - 4ac", "b² + 4ac", "-b ± √(b² - 4ac)", "2a"],
    "correctAnswer": 0,
    "explanation": "The discriminant is b² - 4ac, which determines the nature of roots.",
    "difficulty": "medium",
    "category": "Discriminant"
  }
]

Rules:
1. ALL questions must be about ${topic} specifically
2. Include mix of easy (30%), medium (50%), hard (20%) questions
3. Return ONLY the JSON array, nothing else
4. Ensure all JSON is properly formatted`;

      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert educational assessment creator. You MUST generate topic-specific quiz questions in valid JSON format ONLY. Do not include any explanatory text, markdown, or commentary - ONLY the JSON array.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      console.log('📤 Sending quiz generation request to AI...');
      const response = await groqApiService.makeRequest(messages);
      console.log('📥 AI Response received:', response.substring(0, 200) + '...');
      
      const quiz = this.parseQuizResponse(response, count);
      
      if (quiz.length === 0 || quiz[0].question.includes('question 1')) {
        console.warn('⚠️ Parsed quiz seems invalid, retrying...');
        throw new Error('Invalid quiz parsed');
      }
      
        console.log(`✅ Generated ${quiz.length} quiz questions`);
        console.log('First question:', quiz[0].question);
        return quiz;

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        if (attempt === 2) {
          console.error('All attempts failed. Falling back to placeholder content');
          return this.createFallbackQuiz(topic, count);
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Should never reach here, but just in case
    return this.createFallbackQuiz(topic, count);
  }

  async generateContest(topic: string, subject: string, count: number = 10): Promise<ContestChallenge[]> {
    console.log(`🏆 Generating ${count} contest challenges for ${topic}`);
    
    try {
      const prompt = `Generate ${count} timed contest challenges for the topic "${topic}" in ${subject}.

Each challenge should have:
- question: A problem or question to solve quickly
- answer: The correct answer
- timeLimit: Time limit in seconds (30-120)
- points: Points awarded (10-50)
- difficulty: easy, medium, or hard

Format as JSON array:
[
  {
    "id": "challenge1",
    "question": "Solve: x² - 5x + 6 = 0",
    "answer": "x = 2 or x = 3",
    "timeLimit": 60,
    "points": 20,
    "difficulty": "medium"
  }
]

Make challenges quick to solve but educational.`;

      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert educational game designer. Create engaging, timed challenges that test speed and accuracy.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const response = await groqApiService.makeRequest(messages);
      const contest = this.parseContestResponse(response, count);
      
      console.log(`✅ Generated ${contest.length} contest challenges`);
      return contest;

    } catch (error) {
      console.error('Error generating contest:', error);
      return this.createFallbackContest(topic, count);
    }
  }

  async generateLearningPath(topic: string, subject: string, count: number = 10): Promise<LearningPathItem[]> {
    console.log(`📖 Generating ${count} learning path items for ${topic}`);
    
    try {
      const prompt = `Generate ${count} learning path items for mastering "${topic}" in ${subject}.

Each item should have:
- title: Clear, engaging title
- description: Brief description of what students will learn
- type: reading, video, practice, quiz, or project
- duration: Estimated time (e.g., "15 minutes", "1 hour")
- difficulty: beginner, intermediate, or advanced
- resources: List of suggested resources
- prerequisites: Any prerequisites (optional)

Format as JSON array:
[
  {
    "id": "path1",
    "title": "Understanding Quadratic Functions",
    "description": "Learn the basics of quadratic functions and their graphs",
    "type": "reading",
    "duration": "20 minutes",
    "difficulty": "beginner",
    "resources": ["Textbook Chapter 5", "Khan Academy Video"],
    "prerequisites": []
  }
]

Create a logical progression from basic to advanced concepts.`;

      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert curriculum designer. Create a comprehensive learning path that guides students from basic to advanced understanding.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const response = await groqApiService.makeRequest(messages);
      const learningPath = this.parseLearningPathResponse(response, count);
      
      console.log(`✅ Generated ${learningPath.length} learning path items`);
      return learningPath;

    } catch (error) {
      console.error('Error generating learning path:', error);
      return this.createFallbackLearningPath(topic, count);
    }
  }

  // Parser methods
  private parseFlashcardsResponse(response: string, expectedCount: number): Flashcard[] {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.slice(0, expectedCount).map((card, index) => ({
          id: card.id || `card${index + 1}`,
          front: card.front || 'Front content',
          back: card.back || 'Back content',
          difficulty: card.difficulty || 'medium',
          category: card.category
        }));
      }
    } catch (error) {
      console.error('Error parsing flashcards:', error);
    }
    
    return this.createFallbackFlashcards('topic', expectedCount);
  }

  private parseQuizResponse(response: string, expectedCount: number): QuizQuestion[] {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.slice(0, expectedCount).map((q, index) => ({
          id: q.id || `q${index + 1}`,
          question: q.question || 'Sample question?',
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || 'Explanation',
          difficulty: q.difficulty || 'medium',
          category: q.category
        }));
      }
    } catch (error) {
      console.error('Error parsing quiz:', error);
    }
    
    return this.createFallbackQuiz('topic', expectedCount);
  }

  private parseContestResponse(response: string, expectedCount: number): ContestChallenge[] {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.slice(0, expectedCount).map((challenge, index) => ({
          id: challenge.id || `challenge${index + 1}`,
          question: challenge.question || 'Sample challenge?',
          answer: challenge.answer || 'Sample answer',
          timeLimit: typeof challenge.timeLimit === 'number' ? challenge.timeLimit : 60,
          points: typeof challenge.points === 'number' ? challenge.points : 20,
          difficulty: challenge.difficulty || 'medium'
        }));
      }
    } catch (error) {
      console.error('Error parsing contest:', error);
    }
    
    return this.createFallbackContest('topic', expectedCount);
  }

  private parseLearningPathResponse(response: string, expectedCount: number): LearningPathItem[] {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.slice(0, expectedCount).map((item, index) => ({
          id: item.id || `path${index + 1}`,
          title: item.title || 'Learning Item',
          description: item.description || 'Description',
          type: ['reading', 'video', 'practice', 'quiz', 'project'].includes(item.type) ? item.type : 'reading',
          duration: item.duration || '15 minutes',
          difficulty: ['beginner', 'intermediate', 'advanced'].includes(item.difficulty) ? item.difficulty : 'beginner',
          resources: Array.isArray(item.resources) ? item.resources : ['Resource'],
          prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : []
        }));
      }
    } catch (error) {
      console.error('Error parsing learning path:', error);
    }
    
    return this.createFallbackLearningPath('topic', expectedCount);
  }

  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any text before the first [
    const firstBracket = cleaned.indexOf('[');
    if (firstBracket > 0) {
      cleaned = cleaned.substring(firstBracket);
    }
    
    // Remove any text after the last ]
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket > 0 && lastBracket < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBracket + 1);
    }
    
    return cleaned.trim();
  }

  // Fallback methods for when AI generation fails
  private createFallbackFlashcards(topic: string, count: number): Flashcard[] {
    const flashcards: Flashcard[] = [];
    for (let i = 1; i <= count; i++) {
      flashcards.push({
        id: `card${i}`,
        front: `What is ${topic} concept ${i}?`,
        back: `This is the explanation for ${topic} concept ${i}`,
        difficulty: i <= count / 3 ? 'easy' : i <= (count * 2) / 3 ? 'medium' : 'hard',
        category: 'General'
      });
    }
    return flashcards;
  }

  private createFallbackQuiz(topic: string, count: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: `q${i}`,
        question: `What is the main concept related to ${topic} in question ${i}?`,
        options: [
          `Option A for question ${i}`,
          `Option B for question ${i}`,
          `Option C for question ${i}`,
          `Option D for question ${i}`
        ],
        correctAnswer: 0,
        explanation: `This is the explanation for question ${i} about ${topic}`,
        difficulty: i <= count / 3 ? 'easy' : i <= (count * 2) / 3 ? 'medium' : 'hard',
        category: 'General'
      });
    }
    return questions;
  }

  private createFallbackContest(topic: string, count: number): ContestChallenge[] {
    const challenges: ContestChallenge[] = [];
    for (let i = 1; i <= count; i++) {
      challenges.push({
        id: `challenge${i}`,
        question: `Quick challenge ${i}: Solve this ${topic} problem`,
        answer: `Answer ${i}`,
        timeLimit: 60,
        points: 20,
        difficulty: i <= count / 3 ? 'easy' : i <= (count * 2) / 3 ? 'medium' : 'hard'
      });
    }
    return challenges;
  }

  private createFallbackLearningPath(topic: string, count: number): LearningPathItem[] {
    const path: LearningPathItem[] = [];
    const types = ['reading', 'video', 'practice', 'quiz', 'project'];
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    
    for (let i = 1; i <= count; i++) {
      path.push({
        id: `path${i}`,
        title: `${topic} - Step ${i}`,
        description: `Learn about ${topic} concepts in step ${i}`,
        type: types[i % types.length] as any,
        duration: `${15 + (i * 5)} minutes`,
        difficulty: difficulties[Math.floor(i / Math.ceil(count / 3))] as any,
        resources: [`Resource ${i}`, `Additional Material ${i}`],
        prerequisites: i > 1 ? [`Complete Step ${i - 1}`] : []
      });
    }
    return path;
  }
}

export const studyToolsGenerator = new StudyToolsGenerator();
