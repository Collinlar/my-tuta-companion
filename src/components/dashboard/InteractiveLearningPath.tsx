import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronRight, 
  CheckCircle, 
  Circle,
  Compass,
  Target,
  Clock,
  Star,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Award,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { ResourceCard, ResourceGrid } from './ResourceCard';
import { Resource } from '@/types/task';

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'video' | 'exercise' | 'quiz' | 'project';
  estimatedTime: number; // in minutes
  completed: boolean;
  resources?: Resource[];
  prerequisites?: string[];
}

interface InteractiveLearningPathProps {
  milestones: LearningMilestone[];
  title: string;
  description?: string;
  estimatedDuration?: number; // in minutes
  onComplete?: (results: LearningPathResults) => void;
  studentMode?: boolean;
}

interface LearningPathResults {
  totalMilestones: number;
  completedMilestones: number;
  timeSpent: number;
  completionRate: number;
  milestones: { [key: string]: { completed: boolean; timeSpent: number } };
}

export function InteractiveLearningPath({ 
  milestones, 
  title, 
  description,
  estimatedDuration,
  onComplete, 
  studentMode = false 
}: InteractiveLearningPathProps) {
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState<{ [key: string]: boolean }>({});
  const [timeSpent, setTimeSpent] = useState<{ [key: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [milestoneStartTime, setMilestoneStartTime] = useState<number>(Date.now());

  const currentMilestoneData = milestones[currentMilestone];
  const progress = (Object.keys(completedMilestones).length / milestones.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
    setMilestoneStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (currentMilestoneData && !isCompleted) {
      setMilestoneStartTime(Date.now());
    }
  }, [currentMilestone, currentMilestoneData, isCompleted]);

  const handleMilestoneComplete = (milestoneId: string) => {
    const newCompleted = {
      ...completedMilestones,
      [milestoneId]: true
    };
    
    const milestoneTimeSpent = Date.now() - milestoneStartTime;
    const newTimeSpent = {
      ...timeSpent,
      [milestoneId]: milestoneTimeSpent
    };

    setCompletedMilestones(newCompleted);
    setTimeSpent(newTimeSpent);

    // Check if all milestones are completed
    if (Object.keys(newCompleted).length === milestones.length) {
      handleComplete();
    }
  };

  const handleNext = () => {
    if (currentMilestone < milestones.length - 1) {
      setCurrentMilestone(currentMilestone + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentMilestone > 0) {
      setCurrentMilestone(currentMilestone - 1);
    }
  };

  const handleComplete = () => {
    const totalTimeSpent = Date.now() - startTime;
    
    const results: LearningPathResults = {
      totalMilestones: milestones.length,
      completedMilestones: Object.keys(completedMilestones).length,
      timeSpent: Math.round(totalTimeSpent / 1000),
      completionRate: (Object.keys(completedMilestones).length / milestones.length) * 100,
      milestones: Object.keys(completedMilestones).reduce((acc, id) => {
        acc[id] = {
          completed: completedMilestones[id],
          timeSpent: Math.round((timeSpent[id] || 0) / 1000)
        };
        return acc;
      }, {} as { [key: string]: { completed: boolean; timeSpent: number } })
    };

    setIsCompleted(true);
    onComplete?.(results);
  };

  const handleRestart = () => {
    setCurrentMilestone(0);
    setCompletedMilestones({});
    setTimeSpent({});
    setIsCompleted(false);
    setStartTime(Date.now());
    setMilestoneStartTime(Date.now());
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'reading': return '📖';
      case 'video': return '🎥';
      case 'exercise': return '💪';
      case 'quiz': return '❓';
      case 'project': return '🚀';
      default: return '📚';
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case 'reading': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      case 'project': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (isCompleted) {
    const completedCount = Object.keys(completedMilestones).length;
    const totalEstimatedTime = milestones.reduce((sum, milestone) => sum + milestone.estimatedTime, 0);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                  Learning Path Complete! 🎓
                </h3>
                <p className="text-blue-700">
                  Congratulations! You've completed {completedCount} out of {milestones.length} milestones!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {completedCount}
              </div>
              <div className="text-sm text-slate-600">Milestones Completed</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round((completedCount / milestones.length) * 100)}%
              </div>
              <div className="text-sm text-slate-600">Completion Rate</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round((Date.now() - startTime) / 1000 / 60)}m
              </div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatTime(totalEstimatedTime)}
              </div>
              <div className="text-sm text-slate-600">Estimated Duration</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Review Learning Path
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-600" />
            {title}
          </h2>
          {description && (
            <p className="text-slate-600">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-100 text-teal-800">
            <Target className="w-3 h-3 mr-1" />
            Learning Path
          </Badge>
          {estimatedDuration && (
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(estimatedDuration)}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Learning Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Current Milestone */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span className="text-3xl">{getMilestoneIcon(currentMilestoneData.type)}</span>
              <div>
                <div>Milestone {currentMilestone + 1} of {milestones.length}</div>
                <div className="text-lg font-normal text-slate-900">{currentMilestoneData.title}</div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getMilestoneColor(currentMilestoneData.type)}>
                {currentMilestoneData.type}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(currentMilestoneData.estimatedTime)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-slate-700 leading-relaxed">
            {currentMilestoneData.description}
          </div>

          {/* Resources */}
          {currentMilestoneData.resources && currentMilestoneData.resources.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Learning Resources:</h4>
              <ResourceGrid 
                resources={currentMilestoneData.resources}
                title=""
              />
            </div>
          )}

          {/* Completion Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              id={`milestone-${currentMilestoneData.id}`}
              checked={completedMilestones[currentMilestoneData.id] || false}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleMilestoneComplete(currentMilestoneData.id);
                }
              }}
            />
            <label htmlFor={`milestone-${currentMilestoneData.id}`} className="text-sm font-medium text-green-800 cursor-pointer">
              Mark this milestone as completed
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentMilestone === 0}
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {Object.keys(completedMilestones).length} of {milestones.length} completed
          </span>
        </div>

        <Button 
          onClick={handleNext}
          disabled={currentMilestone === milestones.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Milestone Overview */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Learning Path Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                index === currentMilestone ? 'bg-blue-50 border-blue-200' :
                completedMilestones[milestone.id] ? 'bg-green-50 border-green-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  {completedMilestones[milestone.id] ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-lg">{getMilestoneIcon(milestone.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{milestone.title}</div>
                  <div className="text-sm text-slate-600">{milestone.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getMilestoneColor(milestone.type)}>
                    {milestone.type}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    {formatTime(milestone.estimatedTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
