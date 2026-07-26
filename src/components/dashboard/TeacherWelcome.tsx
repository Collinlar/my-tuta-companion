import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Brain, 
  BarChart3, 
  Upload, 
  MessageCircle,
  ArrowRight,
  Zap,
  Users,
  ShoppingBag,
  BookOpen,
  PenTool
} from "lucide-react";

interface UserProfile {
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  userType: 'student' | 'teacher';
}

interface TeacherWelcomeProps {
  userType: 'student' | 'teacher';
  setCurrentView: (view: string) => void;
  onGetStarted: () => void;
}

export const TeacherWelcome = ({ userType, setCurrentView, onGetStarted }: TeacherWelcomeProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  if (!userProfile) return null;

  const handleGetStarted = () => {
    localStorage.removeItem('isFirstTimeUser');
    localStorage.setItem('hasSeenWelcome', 'true');
    if (onGetStarted && typeof onGetStarted === 'function') {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Skip Welcome Button */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGetStarted}
          className="text-slate-600 hover:text-slate-900"
        >
          Skip Welcome
        </Button>
      </div>
      
      <div className="max-w-2xl w-full space-y-8">
        {/* Welcome Header - Simplified */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Welcome, {userProfile.name.split(' ')[0]}! 👩‍🏫
          </h1>
          <p className="text-slate-600 text-lg">
            Your AI teaching assistant is ready to transform your classroom
          </p>
        </div>

        {/* Profile Summary - Clean White Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Your Teaching Profile</h3>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-slate-900">{userProfile.class}</div>
                <div className="text-slate-500 text-xs">Level</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{userProfile.subjects?.length || 0}</div>
                <div className="text-slate-500 text-xs">Subjects</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{userProfile.goals?.length || 0}</div>
                <div className="text-slate-500 text-xs">Goals</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(userProfile.subjects || []).slice(0, 4).map((subject) => (
              <Badge key={subject} className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                {subject}
              </Badge>
            ))}
            {(userProfile.subjects?.length || 0) > 4 && (
              <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                +{(userProfile.subjects?.length || 0) - 4}
              </Badge>
            )}
          </div>
        </Card>

        {/* Core Features - Clean Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">AI Lesson Planner</h4>
            <p className="text-slate-600 text-xs">Generate lesson plans instantly</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Assessment Creator</h4>
            <p className="text-slate-600 text-xs">Auto-generate quizzes</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Progress Tracking</h4>
            <p className="text-slate-600 text-xs">Monitor performance</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Marketplace</h4>
            <p className="text-slate-600 text-xs">Sell resources</p>
          </Card>
        </div>

        {/* AI Assistant - Simplified */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">AI Teaching Assistant</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Hello {userProfile.name.split(' ')[0]}! I can help you create engaging lesson plans, 
                generate assessments, and track student progress. What would you like to start with?
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action - Clean Button */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Enter Teaching Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};