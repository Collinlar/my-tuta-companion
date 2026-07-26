import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Brain,
  Star,
  Trophy,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface InteractiveFlashcardsProps {
  flashcards: Flashcard[];
  title: string;
  onComplete?: (results: FlashcardResults) => void;
  studentMode?: boolean;
}

interface FlashcardResults {
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  accuracy: number;
  cardsStudied: string[];
}

export function InteractiveFlashcards({ 
  flashcards, 
  title, 
  onComplete, 
  studentMode = false 
}: InteractiveFlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'study' | 'quiz'>('study');
  const [answers, setAnswers] = useState<{ [key: number]: 'correct' | 'incorrect' | 'unanswered' }>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const newAnswers = {
      ...answers,
      [currentIndex]: correct ? 'correct' : 'incorrect'
    };
    setAnswers(newAnswers);
    setShowAnswer(true);
  };

  const handleComplete = () => {
    const timeSpent = Date.now() - startTime;
    const correctCount = Object.values(answers).filter(a => a === 'correct').length;
    const incorrectCount = Object.values(answers).filter(a => a === 'incorrect').length;
    
    const results: FlashcardResults = {
      totalCards: flashcards.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      timeSpent: Math.round(timeSpent / 1000),
      accuracy: flashcards.length > 0 ? (correctCount / flashcards.length) * 100 : 0,
      cardsStudied: flashcards.map(card => `${card.front} → ${card.back}`)
    };

    setIsCompleted(true);
    onComplete?.(results);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers({});
    setStartTime(Date.now());
    setIsCompleted(false);
    setShowAnswer(false);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCompleted) {
    const correctCount = Object.values(answers).filter(a => a === 'correct').length;
    const accuracy = flashcards.length > 0 ? (correctCount / flashcards.length) * 100 : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Flashcards Complete! 🎉
                </h3>
                <p className="text-green-700">
                  Great job studying all {flashcards.length} flashcards!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {correctCount}
              </div>
              <div className="text-sm text-slate-600">Correct Answers</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Accuracy</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round((Date.now() - startTime) / 1000)}s
              </div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </CardContent>
          </Card>
        </div>

        {studentMode && (
          <div className="text-center">
            <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
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
            <Brain className="w-6 h-6 text-purple-600" />
            {title}
          </h2>
          <p className="text-slate-600">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            {studyMode === 'study' ? 'Study Mode' : 'Quiz Mode'}
          </Badge>
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

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl h-80">
          {!isFlipped ? (
            /* Front of card */
            <Card 
              className="w-full h-full border-2 border-purple-200 hover:border-purple-300 cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={handleFlip}
            >
              <CardContent className="p-8 h-full flex flex-col justify-center">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className={getDifficultyColor(currentCard.difficulty)}>
                      {currentCard.difficulty || 'General'}
                    </Badge>
                    {currentCard.category && (
                      <Badge variant="outline">{currentCard.category}</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {currentCard.front}
                  </h3>
                  <p className="text-slate-600">Click to reveal answer</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Back of card */
            <Card className="w-full h-full border-2 border-green-200 cursor-pointer transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-8 h-full flex flex-col justify-center">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-800">Answer</Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {currentCard.back}
                  </h3>
                  {studyMode === 'quiz' && !showAnswer && (
                    <div className="flex justify-center gap-3 mt-6">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        I Got It Right
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(false);
                        }}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        I Got It Wrong
                      </Button>
                    </div>
                  )}
                  {studyMode === 'quiz' && showAnswer && (
                    <div className="mt-4">
                      <Badge className={answers[currentIndex] === 'correct' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }>
                        {answers[currentIndex] === 'correct' ? 'Correct!' : 'Incorrect'}
                      </Badge>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button 
                      onClick={handleFlip}
                      variant="outline"
                      size="sm"
                    >
                      Show Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
          <Button 
            variant="outline" 
            onClick={handleFlip}
            className="flex items-center gap-2"
          >
            {isFlipped ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setStudyMode(studyMode === 'study' ? 'quiz' : 'study')}
          >
            Switch to {studyMode === 'study' ? 'Quiz' : 'Study'} Mode
          </Button>
        </div>

        <Button 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          {currentIndex === flashcards.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Answer Summary */}
      {studyMode === 'quiz' && Object.keys(answers).length > 0 && (
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Your Answers</h4>
            <div className="grid grid-cols-5 gap-2">
              {flashcards.map((_, index) => (
                <div key={index} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    answers[index] === 'correct' ? 'bg-green-100 text-green-800' :
                    answers[index] === 'incorrect' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
