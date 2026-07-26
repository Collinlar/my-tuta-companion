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
  BarChart3
} from 'lucide-react';
import { SimpleComprehensiveRevisionPlan } from '@/services/simpleComprehensiveRevisionPlan';

interface ComprehensiveRevisionPlanProps {
  plan: SimpleComprehensiveRevisionPlan;
  onBack: () => void;
  onStartPlan?: () => void;
}

export const ComprehensiveRevisionPlanViewer: React.FC<ComprehensiveRevisionPlanProps> = ({ plan, onBack, onStartPlan }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-orange-100 text-orange-800';
      case 'supplementary': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
          <p className="text-gray-600 mt-2">{plan.overview.summary}</p>
        </div>
        <Button onClick={onBack} variant="outline">
          ← Back to Goals
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-lg font-bold">{plan.overview.totalEstimatedTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Difficulty</p>
                <Badge className={getDifficultyColor(plan.overview.difficulty)}>
                  {plan.overview.difficulty}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Areas</p>
                <p className="text-lg font-bold">{plan.focusAreas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Study Methods</p>
                <p className="text-lg font-bold">{plan.studyMethods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="focus-areas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="focus-areas">Focus Areas</TabsTrigger>
          <TabsTrigger value="study-methods">Study Methods</TabsTrigger>
          <TabsTrigger value="phases">Revision Phases</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        {/* Focus Areas Tab */}
        <TabsContent value="focus-areas" className="space-y-4">
          <div className="grid gap-4">
            {plan.focusAreas.map((area, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-xl">{area.title}</CardTitle>
                      <Badge className={getImportanceColor(area.importance)}>
                        {area.importance}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{area.estimatedTime}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(`focus-${index}`)}
                      >
                        {expandedSections.has(`focus-${index}`) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{area.description}</CardDescription>
                </CardHeader>
                {expandedSections.has(`focus-${index}`) && (
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Concepts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {area.keyConcepts.map((concept, i) => (
                          <Badge key={i} variant="secondary">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Common Mistakes to Avoid:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {area.commonMistakes.map((mistake, i) => (
                          <li key={i}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Study Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {area.studyTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Study Methods Tab */}
        <TabsContent value="study-methods" className="space-y-4">
          <div className="grid gap-4">
            {plan.studyMethods.map((method, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{method.name}</CardTitle>
                    <Badge className={getDifficultyColor(method.difficulty)}>
                      {method.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Why This Method Works:</h4>
                    <p className="text-gray-700">{method.whyEffective}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">How to Use:</h4>
                    <p className="text-gray-700">{method.howToUse}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{method.estimatedTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Revision Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          <div className="space-y-6">
            {plan.revisionPhases.map((phase, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-xl">{phase.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {phase.pedagogicalApproach.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{phase.duration}</span>
                    </div>
                  </div>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                    <div className="space-y-2">
                      {phase.objectives.map((objective, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium">{objective.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500">Learning Outcomes:</p>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {objective.learningOutcomes.map((outcome, j) => (
                                <li key={j}>{outcome}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Activities:</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Main Activities</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {phase.activities.main.map((activity, i) => (
                            <li key={i}>• {activity}</li>
                          ))}
                        </ul>
                      </div>
                      {phase.activities.alternative.length > 0 && (
                        <div>
                          <h5 className="font-medium text-blue-700 mb-1">Alternative Approaches</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {phase.activities.alternative.map((activity, i) => (
                              <li key={i}>• {activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {phase.activities.extension.length > 0 && (
                        <div>
                          <h5 className="font-medium text-purple-700 mb-1">Extension Activities</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {phase.activities.extension.map((activity, i) => (
                              <li key={i}>• {activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Resources:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phase.resources.primary.length > 0 && (
                        <div>
                          <h5 className="font-medium text-green-700 mb-1">Primary</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {phase.resources.primary.map((resource, i) => (
                              <li key={i}>• {resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {phase.resources.visual.length > 0 && (
                        <div>
                          <h5 className="font-medium text-blue-700 mb-1">Visual</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {phase.resources.visual.map((resource, i) => (
                              <li key={i}>• {resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {phase.resources.interactive.length > 0 && (
                        <div>
                          <h5 className="font-medium text-purple-700 mb-1">Interactive</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {phase.resources.interactive.map((resource, i) => (
                              <li key={i}>• {resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {phase.resources.handsOn.length > 0 && (
                        <div>
                          <h5 className="font-medium text-orange-700 mb-1">Hands-On</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {phase.resources.handsOn.map((resource, i) => (
                              <li key={i}>• {resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Differentiated Support:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">For Struggling Students</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {phase.scaffolding.forStruggling.map((support, i) => (
                            <li key={i}>• {support}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-indigo-700 mb-1">For Advanced Students</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {phase.scaffolding.forAdvanced.map((support, i) => (
                            <li key={i}>• {support}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Formative Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.assessmentPlan.formative.map((assessment, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{assessment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Summative Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.assessmentPlan.summative.map((assessment, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <BarChart3 className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{assessment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Self Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.assessmentPlan.selfAssessment.map((assessment, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Users className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{assessment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Milestones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.progressTracking.milestones.map((milestone, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">{i + 1}</span>
                      </div>
                      <span className="text-gray-700">{milestone}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Checkpoints</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.progressTracking.checkpoints.map((checkpoint, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{checkpoint}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>Success Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.progressTracking.successMetrics.map((metric, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{metric}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          ← Back to Plan Overview
        </Button>
        {onStartPlan && (
          <Button 
            onClick={onStartPlan}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Start This Plan
          </Button>
        )}
      </div>
    </div>
  );
};
