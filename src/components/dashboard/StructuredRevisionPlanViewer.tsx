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
  Star,
  Trophy,
  Zap,
  Award,
  Calendar,
  Play,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Video,
  FileText,
  HelpCircle,
  BrainCircuit,
  Timer,
  Coins,
  Flame
} from 'lucide-react';
import { StructuredRevisionPlan, Mission, Activity, WeeklyPlan } from '@/services/structuredRevisionPlanService';

interface StructuredRevisionPlanViewerProps {
  plan: StructuredRevisionPlan;
  onBack: () => void;
  onStartPlan?: () => void;
}

export const StructuredRevisionPlanViewer: React.FC<StructuredRevisionPlanViewerProps> = ({ plan, onBack, onStartPlan }) => {
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(new Set());
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  const toggleMission = (missionId: string) => {
    setExpandedMissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(missionId)) {
        newSet.delete(missionId);
      } else {
        newSet.add(missionId);
      }
      return newSet;
    });
  };

  const toggleActivity = (activityId: string) => {
    setCompletedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'flashcards': return <Brain className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      case 'game': return <Gamepad2 className="h-4 w-4" />;
      case 'simulation': return <BrainCircuit className="h-4 w-4" />;
      case 'contest': return <Trophy className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    const totalMissions = plan.weeklyPlans.reduce((sum, week) => sum + week.missions.length, 0);
    const completedCount = completedMissions.size;
    return totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;
  };

  const progress = calculateProgress();

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
        </Button>
        {onStartPlan && (
          <Button onClick={onStartPlan} className="flex items-center bg-green-600 hover:bg-green-700 text-white">
            <Play className="mr-2 h-4 w-4" /> Start This Plan
          </Button>
        )}
      </div>

      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8" /> {plan.title}
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg">
            {plan.goal}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            <span>{plan.duration}</span>
          </div>
          <div className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            <span>Subject: <Badge variant="secondary" className="bg-white text-blue-600">{plan.subject}</Badge></span>
          </div>
          <div className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            <span>Topic: <Badge variant="secondary" className="bg-white text-purple-600">{plan.topic}</Badge></span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            <span>Progress: <Badge variant="secondary" className="bg-white text-green-600">{Math.round(progress)}%</Badge></span>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{plan.gamification.totalXP}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{plan.gamification.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{plan.gamification.badgesEarned.length}</div>
            <div className="text-sm text-gray-600">Badges</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center mb-2">
              <Coins className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">{plan.gamification.tutaCoins}</div>
            <div className="text-sm text-gray-600">TutaCoins</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">Level {plan.gamification.level}</div>
            <div className="text-sm text-gray-600 capitalize">{plan.gamification.rank}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" /> Revision Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedMissions.size} missions completed</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Plans */}
      <div className="space-y-6">
        {plan.weeklyPlans.map((weeklyPlan, weekIndex) => (
          <Card key={weekIndex} className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-xl flex items-center">
                <Calendar className="mr-2 h-6 w-6 text-blue-600" />
                🗺️ WEEK {weeklyPlan.week}: {weeklyPlan.title}
              </CardTitle>
              <CardDescription className="text-base">
                {weeklyPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {weeklyPlan.missions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isExpanded={expandedMissions.has(mission.id)}
                    isCompleted={completedMissions.has(mission.id)}
                    onToggle={() => toggleMission(mission.id)}
                    onCompleteActivity={toggleActivity}
                    completedActivities={completedActivities}
                    getActivityIcon={getActivityIcon}
                    getDifficultyColor={getDifficultyColor}
                  />
                ))}
                
                {/* Weekly Contest */}
                {weeklyPlan.weeklyContest && (
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
                        ⚔️ {weeklyPlan.weeklyContest.title}
                      </CardTitle>
                      <CardDescription>
                        {weeklyPlan.weeklyContest.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">
                          <Timer className="mr-1 h-3 w-3" />
                          {weeklyPlan.weeklyContest.duration} mins
                        </Badge>
                        <Badge variant="outline">
                          <HelpCircle className="mr-1 h-3 w-3" />
                          {weeklyPlan.weeklyContest.questionCount} questions
                        </Badge>
                        <Badge variant="outline">
                          <Zap className="mr-1 h-3 w-3" />
                          {weeklyPlan.weeklyContest.xpReward} XP
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {weeklyPlan.weeklyContest.badge}
                        </Badge>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                        <Trophy className="mr-2 h-4 w-4" />
                        Join Contest
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Feedback */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Brain className="mr-2 h-5 w-5 text-green-600" />
            💬 AI Feedback & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan.aiFeedback.map((feedback, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {feedback.type === 'encouragement' && <Zap className="h-5 w-5 text-green-500" />}
                    {feedback.type === 'suggestion' && <Target className="h-5 w-5 text-blue-500" />}
                    {feedback.type === 'warning' && <HelpCircle className="h-5 w-5 text-orange-500" />}
                    {feedback.type === 'achievement' && <Trophy className="h-5 w-5 text-yellow-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{feedback.message}</p>
                    {feedback.actionable && (
                      <p className="text-sm text-blue-600 mt-1 font-medium">
                        💡 {feedback.actionable}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface MissionCardProps {
  mission: Mission;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onCompleteActivity: (activityId: string) => void;
  completedActivities: Set<string>;
  getActivityIcon: (type: Activity['type']) => React.ReactNode;
  getDifficultyColor: (difficulty: string) => string;
}

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  isExpanded,
  isCompleted,
  onToggle,
  onCompleteActivity,
  completedActivities,
  getActivityIcon,
  getDifficultyColor
}) => {
  const completedActivitiesCount = mission.activities.filter(activity => 
    completedActivities.has(activity.id)
  ).length;

  return (
    <Card className={`border-2 ${isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{mission.emoji}</div>
            <div>
              <CardTitle className="text-lg">
                Day {mission.day}: {mission.topic}
              </CardTitle>
              <CardDescription className="text-sm">
                {mission.focus}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(mission.difficulty)}>
              {mission.difficulty}
            </Badge>
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {mission.estimatedTime} min
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              <Zap className="mr-1 h-3 w-3" />
              {mission.rewards.xp} XP
            </Badge>
            <Button variant="ghost" size="icon">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Activities */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <Target className="mr-2 h-4 w-4" /> Activities ({completedActivitiesCount}/{mission.activities.length})
            </h4>
            <div className="space-y-2">
              {mission.activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border ${
                    completedActivities.has(activity.id) 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        completedActivities.has(activity.id) 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h5 className="font-medium">{activity.title}</h5>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.duration} min
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Zap className="mr-1 h-3 w-3" />
                        {activity.xpValue} XP
                      </Badge>
                      <Button
                        size="sm"
                        variant={completedActivities.has(activity.id) ? "secondary" : "default"}
                        onClick={() => onCompleteActivity(activity.id)}
                      >
                        {completedActivities.has(activity.id) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Trophy className="mr-2 h-4 w-4" /> Rewards
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                <Zap className="mr-1 h-3 w-3" />
                {mission.rewards.xp} XP
              </Badge>
              {mission.rewards.badge && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Award className="mr-1 h-3 w-3" />
                  {mission.rewards.badge}
                </Badge>
              )}
              {mission.rewards.tutaCoins && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Coins className="mr-1 h-3 w-3" />
                  {mission.rewards.tutaCoins} TutaCoins
                </Badge>
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 flex items-center text-blue-800">
              <Brain className="mr-2 h-4 w-4" /> AI Recommendations
            </h4>
            <p className="text-blue-700 text-sm">{mission.aiRecommendations}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
