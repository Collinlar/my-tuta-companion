import { useState, useEffect, useCallback } from 'react';
import { 
  UserFeedbackService, 
  UserReflection, 
  UserStudyProgress, 
  StudySession 
} from '@/services/userFeedbackService';

export interface UseUserFeedbackReturn {
  // Current session
  currentSession: StudySession | null;
  startSession: (revisionPlanId: string, topic: string, subject: string) => void;
  updateSession: (updates: Partial<StudySession>) => void;
  endSession: (rating?: number, feedback?: string) => void;
  
  // Study progress
  studyProgress: UserStudyProgress | null;
  updateProgress: (progress: Partial<UserStudyProgress>) => void;
  markStepComplete: (stepId: string) => void;
  markActivityComplete: (activityId: string, result?: string) => void;
  
  // Reflections
  reflections: UserReflection[];
  saveReflection: (reflection: Omit<UserReflection, 'id' | 'timestamp'>) => void;
  updateReflectionAnswer: (questionId: string, answer: string) => void;
  
  // Study tool scores
  updateStudyToolScore: (toolType: string, score: number) => void;
  
  // Analytics
  getLearningInsights: (topic: string) => ReturnType<typeof UserFeedbackService.getLearningInsights>;
  getPreviousReflections: (topic: string) => UserReflection[];
  
  // Session management
  isSessionActive: boolean;
  sessionDuration: number; // in minutes
}

export function useUserFeedback(
  revisionPlanId?: string,
  topic?: string,
  subject?: string
): UseUserFeedbackReturn {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [studyProgress, setStudyProgress] = useState<UserStudyProgress | null>(null);
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Load existing data on mount
  useEffect(() => {
    const session = UserFeedbackService.getCurrentSession();
    setCurrentSession(session);
    
    if (session) {
      setSessionStartTime(new Date(session.startTime));
    }

    if (revisionPlanId) {
      const progress = UserFeedbackService.getStudyProgress(revisionPlanId);
      setStudyProgress(progress);
      
      if (topic) {
        const topicReflections = UserFeedbackService.getReflectionsByTopic(topic);
        setReflections(topicReflections);
      }
    }
  }, [revisionPlanId, topic]);

  // Calculate session duration
  const sessionDuration = currentSession && sessionStartTime 
    ? Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60))
    : 0;

  // Session management
  const startSession = useCallback((planId: string, planTopic: string, planSubject: string) => {
    const session = UserFeedbackService.startStudySession(planId, planTopic, planSubject);
    setCurrentSession(session);
    setSessionStartTime(new Date());
    
    // Initialize or load study progress
    const progress = UserFeedbackService.getStudyProgress(planId) || 
      UserFeedbackService.saveStudyProgress({
        revisionPlanId: planId,
        topic: planTopic,
        subject: planSubject
      });
    setStudyProgress(progress);
    
    console.log('🎯 Study session started for:', planTopic);
  }, []);

  const updateSession = useCallback((updates: Partial<StudySession>) => {
    const updated = UserFeedbackService.updateCurrentSession(updates);
    if (updated) {
      setCurrentSession(updated);
    }
  }, []);

  const endSession = useCallback((rating?: number, feedback?: string) => {
    const completedSession = UserFeedbackService.endStudySession(rating, feedback);
    setCurrentSession(null);
    setSessionStartTime(null);
    
    if (completedSession) {
      console.log('✅ Study session completed:', completedSession.topic);
    }
  }, []);

  // Study progress management
  const updateProgress = useCallback((progress: Partial<UserStudyProgress>) => {
    if (!studyProgress) return;
    
    const updated = UserFeedbackService.saveStudyProgress({
      ...studyProgress,
      ...progress
    });
    setStudyProgress(updated);
  }, [studyProgress]);

  const markStepComplete = useCallback((stepId: string) => {
    if (!studyProgress || studyProgress.completedSteps.includes(stepId)) return;
    
    const updatedSteps = [...studyProgress.completedSteps, stepId];
    updateProgress({ completedSteps: updatedSteps });
    
    // Also update current session
    updateSession({ 
      completedSteps: updatedSteps 
    });
    
    console.log('✅ Step completed:', stepId);
  }, [studyProgress, updateProgress, updateSession]);

  const markActivityComplete = useCallback((activityId: string, result?: string) => {
    if (!studyProgress) return;
    
    const updatedActivities = [...studyProgress.completedActivities];
    if (!updatedActivities.includes(activityId)) {
      updatedActivities.push(activityId);
    }
    
    const updatedResults = { ...studyProgress.activityResults };
    if (result) {
      updatedResults[activityId] = result;
    }
    
    updateProgress({ 
      completedActivities: updatedActivities,
      activityResults: updatedResults
    });
    
    console.log('✅ Activity completed:', activityId);
  }, [studyProgress, updateProgress]);

  // Reflection management
  const saveReflection = useCallback((reflection: Omit<UserReflection, 'id' | 'timestamp'>) => {
    const saved = UserFeedbackService.saveReflection(reflection);
    setReflections(prev => [...prev, saved]);
    
    // Update study progress with reflection answer
    if (studyProgress) {
      const updatedAnswers = {
        ...studyProgress.reflectionAnswers,
        [reflection.questionId]: reflection.answer
      };
      updateProgress({ reflectionAnswers: updatedAnswers });
    }
    
    console.log('💭 Reflection saved:', saved.question);
  }, [studyProgress, updateProgress]);

  const updateReflectionAnswer = useCallback((questionId: string, answer: string) => {
    if (!studyProgress || !topic || !subject) return;
    
    // Check if this is an update to existing reflection
    const existingReflection = reflections.find(r => r.questionId === questionId);
    
    if (existingReflection) {
      // Update existing reflection
      const updatedReflections = reflections.map(r => 
        r.questionId === questionId ? { ...r, answer } : r
      );
      setReflections(updatedReflections);
    } else {
      // Create new reflection
      saveReflection({
        questionId,
        question: `Reflection question ${questionId}`,
        answer,
        topic,
        subject,
        revisionPlanId: studyProgress.revisionPlanId
      });
    }
    
    // Update study progress
    const updatedAnswers = {
      ...studyProgress.reflectionAnswers,
      [questionId]: answer
    };
    updateProgress({ reflectionAnswers: updatedAnswers });
    
  }, [studyProgress, topic, subject, reflections, saveReflection, updateProgress]);

  // Study tool scores
  const updateStudyToolScore = useCallback((toolType: string, score: number) => {
    if (!studyProgress) return;
    
    const updatedScores = {
      ...studyProgress.studyToolScores,
      [toolType]: score
    };
    updateProgress({ studyToolScores: updatedScores });
    
    console.log('🏆 Study tool score updated:', toolType, score);
  }, [studyProgress, updateProgress]);

  // Analytics
  const getLearningInsights = useCallback((insightTopic: string) => {
    return UserFeedbackService.getLearningInsights(insightTopic);
  }, []);

  const getPreviousReflections = useCallback((reflectionTopic: string) => {
    return UserFeedbackService.getReflectionsByTopic(reflectionTopic);
  }, []);

  return {
    // Current session
    currentSession,
    startSession,
    updateSession,
    endSession,
    
    // Study progress
    studyProgress,
    updateProgress,
    markStepComplete,
    markActivityComplete,
    
    // Reflections
    reflections,
    saveReflection,
    updateReflectionAnswer,
    
    // Study tool scores
    updateStudyToolScore,
    
    // Analytics
    getLearningInsights,
    getPreviousReflections,
    
    // Session management
    isSessionActive: !!currentSession,
    sessionDuration
  };
}
