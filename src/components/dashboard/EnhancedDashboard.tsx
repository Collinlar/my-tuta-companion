import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  MessageCircle,
  Lightbulb,
  BarChart3,
  Calendar,
  Zap,
  User,
  Settings
} from 'lucide-react';
import { UnifiedView } from './UnifiedView';
import { AICompanion } from './AICompanion';
import { ProactiveSuggestions } from './ProactiveSuggestions';
import { StudentProfile } from './StudentProfile';
import { Progress } from './Progress';
import { proactiveAI } from '@/services/proactiveAI';
import { aiCompanionService } from '@/services/aiCompanionService';

interface EnhancedDashboardProps {
  userType: 'student' | 'teacher';
}

export function EnhancedDashboard({ userType }: EnhancedDashboardProps) {
  const [currentView, setCurrentView] = useState<{
    mainView: 'notes' | 'flashcards' | 'progress';
    subView?: string;
  }>({ mainView: 'notes' });
  
  const [isAICompanionOpen, setIsAICompanionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('study');
  const [suggestionCount, setSuggestionCount] = useState(0);

  // Load suggestion count on mount
  useEffect(() => {
    loadSuggestionCount();
  }, []);

  const loadSuggestionCount = async () => {
    try {
      const suggestions = await proactiveAI.analyzeAndSuggest();
      setSuggestionCount(suggestions.length);
    } catch (error) {
      console.error('Error loading suggestion count:', error);
    }
  };

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
      case 'start_study':
        setCurrentView({ mainView: 'notes', subView: 'upload' });
        break;
      case 'start_optimal_study':
        setCurrentView({ mainView: 'notes', subView: 'upload' });
        break;
      case 'study_subject':
        setCurrentView({ mainView: 'notes', subView: 'upload' });
        break;
      case 'create_study_plan':
        setCurrentView({ mainView: 'notes', subView: 'upload' });
        break;
      case 'help_with_subject':
        setCurrentView({ mainView: 'notes', subView: 'upload' });
        break;
      case 'increase_difficulty':
        setCurrentView({ mainView: 'flashcards', subView: 'quizzes' });
        break;
      default:
        console.log('Unknown AI companion action:', action);
    }
  };

  const handleSuggestionAction = (action: string, data?: any) => {
    handleAICompanionAction(action, data);
    // Refresh suggestion count after action
    loadSuggestionCount();
  };

  const handleSuggestionDismiss = (suggestionId: string) => {
    // Refresh suggestion count after dismiss
    loadSuggestionCount();
  };

  if (userType === 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50">
        <UnifiedView
          mainView={currentView.mainView}
          userType={userType}
          setCurrentView={(view) => setCurrentView(view)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Study Dashboard</h1>
            <p className="text-slate-600">Your personalized learning hub with AI assistance</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Companion Toggle */}
            <Button
              onClick={() => setIsAICompanionOpen(!isAICompanionOpen)}
              variant={isAICompanionOpen ? "default" : "outline"}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Companion
              {isAICompanionOpen && (
                <Badge className="ml-2 bg-white/20 text-white">
                  Active
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Suggestions */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="font-semibold text-slate-900">Smart Suggestions</h2>
                {suggestionCount > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {suggestionCount}
                  </Badge>
                )}
              </div>
              <ProactiveSuggestions
                onSuggestionAction={handleSuggestionAction}
                onDismiss={handleSuggestionDismiss}
              />
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="study" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Study
                </TabsTrigger>
                <TabsTrigger value="practice" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Practice
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="study" className="space-y-6">
                <UnifiedView
                  mainView="notes"
                  userType={userType}
                  setCurrentView={(view) => setCurrentView(view)}
                />
              </TabsContent>

              <TabsContent value="practice" className="space-y-6">
                <UnifiedView
                  mainView="flashcards"
                  userType={userType}
                  setCurrentView={(view) => setCurrentView(view)}
                />
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <UnifiedView
                  mainView="progress"
                  userType={userType}
                  setCurrentView={(view) => setCurrentView(view)}
                />
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <StudentProfile />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* AI Companion */}
        <AICompanion
          isOpen={isAICompanionOpen}
          onToggle={() => setIsAICompanionOpen(!isAICompanionOpen)}
          onQuickAction={handleAICompanionAction}
        />
      </div>
    </div>
  );
}
