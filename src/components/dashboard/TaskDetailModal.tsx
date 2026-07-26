import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ResourceCard } from "@/components/ui/resource-card";
import { 
  Clock, 
  Target, 
  BookOpen, 
  Play, 
  CheckCircle, 
  ExternalLink,
  Brain,
  Trophy
} from "lucide-react";
import { Task, Resource } from "@/types/task";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onStartStudy: (task: Task) => void;
}

export function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onComplete, 
  onStartStudy 
}: TaskDetailModalProps) {
  const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());

  if (!task) return null;

  const handleResourceComplete = (resourceId: string) => {
    const newCompleted = new Set(completedResources);
    if (newCompleted.has(resourceId)) {
      newCompleted.delete(resourceId);
    } else {
      newCompleted.add(resourceId);
    }
    setCompletedResources(newCompleted);
  };

  const handleResourceOpen = (resource: Resource) => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'practice': return <Play className="w-5 h-5" />;
      case 'review': return <Brain className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'flashcard': return <BookOpen className="w-5 h-5" />;
      case 'contest': return <Trophy className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resourceProgress = (completedResources.size / task.resources.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              {getTaskIcon(task.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{task.title}</h2>
              <p className="text-sm text-muted-foreground font-normal">{task.description}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{task.timeEstimate}</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${getDifficultyColor(task.difficulty)}`}
            >
              {task.difficulty}
            </Badge>
            <Badge variant="outline">
              {task.type}
            </Badge>
          </div>

          {/* Learning Objectives */}
          {task.learningObjectives.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Learning Objectives
              </h3>
              <ul className="space-y-2">
                {task.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {task.prerequisites && task.prerequisites.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {task.prerequisites.map((prereq, index) => (
                  <Badge key={index} variant="secondary">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Study Resources</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {completedResources.size} of {task.resources.length} completed
                </span>
                <Progress value={resourceProgress} className="w-20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {task.resources.map((resource) => (
                <div key={resource.id} className="relative">
                  <ResourceCard 
                    resource={resource} 
                    onOpen={handleResourceOpen}
                  />
                  <div className="absolute top-2 right-2">
                    <Checkbox
                      checked={completedResources.has(resource.id)}
                      onCheckedChange={() => handleResourceComplete(resource.id)}
                      className="bg-white/80"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onComplete(task.id)}
                id="task-complete"
              />
              <label htmlFor="task-complete" className="text-sm font-medium">
                Mark as completed
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => onStartStudy(task)}>
                <Play className="w-4 h-4 mr-2" />
                Start Studying
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
