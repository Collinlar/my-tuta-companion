import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotesUpload } from "@/components/dashboard/NotesUpload";
import { RevisionPlans } from "@/components/dashboard/RevisionPlans";
import { Flashcards } from "@/components/dashboard/Flashcards";
import { Quizzes } from "@/components/dashboard/Quizzes";
import { Progress } from "@/components/dashboard/Progress";
import { Contests } from "@/components/dashboard/Contests";
import { StudentWelcome } from "@/components/dashboard/StudentWelcome";
import { TeacherWelcome } from "@/components/dashboard/TeacherWelcome";
import { MarketplaceView } from "@/components/dashboard/MarketplaceView";
import { LessonPlanner } from "@/components/dashboard/LessonPlanner";
import { MyResources } from "@/components/dashboard/MyResources";
import { CreateFlashcards } from "@/components/dashboard/CreateFlashcards";
import { AssessmentBuilder } from "@/components/dashboard/AssessmentBuilder";
import { StudentAnalytics } from "@/components/dashboard/StudentAnalytics";
import { Classroom } from "@/components/dashboard/Classroom";
import { UnifiedView } from "@/components/dashboard/UnifiedView";
import { InteractiveOnboarding } from "@/components/dashboard/InteractiveOnboarding";
import { ContextualHelp } from "@/components/dashboard/ContextualHelp";
import { SmartSuggestions } from "@/components/dashboard/SmartSuggestions";
import { StudentProfile } from "@/components/dashboard/StudentProfile";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { UserSettings } from "@/components/dashboard/UserSettings";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { AuthService } from "@/services/authService";
import { useUserProfile } from "@/hooks/useSmartStorage";

export type DashboardView = 'overview' | 'notes' | 'flashcards' | 'progress' | 'profile' | 'settings';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [showWelcome, setShowWelcome] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContext, setHelpContext] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // User type is now determined from the authenticated user's profile
  // No longer allowing manual switching between student/teacher

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;

    const loadUserData = async () => {
      try {
        // Always load from Supabase as source of truth
        const { user } = await AuthService.getCurrentUser();
        if (user) {
          const { profile: dbProfile } = await AuthService.getUserProfile(user.id);
          const resolvedType = (dbProfile?.user_type as 'student' | 'teacher') || 'student';
          setUserType(resolvedType);

          // Keep localStorage in sync as a cache
          const basicProfile = {
            name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
            userType: resolvedType,
            email: user.email
          };
          localStorage.setItem('userProfile', JSON.stringify(basicProfile));
        } else {
          // Fallback to localStorage if Supabase auth is temporarily unavailable
          const cached = localStorage.getItem('userProfile');
          if (cached) {
            const userData = JSON.parse(cached);
            setUserType(userData.userType || 'student');
          }
        }

        // Check if this is a first-time user (just signed up)
        const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') === 'true';
        
        if (isFirstTimeUser) {
          console.log('Dashboard - First-time user, showing onboarding');
          setShowOnboarding(true);
        } else {
          console.log('Dashboard - Returning user, bypassing onboarding');
          setShowOnboarding(false);
        }

        // Set up contextual help based on current view
        const helpContexts = {
          'overview': 'overview',
          'notes': 'notes-upload',
          'flashcards': 'flashcards',
          'progress': 'progress'
        };
        setHelpContext(helpContexts[currentView] || '');
        
        // Mark as initialized
        setHasInitialized(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to student type
        setUserType('student');
        setHasInitialized(true);
      }
    };

    loadUserData();
  }, [currentView, showWelcome, hasInitialized]);

  if (showWelcome) {
    return userType === 'teacher' 
      ? <TeacherWelcome userType={userType} setCurrentView={setCurrentView} onGetStarted={() => setShowWelcome(false)} />
      : <StudentWelcome userType={userType} setCurrentView={setCurrentView} onGetStarted={() => setShowWelcome(false)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'notes':
        return <UnifiedView mainView="notes" userType={userType} setCurrentView={setCurrentView} />;
      case 'flashcards':
        return <UnifiedView mainView="flashcards" userType={userType} setCurrentView={setCurrentView} />;
      case 'progress':
        return <UnifiedView mainView="progress" userType={userType} setCurrentView={setCurrentView} />;
      case 'profile':
        return <UserProfile userType={userType} />;
      case 'settings':
        return <UserSettings userType={userType} />;
      default:
        return <DashboardOverview setCurrentView={setCurrentView} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar currentView={currentView} setCurrentView={setCurrentView} userType={userType} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader userType={userType} setCurrentView={setCurrentView} />
          <main className="flex-1 p-8 pb-24 lg:pb-8 bg-slate-50/50">
            {renderView()}
          </main>
        </div>
        <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} userType={userType} />
        
        {/* Interactive Flow Components */}
        {showOnboarding && (
          <InteractiveOnboarding 
            userType={userType} 
            onComplete={() => setShowOnboarding(false)} 
          />
        )}
        
        <ContextualHelp 
          context={helpContext}
          isVisible={showHelp}
          onDismiss={() => setShowHelp(false)}
        />
      </div>
    </SidebarProvider>
  );
};

const DashboardOverview = ({ setCurrentView }: { setCurrentView: (view: DashboardView) => void }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    console.log('DashboardOverview - Profile from localStorage:', profile);
    if (profile) {
      const userData = JSON.parse(profile);
      console.log('DashboardOverview - Parsed userData:', userData);
      setUserProfile(userData);
      setUserType(userData.userType || 'student');
    } else {
      console.log('DashboardOverview - No profile found in localStorage');
    }
  }, []);

  const isTeacher = userProfile?.userType === 'teacher';

  // Add a loading state if userProfile is not loaded yet
  if (!userProfile) {
    return (
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Pulling up your study session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Welcome Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {isTeacher ? '👨‍🏫' : '🎓'}
            </span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-slate-600">
              {isTeacher 
                ? "Ready to create amazing learning experiences?"
                : "Let's continue your learning journey"
              }
            </p>
          </div>
        </div>
        
        {/* Stats Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-teal-600 transition-colors"
        >
          <span>{showStats ? 'Hide' : 'Show'} progress</span>
          <svg className={`w-4 h-4 transition-transform ${showStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Collapsible Stats Section - Only show if user has data */}
      {showStats && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {isTeacher ? 'Your Teaching Analytics' : 'Your Learning Progress'}
              </h3>
              <p className="text-slate-600 mb-4">
                {isTeacher 
                  ? "Start creating lesson plans and tracking student progress to see your teaching analytics here."
                  : "Begin studying and taking quizzes to see your learning progress and achievements here."
                }
              </p>
              <button
                onClick={() => setCurrentView(isTeacher ? 'notes' : 'notes')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {isTeacher ? 'Create Your First Lesson' : 'Start Studying'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Section */}
      <div className="text-center py-8">
        <div 
          className="inline-block bg-gradient-to-br from-teal-500 to-blue-500 p-8 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          onClick={() => setCurrentView('notes')}
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {isTeacher ? 'Create New Lesson' : 'Add Study Notes'}
          </h2>
          <p className="text-white/90 max-w-sm">
            {isTeacher 
              ? "Upload your lesson materials and let AI create comprehensive lesson plans"
              : "Upload or paste your notes to get personalized study materials"
            }
          </p>
        </div>
      </div>

      {/* Secondary Actions - Minimalist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div 
          className="group bg-white p-8 rounded-xl border border-slate-200 cursor-pointer hover:border-teal-200 hover:shadow-lg transition-all"
          onClick={() => setCurrentView('flashcards')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                {isTeacher ? 'Create Flashcards' : 'Study Flashcards'}
              </h3>
              <p className="text-sm text-slate-600">
                {isTeacher ? 'Generate study cards for your students' : 'Review with spaced repetition'}
              </p>
            </div>
          </div>
        </div>
        
        <div 
          className="group bg-white p-8 rounded-xl border border-slate-200 cursor-pointer hover:border-teal-200 hover:shadow-lg transition-all"
          onClick={() => setCurrentView('progress')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                {isTeacher ? 'Track Progress' : 'View Progress'}
              </h3>
              <p className="text-sm text-slate-600">
                {isTeacher ? 'Monitor student performance' : 'Track your learning journey'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="max-w-2xl mx-auto">
        <SmartSuggestions 
          currentView="overview" 
          userType={userType}
          userActivity={{
            hasUploadedNotes: false,
            hasSelectedGoals: false,
            flashcardStreak: 0,
            averageScore: 0
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;