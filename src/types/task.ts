export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'practice' | 'interactive' | 'document' | 'pdf' | 'quiz' | 'flashcard' | 'contest';
  url?: string; // optional for AI-generated content
  description: string;
  duration?: string; // for videos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string; // e.g., "Khan Academy", "YouTube", "Coursera", "AI Generated"
  thumbnail?: string;
  // For AI-generated content
  content?: any; // The actual generated content (quiz questions, flashcards, contest problems)
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeEstimate: string;
  type: 'reading' | 'practice' | 'review' | 'quiz' | 'flashcard' | 'contest';
  resources: Resource[];
  learningObjectives: string[];
  prerequisites?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedScore?: number; // for practice tasks
}
