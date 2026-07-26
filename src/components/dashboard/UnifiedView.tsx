import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Calendar, 
  Brain, 
  HelpCircle, 
  Trophy, 
  BookOpen,
  ArrowRight,
  Plus,
  Target,
  Users,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { NotesUpload } from "./NotesUpload";
import { GoalSelection, LearningGoal } from "./GoalSelection";
import { GoalSpecificExperience } from "./GoalSpecificExperience";
import { RevisionPlans } from "./RevisionPlans";
import { RevisionPlanCreator } from "./RevisionPlanCreator";
import { Flashcards } from "./Flashcards";
import { Quizzes } from "./Quizzes";
import { Contests } from "./Contests";
import { Progress } from "./Progress";
import { MarketplaceView } from "./MarketplaceView";
import { LessonPlanner } from "./LessonPlanner";
import { MyResources } from "./MyResources";
import { CreateFlashcards } from "./CreateFlashcards";
import { AssessmentBuilder } from "./AssessmentBuilder";
import { StudentAnalytics } from "./StudentAnalytics";
import { Classroom } from "./Classroom";
import { AICompanion } from "./AICompanion";
import { TeacherDashboard } from "./TeacherDashboard";
import { AIContentGenerator } from "./AIContentGenerator";
import { StudentManagement } from "./StudentManagement";
import { ContentViewer } from "./ContentViewer";

interface UnifiedViewProps {
  mainView: 'notes' | 'flashcards' | 'progress';
  userType: 'student' | 'teacher';
  setCurrentView: (view: any) => void;
}

export function UnifiedView({ mainView, userType, setCurrentView }: UnifiedViewProps) {
  const [subView, setSubView] = useState<string | null>(null);
  const [uploadedNotes, setUploadedNotes] = useState<{ notes: string; fileName?: string } | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);
  const [currentFlow, setCurrentFlow] = useState<'upload' | 'creator' | 'experience'>('upload');
  const [isAICompanionOpen, setIsAICompanionOpen] = useState(false);
  const [teacherContentType, setTeacherContentType] = useState<string | null>(null);
  const [viewingContent, setViewingContent] = useState<any>(null);

  // Handle notes submission
  const handleNotesSubmit = (notes: string, fileName?: string) => {
    setUploadedNotes({ notes, fileName });
    setCurrentFlow('creator');
  };

  // Handle plan creation completion
  const handlePlanCreated = (plan: any) => {
    setCurrentFlow('experience');
  };

  // Handle back navigation
  const handleBackToUpload = () => {
    setCurrentFlow('upload');
    setUploadedNotes(null);
    setSelectedGoals([]);
  };

  const handleBackToCreator = () => {
    setCurrentFlow('creator');
  };

  // Handle back to main view
  const onBack = () => {
    setSubView(null);
    setCurrentFlow('upload');
    setUploadedNotes(null);
    setSelectedGoals([]);
  };

  // Handle AI companion quick actions
  const handleAICompanionAction = (action: string, data?: any) => {
    switch (action) {
      case 'create_flashcards':
        setCurrentView({ mainView: 'flashcards', subView: 'flashcards' });
        break;
      case 'start_quiz':
        setCurrentView({ mainView: 'flashcards', subView: 'quizzes' });
        break;
      case 'view_progress':
        setCurrentView({ mainView: 'progress', subView: 'progress' });
        break;
      case 'study_plan':
        setCurrentView({ mainView: 'notes', subView: 'upload' });
        break;
      case 'help_with_topic':
        // Keep AI companion open and let user ask for help
        break;
      case 'take_break':
        // Could implement break timer or suggestions
        break;
      default:
        console.log('Unknown AI companion action:', action);
    }
  };

  // Handle teacher content actions
  const handleTeacherContentAction = (type: string, action: string, contentData?: any) => {
    if (action === 'create') {
      setTeacherContentType(type);
    } else if (action === 'upload') {
      setTeacherContentType('upload');
    } else if (action === 'enter') {
      setTeacherContentType('topic');
    } else if (action === 'assign') {
      // Navigate to student management with assignment context
      setCurrentView({ mainView: 'notes', subView: 'student-management' });
    } else if (action === 'view') {
      // Show content viewer
      setViewingContent(contentData);
    }
  };

  // Handle teacher content save
  const handleTeacherContentSave = (content: any) => {
    console.log('Content saved:', content);
    
    // Save to localStorage
    const savedContent = JSON.parse(localStorage.getItem('teacherContent') || '[]');
    savedContent.push(content);
    localStorage.setItem('teacherContent', JSON.stringify(savedContent));
    
    setTeacherContentType(null);
    
    // Refresh the teacher dashboard if it's currently visible
    // This will trigger a re-render with the new content
    window.dispatchEvent(new CustomEvent('contentUpdated'));
  };

  // Student sub-views
  const studentSubViews = {
    notes: [
      { id: 'upload', title: 'Upload Notes', icon: Upload, description: 'Add study materials', component: () => {
        if (currentFlow === 'upload') {
          return <NotesUpload onNotesSubmit={handleNotesSubmit} onBack={onBack} />;
        } else if (currentFlow === 'creator') {
          return (
            <RevisionPlanCreator 
              onComplete={handlePlanCreated}
              onBack={handleBackToUpload}
              initialNotes={uploadedNotes?.notes}
              initialFileName={uploadedNotes?.fileName}
            />
          );
        } else if (currentFlow === 'experience') {
          return (
            <div className="space-y-6">
              <Button variant="ghost" onClick={handleBackToCreator} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Creator
              </Button>
              <GoalSpecificExperience 
                notes={uploadedNotes?.notes || ''}
                fileName={uploadedNotes?.fileName}
                selectedGoals={selectedGoals}
                onBack={handleBackToCreator}
                onComplete={() => {
                  // Reset flow when complete
                  setCurrentFlow('upload');
                  setUploadedNotes(null);
                  setSelectedGoals([]);
                }}
              />
            </div>
          );
        }
        return <NotesUpload onNotesSubmit={handleNotesSubmit} onBack={onBack} />;
      } },
      { id: 'revision', title: 'Revision Plans', icon: Calendar, description: 'AI-generated study plans', component: RevisionPlans },
    ],
    flashcards: [
      { id: 'flashcards', title: 'Flashcards', icon: Brain, description: 'Smart flashcards', component: Flashcards },
      { id: 'quizzes', title: 'Practice Quizzes', icon: HelpCircle, description: 'Test your knowledge', component: Quizzes },
      { id: 'contests', title: 'Contests', icon: Trophy, description: 'Compete with peers', component: Contests },
    ],
    progress: [
      { id: 'progress', title: 'Learning Analytics', icon: Target, description: 'Track your progress', component: Progress },
      { id: 'marketplace', title: 'Marketplace', icon: BookOpen, description: 'Browse resources', component: () => <MarketplaceView userType={userType} /> },
    ]
  };

  // Teacher sub-views
  const teacherSubViews = {
    notes: [
      { id: 'teacher-dashboard', title: 'Teacher Dashboard', icon: Users, description: 'Create and manage content', component: () => <TeacherDashboard onContentAction={handleTeacherContentAction} /> },
      { id: 'student-management', title: 'Student Management', icon: Users, description: 'Manage students and assignments', component: StudentManagement },
      { id: 'upload', title: 'Upload Notes', icon: Upload, description: 'Add teaching materials', component: () => {
        if (currentFlow === 'upload') {
          return <NotesUpload onNotesSubmit={handleNotesSubmit} onBack={onBack} />;
        } else if (currentFlow === 'creator') {
          return (
            <RevisionPlanCreator 
              onComplete={handlePlanCreated}
              onBack={handleBackToUpload}
              initialNotes={uploadedNotes?.notes}
              initialFileName={uploadedNotes?.fileName}
            />
          );
        } else if (currentFlow === 'experience') {
          return (
            <div className="space-y-6">
              <Button variant="ghost" onClick={handleBackToCreator} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Creator
              </Button>
              <GoalSpecificExperience 
                notes={uploadedNotes?.notes || ''}
                fileName={uploadedNotes?.fileName}
                selectedGoals={selectedGoals}
                onBack={handleBackToCreator}
                onComplete={() => {
                  // Reset flow when complete
                  setCurrentFlow('upload');
                  setUploadedNotes(null);
                  setSelectedGoals([]);
                }}
              />
            </div>
          );
        }
        return <NotesUpload onNotesSubmit={handleNotesSubmit} onBack={onBack} />;
      } },
      { id: 'lesson-planner', title: 'Lesson Planner', icon: Target, description: 'Create lesson plans', component: LessonPlanner },
      { id: 'resources', title: 'My Resources', icon: BookOpen, description: 'Manage resources', component: MyResources },
    ],
    flashcards: [
      { id: 'create-flashcards', title: 'Create Flashcards', icon: Brain, description: 'Generate flashcards', component: CreateFlashcards },
      { id: 'assessment', title: 'Assessment Builder', icon: HelpCircle, description: 'Build assessments', component: AssessmentBuilder },
      { id: 'classroom', title: 'Classroom', icon: Users, description: 'Manage classroom', component: Classroom },
    ],
    progress: [
      { id: 'analytics', title: 'Student Analytics', icon: Target, description: 'Track student progress', component: StudentAnalytics },
      { id: 'marketplace', title: 'Marketplace', icon: BookOpen, description: 'Browse resources', component: () => <MarketplaceView userType={userType} /> },
    ]
  };

  const subViews = userType === 'teacher' ? teacherSubViews : studentSubViews;
  const currentSubViews = subViews[mainView] || [];

  // If viewing content, render content viewer
  if (userType === 'teacher' && viewingContent) {
    return (
      <ContentViewer
        content={viewingContent}
        onBack={() => setViewingContent(null)}
        onEdit={() => {
          setViewingContent(null);
          setTeacherContentType(viewingContent.type);
        }}
        onAssign={() => {
          setViewingContent(null);
          setCurrentView({ mainView: 'notes', subView: 'student-management' });
        }}
      />
    );
  }

  // If teacher content generator is active, render it
  if (userType === 'teacher' && teacherContentType) {
    return (
      <AIContentGenerator
        contentType={teacherContentType as any}
        onBack={() => setTeacherContentType(null)}
        onSave={handleTeacherContentSave}
      />
    );
  }

  // If a specific sub-view is selected, render it
  if (subView) {
    const selectedSubView = currentSubViews.find(view => view.id === subView);
    if (selectedSubView) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSubView(null)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to {mainView === 'notes' ? (userType === 'teacher' ? 'Create' : 'Study') : mainView === 'flashcards' ? (userType === 'teacher' ? 'Assess' : 'Practice') : 'Analytics'}
            </Button>
          </div>
          <selectedSubView.component />
        </div>
      );
    }
  }

  // Render the sub-view selection
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {mainView === 'notes' && (userType === 'teacher' ? 'Create & Manage' : 'Study & Learn')}
          {mainView === 'flashcards' && (userType === 'teacher' ? 'Assess & Engage' : 'Practice & Test')}
          {mainView === 'progress' && 'Analytics & Insights'}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {mainView === 'notes' && (userType === 'teacher' ? 'Create engaging lessons and manage your teaching resources' : 'Upload notes and create personalized revision plans')}
          {mainView === 'flashcards' && (userType === 'teacher' ? 'Build assessments and manage your classroom activities' : 'Practice with flashcards, quizzes, and competitive contests')}
          {mainView === 'progress' && 'Track your learning progress and discover new resources'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {currentSubViews.map((subViewItem, index) => (
          <Card 
            key={subViewItem.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-200"
            onClick={() => setSubView(subViewItem.id)}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <subViewItem.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {subViewItem.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {subViewItem.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  {userType === 'teacher' ? 'Teacher Tool' : 'Student Tool'}
                </Badge>
                <Button size="sm" variant="outline" className="group">
                  Open
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {mainView === 'notes' && (userType === 'teacher' ? 'Need Help Getting Started?' : 'Ready to Start Learning?')}
              {mainView === 'flashcards' && 'Want to Practice More?'}
              {mainView === 'progress' && 'Want to See More Insights?'}
            </h3>
            <p className="text-slate-600 mb-4">
              {mainView === 'notes' && (userType === 'teacher' ? 'Create your first lesson plan in minutes with AI assistance' : 'Upload your notes and let AI create a personalized study plan')}
              {mainView === 'flashcards' && 'Try our AI-generated practice materials to improve your performance'}
              {mainView === 'progress' && 'Explore detailed analytics and performance insights'}
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              onClick={() => setSubView(currentSubViews[0]?.id)}
            >
              <Plus className="w-5 h-5 mr-2" />
              {mainView === 'notes' && (userType === 'teacher' ? 'Create First Lesson' : 'Start Learning')}
              {mainView === 'flashcards' && 'Start Practicing'}
              {mainView === 'progress' && 'View Analytics'}
            </Button>
          </div>
        </Card>
      </div>

      {/* AI Companion */}
      {userType === 'student' && (
        <AICompanion
          isOpen={isAICompanionOpen}
          onToggle={() => setIsAICompanionOpen(!isAICompanionOpen)}
          onQuickAction={handleAICompanionAction}
        />
      )}
    </div>
  );
}
