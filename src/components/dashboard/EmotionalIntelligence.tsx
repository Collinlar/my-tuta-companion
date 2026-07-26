import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Brain, 
  Smile, 
  Frown, 
  Meh,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  Lightbulb,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  Shield,
  Users,
  BookOpen,
  Coffee,
  Moon,
  Sun,
  Cloud,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { 
  moodDetection, 
  MoodData, 
  MoodType, 
  MoodPattern, 
  MoodRecommendation 
} from '@/services/moodDetection';

interface EmotionalIntelligenceProps {
  onMoodAction?: (mood: MoodData) => void;
  onRecommendationAction?: (recommendation: MoodRecommendation) => void;
}

export function EmotionalIntelligence({ onMoodAction, onRecommendationAction }: EmotionalIntelligenceProps) {
  const [currentMood, setCurrentMood] = useState<MoodData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [moodPatterns, setMoodPatterns] = useState<MoodPattern | null>(null);
  const [recommendations, setRecommendations] = useState<MoodRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [moodInput, setMoodInput] = useState('');

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    setIsLoading(true);
    try {
      const current = moodDetection.getCurrentMood();
      const history = moodDetection.getMoodHistory(7);
      const patterns = moodDetection.analyzeMoodPatterns();
      const recs = moodDetection.generateMoodRecommendations();

      setCurrentMood(current);
      setMoodHistory(history);
      setMoodPatterns(patterns);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodInput = () => {
    if (!moodInput.trim()) return;

    const moodData = moodDetection.detectMoodFromText(moodInput);
    setCurrentMood(moodData);
    setMoodHistory(prev => [...prev, moodData]);
    setMoodInput('');
    loadMoodData(); // Refresh all data
  };

  const getMoodIcon = (mood: MoodType) => {
    switch (mood) {
      case 'excited': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'motivated': return <Target className="w-5 h-5 text-green-500" />;
      case 'confident': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'focused': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'curious': return <Lightbulb className="w-5 h-5 text-orange-500" />;
      case 'satisfied': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'frustrated': return <Frown className="w-5 h-5 text-red-500" />;
      case 'overwhelmed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'anxious': return <Activity className="w-5 h-5 text-yellow-600" />;
      case 'stressed': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'confused': return <Meh className="w-5 h-5 text-gray-500" />;
      case 'bored': return <Meh className="w-5 h-5 text-gray-400" />;
      case 'tired': return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'discouraged': return <Frown className="w-5 h-5 text-gray-600" />;
      case 'lonely': return <Users className="w-5 h-5 text-blue-600" />;
      case 'angry': return <Frown className="w-5 h-5 text-red-600" />;
      case 'sad': return <Frown className="w-5 h-5 text-blue-700" />;
      case 'neutral': return <Meh className="w-5 h-5 text-gray-500" />;
      default: return <Heart className="w-5 h-5 text-pink-500" />;
    }
  };

  const getMoodColor = (mood: MoodType) => {
    switch (mood) {
      case 'excited': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'motivated': return 'bg-green-100 text-green-800 border-green-200';
      case 'confident': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'focused': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'curious': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'satisfied': return 'bg-green-100 text-green-800 border-green-200';
      case 'frustrated': return 'bg-red-100 text-red-800 border-red-200';
      case 'overwhelmed': return 'bg-red-100 text-red-800 border-red-200';
      case 'anxious': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stressed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confused': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'bored': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'tired': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'discouraged': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'lonely': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'angry': return 'bg-red-100 text-red-800 border-red-200';
      case 'sad': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-pink-100 text-pink-800 border-pink-200';
    }
  };

  const getMoodIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'text-red-600';
    if (intensity >= 60) return 'text-orange-600';
    if (intensity >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Emotional Intelligence</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Emotional Intelligence</h2>
              <p className="text-sm text-slate-600">Mood detection and emotional support</p>
            </div>
          </div>
          <Button
            onClick={loadMoodData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {currentMood ? getMoodIcon(currentMood.mood) : <Meh className="w-6 h-6 text-gray-400 mx-auto" />}
            </div>
            <div className="text-xs text-slate-600">Current Mood</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{moodHistory.length}</div>
            <div className="text-xs text-slate-600">Mood Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {moodPatterns ? Math.round(moodPatterns.moodStability) : 0}%
            </div>
            <div className="text-xs text-slate-600">Stability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{recommendations.length}</div>
            <div className="text-xs text-slate-600">Recommendations</div>
          </div>
        </div>
      </Card>

      {/* Mood Input */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-slate-900">How are you feeling right now?</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={moodInput}
            onChange={(e) => setMoodInput(e.target.value)}
            placeholder="Describe your current mood or feelings..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            onKeyPress={(e) => e.key === 'Enter' && handleMoodInput()}
          />
          <Button onClick={handleMoodInput} className="bg-pink-500 hover:bg-pink-600 text-white">
            <Heart className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Current
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* Current Mood Tab */}
        <TabsContent value="current" className="space-y-4">
          {currentMood ? (
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  {getMoodIcon(currentMood.mood)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-slate-900 capitalize">
                      {currentMood.mood.replace('_', ' ')}
                    </h3>
                    <Badge className={getMoodColor(currentMood.mood)}>
                      {currentMood.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Detected at {formatTime(currentMood.timestamp)} • 
                    Intensity: <span className={getMoodIntensityColor(currentMood.intensity)}>
                      {currentMood.intensity}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Mood Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Context</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    {currentMood.context.studySession && (
                      <div>Study: {currentMood.context.studySession.subject} ({currentMood.context.studySession.duration}min)</div>
                    )}
                    {currentMood.context.timeOfDay && (
                      <div>Time: {currentMood.context.timeOfDay}</div>
                    )}
                    {currentMood.context.academicPressure && (
                      <div>Pressure: {currentMood.context.academicPressure.workloadLevel}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Triggers</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentMood.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => onMoodAction?.(currentMood)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  Get Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Mood Data</h3>
              <p className="text-sm text-slate-600 mb-4">Share how you're feeling to get started with emotional intelligence tracking.</p>
              <Button onClick={() => setActiveTab('history')} variant="outline">
                View History
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Mood History Tab */}
        <TabsContent value="history" className="space-y-4">
          {moodHistory.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Mood History</h3>
              <p className="text-sm text-slate-600">Start tracking your mood to see patterns and insights.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {moodHistory.map((mood, index) => (
                <Card key={mood.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                      {getMoodIcon(mood.mood)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 capitalize">
                          {mood.mood.replace('_', ' ')}
                        </h4>
                        <Badge className={getMoodColor(mood.mood)}>
                          {mood.confidence}%
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {formatDate(mood.timestamp)} at {formatTime(mood.timestamp)} • 
                        Intensity: {mood.intensity}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">
                        {mood.source.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {mood.duration}min
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mood Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          {moodPatterns ? (
            <div className="space-y-4">
              {/* Mood Stability */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Mood Stability</h3>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {moodPatterns.moodStability}%
                    </div>
                    <div className="text-sm text-slate-600">Overall Stability</div>
                  </div>
                </div>
              </Card>

              {/* Dominant Mood */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Dominant Mood</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                    {getMoodIcon(moodPatterns.dominantMood)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 capitalize">
                      {moodPatterns.dominantMood.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-slate-600">
                      {moodPatterns.moodFrequency[moodPatterns.dominantMood]} occurrences
                    </div>
                  </div>
                </div>
              </Card>

              {/* Mood Trends */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Mood Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Improving</span>
                    </div>
                    <div className="space-y-1">
                      {moodPatterns.moodTrends.improving.map((mood, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">Declining</span>
                    </div>
                    <div className="space-y-1">
                      {moodPatterns.moodTrends.declining.map((mood, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800 text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Stable</span>
                    </div>
                    <div className="space-y-1">
                      {moodPatterns.moodTrends.stable.map((mood, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PieChart className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Pattern Data</h3>
              <p className="text-sm text-slate-600">Need more mood data to analyze patterns.</p>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Recommendations</h3>
              <p className="text-sm text-slate-600">Share your mood to get personalized emotional support.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <MoodRecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAction={onRecommendationAction}
                  getMoodIcon={getMoodIcon}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mood Recommendation Card Component
interface MoodRecommendationCardProps {
  recommendation: MoodRecommendation;
  onAction?: (recommendation: MoodRecommendation) => void;
  getMoodIcon: (mood: MoodType) => JSX.Element;
}

function MoodRecommendationCard({ 
  recommendation, 
  onAction, 
  getMoodIcon 
}: MoodRecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'immediate': return <Zap className="w-4 h-4" />;
      case 'short_term': return <Clock className="w-4 h-4" />;
      case 'long_term': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getMoodIcon(recommendation.moodTarget)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(recommendation.priority)}>
                {recommendation.priority}
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                {getTypeIcon(recommendation.type)}
                {recommendation.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
          
          {/* Action and Expected Outcome */}
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <div className="text-sm">
              <div className="font-medium text-slate-900 mb-1">Action:</div>
              <div className="text-slate-700 mb-2">{recommendation.action}</div>
              <div className="font-medium text-slate-900 mb-1">Expected Outcome:</div>
              <div className="text-slate-700">{recommendation.expectedOutcome}</div>
            </div>
          </div>

          {/* Implementation Steps */}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Steps:</h4>
            <ol className="text-sm text-slate-600 space-y-1">
              {recommendation.implementation.steps.slice(0, 3).map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-slate-400">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
              {recommendation.implementation.steps.length > 3 && (
                <li className="text-slate-400">+{recommendation.implementation.steps.length - 3} more steps</li>
              )}
            </ol>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
            <div>
              <div className="text-slate-500">Time</div>
              <div className="font-medium">{recommendation.implementation.estimatedTime}</div>
            </div>
            <div>
              <div className="text-slate-500">Confidence</div>
              <div className="font-medium">{recommendation.confidence}%</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => onAction?.(recommendation)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              Start
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
