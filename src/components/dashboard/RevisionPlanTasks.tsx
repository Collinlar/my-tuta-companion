import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Timer
} from "lucide-react";
import { GeneratedPlan } from "@/services/aiContentGenerator";
import { Task } from "@/types/task";

interface RevisionPlanTasksProps {
  plan: GeneratedPlan;
  onBack: () => void;
  onTaskComplete: (taskId: string) => void;
}

export function RevisionPlanTasks({ plan, onBack, onTaskComplete }: RevisionPlanTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [studyTime, setStudyTime] = useState(0);

  // Filter tasks for revision plan (reading, practice, review)
  const revisionTasks = plan.tasks.filter(task => 
    ['reading', 'practice', 'review'].includes(task.type)
  );

  const currentTask = revisionTasks[currentTaskIndex];
  const progress = revisionTasks.length > 0 ? (completedTasks.size / revisionTasks.length) * 100 : 0;

  const handleTaskToggle = (taskId: string) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
      onTaskComplete(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  };

  const startStudySession = () => {
    setIsStudying(true);
    setStudyTime(0);
    // Start timer
    const interval = setInterval(() => {
      setStudyTime(prev => prev + 1);
    }, 1000);
    
    // Store interval to clear later
    (window as any).studyInterval = interval;
  };

  const pauseStudySession = () => {
    setIsStudying(false);
    if ((window as any).studyInterval) {
      clearInterval((window as any).studyInterval);
    }
  };

  const resetStudySession = () => {
    setIsStudying(false);
    setStudyTime(0);
    if ((window as any).studyInterval) {
      clearInterval((window as any).studyInterval);
    }
  };

  const nextTask = () => {
    if (currentTaskIndex < revisionTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const previousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTaskIcon = (task: Task) => {
    switch (task.type) {
      case 'reading':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'practice':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'review':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'reading':
        return 'Reading';
      case 'practice':
        return 'Practice';
      case 'review':
        return 'Review';
      default:
        return 'Task';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Comprehensive Revision Plan
            </h1>
            <p className="text-muted-foreground">Master {plan.topic} through structured study</p>
          </div>
        </div>
        
        {/* Study Timer */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary">
                {formatTime(studyTime)}
              </div>
              <div className="text-xs text-muted-foreground">Study Time</div>
            </div>
            <div className="flex gap-2">
              {!isStudying ? (
                <Button size="sm" onClick={startStudySession}>
                  <Play className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={pauseStudySession}>
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={resetStudySession}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Revision Progress</span>
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{completedTasks.size}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">{revisionTasks.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{revisionTasks.length - completedTasks.size}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Study Tasks</h2>
          {revisionTasks.map((task, index) => (
            <Card 
              key={task.id} 
              className={`p-4 cursor-pointer transition-all ${
                index === currentTaskIndex ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setCurrentTaskIndex(index)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTasks.has(task.id)}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTaskIcon(task)}
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {getTaskTypeLabel(task.type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.timeEstimate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {task.learningObjectives.length} objectives
                    </div>
                    {task.resources.length > 0 && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {task.resources.length} resources
                      </div>
                    )}
                  </div>
                </div>
                {completedTasks.has(task.id) && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Current Task Focus */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Current Task</h2>
          {currentTask && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {getTaskIcon(currentTask)}
                <h3 className="font-semibold">{currentTask.title}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{currentTask.description}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Learning Objectives:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentTask.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-3 h-3 mt-1 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {currentTask.prerequisites && currentTask.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Prerequisites:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {currentTask.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentTask.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Resources:</h4>
                    <div className="space-y-2">
                      {currentTask.resources.slice(0, 3).map((resource) => (
                        <div key={resource.id} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {resource.title}
                        </div>
                      ))}
                      {currentTask.resources.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{currentTask.resources.length - 3} more resources
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={previousTask}
                  disabled={currentTaskIndex === 0}
                >
                  Previous
                </Button>
                <Button 
                  size="sm" 
                  onClick={nextTask}
                  disabled={currentTaskIndex === revisionTasks.length - 1}
                >
                  Next Task
                </Button>
              </div>
            </Card>
          )}
          
          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Study Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Task:</span>
                <span className="font-medium">{currentTaskIndex + 1} of {revisionTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Spent:</span>
                <span className="font-medium">{formatTime(studyTime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion:</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
