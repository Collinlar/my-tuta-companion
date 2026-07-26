/**
 * Google Analytics utility for tracking page views and events
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Check if Google Analytics is loaded
 */
export const isGAEnabled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track a page view
 * @param path - The page path (e.g., '/dashboard', '/features')
 * @param title - The page title (optional)
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isGAEnabled()) {
    console.warn('Google Analytics not loaded');
    return;
  }

  window.gtag('config', 'G-9QSLPDPS68', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track an event
 * @param eventName - The event name (e.g., 'button_click', 'form_submit')
 * @param eventParams - Additional event parameters
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  }
): void => {
  if (!isGAEnabled()) {
    console.warn('Google Analytics not loaded');
    return;
  }

  window.gtag('event', eventName, eventParams || {});
};

/**
 * Track user sign up
 */
export const trackSignUp = (method: string = 'email'): void => {
  trackEvent('sign_up', {
    event_category: 'engagement',
    event_label: method,
    method: method,
  });
};

/**
 * Track user sign in
 */
export const trackSignIn = (method: string = 'email'): void => {
  trackEvent('login', {
    event_category: 'engagement',
    event_label: method,
    method: method,
  });
};

/**
 * Track content generation
 */
export const trackContentGeneration = (
  contentType: string,
  subject?: string
): void => {
  trackEvent('generate_content', {
    event_category: 'content',
    event_label: contentType,
    content_type: contentType,
    subject: subject || 'general',
  });
};

/**
 * Track quiz completion
 */
export const trackQuizCompletion = (
  topic: string,
  score: number,
  totalQuestions: number
): void => {
  trackEvent('quiz_complete', {
    event_category: 'study',
    event_label: topic,
    value: score,
    score: score,
    total_questions: totalQuestions,
  });
};

/**
 * Track flashcard completion
 */
export const trackFlashcardCompletion = (
  topic: string,
  accuracy: number,
  totalCards: number
): void => {
  trackEvent('flashcard_complete', {
    event_category: 'study',
    event_label: topic,
    value: accuracy,
    accuracy: accuracy,
    total_cards: totalCards,
  });
};

/**
 * Track revision plan creation
 */
export const trackRevisionPlanCreation = (
  subject: string,
  goalsCount: number
): void => {
  trackEvent('revision_plan_create', {
    event_category: 'study',
    event_label: subject,
    goals_count: goalsCount,
  });
};

/**
 * Track share link generation
 */
export const trackShareLink = (contentType: string): void => {
  trackEvent('share_content', {
    event_category: 'engagement',
    event_label: contentType,
    content_type: contentType,
  });
};

/**
 * Track download
 */
export const trackDownload = (fileType: string, fileName?: string): void => {
  trackEvent('file_download', {
    event_category: 'engagement',
    event_label: fileType,
    file_type: fileType,
    file_name: fileName,
  });
};

// ---------- mytuta product events (PRD §36) ----------
// Thin, typed wrappers over trackEvent, wired at each mutation's success
// point. event_category groups them in GA: student / teacher / study.

export const trackMasteryPathStarted = (concept: string): void =>
  trackEvent('mastery_path_started', { event_category: 'study', event_label: concept, concept });

export const trackStageCompleted = (concept: string, stage: string): void =>
  trackEvent('stage_completed', { event_category: 'study', event_label: stage, concept, stage });

export const trackIndependentAttempt = (correct: boolean, mistakeCategory?: string | null): void =>
  trackEvent('independent_attempt', { event_category: 'study', event_label: correct ? 'correct' : 'incorrect', correct, mistake_category: mistakeCategory || undefined });

export const trackSolveCompleted = (topic?: string): void =>
  trackEvent('solve_completed', { event_category: 'study', event_label: topic || 'unknown', topic });

export const trackAssessmentSubmitted = (level: string): void =>
  trackEvent('assessment_submitted', { event_category: 'student', event_label: level, mastery_level: level });

export const trackChallengeSubmitted = (): void =>
  trackEvent('challenge_submitted', { event_category: 'student' });

export const trackClassJoined = (): void =>
  trackEvent('class_joined', { event_category: 'student' });

export const trackExperienceCreated = (): void =>
  trackEvent('experience_created', { event_category: 'teacher' });

export const trackAiContentInserted = (action: string): void =>
  trackEvent('ai_content_inserted', { event_category: 'teacher', event_label: action, action });

export const trackAssessmentCreated = (type: string): void =>
  trackEvent('assessment_created', { event_category: 'teacher', event_label: type, type });

export const trackChallengeCreated = (type: string): void =>
  trackEvent('challenge_created', { event_category: 'teacher', event_label: type, type });

export const trackClassCreated = (): void =>
  trackEvent('class_created', { event_category: 'teacher' });

