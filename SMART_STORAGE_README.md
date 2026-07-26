# 🧠 mytuta Smart Storage System

A comprehensive, type-safe storage solution for the mytuta AI learning platform.

## 🌟 Features

- ✅ **Type-Safe**: Full TypeScript support with comprehensive interfaces
- ✅ **Local Storage**: Automatic persistence with browser localStorage
- ✅ **Cloud Sync**: Optional Supabase synchronization
- ✅ **React Hooks**: Easy integration with React components
- ✅ **Data Migration**: Automatic migration from legacy storage formats
- ✅ **Import/Export**: Backup and restore functionality
- ✅ **Organized Storage**: Namespaced keys with `mytuta_` prefix
- ✅ **Sync Queue**: Offline-first with automatic retry on reconnect

## 📁 File Structure

```
src/
├── types/
│   └── storage.ts                    # TypeScript interfaces for all data types
├── services/
│   ├── smartStorageService.ts        # Core storage service (singleton)
│   └── storageMigration.ts           # Migration utilities
├── hooks/
│   └── useSmartStorage.ts            # React hooks for storage
├── docs/
│   └── SMART_STORAGE_GUIDE.md        # Comprehensive usage guide
└── components/
    └── dashboard/
        └── RevisionFeedbackDialog.tsx # Example implementation

supabase/
└── migrations/
    └── 20250113_smart_storage_tables.sql # Database schema
```

## 🚀 Quick Start

### 1. Import and Use Hooks

```typescript
import { useFlashcards, useRevisionPlans } from '@/hooks/useSmartStorage';

function MyComponent() {
  const { flashcards, createFlashcard } = useFlashcards('Mathematics');
  const { plans, addFeedback } = useRevisionPlans();

  // Create a flashcard
  const handleCreate = () => {
    createFlashcard({
      subject: 'Mathematics',
      question: 'What is the Pythagorean theorem?',
      answer: 'a² + b² = c²',
      difficulty: 'medium',
      reviewCount: 0,
      masteryLevel: 0
    });
  };

  return <div>{/* Your UI */}</div>;
}
```

### 2. Add Revision Feedback

```typescript
import { useRevisionPlans } from '@/hooks/useSmartStorage';

function RevisionSession() {
  const { addFeedback } = useRevisionPlans();

  const saveFeedback = (planId: string) => {
    addFeedback(planId, {
      date: new Date().toISOString(),
      confidence: 'high',
      notes: 'Understood the concepts well!',
      questionsNeedingReview: ['Question 5', 'Question 12']
    });
  };
}
```

## 📊 Available Data Types

### Student Data
- **UserProfile** - User information and preferences
- **StudySession** - Individual study session records
- **Flashcard** - Individual flashcards with spaced repetition
- **FlashcardSet** - Collections of flashcards
- **StudyNote** - Written notes and study materials
- **Quiz** - Quiz definitions and questions
- **QuizAttempt** - Quiz attempt records with scores
- **LearningPath** - Structured learning journeys
- **RevisionPlan** - Spaced repetition schedules with feedback
- **ProgressMetrics** - Subject-wise progress tracking
- **Achievement** - Earned badges and milestones
- **Contest** - Competitive challenges
- **ContestAttempt** - Contest participation records

### Teacher Data
- **TeacherClass** - Class management
- **Assignment** - Homework and assignments
- **StudentProgress** - Student performance tracking

## 🔄 Data Flow

```
Component
    ↓ (uses hook)
React Hook (useSmartStorage)
    ↓ (calls service)
SmartStorageService
    ↓ (stores locally)
localStorage (mytuta_*)
    ↓ (queues for sync)
Sync Queue
    ↓ (syncs when online)
Supabase Cloud Database
```

## 🔐 Security & Privacy

- **Row Level Security (RLS)**: All Supabase tables protected with RLS policies
- **User Isolation**: Users can only access their own data
- **Secure Sync**: Authentication required for cloud operations
- **Local First**: Data works offline, syncs when online

## 📦 Storage Capacity

- **localStorage**: ~5-10MB per domain (browser dependent)
- **Cloud Storage**: Unlimited (Supabase)
- **Recommendation**: Enable cloud sync for heavy users

## 🔧 Configuration

### Enable Auto-Sync

```typescript
import { useCloudSync } from '@/hooks/useSmartStorage';

function App() {
  const { syncToCloud } = useCloudSync();

  useEffect(() => {
    // Auto-sync every 5 minutes
    const interval = setInterval(() => {
      syncToCloud();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [syncToCloud]);
}
```

### Migration on Startup

The Dashboard component automatically runs migrations:

```typescript
// In Dashboard.tsx
useEffect(() => {
  if (StorageMigration.needsMigration()) {
    StorageMigration.runAllMigrations();
  }
}, []);
```

## 📈 Performance

- **Fast Reads**: localStorage is synchronous and fast
- **Optimized Queries**: Subject-specific filtering reduces overhead
- **Lazy Loading**: Only load data when needed
- **Indexed Searches**: Supabase tables have proper indexes

## 🧪 Testing

```typescript
// Test storage operations
import { smartStorage } from '@/services/smartStorageService';

// Create test flashcard
const flashcard = smartStorage.createFlashcard({
  subject: 'Test',
  question: 'Test question',
  answer: 'Test answer',
  difficulty: 'easy',
  reviewCount: 0,
  masteryLevel: 0
});

// Verify it was created
const all = smartStorage.getAllFlashcards();
console.log('Total flashcards:', all.length);

// Clean up
smartStorage.deleteFlashcard(flashcard.id);
```

## 🐛 Debugging

Enable debug logging:

```typescript
// In Dashboard.tsx
console.log('DashboardOverview - Profile from localStorage:', profile);
console.log('Dashboard - User has complete profile, bypassing welcome screen');
```

Check storage contents:

```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('mytuta_'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  });
```

## 📱 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ⚠️ Private/Incognito mode (localStorage may be limited)

## 🔄 Data Backup & Restore

### Export Data

```typescript
import { smartStorage } from '@/services/smartStorageService';

const exportData = () => {
  const jsonData = smartStorage.exportData();
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mytuta-backup-${new Date().toISOString()}.json`;
  a.click();
};
```

### Import Data

```typescript
import { smartStorage } from '@/services/smartStorageService';

const importData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const jsonData = e.target?.result as string;
    smartStorage.importData(jsonData);
  };
  reader.readAsText(file);
};
```

## 🎯 Best Practices

1. **Always use hooks** in React components
2. **Enable cloud sync** for persistence across devices
3. **Validate data** before saving
4. **Handle errors** gracefully
5. **Use TypeScript types** for type safety
6. **Refresh data** after external changes
7. **Test offline functionality** regularly

## 📚 Additional Resources

- [Comprehensive Usage Guide](src/docs/SMART_STORAGE_GUIDE.md)
- [Type Definitions](src/types/storage.ts)
- [Database Schema](supabase/migrations/20250113_smart_storage_tables.sql)
- [Example Implementation](src/components/dashboard/RevisionFeedbackDialog.tsx)

## 🤝 Contributing

When adding new data types:

1. Add interface to `src/types/storage.ts`
2. Add methods to `SmartStorageService`
3. Create React hook in `useSmartStorage.ts`
4. Add Supabase table in migration file
5. Update documentation

## 📄 License

Part of the mytuta AI learning platform.

---

**Built with ❤️ for better learning experiences**

