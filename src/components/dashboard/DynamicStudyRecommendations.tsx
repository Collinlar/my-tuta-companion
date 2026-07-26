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
  Zap,
  Users,
  Heart,
  Gamepad2,
  Sparkles,
  Award,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Star,
  Lightbulb,
  Activity,
  Calendar,
  Timer,
  Eye,
  Hand,
  Ear,
  Book,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { 
  dynamicStudyRecommendations, 
  DynamicRecommendation,
  RecommendationContext
} from '@/services/dynamicStudyRecommendations';
import { profileAwareAI, UserProfile } from '@/services/profileAwareAI';

interface DynamicStudyRecommendationsProps {
  onRecommendationAction?: (recommendation: DynamicRecommendation) => void;
}

export function DynamicStudyRecommendations({ onRecommendationAction }: DynamicStudyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<DynamicRecommendation[]>([]);
  const [activeRecommendations, setActiveRecommendations] = useState<DynamicRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadRecommendations();
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Create recommendation context
      const context: RecommendationContext = {
        userProfile: userProfile || {
          name: 'Student',
          class: '10th',
          school: 'Example School',
          subjects: ['Mathematics', 'Science', 'English'],
          goals: ['Improve grades', 'Better understanding']
        },
        currentTime: new Date(),
        availableTime: 60, // Assume 60 minutes available
        currentMood: 'motivated',
        currentEnergy: 7,
        recentActivity: [],
        upcomingDeadlines: [],
        studyGoals: [
          { subject: 'Mathematics', goal: 'Master algebra concepts', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        ],
        environmentalFactors: ['quiet', 'comfortable']
      };

      const recs = dynamicStudyRecommendations.generateRecommendations(context);
      const activeRecs = dynamicStudyRecommendations.getActiveRecommendations();
      
      setRecommendations(recs);
      setActiveRecommendations(activeRecs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'study_session': return BookOpen;
      case 'review_session': return RotateCcw;
      case 'exploration': return Eye;
      case 'consolidation': return Target;
      case 'challenge': return Zap;
      case 'break': return Pause;
      case 'social_learning': return Users;
      case 'creative_project': return Sparkles;
      default: return Brain;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'study_session': return 'text-blue-600 bg-blue-100';
      case 'review_session': return 'text-green-600 bg-green-100';
      case 'exploration': return 'text-purple-600 bg-purple-100';
      case 'consolidation': return 'text-orange-600 bg-orange-100';
      case 'challenge': return 'text-red-600 bg-red-100';
      case 'break': return 'text-gray-600 bg-gray-100';
      case 'social_learning': return 'text-indigo-600 bg-indigo-100';
      case 'creative_project': return 'text-pink-600 bg-pink-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'text-yellow-100 text-yellow-800 border-yellow-200';
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

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Dynamic Recommendations</h2>
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Dynamic Study Recommendations</h2>
              <p className="text-sm text-slate-600">AI-powered personalized learning suggestions</p>
            </div>
          </div>
          <Button
            onClick={loadRecommendations}
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
            <div className="text-2xl font-bold text-slate-900">{activeRecommendations.length}</div>
            <div className="text-xs text-slate-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{recommendations.filter(r => r.priority === 'urgent').length}</div>
            <div className="text-xs text-slate-600">Urgent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{recommendations.filter(r => r.priority === 'high').length}</div>
            <div className="text-xs text-slate-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{recommendations.length}</div>
            <div className="text-xs text-slate-600">Total</div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Active ({activeRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            All ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRecommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Active Recommendations</h3>
              <p className="text-sm text-slate-600 mb-4">Generate new recommendations to get started.</p>
              <Button onClick={loadRecommendations} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Recommendations
              </Button>
            </Card>
          ) : (
            activeRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAction={onRecommendationAction}
                getRecommendationIcon={getRecommendationIcon}
                getRecommendationColor={getRecommendationColor}
                getPriorityColor={getPriorityColor}
                getLearningStyleIcon={getLearningStyleIcon}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Recommendations Available</h3>
              <p className="text-sm text-slate-600">Complete more study sessions to generate personalized recommendations.</p>
            </Card>
          ) : (
            recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAction={onRecommendationAction}
                getRecommendationIcon={getRecommendationIcon}
                getRecommendationColor={getRecommendationColor}
                getPriorityColor={getPriorityColor}
                getLearningStyleIcon={getLearningStyleIcon}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: DynamicRecommendation;
  onAction?: (recommendation: DynamicRecommendation) => void;
  getRecommendationIcon: (type: string) => any;
  getRecommendationColor: (type: string) => string;
  getPriorityColor: (priority: string) => string;
  getLearningStyleIcon: (style: string) => any;
  formatTime: (minutes: number) => string;
  formatDate: (date: Date) => string;
}

function RecommendationCard({
  recommendation,
  onAction,
  getRecommendationIcon,
  getRecommendationColor,
  getPriorityColor,
  getLearningStyleIcon,
  formatTime,
  formatDate
}: RecommendationCardProps) {
  const IconComponent = getRecommendationIcon(recommendation.type);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getRecommendationColor(recommendation.type)}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(recommendation.priority)}>
                {recommendation.priority}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {recommendation.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
          
          {/* Personalization Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-slate-400" />
              <span>{formatTime(recommendation.personalization.optimalTime.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-slate-400" />
              <span>{Math.round(recommendation.personalization.interestLevel)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              <span>{Math.round(recommendation.personalization.engagementScore)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-slate-400" />
              <span>{Math.round(recommendation.personalization.retentionLevel)}%</span>
            </div>
          </div>

          {/* Learning Styles */}
          {recommendation.personalization.learningStyle.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500">Learning Styles:</span>
              <div className="flex gap-1">
                {recommendation.personalization.learningStyle.map((style, index) => {
                  const StyleIcon = getLearningStyleIcon(style);
                  return (
                    <div key={index} className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                      <StyleIcon className="w-3 h-3 text-slate-600" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Implementation Steps */}
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <h4 className="text-xs font-medium text-slate-900 mb-2">Implementation Steps:</h4>
            <ol className="text-xs text-slate-600 space-y-1">
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

          {/* Expected Outcomes */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-slate-500">Learning Gain</div>
              <div className="text-sm font-medium text-green-600">
                +{recommendation.outcomes.learningGain}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Engagement</div>
              <div className="text-sm font-medium text-blue-600">
                +{recommendation.outcomes.engagementIncrease}%
              </div>
            </div>
          </div>

          {/* Gamification */}
          {recommendation.gamification.points > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="font-medium">{recommendation.gamification.points} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span>{recommendation.gamification.badges.length} badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-3 h-3 text-green-500" />
                  <span>{recommendation.gamification.challenges.length} challenges</span>
                </div>
              </div>
            </div>
          )}

          {/* Timing */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Optimal: {formatDate(recommendation.timing.optimalStartTime)}</span>
            </div>
            {recommendation.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Expires: {formatDate(recommendation.expiresAt)}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span>Time: {recommendation.implementation.estimatedTime}</span>
              <span className="mx-2">•</span>
              <span>Difficulty: {recommendation.implementation.difficulty}</span>
            </div>
            <Button
              size="sm"
              onClick={() => onAction?.(recommendation)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
