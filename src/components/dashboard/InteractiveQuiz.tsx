import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Clock,
  Trophy,
  Star,
  Brain,
  Timer
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points?: number;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  title: string;
  timeLimit?: number; // in minutes
  onComplete?: (results: QuizResults) => void;
  studentMode?: boolean;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalScore: number;
  maxScore: number;
  timeSpent: number;
  accuracy: number;
  answers: { [key: number]: string | number };
}

export function InteractiveQuiz({ 
  questions, 
  title, 
  timeLimit, 
  onComplete, 
  studentMode = false 
}: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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

  const handleAnswer = (answer: string | number) => {
    setAnswers({
      ...answers,
      [currentIndex]: answer
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
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
    let correctCount = 0;
    let totalScore = 0;
    let maxScore = 0;

    console.log('Quiz completion - answers:', answers);
    console.log('Quiz completion - questions:', questions);

    questions.forEach((question, index) => {
      maxScore += question.points || 1;
      const userAnswer = answers[index];
      
      if (userAnswer !== undefined) {
        let isCorrect = false;
        
        // Handle different answer types
        if (question.type === 'multiple-choice') {
          // For multiple choice, compare the selected option with the correct answer
          const correctAnswerIndex = typeof question.correctAnswer === 'number' ? question.correctAnswer : 0;
          const userAnswerIndex = question.options?.indexOf(userAnswer.toString()) ?? -1;
          isCorrect = userAnswerIndex === correctAnswerIndex;
        } else if (question.type === 'true-false') {
          // For true/false, compare string values
          const userAnswerBool = userAnswer.toString() === 'true';
          const correctAnswerBool = typeof question.correctAnswer === 'boolean' 
            ? question.correctAnswer 
            : question.correctAnswer?.toString() === 'true';
          isCorrect = userAnswerBool === correctAnswerBool;
        } else if (question.type === 'short-answer') {
          // For short answer, do a case-insensitive comparison
          const userAnswerStr = userAnswer.toString().toLowerCase().trim();
          const correctAnswerStr = question.correctAnswer.toString().toLowerCase().trim();
          isCorrect = userAnswerStr === correctAnswerStr;
        }
        
        if (isCorrect) {
          correctCount++;
          totalScore += question.points || 1;
        }
        
        console.log(`Question ${index + 1}: User: ${userAnswer}, Correct: ${question.correctAnswer}, IsCorrect: ${isCorrect}`);
      }
    });

    const results: QuizResults = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: questions.length - correctCount - (questions.length - Object.keys(answers).length),
      skippedQuestions: questions.length - Object.keys(answers).length,
      totalScore,
      maxScore,
      timeSpent: Math.round(timeSpent / 1000),
      accuracy: questions.length > 0 ? (correctCount / questions.length) * 100 : 0,
      answers
    };

    console.log('Quiz results:', results);
    setIsCompleted(true);
    onComplete?.(results);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setTimeRemaining(timeLimit ? timeLimit * 60 : null);
    setIsCompleted(false);
    setShowResults(false);
    setStartTime(Date.now());
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return '🔘';
      case 'true-false': return '✅';
      case 'short-answer': return '✏️';
      default: return '❓';
    }
  };

  const renderQuestion = () => {
    const userAnswer = answers[currentIndex];

    // Ensure we have proper question structure
    const question = {
      ...currentQuestion,
      type: currentQuestion.type || 'multiple-choice',
      options: currentQuestion.options || [
        'Option A',
        'Option B', 
        'Option C',
        'Option D'
      ],
      correctAnswer: currentQuestion.correctAnswer ?? 0,
      explanation: currentQuestion.explanation || 'No explanation provided.',
      points: currentQuestion.points || 1
    };

    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getQuestionTypeIcon(question.type)}</span>
              Question {currentIndex + 1} of {questions.length}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </Badge>
              {timeRemaining !== null && (
                <Badge className={timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  <Timer className="w-3 h-3 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium text-slate-900">
            {question.question}
          </div>

          {question.type === 'multiple-choice' && (
            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={(value) => handleAnswer(value)}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-slate-700 cursor-pointer flex-1">
                    <span className="font-medium text-slate-500 mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'true-false' && (
            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={(value) => handleAnswer(value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="text-slate-700 cursor-pointer flex-1">
                  <span className="font-medium text-slate-500 mr-2">A.</span>
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="text-slate-700 cursor-pointer flex-1">
                  <span className="font-medium text-slate-500 mr-2">B.</span>
                  False
                </Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'short-answer' && (
            <div className="space-y-2">
              <Textarea
                placeholder="Enter your answer here..."
                value={userAnswer?.toString() || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="min-h-24"
              />
              <p className="text-sm text-slate-500">Type your answer in the text box above.</p>
            </div>
          )}

          {showResults && question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isCompleted) {
    // Calculate correct answers using the same logic as handleComplete
    let correctCount = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer !== undefined) {
        let isCorrect = false;
        
        if (question.type === 'multiple-choice') {
          const correctAnswerIndex = typeof question.correctAnswer === 'number' ? question.correctAnswer : 0;
          const userAnswerIndex = question.options?.indexOf(userAnswer.toString()) ?? -1;
          isCorrect = userAnswerIndex === correctAnswerIndex;
        } else if (question.type === 'true-false') {
          const userAnswerBool = userAnswer.toString() === 'true';
          const correctAnswerBool = typeof question.correctAnswer === 'boolean' 
            ? question.correctAnswer 
            : question.correctAnswer?.toString() === 'true';
          isCorrect = userAnswerBool === correctAnswerBool;
        } else if (question.type === 'short-answer') {
          const userAnswerStr = userAnswer.toString().toLowerCase().trim();
          const correctAnswerStr = question.correctAnswer.toString().toLowerCase().trim();
          isCorrect = userAnswerStr === correctAnswerStr;
        }
        
        if (isCorrect) correctCount++;
      }
    });

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Quiz Complete! 🎉
                </h3>
                <p className="text-green-700">
                  You answered {correctCount} out of {questions.length} questions correctly!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {correctCount}
              </div>
              <div className="text-sm text-slate-600">Correct</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {questions.length - correctCount}
              </div>
              <div className="text-sm text-slate-600">Incorrect</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {((correctCount / questions.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Accuracy</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round((Date.now() - startTime) / 1000)}s
              </div>
              <div className="text-sm text-slate-600">Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button 
            onClick={() => setShowResults(!showResults)} 
            variant="outline"
          >
            {showResults ? 'Hide' : 'Show'} Review
          </Button>
        </div>

        {showResults && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Question Review</h3>
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              
              // Use the same logic as handleComplete to determine if answer is correct
              let isCorrect = false;
              if (userAnswer !== undefined) {
                if (question.type === 'multiple-choice') {
                  const correctAnswerIndex = typeof question.correctAnswer === 'number' ? question.correctAnswer : 0;
                  const userAnswerIndex = question.options?.indexOf(userAnswer.toString()) ?? -1;
                  isCorrect = userAnswerIndex === correctAnswerIndex;
                } else if (question.type === 'true-false') {
                  const userAnswerBool = userAnswer.toString() === 'true';
                  const correctAnswerBool = typeof question.correctAnswer === 'boolean' 
                    ? question.correctAnswer 
                    : question.correctAnswer?.toString() === 'true';
                  isCorrect = userAnswerBool === correctAnswerBool;
                } else if (question.type === 'short-answer') {
                  const userAnswerStr = userAnswer.toString().toLowerCase().trim();
                  const correctAnswerStr = question.correctAnswer.toString().toLowerCase().trim();
                  isCorrect = userAnswerStr === correctAnswerStr;
                }
              }
              
              return (
                <Card key={index} className={`border-2 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <span className="font-medium">Question {index + 1}</span>
                      </div>
                      <p className="text-slate-900">{question.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Your Answer:</span>
                          <p className="text-slate-900">{userAnswer?.toString() || 'Not answered'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Correct Answer:</span>
                          <p className="text-green-700">
                            {question.type === 'multiple-choice' 
                              ? question.options?.[question.correctAnswer as number] || 'Unknown'
                              : question.type === 'true-false'
                              ? question.correctAnswer ? 'True' : 'False'
                              : question.correctAnswer?.toString() || 'Unknown'
                            }
                          </p>
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <span className="font-medium text-blue-900">Explanation:</span>
                          <p className="text-blue-800 mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-orange-600" />
            {title}
          </h2>
          <p className="text-slate-600">
            Answer all questions to complete the quiz
          </p>
        </div>
        <div className="flex items-center gap-2">
          {timeRemaining !== null && (
            <Badge className={timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeRemaining)} remaining
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

      {/* Question */}
      {renderQuestion()}

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

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {Object.keys(answers).length} of {questions.length} answered
          </span>
        </div>

        <Button 
          onClick={currentIndex === questions.length - 1 ? handleComplete : handleNext}
          className={currentIndex === questions.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {currentIndex === questions.length - 1 ? 'Complete Quiz' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
