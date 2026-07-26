import { StudentContentViewer } from './StudentContentViewer';

// Demo component to show how shared content appears to students
export function StudentContentDemo() {
  const sampleContent = {
    id: 'demo-123',
    type: 'lesson',
    title: 'No content available',
    subject: 'General',
    grade: 'All Grades',
    teacherName: 'No Teacher',
    schoolName: 'No School',
    content: 'No content has been shared with you yet. Check back later for new learning materials.'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <StudentContentViewer content={sampleContent} />
    </div>
  );
}
