import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Star, 
  Trophy, 
  Target, 
  TrendingUp,
  Award,
  Zap,
  Shield,
  Lightbulb,
  Users,
  BookOpen,
  Clock,
  RefreshCw,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Gift,
  Crown,
  Flame,
  Diamond,
  Medal,
  Ribbon
} from 'lucide-react';
import { 
  encouragementMotivation, 
  EncouragementMessage, 
  Achievement,
  EncouragementType
} from '@/services/encouragementMotivation';

interface EncouragementMotivationProps {
  onEncouragementAction?: (encouragement: EncouragementMessage) => void;
  onAchievementAction?: (achievement: Achievement) => void;
}

export function EncouragementMotivation({ onEncouragementAction, onAchievementAction }: EncouragementMotivationProps) {
  const [encouragements, setEncouragements] = useState<EncouragementMessage[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studyStreak, setStudyStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('encouragements');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeEncouragements = encouragementMotivation.getActiveEncouragements();
      const allAchievements = encouragementMotivation.getAchievements();
      const streak = encouragementMotivation.getStudyStreak();

      setEncouragements(activeEncouragements);
      setAchievements(allAchievements);
      setStudyStreak(streak);
    } catch (error) {
      console.error('Error loading encouragement data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEncouragementIcon = (type: EncouragementType) => {
    switch (type) {
      case 'achievement_celebration': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'progress_recognition': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'effort_appreciation': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'challenge_encouragement': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'difficulty_support': return <Target className="w-5 h-5 text-purple-500" />;
      case 'breakthrough_celebration': return <Zap className="w-5 h-5 text-orange-500" />;
      case 'consistency_praise': return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'improvement_recognition': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'resilience_acknowledgment': return <Shield className="w-5 h-5 text-red-500" />;
      case 'creativity_celebration': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'collaboration_praise': return <Users className="w-5 h-5 text-green-600" />;
      case 'leadership_recognition': return <Crown className="w-5 h-5 text-purple-600" />;
      case 'perseverance_support': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'growth_mindset': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'self_compassion': return <Heart className="w-5 h-5 text-pink-600" />;
      case 'goal_reminder': return <Target className="w-5 h-5 text-green-500" />;
      case 'motivation_boost': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'confidence_building': return <Shield className="w-5 h-5 text-blue-500" />;
      default: return <Heart className="w-5 h-5 text-pink-500" />;
    }
  };

  const getEncouragementColor = (type: EncouragementType) => {
    switch (type) {
      case 'achievement_celebration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'progress_recognition': return 'bg-green-100 text-green-800 border-green-200';
      case 'effort_appreciation': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'challenge_encouragement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'difficulty_support': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'breakthrough_celebration': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'consistency_praise': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'improvement_recognition': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resilience_acknowledgment': return 'bg-red-100 text-red-800 border-red-200';
      case 'creativity_celebration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'collaboration_praise': return 'bg-green-100 text-green-800 border-green-200';
      case 'leadership_recognition': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'perseverance_support': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'growth_mindset': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'self_compassion': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'goal_reminder': return 'bg-green-100 text-green-800 border-green-200';
      case 'motivation_boost': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confidence_building': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-pink-100 text-pink-800 border-pink-200';
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Medal className="w-4 h-4" />;
      case 'uncommon': return <Ribbon className="w-4 h-4" />;
      case 'rare': return <Award className="w-4 h-4" />;
      case 'epic': return <Trophy className="w-4 h-4" />;
      case 'legendary': return <Crown className="w-4 h-4" />;
      default: return <Medal className="w-4 h-4" />;
    }
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
          <h2 className="text-lg font-semibold text-slate-900">Encouragement & Motivation</h2>
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
              <h2 className="text-xl font-semibold text-slate-900">Encouragement & Motivation</h2>
              <p className="text-sm text-slate-600">Personalized support and recognition</p>
            </div>
          </div>
          <Button
            onClick={loadData}
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
            <div className="text-2xl font-bold text-slate-900">{studyStreak}</div>
            <div className="text-xs text-slate-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{encouragements.length}</div>
            <div className="text-xs text-slate-600">Active Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {achievements.filter(a => a.unlockedAt).length}
            </div>
            <div className="text-xs text-slate-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {achievements.filter(a => !a.unlockedAt).length}
            </div>
            <div className="text-xs text-slate-600">Available</div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="encouragements" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Encouragements ({encouragements.length})
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements ({achievements.filter(a => a.unlockedAt).length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Encouragements Tab */}
        <TabsContent value="encouragements" className="space-y-4">
          {encouragements.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Active Encouragements</h3>
              <p className="text-sm text-slate-600">Complete study sessions to receive personalized encouragement.</p>
            </Card>
          ) : (
            encouragements.map((encouragement) => (
              <EncouragementCard
                key={encouragement.id}
                encouragement={encouragement}
                onAction={onEncouragementAction}
                getEncouragementIcon={getEncouragementIcon}
                getEncouragementColor={getEncouragementColor}
                getPriorityColor={getPriorityColor}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onAction={onAchievementAction}
                getRarityColor={getRarityColor}
                getRarityIcon={getRarityIcon}
                formatDate={formatDate}
              />
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Study Streak */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Study Streak</h3>
                  <p className="text-sm text-slate-600">Consecutive days of studying</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{studyStreak}</div>
              <div className="text-sm text-slate-600">days in a row</div>
            </Card>

            {/* Total Encouragements */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Total Encouragements</h3>
                  <p className="text-sm text-slate-600">Messages received</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{encouragements.length}</div>
              <div className="text-sm text-slate-600">active messages</div>
            </Card>

            {/* Achievements Progress */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Achievements</h3>
                  <p className="text-sm text-slate-600">Unlocked vs available</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {achievements.filter(a => a.unlockedAt).length}/{achievements.length}
              </div>
              <div className="text-sm text-slate-600">achievements unlocked</div>
            </Card>

            {/* Motivation Level */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Motivation Level</h3>
                  <p className="text-sm text-slate-600">Based on recent activity</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">High</div>
              <div className="text-sm text-slate-600">Keep up the great work!</div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Encouragement Card Component
interface EncouragementCardProps {
  encouragement: EncouragementMessage;
  onAction?: (encouragement: EncouragementMessage) => void;
  getEncouragementIcon: (type: EncouragementType) => JSX.Element;
  getEncouragementColor: (type: EncouragementType) => string;
  getPriorityColor: (priority: string) => string;
  formatTime: (date: Date) => string;
  formatDate: (date: Date) => string;
}

function EncouragementCard({
  encouragement,
  onAction,
  getEncouragementIcon,
  getEncouragementColor,
  getPriorityColor,
  formatTime,
  formatDate
}: EncouragementCardProps) {
  const IconComponent = getEncouragementIcon(encouragement.type);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          {IconComponent}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{encouragement.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(encouragement.priority)}>
                {encouragement.priority}
              </Badge>
              <Badge className={getEncouragementColor(encouragement.type)}>
                {encouragement.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">{encouragement.message}</p>
          
          {/* Expected Impact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-xs">
            <div>
              <div className="text-slate-500">Mood</div>
              <div className="font-medium text-green-600">
                +{encouragement.expectedImpact.moodImprovement}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Motivation</div>
              <div className="font-medium text-blue-600">
                +{encouragement.expectedImpact.motivationBoost}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Confidence</div>
              <div className="font-medium text-purple-600">
                +{encouragement.expectedImpact.confidenceIncrease}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Engagement</div>
              <div className="font-medium text-orange-600">
                +{encouragement.expectedImpact.engagementIncrease}%
              </div>
            </div>
          </div>

          {/* Gamification */}
          {encouragement.gamification.points > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="font-medium">{encouragement.gamification.points} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span>{encouragement.gamification.badges.length} badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-green-500" />
                  <span>{encouragement.gamification.achievements.length} achievements</span>
                </div>
              </div>
            </div>
          )}

          {/* Timing */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Created: {formatDate(encouragement.timestamp)} at {formatTime(encouragement.timestamp)}</span>
            </div>
            {encouragement.expiresAt && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Expires: {formatDate(encouragement.expiresAt)}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => onAction?.(encouragement)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              Acknowledge
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  onAction?: (achievement: Achievement) => void;
  getRarityColor: (rarity: string) => string;
  getRarityIcon: (rarity: string) => JSX.Element;
  formatDate: (date: Date) => string;
}

function AchievementCard({
  achievement,
  onAction,
  getRarityColor,
  getRarityIcon,
  formatDate
}: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const RarityIcon = getRarityIcon(achievement.rarity);

  return (
    <Card className={`p-4 ${isUnlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUnlocked ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gray-200'
        }`}>
          {isUnlocked ? (
            <Trophy className="w-6 h-6 text-yellow-600" />
          ) : (
            <Trophy className="w-6 h-6 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold ${isUnlocked ? 'text-slate-900' : 'text-gray-500'}`}>
              {achievement.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${getRarityColor(achievement.rarity)}`}>
                {RarityIcon}
                <span className="text-xs font-medium capitalize">{achievement.rarity}</span>
              </div>
            </div>
          </div>
          
          <p className={`text-sm mb-3 ${isUnlocked ? 'text-slate-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          
          {/* Progress Bar */}
          {!isUnlocked && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{achievement.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <div className="text-xs font-medium text-slate-900 mb-2">Rewards:</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span>{achievement.reward.points} points</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-blue-500" />
                <span>{achievement.reward.badges.length} badges</span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3 text-green-500" />
                <span>{achievement.reward.unlocks.length} unlocks</span>
              </div>
            </div>
          </div>

          {/* Unlock Date */}
          {isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-slate-500 mb-3">
              Unlocked: {formatDate(achievement.unlockedAt)}
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => onAction?.(achievement)}
              disabled={!isUnlocked}
              className={isUnlocked ? 
                "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" :
                "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            >
              {isUnlocked ? 'View Details' : 'Locked'}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
