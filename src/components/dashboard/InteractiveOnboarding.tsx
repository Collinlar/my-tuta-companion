import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, BookOpen, Target, Sparkles, Users, TrendingUp, Lightbulb } from "lucide-react";

interface InteractiveOnboardingProps {
  userType: 'student' | 'teacher';
  onComplete: () => void;
}

export function InteractiveOnboarding({ userType, onComplete }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const studentGoals = [
    { id: 'revision', title: 'Revision Planning', description: 'Create structured study plans', icon: BookOpen },
    { id: 'flashcards', title: 'Flashcard Study', description: 'Learn with spaced repetition', icon: Target },
    { id: 'quizzes', title: 'Practice Quizzes', description: 'Test your knowledge', icon: TrendingUp },
    { id: 'contests', title: 'Join Contests', description: 'Compete with peers', icon: Sparkles }
  ];

  const teacherGoals = [
    { id: 'lesson-planning', title: 'Lesson Planning', description: 'Create comprehensive lesson plans', icon: BookOpen },
    { id: 'assessments', title: 'Create Assessments', description: 'Generate quizzes and tests', icon: Target },
    { id: 'analytics', title: 'Track Progress', description: 'Monitor student performance', icon: TrendingUp },
    { id: 'resources', title: 'Resource Management', description: 'Organize teaching materials', icon: Lightbulb }
  ];

  const commonSubjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
  ];

  const steps = [
    {
      title: `Welcome to mytuta AI, ${userType === 'teacher' ? 'Educator' : 'Learner'}!`,
      subtitle: "Let's personalize your experience",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">
              {userType === 'teacher' ? '👨‍🏫' : '🎓'}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {userType === 'teacher' 
                ? "Ready to revolutionize your teaching?" 
                : "Ready to supercharge your learning?"
              }
            </h3>
            <p className="text-slate-600">
              {userType === 'teacher'
                ? "mytuta AI helps you create amazing lesson plans, track student progress, and enhance your teaching with AI."
                : "mytuta AI helps you create personalized study plans, flashcards, and practice materials with AI assistance."
              }
            </p>
          </div>
        </div>
      )
    },
    {
      title: "What are your main goals?",
      subtitle: "Select all that apply to get personalized recommendations",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(userType === 'teacher' ? teacherGoals : studentGoals).map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    isSelected 
                      ? 'border-teal-200 bg-teal-50 shadow-sm' 
                      : 'border-slate-200 hover:border-teal-200 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                    } else {
                      setSelectedGoals([...selectedGoals, goal.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">{goal.title}</h4>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )
    },
    {
      title: "What subjects do you work with?",
      subtitle: "This helps us suggest relevant content and features",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {commonSubjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              return (
                <Badge
                  key={subject}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                      : 'hover:bg-teal-50 hover:border-teal-300'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                    } else {
                      setSelectedSubjects([...selectedSubjects, subject]);
                    }
                  }}
                >
                  {subject}
                </Badge>
              );
            })}
          </div>
        </div>
      )
    },
    {
      title: "You're all set! 🎉",
      subtitle: "Let's start your mytuta AI journey",
      content: (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Your personalized dashboard is ready!
            </h3>
            <p className="text-slate-600 mb-4">
              Based on your selections, we've customized your experience to help you achieve your goals.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Selected Goals:</strong> {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected<br/>
                <strong>Subjects:</strong> {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return selectedGoals.length > 0;
      case 2:
        return selectedSubjects.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save onboarding data
      const onboardingData = {
        goals: selectedGoals,
        subjects: selectedSubjects,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('tutaOnboarding', JSON.stringify(onboardingData));
      
      // Clear first-time user flag since onboarding is complete
      localStorage.removeItem('isFirstTimeUser');
      
      onComplete();
    }
  };

  const handleSkip = () => {
    // Clear first-time user flag even when skipping
    localStorage.removeItem('isFirstTimeUser');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress Indicator - Simplified */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-teal-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-slate-600 mb-4 text-sm">
              {steps[currentStep].subtitle}
            </p>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Setup
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
