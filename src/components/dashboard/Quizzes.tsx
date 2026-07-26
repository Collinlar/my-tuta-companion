import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HelpCircle, Clock, Trophy, Target, BookOpen } from "lucide-react";
import { aiResourceService, QuizQuestion } from "@/services/aiResourceService";
import { Task } from "@/types/task";
import { trackQuizCompletion } from "@/lib/analytics";

interface Quiz {
  id: string;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
  difficulty: string;
  timeLimit: number; // in minutes
  bestScore?: number;
  attempts: number;
  source: string;
}

interface QuizzesProps {
  onComplete?: () => void;
  onBack?: () => void;
  selectedTask?: Task | null;
}

export function Quizzes({ onComplete, onBack, selectedTask }: QuizzesProps = {}) {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Generate quizzes from tasks
  useEffect(() => {
    const generateQuizzes = async (): Promise<Quiz[]> => {
      const quizList: Quiz[] = [];
      
      try {
        // First, try to load quizzes from generated revision plans
        const savedPlans = localStorage.getItem('generatedPlans');
        if (savedPlans) {
          try {
            const plans = JSON.parse(savedPlans);
            console.log('Loading quizzes from saved plans:', plans);
            
            // Extract quiz tasks from all saved plans
            for (const plan of plans) {
              if (plan.tasks) {
                for (const task of plan.tasks) {
                  if (task.type === 'quiz' && task.resources) {
                    for (const resource of task.resources) {
                      if (resource.type === 'quiz' && resource.content?.questions) {
                        const quiz: Quiz = {
                          id: `plan-${plan.id}-${resource.id}`,
                          subject: plan.subject || 'AI Generated',
                          topic: `${plan.topic} - ${task.title}`,
                          questions: resource.content.questions,
                          difficulty: task.difficulty || 'Medium',
                          timeLimit: 15,
                          attempts: 0,
                          source: 'AI Generated from Revision Plan'
                        };
                        quizList.push(quiz);
                        console.log('Added quiz from plan:', quiz.topic);
                      }
                    }
                  }
                }
              }
            }
          } catch (parseError) {
            console.error('Error parsing saved plans:', parseError);
          }
        }
        
        // No sample quizzes generated for new users - keep empty
      } catch (error) {
        console.error('Error generating quiz sets:', error);
      }

      return quizList;
    };

    generateQuizzes().then(quizList => {
      console.log('Generated quiz sets:', quizList);
      setQuizzes(quizList);
      if (quizList.length > 0) {
        setCurrentQuiz(quizList[0]);
      }
      setIsLoading(false);
    }).catch(error => {
      console.error('Error generating quiz sets:', error);
      setIsLoading(false);
    });
  }, [selectedTask]);

  // If a specific task is selected, generate quiz for that task
  useEffect(() => {
    if (selectedTask) {
      setIsLoading(true);
      console.log('Generating quiz for selected task:', selectedTask.title);
      aiResourceService.generateQuizQuestions(selectedTask).then(taskQuestions => {
        console.log('Generated quiz questions for task:', taskQuestions);
        const taskQuiz: Quiz = {
          id: `task-${selectedTask.id}`,
          subject: 'AI Generated',
          topic: selectedTask.title,
          questions: taskQuestions,
          difficulty: selectedTask.difficulty,
          timeLimit: 15,
          attempts: 0,
          source: 'AI Generated'
        };
        setCurrentQuiz(taskQuiz);
        setActiveQuiz(taskQuiz.id);
        setIsLoading(false);
      }).catch(error => {
        console.error('Error generating quiz for task:', error);
        setIsLoading(false);
      });
    }
  }, [selectedTask]);

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setActiveQuiz(quiz.id);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setTimeLeft(quiz.timeLimit * 60);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return;
    
    const question = currentQuiz.questions[currentQuestion];
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete - save results and show completion screen
      saveQuizResults();
      setShowResults(true);
      setShowExplanation(false);
    }
  };

  const saveQuizResults = () => {
    if (!currentQuiz) return;

    try {
      const percentage = Math.round((score / currentQuiz.questions.length) * 100);
      const result = {
        id: `result-${Date.now()}`,
        quizId: currentQuiz.id,
        subject: currentQuiz.subject,
        topic: currentQuiz.topic,
        score: score,
        totalQuestions: currentQuiz.questions.length,
        percentage: percentage,
        difficulty: currentQuiz.difficulty,
        completedAt: new Date().toISOString(),
        timeSpent: (currentQuiz.timeLimit * 60) - timeLeft
      };

      // Save to localStorage
      const savedResults = localStorage.getItem('quizResults');
      const results = savedResults ? JSON.parse(savedResults) : [];
      results.push(result);
      localStorage.setItem('quizResults', JSON.stringify(results));

      // Update quiz attempts count
      const updatedQuizzes = quizzes.map(q => 
        q.id === currentQuiz.id 
          ? { ...q, attempts: q.attempts + 1, bestScore: Math.max(q.bestScore || 0, percentage) }
          : q
      );
      setQuizzes(updatedQuizzes);

      // Track quiz completion
      trackQuizCompletion(currentQuiz.topic, score, currentQuiz.questions.length);

      console.log('Quiz results saved:', result);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
            ← Back to Quizzes
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating quiz questions...</p>
        </div>
      </div>
    );
  }

  // Show results screen
  if (showResults && currentQuiz) {
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
              passed ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <Trophy className={`w-12 h-12 ${passed ? 'text-green-600' : 'text-orange-600'}`} />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {passed ? 'Congratulations! 🎉' : 'Good Effort! 💪'}
              </h2>
              <p className="text-muted-foreground">
                {passed 
                  ? 'You passed the quiz!' 
                  : 'Keep practicing to improve your score!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{currentQuiz.questions.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setActiveQuiz(null);
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setScore(0);
                }}
              >
                Back to Quizzes
              </Button>
              <Button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setScore(0);
                  setTimeLeft(currentQuiz.timeLimit * 60);
                }}
                className="bg-primary"
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if no quiz available
  if (activeQuiz && currentQuiz && (!currentQuiz.questions || currentQuiz.questions.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
            ← Back to Quizzes
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No quiz questions available. Please try again.</p>
        </div>
      </div>
    );
  }

  if (activeQuiz && currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    
    // Additional safety check for question and its properties
    if (!question || !question.options || !Array.isArray(question.options)) {
      console.error('Invalid question data:', { question, currentQuestion, currentQuiz });
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
              ← Back to Quizzes
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Question not found or invalid. Please try again.</p>
            <Button 
              onClick={() => {
                setActiveQuiz(null);
                setCurrentQuestion(0);
              }}
              className="mt-4"
            >
              Return to Quiz List
            </Button>
          </div>
        </div>
      );
    }
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
            ← Exit Quiz
          </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div>Question {currentQuestion + 1} of {currentQuiz.questions.length}</div>
          </div>
        </div>

        <Progress value={progress} className="mb-6" />

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold">{question.question}</h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {question.category}
              </Badge>
              <Badge 
                variant={question.difficulty === 'easy' ? 'secondary' : 
                        question.difficulty === 'medium' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.source}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAnswer === index
                    ? showExplanation
                      ? index === question.correctAnswer
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-primary bg-primary/5"
                    : showExplanation && index === question.correctAnswer
                    ? "border-green-500 bg-green-50"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => !showExplanation && handleAnswerSelect(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === index ? "border-primary bg-primary" : "border-gray-300"
                  }`} />
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>

          {showExplanation && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Explanation:</h4>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Score: {score}/{currentQuestion + 1}
            </div>
            <div className="flex gap-2">
              {!showExplanation ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestion < currentQuiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900">Practice Quizzes</h1>
            <p className="text-slate-600">Test your knowledge with AI-generated practice questions</p>
          </div>
        </div>
      </div>

      {/* Quiz Stats - Collapsible */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60">
        <div className="p-6">
          <button className="flex items-center justify-between w-full group hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-slate-900 group-hover:text-yellow-700 transition-colors">
                  Your Quiz Performance
                </h2>
                <p className="text-xs text-slate-600">Track your progress and achievements</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="mt-6 pt-6 border-t border-white/40">
            <div className="bg-white/60 p-6 rounded-xl border border-white/40 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Start Taking Quizzes</h3>
              <p className="text-slate-600 mb-4">
                Take your first quiz to start tracking your performance and see your progress here.
              </p>
              <button
                onClick={() => setActiveQuiz('quadratic-equations')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Take Your First Quiz
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Available Quizzes */}
      {quizzes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Available Quizzes</h2>
              <p className="text-sm text-slate-600">Choose a quiz to test your knowledge</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="p-6 hover:shadow-lg transition-all border border-slate-200 hover:border-green-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{quiz.topic}</h3>
                      <p className="text-slate-600 mb-2">{quiz.subject}</p>
                      <Badge 
                        className={
                          quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' : 
                          quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                          'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{quiz.questions.length} questions</div>
                      <div className="text-xs text-slate-600">Total questions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{quiz.timeLimit} min</div>
                      <div className="text-xs text-slate-600">Time limit</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {quiz.bestScore ? `${quiz.bestScore}%` : 'Not taken'}
                      </div>
                      <div className="text-xs text-slate-600">Best score</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    AI Generated Content • {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}
                  </div>
                  <Button 
                    onClick={() => startQuiz(quiz)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {quiz.attempts === 0 ? "Start Quiz" : "Retake Quiz"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {quizzes.length === 0 && !isLoading && (
        <Card className="bg-gradient-to-r from-slate-50 to-green-50 border border-slate-200">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">No Quizzes Available</h3>
            <p className="text-slate-600 mb-6">
              Create your first revision plan to generate personalized quiz questions
            </p>
            <Button 
              onClick={() => startQuiz(quizzes[0] || null)}
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}