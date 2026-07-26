import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  Brain, 
  Clock, 
  Target,
  Zap,
  BookOpen,
  Route,
  HelpCircle,
  Trophy,
  XCircle
} from "lucide-react";
import { NotesInput } from "./NotesInput";
import { GoalSelection, LearningGoal } from "./GoalSelection";
import { RevisionPlanDetail } from "./RevisionPlanDetail";
import { GoalSpecificExperience } from "./GoalSpecificExperience";
import { aiContentGenerator, GeneratedPlan } from "@/services/aiContentGenerator";
import { SimpleRevisionPlan } from "@/services/simpleRevisionPlanService";
import { SimpleRevisionPlanViewer } from "./SimpleRevisionPlanViewer";
import { StructuredRevisionPlan } from "@/services/structuredRevisionPlanService";
import { StructuredRevisionPlanViewer } from "./StructuredRevisionPlanViewer";
import { LessonPlanRevisionPlan } from "@/services/lessonPlanRevisionService";
import { LessonPlanRevisionViewer } from "./LessonPlanRevisionViewer";
import { enhanceTasksWithAIResources } from "@/data/sampleResources";

type CreatorStep = 'notes' | 'goals' | 'generating' | 'plan' | 'experience' | 'comprehensive' | 'structured' | 'lesson-plan' | 'complete';

interface RevisionPlanCreatorProps {
  onComplete?: (plan: GeneratedPlan) => void;
  onBack?: () => void;
  initialNotes?: string;
  initialFileName?: string;
}

export function RevisionPlanCreator({ onComplete, onBack, initialNotes, initialFileName }: RevisionPlanCreatorProps) {
  const [currentStep, setCurrentStep] = useState<CreatorStep>(initialNotes ? 'goals' : 'notes');
  const [notes, setNotes] = useState(initialNotes || "");
  const [fileName, setFileName] = useState<string | undefined>(initialFileName);
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [comprehensivePlan, setComprehensivePlan] = useState<SimpleRevisionPlan | null>(null);
  const [structuredPlan, setStructuredPlan] = useState<StructuredRevisionPlan | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanRevisionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNotesSubmit = (submittedNotes: string, submittedFileName?: string) => {
    setNotes(submittedNotes);
    setFileName(submittedFileName);
    setCurrentStep('goals');
  };

  const handleGoalSelect = (goals: LearningGoal[]) => {
    setSelectedGoals(goals);
    setCurrentStep('generating');
    generatePlan(goals);
  };

  const generatePlan = async (goals: LearningGoal[]) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Test API connection first
      console.log('Testing Groq API connection...');
      const { groqApiService } = await import('@/services/groqApiService');
      const isConnected = await groqApiService.testConnection();
      console.log('API connection test result:', isConnected);
      
      if (!isConnected) {
        throw new Error('Failed to connect to Groq API. Please check your API key and internet connection.');
      }
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate the plan - await the promise
      console.log('Generating revision plan with notes:', notes.substring(0, 100) + '...');
      console.log('Selected goals:', goals);
      const plan = await aiContentGenerator.generateRevisionPlan(notes, goals, fileName);
      console.log('Generated plan:', plan);
      
      // Enhance tasks with AI resources
      console.log('Enhancing tasks with AI resources...');
      console.log('Passing original notes to enhanceTasksWithAIResources:', notes.substring(0, 100) + '...');
      const enhancedTasks = await enhanceTasksWithAIResources(plan.tasks, notes);
      const enhancedPlan = {
        ...plan,
        tasks: enhancedTasks
      };
      console.log('Enhanced plan:', enhancedPlan);
      
      setGeneratedPlan(enhancedPlan);
      
      // Generate lesson plan revision
      console.log('Generating lesson plan revision...');
      let lesson: LessonPlanRevisionPlan | null = null;
      try {
        const { lessonPlanRevisionService } = await import('@/services/lessonPlanRevisionService');
        console.log('📚 Generating lesson plan revision... This may take a moment.');
        lesson = await lessonPlanRevisionService.generateLessonPlanRevision(notes, enhancedPlan.topic, enhancedPlan.subject, 'Grade 8');
        setLessonPlan(lesson);
        console.log('✅ Lesson plan generated:', lesson);
      } catch (lessonError) {
        console.error('Error generating lesson plan:', lessonError);
        // Don't fail the entire process if lesson plan fails
      }
      
      // Save the generated plan to localStorage so other components can access it
      const savedPlans = localStorage.getItem('generatedPlans');
      const existingPlans = savedPlans ? JSON.parse(savedPlans) : [];
      const planWithDate = {
        ...enhancedPlan,
        createdAt: new Date()
      };
      const updatedPlans = [planWithDate, ...existingPlans];
      localStorage.setItem('generatedPlans', JSON.stringify(updatedPlans));
      console.log('Saved generated plan to localStorage:', enhancedPlan.title);

      // Save the lesson plan to localStorage as well
      if (lesson) {
        const lessonPlanWithDate = {
          ...lesson,
          createdAt: new Date()
        };
        localStorage.setItem('currentLessonPlan', JSON.stringify(lessonPlanWithDate));
        console.log('Saved lesson plan to localStorage:', lesson.title);
      }
      
      // Always go to experience (Learning Goals Dashboard) first
      // Users can access lesson plan later if they want
      setCurrentStep('experience');
    } catch (error) {
      console.error('Error generating plan:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred while generating your plan. Please try again.');
      setCurrentStep('goals'); // Go back to goals step so user can retry
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanComplete = () => {
    if (generatedPlan) {
      onComplete?.(generatedPlan);
    }
  };

  const handleLearningGoalComplete = () => {
    // Don't call onComplete immediately - let user continue with other goals
    // Only call onComplete when they explicitly want to finish the entire plan
    console.log('Learning goal completed, staying in goals dashboard');
  };

  const handleViewStudyGuide = () => {
    // Switch to lesson plan view
    setCurrentStep('lesson-plan');
  };


  const getStepProgress = () => {
    switch (currentStep) {
      case 'notes': return 20;
      case 'goals': return 40;
      case 'generating': return 60;
      case 'experience': return 80;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'notes': return 'Upload Your Notes';
      case 'goals': return 'Choose Learning Goals';
      case 'generating': return 'Generating Your Plan';
      case 'experience': return 'Your Personalized Experience';
      case 'complete': return 'Plan Complete';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'notes': return 'Upload or paste your study notes to get started';
      case 'goals': return 'Select your learning goals to personalize your experience';
      case 'generating': return 'AI is analyzing your notes and creating a personalized plan...';
      case 'experience': return 'Start your focused learning journey!';
      case 'complete': return 'You\'ve completed your revision plan!';
      default: return '';
    }
  };

  // Generating step - Minimalist design
  if (currentStep === 'generating') {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        {/* Back button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study
          </Button>
        )}

        <div className="text-center space-y-6">
          {/* Main title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Generating Your Plan</h1>
            <p className="text-slate-600 text-sm">
              AI is analyzing your notes and creating a personalized revision experience
            </p>
          </div>

          {/* Progress indicator */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {/* AI Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6 text-white animate-pulse" />
              </div>
              
              {/* Progress steps - Simplified */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">Analyzing notes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">Processing goals</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-600">Generating content</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: '67%' }}></div>
                </div>
                <p className="text-xs text-slate-500">
                  This usually takes 10-30 seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Goal-specific experience step
  if (currentStep === 'experience' && generatedPlan) {
    return (
      <GoalSpecificExperience 
        plan={generatedPlan}
        notes={notes}
        fileName={fileName}
        selectedGoals={selectedGoals}
        onBack={onBack || (() => {})}
        onComplete={handleLearningGoalComplete}
        onViewStudyGuide={handleViewStudyGuide}
      />
    );
  }

  // Plan display step (legacy - keeping for fallback)
  if (currentStep === 'plan' && generatedPlan) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Personalized Plan</h1>
          <p className="text-muted-foreground">
            AI-generated revision plan based on your notes and goals
          </p>
        </div>

        {/* Plan Overview */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{generatedPlan.title}</h2>
              <p className="text-muted-foreground">{generatedPlan.description}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              AI Generated
            </Badge>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{generatedPlan.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{generatedPlan.estimatedDuration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{generatedPlan.tasks.length} tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{generatedPlan.difficulty}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {generatedPlan.goals.map(goal => (
              <Badge key={goal} variant="secondary" className="text-xs">
                {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>

          {/* Comprehensive Revision Plan Button */}
          {comprehensivePlan && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Enhanced Study Guide Available</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Get a comprehensive, structured revision plan with focus areas, study methods, and assessment strategies
                  </p>
                </div>
                <Button 
                  onClick={() => setCurrentStep('comprehensive')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Comprehensive Plan
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Plan Details */}
        <RevisionPlanDetail
          plan={{
            subject: generatedPlan.subject,
            topic: generatedPlan.topic,
            progress: 0,
            dueToday: 0,
            totalTasks: generatedPlan.tasks.length,
            nextTask: generatedPlan.tasks[0]?.title || 'Start your plan',
            timeEstimate: generatedPlan.estimatedDuration
          }}
          onBack={() => setCurrentStep('goals')}
          onStartStudy={() => {}}
          onTaskComplete={() => {}}
          onStartQuiz={() => {}}
          onStartFlashcards={() => {}}
          onStartContest={() => {}}
          onTaskInteract={() => {}}
        />

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('goals')}>
            ← Modify Goals
          </Button>
          <Button onClick={handlePlanComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Start This Plan
          </Button>
        </div>
      </div>
    );
  }

  // Main flow
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getStepTitle()}</h1>
            <p className="text-muted-foreground">{getStepDescription()}</p>
          </div>
          {onBack && currentStep === 'notes' && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{getStepProgress()}%</span>
          </div>
          <Progress value={getStepProgress()} className="w-full" />
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'notes' && (
        <NotesInput
          onNotesSubmit={handleNotesSubmit}
          onBack={onBack}
        />
      )}

      {currentStep === 'goals' && (
        <div className="space-y-4">
          {error && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Generation Failed</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setError(null)}
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}
          <GoalSelection
            notes={notes}
            fileName={fileName}
            onGoalSelect={handleGoalSelect}
            onBack={() => setCurrentStep('notes')}
          />
        </div>
      )}

      {currentStep === 'comprehensive' && comprehensivePlan && (
        <SimpleRevisionPlanViewer 
          plan={comprehensivePlan}
          onBack={() => setCurrentStep('plan')}
          onStartPlan={handlePlanComplete}
        />
      )}

      {currentStep === 'structured' && structuredPlan && (
        <StructuredRevisionPlanViewer 
          plan={structuredPlan}
          onBack={() => setCurrentStep('plan')}
          onStartPlan={handlePlanComplete}
        />
      )}

      {currentStep === 'lesson-plan' && lessonPlan && (
        <LessonPlanRevisionViewer 
          plan={lessonPlan}
          onBack={() => setCurrentStep('experience')}
          onStartPlan={handlePlanComplete}
        />
      )}
    </div>
  );
}
