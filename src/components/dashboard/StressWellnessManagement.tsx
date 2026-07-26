import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Brain, 
  Activity, 
  Moon, 
  Sun,
  Users,
  Clock,
  Target,
  Zap,
  Shield,
  Lightbulb,
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
  Ribbon,
  Droplets,
  Music,
  BookOpen,
  Coffee,
  TreePine,
  Wind,
  Waves,
  Mountain,
  Flower2,
  Leaf,
  Star,
  Compass,
  MapPin,
  Timer,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  stressWellnessManagement, 
  WellnessSuggestion, 
  WellnessType,
  WellnessCategory,
  WellnessProgress
} from '@/services/stressWellnessManagement';

interface StressWellnessManagementProps {
  onSuggestionAction?: (suggestion: WellnessSuggestion) => void;
  onProgressAction?: (progress: WellnessProgress) => void;
}

export function StressWellnessManagement({ onSuggestionAction, onProgressAction }: StressWellnessManagementProps) {
  const [suggestions, setSuggestions] = useState<WellnessSuggestion[]>([]);
  const [progress, setProgress] = useState<WellnessProgress[]>([]);
  const [stressHistory, setStressHistory] = useState<{ timestamp: Date; level: number; triggers: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedCategory, setSelectedCategory] = useState<WellnessCategory | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Create a sample wellness context
      const context = {
        currentMood: 'stressed' as const,
        moodIntensity: 75,
        stressLevel: 80,
        energyLevel: 40,
        sleepQuality: 60,
        socialConnection: 50,
        academicPressure: 85,
        timeAvailable: 30,
        environment: {
          location: 'home' as const,
          noiseLevel: 'quiet' as const,
          lighting: 'moderate' as const,
          privacy: 'private' as const
        },
        recentActivity: {
          studyHours: 4,
          breakTime: 1,
          physicalActivity: 0.5,
          socialInteraction: 1
        },
        personalFactors: {
          age: 18,
          healthConditions: [],
          preferences: ['music', 'nature'],
          limitations: []
        }
      };

      const wellnessSuggestions = stressWellnessManagement.generateWellnessSuggestions(context);
      const wellnessProgress = stressWellnessManagement.getWellnessProgress();
      const stressData = stressWellnessManagement.getStressHistory();

      setSuggestions(wellnessSuggestions);
      setProgress(wellnessProgress);
      setStressHistory(stressData);
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWellnessIcon = (type: WellnessType) => {
    switch (type) {
      case 'breathing_exercise': return <Wind className="w-5 h-5 text-blue-500" />;
      case 'meditation': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'mindfulness': return <Compass className="w-5 h-5 text-indigo-500" />;
      case 'progressive_relaxation': return <Activity className="w-5 h-5 text-green-500" />;
      case 'physical_exercise': return <Zap className="w-5 h-5 text-orange-500" />;
      case 'stretching': return <Activity className="w-5 h-5 text-green-600" />;
      case 'yoga': return <TreePine className="w-5 h-5 text-emerald-500" />;
      case 'walking': return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'dancing': return <Music className="w-5 h-5 text-pink-500" />;
      case 'nutrition_advice': return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'hydration': return <Droplets className="w-5 h-5 text-cyan-500" />;
      case 'healthy_snack': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'meal_planning': return <BookOpen className="w-5 h-5 text-orange-600" />;
      case 'sleep_optimization': return <Moon className="w-5 h-5 text-indigo-600" />;
      case 'sleep_hygiene': return <Moon className="w-5 h-5 text-blue-600" />;
      case 'nap_guidance': return <Moon className="w-5 h-5 text-purple-600" />;
      case 'bedtime_routine': return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'social_connection': return <Users className="w-5 h-5 text-green-500" />;
      case 'peer_support': return <Users className="w-5 h-5 text-blue-500" />;
      case 'family_time': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'friend_interaction': return <Users className="w-5 h-5 text-purple-500" />;
      case 'hobby_engagement': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'creative_activity': return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'music_therapy': return <Music className="w-5 h-5 text-pink-600" />;
      case 'art_therapy': return <Flower2 className="w-5 h-5 text-rose-500" />;
      case 'environment_optimization': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'space_organization': return <Target className="w-5 h-5 text-blue-500" />;
      case 'lighting_adjustment': return <Sun className="w-5 h-5 text-yellow-600" />;
      case 'noise_control': return <Waves className="w-5 h-5 text-cyan-500" />;
      case 'time_management': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'break_scheduling': return <Timer className="w-5 h-5 text-green-500" />;
      case 'workload_balancing': return <Target className="w-5 h-5 text-purple-500" />;
      case 'priority_setting': return <Target className="w-5 h-5 text-orange-500" />;
      case 'cognitive_techniques': return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'positive_thinking': return <Heart className="w-5 h-5 text-pink-600" />;
      case 'gratitude_practice': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'goal_reframing': return <Target className="w-5 h-5 text-green-600" />;
      case 'sensory_therapy': return <Waves className="w-5 h-5 text-cyan-600" />;
      case 'aromatherapy': return <Flower2 className="w-5 h-5 text-purple-500" />;
      case 'sound_therapy': return <Waves className="w-5 h-5 text-blue-500" />;
      case 'visual_calm': return <Mountain className="w-5 h-5 text-green-500" />;
      case 'professional_support': return <Shield className="w-5 h-5 text-red-500" />;
      case 'counseling_referral': return <Heart className="w-5 h-5 text-red-600" />;
      case 'therapy_suggestion': return <Brain className="w-5 h-5 text-red-500" />;
      case 'crisis_support': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Heart className="w-5 h-5 text-pink-500" />;
    }
  };

  const getWellnessColor = (type: WellnessType) => {
    switch (type) {
      case 'breathing_exercise': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meditation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mindfulness': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'progressive_relaxation': return 'bg-green-100 text-green-800 border-green-200';
      case 'physical_exercise': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'stretching': return 'bg-green-100 text-green-800 border-green-200';
      case 'yoga': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'walking': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dancing': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'nutrition_advice': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hydration': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'healthy_snack': return 'bg-green-100 text-green-800 border-green-200';
      case 'meal_planning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sleep_optimization': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'sleep_hygiene': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nap_guidance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'bedtime_routine': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'social_connection': return 'bg-green-100 text-green-800 border-green-200';
      case 'peer_support': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'family_time': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'friend_interaction': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hobby_engagement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'creative_activity': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'music_therapy': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'art_therapy': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'environment_optimization': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'space_organization': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lighting_adjustment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'noise_control': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'time_management': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break_scheduling': return 'bg-green-100 text-green-800 border-green-200';
      case 'workload_balancing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'priority_setting': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cognitive_techniques': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'positive_thinking': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'gratitude_practice': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'goal_reframing': return 'bg-green-100 text-green-800 border-green-200';
      case 'sensory_therapy': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'aromatherapy': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sound_therapy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'visual_calm': return 'bg-green-100 text-green-800 border-green-200';
      case 'professional_support': return 'bg-red-100 text-red-800 border-red-200';
      case 'counseling_referral': return 'bg-red-100 text-red-800 border-red-200';
      case 'therapy_suggestion': return 'bg-red-100 text-red-800 border-red-200';
      case 'crisis_support': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-pink-100 text-pink-800 border-pink-200';
    }
  };

  const getCategoryIcon = (category: WellnessCategory) => {
    switch (category) {
      case 'mental_health': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'physical_health': return <Activity className="w-5 h-5 text-green-500" />;
      case 'emotional_wellness': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'social_wellness': return <Users className="w-5 h-5 text-blue-500" />;
      case 'environmental_wellness': return <TreePine className="w-5 h-5 text-emerald-500" />;
      case 'intellectual_wellness': return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case 'spiritual_wellness': return <Compass className="w-5 h-5 text-purple-600" />;
      case 'occupational_wellness': return <Target className="w-5 h-5 text-orange-500" />;
      default: return <Heart className="w-5 h-5 text-pink-500" />;
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

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Stress & Wellness Management</h2>
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
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Stress & Wellness Management</h2>
              <p className="text-sm text-slate-600">Personalized wellness suggestions and stress management</p>
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
            <div className="text-2xl font-bold text-slate-900">{suggestions.length}</div>
            <div className="text-xs text-slate-600">Suggestions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{progress.length}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {stressHistory.length > 0 ? Math.round(stressHistory[stressHistory.length - 1].level) : 0}%
            </div>
            <div className="text-xs text-slate-600">Stress Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {suggestions.filter(s => s.priority === 'urgent').length}
            </div>
            <div className="text-xs text-slate-600">Urgent</div>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {['mental_health', 'physical_health', 'emotional_wellness', 'social_wellness', 'environmental_wellness', 'intellectual_wellness', 'spiritual_wellness', 'occupational_wellness'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category as WellnessCategory)}
            >
              {getCategoryIcon(category as WellnessCategory)}
              <span className="ml-1 capitalize">{category.replace('_', ' ')}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions ({filteredSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Progress ({progress.length})
          </TabsTrigger>
          <TabsTrigger value="stress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Stress Tracking
          </TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          {filteredSuggestions.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Suggestions Available</h3>
              <p className="text-sm text-slate-600">Complete wellness assessments to receive personalized suggestions.</p>
            </Card>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <WellnessSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAction={onSuggestionAction}
                getWellnessIcon={getWellnessIcon}
                getWellnessColor={getWellnessColor}
                getPriorityColor={getPriorityColor}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          {progress.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No Progress Data</h3>
              <p className="text-sm text-slate-600">Complete wellness activities to track your progress.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {progress.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">Wellness Activity Completed</h4>
                        <Badge className="bg-green-100 text-green-800">
                          {item.effectiveness}% effective
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Completed on {formatDate(item.completedAt)} at {formatTime(item.completedAt)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span>Mood: {item.moodBefore} → {item.moodAfter}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span>Stress: {item.stressBefore} → {item.stressAfter}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span>Energy: {item.energyBefore} → {item.energyAfter}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        {item.rating}/5 ⭐
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stress Tracking Tab */}
        <TabsContent value="stress" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Stress Level Tracking</h3>
            {stressHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-slate-600">No stress data available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stressHistory.slice(-10).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{entry.level}%</span>
                        <span className="text-sm text-slate-600">
                          {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                        </span>
                      </div>
                      {entry.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.triggers.map((trigger, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wellness Suggestion Card Component
interface WellnessSuggestionCardProps {
  suggestion: WellnessSuggestion;
  onAction?: (suggestion: WellnessSuggestion) => void;
  getWellnessIcon: (type: WellnessType) => JSX.Element;
  getWellnessColor: (type: WellnessType) => string;
  getPriorityColor: (priority: string) => string;
  formatTime: (date: Date) => string;
  formatDate: (date: Date) => string;
}

function WellnessSuggestionCard({
  suggestion,
  onAction,
  getWellnessIcon,
  getWellnessColor,
  getPriorityColor,
  formatTime,
  formatDate
}: WellnessSuggestionCardProps) {
  const IconComponent = getWellnessIcon(suggestion.type);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {IconComponent}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{suggestion.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(suggestion.priority)}>
                {suggestion.priority}
              </Badge>
              <Badge className={getWellnessColor(suggestion.type)}>
                {suggestion.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
          
          {/* Implementation Steps */}
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Steps:</h4>
            <ol className="text-sm text-slate-600 space-y-1">
              {suggestion.implementation.steps.slice(0, 3).map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-slate-400">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
              {suggestion.implementation.steps.length > 3 && (
                <li className="text-slate-400">+{suggestion.implementation.steps.length - 3} more steps</li>
              )}
            </ol>
          </div>

          {/* Expected Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 text-xs">
            <div>
              <div className="text-slate-500">Stress Reduction</div>
              <div className="font-medium text-green-600">
                +{suggestion.expectedBenefits.stressReduction}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Energy Boost</div>
              <div className="font-medium text-blue-600">
                +{suggestion.expectedBenefits.energyBoost}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Mood Improvement</div>
              <div className="font-medium text-purple-600">
                +{suggestion.expectedBenefits.moodImprovement}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Focus Enhancement</div>
              <div className="font-medium text-orange-600">
                +{suggestion.expectedBenefits.focusEnhancement}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Sleep Quality</div>
              <div className="font-medium text-indigo-600">
                +{suggestion.expectedBenefits.sleepQuality}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Overall Wellness</div>
              <div className="font-medium text-pink-600">
                +{suggestion.expectedBenefits.overallWellness}%
              </div>
            </div>
          </div>

          {/* Timing and Duration */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Duration: {suggestion.implementation.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              <span>Difficulty: {suggestion.implementation.difficulty}</span>
            </div>
            {suggestion.expiresAt && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Expires: {formatDate(suggestion.expiresAt)}</span>
              </div>
            )}
          </div>

          {/* Gamification */}
          {suggestion.gamification.points > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="font-medium">{suggestion.gamification.points} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span>{suggestion.gamification.badges.length} badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-green-500" />
                  <span>{suggestion.gamification.achievements.length} achievements</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => onAction?.(suggestion)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              Start Activity
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
