import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Flag, ChevronRight, ChevronLeft, Flame, Zap, Star } from "lucide-react";
import { useGameification } from "@/hooks/useGameification";
import { GameifiedFeedback } from "./GamefiedFeedback";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: string;
}

interface ContestQuestionProps {
  contest: {
    title: string;
    duration: number; // minutes
    questions: number;
  };
  questions: Question[];
  onComplete: (score: number, answers: number[]) => void;
  onQuit: () => void;
}

export function ContestQuestion({ contest, questions, onComplete, onQuit }: ContestQuestionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(contest.duration * 60); // convert to seconds
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [feedbackState, setFeedbackState] = useState<{isCorrect: boolean} | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  const { 
    gameState, 
    recentAchievements, 
    showCombo, 
    answerQuestion, 
    resetGame,
    dismissAchievement 
  } = useGameification(questions.length);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Load saved answer for current question
    setSelectedOption(answers[currentQuestionIndex]);
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex, answers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up, auto-submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
    
    // Immediate feedback
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;
    const timeLeftForQuestion = Math.max(0, 120 - Math.floor(timeSpent / 1000)); // Assume 2 min per question
    
    const result = answerQuestion(isCorrect, timeLeftForQuestion);
    setFeedbackState({ isCorrect });
    
    // Auto advance after feedback (optional)
    setTimeout(() => {
      setFeedbackState(null);
    }, 1500);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Use gamified score
    onComplete(gameState.correctAnswers, answers);
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / (contest.duration * 60)) * 100;
    if (percentage > 50) return "text-success";
    if (percentage > 25) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Gamification */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{contest.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${getTimeColor()}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onQuit}>
              <Flag className="w-4 h-4 mr-2" />
              Quit
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-4 animate-progress-fill" />
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <div className={`text-lg font-bold animate-score-bounce ${gameState.score > 0 ? 'text-primary' : ''}`}>
            {gameState.score}
          </div>
          <div className="text-xs text-muted-foreground">Score</div>
        </Card>
        <Card className={`p-3 text-center ${gameState.streak >= 3 ? 'glow-streak' : ''}`}>
          <div className="flex items-center justify-center gap-1">
            {gameState.streak >= 3 && <Flame className="w-4 h-4 text-orange-500" />}
            <span className="text-lg font-bold">{gameState.streak}</span>
          </div>
          <div className="text-xs text-muted-foreground">Streak</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {gameState.multiplier > 1 && <Zap className="w-4 h-4 text-yellow-500" />}
            <span className="text-lg font-bold">{gameState.multiplier}x</span>
          </div>
          <div className="text-xs text-muted-foreground">Multiplier</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-blue-500" />
            <span className="text-lg font-bold">{gameState.achievements.length}</span>
          </div>
          <div className="text-xs text-muted-foreground">Achievements</div>
        </Card>
      </div>

      {/* Question */}
      <Card className="p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{currentQuestion.subject}</Badge>
            <Badge variant={currentQuestion.difficulty === 'Easy' ? 'secondary' : 
                           currentQuestion.difficulty === 'Medium' ? 'default' : 'destructive'}>
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <h2 className="text-xl font-medium leading-relaxed">{currentQuestion.question}</h2>
        </div>

        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = feedbackState && answers[currentQuestionIndex] !== -1;
            
            return (
              <button
                key={index}
                onClick={() => !showResult && handleOptionSelect(index)}
                disabled={showResult}
                className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-200 ${
                  showResult
                    ? isCorrect 
                      ? 'border-green-500 bg-green-50 shadow-green-200 shadow-lg'
                      : isSelected 
                        ? 'border-red-500 bg-red-50 shadow-red-200 shadow-lg'
                        : 'border-slate-200 bg-slate-50'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-blue-200 shadow-md'
                      : 'border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-500 text-white scale-110'
                        : isSelected
                          ? 'border-red-500 bg-red-500 text-white scale-110'
                          : 'border-slate-300 bg-white'
                      : isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-300 bg-white'
                  }`}>
                    {showResult && isCorrect ? '✓' : showResult && isSelected ? '✗' : String.fromCharCode(65 + index)}
                  </div>
                  <span className={`text-base font-medium transition-all ${
                    showResult && isSelected && !isCorrect ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}>
                    {option}
                  </span>
                  {showResult && isCorrect && (
                    <div className="ml-auto">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Correct Answer
                      </Badge>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {answers.filter(a => a !== -1).length} of {questions.length} answered
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selectedOption === -1} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2"
            >
              Submit Contest
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={selectedOption === -1} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>

      {/* Question Navigator */}
      <Card className="p-6 border border-slate-200">
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Question Navigator</h3>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
                index === currentQuestionIndex
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                  : answers[index] !== -1
                  ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Current
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Answered
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            Not answered
          </div>
        </div>
      </Card>

      {/* Inline Feedback */}
      {feedbackState && (
        <Card className={`p-6 border-2 animate-in slide-in-from-top-2 ${
          feedbackState.isCorrect 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
              feedbackState.isCorrect 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {feedbackState.isCorrect ? '✓' : '✗'}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                feedbackState.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedbackState.isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              {feedbackState.isCorrect && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-sm text-green-700">
                    +{gameState.score} points
                  </div>
                  {gameState.streak >= 3 && (
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">{gameState.streak} streak</span>
                    </div>
                  )}
                  {gameState.multiplier > 1 && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {gameState.multiplier}x
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-600 mt-2">
                {currentQuestion.explanation}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFeedbackState(null)}
              className="text-slate-500 hover:text-slate-700"
            >
              ×
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}