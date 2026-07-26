import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Target,
  Brain,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Trophy,
  Zap,
  Award,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  HelpCircle,
  BrainCircuit,
  Timer,
  Coins,
  Lightbulb,
  MapPin,
  Users,
  Calendar,
  Share2,
  Copy,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { LessonPlanRevisionPlan, RevisionStep, RevisionActivity, StudyAid, ReflectionQuestion } from '@/services/lessonPlanRevisionService';
import { StudyToolsModal } from './StudyToolsModal';
import { useUserFeedback } from '@/hooks/useUserFeedback';

interface LessonPlanRevisionViewerProps {
  plan: LessonPlanRevisionPlan;
  onBack: () => void;
  onStartPlan?: () => void;
}

export const LessonPlanRevisionViewer: React.FC<LessonPlanRevisionViewerProps> = ({ plan, onBack, onStartPlan }) => {
  // Add safety check for plan
  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h2>
          <p className="text-gray-600 mb-6">The lesson plan could not be loaded. Please try again.</p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
        </div>
      </div>
    );
  }

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [activityResults, setActivityResults] = useState<Record<string, string>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [studyToolsModalOpen, setStudyToolsModalOpen] = useState(false);
  const [selectedStudyTool, setSelectedStudyTool] = useState<string>('');

  // Initialize user feedback system
  const {
    currentSession,
    startSession,
    updateSession,
    endSession,
    studyProgress,
    updateProgress,
    markStepComplete,
    markActivityComplete,
    updateReflectionAnswer: saveReflectionAnswer,
    updateStudyToolScore,
    isSessionActive,
    sessionDuration,
    getLearningInsights,
    getPreviousReflections
  } = useUserFeedback(plan?.id || 'default', plan?.topic || 'General', 'General');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Start study session and load previous feedback when component mounts
  useEffect(() => {
    if (!isSessionActive && plan?.id && plan?.topic) {
      startSession(plan.id, plan.topic, 'General');
    }

    // Load previous reflection answers
    if (studyProgress?.reflectionAnswers) {
      setReflectionAnswers(studyProgress.reflectionAnswers);
    }

    // Load previous completed steps
    if (studyProgress?.completedSteps) {
      setCompletedSteps(new Set(studyProgress.completedSteps));
    }

    // Load previous completed activities
    if (studyProgress?.completedActivities) {
      setCompletedActivities(new Set(studyProgress.completedActivities));
    }

    // Load previous activity results
    if (studyProgress?.activityResults) {
      setActivityResults(studyProgress.activityResults);
    }
  }, [plan.id, plan.topic, isSessionActive, startSession, studyProgress]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
    markStepComplete(stepId);
  };

  const completeActivity = (stepId: string, activityId: string) => {
    setCompletedActivities(prev => new Set(prev).add(activityId));
    markActivityComplete(activityId);
  };

  const updateActivityResult = (activityId: string, result: string) => {
    setActivityResults(prev => ({ ...prev, [activityId]: result }));
    markActivityComplete(activityId, result);
  };

  const updateReflectionAnswer = (questionId: string, answer: string) => {
    setReflectionAnswers(prev => ({ ...prev, [questionId]: answer }));
    saveReflectionAnswer(questionId, answer);
  };

  const getStepIcon = (type: RevisionStep['type']) => {
    switch (type) {
      case 'reading': return <FileText className="h-5 w-5" />;
      case 'visual': return <Eye className="h-5 w-5" />;
      case 'concept': return <Brain className="h-5 w-5" />;
      case 'application': return <BrainCircuit className="h-5 w-5" />;
      case 'recap': return <CheckCircle className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getActivityIcon = (type: RevisionActivity['type']) => {
    switch (type) {
      case 'highlight': return <FileText className="h-4 w-4" />;
      case 'match': return <Target className="h-4 w-4" />;
      case 'recall': return <Brain className="h-4 w-4" />;
      case 'scenario': return <HelpCircle className="h-4 w-4" />;
      case 'summary': return <CheckCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStudyToolClick = (toolType: string) => {
    setSelectedStudyTool(toolType);
    setStudyToolsModalOpen(true);
  };

  const handleStudyToolComplete = (toolType: string, score?: number) => {
    // Mark the study tool as completed in the plan
    console.log(`Study tool ${toolType} completed with score:`, score);
    setStudyToolsModalOpen(false);
    
    // Save the study tool score
    if (score !== undefined) {
      updateStudyToolScore(toolType, score);
    }
    
    // Update session with completed study tool
    updateSession({
      completedSteps: [...(currentSession?.completedSteps || []), `${toolType}-completed`]
    });
  };

  const calculateProgress = () => {
    const totalSteps = plan.revisionSteps.length;
    const completedCount = completedSteps.size;
    return totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  };

  const progress = calculateProgress();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Dashboard
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Save Progress
          </Button>
          {onStartPlan && (
            <Button onClick={onStartPlan} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white">
              <Play className="mr-2 h-4 w-4" /> Begin Study Session
            </Button>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {plan.title} - Study Guide
            </h1>
            <p className="text-lg text-gray-600">
              {plan.subject} - {plan.gradeLevel}
            </p>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <Badge className={getDifficultyColor(plan.overview.difficulty)}>
              {plan.overview.difficulty}
            </Badge>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            <span>Study Mode: Self-Paced</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            <span>Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-gray-500" />
            <span>Progress: {Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="bg-white rounded-lg shadow-sm border">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-green-600" />
            Your Study Guide
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            🎯 Let's master this topic together! Follow the steps below for the best learning experience.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* Overview */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <MapPin className="mr-2 h-6 w-6" />
              🎯 1. Your Learning Journey
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-800 mb-4 font-medium">{plan.goal}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>⏱️ Study Time:</strong> {plan.overview.duration} minutes
                </div>
                <div>
                  <strong>📊 Challenge Level:</strong> 
                  <Badge className={`ml-2 ${getDifficultyColor(plan.overview.difficulty)}`}>
                    {plan.overview.difficulty}
                  </Badge>
                </div>
                <div>
                  <strong>🎮 Study Style:</strong> {plan.overview.mode}
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-green-100">
                <p className="text-sm text-green-700">
                  <strong>💡 Study Tip:</strong> Take breaks every 15-20 minutes to keep your mind fresh and focused!
                </p>
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Target className="mr-2 h-6 w-6" />
              🎯 2. What You'll Master
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 mb-3 font-medium">By the end of this study session, you'll be able to:</p>
              <div className="space-y-3">
                {plan.objectives.map((objective, index) => (
                  <div key={objective.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-800">{objective.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Note Breakdown */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              📚 3. Key Topics to Study
            </h2>
            <div className="space-y-4">
              {plan.noteBreakdown.map((section, index) => (
                <Card key={section.id} className={`border-l-4 ${
                  section.importance === 'high' ? 'border-l-red-500 bg-red-50' :
                  section.importance === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-green-500 bg-green-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{section.title}</h3>
                      <Badge variant="outline" className={
                        section.importance === 'high' ? 'border-red-300 text-red-700' :
                        section.importance === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }>
                        {section.importance === 'high' ? '🔥 Priority' :
                         section.importance === 'medium' ? '⭐ Important' : '✅ Good to Know'}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{section.content}</p>
                    <p className="text-sm text-gray-500 italic">📝 From your notes: {section.extractedFrom}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* AI Study Tip */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-800">🤖 Your AI Study Buddy Says:</p>
                  <p className="text-purple-700">{plan.aiTips[0] || 'Focus on understanding key concepts - this will help you remember better!'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Study Steps - Simplified */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Study Steps</h2>
            <div className="space-y-3">
              {plan.revisionSteps.slice(0, 3).map((step, index) => (
                <div key={step.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-600">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{step.duration} min</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleStep(step.id)}
                      className="text-xs"
                    >
                      {expandedSteps.has(step.id) ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress - Simplified */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Progress</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Study Progress</span>
                <span className="text-sm font-semibold text-slate-900">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-600 mt-2">
                {progress < 25 ? "Getting started" :
                 progress < 50 ? "Good progress" :
                 progress < 75 ? "More than halfway" :
                 progress < 100 ? "Almost done" :
                 "Completed!"}
              </p>
            </div>
          </div>

          {/* Study Tools - Simplified */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Practice Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.studyAids.slice(0, 2).map((aid) => (
                <div key={aid.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{aid.title}</h3>
                    <Badge variant="outline" className="text-xs">Ready</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{aid.description}</p>
                  <Button 
                    size="sm" 
                    onClick={() => handleStudyToolClick(aid.type)}
                    className="w-full"
                  >
                    Try It
                  </Button>
                </div>
              ))}
            </div>
          </div>


        </CardContent>
      </div>

      {/* Footer - Simplified */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Study Plan • {plan.overview.duration} minutes</span>
          <span>Ready to learn</span>
        </div>
      </div>

      {/* Previous Feedback Display */}
      {getPreviousReflections(plan.topic).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            📚 Your Previous Thoughts on {plan.topic}
          </h3>
          <div className="space-y-3">
            {getPreviousReflections(plan.topic).slice(0, 3).map((reflection) => (
              <div key={reflection.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {new Date(reflection.timestamp).toLocaleDateString()}
                </p>
                <p className="text-blue-700">{reflection.answer}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            💡 Your previous reflections help you build on what you've already learned!
          </p>
        </div>
      )}

      {/* Session Information */}
      {isSessionActive && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Study Session Active</span>
              </div>
              <span className="text-sm text-gray-600">
                Duration: {sessionDuration} minutes
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => endSession()}
              className="text-red-600 hover:text-red-700"
            >
              End Session
            </Button>
          </div>
        </div>
      )}

      {/* Study Tools Modal */}
      <StudyToolsModal
        isOpen={studyToolsModalOpen}
        onClose={() => setStudyToolsModalOpen(false)}
        topic={plan.topic}
        subject="General"
        onComplete={handleStudyToolComplete}
      />
    </div>
  );
};

interface RevisionStepCardProps {
  step: RevisionStep;
  stepNumber: number;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onCompleteActivity: (activityId: string) => void;
  completedActivities: Set<string>;
  activityResults: Record<string, string>;
  onUpdateActivityResult: (activityId: string, result: string) => void;
  getActivityIcon: (type: RevisionActivity['type']) => React.ReactNode;
  getStepIcon: (type: RevisionStep['type']) => React.ReactNode;
}

const RevisionStepCard: React.FC<RevisionStepCardProps> = ({
  step,
  stepNumber,
  isExpanded,
  isCompleted,
  onToggle,
  onComplete,
  onCompleteActivity,
  completedActivities,
  activityResults,
  onUpdateActivityResult,
  getActivityIcon,
  getStepIcon
}) => {
  return (
    <Card className={`border-2 ${isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStepIcon(step.type)}
              <span className="font-bold">Step {stepNumber}: {step.title}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {step.duration} mins
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              <Zap className="mr-1 h-3 w-3" />
              {step.xpReward} XP
            </Badge>
            {step.badge && (
              <Badge className="bg-purple-100 text-purple-800">
                {step.badge}
              </Badge>
            )}
            <Button variant="ghost" size="icon">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">{step.description}</p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {step.activities.map((activity) => (
            <div key={activity.id} className="p-4 bg-white rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                {getActivityIcon(activity.type)}
                <h4 className="font-semibold">{activity.title}</h4>
                <Badge variant="outline" className="ml-auto">
                  {activity.type}
                </Badge>
              </div>
              <p className="text-gray-700 mb-3">{activity.description}</p>
              <p className="text-sm text-blue-600 mb-3 font-medium">Instructions: {activity.instructions}</p>
              
              {activity.type === 'recall' || activity.type === 'scenario' ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your response here..."
                    value={activityResults[activity.id] || ''}
                    onChange={(e) => onUpdateActivityResult(activity.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    size="sm"
                    onClick={() => onCompleteActivity(activity.id)}
                    disabled={completedActivities.has(activity.id)}
                  >
                    {completedActivities.has(activity.id) ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {completedActivities.has(activity.id) ? 'Completed' : 'Complete'}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onCompleteActivity(activity.id)}
                  disabled={completedActivities.has(activity.id)}
                >
                  {completedActivities.has(activity.id) ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {completedActivities.has(activity.id) ? 'Completed' : 'Start'}
                </Button>
              )}
            </div>
          ))}
          
          <Button
            className="w-full"
            onClick={onComplete}
            disabled={isCompleted}
            variant={isCompleted ? "secondary" : "default"}
          >
            {isCompleted ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isCompleted ? 'Step Completed' : 'Complete Step'}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

interface StudyAidCardProps {
  aid: StudyAid;
  onToolClick: (toolType: string) => void;
}

const StudyAidCard: React.FC<StudyAidCardProps> = ({ aid, onToolClick }) => {
  const getAidIcon = () => {
    switch (aid.type) {
      case 'flashcards': return <FileText className="h-5 w-5" />;
      case 'quiz': return <HelpCircle className="h-5 w-5" />;
      case 'contest': return <Trophy className="h-5 w-5" />;
      case 'learning-path': return <TrendingUp className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <Card className={`border-2 ${aid.unlocked ? 'border-blue-200' : 'border-gray-200 opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          {getAidIcon()}
          <h3 className="font-semibold text-gray-800">{aid.title}</h3>
          <Badge className={aid.unlocked ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'}>
            {aid.unlocked ? '✅ Ready' : '🔒 Locked'}
          </Badge>
        </div>
        <p className="text-gray-600 text-sm mb-3">{aid.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {aid.count && (
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {aid.count} items
              </Badge>
            )}
            {aid.duration && (
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                <Timer className="mr-1 h-3 w-3" />
                {aid.duration} min
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            disabled={!aid.unlocked}
            variant={aid.unlocked ? "default" : "secondary"}
            className={aid.unlocked ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            onClick={() => aid.unlocked && onToolClick(aid.type)}
          >
            <Play className="h-4 w-4 mr-2" />
            {aid.unlocked ? 'Try It!' : 'Complete Steps First'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ReflectionQuestionCardProps {
  question: ReflectionQuestion;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

const ReflectionQuestionCard: React.FC<ReflectionQuestionCardProps> = ({
  question,
  answer,
  onAnswerChange
}) => {
  return (
    <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            💭
          </div>
          <h3 className="font-semibold text-gray-800">{question.question}</h3>
        </div>
        <Textarea
          placeholder="Share your thoughts and ideas here... There's no right or wrong answer!"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="min-h-[100px] border-purple-200 focus:border-purple-400"
        />
        <p className="text-xs text-purple-600 mt-2 italic">
          💡 Your thoughts help you remember better and show your learning journey!
        </p>
      </CardContent>
    </Card>
  );
};
