import { supabase } from '@/integrations/supabase/client';
import type {
  UserProfile,
  StudySession,
  Flashcard,
  FlashcardSet,
  StudyNote,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  LearningPath,
  RevisionPlan,
  ProgressMetrics,
  UserPreferences,
  Achievement,
  RevisionFeedback,
} from '@/types/storage';

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not authenticated');
  return data.user.id;
}

class SmartStorageService {

  // ============================================
  // USER PROFILE
  // ============================================

  async getUserProfile(): Promise<UserProfile | null> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', uid)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email ?? undefined,
      userType: (data.user_type as 'student' | 'teacher') || 'student',
      bio: data.bio ?? undefined,
      avatar: data.avatar_url ?? undefined,
      createdAt: data.created_at ?? undefined,
      updatedAt: data.updated_at ?? undefined,
    };
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const uid = await getUserId();
    const [firstName, ...rest] = (profile.name || '').split(' ');
    await supabase.from('profiles').upsert({
      user_id: uid,
      first_name: firstName,
      last_name: rest.join(' ') || null,
      email: profile.email,
      bio: profile.bio,
      avatar_url: profile.avatar,
      user_type: profile.userType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  // ============================================
  // USER PREFERENCES
  // ============================================

  async getUserPreferences(): Promise<UserPreferences | null> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('user_preferences' as any)
      .select('*')
      .eq('user_id', uid)
      .single();
    if (error || !data) return null;
    const d = data as any;
    return {
      userId: uid,
      theme: d.theme || 'light',
      notifications: d.notifications || {},
      studyPreferences: d.study_preferences || {},
      privacy: d.privacy || {},
      accessibility: d.accessibility || {},
      updatedAt: d.updated_at,
    } as UserPreferences;
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    const uid = await getUserId();
    await (supabase.from('user_preferences' as any) as any).upsert({
      user_id: uid,
      theme: preferences.theme,
      notifications: preferences.notifications,
      study_preferences: preferences.studyPreferences,
      privacy: preferences.privacy,
      accessibility: preferences.accessibility,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  // ============================================
  // STUDY SESSIONS
  // ============================================

  async createStudySession(session: Omit<StudySession, 'id' | 'createdAt'>): Promise<StudySession> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: uid,
        session_type: session.contentType,
        subject: (session as any).subject,
        topic: (session as any).topic,
        started_at: session.startTime,
        completed_at: session.endTime,
        duration_minutes: session.duration,
        content_type: session.contentType,
        content_id: session.contentId,
        performance: session.performance as any,
        mood: session.mood,
        notes: session.notes,
      } as any)
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapStudySession(data as any);
  }

  async updateStudySession(id: string, updates: Partial<StudySession>): Promise<void> {
    const uid = await getUserId();
    await supabase
      .from('study_sessions')
      .update({
        completed_at: updates.endTime,
        duration_minutes: updates.duration,
        performance: updates.performance as any,
        mood: updates.mood,
        notes: updates.notes,
      } as any)
      .eq('id', id)
      .eq('user_id', uid);
  }

  async getAllStudySessions(): Promise<StudySession[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', uid)
      .order('started_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(this.mapStudySession);
  }

  async getStudySessionsBySubject(subject: string): Promise<StudySession[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', uid)
      .eq('subject' as any, subject)
      .order('started_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(this.mapStudySession);
  }

  async getRecentStudySessions(limit = 10): Promise<StudySession[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', uid)
      .order('started_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as any[]).map(this.mapStudySession);
  }

  private mapStudySession(d: any): StudySession {
    return {
      id: d.id,
      userId: d.user_id,
      subject: d.subject || d.session_type,
      topic: d.topic || '',
      startTime: d.started_at,
      endTime: d.completed_at,
      duration: d.duration_minutes || 0,
      contentType: (d.content_type || d.session_type) as StudySession['contentType'],
      contentId: d.content_id,
      performance: d.performance,
      mood: d.mood,
      notes: d.notes,
      createdAt: d.started_at,
    };
  }

  // ============================================
  // FLASHCARDS
  // ============================================

  async createFlashcard(flashcard: Omit<Flashcard, 'id' | 'createdAt'>): Promise<Flashcard> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: uid,
        set_id: (flashcard as any).setId || '00000000-0000-0000-0000-000000000000',
        front_text: flashcard.question,
        back_text: flashcard.answer,
        difficulty: flashcard.difficulty,
        subject: flashcard.subject,
        topic: flashcard.topic,
        tags: flashcard.tags,
        review_count: flashcard.reviewCount || 0,
        mastery_level: flashcard.masteryLevel || 0,
        last_reviewed: flashcard.lastReviewed,
        next_review: flashcard.nextReview,
      } as any)
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapFlashcard(data as any);
  }

  async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<void> {
    const uid = await getUserId();
    const mapped: any = { updated_at: new Date().toISOString() };
    if (updates.question !== undefined) mapped.front_text = updates.question;
    if (updates.answer !== undefined) mapped.back_text = updates.answer;
    if (updates.difficulty !== undefined) mapped.difficulty = updates.difficulty;
    if (updates.subject !== undefined) mapped.subject = updates.subject;
    if (updates.tags !== undefined) mapped.tags = updates.tags;
    if (updates.reviewCount !== undefined) mapped.review_count = updates.reviewCount;
    if (updates.masteryLevel !== undefined) mapped.mastery_level = updates.masteryLevel;
    if (updates.lastReviewed !== undefined) mapped.last_reviewed = updates.lastReviewed;
    if (updates.nextReview !== undefined) mapped.next_review = updates.nextReview;
    await supabase.from('flashcards').update(mapped).eq('id', id).eq('user_id' as any, uid);
  }

  async deleteFlashcard(id: string): Promise<void> {
    const uid = await getUserId();
    await supabase.from('flashcards').delete().eq('id', id).eq('user_id' as any, uid);
  }

  async getAllFlashcards(): Promise<Flashcard[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id' as any, uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(this.mapFlashcard);
  }

  async getFlashcardsBySubject(subject: string): Promise<Flashcard[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id' as any, uid)
      .eq('subject' as any, subject);
    if (error || !data) return [];
    return (data as any[]).map(this.mapFlashcard);
  }

  async getFlashcardsDueForReview(): Promise<Flashcard[]> {
    const uid = await getUserId();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id' as any, uid)
      .or(`next_review.is.null,next_review.lte.${now}` as any);
    if (error || !data) return [];
    return (data as any[]).map(this.mapFlashcard);
  }

  private mapFlashcard(d: any): Flashcard {
    return {
      id: d.id,
      userId: d.user_id,
      subject: d.subject || '',
      topic: d.topic,
      question: d.front_text,
      answer: d.back_text,
      difficulty: d.difficulty,
      tags: d.tags,
      reviewCount: d.review_count || 0,
      lastReviewed: d.last_reviewed,
      nextReview: d.next_review,
      masteryLevel: d.mastery_level || 0,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  // ============================================
  // FLASHCARD SETS
  // ============================================

  async createFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt'>): Promise<FlashcardSet> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('flashcard_sets')
      .insert({
        user_id: uid,
        title: set.name,
        description: set.description,
        subject: set.subject,
        difficulty: 'medium',
      })
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapFlashcardSet(data, set.flashcardIds || []);
  }

  async updateFlashcardSet(id: string, updates: Partial<FlashcardSet>): Promise<void> {
    const uid = await getUserId();
    const mapped: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) mapped.title = updates.name;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.subject !== undefined) mapped.subject = updates.subject;
    await supabase.from('flashcard_sets').update(mapped).eq('id', id).eq('user_id', uid);
  }

  async getAllFlashcardSets(): Promise<FlashcardSet[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*, flashcards(id)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(d => this.mapFlashcardSet(d, (d.flashcards || []).map((f: any) => f.id)));
  }

  private mapFlashcardSet(d: any, flashcardIds: string[]): FlashcardSet {
    return {
      id: d.id,
      userId: d.user_id,
      name: d.title,
      description: d.description,
      subject: d.subject || '',
      flashcardIds,
      totalCards: flashcardIds.length,
      masteredCards: 0,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  // ============================================
  // STUDY NOTES
  // ============================================

  async createStudyNote(note: Omit<StudyNote, 'id' | 'createdAt'>): Promise<StudyNote> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: uid,
        title: note.title,
        content: note.content,
        subject: note.subject,
        tags: note.tags,
      })
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapNote(data as any);
  }

  async updateStudyNote(id: string, updates: Partial<StudyNote>): Promise<void> {
    const uid = await getUserId();
    await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
        subject: updates.subject,
        tags: updates.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', uid);
  }

  async deleteStudyNote(id: string): Promise<void> {
    const uid = await getUserId();
    await supabase.from('notes').delete().eq('id', id).eq('user_id', uid);
  }

  async getAllStudyNotes(): Promise<StudyNote[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(this.mapNote);
  }

  async getStudyNotesBySubject(subject: string): Promise<StudyNote[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', uid)
      .eq('subject', subject);
    if (error || !data) return [];
    return (data as any[]).map(this.mapNote);
  }

  private mapNote(d: any): StudyNote {
    return {
      id: d.id,
      userId: d.user_id,
      title: d.title,
      content: d.content || '',
      subject: d.subject || '',
      tags: d.tags,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  // ============================================
  // QUIZZES
  // ============================================

  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        user_id: uid,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        time_limit: quiz.timeLimit,
        difficulty: 'medium',
      })
      .select()
      .single();
    if (error || !data) throw error;

    if (quiz.questions?.length) {
      await supabase.from('quiz_questions').insert(
        quiz.questions.map(q => ({
          quiz_id: (data as any).id,
          question_text: q.question,
          options: q.options as any,
          correct_answer: String(q.correctAnswer),
          explanation: q.explanation,
          points: q.points,
          question_type: 'multiple_choice',
        }))
      );
    }

    return this.mapQuiz(data as any, quiz.questions || []);
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<void> {
    const uid = await getUserId();
    await supabase
      .from('quizzes')
      .update({
        title: updates.title,
        description: updates.description,
        subject: updates.subject,
        time_limit: updates.timeLimit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', uid);
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(d => this.mapQuiz(d, d.quiz_questions || []));
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return this.mapQuiz(data as any, (data as any).quiz_questions || []);
  }

  private mapQuiz(d: any, rawQuestions: any[]): Quiz {
    const questions: QuizQuestion[] = rawQuestions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: parseInt(q.correct_answer, 10) || 0,
      explanation: q.explanation,
      points: q.points || 1,
    }));
    return {
      id: d.id,
      userId: d.user_id,
      title: d.title,
      description: d.description,
      subject: d.subject || '',
      questions,
      timeLimit: d.time_limit,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  // ============================================
  // QUIZ ATTEMPTS
  // ============================================

  async createQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<QuizAttempt> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('quiz_attempts' as any) as any)
      .insert({
        user_id: uid,
        quiz_id: attempt.quizId,
        answers: attempt.answers,
        score: attempt.score,
        total_points: attempt.totalPoints,
        percentage: attempt.percentage,
        start_time: attempt.startTime,
        end_time: attempt.endTime,
        duration_minutes: attempt.duration,
      })
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapQuizAttempt(data);
  }

  async getAllQuizAttempts(): Promise<QuizAttempt[]> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('quiz_attempts' as any) as any)
      .select('*')
      .eq('user_id', uid);
    if (error || !data) return [];
    return (data as any[]).map(this.mapQuizAttempt);
  }

  async getQuizAttemptsByQuizId(quizId: string): Promise<QuizAttempt[]> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('quiz_attempts' as any) as any)
      .select('*')
      .eq('user_id', uid)
      .eq('quiz_id', quizId);
    if (error || !data) return [];
    return (data as any[]).map(this.mapQuizAttempt);
  }

  private mapQuizAttempt(d: any): QuizAttempt {
    return {
      id: d.id,
      userId: d.user_id,
      quizId: d.quiz_id,
      answers: d.answers || [],
      score: d.score,
      totalPoints: d.total_points,
      percentage: d.percentage,
      startTime: d.start_time,
      endTime: d.end_time,
      duration: d.duration_minutes,
      createdAt: d.created_at,
    };
  }

  // ============================================
  // LEARNING PATHS
  // ============================================

  async createLearningPath(path: Omit<LearningPath, 'id' | 'createdAt'>): Promise<LearningPath> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('learning_paths' as any) as any)
      .insert({
        user_id: uid,
        subject: path.subject,
        title: path.title,
        description: path.description,
        total_steps: path.totalSteps,
        completed_steps: path.completedSteps,
        steps: path.steps,
      })
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapLearningPath(data);
  }

  async updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<void> {
    const uid = await getUserId();
    await (supabase.from('learning_paths' as any) as any)
      .update({
        title: updates.title,
        description: updates.description,
        total_steps: updates.totalSteps,
        completed_steps: updates.completedSteps,
        steps: updates.steps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', uid);
  }

  async getAllLearningPaths(): Promise<LearningPath[]> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('learning_paths' as any) as any)
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(this.mapLearningPath);
  }

  async getLearningPath(id: string): Promise<LearningPath | undefined> {
    const { data, error } = await (supabase.from('learning_paths' as any) as any)
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return this.mapLearningPath(data);
  }

  private mapLearningPath(d: any): LearningPath {
    return {
      id: d.id,
      userId: d.user_id,
      subject: d.subject,
      title: d.title,
      description: d.description,
      totalSteps: d.total_steps || 0,
      completedSteps: d.completed_steps || 0,
      steps: d.steps || [],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  // ============================================
  // REVISION PLANS
  // ============================================

  async createRevisionPlan(plan: Omit<RevisionPlan, 'id' | 'createdAt'>): Promise<RevisionPlan> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('revision_plans' as any) as any)
      .insert({
        user_id: uid,
        subject: plan.subject,
        topic: plan.topic,
        scheduled_dates: plan.scheduledDates,
        completed_dates: plan.completedDates,
        feedback: plan.feedback || [],
      })
      .select()
      .single();
    if (error || !data) throw error;
    return this.mapRevisionPlan(data);
  }

  async updateRevisionPlan(id: string, updates: Partial<RevisionPlan>): Promise<void> {
    const uid = await getUserId();
    await (supabase.from('revision_plans' as any) as any)
      .update({
        scheduled_dates: updates.scheduledDates,
        completed_dates: updates.completedDates,
        feedback: updates.feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', uid);
  }

  async addRevisionFeedback(planId: string, feedback: RevisionFeedback): Promise<void> {
    const plan = await this.getRevisionPlan(planId);
    if (!plan) return;
    const updated = [...(plan.feedback || []), feedback];
    await this.updateRevisionPlan(planId, { feedback: updated });
  }

  async getAllRevisionPlans(): Promise<RevisionPlan[]> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('revision_plans' as any) as any)
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(this.mapRevisionPlan);
  }

  async getRevisionPlansBySubject(subject: string): Promise<RevisionPlan[]> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('revision_plans' as any) as any)
      .select('*')
      .eq('user_id', uid)
      .eq('subject', subject);
    if (error || !data) return [];
    return (data as any[]).map(this.mapRevisionPlan);
  }

  private async getRevisionPlan(id: string): Promise<RevisionPlan | null> {
    const { data, error } = await (supabase.from('revision_plans' as any) as any)
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.mapRevisionPlan(data);
  }

  private mapRevisionPlan(d: any): RevisionPlan {
    return {
      id: d.id,
      userId: d.user_id,
      subject: d.subject,
      topic: d.topic,
      scheduledDates: d.scheduled_dates || [],
      completedDates: d.completed_dates || [],
      feedback: d.feedback || [],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  // ============================================
  // PROGRESS METRICS
  // ============================================

  async getProgressMetrics(subject: string): Promise<ProgressMetrics | null> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', uid)
      .eq('subject', subject)
      .single();
    if (error || !data) return null;
    return this.mapProgressMetrics(data as any);
  }

  async getAllProgressMetrics(): Promise<ProgressMetrics[]> {
    const uid = await getUserId();
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', uid);
    if (error || !data) return [];
    return (data as any[]).map(this.mapProgressMetrics);
  }

  async updateProgressMetrics(subject: string, updates: Partial<ProgressMetrics>): Promise<void> {
    const uid = await getUserId();
    await supabase.from('user_progress').upsert({
      user_id: uid,
      subject,
      total_study_time_minutes: updates.totalStudyTime,
      quizzes_completed: updates.sessionsCompleted,
      streak_days: updates.streakDays,
      last_activity_date: updates.lastStudyDate,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'user_id,subject' });
  }

  private mapProgressMetrics(d: any): ProgressMetrics {
    return {
      userId: d.user_id,
      subject: d.subject,
      totalStudyTime: d.total_study_time_minutes || 0,
      sessionsCompleted: d.quizzes_completed || 0,
      averageSessionDuration: 0,
      streakDays: d.streak_days || 0,
      lastStudyDate: d.last_activity_date || new Date().toISOString(),
      topicsStudied: [],
      masteryLevels: {},
      weeklyGoalMinutes: 0,
      weeklyProgress: 0,
      updatedAt: d.updated_at || new Date().toISOString(),
    };
  }

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  async createAchievement(achievement: Omit<Achievement, 'id' | 'earnedAt'>): Promise<Achievement> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('achievements' as any) as any)
      .insert({
        user_id: uid,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
      })
      .select()
      .single();
    if (error || !data) throw error;
    return {
      id: (data as any).id,
      userId: uid,
      title: (data as any).title,
      description: (data as any).description,
      icon: (data as any).icon,
      category: (data as any).category,
      earnedAt: (data as any).earned_at,
    };
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const uid = await getUserId();
    const { data, error } = await (supabase.from('achievements' as any) as any)
      .select('*')
      .eq('user_id', uid)
      .order('earned_at', { ascending: false });
    if (error || !data) return [];
    return (data as any[]).map(d => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      description: d.description,
      icon: d.icon,
      category: d.category,
      earnedAt: d.earned_at,
    }));
  }

  // ============================================
  // LEGACY — kept for backward compatibility
  // These entities don't have dedicated tables yet.
  // ============================================

  createContest = async (contest: any) => contest;
  getAllContests = async () => [] as any[];
  getContest = async (_id: string) => undefined;
  createContestAttempt = async (attempt: any) => attempt;
  getAllContestAttempts = async () => [] as any[];
  getContestAttemptsByContestId = async (_id: string) => [] as any[];
  createClass = async (c: any) => c;
  updateClass = async () => {};
  getAllClasses = async () => [] as any[];
  createAssignment = async (a: any) => a;
  getAllAssignments = async () => [] as any[];
  getAssignmentsByClassId = async (_id: string) => [] as any[];
  clearUserProfile = async () => {};
  clearAllData = async () => {};
  exportData = async () => '{}';
  importData = async () => {};
}

export const smartStorage = new SmartStorageService();
