import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  LineChart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Star,
  Calendar,
  Timer,
  Award,
  Lightbulb,
  Eye
} from 'lucide-react';
import { 
  retentionPatternAnalysis, 
  RetentionPattern, 
  RetentionRecommendation,
  RetentionData,
  ForgettingCurveAnalysis
} from '@/services/retentionPatternAnalysis';

interface RetentionPatternInsightsProps {
  onRecommendationAction?: (recommendation: RetentionRecommendation) => void;
}

export function RetentionPatternInsights({ onRecommendationAction }: RetentionPatternInsightsProps) {
  const [retentionPattern, setRetentionPattern] = useState<RetentionPattern | null>(null);
  const [recommendations, setRecommendations] = useState<RetentionRecommendation[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [forgettingCurves, setForgettingCurves] = useState<{ [conceptId: string]: ForgettingCurveAnalysis }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRetentionInsights();
  }, []);

  const loadRetentionInsights = async () => {
    setIsLoading(true);
    try {
      const pattern = retentionPatternAnalysis.getRetentionPattern();
      const recs = retentionPatternAnalysis.getRetentionRecommendations();
      const data = retentionPatternAnalysis.getRetentionData();
      const curves = retentionPatternAnalysis.getForgettingCurves();
      
      setRetentionPattern(pattern);
      setRecommendations(recs);
      setRetentionData(data);
      setForgettingCurves(curves);
    } catch (error) {
      console.error('Error loading retention insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMasteryLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'mastered': return 'text-green-600 bg-green-100';
      case 'practicing': return 'text-blue-600 bg-blue-100';
      case 'learning': return 'text-yellow-600 bg-yellow-100';
      case 'new': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMasteryLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return Star;
      case 'mastered': return Award;
      case 'practicing': return Target;
      case 'learning': return BookOpen;
      case 'new': return Lightbulb;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return 'text-green-600';
    if (retention >= 60) return 'text-yellow-600';
    if (retention >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilReview = (nextReview: Date): number => {
    const now = new Date();
    const diffTime = new Date(nextReview).getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Retention Analysis</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!retentionPattern) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Brain className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">No Retention Data Yet</h3>
        <p className="text-sm text-slate-600 mb-4">Complete more study sessions to analyze your learning retention patterns.</p>
        <Button onClick={loadRetentionInsights} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Retention Overview</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.round(retentionPattern.overallRetention)}%
            </div>
            <div className="text-sm text-slate-600">Overall Retention</div>
            <div className={`text-xs ${getRetentionColor(retentionPattern.overallRetention)}`}>
              {retentionPattern.overallRetention >= 80 ? 'Excellent' : 
               retentionPattern.overallRetention >= 60 ? 'Good' : 
               retentionPattern.overallRetention >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.round(retentionPattern.averageRetrievability * 100)}%
            </div>
            <div className="text-sm text-slate-600">Retrievability</div>
            <div className="text-xs text-slate-500">
              {Math.round(retentionPattern.averageRetrievability * 100)}% recall probability
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.round(retentionPattern.forgettingRate)}%
            </div>
            <div className="text-sm text-slate-600">Forgetting Rate</div>
            <div className="text-xs text-slate-500">
              per day without review
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {retentionPattern.optimalReviewInterval}
            </div>
            <div className="text-sm text-slate-600">Optimal Interval</div>
            <div className="text-xs text-slate-500">
              days between reviews
            </div>
          </div>
        </div>

        {/* Retention Insights */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Retention Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-2">Strong Areas</h4>
              <div className="flex flex-wrap gap-1">
                {retentionPattern.retentionInsights.strongAreas.length > 0 ? 
                  retentionPattern.retentionInsights.strongAreas.map((area, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                      {area}
                    </Badge>
                  )) : 
                  <span className="text-xs text-slate-500">None identified yet</span>
                }
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">Weak Areas</h4>
              <div className="flex flex-wrap gap-1">
                {retentionPattern.retentionInsights.weakAreas.length > 0 ? 
                  retentionPattern.retentionInsights.weakAreas.map((area, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800 text-xs">
                      {area}
                    </Badge>
                  )) : 
                  <span className="text-xs text-slate-500">None identified yet</span>
                }
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subject Retention */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Subject Retention Analysis</h3>
        <div className="space-y-4">
          {Object.entries(retentionPattern.subjectRetention).map(([subject, data]) => {
            const IconComponent = getMasteryLevelIcon(data.masteryLevel);
            return (
              <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMasteryLevelColor(data.masteryLevel)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{subject}</h4>
                    <div className="text-xs text-slate-500">
                      {data.reviewFrequency} reviews • {data.masteryLevel}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getRetentionColor(data.retention)}`}>
                    {Math.round(data.retention)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    Difficulty: {Math.round(data.difficulty)}/10
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Concepts
          </TabsTrigger>
          <TabsTrigger value="curves" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Forgetting Curves
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Concept Retention Details</h3>
            <div className="space-y-3">
              {retentionData.map((item) => {
                const IconComponent = getMasteryLevelIcon(item.masteryLevel);
                const daysUntilReview = getDaysUntilReview(item.nextReview);
                const isOverdue = daysUntilReview < 0;
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMasteryLevelColor(item.masteryLevel)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{item.concept}</h4>
                        <div className="text-xs text-slate-500">
                          {item.subject} • {item.reviewCount} reviews • {item.masteryLevel}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getRetentionColor(item.retrievability * 100)}`}>
                        {Math.round(item.retrievability * 100)}%
                      </div>
                      <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                        {isOverdue ? `${Math.abs(daysUntilReview)} days overdue` : 
                         daysUntilReview === 0 ? 'Due today' : 
                         `Due in ${daysUntilReview} days`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="curves" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Forgetting Curves</h3>
            <div className="space-y-6">
              {Object.entries(forgettingCurves).slice(0, 5).map(([conceptId, curve]) => (
                <div key={conceptId} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900">{curve.concept}</h4>
                    <Badge className="bg-blue-100 text-blue-800">
                      {curve.subject}
                    </Badge>
                  </div>
                  
                  {/* Simple curve visualization */}
                  <div className="h-32 bg-slate-50 rounded-lg p-4 mb-3">
                    <div className="flex items-end justify-between h-full">
                      {curve.curveData.slice(0, 8).map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-4 bg-blue-500 rounded-t"
                            style={{ height: `${(point.retention / 100) * 100}%` }}
                          ></div>
                          <div className="text-xs text-slate-500 mt-1">{point.time}d</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{Math.round(curve.currentRetention)}%</div>
                      <div className="text-xs text-slate-500">Current</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{Math.round(curve.forgettingRate)}%</div>
                      <div className="text-xs text-slate-500">Rate/day</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{curve.optimalReviewPoints.length}</div>
                      <div className="text-xs text-slate-500">Review Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Recommendations Yet</h3>
              <p className="text-sm text-slate-600">Complete more study sessions to get personalized retention recommendations.</p>
            </Card>
          ) : (
            recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        {recommendation.urgency.reviewOverdue && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
                    
                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <h4 className="text-xs font-medium text-slate-900 mb-2">Implementation Steps:</h4>
                      <ol className="text-xs text-slate-600 space-y-1">
                        {recommendation.implementation.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-slate-400">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-slate-500">Expected Improvement</div>
                        <div className="text-sm font-medium text-green-600">
                          +{recommendation.expectedOutcomes.retentionImprovement}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Time to Mastery</div>
                        <div className="text-sm font-medium text-blue-600">
                          {recommendation.expectedOutcomes.timeToMastery}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span>Time: {recommendation.implementation.estimatedTime}</span>
                        <span className="mx-2">•</span>
                        <span>Difficulty: {recommendation.implementation.difficulty}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onRecommendationAction?.(recommendation)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        Apply
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={loadRetentionInsights}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
