import { useState, useEffect, useCallback } from 'react';
import { smartStorage } from '@/services/smartStorageService';
import type {
  UserProfile,
  StudySession,
  Flashcard,
  FlashcardSet,
  StudyNote,
  Quiz,
  QuizAttempt,
  LearningPath,
  RevisionPlan,
  ProgressMetrics,
  UserPreferences,
  Achievement,
} from '@/types/storage';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    smartStorage.getUserProfile()
      .then(setProfile)
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const current = await smartStorage.getUserProfile();
    if (current) {
      const updated = { ...current, ...updates };
      await smartStorage.saveUserProfile(updated);
      setProfile(updated);
    }
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    await smartStorage.saveUserProfile(newProfile);
    setProfile(newProfile);
  }, []);

  return { profile, loading, error, updateProfile, saveProfile };
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    smartStorage.getUserPreferences()
      .then(setPreferences)
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const current = await smartStorage.getUserPreferences();
    if (current) {
      const updated = { ...current, ...updates };
      await smartStorage.saveUserPreferences(updated);
      setPreferences(updated);
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences: UserPreferences) => {
    await smartStorage.saveUserPreferences(newPreferences);
    setPreferences(newPreferences);
  }, []);

  return { preferences, loading, error, updatePreferences, savePreferences };
}

export function useStudySessions(subject?: string) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = subject
        ? await smartStorage.getStudySessionsBySubject(subject)
        : await smartStorage.getAllStudySessions();
      setSessions(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const createSession = useCallback(async (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession = await smartStorage.createStudySession(session);
    loadSessions();
    return newSession;
  }, [loadSessions]);

  const updateSession = useCallback(async (id: string, updates: Partial<StudySession>) => {
    await smartStorage.updateStudySession(id, updates);
    loadSessions();
  }, [loadSessions]);

  return { sessions, loading, error, createSession, updateSession, refresh: loadSessions };
}

export function useFlashcards(subject?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const data = subject
        ? await smartStorage.getFlashcardsBySubject(subject)
        : await smartStorage.getAllFlashcards();
      setFlashcards(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { loadFlashcards(); }, [loadFlashcards]);

  const createFlashcard = useCallback(async (flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => {
    const newFlashcard = await smartStorage.createFlashcard(flashcard);
    loadFlashcards();
    return newFlashcard;
  }, [loadFlashcards]);

  const updateFlashcard = useCallback(async (id: string, updates: Partial<Flashcard>) => {
    await smartStorage.updateFlashcard(id, updates);
    loadFlashcards();
  }, [loadFlashcards]);

  const deleteFlashcard = useCallback(async (id: string) => {
    await smartStorage.deleteFlashcard(id);
    loadFlashcards();
  }, [loadFlashcards]);

  const getDueForReview = useCallback(async () => {
    return smartStorage.getFlashcardsDueForReview();
  }, []);

  return { flashcards, loading, error, createFlashcard, updateFlashcard, deleteFlashcard, getDueForReview, refresh: loadFlashcards };
}

export function useFlashcardSets() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSets = useCallback(async () => {
    setLoading(true);
    try {
      setSets(await smartStorage.getAllFlashcardSets());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSets(); }, [loadSets]);

  const createSet = useCallback(async (set: Omit<FlashcardSet, 'id' | 'createdAt'>) => {
    const newSet = await smartStorage.createFlashcardSet(set);
    loadSets();
    return newSet;
  }, [loadSets]);

  const updateSet = useCallback(async (id: string, updates: Partial<FlashcardSet>) => {
    await smartStorage.updateFlashcardSet(id, updates);
    loadSets();
  }, [loadSets]);

  return { sets, loading, error, createSet, updateSet, refresh: loadSets };
}

export function useStudyNotes(subject?: string) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = subject
        ? await smartStorage.getStudyNotesBySubject(subject)
        : await smartStorage.getAllStudyNotes();
      setNotes(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const createNote = useCallback(async (note: Omit<StudyNote, 'id' | 'createdAt'>) => {
    const newNote = await smartStorage.createStudyNote(note);
    loadNotes();
    return newNote;
  }, [loadNotes]);

  const updateNote = useCallback(async (id: string, updates: Partial<StudyNote>) => {
    await smartStorage.updateStudyNote(id, updates);
    loadNotes();
  }, [loadNotes]);

  const deleteNote = useCallback(async (id: string) => {
    await smartStorage.deleteStudyNote(id);
    loadNotes();
  }, [loadNotes]);

  return { notes, loading, error, createNote, updateNote, deleteNote, refresh: loadNotes };
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      setQuizzes(await smartStorage.getAllQuizzes());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuizzes(); }, [loadQuizzes]);

  const createQuiz = useCallback(async (quiz: Omit<Quiz, 'id' | 'createdAt'>) => {
    const newQuiz = await smartStorage.createQuiz(quiz);
    loadQuizzes();
    return newQuiz;
  }, [loadQuizzes]);

  const updateQuiz = useCallback(async (id: string, updates: Partial<Quiz>) => {
    await smartStorage.updateQuiz(id, updates);
    loadQuizzes();
  }, [loadQuizzes]);

  const getQuiz = useCallback(async (id: string) => {
    return smartStorage.getQuiz(id);
  }, []);

  return { quizzes, loading, error, createQuiz, updateQuiz, getQuiz, refresh: loadQuizzes };
}

export function useQuizAttempts(quizId?: string) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const data = quizId
        ? await smartStorage.getQuizAttemptsByQuizId(quizId)
        : await smartStorage.getAllQuizAttempts();
      setAttempts(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => { loadAttempts(); }, [loadAttempts]);

  const createAttempt = useCallback(async (attempt: Omit<QuizAttempt, 'id' | 'createdAt'>) => {
    const newAttempt = await smartStorage.createQuizAttempt(attempt);
    loadAttempts();
    return newAttempt;
  }, [loadAttempts]);

  return { attempts, loading, error, createAttempt, refresh: loadAttempts };
}

export function useLearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPaths = useCallback(async () => {
    setLoading(true);
    try {
      setPaths(await smartStorage.getAllLearningPaths());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPaths(); }, [loadPaths]);

  const createPath = useCallback(async (path: Omit<LearningPath, 'id' | 'createdAt'>) => {
    const newPath = await smartStorage.createLearningPath(path);
    loadPaths();
    return newPath;
  }, [loadPaths]);

  const updatePath = useCallback(async (id: string, updates: Partial<LearningPath>) => {
    await smartStorage.updateLearningPath(id, updates);
    loadPaths();
  }, [loadPaths]);

  const getPath = useCallback(async (id: string) => {
    return smartStorage.getLearningPath(id);
  }, []);

  return { paths, loading, error, createPath, updatePath, getPath, refresh: loadPaths };
}

export function useRevisionPlans(subject?: string) {
  const [plans, setPlans] = useState<RevisionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = subject
        ? await smartStorage.getRevisionPlansBySubject(subject)
        : await smartStorage.getAllRevisionPlans();
      setPlans(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const createPlan = useCallback(async (plan: Omit<RevisionPlan, 'id' | 'createdAt'>) => {
    const newPlan = await smartStorage.createRevisionPlan(plan);
    loadPlans();
    return newPlan;
  }, [loadPlans]);

  const updatePlan = useCallback(async (id: string, updates: Partial<RevisionPlan>) => {
    await smartStorage.updateRevisionPlan(id, updates);
    loadPlans();
  }, [loadPlans]);

  const addFeedback = useCallback(async (planId: string, feedback: any) => {
    await smartStorage.addRevisionFeedback(planId, feedback);
    loadPlans();
  }, [loadPlans]);

  return { plans, loading, error, createPlan, updatePlan, addFeedback, refresh: loadPlans };
}

export function useProgressMetrics(subject?: string) {
  const [metrics, setMetrics] = useState<ProgressMetrics | ProgressMetrics[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = subject
        ? await smartStorage.getProgressMetrics(subject)
        : await smartStorage.getAllProgressMetrics();
      setMetrics(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const updateMetrics = useCallback(async (subjectName: string, updates: Partial<ProgressMetrics>) => {
    await smartStorage.updateProgressMetrics(subjectName, updates);
    loadMetrics();
  }, [loadMetrics]);

  return { metrics, loading, error, updateMetrics, refresh: loadMetrics };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      setAchievements(await smartStorage.getAllAchievements());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAchievements(); }, [loadAchievements]);

  const createAchievement = useCallback(async (achievement: Omit<Achievement, 'id' | 'earnedAt'>) => {
    const newAchievement = await smartStorage.createAchievement(achievement);
    loadAchievements();
    return newAchievement;
  }, [loadAchievements]);

  return { achievements, loading, error, createAchievement, refresh: loadAchievements };
}

export function useCloudSync() {
  return { syncing: false, lastSync: null, syncToCloud: async () => {}, syncFromCloud: async () => {} };
}
