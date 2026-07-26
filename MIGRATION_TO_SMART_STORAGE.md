# Migration Guide: From Old Storage to Smart Storage

## Overview

This guide helps you migrate existing components from using direct localStorage to the new Smart Storage System.

## Before vs After

### ❌ Before (Old Way)

```typescript
// Direct localStorage usage - prone to errors
function MyComponent() {
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    // Manually parse localStorage
    const stored = localStorage.getItem('flashcards');
    if (stored) {
      try {
        setFlashcards(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing flashcards:', error);
      }
    }
  }, []);

  const createFlashcard = (data) => {
    // Manually create ID
    const id = Date.now().toString();
    const newCard = { ...data, id, createdAt: new Date().toISOString() };
    
    // Manually update state and localStorage
    const updated = [...flashcards, newCard];
    setFlashcards(updated);
    localStorage.setItem('flashcards', JSON.stringify(updated));
  };

  // No type safety, no cloud sync, manual error handling
}
```

### ✅ After (Smart Storage Way)

```typescript
// Type-safe, cloud-synced, automatic error handling
import { useFlashcards } from '@/hooks/useSmartStorage';

function MyComponent() {
  const { flashcards, loading, createFlashcard } = useFlashcards();

  // Automatic ID generation, timestamps, and cloud sync!
  const handleCreate = () => {
    createFlashcard({
      subject: 'Mathematics',
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy',
      reviewCount: 0,
      masteryLevel: 0
    });
  };

  if (loading) return <div>Loading...</div>;

  // Type-safe flashcards array with IntelliSense support
}
```

## Migration Steps

### Step 1: Identify Current Storage Usage

Search for direct localStorage usage:
```bash
# Find all localStorage.getItem calls
grep -r "localStorage.getItem" src/

# Find all localStorage.setItem calls
grep -r "localStorage.setItem" src/
```

### Step 2: Replace with Hooks

#### Example 1: User Profile

**Before:**
```typescript
const [profile, setProfile] = useState(null);

useEffect(() => {
  const data = localStorage.getItem('userProfile');
  if (data) setProfile(JSON.parse(data));
}, []);

const updateProfile = (updates) => {
  const updated = { ...profile, ...updates };
  setProfile(updated);
  localStorage.setItem('userProfile', JSON.stringify(updated));
};
```

**After:**
```typescript
import { useUserProfile } from '@/hooks/useSmartStorage';

const { profile, loading, updateProfile } = useUserProfile();

// That's it! Just use updateProfile directly
updateProfile({ name: 'New Name' });
```

#### Example 2: Flashcards

**Before:**
```typescript
const [flashcards, setFlashcards] = useState([]);

const getAllFlashcards = () => {
  const stored = localStorage.getItem('flashcards');
  return stored ? JSON.parse(stored) : [];
};

const addFlashcard = (card) => {
  const all = getAllFlashcards();
  all.push({ ...card, id: Date.now() });
  localStorage.setItem('flashcards', JSON.stringify(all));
  setFlashcards(all);
};
```

**After:**
```typescript
import { useFlashcards } from '@/hooks/useSmartStorage';

const { flashcards, createFlashcard, updateFlashcard, deleteFlashcard } = useFlashcards();

// All operations handled automatically
createFlashcard({ /* data */ });
updateFlashcard(id, { /* updates */ });
deleteFlashcard(id);
```

#### Example 3: Study Sessions

**Before:**
```typescript
const saveSessions = (session) => {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  sessions.push(session);
  localStorage.setItem('sessions', JSON.stringify(sessions));
};
```

**After:**
```typescript
import { useStudySessions } from '@/hooks/useSmartStorage';

const { createSession } = useStudySessions();

createSession({
  subject: 'Mathematics',
  topic: 'Algebra',
  startTime: new Date().toISOString(),
  duration: 30,
  contentType: 'notes'
});
```

### Step 3: Update Component Files

For each component using localStorage:

1. **Remove** manual localStorage operations
2. **Import** appropriate hook from `@/hooks/useSmartStorage`
3. **Replace** state management with hook
4. **Update** function calls to use hook methods
5. **Remove** manual ID generation
6. **Remove** manual timestamp creation
7. **Add** loading states if needed

### Step 4: Test the Migration

```typescript
// Test that data still works
import { smartStorage } from '@/services/smartStorageService';

// Check existing data
console.log('Flashcards:', smartStorage.getAllFlashcards());
console.log('User Profile:', smartStorage.getUserProfile());
console.log('Study Sessions:', smartStorage.getAllStudySessions());
```

## Common Migration Patterns

### Pattern 1: Simple CRUD Operations

**Before:**
```typescript
// Create
const create = (data) => {
  const items = getAll();
  items.push({ ...data, id: Date.now() });
  save(items);
};

// Read
const getAll = () => JSON.parse(localStorage.getItem('key') || '[]');

// Update
const update = (id, updates) => {
  const items = getAll();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    save(items);
  }
};

// Delete
const remove = (id) => {
  const items = getAll().filter(i => i.id !== id);
  save(items);
};

const save = (items) => localStorage.setItem('key', JSON.stringify(items));
```

**After:**
```typescript
import { useFlashcards } from '@/hooks/useSmartStorage';

const { 
  flashcards,           // Read
  createFlashcard,      // Create
  updateFlashcard,      // Update
  deleteFlashcard       // Delete
} = useFlashcards();

// Everything is handled automatically!
```

### Pattern 2: Filtered Data

**Before:**
```typescript
const getBySubject = (subject) => {
  const all = JSON.parse(localStorage.getItem('items') || '[]');
  return all.filter(item => item.subject === subject);
};
```

**After:**
```typescript
import { useFlashcards } from '@/hooks/useSmartStorage';

// Pass subject as parameter
const { flashcards } = useFlashcards('Mathematics');
// Returns only Mathematics flashcards
```

### Pattern 3: Progress Tracking

**Before:**
```typescript
const updateProgress = (subject, minutes) => {
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  progress[subject] = (progress[subject] || 0) + minutes;
  localStorage.setItem('progress', JSON.stringify(progress));
};
```

**After:**
```typescript
import { useProgressMetrics } from '@/hooks/useSmartStorage';

const { metrics, updateMetrics } = useProgressMetrics('Mathematics');

updateMetrics('Mathematics', {
  totalStudyTime: (metrics?.totalStudyTime || 0) + minutes
});
```

## Component-Specific Migrations

### RevisionPlans Component

```typescript
// Before: Manual storage
const saveRevisionPlan = (plan) => {
  const plans = JSON.parse(localStorage.getItem('revisionPlans') || '[]');
  plans.push(plan);
  localStorage.setItem('revisionPlans', JSON.stringify(plans));
};

// After: Using hook
import { useRevisionPlans } from '@/hooks/useSmartStorage';

const { plans, createPlan, addFeedback } = useRevisionPlans();

createPlan({
  subject: 'Physics',
  topic: "Newton's Laws",
  scheduledDates: [/* dates */],
  completedDates: []
});

// Add feedback after revision session
addFeedback(planId, {
  date: new Date().toISOString(),
  confidence: 'high',
  notes: 'Great progress!',
  questionsNeedingReview: []
});
```

### CreateFlashcards Component

```typescript
// Before
const saveFlashcard = (data) => {
  const cards = JSON.parse(localStorage.getItem('flashcards') || '[]');
  cards.push({
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('flashcards', JSON.stringify(cards));
};

// After
import { useFlashcards } from '@/hooks/useSmartStorage';

const { createFlashcard } = useFlashcards();

createFlashcard({
  subject: formData.subject,
  question: formData.question,
  answer: formData.answer,
  difficulty: formData.difficulty,
  reviewCount: 0,
  masteryLevel: 0
});
```

### Dashboard Component

Already migrated! The Dashboard now:
- ✅ Auto-runs migrations on startup
- ✅ Uses smart storage for user profile
- ✅ Includes debug logging

## Migration Checklist

- [ ] Identify all localStorage usage
- [ ] Replace with appropriate hooks
- [ ] Remove manual ID generation
- [ ] Remove manual timestamp creation
- [ ] Add loading states
- [ ] Test CRUD operations
- [ ] Test data persistence
- [ ] Test cloud sync
- [ ] Remove old localStorage keys
- [ ] Update tests

## Testing After Migration

```typescript
// 1. Test data creation
const { createFlashcard } = useFlashcards();
createFlashcard({ /* data */ });

// 2. Verify in localStorage
console.log(localStorage.getItem('mytuta_flashcards'));

// 3. Verify cloud sync
const { syncToCloud } = useCloudSync();
await syncToCloud();

// 4. Check Supabase
// Open Supabase dashboard and verify data in tables
```

## Rollback Plan

If issues arise:

1. **Keep old localStorage keys** until migration is stable
2. **Export data** before migration: `smartStorage.exportData()`
3. **Import back** if needed: `smartStorage.importData(jsonData)`
4. **Monitor errors** in console

## Benefits After Migration

- ✅ **Type Safety**: No more runtime errors from incorrect types
- ✅ **Auto IDs**: No manual ID generation needed
- ✅ **Timestamps**: Automatic created/updated timestamps
- ✅ **Cloud Sync**: Automatic backup to Supabase
- ✅ **Offline Support**: Works without internet
- ✅ **Easy Testing**: Simple to test with mock data
- ✅ **Better DX**: IntelliSense and autocomplete support
- ✅ **Organized Code**: Clear separation of concerns

## Need Help?

Refer to:
- [Smart Storage Guide](src/docs/SMART_STORAGE_GUIDE.md) - Comprehensive usage guide
- [Smart Storage README](SMART_STORAGE_README.md) - Quick start guide
- [Example Component](src/components/dashboard/RevisionFeedbackDialog.tsx) - Working example

---

**Happy Migrating! 🚀**

