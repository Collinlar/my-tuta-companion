import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/ui/resource-card";
import { Clock, CheckCircle, X, Pause, Play, ExternalLink, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { quadraticEquationsTasks, physicsTasks, chemistryTasks } from "@/data/sampleResources";

interface StudySessionProps {
  plan: {
    subject: string;
    topic: string;
    nextTask: string;
    timeEstimate: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export function StudySession({ plan, onComplete, onCancel }: StudySessionProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const { toast } = useToast();

  // Get current task based on plan topic
  const getCurrentTask = (subject: string, topic: string): Task | null => {
    let taskList: Task[] = [];
    
    if (topic === 'Quadratic Equations') taskList = quadraticEquationsTasks;
    else if (topic === "Newton's Laws") taskList = physicsTasks;
    else if (topic === 'Periodic Table') taskList = chemistryTasks;
    
    return taskList.length > 0 
      ? taskList.find(task => !task.completed) || taskList[0]
      : null;
  };

  const currentTask = getCurrentTask(plan.subject, plan.topic);

  useEffect(() => {
    // Parse time estimate and set initial time
    const minutes = parseInt(plan.timeEstimate) || 30;
    setTimeLeft(minutes * 60);
  }, [plan.timeEstimate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false);
            toast({
              title: "Study session complete!",
              description: "Great job! Time to take a break.",
            });
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft === 0) {
      clearInterval(interval!);
    }
    
    return () => clearInterval(interval!);
  }, [isActive, isPaused, timeLeft, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleComplete = () => {
    setIsActive(false);
    toast({
      title: "Task completed!",
      description: "Moving on to the next task in your revision plan.",
    });
    onComplete();
  };

  const handleResourceOpen = (resource: any) => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const totalTime = parseInt(plan.timeEstimate) * 60 || 1800;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Study Session</h1>
        <p className="text-muted-foreground">{plan.subject} - {plan.topic}</p>
      </div>

      <Card className="p-8 text-center">
        <Badge variant="outline" className="mb-4">{plan.nextTask}</Badge>
        
        {currentTask && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">{currentTask.description}</p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentTask.type}
              </Badge>
              <Badge variant="outline" className={`text-xs ${
                currentTask.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                currentTask.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentTask.difficulty}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="text-6xl font-mono font-bold text-primary mb-6">
          {formatTime(timeLeft)}
        </div>
        
        <Progress value={progress} className="mb-6" />
        
        <div className="flex justify-center gap-4 mb-6">
          {!isActive ? (
            <Button onClick={handleStart} size="lg">
              <Play className="w-5 h-5 mr-2" />
              Start Session
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" size="lg">
              <Pause className="w-5 h-5 mr-2" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          <Button onClick={handleComplete} variant="default" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Task
          </Button>
        </div>

        {currentTask && currentTask.resources.length > 0 && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowResources(!showResources)}
              className="mb-4"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {showResources ? 'Hide' : 'Show'} Resources ({currentTask.resources.length})
            </Button>
          </div>
        )}
        
        <Button onClick={onCancel} variant="ghost">
          <X className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </Card>

      {/* Resources Section */}
      {showResources && currentTask && currentTask.resources.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Study Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTask.resources.map((resource) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onOpen={handleResourceOpen}
              />
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Study Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Take notes as you study to reinforce learning</li>
          <li>• Focus on understanding concepts, not just memorizing</li>
          <li>• Take a 5-minute break every 25 minutes</li>
          <li>• Review previous topics to strengthen retention</li>
          {currentTask && currentTask.resources.length > 0 && (
            <li>• Use the provided resources to enhance your understanding</li>
          )}
        </ul>
      </Card>
    </div>
  );
}