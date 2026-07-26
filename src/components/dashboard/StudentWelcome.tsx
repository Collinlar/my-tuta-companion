import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Trophy, 
  Upload, 
  MessageCircle,
  ArrowRight,
  Zap
} from "lucide-react";

interface UserProfile {
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  userType: 'student' | 'teacher';
}

interface StudentWelcomeProps {
  userType: 'student' | 'teacher';
  setCurrentView: (view: string) => void;
  onGetStarted: () => void;
}

export const StudentWelcome = ({ userType, setCurrentView, onGetStarted }: StudentWelcomeProps) => {
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
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Welcome, {userProfile.name.split(' ')[0]}! 🎉
          </h1>
          <p className="text-slate-600 text-lg">
            Your personalized AI study companion is ready
          </p>
        </div>

        {/* Profile Summary - Clean White Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Your Learning Profile</h3>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-slate-900">{userProfile.grade || userProfile.class || 'Not set'}</div>
                <div className="text-slate-500 text-xs">Grade/Class</div>
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
              <Badge key={subject} className="bg-green-100 text-green-700 border-green-200 text-xs">
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
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Upload Notes</h4>
            <p className="text-slate-600 text-xs">Turn notes into materials</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Smart Flashcards</h4>
            <p className="text-slate-600 text-xs">AI-generated retention</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Practice Quizzes</h4>
            <p className="text-slate-600 text-xs">Test and track progress</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Study Contests</h4>
            <p className="text-slate-600 text-xs">Compete with classmates</p>
          </Card>
        </div>

        {/* AI Buddy - Simplified */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">AI Study Buddy</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Hi {userProfile.name.split(' ')[0]}! I can help you with {userProfile.subjects[0]}, 
                create study plans, and generate practice questions. What would you like to start with?
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action - Clean Button */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Enter Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};