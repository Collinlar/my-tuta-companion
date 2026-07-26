import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Clock, Calendar, Brain, CheckCircle, HelpCircle, RotateCcw, Trophy, ExternalLink } from "lucide-react";
import { TaskDetailModal } from "./TaskDetailModal";
import { Task } from "@/types/task";
import { quadraticEquationsTasks, physicsTasks, chemistryTasks, enhanceTasksWithAIResources } from "@/data/sampleResources";

interface RevisionPlanDetailProps {
  plan: {
    subject: string;
    topic: string;
    progress: number;
    dueToday: number;
    totalTasks: number;
    nextTask: string;
    timeEstimate: string;
  };
  onBack: () => void;
  onStartStudy: () => void;
  onTaskComplete: (taskId: string) => void;
  onStartQuiz: () => void;
  onStartFlashcards: () => void;
  onStartContest: () => void;
  onTaskInteract: (taskId: string, taskType: Task['type']) => void;
}

export function RevisionPlanDetail({ plan, onBack, onStartStudy, onTaskComplete, onStartQuiz, onStartFlashcards, onStartContest, onTaskInteract }: RevisionPlanDetailProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  // Get appropriate task data based on topic
  const getBaseTasksForTopic = (subject: string, topic: string): Task[] => {
    let baseTasks: Task[] = [];
    
    if (topic === 'Quadratic Equations') baseTasks = quadraticEquationsTasks;
    else if (topic === "Newton's Laws") baseTasks = physicsTasks;
    else if (topic === 'Periodic Table') baseTasks = chemistryTasks;
    else {
      // Fallback to basic tasks for other topics
      baseTasks = [
        { id: '1', title: 'Read chapter on topic', completed: true, timeEstimate: '20 min', type: 'reading', description: 'Basic reading task', difficulty: 'beginner', learningObjectives: [], resources: [] },
        { id: '2', title: 'Solve practice problems', completed: true, timeEstimate: '30 min', type: 'practice', description: 'Basic practice task', difficulty: 'intermediate', learningObjectives: [], resources: [] },
        { id: '3', title: 'Review key concepts', completed: true, timeEstimate: '15 min', type: 'review', description: 'Basic review task', difficulty: 'intermediate', learningObjectives: [], resources: [] },
        { id: '4', title: 'Practice exercises', completed: false, timeEstimate: '45 min', type: 'practice', description: 'Basic practice task', difficulty: 'intermediate', learningObjectives: [], resources: [] },
        { id: '5', title: 'Take practice quiz', completed: false, timeEstimate: '25 min', type: 'quiz', description: 'Basic quiz task', difficulty: 'intermediate', learningObjectives: [], resources: [] },
      ];
    }
    
    return baseTasks;
  };

  // Load tasks asynchronously
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoadingTasks(true);
      try {
        const baseTasks = getBaseTasksForTopic(plan.subject, plan.topic);
        const enhancedTasks = await enhanceTasksWithAIResources(baseTasks);
        setTasks(enhancedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        // Fallback to base tasks if enhancement fails
        const baseTasks = getBaseTasksForTopic(plan.subject, plan.topic);
        setTasks(baseTasks);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadTasks();
  }, [plan.subject, plan.topic]);

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'reading': return '📖';
      case 'practice': return '✏️';
      case 'review': return '🔍';
      case 'quiz': return '❓';
      case 'flashcard': return '🗂️';
      case 'contest': return '🏆';
      default: return '📝';
    }
  };

  const handleTaskClick = (task: Task) => {
    // For quiz, flashcard, and contest tasks, directly open the AI-generated resource
    if (['quiz', 'flashcard', 'contest'].includes(task.type)) {
      handleTaskInteraction(task);
    } else {
      // For other tasks, show the detail modal
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleStartStudyFromModal = (task: Task) => {
    setIsTaskModalOpen(false);
    onTaskInteract(task.id, task.type);
  };

  const handleTaskInteraction = (task: Task) => {
    // Find AI-generated resource for this task type
    const aiResource = task.resources.find(resource => 
      resource.type === task.type && resource.source === 'AI Generated'
    );
    
    if (aiResource) {
      // Open the AI-generated resource
      if (task.type === 'quiz') {
        onStartQuiz();
      } else if (task.type === 'flashcard') {
        onStartFlashcards();
      } else if (task.type === 'contest') {
        onStartContest();
      }
    } else {
      // Fallback to general task interaction
      onTaskInteract(task.id, task.type);
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercent = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (isLoadingTasks) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{plan.topic}</h1>
        <p className="text-muted-foreground">{plan.subject}</p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{completedTasks}</div>
            <div className="text-sm text-muted-foreground">Tasks done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{tasks.length - completedTasks}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {tasks.filter(t => !t.completed).reduce((acc, t) => acc + parseInt(t.timeEstimate), 0)} min
            </div>
            <div className="text-sm text-muted-foreground">Time left</div>
          </div>
        </div>
        <Progress value={progressPercent} />
      </Card>

      {/* Tasks List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Study Tasks</h2>
          <Button onClick={onStartStudy}>
            <Brain className="w-4 h-4 mr-2" />
            Continue Studying
          </Button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-lg border transition-all ${
                task.completed ? 'bg-muted/30' : 'bg-card hover:bg-muted/50 cursor-pointer'
              }`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onTaskComplete(task.id)}
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div className="text-2xl">{getTaskIcon(task.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    {task.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {task.timeEstimate}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${
                      task.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      task.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.difficulty}
                    </Badge>
                    {task.resources.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        {task.resources.length} resources
                      </div>
                    )}
                    {['quiz', 'flashcard', 'contest'].includes(task.type) && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Brain className="w-3 h-3" />
                        AI Generated
                      </div>
                    )}
                    {!task.completed && (
                      <span className="text-xs text-primary font-medium">
                        {['quiz', 'flashcard', 'contest'].includes(task.type) 
                          ? 'Click to start →' 
                          : 'Click to view details →'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Study Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold">Practice Quiz</h3>
              <p className="text-sm text-muted-foreground">Test your knowledge</p>
            </div>
          </div>
          <Button onClick={onStartQuiz} className="w-full" size="sm">
            Start Quiz
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold">Flashcards</h3>
              <p className="text-sm text-muted-foreground">Review key concepts</p>
            </div>
          </div>
          <Button onClick={onStartFlashcards} className="w-full" size="sm" variant="outline">
            Study Cards
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold">Contests</h3>
              <p className="text-sm text-muted-foreground">Compete & learn</p>
            </div>
          </div>
          <Button onClick={onStartContest} className="w-full" size="sm" variant="outline">
            Join Contest
          </Button>
        </Card>
      </div>

      {/* Study Schedule */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Recommended Schedule</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Today</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Practice solving equations</span>
                <span className="text-muted-foreground">45 min</span>
              </div>
              <div className="flex justify-between">
                <span>Take practice quiz</span>
                <span className="text-muted-foreground">25 min</span>
              </div>
              <div className="flex justify-between">
                <span>Review with flashcards</span>
                <span className="text-muted-foreground">20 min</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Tomorrow</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Join math contest</span>
                <span className="text-muted-foreground">30 min</span>
              </div>
              <div className="flex justify-between">
                <span>Final assessment prep</span>
                <span className="text-muted-foreground">40 min</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleTaskModalClose}
        onComplete={onTaskComplete}
        onStartStudy={handleStartStudyFromModal}
      />
    </div>
  );
}