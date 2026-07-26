import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Star,
  Target,
  BookOpen,
  BarChart3,
  LineChart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Lightbulb,
  Eye,
  Users,
  Award,
  Gamepad2,
  Sparkles,
  Brain,
  Clock,
  Activity
} from 'lucide-react';
import { 
  interestMapping, 
  EngagementPattern, 
  InterestRecommendation,
  InterestData,
  InterestCluster
} from '@/services/interestMapping';

interface InterestMappingInsightsProps {
  onRecommendationAction?: (recommendation: InterestRecommendation) => void;
}

export function InterestMappingInsights({ onRecommendationAction }: InterestMappingInsightsProps) {
  const [engagementPattern, setEngagementPattern] = useState<EngagementPattern | null>(null);
  const [recommendations, setRecommendations] = useState<InterestRecommendation[]>([]);
  const [interestData, setInterestData] = useState<InterestData[]>([]);
  const [interestClusters, setInterestClusters] = useState<InterestCluster[]>([]);
  const [highInterestTopics, setHighInterestTopics] = useState<InterestData[]>([]);
  const [trendingInterests, setTrendingInterests] = useState<InterestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInterestInsights();
  }, []);

  const loadInterestInsights = async () => {
    setIsLoading(true);
    try {
      const pattern = interestMapping.getEngagementPattern();
      const recs = interestMapping.getInterestRecommendations();
      const data = interestMapping.getInterestData();
      const clusters = interestMapping.getInterestClusters();
      const highInterest = interestMapping.getHighInterestTopics(5);
      const trending = interestMapping.getTrendingInterests(5);
      
      setEngagementPattern(pattern);
      setRecommendations(recs);
      setInterestData(data);
      setInterestClusters(clusters);
      setHighInterestTopics(highInterest);
      setTrendingInterests(trending);
    } catch (error) {
      console.error('Error loading interest insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInterestIcon = (type: string) => {
    switch (type) {
      case 'explore': return Eye;
      case 'deepen': return Brain;
      case 'connect': return Target;
      case 'challenge': return Zap;
      case 'gamify': return Gamepad2;
      case 'socialize': return Users;
      default: return Lightbulb;
    }
  };

  const getInterestColor = (type: string) => {
    switch (type) {
      case 'explore': return 'text-blue-600 bg-blue-100';
      case 'deepen': return 'text-purple-600 bg-purple-100';
      case 'connect': return 'text-green-600 bg-green-100';
      case 'challenge': return 'text-orange-600 bg-orange-100';
      case 'gamify': return 'text-pink-600 bg-pink-100';
      case 'socialize': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return TrendingUp;
      case 'growing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      case 'declining': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-100';
      case 'growing': return 'text-green-600 bg-green-100';
      case 'decreasing': return 'text-red-600 bg-red-100';
      case 'declining': return 'text-red-600 bg-red-100';
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

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return 'text-green-600';
    if (engagement >= 60) return 'text-yellow-600';
    if (engagement >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getInterestLevelColor = (level: number) => {
    if (level >= 80) return 'text-pink-600';
    if (level >= 60) return 'text-purple-600';
    if (level >= 40) return 'text-blue-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Interest Analysis</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!engagementPattern) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">No Interest Data Yet</h3>
        <p className="text-sm text-slate-600 mb-4">Complete more study sessions to analyze your interests and engagement patterns.</p>
        <Button onClick={loadInterestInsights} variant="outline">
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
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Interest & Engagement Overview</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.round(engagementPattern.overallEngagement)}%
            </div>
            <div className="text-sm text-slate-600">Overall Engagement</div>
            <div className={`text-xs ${getEngagementColor(engagementPattern.overallEngagement)}`}>
              {engagementPattern.overallEngagement >= 80 ? 'Excellent' : 
               engagementPattern.overallEngagement >= 60 ? 'Good' : 
               engagementPattern.overallEngagement >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.round(engagementPattern.averageSessionDuration)}
            </div>
            <div className="text-sm text-slate-600">Avg Session (min)</div>
            <div className="text-xs text-slate-500">
              {engagementPattern.averageSessionDuration >= 45 ? 'Long sessions' : 
               engagementPattern.averageSessionDuration >= 30 ? 'Medium sessions' : 'Short sessions'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {interestData.length}
            </div>
            <div className="text-sm text-slate-600">Tracked Interests</div>
            <div className="text-xs text-slate-500">
              {interestData.length >= 20 ? 'Diverse interests' : 
               interestData.length >= 10 ? 'Growing interests' : 'Building interests'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {trendingInterests.length}
            </div>
            <div className="text-sm text-slate-600">Trending Topics</div>
            <div className="text-xs text-slate-500">
              {trendingInterests.length >= 3 ? 'Growing enthusiasm' : 
               trendingInterests.length >= 1 ? 'Some growth' : 'Stable interests'}
            </div>
          </div>
        </div>

        {/* Peak Engagement Time */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Peak Engagement Time</h3>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-600">
              You're most engaged at {engagementPattern.peakEngagementTime}:00
            </span>
          </div>
        </div>
      </Card>

      {/* High Interest Topics */}
      {highInterestTopics.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">High Interest Topics</h3>
          </div>
          <div className="space-y-3">
            {highInterestTopics.map((item) => {
              const TrendIcon = getTrendIcon(item.interestTrend);
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{item.concept}</h4>
                      <div className="text-xs text-slate-500">
                        {item.subject} • {item.topic}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getInterestLevelColor(item.interestLevel)}`}>
                      {Math.round(item.interestLevel)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`w-3 h-3 ${getTrendColor(item.interestTrend).split(' ')[0]}`} />
                      <span className="text-xs text-slate-500 capitalize">{item.interestTrend}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Trending Interests */}
      {trendingInterests.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Trending Interests</h3>
          </div>
          <div className="space-y-3">
            {trendingInterests.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{item.concept}</h4>
                    <div className="text-xs text-slate-500">
                      {item.subject} • {item.topic} • {item.interactionCount} interactions
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getInterestLevelColor(item.interestLevel)}`}>
                    {Math.round(item.interestLevel)}%
                  </div>
                  <div className="text-xs text-green-600">
                    Growing interest
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="clusters" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Interest Clusters
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Engagement */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Subject Engagement</h3>
              <div className="space-y-3">
                {Object.entries(engagementPattern.engagementBySubject).map(([subject, data]) => {
                  const TrendIcon = getTrendIcon(data.trend);
                  return (
                    <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{subject}</h4>
                          <div className="text-xs text-slate-500">
                            {data.timeSpent} min • {data.interactionCount} interactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getEngagementColor(data.engagement)}`}>
                          {Math.round(data.engagement)}%
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendIcon className={`w-3 h-3 ${getTrendColor(data.trend).split(' ')[0]}`} />
                          <span className="text-xs text-slate-500 capitalize">{data.trend}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Activity Engagement */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Activity Engagement</h3>
              <div className="space-y-3">
                {Object.entries(engagementPattern.engagementByActivity).map(([activity, data]) => (
                  <div key={activity} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 capitalize">{activity}</h4>
                        <div className="text-xs text-slate-500">
                          {data.frequency} times • {Math.round(data.averageDuration)} min avg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getEngagementColor(data.engagement)}`}>
                        {Math.round(data.engagement)}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {Math.round(data.satisfaction)}% satisfied
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Interest Clusters</h3>
            <div className="space-y-4">
              {interestClusters.map((cluster) => {
                const TrendIcon = getTrendIcon(cluster.trend);
                return (
                  <div key={cluster.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900">{cluster.name}</h4>
                        <div className="text-sm text-slate-600">
                          {cluster.concepts.length} concepts • {cluster.topics.length} topics
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendIcon className={`w-4 h-4 ${getTrendColor(cluster.trend).split(' ')[0]}`} />
                        <Badge className={getTrendColor(cluster.trend)}>
                          {cluster.trend}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getInterestLevelColor(cluster.averageInterest)}`}>
                          {Math.round(cluster.averageInterest)}%
                        </div>
                        <div className="text-xs text-slate-500">Interest Level</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getEngagementColor(cluster.averageEngagement)}`}>
                          {Math.round(cluster.averageEngagement)}%
                        </div>
                        <div className="text-xs text-slate-500">Engagement</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cluster.concepts.slice(0, 5).map((concept, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                      {cluster.concepts.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{cluster.concepts.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Recommendations Yet</h3>
              <p className="text-sm text-slate-600">Complete more study sessions to get personalized interest-based recommendations.</p>
            </Card>
          ) : (
            recommendations.map((recommendation) => {
              const IconComponent = getInterestIcon(recommendation.type);
              return (
                <Card key={recommendation.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getInterestColor(recommendation.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
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

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-slate-500">Expected Engagement Increase</div>
                          <div className="text-sm font-medium text-green-600">
                            +{recommendation.expectedOutcomes.engagementIncrease}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Interest Growth</div>
                          <div className="text-sm font-medium text-purple-600">
                            +{recommendation.expectedOutcomes.interestGrowth}%
                          </div>
                        </div>
                      </div>

                      {/* Gamification */}
                      {recommendation.gamification.points > 0 && (
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 mb-3">
                          <h4 className="text-xs font-medium text-slate-900 mb-2">Gamification Elements:</h4>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span>{recommendation.gamification.points} points</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-blue-500" />
                              <span>{recommendation.gamification.badges.length} badges</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Gamepad2 className="w-3 h-3 text-green-500" />
                              <span>{recommendation.gamification.challenges.length} challenges</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          <span>Time: {recommendation.implementation.estimatedTime}</span>
                          <span className="mx-2">•</span>
                          <span>Difficulty: {recommendation.implementation.difficulty}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onRecommendationAction?.(recommendation)}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                        >
                          Apply
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={loadInterestInsights}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 hover:from-pink-600 hover:to-purple-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
