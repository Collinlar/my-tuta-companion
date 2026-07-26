import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle, BookOpen, Brain, Plus, Sparkles, TrendingUp } from "lucide-react";
import { StudySession } from "./StudySession";
import { Quizzes } from "./Quizzes";
import { Flashcards } from "./Flashcards";
import { Contests } from "./Contests";
import { RevisionPlanCreator } from "./RevisionPlanCreator";
import { GoalSpecificExperience } from "./GoalSpecificExperience";
import { useToast } from "@/hooks/use-toast";
import { GeneratedPlan } from "@/services/aiContentGenerator";
import { SimpleRevisionPlan } from "@/services/simpleRevisionPlanService";
import { ComprehensivePlanDashboard } from "./ComprehensivePlanDashboard";
import { SimpleRevisionPlanViewer } from "./SimpleRevisionPlanViewer";
import { LessonPlanRevisionPlan } from "@/services/lessonPlanRevisionService";
import { LessonPlanRevisionViewer } from "./LessonPlanRevisionViewer";
import { DiagnosticPanel } from "./DiagnosticPanel";

export function RevisionPlans() {
  const [currentView, setCurrentView] = useState<'list' | 'study' | 'quiz' | 'flashcards' | 'contests' | 'creator' | 'experience' | 'comprehensive' | 'lesson-plan' | 'generating' | 'diagnostics'>('list');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedComprehensivePlan, setSelectedComprehensivePlan] = useState<SimpleRevisionPlan | null>(null);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlanRevisionPlan | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlan[]>([]);
  const [comprehensivePlans, setComprehensivePlans] = useState<SimpleRevisionPlan[]>([]);
  const { toast } = useToast();

  // Load plans from localStorage on component mount
  useEffect(() => {
    // Load regular generated plans
    const savedPlans = localStorage.getItem('generatedPlans');
    if (savedPlans) {
      try {
        const parsedPlans = JSON.parse(savedPlans);
        // Ensure createdAt is a Date object and filter out any corrupted plans
        const plansWithDates = parsedPlans
          .filter((plan: any) => plan && plan.title) // Filter out corrupted plans
          .map((plan: any) => ({
            ...plan,
            createdAt: plan.createdAt ? new Date(plan.createdAt) : new Date()
          }));
        setGeneratedPlans(plansWithDates);
      } catch (error) {
        console.error('Error loading generated plans:', error);
        // Clear corrupted data
        localStorage.removeItem('generatedPlans');
      }
    }

    // Load comprehensive plans
    const savedComprehensivePlan = localStorage.getItem('currentComprehensivePlan');
    if (savedComprehensivePlan) {
      try {
        const parsedComprehensivePlan = JSON.parse(savedComprehensivePlan);
        // Ensure createdAt is a Date object
        const comprehensivePlanWithDate = {
          ...parsedComprehensivePlan,
          createdAt: parsedComprehensivePlan.createdAt ? new Date(parsedComprehensivePlan.createdAt) : new Date()
        };
        setComprehensivePlans([comprehensivePlanWithDate]);
      } catch (error) {
        console.error('Error loading comprehensive plan:', error);
        // Clear corrupted data
        localStorage.removeItem('currentComprehensivePlan');
      }
    }
  }, []);
  
  const [plans, setPlans] = useState([]);


  const handleStartStudy = () => {
    setCurrentView('study');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPlan(null);
    setSelectedComprehensivePlan(null);
  };

  const handleComprehensivePlanSelect = (plan: SimpleRevisionPlan) => {
    setSelectedComprehensivePlan(plan);
    setCurrentView('comprehensive');
  };

  const handleStartLearning = async (plan: any) => {
    console.log('handleStartLearning called with plan:', plan);
    console.log('Current lesson plans:', localStorage.getItem('currentLessonPlan'));
    
    // Check if there's already a lesson plan for this topic
    const savedLessonPlan = localStorage.getItem('currentLessonPlan');
    let existingLessonPlan = null;
    
    if (savedLessonPlan) {
      try {
        const parsedPlan = JSON.parse(savedLessonPlan);
        // Check if this lesson plan matches the current topic
        if (parsedPlan.topic.toLowerCase().includes(plan.topic.toLowerCase()) || 
            plan.topic.toLowerCase().includes(parsedPlan.topic.toLowerCase())) {
          existingLessonPlan = {
            ...parsedPlan,
            createdAt: new Date(parsedPlan.createdAt)
          };
        }
      } catch (error) {
        console.error('Error parsing saved lesson plan:', error);
      }
    }

    console.log('Existing lesson plan found:', existingLessonPlan);

    if (existingLessonPlan) {
      // Use existing lesson plan
      console.log('Using existing lesson plan');
      setSelectedLessonPlan(existingLessonPlan);
      setCurrentView('lesson-plan');
    } else {
      // Generate a new lesson plan
      console.log('Generating new lesson plan');
      try {
        setCurrentView('generating');
        const { lessonPlanRevisionService } = await import('@/services/lessonPlanRevisionService');
        
        // Use the plan's notes or create a basic description
        const notes = plan.notes || plan.description || `Study notes for ${plan.topic} in ${plan.subject}`;
        console.log('Generating lesson plan with notes:', notes);
        const lessonPlan = await lessonPlanRevisionService.generateLessonPlanRevision(notes, plan.topic, plan.subject || 'General', plan.grade || 'Grade 8');
        console.log('Generated lesson plan:', lessonPlan);
        
        // Save to localStorage
        localStorage.setItem('currentLessonPlan', JSON.stringify(lessonPlan));
        
        setSelectedLessonPlan(lessonPlan);
        setCurrentView('lesson-plan');
        
        toast({
          title: "Study Guide Generated!",
          description: `Your personalized study guide for ${plan.topic} is ready!`,
        });
      } catch (error) {
        console.error('Error generating lesson plan:', error);
        toast({
          title: "Error",
          description: "Failed to generate study guide. Please try again.",
          variant: "destructive",
        });
        // Fallback to old experience view
        setCurrentView('experience');
      }
    }
  };

  const handleCreateNewPlan = () => {
    setCurrentView('creator');
  };

  const handlePlanCreated = async (plan: GeneratedPlan) => {
    setGeneratedPlans(prev => [plan, ...prev]);
    setSelectedPlan(plan);
    
    // Generate lesson plan for the newly created plan
    try {
      setCurrentView('generating');
      const { lessonPlanRevisionService } = await import('@/services/lessonPlanRevisionService');
      
      // Use the plan's notes or create a basic description
      const notes = plan.notes || plan.description || `Study notes for ${plan.topic} in ${plan.subject}`;
      const lessonPlan = await lessonPlanRevisionService.generateLessonPlanRevision(notes, plan.topic, plan.subject || 'General', plan.grade || 'Grade 8');
      
      // Save to localStorage
      localStorage.setItem('currentLessonPlan', JSON.stringify(lessonPlan));
      
      setSelectedLessonPlan(lessonPlan);
      setCurrentView('lesson-plan');
      
      toast({
        title: "Study Guide Created!",
        description: `Your personalized study guide for ${plan.topic} is ready!`,
      });
    } catch (error) {
      console.error('Error generating lesson plan for new plan:', error);
      // Fallback to experience view if lesson plan generation fails
      setCurrentView('experience');
      toast({
        title: "Plan Created!",
        description: `Your personalized ${plan.topic} plan is ready.`,
      });
    }
  };

  const handleCreatorBack = () => {
    setCurrentView('list');
  };

  const handleTaskComplete = (taskId: string) => {
    toast({
      title: "Task completed!",
      description: "Great progress! Keep up the good work.",
    });
  };

  const handleStudyComplete = () => {
    // Update plan progress
    if (selectedPlan) {
      setPlans(prev => prev.map(plan => 
        plan === selectedPlan 
          ? { ...plan, progress: Math.min(100, plan.progress + 10) }
          : plan
      ));
    }
    
    toast({
      title: "Study session completed!",
      description: "Your progress has been updated.",
    });
    
    setCurrentView('list');
  };

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleStartFlashcards = () => {
    setCurrentView('flashcards');
  };

  const handleStartContest = () => {
    setCurrentView('contests');
  };

  const handleTaskInteract = (taskId: string, taskType: string) => {
    setActiveTaskId(taskId);
    switch (taskType) {
      case 'quiz':
        setCurrentView('quiz');
        break;
      case 'flashcard':
        setCurrentView('flashcards');
        break;
      case 'contest':
        setCurrentView('contests');
        break;
      default:
        setCurrentView('study');
    }
  };

  // Render different views
  if (currentView === 'creator') {
    return (
      <RevisionPlanCreator
        onComplete={handlePlanCreated}
        onBack={handleCreatorBack}
      />
    );
  }

  if (currentView === 'diagnostics') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBackToList}>
            ← Back to Plans
          </Button>
        </div>
        <DiagnosticPanel />
      </div>
    );
  }

  if (currentView === 'experience' && selectedPlan && selectedPlan.topic) {
    return (
      <GoalSpecificExperience 
        plan={selectedPlan}
        onBack={() => setCurrentView('list')}
        onAddGoals={(newGoals) => {
          // Update the plan with new goals
          const updatedPlan = {
            ...selectedPlan,
            goals: [...selectedPlan.goals, ...newGoals]
          };
          setSelectedPlan(updatedPlan);
          setGeneratedPlans(prev => prev.map(p => 
            p.id === selectedPlan.id ? updatedPlan : p
          ));
        }}
      />
    );
  }

  console.log('Current view:', currentView);
  console.log('Selected comprehensive plan:', selectedComprehensivePlan);

  if (currentView === 'generating') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBackToList}>
            ← Back to Plans
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Generating Comprehensive Study Plan</h2>
            <p className="text-gray-600 max-w-md">
              Creating a structured, pedagogical approach to your learning with focus areas, study methods, and assessment strategies...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'comprehensive' && selectedComprehensivePlan) {
    return (
      <SimpleRevisionPlanViewer
        plan={selectedComprehensivePlan}
        onBack={handleBackToList}
        onStartPlan={() => {
          // Optional: Handle starting the plan
          console.log('Starting comprehensive plan:', selectedComprehensivePlan.title);
        }}
      />
    );
  }

  if (currentView === 'lesson-plan' && selectedLessonPlan) {
    return (
      <LessonPlanRevisionViewer
        plan={selectedLessonPlan}
        onBack={handleBackToList}
        onStartPlan={() => {
          // Optional: Handle starting the plan
          console.log('Starting lesson plan:', selectedLessonPlan.title);
        }}
      />
    );
  }


  if (currentView === 'study') {
    return (
      <StudySession
        plan={selectedPlan}
        onBack={() => setCurrentView('list')}
        onComplete={handleStudyComplete}
      />
    );
  }

  if (currentView === 'quiz') {
    return (
      <Quizzes
        selectedTask={selectedPlan?.tasks?.find((t: any) => t.id === activeTaskId)}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'flashcards') {
    return (
      <Flashcards
        selectedTask={selectedPlan?.tasks?.find((t: any) => t.id === activeTaskId)}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'contests') {
    return (
      <Contests
        selectedTask={selectedPlan?.tasks?.find((t: any) => t.id === activeTaskId)}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900">Revision Plans & Learning Paths</h1>
              <p className="text-slate-600">Your personalized study hub powered by AI</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentView('diagnostics')}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Run Diagnostics
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Overview - Collapsible */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/60">
        <div className="p-6">
          <button className="flex items-center justify-between w-full group hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Today's Study Overview
                </h2>
                <p className="text-xs text-slate-600">Your daily learning summary</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/60 text-slate-700">
                6 tasks due
              </Badge>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div className="mt-6 pt-6 border-t border-white/40">
            <div className="bg-white/60 p-6 rounded-xl border border-white/40 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Start Your Learning Journey</h3>
              <p className="text-slate-600 mb-4">
                Create your first revision plan to see your study overview and track your progress.
              </p>
              <button
                onClick={() => setCurrentView('study')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Plan
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Generated Plans */}
      {generatedPlans.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI Generated Plans</h2>
              <p className="text-sm text-slate-600">Personalized learning experiences created for you</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            {generatedPlans.map((plan, index) => (
              <Card key={`ai-${plan.id}`} className="p-6 hover:shadow-lg transition-all border border-slate-200 hover:border-teal-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{plan.topic}</h3>
                      <p className="text-slate-600 mb-2">{plan.subject}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          AI Generated
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                          {plan.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{plan.estimatedDuration}</div>
                      <div className="text-xs text-slate-600">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{plan.tasks?.length || plan.totalTasks || 0} tasks</div>
                      <div className="text-xs text-slate-600">Total tasks</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {plan.createdAt && typeof plan.createdAt.toLocaleDateString === 'function' 
                          ? plan.createdAt.toLocaleDateString() 
                          : new Date().toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-600">Created</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Learning Goals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.goals.map(goal => (
                      <Badge key={goal} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                        {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900 mb-1">Ready to start?</p>
                    <p className="text-sm text-slate-600">Next: {plan.tasks?.[0]?.title || plan.nextTask || 'Begin your personalized learning journey'}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={() => { console.log('Start Learning button clicked for plan:', plan); setSelectedPlan(plan); handleStartLearning(plan); }} className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white">
                      <Brain className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Study Plans */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Your Study Plans</h2>
            <p className="text-sm text-slate-600">Track your progress and continue learning</p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {/* Comprehensive Plans */}
          {comprehensivePlans.map((plan, index) => (
            <Card key={`comprehensive-${index}`} className="p-6 hover:shadow-lg transition-all border border-slate-200 hover:border-blue-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{plan.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{plan.overview.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {plan.overview.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plan.overview.totalEstimatedTime}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {plan.overview.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Comprehensive Plan
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleComprehensivePlanSelect(plan)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Plan
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Revision Phases</span>
                  <span className="font-medium">{plan.revisionPhases.length} phases</span>
                </div>
                <Progress value={0} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0% Complete</span>
                  <span>Start your comprehensive revision journey</span>
                </div>
              </div>
            </Card>
          ))}

          {/* Regular Plans */}
          {plans.map((plan, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all border border-slate-200 hover:border-green-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">{plan.topic}</h3>
                    <p className="text-slate-600 mb-2">{plan.subject}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {plan.progress}% complete
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-900">Progress</span>
                  <span className="text-slate-600">{plan.progress}%</span>
                </div>
                <Progress value={plan.progress} className="h-3 bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">{plan.dueToday} tasks</div>
                    <div className="text-xs text-slate-600">Due today</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">{plan.timeEstimate}</div>
                    <div className="text-xs text-slate-600">Time estimate</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">{plan.totalTasks} tasks</div>
                    <div className="text-xs text-slate-600">Total tasks</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="font-medium text-slate-900 mb-1">Continue your journey</p>
                  <p className="text-sm text-slate-600">Next: {plan.nextTask}</p>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => { setSelectedPlan(plan); handleStartLearning(plan); }} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                    <Brain className="w-4 h-4 mr-2" />
                    Continue Study
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create New Plan */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/60">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Create AI-Powered Learning Experience</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Upload your notes and let AI create personalized revision plans, learning paths, flashcards, and more
          </p>
          <Button 
            onClick={handleCreateNewPlan}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
        </div>
      </Card>
    </div>
  );
}