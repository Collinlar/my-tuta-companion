import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Eye,
  Ear,
  Hand,
  Book,
  Zap,
  Star,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  advancedPatternRecognition, 
  LearningInsight, 
  StudyRecommendation, 
  LearningPattern,
  LearningStyle 
} from '@/services/advancedPatternRecognition';

interface AdvancedLearningInsightsProps {
  onRecommendationAction?: (recommendation: StudyRecommendation) => void;
}

export function AdvancedLearningInsights({ onRecommendationAction }: AdvancedLearningInsightsProps) {
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const pattern = await advancedPatternRecognition.analyzeStudySessions();
      setLearningPattern(pattern);
      setInsights(advancedPatternRecognition.getInsights());
      setRecommendations(advancedPatternRecognition.getRecommendations());
      setLearningStyle(advancedPatternRecognition.getLearningStyle());
    } catch (error) {
      console.error('Error loading learning insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return Brain;
      case 'recommendation': return Lightbulb;
      case 'warning': return AlertTriangle;
      case 'opportunity': return Star;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'text-blue-600 bg-blue-100';
      case 'recommendation': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'opportunity': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return Eye;
      case 'auditory': return Ear;
      case 'kinesthetic': return Hand;
      case 'reading': return Book;
      default: return Brain;
    }
  };

  const getLearningStyleColor = (style: string) => {
    switch (style) {
      case 'visual': return 'text-blue-600';
      case 'auditory': return 'text-green-600';
      case 'kinesthetic': return 'text-orange-600';
      case 'reading': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Learning Insights</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Style Overview */}
      {learningStyle && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Your Learning Style</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(learningStyle).filter(([key]) => !['dominant', 'confidence'].includes(key)).map(([style, score]) => {
              const IconComponent = getLearningStyleIcon(style);
              return (
                <div key={style} className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    style === learningStyle.dominant ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${getLearningStyleColor(style)}`} />
                  </div>
                  <div className="text-sm font-medium text-slate-900 capitalize">{style}</div>
                  <div className="text-xs text-slate-600">{score}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${getLearningStyleColor(style).replace('text-', 'bg-')}`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              Dominant: {learningStyle.dominant} ({learningStyle.confidence}% confidence)
            </Badge>
          </div>
        </Card>
      )}

      {/* Learning Pattern Overview */}
      {learningPattern && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Learning Patterns</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Optimal Study Times */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Optimal Study Times</h3>
              <div className="space-y-2">
                {Object.entries(learningPattern.optimalStudyTimes).map(([time, score]) => (
                  <div key={time} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{time}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600 w-8">{Math.round(score)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Length Preferences */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Session Length Preferences</h3>
              <div className="space-y-2">
                {Object.entries(learningPattern.preferredSessionLength).map(([length, score]) => (
                  <div key={length} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{length}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600 w-8">{Math.round(score)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Trends */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Performance Trends</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Improvement Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {learningPattern.performanceTrends.improvementRate > 0 ? '+' : ''}
                    {Math.round(learningPattern.performanceTrends.improvementRate)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Consistency</span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(learningPattern.performanceTrends.consistency)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Peak Time</span>
                  <span className="text-sm font-medium text-purple-600 capitalize">
                    {learningPattern.performanceTrends.peakPerformance.timeOfDay}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Insights and Recommendations */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommendations ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Insights Yet</h3>
              <p className="text-sm text-slate-600">Complete more study sessions to generate personalized insights.</p>
            </Card>
          ) : (
            insights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getInsightColor(insight.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(insight.impact)}>
                            {insight.impact}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{insight.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{insight.category}</span>
                        <span>•</span>
                        <span>{insight.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Recommendations Yet</h3>
              <p className="text-sm text-slate-600">Complete more study sessions to get personalized recommendations.</p>
            </Card>
          ) : (
            recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recommendation.type}
                        </Badge>
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

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span>Estimated time: {recommendation.implementation.estimatedTime}</span>
                        <span className="mx-2">•</span>
                        <span>Difficulty: {recommendation.implementation.difficulty}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onRecommendationAction?.(recommendation)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
          onClick={loadInsights}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
