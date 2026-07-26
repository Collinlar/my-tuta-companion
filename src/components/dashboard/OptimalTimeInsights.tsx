import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Sun,
  Moon,
  Calendar,
  BarChart3,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Activity,
  Brain,
  Eye,
  Coffee,
  Bed,
  Sunrise,
  Sunset
} from 'lucide-react';
import { 
  optimalTimeDetection, 
  OptimalTimeProfile, 
  TimeBasedRecommendation,
  TimeAnalysisData 
} from '@/services/optimalTimeDetection';

interface OptimalTimeInsightsProps {
  onRecommendationAction?: (recommendation: TimeBasedRecommendation) => void;
}

export function OptimalTimeInsights({ onRecommendationAction }: OptimalTimeInsightsProps) {
  const [timeProfile, setTimeProfile] = useState<OptimalTimeProfile | null>(null);
  const [recommendations, setRecommendations] = useState<TimeBasedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTimeStatus, setCurrentTimeStatus] = useState<{
    isOptimal: boolean;
    reason: string;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    loadTimeInsights();
    checkCurrentTimeStatus();
  }, []);

  const loadTimeInsights = async () => {
    setIsLoading(true);
    try {
      const profile = optimalTimeDetection.getOptimalTimeProfile();
      const recs = optimalTimeDetection.getTimeRecommendations();
      setTimeProfile(profile);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading time insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentTimeStatus = () => {
    const status = optimalTimeDetection.isOptimalStudyTime();
    setCurrentTimeStatus(status);
  };

  const getTimeIcon = (hour: number) => {
    if (hour >= 6 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 17) return Sun;
    if (hour >= 17 && hour < 20) return Sunset;
    return Moon;
  };

  const getTimeColor = (productivity: number) => {
    if (productivity >= 80) return 'text-green-600 bg-green-100';
    if (productivity >= 60) return 'text-yellow-600 bg-yellow-100';
    if (productivity >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getChronotypeIcon = (chronotype: string) => {
    switch (chronotype) {
      case 'morning': return Sunrise;
      case 'evening': return Moon;
      case 'intermediate': return Sun;
      default: return Clock;
    }
  };

  const getChronotypeColor = (chronotype: string) => {
    switch (chronotype) {
      case 'morning': return 'text-yellow-600 bg-yellow-100';
      case 'evening': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Optimal Time Analysis</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!timeProfile) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">No Time Data Yet</h3>
        <p className="text-sm text-slate-600 mb-4">Complete more study sessions to analyze your optimal learning times.</p>
        <Button onClick={loadTimeInsights} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Time Status */}
      {currentTimeStatus && (
        <Card className={`p-4 ${currentTimeStatus.isOptimal ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentTimeStatus.isOptimal ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {currentTimeStatus.isOptimal ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${currentTimeStatus.isOptimal ? 'text-green-900' : 'text-yellow-900'}`}>
                {currentTimeStatus.isOptimal ? 'Great Time to Study!' : 'Consider Your Timing'}
              </h3>
              <p className={`text-sm ${currentTimeStatus.isOptimal ? 'text-green-700' : 'text-yellow-700'}`}>
                {currentTimeStatus.reason}
              </p>
              <div className="text-xs text-slate-500 mt-1">
                Confidence: {currentTimeStatus.confidence}%
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={checkCurrentTimeStatus}
              className="bg-white"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Optimal Time Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Peak Performance */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Peak Performance</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Best Hour:</span>
                <span className="font-medium text-green-900">{formatHour(timeProfile.peakPerformance.bestHour)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Best Day:</span>
                <span className="font-medium text-green-900">{timeProfile.peakPerformance.bestDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Productivity:</span>
                <span className="font-medium text-green-900">{timeProfile.peakPerformance.peakProductivity}%</span>
              </div>
            </div>
          </div>

          {/* Low Performance */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Avoid These Times</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">Worst Hour:</span>
                <span className="font-medium text-red-900">{formatHour(timeProfile.lowPerformance.worstHour)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">Worst Day:</span>
                <span className="font-medium text-red-900">{timeProfile.lowPerformance.worstDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">Productivity:</span>
                <span className="font-medium text-red-900">{timeProfile.lowPerformance.lowProductivity}%</span>
              </div>
            </div>
          </div>

          {/* Chronotype */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getChronotypeColor(timeProfile.circadianRhythm.chronotype)}`}>
                {React.createElement(getChronotypeIcon(timeProfile.circadianRhythm.chronotype), { className: "w-3 h-3" })}
              </div>
              <h3 className="font-semibold text-purple-900">Chronotype</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Type:</span>
                <span className="font-medium text-purple-900 capitalize">{timeProfile.circadianRhythm.chronotype}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Peak Alertness:</span>
                <span className="font-medium text-purple-900">{formatHour(timeProfile.circadianRhythm.alertnessPeak)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Low Alertness:</span>
                <span className="font-medium text-purple-900">{formatHour(timeProfile.circadianRhythm.alertnessTrough)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimal Conditions */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Optimal Study Conditions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{timeProfile.optimalConditions.sessionLength}</div>
              <div className="text-xs text-slate-600">Minutes per Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{timeProfile.optimalConditions.breakFrequency}</div>
              <div className="text-xs text-slate-600">Breaks per Hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{timeProfile.optimalConditions.breakDuration}</div>
              <div className="text-xs text-slate-600">Break Duration (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{timeProfile.optimalConditions.environmentFactors.length}</div>
              <div className="text-xs text-slate-600">Optimal Factors</div>
            </div>
          </div>
          {timeProfile.optimalConditions.environmentFactors.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {timeProfile.optimalConditions.environmentFactors.map((factor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Daily Pattern
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly Pattern
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">24-Hour Productivity Pattern</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = timeProfile.dailyPattern[hour];
                const productivity = hourData?.productivity || 0;
                const confidence = hourData?.confidence || 0;
                const IconComponent = getTimeIcon(hour);
                
                return (
                  <div key={hour} className="text-center">
                    <div className={`w-full h-16 rounded-lg flex flex-col items-center justify-center mb-2 ${
                      productivity >= 80 ? 'bg-green-100 border border-green-200' :
                      productivity >= 60 ? 'bg-yellow-100 border border-yellow-200' :
                      productivity >= 40 ? 'bg-orange-100 border border-orange-200' :
                      'bg-red-100 border border-red-200'
                    }`}>
                      <IconComponent className="w-3 h-3 mb-1" />
                      <div className="text-xs font-medium">{productivity}%</div>
                      <div className="text-xs opacity-60">{confidence}%</div>
                    </div>
                    <div className="text-xs text-slate-600">
                      {formatHour(hour)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span>High (80%+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span>Good (60-79%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                <span>Fair (40-59%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span>Low (&lt;40%)</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Weekly Productivity Pattern</h3>
            <div className="grid grid-cols-7 gap-4">
              {Object.entries(timeProfile.weeklyPattern).map(([day, data]) => {
                const productivity = data.productivity;
                const confidence = data.confidence;
                
                return (
                  <div key={day} className="text-center">
                    <div className={`w-full h-20 rounded-lg flex flex-col items-center justify-center mb-2 ${
                      productivity >= 80 ? 'bg-green-100 border border-green-200' :
                      productivity >= 60 ? 'bg-yellow-100 border border-yellow-200' :
                      productivity >= 40 ? 'bg-orange-100 border border-orange-200' :
                      'bg-red-100 border border-red-200'
                    }`}>
                      <div className="text-sm font-medium">{productivity}%</div>
                      <div className="text-xs opacity-60">{confidence}%</div>
                    </div>
                    <div className="text-sm font-medium text-slate-900">{day.slice(0, 3)}</div>
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
                <Target className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Recommendations Yet</h3>
              <p className="text-sm text-slate-600">Complete more study sessions to get personalized time-based recommendations.</p>
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
                        <Badge className={recommendation.priority === 'high' ? 'bg-red-100 text-red-800' : recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
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
                        <span>Confidence: {recommendation.confidence}%</span>
                        <span className="mx-2">•</span>
                        <span>Timing: {recommendation.implementation.timing}</span>
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
          onClick={loadTimeInsights}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
