import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  BookOpen, 
  HelpCircle, 
  Trophy, 
  Plus,
  CheckCircle,
  Clock,
  Target,
  Zap,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { LearningGoal, GoalSelection } from "./GoalSelection";
import { Flashcards } from "./Flashcards";
import { Quizzes } from "./Quizzes";
import { Contests } from "./Contests";
import { RevisionPlanTasks } from "./RevisionPlanTasks";
import { LearningPathTasks } from "./LearningPathTasks";
import { LessonPlanRevisionViewer } from "./LessonPlanRevisionViewer";
import { GeneratedPlan } from "@/services/aiContentGenerator";
import { Task } from "@/types/task";
import { LessonPlanRevisionPlan } from "@/services/lessonPlanRevisionService";

interface GoalSpecificExperienceProps {
  notes?: string;
  fileName?: string;
  selectedGoals?: LearningGoal[];
  plan?: GeneratedPlan; // Add plan parameter
  onBack: () => void;
  onComplete: () => void;
  onViewStudyGuide?: () => void; // Add callback for viewing study guide
}

type ExperienceView = 'overview' | 'flashcards' | 'quizzes' | 'contests' | 'revision-plan' | 'learning-path' | 'add-goals';

export function GoalSpecificExperience({ notes, fileName, selectedGoals, plan, onBack, onComplete, onViewStudyGuide }: GoalSpecificExperienceProps) {
  const [currentView, setCurrentView] = useState<ExperienceView>('overview');
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showLearningTips, setShowLearningTips] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanRevisionPlan | null>(null);

  // Load lesson plan from localStorage when component mounts
  useEffect(() => {
    const savedLessonPlan = localStorage.getItem('currentLessonPlan');
    if (savedLessonPlan) {
      try {
        const parsedPlan = JSON.parse(savedLessonPlan);
        
        // Convert createdAt string back to Date object
        if (parsedPlan.createdAt && typeof parsedPlan.createdAt === 'string') {
          parsedPlan.createdAt = new Date(parsedPlan.createdAt);
        }
        
        setLessonPlan(parsedPlan);
        console.log('Loaded lesson plan from localStorage:', parsedPlan.title);
      } catch (error) {
        console.error('Error parsing saved lesson plan:', error);
      }
    }
  }, []);

  // Use the actual plan if provided, otherwise create a mock plan from the notes and selected goals
  const actualPlan = plan || {
    title: fileName ? `Study Plan for ${fileName}` : "Your Personalized Study Plan",
    description: `AI-generated study plan based on your notes and selected goals: ${selectedGoals?.join(', ') || ''}`,
    estimatedDuration: selectedGoals?.length ? selectedGoals.length * 2 : 6, // weeks
    topic: fileName ? fileName.replace(/\.[^/.]+$/, "") : "Your Topic",
    goals: selectedGoals || [],
    tasks: selectedGoals?.flatMap(goal => {
      switch (goal) {
        case 'flashcards':
          return [
            {
              id: `flashcard-${goal}`,
              title: 'Create Flashcards',
              description: 'Generate flashcards for spaced repetition learning',
              type: 'flashcard' as const,
              difficulty: 'intermediate' as const,
              estimatedTime: '15 minutes',
              resources: [],
              learningObjectives: ['Master key concepts through spaced repetition', 'Improve retention with active recall'],
              completed: false,
              progress: 0
            }
          ];
        case 'quizzes':
          return [
            {
              id: `quiz-${goal}`,
              title: 'Take Practice Quiz',
              description: 'Test your knowledge with AI-generated questions',
              type: 'quiz' as const,
              difficulty: 'intermediate' as const,
              estimatedTime: '20 minutes',
              resources: [],
              learningObjectives: ['Assess understanding of key concepts', 'Identify areas for improvement'],
              completed: false,
              progress: 0
            }
          ];
        case 'contest':
          return [
            {
              id: `contest-${goal}`,
              title: 'Join Contest',
              description: 'Challenge yourself with competitive problems',
              type: 'contest' as const,
              difficulty: 'advanced' as const,
              estimatedTime: '30 minutes',
              resources: [],
              learningObjectives: ['Apply knowledge in competitive setting', 'Develop problem-solving skills'],
              completed: false,
              progress: 0
            }
          ];
        case 'learning-path':
          return [
            {
              id: `reading-${goal}`,
              title: 'Study Reading Material',
              description: 'Study comprehensive reading materials',
              type: 'reading' as const,
              difficulty: 'beginner' as const,
              estimatedTime: '25 minutes',
              resources: [],
              learningObjectives: ['Understand fundamental concepts', 'Build knowledge foundation'],
              completed: false,
              progress: 0
            },
            {
              id: `practice-${goal}`,
              title: 'Practice Exercises',
              description: 'Apply your knowledge with practice exercises',
              type: 'practice' as const,
              difficulty: 'intermediate' as const,
              estimatedTime: '20 minutes',
              resources: [],
              learningObjectives: ['Apply concepts in practice', 'Reinforce learning'],
              completed: false,
              progress: 0
            },
            {
              id: `review-${goal}`,
              title: 'Review and Reflect',
              description: 'Review key concepts and reflect on learning',
              type: 'review' as const,
              difficulty: 'beginner' as const,
              estimatedTime: '15 minutes',
              resources: [],
              learningObjectives: ['Consolidate learning', 'Identify next steps'],
              completed: false,
              progress: 0
            }
          ];
        default:
          return [];
      }
    }) || []
  };

  // Debug logging
  console.log('=== GoalSpecificExperience Debug ===');
  console.log('Plan provided:', !!plan);
  console.log('Selected goals:', selectedGoals);
  console.log('Actual plan:', actualPlan);
  console.log('Plan tasks:', actualPlan.tasks);
  console.log('Plan goals:', actualPlan.goals);

  const mockPlan: GeneratedPlan & { topic: string; goals: LearningGoal[] } = {
    ...actualPlan,
    topic: actualPlan.topic || (fileName ? fileName.replace(/\.[^/.]+$/, "") : "Your Topic"),
    goals: actualPlan.goals || selectedGoals || []
  };

  // If no plan was provided, create mock tasks for the goals
  if (!plan && selectedGoals) {
    mockPlan.tasks = selectedGoals.flatMap(goal => {
      switch (goal) {
        case 'flashcards':
          return [
            {
              id: `${goal}-1`,
              title: `Flashcard Set 1`,
              description: "Review key concepts with AI-generated flashcards",
              type: 'flashcard' as const,
              duration: 30,
              difficulty: 'medium' as const,
              resources: []
            }
          ];
        case 'quizzes':
          return [
            {
              id: `${goal}-1`,
              title: `Practice Quiz 1`,
              description: "Test your understanding with AI-generated questions",
              type: 'quiz' as const,
              duration: 45,
              difficulty: 'medium' as const,
              resources: []
            }
          ];
        case 'contest':
          return [
            {
              id: `${goal}-1`,
              title: `Contest Challenge 1`,
              description: "Compete with challenging problems",
              type: 'contest' as const,
              duration: 60,
              difficulty: 'hard' as const,
              resources: []
            }
          ];
        case 'revision-plan':
        case 'learning-path':
          return [
            {
              id: `${goal}-1`,
              title: `Reading Material 1`,
              description: "Study comprehensive reading materials",
              type: 'reading' as const,
              duration: 60,
              difficulty: 'medium' as const,
              resources: []
            },
            {
              id: `${goal}-2`,
              title: `Practice Exercise 1`,
              description: "Apply your knowledge with practice exercises",
              type: 'practice' as const,
              duration: 45,
              difficulty: 'medium' as const,
              resources: []
            }
          ];
        default:
          return [];
      }
    });
  }

  const getGoalSpecificTasks = (goal: LearningGoal) => {
    return mockPlan.tasks.filter(task => {
      switch (goal) {
        case 'flashcards':
          return task.type === 'flashcard';
        case 'quizzes':
          return task.type === 'quiz';
        case 'contest':
          return task.type === 'contest';
        case 'revision-plan':
        case 'learning-path':
          return ['reading', 'practice', 'review'].includes(task.type);
        default:
          return false;
      }
    });
  };

  const getGoalIcon = (goal: LearningGoal) => {
    switch (goal) {
      case 'flashcards':
        return <Brain className="w-6 h-6 text-purple-600" />;
      case 'quizzes':
        return <HelpCircle className="w-6 h-6 text-orange-600" />;
      case 'contest':
        return <Trophy className="w-6 h-6 text-yellow-600" />;
      case 'revision-plan':
        return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'learning-path':
        return <Target className="w-6 h-6 text-green-600" />;
      default:
        return <Brain className="w-6 h-6" />;
    }
  };

  const getGoalDescription = (goal: LearningGoal) => {
    switch (goal) {
      case 'flashcards':
        return "Master key concepts through spaced repetition and active recall";
      case 'quizzes':
        return "Test your understanding with AI-generated questions and get instant feedback";
      case 'contest':
        return "Challenge yourself with timed problems and compete for the best score";
      case 'revision-plan':
        return "Interactive study guide with structured learning steps and progress tracking";
      case 'learning-path':
        return "Take a structured journey through the topic with guided learning";
      default:
        return "Personalized learning experience";
    }
  };

  const handleGoalSelect = (goal: LearningGoal) => {
    setSelectedGoal(goal);
    const tasks = getGoalSpecificTasks(goal);
    
    if (tasks.length > 0) {
      switch (goal) {
        case 'flashcards':
          setCurrentView('flashcards');
          break;
        case 'quizzes':
          setCurrentView('quizzes');
          break;
        case 'contest':
          setCurrentView('contests');
          break;
        case 'revision-plan':
          setCurrentView('revision-plan');
          break;
        case 'learning-path':
          setCurrentView('learning-path');
          break;
        default:
          setCurrentView('overview');
      }
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
    
    // Show success message
    const task = mockPlan.tasks.find(t => t.id === taskId);
    if (task) {
      console.log(`✅ Task completed: ${task.title}`);
    }
  };

  const handleAddGoals = async (newGoals: LearningGoal[]) => {
    // For now, just go back to overview
    // In a real implementation, this would update the plan with new goals
    setCurrentView('overview');
  };

  const getOverallProgress = () => {
    return (completedTasks.size / mockPlan.tasks.length) * 100;
  };

  if (currentView === 'flashcards' && selectedGoal === 'flashcards') {
    const task = getGoalSpecificTasks('flashcards')[0];
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('overview')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Learn with Flashcards
            </h1>
            <p className="text-muted-foreground">Master {mockPlan.topic} through spaced repetition</p>
          </div>
        </div>
        <Flashcards 
          selectedTask={task}
          onTaskComplete={() => task && handleTaskComplete(task.id)}
          onBack={() => setCurrentView('overview')}
        />
      </div>
    );
  }

  if (currentView === 'quizzes' && selectedGoal === 'quizzes') {
    const task = getGoalSpecificTasks('quizzes')[0];
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('overview')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              Practice Quizzes
            </h1>
            <p className="text-muted-foreground">Test your knowledge of {mockPlan.topic}</p>
          </div>
        </div>
        <Quizzes 
          selectedTask={task}
          onTaskComplete={() => task && handleTaskComplete(task.id)}
          onBack={() => setCurrentView('overview')}
        />
      </div>
    );
  }

  if (currentView === 'contests' && selectedGoal === 'contest') {
    const task = getGoalSpecificTasks('contest')[0];
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('overview')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Join Contest
            </h1>
            <p className="text-muted-foreground">Challenge yourself with {mockPlan.topic} problems</p>
          </div>
        </div>
        <Contests 
          selectedTask={task || null}
          onComplete={() => task && handleTaskComplete(task.id)}
          onBack={() => setCurrentView('overview')}
        />
      </div>
    );
  }

  if (currentView === 'revision-plan' && selectedGoal === 'revision-plan') {
    // Use the new LessonPlanRevisionViewer if lesson plan is available
    if (lessonPlan) {
      return (
        <LessonPlanRevisionViewer 
          plan={lessonPlan}
          onBack={() => setCurrentView('overview')}
          onStartPlan={() => {
            console.log('Starting lesson plan revision');
          }}
        />
      );
    }
    
    // Fallback to old RevisionPlanTasks if no lesson plan is available
    return (
      <RevisionPlanTasks 
        plan={mockPlan}
        onBack={() => setCurrentView('overview')}
        onTaskComplete={handleTaskComplete}
      />
    );
  }

  if (currentView === 'learning-path' && selectedGoal === 'learning-path') {
    return (
      <LearningPathTasks 
        plan={mockPlan}
        originalNotes={notes}
        onBack={() => setCurrentView('overview')}
        onTaskComplete={handleTaskComplete}
      />
    );
  }

  if (currentView === 'add-goals') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('overview')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <h1 className="text-2xl font-bold">Add More Learning Goals</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Expand Your Learning Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add more learning goals to enrich your study experience. We'll generate new resources and tasks for your selected goals.
            </p>
            <GoalSelection 
              onGoalsSubmit={handleAddGoals}
              onBack={() => setCurrentView('overview')}
              excludeGoals={mockPlan.goals}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Your Personalized {mockPlan.topic} Experience
            </h1>
            <p className="text-lg text-slate-600">
              Focused learning based on your selected goals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2 h-12 px-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </Button>
            {onViewStudyGuide && (
              <Button 
                variant="outline"
                onClick={onViewStudyGuide}
                className="flex items-center gap-2 h-12 px-6 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <BookOpen className="w-4 h-4" />
                View Study Guide
              </Button>
            )}
            <Button 
              onClick={onComplete}
              className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Finish Plan
            </Button>
          </div>
        </div>
        
        {/* Progress Overview */}
        <Card className="p-6 border border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Overall Progress</h2>
              <p className="text-slate-600">Track your learning journey across all goals</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Tasks Completed</span>
                <span>{completedTasks.size}/{mockPlan.tasks.length}</span>
              </div>
              <Progress value={getOverallProgress()} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{Math.round(getOverallProgress())}%</div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Learning Goals */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Your Learning Goals</h2>
              <p className="text-sm text-slate-600">Choose a learning goal below to start your personalized study session</p>
            </div>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPlan.goals.map(goal => {
            const tasks = getGoalSpecificTasks(goal);
            const completedCount = tasks.filter(task => completedTasks.has(task.id)).length;
            const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
            
            return (
              <Card 
                key={goal}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300"
                onClick={() => handleGoalSelect(goal)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getGoalIcon(goal)}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">
                          {goal.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {getGoalDescription(goal)}
                        </p>
                      </div>
                    </div>
                    {completedCount > 0 && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">{completedCount}/{tasks.length} completed</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {tasks.length > 0 && (
                    <Button 
                      className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoalSelect(goal);
                      }}
                    >
                      {progress === 100 ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Continue Learning
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setCurrentView('add-goals')}
            variant="outline"
            className="h-16 flex flex-col items-center gap-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add More Goals</span>
          </Button>
          
          {mockPlan.goals.includes('revision-plan') && (
            <Button 
              onClick={() => handleGoalSelect('revision-plan')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Start Revision Plan</span>
            </Button>
          )}
          
          {mockPlan.goals.includes('learning-path') && (
            <Button 
              onClick={() => handleGoalSelect('learning-path')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Start Learning Path</span>
            </Button>
          )}
          
          {mockPlan.goals.includes('flashcards') && (
            <Button 
              onClick={() => handleGoalSelect('flashcards')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">Quick Flashcards</span>
            </Button>
          )}
          
          {mockPlan.goals.includes('quizzes') && (
            <Button 
              onClick={() => handleGoalSelect('quizzes')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Take Quiz</span>
            </Button>
          )}
          
          {mockPlan.goals.includes('contest') && (
            <Button 
              onClick={() => handleGoalSelect('contest')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Join Contest</span>
            </Button>
          )}
        </div>
      </div>

      {/* Learning Tips - Collapsible */}
      <div className="space-y-4">
        <button
          onClick={() => setShowLearningTips(!showLearningTips)}
          className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Learning Tips for {mockPlan.topic}</h2>
          </div>
          {showLearningTips ? (
            <ChevronUp className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600" />
          )}
        </button>
        
        {showLearningTips && (
          <Card className="p-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-amber-900">Focus on One Goal at a Time</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Complete tasks from one learning goal before moving to another for better retention and deeper understanding.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-amber-900">Take Regular Breaks</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Take 5-10 minute breaks between different goal activities to maintain focus and prevent mental fatigue.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-amber-900">Expand Your Learning</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Add more goals as you progress to create a more comprehensive learning experience and build stronger connections.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
