import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Trophy,
  Clock,
  Star,
  Target,
  Zap,
  Award,
  Timer,
  Users
} from 'lucide-react';

interface ContestProblem {
  problem: string;
  solution?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category?: string;
  hints?: string[];
  timeLimit?: number; // in minutes
}

interface InteractiveContestProps {
  problems: ContestProblem[];
  title: string;
  totalTimeLimit?: number; // in minutes
  onComplete?: (results: ContestResults) => void;
  studentMode?: boolean;
}

interface ContestResults {
  totalProblems: number;
  solvedProblems: number;
  totalScore: number;
  maxScore: number;
  timeSpent: number;
  solutions: { [key: number]: string };
  rankings?: { name: string; score: number }[];
}

export function InteractiveContest({ 
  problems, 
  title, 
  totalTimeLimit, 
  onComplete, 
  studentMode = false 
}: InteractiveContestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [solutions, setSolutions] = useState<{ [key: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(totalTimeLimit ? totalTimeLimit * 60 : null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHints, setShowHints] = useState<{ [key: number]: boolean }>({});
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleComplete();
    }
  }, [timeRemaining, isCompleted]);

  const handleSolutionChange = (solution: string) => {
    setSolutions({
      ...solutions,
      [currentIndex]: solution
    });
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    const timeSpent = Date.now() - startTime;
    const solvedCount = Object.keys(solutions).length;
    const totalScore = Object.values(solutions).length * 10; // Simple scoring for now

    const results: ContestResults = {
      totalProblems: problems.length,
      solvedProblems: solvedCount,
      totalScore,
      maxScore: problems.reduce((sum, problem) => sum + problem.points, 0),
      timeSpent: Math.round(timeSpent / 1000),
      solutions
    };

    setIsCompleted(true);
    onComplete?.(results);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSolutions({});
    setTimeRemaining(totalTimeLimit ? totalTimeLimit * 60 : null);
    setIsCompleted(false);
    setShowHints({});
    setStartTime(Date.now());
  };

  const toggleHint = (problemIndex: number) => {
    setShowHints({
      ...showHints,
      [problemIndex]: !showHints[problemIndex]
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCompleted) {
    const solvedCount = Object.keys(solutions).length;
    const totalScore = problems.reduce((sum, problem) => sum + problem.points, 0);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-2">
                  Contest Complete! 🏆
                </h3>
                <p className="text-yellow-700">
                  You solved {solvedCount} out of {problems.length} problems!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {solvedCount}
              </div>
              <div className="text-sm text-slate-600">Problems Solved</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {totalScore}
              </div>
              <div className="text-sm text-slate-600">Total Score</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round((solvedCount / problems.length) * 100)}%
              </div>
              <div className="text-sm text-slate-600">Completion</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {Math.round((Date.now() - startTime) / 1000)}s
              </div>
              <div className="text-sm text-slate-600">Time Used</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
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
            <Trophy className="w-6 h-6 text-yellow-600" />
            {title}
          </h2>
          <p className="text-slate-600">
            Solve problems to earn points and compete!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">
            <Target className="w-3 h-3 mr-1" />
            Contest Mode
          </Badge>
          {timeRemaining !== null && (
            <Badge className={timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              <Timer className="w-3 h-3 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Problem Card */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              Problem {currentIndex + 1} of {problems.length}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(currentProblem.difficulty)}>
                {currentProblem.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Star className="w-3 h-3 mr-1" />
                {currentProblem.points} points
              </Badge>
              {currentProblem.category && (
                <Badge variant="outline">{currentProblem.category}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium text-slate-900 bg-slate-50 p-4 rounded-lg">
            {currentProblem.problem}
          </div>

          {/* Hints */}
          {currentProblem.hints && currentProblem.hints.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => toggleHint(currentIndex)}
                className="text-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                {showHints[currentIndex] ? 'Hide Hints' : 'Show Hints'}
              </Button>
              {showHints[currentIndex] && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Hints:</h4>
                  <ul className="space-y-1">
                    {currentProblem.hints.map((hint, index) => (
                      <li key={index} className="text-blue-800 text-sm">
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Solution Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Your Solution:
            </label>
            <Textarea
              placeholder="Enter your solution, approach, or answer here..."
              value={solutions[currentIndex] || ''}
              onChange={(e) => handleSolutionChange(e.target.value)}
              className="min-h-32"
            />
          </div>

          {/* Problem Status */}
          <div className="flex items-center gap-2">
            {solutions[currentIndex] ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Solution Submitted
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Not Solved
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">
            {Object.keys(solutions).length} of {problems.length} solved
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">
              {problems.reduce((sum, problem) => sum + problem.points, 0)} points available
            </span>
          </div>
        </div>

        <Button 
          onClick={handleNext}
          disabled={currentIndex === problems.length - 1}
        >
          {currentIndex === problems.length - 1 ? 'Complete Contest' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Problem Overview */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Problem Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {problems.map((problem, index) => (
              <div key={index} className="text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium mb-1 ${
                  solutions[index] ? 'bg-green-100 text-green-800' :
                  index === currentIndex ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="text-xs text-slate-600">
                  {problem.difficulty}
                </div>
                <div className="text-xs font-medium text-slate-900">
                  {problem.points}pts
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
