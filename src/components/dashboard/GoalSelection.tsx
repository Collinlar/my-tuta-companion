import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Route, 
  Brain, 
  HelpCircle, 
  Trophy, 
  CheckCircle,
  Clock,
  Target,
  Zap,
  FileText,
  ArrowLeft,
  Sparkles
} from "lucide-react";

export type LearningGoal = 'revision-plan' | 'learning-path' | 'flashcards' | 'quizzes' | 'contest';

interface GoalSelectionProps {
  notes?: string;
  fileName?: string;
  onGoalSelect?: (goals: LearningGoal[]) => void;
  onGoalsSubmit?: (goals: LearningGoal[]) => void; // Alternative prop name
  onBack?: () => void;
  excludeGoals?: LearningGoal[];
  title?: string;
  description?: string;
}

const goalOptions = [
  {
    id: 'revision-plan' as LearningGoal,
    title: 'Revision Plan',
    description: 'Comprehensive study plan with all resources and structured timeline',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    features: [
      'Complete study timeline',
      'Mixed learning resources',
      'Progress tracking',
      'Adaptive scheduling'
    ],
    estimatedTime: '2-4 weeks',
    difficulty: 'Comprehensive'
  },
  {
    id: 'learning-path' as LearningGoal,
    title: 'Learning Path',
    description: 'Step-by-step structured learning journey from basics to advanced',
    icon: Route,
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    features: [
      'Sequential lessons',
      'Prerequisite mapping',
      'Skill building progression',
      'Milestone tracking'
    ],
    estimatedTime: '3-6 weeks',
    difficulty: 'Structured'
  },
  {
    id: 'flashcards' as LearningGoal,
    title: 'Learn with Flashcards',
    description: 'Focus on memorization and recall with AI-generated flashcards',
    icon: Brain,
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    features: [
      'Spaced repetition',
      'Memory optimization',
      'Quick review sessions',
      'Retention tracking'
    ],
    estimatedTime: '1-2 weeks',
    difficulty: 'Memorization'
  },
  {
    id: 'quizzes' as LearningGoal,
    title: 'Practice Quizzes',
    description: 'Test your knowledge with AI-generated practice questions and assessments',
    icon: HelpCircle,
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    features: [
      'Adaptive questioning',
      'Performance analytics',
      'Weakness identification',
      'Progress assessment'
    ],
    estimatedTime: '1-2 weeks',
    difficulty: 'Assessment'
  },
  {
    id: 'contest' as LearningGoal,
    title: 'Join Contest',
    description: 'Compete with challenging problems and compete with other students',
    icon: Trophy,
    gradient: 'from-red-500 to-red-600',
    bgGradient: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    features: [
      'Competitive problems',
      'Leaderboard rankings',
      'Time pressure challenges',
      'Peer comparison'
    ],
    estimatedTime: '1 week',
    difficulty: 'Competitive'
  }
];

export function GoalSelection({ 
  notes, 
  fileName, 
  onGoalSelect, 
  onGoalsSubmit,
  onBack, 
  excludeGoals = [],
  title = "Step 2: Select Your Learning Goals",
  description = "Choose one or more goals that align with how you want to revise this topic. The AI will tailor your plan based on your selections."
}: GoalSelectionProps) {
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);

  // Filter out excluded goals
  const availableGoals = goalOptions.filter(goal => !excludeGoals.includes(goal.id));

  const handleGoalToggle = (goalId: LearningGoal) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      return;
    }
    // Use either onGoalSelect or onGoalsSubmit
    const submitHandler = onGoalSelect || onGoalsSubmit;
    if (submitHandler) {
      submitHandler(selectedGoals);
    }
  };

  const getTotalEstimatedTime = () => {
    const timeMap = {
      'revision-plan': 4,
      'learning-path': 6,
      'flashcards': 2,
      'quizzes': 2,
      'contest': 1
    };
    
    const maxTime = Math.max(...selectedGoals.map(goal => timeMap[goal]));
    return `${maxTime} weeks`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          {description}
        </p>
        
        {/* Notes Status */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {fileName && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{fileName}</span>
            </div>
          )}
          
          {notes && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">
                Notes loaded: {notes.length} characters
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Goal Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableGoals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <Card 
              key={goal.id}
              className={`p-8 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                isSelected 
                  ? `border-${goal.gradient.split('-')[1]}-300 bg-gradient-to-br ${goal.bgGradient} shadow-lg scale-105` 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${goal.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{goal.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{goal.description}</p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">{goal.estimatedTime}</span>
                    </div>
                    <Badge variant="outline" className={`${goal.textColor} ${goal.borderColor} bg-white`}>
                      {goal.difficulty}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {goal.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedGoals.length > 0 && (
        <Card className="p-8 border border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Your Learning Plan</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Selected Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGoals.map(goalId => {
                    const goal = goalOptions.find(g => g.id === goalId);
                    return (
                      <Badge key={goalId} variant="outline" className="text-sm px-3 py-1 bg-white border-slate-200">
                        {goal?.title}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Estimated Time</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-lg font-bold text-slate-900">{getTotalEstimatedTime()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">AI Processing</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Personalized content generation</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 h-12 px-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Button>
        )}
        
        <Button 
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
          className="ml-auto h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Plan
        </Button>
      </div>

      {/* Tips */}
      <Card className="p-8 border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-amber-900">Goal Selection Tips</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span>Choose multiple goals for a comprehensive learning experience</span>
              </li>
              <li className="flex items-start gap-3 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span>Start with "Learning Path" if you're new to the topic</span>
              </li>
              <li className="flex items-start gap-3 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span>Add "Flashcards" for better memorization</span>
              </li>
              <li className="flex items-start gap-3 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span>Include "Quizzes" to test your understanding</span>
              </li>
              <li className="flex items-start gap-3 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span>Try "Contest" for competitive learning and advanced practice</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
