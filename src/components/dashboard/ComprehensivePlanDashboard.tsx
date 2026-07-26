import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  Play,
  Brain,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Users,
  BarChart3,
  Route
} from 'lucide-react';
import { SimpleRevisionPlan } from '@/services/simpleRevisionPlanService';

interface ComprehensivePlanDashboardProps {
  plan: SimpleRevisionPlan;
  onBack: () => void;
  onTaskComplete: (taskId: string) => void;
}

export function ComprehensivePlanDashboard({ plan, onBack, onTaskComplete }: ComprehensivePlanDashboardProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  // Debug logging
  console.log('ComprehensivePlanDashboard received plan:', plan);
  console.log('Plan revisionPhases:', plan.revisionPhases);
  console.log('Plan revisionPhases length:', plan.revisionPhases?.length);
  console.log('Plan focusAreas:', plan.focusAreas);
  console.log('Plan studyMethods:', plan.studyMethods);

  // Handle cases where revisionPhases might not exist or be empty
  const hasRevisionPhases = plan.revisionPhases && plan.revisionPhases.length > 0;
  const currentPhase = hasRevisionPhases ? plan.revisionPhases[currentPhaseIndex] : null;
  const totalTasks = hasRevisionPhases ? plan.revisionPhases.reduce((total, phase) => total + phase.objectives.length, 0) : 0;
  const completedCount = completedTasks.size;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // If no revision phases, show focus areas instead
  if (!hasRevisionPhases) {
    console.log('No revision phases found, will show focus areas instead');
  }

  const toggleObjective = (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedObjectives(newExpanded);
  };

  const handleTaskComplete = (objectiveId: string) => {
    setCompletedTasks(prev => new Set([...prev, objectiveId]));
    onTaskComplete(objectiveId);
  };

  const getPhaseIcon = (approach: string) => {
    switch (approach) {
      case 'warm-up': return <Brain className="h-4 w-4" />;
      case 'instruction': return <BookOpen className="h-4 w-4" />;
      case 'guided-practice': return <Users className="h-4 w-4" />;
      case 'independent-practice': return <Target className="h-4 w-4" />;
      case 'consolidation': return <CheckCircle className="h-4 w-4" />;
      case 'extension': return <Lightbulb className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (approach: string) => {
    switch (approach) {
      case 'warm-up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'instruction': return 'bg-green-100 text-green-800 border-green-200';
      case 'guided-practice': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'independent-practice': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'consolidation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'extension': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
          <p className="text-gray-600 mt-2">{plan.overview.summary}</p>
        </div>
        <Button onClick={onBack} variant="outline">
          ← Back to Plans
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-lg font-bold">{Math.round(progressPercentage)}% Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-lg font-bold">{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-lg font-bold">{plan.overview.totalEstimatedTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Revision Progress</span>
              <span>{completedCount} of {totalTasks} tasks completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Phases (Left Panel) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Route className="h-5 w-5" />
                <span>{hasRevisionPhases ? 'Study Phases' : 'Focus Areas'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasRevisionPhases ? (
                (plan.revisionPhases || []).map((phase, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      index === currentPhaseIndex
                        ? getPhaseColor(phase.pedagogicalApproach)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentPhaseIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPhaseIcon(phase.pedagogicalApproach)}
                        <span className="font-medium text-sm">{phase.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {phase.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{phase.description}</p>
                  </div>
                ))
              ) : (
                plan.focusAreas?.map((area, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{area.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{area.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${
                        area.importance === 'critical' ? 'bg-red-100 text-red-800' : 
                        area.importance === 'important' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {area.importance}
                      </Badge>
                      <span className="text-xs text-gray-500">{area.estimatedTime}</span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No data available</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Phase Details (Right Panel) */}
        <div className="lg:col-span-2">
          {hasRevisionPhases && currentPhase ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-xl">{currentPhase.name}</CardTitle>
                    <Badge className={getPhaseColor(currentPhase.pedagogicalApproach)}>
                      {currentPhase.pedagogicalApproach.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{currentPhase.duration}</span>
                  </div>
                </div>
                <p className="text-gray-600">{currentPhase.description}</p>
              </CardHeader>
            <CardContent className="space-y-4">
              {/* Learning Objectives */}
              <div>
                <h4 className="font-semibold mb-3">Learning Objectives</h4>
                <div className="space-y-3">
                  {(currentPhase.objectives || []).map((objective, index) => {
                    const objectiveId = `${currentPhaseIndex}-${index}`;
                    const isCompleted = completedTasks.has(objectiveId);
                    const isExpanded = expandedObjectives.has(objectiveId);
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleTaskComplete(objectiveId)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {isCompleted && <CheckCircle className="w-3 h-3" />}
                              </button>
                              <h5 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                                {objective.title}
                              </h5>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleObjective(objectiveId)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{objective.description}</p>
                          
                          {isExpanded && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <h6 className="font-medium text-sm mb-2">Learning Outcomes:</h6>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {(objective.learningOutcomes || []).map((outcome, i) => (
                                    <li key={i}>{outcome}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-sm mb-2">Activities:</h6>
                                <div className="space-y-2">
                                  {(currentPhase.activities?.main || []).map((activity, i) => (
                                    <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                                      • {activity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-sm mb-2">Resources:</h6>
                                <div className="flex flex-wrap gap-2">
                                  {(currentPhase.resources?.primary || []).map((resource, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPhaseIndex(Math.max(0, currentPhaseIndex - 1))}
                  disabled={currentPhaseIndex === 0}
                >
                  ← Previous Phase
                </Button>
                <Button
                  onClick={() => setCurrentPhaseIndex(Math.min(plan.revisionPhases.length - 1, currentPhaseIndex + 1))}
                  disabled={currentPhaseIndex === plan.revisionPhases.length - 1}
                >
                  Next Phase →
                </Button>
              </div>
            </CardContent>
          </Card>
          ) : (
            // Fallback: Show Focus Areas when no revision phases available
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Focus Areas</span>
                </CardTitle>
                <p className="text-gray-600">Study these key areas to master {plan.topic}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.focusAreas && plan.focusAreas.length > 0 ? (
                  (plan.focusAreas || []).map((area, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{area.title}</h4>
                        <Badge className={area.importance === 'critical' ? 'bg-red-100 text-red-800' : 
                                         area.importance === 'important' ? 'bg-yellow-100 text-yellow-800' : 
                                         'bg-blue-100 text-blue-800'}>
                          {area.importance}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{area.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Key Concepts:</h5>
                          <div className="flex flex-wrap gap-1">
                            {area.keyConcepts?.map((concept, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Study Tips:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {area.studyTips?.map((tip, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <Lightbulb className="h-3 w-3 mt-1 text-yellow-500 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Estimated: {area.estimatedTime}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Start Studying
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No focus areas available. The comprehensive plan is still being processed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
