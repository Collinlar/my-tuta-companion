# Smart Storage System Guide

## Overview

The Smart Storage System provides a centralized, type-safe way to manage all data in the mytuta application. It includes:

- ✅ **TypeScript interfaces** for all data types
- ✅ **Local storage** with automatic persistence
- ✅ **Cloud sync** with Supabase (optional)
- ✅ **React hooks** for easy integration
- ✅ **Data migration** utilities
- ✅ **Import/Export** functionality

## Quick Start

### 1. Using React Hooks (Recommended)

The easiest way to use the storage system is through the provided React hooks:

```typescript
import { useUserProfile, useFlashcards, useStudySessions } from '@/hooks/useSmartStorage';

function MyComponent() {
  // Get user profile
  const { profile, updateProfile } = useUserProfile();
  
  // Get flashcards for a specific subject
  const { flashcards, createFlashcard, updateFlashcard } = useFlashcards('Mathematics');
  
  // Get study sessions
  const { sessions, createSession } = useStudySessions();
  
  return (
    <div>
      <h1>Welcome, {profile?.name}</h1>
      <p>You have {flashcards.length} flashcards</p>
    </div>
  );
}
```

### 2. Direct Service Usage

For more control, use the storage service directly:

```typescript
import { smartStorage } from '@/services/smartStorageService';

// Create a flashcard
const flashcard = smartStorage.createFlashcard({
  subject: 'Mathematics',
  question: 'What is 2 + 2?',
  answer: '4',
  difficulty: 'easy',
  reviewCount: 0,
  masteryLevel: 0
});

// Get all flashcards
const allFlashcards = smartStorage.getAllFlashcards();

// Get flashcards for a subject
const mathFlashcards = smartStorage.getFlashcardsBySubject('Mathematics');
```

## Available Hooks

### User Data

#### `useUserProfile()`
```typescript
const { profile, loading, updateProfile, saveProfile } = useUserProfile();
```

#### `useUserPreferences()`
```typescript
const { preferences, loading, updatePreferences, savePreferences } = useUserPreferences();
```

### Study Content

#### `useFlashcards(subject?)`
```typescript
const { 
  flashcards, 
  loading, 
  createFlashcard, 
  updateFlashcard, 
  deleteFlashcard,
  getDueForReview,
  refresh 
} = useFlashcards('Mathematics');
```

#### `useFlashcardSets()`
```typescript
const { sets, loading, createSet, updateSet, refresh } = useFlashcardSets();
```

#### `useStudyNotes(subject?)`
```typescript
const { notes, loading, createNote, updateNote, deleteNote, refresh } = useStudyNotes();
```

#### `useQuizzes()`
```typescript
const { quizzes, loading, createQuiz, updateQuiz, getQuiz, refresh } = useQuizzes();
```

### Progress Tracking

#### `useStudySessions(subject?)`
```typescript
const { sessions, loading, createSession, updateSession, refresh } = useStudySessions();
```

#### `useProgressMetrics(subject?)`
```typescript
const { metrics, loading, updateMetrics, refresh } = useProgressMetrics('Mathematics');
```

#### `useAchievements()`
```typescript
const { achievements, loading, createAchievement, refresh } = useAchievements();
```

### Learning Paths & Revision

#### `useLearningPaths()`
```typescript
const { paths, loading, createPath, updatePath, getPath, refresh } = useLearningPaths();
```

#### `useRevisionPlans(subject?)`
```typescript
const { plans, loading, createPlan, updatePlan, addFeedback, refresh } = useRevisionPlans();
```

### Cloud Sync

#### `useCloudSync()`
```typescript
const { syncing, lastSync, syncToCloud, syncFromCloud } = useCloudSync();

// Sync local data to cloud
await syncToCloud();

// Sync cloud data to local
await syncFromCloud();
```

## Common Use Cases

### 1. Creating and Managing Flashcards

```typescript
function FlashcardManager() {
  const { flashcards, createFlashcard, updateFlashcard } = useFlashcards();
  
  const handleCreateFlashcard = async () => {
    const newFlashcard = createFlashcard({
      subject: 'Biology',
      topic: 'Cell Structure',
      question: 'What is the powerhouse of the cell?',
      answer: 'Mitochondria',
      difficulty: 'easy',
      tags: ['cells', 'organelles'],
      reviewCount: 0,
      masteryLevel: 0
    });
    
    console.log('Created flashcard:', newFlashcard);
  };
  
  const handleReviewFlashcard = (id: string) => {
    updateFlashcard(id, {
      reviewCount: flashcards.find(f => f.id === id)!.reviewCount + 1,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    });
  };
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

### 2. Tracking Study Sessions

```typescript
function StudyTimer() {
  const { createSession, updateSession } = useStudySessions();
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  
  const startStudySession = () => {
    const session = createSession({
      subject: 'Mathematics',
      topic: 'Algebra',
      startTime: new Date().toISOString(),
      duration: 0,
      contentType: 'notes',
      mood: 'focused'
    });
    
    setCurrentSession(session);
  };
  
  const endStudySession = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - new Date(currentSession.startTime).getTime()) / 60000
      );
      
      updateSession(currentSession.id, {
        endTime: endTime.toISOString(),
        duration,
        performance: {
          accuracy: 85,
          questionsAnswered: 20,
          correctAnswers: 17
        }
      });
      
      setCurrentSession(null);
    }
  };
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

### 3. Managing Revision Plans with Feedback

```typescript
function RevisionManager() {
  const { plans, createPlan, addFeedback } = useRevisionPlans();
  
  const createNewRevisionPlan = () => {
    const plan = createPlan({
      subject: 'Physics',
      topic: 'Newton\'s Laws',
      scheduledDates: [
        new Date().toISOString(),
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month
      ],
      completedDates: []
    });
    
    return plan;
  };
  
  const addRevisionFeedback = (planId: string) => {
    addFeedback(planId, {
      date: new Date().toISOString(),
      confidence: 'high',
      notes: 'Understood the concepts well. Need to practice more numerical problems.',
      questionsNeedingReview: ['Problem 5', 'Problem 12']
    });
  };
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

### 4. Updating Progress Metrics

```typescript
function ProgressTracker() {
  const { metrics, updateMetrics } = useProgressMetrics('Mathematics');
  
  useEffect(() => {
    // Update metrics after a study session
    const updateAfterSession = (session: StudySession) => {
      if (metrics) {
        updateMetrics('Mathematics', {
          totalStudyTime: metrics.totalStudyTime + session.duration,
          sessionsCompleted: metrics.sessionsCompleted + 1,
          averageSessionDuration: 
            (metrics.totalStudyTime + session.duration) / (metrics.sessionsCompleted + 1),
          lastStudyDate: new Date().toISOString()
        });
      }
    };
  }, []);
  
  return (
    <div>
      {metrics && (
        <>
          <p>Total Study Time: {metrics.totalStudyTime} minutes</p>
          <p>Sessions Completed: {metrics.sessionsCompleted}</p>
          <p>Streak Days: {metrics.streakDays}</p>
        </>
      )}
    </div>
  );
}
```

## Data Migration

The system automatically migrates existing localStorage data:

```typescript
import { StorageMigration } from '@/services/storageMigration';

// Check if migration is needed
if (StorageMigration.needsMigration()) {
  // Run all migrations
  StorageMigration.runAllMigrations();
}
```

## Import/Export Data

```typescript
import { smartStorage } from '@/services/smartStorageService';

// Export all data as JSON
const exportData = () => {
  const jsonData = smartStorage.exportData();
  
  // Download as file
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mytuta-data-export.json';
  a.click();
};

// Import data from JSON
const importData = (jsonData: string) => {
  smartStorage.importData(jsonData);
};
```

## Cloud Sync

Enable automatic cloud synchronization with Supabase:

```typescript
import { useCloudSync } from '@/hooks/useSmartStorage';

function SyncManager() {
  const { syncing, lastSync, syncToCloud, syncFromCloud } = useCloudSync();
  
  // Auto-sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      syncToCloud();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {syncing ? 'Syncing...' : 'Synced'}
      {lastSync && <p>Last sync: {lastSync.toLocaleString()}</p>}
      <button onClick={syncToCloud}>Sync Now</button>
    </div>
  );
}
```

## Type Definitions

All types are defined in `src/types/storage.ts`:

- `UserProfile`
- `StudySession`
- `Flashcard`
- `FlashcardSet`
- `StudyNote`
- `Quiz` & `QuizAttempt`
- `LearningPath`
- `RevisionPlan` & `RevisionFeedback`
- `ProgressMetrics`
- `UserPreferences`
- `Achievement`
- `Contest` & `ContestAttempt`
- `TeacherClass`
- `StudentProgress`
- `Assignment`

## Best Practices

1. **Use Hooks**: Always prefer using React hooks over direct service access
2. **Type Safety**: Leverage TypeScript types for all data operations
3. **Error Handling**: Wrap operations in try-catch blocks
4. **Cloud Sync**: Enable auto-sync for better data persistence
5. **Data Validation**: Validate data before saving
6. **Refresh Data**: Use the `refresh()` function after external changes
7. **Performance**: Use subject-specific queries to reduce data overhead

## Troubleshooting

### Data Not Persisting
- Check browser localStorage limits
- Verify data is being saved with correct keys
- Check for JavaScript errors in console

### Cloud Sync Not Working
- Verify Supabase connection
- Check authentication status
- Review sync queue for failed operations

### Migration Issues
- Clear old localStorage data manually if needed
- Check migration logs in console
- Verify data structure matches expected format

