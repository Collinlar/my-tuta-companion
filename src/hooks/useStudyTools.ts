import { useState, useCallback } from 'react';
import { studyToolsGenerator, Flashcard, QuizQuestion, ContestChallenge, LearningPathItem } from '@/services/studyToolsGenerator';
import { useToast } from '@/hooks/use-toast';

export interface StudyToolsState {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  contest: ContestChallenge[];
  learningPath: LearningPathItem[];
  isLoading: boolean;
  error: string | null;
}

export interface StudyToolsActions {
  generateFlashcards: (topic: string, subject: string, count?: number) => Promise<void>;
  generateQuiz: (topic: string, subject: string, count?: number) => Promise<void>;
  generateContest: (topic: string, subject: string, count?: number) => Promise<void>;
  generateLearningPath: (topic: string, subject: string, count?: number) => Promise<void>;
  clearTools: () => void;
  setError: (error: string | null) => void;
}

export function useStudyTools(): StudyToolsState & StudyToolsActions {
  const [state, setState] = useState<StudyToolsState>({
    flashcards: [],
    quiz: [],
    contest: [],
    learningPath: [],
    isLoading: false,
    error: null
  });

  const { toast } = useToast();

  const generateFlashcards = useCallback(async (topic: string, subject: string, count: number = 20) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const flashcards = await studyToolsGenerator.generateFlashcards(topic, subject, count);
      setState(prev => ({ 
        ...prev, 
        flashcards, 
        isLoading: false 
      }));
      
      toast({
        title: "Flashcards Generated!",
        description: `Created ${flashcards.length} flashcards for ${topic}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isLoading: false 
      }));
      
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generateQuiz = useCallback(async (topic: string, subject: string, count: number = 20) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const quiz = await studyToolsGenerator.generateQuiz(topic, subject, count);
      setState(prev => ({ 
        ...prev, 
        quiz, 
        isLoading: false 
      }));
      
      toast({
        title: "Quiz Generated!",
        description: `Created ${quiz.length} quiz questions for ${topic}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isLoading: false 
      }));
      
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generateContest = useCallback(async (topic: string, subject: string, count: number = 10) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const contest = await studyToolsGenerator.generateContest(topic, subject, count);
      setState(prev => ({ 
        ...prev, 
        contest, 
        isLoading: false 
      }));
      
      toast({
        title: "Contest Generated!",
        description: `Created ${contest.length} contest challenges for ${topic}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate contest';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isLoading: false 
      }));
      
      toast({
        title: "Error",
        description: "Failed to generate contest. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generateLearningPath = useCallback(async (topic: string, subject: string, count: number = 10) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const learningPath = await studyToolsGenerator.generateLearningPath(topic, subject, count);
      setState(prev => ({ 
        ...prev, 
        learningPath, 
        isLoading: false 
      }));
      
      toast({
        title: "Learning Path Generated!",
        description: `Created ${learningPath.length} learning path items for ${topic}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate learning path';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isLoading: false 
      }));
      
      toast({
        title: "Error",
        description: "Failed to generate learning path. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const clearTools = useCallback(() => {
    setState({
      flashcards: [],
      quiz: [],
      contest: [],
      learningPath: [],
      isLoading: false,
      error: null
    });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    generateFlashcards,
    generateQuiz,
    generateContest,
    generateLearningPath,
    clearTools,
    setError
  };
}
