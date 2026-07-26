import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  Brain, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Users,
  BarChart3,
  ArrowLeft,
  Play
} from 'lucide-react';
import { SimpleRevisionPlan } from '@/services/simpleRevisionPlanService';

interface SimpleRevisionPlanViewerProps {
  plan: SimpleRevisionPlan;
  onBack: () => void;
  onStartPlan?: () => void;
}

export const SimpleRevisionPlanViewer: React.FC<SimpleRevisionPlanViewerProps> = ({ 
  plan, 
  onBack, 
  onStartPlan 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const togglePhaseCompletion = (phaseIndex: number) => {
    const newCompleted = new Set(completedPhases);
    if (newCompleted.has(phaseIndex)) {
      newCompleted.delete(phaseIndex);
    } else {
      newCompleted.add(phaseIndex);
    }
    setCompletedPhases(newCompleted);
  };

  const progressPercentage = (completedPhases.size / plan.revisionPhases.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'important': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'optional': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                {plan.title}
              </h1>
              <p className="text-lg text-gray-600 mt-2">{plan.overview.summary}</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progressPercentage)}%
              </div>
              <Progress value={progressPercentage} className="w-32 mt-2" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Total Time</div>
                  <div className="text-lg font-semibold">{plan.overview.totalEstimatedTime}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">Focus Areas</div>
                  <div className="text-lg font-semibold">{plan.focusAreas.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-500">Study Methods</div>
                  <div className="text-lg font-semibold">{plan.studyMethods.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-500">Phases</div>
                  <div className="text-lg font-semibold">{plan.revisionPhases.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="focus-areas">Focus Areas</TabsTrigger>
            <TabsTrigger value="study-methods">Study Methods</TabsTrigger>
            <TabsTrigger value="phases">Revision Phases</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Plan Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-600">{plan.overview.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(plan.overview.difficulty)}>
                          {plan.overview.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-600">Difficulty</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{plan.overview.totalEstimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.overview.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline">{prereq}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Focus Areas Tab */}
          <TabsContent value="focus-areas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.focusAreas.map((area, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {area.title}
                      </span>
                      <Badge className={getImportanceColor(area.importance)}>
                        {area.importance}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Key Concepts</h5>
                      <div className="flex flex-wrap gap-2">
                        {area.keyConcepts.map((concept, idx) => (
                          <Badge key={idx} variant="secondary">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Study Tips</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {area.studyTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{area.estimatedTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Study Methods Tab */}
          <TabsContent value="study-methods" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.studyMethods.map((method, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        {method.name}
                      </span>
                      <Badge className={getDifficultyColor(method.difficulty)}>
                        {method.difficulty}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Why It's Effective</h5>
                      <p className="text-sm text-gray-600">{method.effectiveness}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{method.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Revision Phases Tab */}
          <TabsContent value="phases" className="space-y-6">
            <div className="space-y-6">
              {plan.revisionPhases.map((phase, index) => (
                <Card key={index} className={completedPhases.has(index) ? 'border-green-200 bg-green-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className={`w-5 h-5 ${completedPhases.has(index) ? 'text-green-600' : 'text-gray-400'}`} />
                        Phase {index + 1}: {phase.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{phase.pedagogicalApproach}</Badge>
                        <Button
                          variant={completedPhases.has(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePhaseCompletion(index)}
                        >
                          {completedPhases.has(index) ? 'Completed' : 'Mark Complete'}
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Objectives</h5>
                        <ul className="space-y-2">
                          {phase.objectives.map((objective, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              <strong>{objective.title}:</strong> {objective.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Activities</h5>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Main:</span>
                            <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                              {phase.activities.main.map((activity, idx) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                          {phase.activities.alternative && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Alternative:</span>
                              <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                                {phase.activities.alternative.map((activity, idx) => (
                                  <li key={idx}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Resources</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Primary:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {phase.resources.primary.map((resource, idx) => (
                              <Badge key={idx} variant="outline">{resource}</Badge>
                            ))}
                          </div>
                        </div>
                        {phase.resources.secondary && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Secondary:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {phase.resources.secondary.map((resource, idx) => (
                                <Badge key={idx} variant="secondary">{resource}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{phase.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Formative Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.assessmentPlan.formative.map((assessment, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {assessment}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Summative Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.assessmentPlan.summative.map((assessment, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        {assessment}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Self Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.assessmentPlan.selfAssessment.map((assessment, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        {assessment}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Milestones</h5>
                  <div className="space-y-2">
                    {plan.progressTracking.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <span className="text-sm text-gray-600">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Checkpoints</h5>
                  <div className="space-y-3">
                    {plan.progressTracking.checkpoints.map((checkpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{checkpoint.name}</div>
                          <div className="text-sm text-gray-600">{checkpoint.description}</div>
                        </div>
                        <Badge variant="outline">{checkpoint.targetDate}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Success Metrics</h5>
                  <div className="space-y-3">
                    {plan.progressTracking.successMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{metric.name}</div>
                          <div className="text-sm text-gray-600">{metric.description}</div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">{metric.target}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Start Plan Button */}
        {onStartPlan && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              onClick={onStartPlan}
              className="px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start This Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
