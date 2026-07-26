import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  HelpCircle, 
  Trophy, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowLeft,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useStudyTools } from '@/hooks/useStudyTools';
import { Flashcard, QuizQuestion, ContestChallenge, LearningPathItem } from '@/services/studyToolsGenerator';

interface StudyToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  subject: string;
  onComplete?: (toolType: string, score?: number) => void;
}

export function StudyToolsModal({ isOpen, onClose, topic, subject, onComplete }: StudyToolsModalProps) {
  const [activeTool, setActiveTool] = useState<'flashcards' | 'quiz' | 'contest' | 'learning-path'>('flashcards');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [contestScore, setContestScore] = useState(0);
  const [contestTimeLeft, setContestTimeLeft] = useState(0);
  const [contestActive, setContestActive] = useState(false);
  const [completedPathItems, setCompletedPathItems] = useState<Set<string>>(new Set());

  const {
    flashcards,
    quiz,
    contest,
    learningPath,
    isLoading,
    error,
    generateFlashcards,
    generateQuiz,
    generateContest,
    generateLearningPath,
    clearTools
  } = useStudyTools();

  // Generate content when modal opens
  useEffect(() => {
    if (isOpen && !isLoading) {
      generateFlashcards(topic, subject, 20);
      generateQuiz(topic, subject, 20);
      generateContest(topic, subject, 10);
      generateLearningPath(topic, subject, 10);
    }
  }, [isOpen, topic, subject, generateFlashcards, generateQuiz, generateContest, generateLearningPath, isLoading]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFlashcardIndex(0);
      setIsFlipped(false);
      setQuizAnswers([]);
      setQuizScore(null);
      setContestScore(0);
      setContestTimeLeft(0);
      setContestActive(false);
      setCompletedPathItems(new Set());
      clearTools();
    }
  }, [isOpen, clearTools]);

  const handleFlashcardNext = () => {
    if (flashcardIndex < flashcards.length - 1) {
      setFlashcardIndex(flashcardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleFlashcardPrev = () => {
    if (flashcardIndex > 0) {
      setFlashcardIndex(flashcardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / quiz.length) * 100);
    setQuizScore(score);
    onComplete?.('quiz', score);
  };

  const handleContestStart = () => {
    setContestActive(true);
    setContestTimeLeft(300); // 5 minutes
    setContestScore(0);
  };

  const handleContestComplete = () => {
    setContestActive(false);
    onComplete?.('contest', contestScore);
  };

  const handlePathItemComplete = (itemId: string) => {
    setCompletedPathItems(prev => new Set([...prev, itemId]));
    onComplete?.('learning-path');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return <FileText className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'practice': return <Star className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'project': return <Trophy className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Study Tools for {topic}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTool} onValueChange={(value) => setActiveTool(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="contest" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Contest
            </TabsTrigger>
            <TabsTrigger value="learning-path" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learning Path
            </TabsTrigger>
          </TabsList>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Generating flashcards...</span>
              </div>
            ) : flashcards.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Card {flashcardIndex + 1} of {flashcards.length}</Badge>
                    <Badge className={getDifficultyColor(flashcards[flashcardIndex]?.difficulty)}>
                      {flashcards[flashcardIndex]?.difficulty}
                    </Badge>
                  </div>
                  <Progress value={(flashcardIndex + 1) / flashcards.length * 100} className="w-32" />
                </div>

                <Card 
                  className="min-h-[200px] p-6 cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className="text-center">
                    <div className="mb-4">
                      <Badge variant="secondary" className="mb-2">
                        {isFlipped ? 'Answer' : 'Question'}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium">
                      {isFlipped ? flashcards[flashcardIndex]?.back : flashcards[flashcardIndex]?.front}
                    </p>
                    {flashcards[flashcardIndex]?.category && (
                      <Badge variant="outline" className="mt-4">
                        {flashcards[flashcardIndex]?.category}
                      </Badge>
                    )}
                  </div>
                </Card>

                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleFlashcardPrev}
                    disabled={flashcardIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Flip Card
                  </Button>
                  <Button 
                    onClick={handleFlashcardNext}
                    disabled={flashcardIndex === flashcards.length - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {flashcardIndex === flashcards.length - 1 && (
                  <div className="text-center">
                    <Button 
                      onClick={() => onComplete?.('flashcards')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Flashcards
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No flashcards available</p>
              </div>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Generating quiz...</span>
              </div>
            ) : quizScore !== null ? (
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-green-600">{quizScore}%</div>
                <p className="text-lg">Quiz Complete!</p>
                <div className="text-sm text-gray-600">
                  You got {quiz.filter((q, i) => quizAnswers[i] === q.correctAnswer).length} out of {quiz.length} questions correct
                </div>
                <Button onClick={() => { setQuizScore(null); setQuizAnswers([]); }}>
                  Try Again
                </Button>
              </div>
            ) : quiz.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Question {flashcardIndex + 1} of {quiz.length}</Badge>
                  <Badge className={getDifficultyColor(quiz[flashcardIndex]?.difficulty)}>
                    {quiz[flashcardIndex]?.difficulty}
                  </Badge>
                </div>

                <Card className="p-6">
                  <h3 className="font-medium mb-4">{quiz[flashcardIndex]?.question}</h3>
                  <div className="space-y-2">
                    {quiz[flashcardIndex]?.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={quizAnswers[flashcardIndex] === index ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleQuizAnswer(flashcardIndex, index)}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </Button>
                    ))}
                  </div>
                </Card>

                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setFlashcardIndex(Math.max(0, flashcardIndex - 1))}
                    disabled={flashcardIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setFlashcardIndex(Math.min(quiz.length - 1, flashcardIndex + 1))}
                    disabled={flashcardIndex === quiz.length - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {flashcardIndex === quiz.length - 1 && (
                  <div className="text-center">
                    <Button 
                      onClick={handleQuizSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No quiz available</p>
              </div>
            )}
          </TabsContent>

          {/* Contest Tab */}
          <TabsContent value="contest" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Generating contest...</span>
              </div>
            ) : contest.length > 0 ? (
              <div className="space-y-4">
                {!contestActive ? (
                  <div className="text-center space-y-4">
                    <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                    <h3 className="text-xl font-bold">Speed Challenge</h3>
                    <p className="text-gray-600">Test your knowledge under time pressure!</p>
                    <div className="text-sm text-gray-500">
                      {contest.length} challenges • 5 minutes • {contest.reduce((sum, c) => sum + c.points, 0)} total points
                    </div>
                    <Button onClick={handleContestStart} className="bg-yellow-600 hover:bg-yellow-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Contest
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">Score: {contestScore}</Badge>
                        <Badge className="bg-red-100 text-red-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(contestTimeLeft / 60)}:{(contestTimeLeft % 60).toString().padStart(2, '0')}
                        </Badge>
                      </div>
                      <Button variant="outline" onClick={handleContestComplete}>
                        End Contest
                      </Button>
                    </div>

                    <Card className="p-6">
                      <div className="text-center">
                        <h3 className="font-medium mb-4">{contest[flashcardIndex]?.question}</h3>
                        <Badge className={getDifficultyColor(contest[flashcardIndex]?.difficulty)}>
                          {contest[flashcardIndex]?.difficulty} • {contest[flashcardIndex]?.points} points
                        </Badge>
                      </div>
                    </Card>

                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setFlashcardIndex(Math.max(0, flashcardIndex - 1))}
                        disabled={flashcardIndex === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        onClick={() => {
                          setContestScore(prev => prev + (contest[flashcardIndex]?.points || 0));
                          setFlashcardIndex(Math.min(contest.length - 1, flashcardIndex + 1));
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Correct! +{contest[flashcardIndex]?.points}
                      </Button>
                      <Button 
                        onClick={() => setFlashcardIndex(Math.min(contest.length - 1, flashcardIndex + 1))}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No contest available</p>
              </div>
            )}
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="learning-path" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Generating learning path...</span>
              </div>
            ) : learningPath.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">Your Learning Journey</h3>
                  <Progress 
                    value={completedPathItems.size / learningPath.length * 100} 
                    className="w-full" 
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {completedPathItems.size} of {learningPath.length} items completed
                  </p>
                </div>

                <div className="grid gap-4">
                  {learningPath.map((item, index) => (
                    <Card 
                      key={item.id} 
                      className={`p-4 ${completedPathItems.has(item.id) ? 'bg-green-50 border-green-200' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {completedPathItems.has(item.id) ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge className={getDifficultyColor(item.difficulty)}>
                              {item.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {item.duration}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{item.description}</p>
                          {item.resources.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Resources:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.resources.map((resource, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {!completedPathItems.has(item.id) && (
                            <Button 
                              size="sm"
                              onClick={() => handlePathItemComplete(item.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No learning path available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
