import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Route,
  ArrowRight,
  Lightbulb,
  Brain,
  TrendingUp,
  ExternalLink,
  FileText,
  Video,
  Link,
  Zap,
  Eye,
  Download,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { LearningPath, LearningStep, LearningResource } from "@/services/aiLearningPathGenerator";
import { groqApiService } from "@/services/groqApiService";
import { profileAwareAI } from "@/services/profileAwareAI";
import { ReadingContentModal } from "./ReadingContentModal";
import { VideoLessonModal } from "./VideoLessonModal";
import { PDFPreviewModal } from "./PDFPreviewModal";
import { ResourceCard, ResourceGrid } from "./ResourceCard";

interface LearningPathTasksProps {
  plan: any; // Original GeneratedPlan
  originalNotes?: string; // Add original notes parameter
  onBack: () => void;
  onTaskComplete: (taskId: string) => void;
}

export function LearningPathTasks({ plan, originalNotes, onBack, onTaskComplete }: LearningPathTasksProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLearning, setIsLearning] = useState(false);
  const [learningTime, setLearningTime] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [resourceProgress, setResourceProgress] = useState<Record<string, number>>({});
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedObjectives, setCollapsedObjectives] = useState<Set<number>>(new Set());
  
  // Toggle objective preview visibility
  const toggleObjectiveCollapse = (objectiveIndex: number) => {
    setCollapsedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveIndex)) {
        newSet.delete(objectiveIndex);
      } else {
        newSet.add(objectiveIndex);
      }
      return newSet;
    });
  };
  
  // Modal states
  const [readingModal, setReadingModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    estimatedTime: string;
  }>({ isOpen: false, title: '', content: '', estimatedTime: '' });
  
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl?: string;
    duration: string;
    transcript?: string;
  }>({ isOpen: false, title: '', duration: '' });
  
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    url?: string;
    estimatedTime: string;
  }>({ isOpen: false, title: '', content: '', estimatedTime: '' });

  // Generate the learning path from the plan
  React.useEffect(() => {
    const loadLearningPath = async () => {
      try {
        console.log('Loading learning path for plan:', plan);
        const path = await generateLearningPathFromPlan(plan, originalNotes);
        console.log('Generated learning path:', path);
        console.log('Learning path has steps:', path.steps?.length || 0);
        console.log('Setting learning path state...');
        setLearningPath(path);
        console.log('Learning path state set successfully');
        console.log('UI should now display the generated content');
      } catch (error) {
        console.error('Error loading learning path:', error);
        console.error('This error caused fallback to be used');
        // Set a fallback learning path instead of leaving it null
        const fallbackPath = createFallbackLearningPath(plan);
        console.log('Using fallback learning path:', fallbackPath);
        console.log('Setting fallback learning path state...');
        setLearningPath(fallbackPath);
        console.log('Fallback learning path state set successfully');
      } finally {
        console.log('Setting loading to false...');
        setIsLoading(false);
        console.log('Loading state updated');
      }
    };
    
    loadLearningPath();
  }, [plan]);

  console.log('LearningPathTasks render - isLoading:', isLoading, 'learningPath:', !!learningPath);

  if (isLoading || !learningPath) {
    console.log('Rendering loading state...');
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back button */}
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goals
        </Button>

        <div className="text-center space-y-6">
          {/* Main title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Loading Learning Path</h1>
            <p className="text-slate-600 text-sm">
              Generating your personalized learning experience
            </p>
          </div>

          {/* Progress indicator */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {/* AI Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                <Route className="w-6 h-6 text-white animate-pulse" />
              </div>
              
              {/* Loading text */}
              <p className="text-slate-600 text-sm">
                Creating your guided learning pathway...
              </p>

              {/* Spinner */}
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main learning path content...');
  console.log('Learning path steps:', learningPath?.steps?.length);
  console.log('Current step index:', currentStepIndex);

  const currentStep = learningPath?.steps[currentStepIndex];
  
  // Debug current step objectives
  if (currentStep) {
    console.log('Current step objectives:', currentStep.learningObjectives);
  }
  const totalSteps = learningPath?.steps.length || 0;
  const progress = learningPath && learningPath.steps.length > 0 ? (completedSteps.size / learningPath.steps.length) * 100 : 0;

  const startLearningSession = () => {
    setIsLearning(true);
    setLearningTime(0);
    const interval = setInterval(() => {
      setLearningTime(prev => prev + 1);
    }, 1000);
    
    (window as any).learningInterval = interval;
  };

  const pauseLearningSession = () => {
    setIsLearning(false);
    if ((window as any).learningInterval) {
      clearInterval((window as any).learningInterval);
    }
  };

  const resetLearningSession = () => {
    setIsLearning(false);
    setLearningTime(0);
    if ((window as any).learningInterval) {
      clearInterval((window as any).learningInterval);
    }
  };

  const nextStep = () => {
    if (learningPath && currentStepIndex < learningPath.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    onTaskComplete(stepId);
  };

  const updateResourceProgress = (resourceId: string, progress: number) => {
    setResourceProgress(prev => ({ ...prev, [resourceId]: progress }));
  };

  // Helper function to get resource icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-red-600" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'interactive':
        return <Zap className="w-6 h-6 text-purple-600" />;
      case 'link':
        return <ExternalLink className="w-6 h-6 text-green-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-gray-600" />;
    }
  };

  // Helper function to get resource type label
  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Reading';
      case 'video':
        return 'Video';
      case 'pdf':
        return 'PDF';
      case 'interactive':
        return 'Interactive';
      case 'link':
        return 'External Link';
      default:
        return 'Resource';
    }
  };

  // Helper function to handle resource click
  const handleResourceClick = (resource: any) => {
    // Update progress when resource is accessed
    setResourceProgress(prev => ({
      ...prev,
      [resource.id]: Math.min(100, (prev[resource.id] || 0) + 25)
    }));
    
    switch (resource.type) {
      case 'text':
        setReadingModal({
          isOpen: true,
          title: resource.title,
          content: resource.content || resource.description,
          estimatedTime: resource.estimatedTime
        });
        break;
      case 'video':
        setVideoModal({
          isOpen: true,
          title: resource.title,
          videoUrl: resource.url,
          duration: resource.duration || resource.estimatedTime,
          transcript: resource.content
        });
        break;
      case 'pdf':
        setPdfModal({
          isOpen: true,
          title: resource.title,
          content: resource.content || resource.description,
          url: resource.url,
          estimatedTime: resource.estimatedTime
        });
        break;
      case 'interactive':
      case 'link':
        if (resource.url) {
          window.open(resource.url, '_blank');
        }
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Modal completion handlers
  const handleReadingComplete = (notes: string, timeSpent: number) => {
    console.log('Reading completed:', { notes, timeSpent });
    // Update resource progress to 100%
    if (readingModal.title) {
      setResourceProgress(prev => ({
        ...prev,
        [readingModal.title]: 100
      }));
    }
  };

  const handleVideoComplete = (notes: string, watchProgress: number, timeSpent: number) => {
    console.log('Video completed:', { notes, watchProgress, timeSpent });
    // Update resource progress based on watch progress
    if (videoModal.title) {
      setResourceProgress(prev => ({
        ...prev,
        [videoModal.title]: watchProgress
      }));
    }
  };

  const handlePDFComplete = (timeSpent: number, pagesViewed: number) => {
    console.log('PDF completed:', { timeSpent, pagesViewed });
    // Update resource progress based on pages viewed
    if (pdfModal.title) {
      const progress = (pagesViewed / 3) * 100; // Assuming 3 pages
      setResourceProgress(prev => ({
        ...prev,
        [pdfModal.title]: progress
      }));
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 h-10 px-4 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Goals
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Route className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Guided Learning Path</h1>
                <p className="text-lg text-slate-600">Master {learningPath.topic} through curated resources</p>
              </div>
            </div>
          </div>
          
          {/* Learning Timer */}
          <Card className="p-6 border border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-slate-900">
                  {formatTime(learningTime)}
                </div>
                <div className="text-sm text-slate-600">Learning Time</div>
              </div>
              <div className="flex gap-3">
                {!isLearning ? (
                  <Button size="sm" onClick={startLearningSession} className="h-10 w-10 p-0 bg-green-500 hover:bg-green-600 text-white">
                    <Play className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={pauseLearningSession} className="h-10 w-10 p-0 border-slate-300 hover:bg-slate-50">
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={resetLearningSession} className="h-10 w-10 p-0 border-slate-300 hover:bg-slate-50">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Path Overview */}
      <Card className="p-8 border border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Learning Path: {learningPath.topic}</h2>
              <p className="text-slate-600 mt-2">{learningPath.description}</p>
            </div>
            <Badge className="px-4 py-2 bg-green-500 text-white border-0 text-sm font-semibold">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          
          <Progress value={progress} className="h-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completedSteps.size}</div>
              <div className="text-sm text-slate-600 font-medium">Steps Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{totalSteps}</div>
              <div className="text-sm text-slate-600 font-medium">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{learningPath.totalEstimatedTime}</div>
              <div className="text-sm text-slate-600 font-medium">Estimated Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 capitalize">{learningPath.difficulty}</div>
              <div className="text-sm text-slate-600 font-medium">Difficulty</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Journey */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Route className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Your Learning Journey</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {learningPath.steps.map((step, index) => (
            <Card 
              key={step.id}
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                index === currentStepIndex 
                  ? 'border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' 
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setCurrentStepIndex(index)}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                    index === currentStepIndex 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                      : completedSteps.has(step.id)
                      ? 'bg-gradient-to-br from-green-600 to-green-700'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}>
                    {index === currentStepIndex ? (
                      <Route className="w-6 h-6" />
                    ) : completedSteps.has(step.id) ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      <Badge className={`px-3 py-1 text-xs font-medium ${
                        step.difficulty === 'beginner' 
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : step.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {step.difficulty}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1 text-xs bg-slate-100 text-slate-700 border-slate-200">
                        {step.estimatedTime}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-4 leading-relaxed">{step.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {step.resources.slice(0, 3).map((resource) => (
                        <div key={resource.id} className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                          {getResourceIcon(resource.type)}
                          <span className="text-xs text-slate-700 font-medium truncate max-w-24">{resource.title}</span>
                        </div>
                      ))}
                      {step.resources.length > 3 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                          <span className="text-xs text-slate-600 font-medium">
                            +{step.resources.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Step Resources */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Step {currentStepIndex + 1}: {currentStep?.title}</h2>
            <p className="text-slate-600">Follow the learning objectives and complete the resources below</p>
          </div>
          
          {currentStep && (
            <div className="space-y-8">
              {/* Learning Objectives with Previews */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Target className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Learning Objectives</h3>
                  </div>
                  {currentStep.learningObjectives.some((obj, idx) => 
                    typeof obj === 'object' && obj != null && (obj as any).preview
                  ) && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allIndices = currentStep.learningObjectives
                            .map((_, idx) => idx)
                            .filter(idx => {
                              const obj = currentStep.learningObjectives[idx];
                              return typeof obj === 'object' && obj != null && (obj as any).preview;
                            });
                          setCollapsedObjectives(new Set(allIndices));
                        }}
                        className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Collapse All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCollapsedObjectives(new Set())}
                        className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Expand All
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {currentStep.learningObjectives.map((objective, index) => {
                    console.log(`Objective ${index + 1}:`, objective);
                    console.log(`Objective ${index + 1} type:`, typeof objective);
                    console.log(`Objective ${index + 1} has preview:`, !!(objective as any)?.preview);
                    
                    const hasPreview = typeof objective === 'object' && objective != null && (objective as any).preview;
                    const isCollapsed = collapsedObjectives.has(index);
                    
                    return (
                      <div key={index} className="bg-white rounded-lg border border-green-100 shadow-sm overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-semibold text-green-700">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-slate-900">
                                  {typeof objective === 'string' ? objective : (objective as any)?.title || String(objective)}
                                </h4>
                                {hasPreview && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleObjectiveCollapse(index)}
                                    className="ml-2 p-1 h-auto text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    {isCollapsed ? (
                                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                                    ) : (
                                      <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                                    )}
                                    <span className="ml-1 text-xs">
                                      {isCollapsed ? 'Show Preview' : 'Hide Preview'}
                                    </span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {hasPreview && (
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
                          }`}>
                            <div className="px-4 pb-4 border-t border-green-100 bg-green-50/30">
                              <div className="pt-3 text-sm text-slate-600 leading-relaxed">
                                <div className="prose prose-sm max-w-none text-slate-700"
                                     dangerouslySetInnerHTML={{ 
                                       __html: String((objective as any).preview).replace(/\n/g, '<br/>') 
                                     }} />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {hasPreview && isCollapsed && (
                          <div className="px-4 pb-2 border-t border-green-100 bg-green-50/20">
                            <div className="pt-2 text-xs text-green-600 italic">
                              Click "Show Preview" to see detailed learning content
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learning Resources */}
              <Card className="p-8 border border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Learning Resources</h3>
                  </div>
                  <div className="space-y-6">
                    <ResourceGrid 
                      resources={currentStep.resources.map((resource) => ({
                        id: resource.id,
                        title: resource.title,
                        type: resource.type as any,
                        url: resource.url,
                        description: resource.description,
                        duration: resource.estimatedTime,
                        difficulty: 'intermediate',
                        source: 'Learning Path',
                        thumbnail: resource.thumbnail
                      }))}
                      title=""
                    />
                    </div>
                  </div>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-8">
                  <Button 
                    className="h-12 px-6 border-slate-300 hover:bg-slate-50"
                    variant="outline" 
                    onClick={previousStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Step
                  </Button>
                  
                  <Button 
                    className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => markStepComplete(currentStep.id)}
                    disabled={completedSteps.has(currentStep.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Step Complete
                  </Button>
                  
                  <Button 
                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={nextStep}
                    disabled={currentStepIndex === totalSteps - 1}
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

        {/* Compact Sidebar */}
        <div className="space-y-4">
          {/* Progress Summary */}
          <Card className="p-4 border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Progress</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Step:</span>
                  <span className="font-medium text-slate-900">{currentStepIndex + 1}/{totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time:</span>
                  <span className="font-medium text-slate-900">{formatTime(learningTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Complete:</span>
                  <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Step Progress - Compact */}
          <Card className="p-4 border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Target className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Steps</h3>
              </div>
              <div className="space-y-2">
                {learningPath.steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.id);
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-medium ${
                        isCurrent 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' 
                          : isCompleted
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                            : 'bg-slate-300 text-slate-600'
                      }`}>
                        {index === currentStepIndex ? (
                          <Route className="w-2 h-2" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-2 h-2" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-xs truncate ${
                        isCurrent ? 'font-medium text-slate-900' : 'text-slate-600'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Modals */}
      <ReadingContentModal
        isOpen={readingModal.isOpen}
        onClose={() => setReadingModal(prev => ({ ...prev, isOpen: false }))}
        title={readingModal.title}
        content={readingModal.content}
        estimatedTime={readingModal.estimatedTime}
        onComplete={handleReadingComplete}
      />
      
      <VideoLessonModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
        title={videoModal.title}
        videoUrl={videoModal.videoUrl}
        duration={videoModal.duration}
        transcript={videoModal.transcript}
        onComplete={handleVideoComplete}
      />
      
      <PDFPreviewModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal(prev => ({ ...prev, isOpen: false }))}
        title={pdfModal.title}
        content={pdfModal.content}
        url={pdfModal.url}
        estimatedTime={pdfModal.estimatedTime}
        onComplete={handlePDFComplete}
      />
    </div>
  );
}

// Helper function to create a fallback learning path when generation fails
function createFallbackLearningPath(plan: any): LearningPath {
  return {
    id: `path-${plan.id}`,
    topic: plan.topic,
    subject: plan.subject,
    description: `Guided learning pathway to master ${plan.topic} with curated resources and step-by-step progression`,
    steps: [
      {
        id: 'step-1',
        title: 'Foundation: Understanding Core Concepts',
        description: `Build a solid foundation by understanding the fundamental concepts of ${plan.topic}`,
        order: 1,
        prerequisites: [],
        learningObjectives: [
          {
            title: `Understand the early European explorers and settlers of the Gold Coast`,
            preview: `The Gold Coast has a rich and complex history that begins with the early European explorers and settlers who arrived in the region. This objective will help you understand the significant historical events, key figures, and cultural impacts that shaped this important Australian region.

Captain James Cook was the first European to chart the Gold Coast region in 1770 during his voyage along the eastern coast of Australia. His observations and documentation of the area would later influence European settlement and development. The region was named after its golden beaches and the discovery of gold in the 19th century.

European settlement began in earnest during the 19th century, with farmers, traders, and fishermen establishing communities along the coast. These early settlers brought with them European customs, technologies, and ways of life that would transform the landscape and create the foundation for modern development.

Understanding this early history is crucial because it provides context for the region's current status as a major tourist destination and economic center. The interactions between European settlers and the local Aboriginal peoples, the development of agriculture and fishing industries, and the discovery of gold all played significant roles in shaping the Gold Coast's unique character and development.`
          },
          {
            title: `Analyze the economic and social development of the Gold Coast region`,
            preview: `This objective focuses on understanding how the Gold Coast evolved from a small fishing and farming community into one of Australia's most important tourist destinations and economic centers. You'll explore the key factors that drove this transformation and their lasting impacts on the region's society and economy.

The economic development of the Gold Coast was initially driven by agriculture, fishing, and timber industries. However, the discovery of gold in the region and nearby areas in the 19th century brought significant changes, attracting miners and entrepreneurs who would shape the region's economic future.

The development of tourism infrastructure, including hotels, resorts, and entertainment venues, transformed the Gold Coast into a major destination for both domestic and international visitors. This tourism boom created new employment opportunities and attracted people from around Australia and the world to settle in the region.

Socially, the Gold Coast became known for its diverse population, innovative urban planning, and vibrant cultural scene. The region's development reflects broader trends in Australian society, including urbanization, multiculturalism, and the growth of service-based industries. Understanding these social and economic developments helps explain the Gold Coast's current status as a modern, dynamic city with a unique character and global significance.`
          }
        ],
        resources: [
          {
            id: 'foundation-text-1',
            type: 'text',
            title: `Early European Explorers and Settlers of the Gold Coast`,
            content: `# Early European Explorers and Settlers of the Gold Coast

## Captain James Cook

Captain James Cook was the first European to chart the Gold Coast region in 1770 during his historic voyage along the eastern coast of Australia. His detailed observations and documentation of the area would later prove invaluable for European settlement and development. Cook's expedition marked the beginning of European awareness of this region's potential.

Cook's voyage was part of a broader scientific and exploratory mission to chart the unknown waters of the South Pacific. His meticulous record-keeping and navigation skills allowed him to accurately map the coastline, noting the region's natural harbors, fertile lands, and abundant resources. These observations would later influence the decisions of European settlers who chose to establish communities in the area.

The region was initially known simply as the "South Coast" but would later be renamed the "Gold Coast" due to its golden beaches and the discovery of gold in the surrounding areas during the 19th century. Cook's legacy extends beyond mere discovery - his careful documentation provided the foundation for understanding the region's geography, climate, and natural resources.

## European Settlement

European settlement began in earnest during the 19th century, with farmers, traders, and fishermen establishing the first permanent communities along the coast. These early settlers brought with them European customs, technologies, and ways of life that would transform the landscape and create the foundation for modern development.

The first European settlers were primarily engaged in agriculture, taking advantage of the region's fertile soils and favorable climate. They established farms and plantations, growing crops that would support both local communities and export markets. The fishing industry also developed rapidly, with the abundant marine resources providing both food and economic opportunities.

Timber harvesting became another important industry, as the region's forests provided valuable resources for construction and export. The settlers brought with them European building techniques and architectural styles, creating a unique blend of European and local influences that can still be seen in the region's historic buildings and urban planning.

## The Gold Coast Today

Today, the Gold Coast stands as a testament to the vision and determination of those early European explorers and settlers. The region has evolved from a small collection of fishing and farming communities into one of Australia's most important tourist destinations and economic centers.

The Gold Coast's development reflects the broader patterns of Australian history, including the interactions between European settlers and Aboriginal peoples, the growth of industries and infrastructure, and the emergence of modern urban centers. Understanding this early history is crucial for appreciating the region's current status and its ongoing development.

The region's success as a tourist destination can be traced back to the natural beauty and resources that first attracted European explorers and settlers. The golden beaches, favorable climate, and abundant natural resources that Cook observed in 1770 continue to draw millions of visitors each year, making the Gold Coast a vital part of Australia's tourism industry and economy.`,
            description: `Comprehensive historical overview of European exploration and settlement of the Gold Coast region`,
            difficulty: 'intermediate',
            estimatedTime: '20-30 min'
          },
          {
            id: 'foundation-video-1',
            type: 'video',
            title: `The Early History of the Gold Coast`,
            url: 'https://www.youtube.com/watch?v=jn6Q5u7V4R4',
            description: `Educational video covering the early European exploration and settlement of the Gold Coast region`,
            difficulty: 'beginner',
            estimatedTime: '15-20 min'
          }
        ],
        estimatedTime: '30-45 min',
        difficulty: 'beginner',
        completed: false,
        progress: 0
      },
      {
        id: 'step-2',
        title: 'Application: Putting Concepts into Practice',
        description: `Apply your understanding of ${plan.topic} through practical examples and exercises`,
        order: 2,
        prerequisites: ['step-1'],
        learningObjectives: [
          {
            title: `Apply concepts of ${plan.topic} to solve problems`,
            preview: `In this objective, you'll practice applying the concepts you've learned to solve real problems and answer questions related to ${plan.topic}. You'll work through examples, practice exercises, and case studies that demonstrate how the concepts work in practical situations.`
          }
        ],
        resources: [
          {
            id: 'application-video-1',
            type: 'video',
            title: `${plan.topic} in Practice: Real Examples`,
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: `Video showing practical applications of ${plan.topic}`,
            difficulty: 'intermediate',
            estimatedTime: '15-20 min'
          }
        ],
        estimatedTime: '25-30 min',
        difficulty: 'intermediate',
        completed: false,
        progress: 0
      }
    ],
    totalEstimatedTime: '55-75 min',
    difficulty: 'intermediate',
    createdAt: new Date()
  };
}

// Helper function to generate learning path from plan with profile context
async function generateLearningPathFromPlan(plan: any, originalNotes?: string): Promise<LearningPath> {
  try {
    // Use profile-aware AI to generate personalized learning path
    // Prioritize original notes if available, otherwise use plan summary
    const notes = originalNotes || `Topic: ${plan.topic}. Subject: ${plan.subject}. Tasks: ${plan.tasks.map((t: any) => `${t.title}: ${t.description}`).join('. ')}`;
    console.log('=== LEARNING PATH GENERATION DEBUG ===');
    console.log('Plan topic:', plan.topic);
    console.log('Plan subject:', plan.subject);
    console.log('Using original notes:', !!originalNotes);
    console.log('Original notes length:', originalNotes ? originalNotes.length : 'undefined');
    console.log('Original notes preview:', originalNotes ? originalNotes.substring(0, 200) + '...' : 'undefined');
    console.log('Final notes for AI:', notes.substring(0, 300) + '...');
    const apiPath = await profileAwareAI.generatePersonalizedLearningPath(notes, plan.topic);
    console.log('Profile-aware AI returned learning path:', apiPath);
    
    // Check if apiPath has steps
    if (!apiPath || !apiPath.steps || !Array.isArray(apiPath.steps)) {
      console.error('Invalid learning path response from AI:', apiPath);
      throw new Error('Invalid learning path response from AI');
    }
    
    console.log('Starting to map steps...');
    const steps = apiPath.steps.map((step, index) => {
      try {
        console.log(`Processing step ${index + 1}:`, step);
        
        // Validate step structure
        if (!step || typeof step !== 'object') {
          console.error(`Invalid step at index ${index}:`, step);
          throw new Error(`Invalid step structure at index ${index}`);
        }
        
        console.log(`Step ${index + 1} objectives:`, step.objectives);
        console.log(`Step ${index + 1} objectives type:`, typeof step.objectives);
        console.log(`Step ${index + 1} objectives length:`, step.objectives?.length);
      
      const mappedStep = {
        id: `step-${index + 1}`,
        title: step.title,
        description: step.description,
        order: index + 1,
        prerequisites: index > 0 ? [`step-${index}`] : [],
        learningObjectives: step.objectives,
          personalizedTips: step.personalizedTips || [],
        resources: (step.resources || []).map((resource, resIndex) => {
          console.log(`Processing resource ${resIndex + 1} in step ${index + 1}:`, resource);
          console.log(`Resource type: ${resource.type}, has content: ${!!resource.content}, has url: ${!!resource.url}`);
          
          const mappedResource = {
            id: `resource-${index + 1}-${resIndex + 1}`,
            type: resource.type,
            title: resource.title,
            content: resource.content || resource.description || `Content for ${resource.title}`,
            url: resource.url, // Include URL from AI response
            duration: resource.duration, // Include duration for videos
            description: resource.description,
            difficulty: 'beginner' as const,
            estimatedTime: resource.estimatedTime
          };
          
          console.log(`Mapped resource:`, mappedResource);
          return mappedResource;
        }),
        estimatedTime: step.resources.reduce((total, res) => {
          const match = res.estimatedTime.match(/(\d+)-(\d+)\s*min/);
          if (match) return total + (parseInt(match[1]) + parseInt(match[2])) / 2;
          return total + 20;
        }, 0) + ' min',
        difficulty: 'beginner' as const,
        completed: false,
        progress: 0
      };
      
      console.log(`Mapped step ${index + 1}:`, mappedStep);
      return mappedStep;
      } catch (stepError) {
        console.error(`Error mapping step ${index + 1}:`, stepError);
        throw stepError;
      }
    });
    
    console.log('Successfully mapped all steps:', steps);

    const finalPath = {
      id: `path-${plan.id}`,
      topic: plan.topic,
      subject: plan.subject,
      description: `Guided learning pathway to master ${plan.topic} with curated resources and step-by-step progression`,
      steps,
      totalEstimatedTime: steps.reduce((total, step) => {
        const match = step.estimatedTime.match(/(\d+)\s*min/);
        return total + (match ? parseInt(match[1]) : 30);
      }, 0) + ' min',
      difficulty: 'intermediate' as const,
      createdAt: new Date()
    };
    
    console.log('Final learning path structure:', finalPath);
    console.log('Returning successful learning path from ProfileAwareAI');
    return finalPath;
  } catch (error) {
    console.error('Error generating learning path with Profile-Aware AI:', error);
    console.error('Full error details:', error);
    console.error('Error stack:', error.stack);
    
    // Try fallback to standard Groq API
    try {
      console.log('Attempting fallback to standard Groq API...');
        const fallbackNotes = originalNotes || `Topic: ${plan.topic}. Subject: ${plan.subject}. Tasks: ${plan.tasks.map((t: any) => `${t.title}: ${t.description}`).join('. ')}`;
        console.log('Learning path fallback - Using original notes:', !!originalNotes);
        const fallbackPath = await groqApiService.generateLearningPath(fallbackNotes, plan.topic);
      console.log('Fallback Groq API response:', fallbackPath);
      
      const fallbackSteps = fallbackPath.steps.map((step, index) => ({
        id: `step-${index + 1}`,
        title: step.title,
        description: step.description,
        order: index + 1,
        prerequisites: index > 0 ? [`step-${index}`] : [],
        learningObjectives: step.objectives,
        resources: step.resources.map((resource, resIndex) => ({
          id: `resource-${index + 1}-${resIndex + 1}`,
          type: resource.type,
          title: resource.title,
          content: resource.content || resource.description || `Content for ${resource.title}`,
          url: resource.url,
          duration: resource.duration,
          description: resource.description,
          difficulty: 'beginner' as const,
          estimatedTime: resource.estimatedTime
        })),
        estimatedTime: step.resources.reduce((sum, r) => sum + (parseInt(r.estimatedTime) || 0), 0) + ' min',
        difficulty: 'beginner' as const,
        completed: false,
        progress: 0,
        personalizedTips: []
      }));

      return {
        id: plan.id,
        topic: plan.topic,
        subject: plan.subject,
        description: plan.description,
        steps: fallbackSteps,
        totalEstimatedTime: fallbackSteps.reduce((total, step) => {
          const match = step.estimatedTime.match(/(\d+)\s*min/);
          return total + (match ? parseInt(match[1]) : 30);
        }, 0) + ' min',
        difficulty: 'intermediate' as const,
        createdAt: new Date(),
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    // Final fallback to basic structure with multiple steps
    console.log('Using final fallback - mock learning path with multiple steps');
    return {
      id: `path-${plan.id}`,
      topic: plan.topic,
      subject: plan.subject,
      description: `Guided learning pathway to master ${plan.topic} with curated resources and step-by-step progression`,
      steps: [
        {
          id: 'step-1',
          title: 'Foundation: Understanding Core Concepts',
          description: `Build a solid foundation by understanding the fundamental concepts of ${plan.topic}`,
          order: 1,
          prerequisites: [],
          learningObjectives: [
            {
              title: `Define key terms and concepts in ${plan.topic}`,
              preview: `This objective focuses on building your vocabulary and understanding of essential terminology related to ${plan.topic}. You'll learn the fundamental definitions, key concepts, and important terms that form the foundation of this subject. Understanding these basics is crucial for deeper learning and application.`
            },
            {
              title: `Understand the basic principles underlying ${plan.topic}`,
              preview: `Here you'll explore the core principles and fundamental theories that govern ${plan.topic}. These principles explain why things work the way they do and provide the logical framework for understanding more complex concepts. You'll learn how these principles apply in real-world situations and why they're important.`
            },
            {
              title: `Identify the main components of ${plan.topic}`,
              preview: `This objective helps you break down ${plan.topic} into its essential parts and understand how they work together. You'll learn to recognize the different components, elements, or sections that make up this topic and understand their individual roles and relationships to each other.`
            }
          ],
          resources: [
            {
              id: 'foundation-text-1',
              type: 'text',
              title: `${plan.topic} Fundamentals: Complete Guide`,
              content: `# ${plan.topic} Fundamentals\n\nWelcome to your comprehensive guide to understanding ${plan.topic}. This resource will help you build a solid foundation in the core concepts.\n\n## Key Concepts\n- Fundamental principles\n- Core definitions\n- Basic applications\n\n## Learning Objectives\nBy the end of this resource, you will be able to:\n1. Define key terms and concepts\n2. Understand basic principles\n3. Identify main components`,
              description: `Comprehensive guide covering the fundamental concepts of ${plan.topic}`,
              difficulty: 'beginner',
              estimatedTime: '20-25 min'
            }
          ],
          estimatedTime: '30-45 min',
          difficulty: 'beginner',
          completed: false,
          progress: 0
        },
        {
          id: 'step-2',
          title: 'Application: Putting Concepts into Practice',
          description: `Apply your understanding of ${plan.topic} through practical examples and exercises`,
          order: 2,
          prerequisites: ['step-1'],
          learningObjectives: [
            {
              title: `Apply concepts of ${plan.topic} to solve problems`,
              preview: `In this objective, you'll practice applying the concepts you've learned to solve real problems and answer questions related to ${plan.topic}. You'll work through examples, practice exercises, and case studies that demonstrate how the concepts work in practical situations.`
            },
            {
              title: `Analyze examples and case studies in ${plan.topic}`,
              preview: `Here you'll examine real-world examples and case studies that illustrate ${plan.topic} in action. You'll learn to identify key elements, analyze patterns, and draw conclusions from these examples. This helps you understand how the concepts apply beyond textbook situations.`
            }
          ],
          resources: [
            {
              id: 'application-video-1',
              type: 'video',
              title: `${plan.topic} in Practice: Real Examples`,
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: `Video showing practical applications of ${plan.topic}`,
              difficulty: 'intermediate',
              estimatedTime: '15-20 min'
            }
          ],
          estimatedTime: '25-30 min',
          difficulty: 'intermediate',
          completed: false,
          progress: 0
        },
        {
          id: 'step-3',
          title: 'Mastery: Advanced Understanding and Analysis',
          description: `Develop advanced understanding and critical thinking skills in ${plan.topic}`,
          order: 3,
          prerequisites: ['step-2'],
          learningObjectives: [
            {
              title: `Evaluate and critique different approaches to ${plan.topic}`,
              preview: `This advanced objective helps you develop critical thinking skills by evaluating different methods, approaches, or perspectives related to ${plan.topic}. You'll learn to compare and contrast various approaches, identify strengths and weaknesses, and form your own informed opinions.`
            },
            {
              title: `Synthesize knowledge to create original insights about ${plan.topic}`,
              preview: `Here you'll combine all your learning to create original insights and connections about ${plan.topic}. You'll learn to see patterns, make connections between different concepts, and develop your own understanding that goes beyond what you've been taught.`
            }
          ],
          resources: [
            {
              id: 'mastery-article-1',
              type: 'text',
              title: `Advanced Topics in ${plan.topic}`,
              url: 'https://en.wikipedia.org/wiki/Main_Page',
              description: `In-depth article covering advanced concepts`,
              difficulty: 'advanced',
              estimatedTime: '20-25 min'
            }
          ],
          estimatedTime: '35-40 min',
          difficulty: 'advanced',
          completed: false,
          progress: 0
        }
      ],
      totalEstimatedTime: '90-115 min',
      difficulty: 'intermediate',
      createdAt: new Date()
    };
  }
}