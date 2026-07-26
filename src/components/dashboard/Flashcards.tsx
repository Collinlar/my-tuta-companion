import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X, Brain, BookOpen } from "lucide-react";
import { aiResourceService, Flashcard } from "@/services/aiResourceService";
import { Task } from "@/types/task";
import { trackFlashcardCompletion } from "@/lib/analytics";
import { smartStorage } from "@/services/smartStorageService";

interface FlashcardSet {
  id: string;
  subject: string;
  topic: string;
  flashcards: Flashcard[];
  dueCount: number;
  totalCount: number;
}

interface FlashcardsProps {
  onComplete?: () => void;
  onBack?: () => void;
  selectedTask?: Task | null;
}

export function Flashcards({ onComplete, onBack, selectedTask }: FlashcardsProps = {}) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'review' | 'study' | null>(null);
  const [correctCards, setCorrectCards] = useState<string[]>([]);
  const [incorrectCards, setIncorrectCards] = useState<string[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  // Generate flashcard sets from tasks
  useEffect(() => {
    const generateFlashcardSets = async (): Promise<FlashcardSet[]> => {
      const sets: FlashcardSet[] = [];

      try {
        // Load flashcards from Supabase (primary source)
        const supabaseCards = await smartStorage.getAllFlashcards();
        if (supabaseCards.length > 0) {
          // Group by subject+topic into sets
          const grouped: Record<string, typeof supabaseCards> = {};
          for (const card of supabaseCards) {
            const key = `${card.subject || 'General'} — ${card.topic || 'Flashcards'}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(card);
          }
          for (const [key, cards] of Object.entries(grouped)) {
            const [subject, topic] = key.split(' — ');
            sets.push({
              id: `supabase-${subject}-${topic}`,
              subject,
              topic,
              // Map Supabase Flashcard (question/answer) to component Flashcard (front/back)
              flashcards: cards.map((c) => ({
                id: c.id,
                front: c.question,
                back: c.answer,
                subject: c.subject,
                topic: c.topic,
                difficulty: (c.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
                category: c.subject,
                source: 'Saved',
              })),
              dueCount: cards.filter((c) => !c.nextReview || new Date(c.nextReview) <= new Date()).length,
              totalCount: cards.length,
            });
          }
        }

        // Fallback: load AI-generated flashcards stored in localStorage from revision plans
        const savedPlans = localStorage.getItem('generatedPlans');
        if (savedPlans) {
          try {
            const plans = JSON.parse(savedPlans);
            for (const plan of plans) {
              if (plan.tasks) {
                for (const task of plan.tasks) {
                  if (task.type === 'flashcard' && task.resources) {
                    for (const resource of task.resources) {
                      if (resource.type === 'flashcard' && resource.content?.flashcards) {
                        sets.push({
                          id: `plan-${plan.id}-${resource.id}`,
                          subject: plan.subject || 'AI Generated',
                          topic: task.title,
                          flashcards: resource.content.flashcards,
                          dueCount: resource.content.flashcards.length,
                          totalCount: resource.content.flashcards.length,
                        });
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
      } catch (error) {
        console.error('Error loading flashcard sets:', error);
      }

      return sets;
    };

    generateFlashcardSets().then(sets => {
      console.log('Generated flashcard sets:', sets);
      setFlashcardSets(sets);
      if (sets.length > 0) {
        setSelectedSet(sets[0]);
        setCurrentFlashcards(sets[0].flashcards);
      }
      setIsLoading(false);
    }).catch(error => {
      console.error('Error generating flashcard sets:', error);
      setIsLoading(false);
    });
  }, [selectedTask]);

  // If a specific task is selected, generate flashcards for that task
  useEffect(() => {
    if (selectedTask) {
      setIsLoading(true);
      console.log('Generating flashcards for selected task:', selectedTask.title);
      aiResourceService.generateFlashcards(selectedTask).then(taskFlashcards => {
        console.log('Generated flashcards for task:', taskFlashcards);
        
        // Fallback flashcards if AI generation fails or returns empty
        const fallbackFlashcards = [
          {
            id: '1',
            front: 'What is a quadratic equation?',
            back: 'A quadratic equation is a polynomial equation of degree 2, typically in the form ax² + bx + c = 0.',
            subject: 'Mathematics',
            topic: selectedTask.title,
            category: 'Algebra',
            difficulty: 'easy' as const,
            source: 'AI Generated'
          },
          {
            id: '2',
            front: 'What is the quadratic formula?',
            back: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a, used to solve quadratic equations.',
            subject: 'Mathematics',
            topic: selectedTask.title,
            category: 'Algebra',
            difficulty: 'medium' as const,
            source: 'AI Generated'
          }
        ];
        
        const flashcardsToUse = taskFlashcards && taskFlashcards.length > 0 ? taskFlashcards : fallbackFlashcards;
        
        setCurrentFlashcards(flashcardsToUse);
        setSelectedSet({
          id: `task-${selectedTask.id}`,
          subject: 'AI Generated',
          topic: selectedTask.title,
          flashcards: flashcardsToUse,
          dueCount: flashcardsToUse.length,
          totalCount: flashcardsToUse.length
        });
        setStudyMode('study');
        setIsLoading(false);
      }).catch(error => {
        console.error('Error generating flashcards for task:', error);
        
        // Use fallback flashcards on error
        const fallbackFlashcards = [
          {
            id: '1',
            front: 'What is a quadratic equation?',
            back: 'A quadratic equation is a polynomial equation of degree 2, typically in the form ax² + bx + c = 0.',
            subject: 'Mathematics',
            topic: selectedTask.title,
            category: 'Algebra',
            difficulty: 'easy' as const,
            source: 'AI Generated'
          },
          {
            id: '2',
            front: 'What is the quadratic formula?',
            back: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a, used to solve quadratic equations.',
            subject: 'Mathematics',
            topic: selectedTask.title,
            category: 'Algebra',
            difficulty: 'medium' as const,
            source: 'AI Generated'
          }
        ];
        
        setCurrentFlashcards(fallbackFlashcards);
        setSelectedSet({
          id: `task-${selectedTask.id}`,
          subject: 'AI Generated',
          topic: selectedTask.title,
          flashcards: fallbackFlashcards,
          dueCount: fallbackFlashcards.length,
          totalCount: fallbackFlashcards.length
        });
        setStudyMode('study');
        setIsLoading(false);
      });
    }
  }, [selectedTask]);

  const currentCard = currentFlashcards[currentCardIndex];
  const progress = currentFlashcards.length > 0 ? ((correctCards.length + incorrectCards.length) / currentFlashcards.length) * 100 : 0;
  
  // Debug logging
  console.log('Current flashcards:', currentFlashcards);
  console.log('Current card index:', currentCardIndex);
  console.log('Current card:', currentCard);

  const handleNext = () => {
    if (currentCardIndex < currentFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleResponse = (correct: boolean) => {
    const cardId = currentCard.id;
    if (correct) {
      setCorrectCards(prev => [...prev.filter(id => id !== cardId), cardId]);
      setIncorrectCards(prev => prev.filter(id => id !== cardId));
    } else {
      setIncorrectCards(prev => [...prev.filter(id => id !== cardId), cardId]);
      setCorrectCards(prev => prev.filter(id => id !== cardId));
    }
    
    setTimeout(() => {
      // Check if all cards have been reviewed
      const totalReviewed = correctCards.length + incorrectCards.length + 1; // +1 for current card
      if (totalReviewed >= currentFlashcards.length) {
        // Save results and show completion screen
        saveFlashcardResults();
        setShowResults(true);
      } else {
        handleNext();
      }
    }, 500);
  };

  const saveFlashcardResults = () => {
    if (!selectedSet) return;

    try {
      const totalCards = currentFlashcards.length;
      const correctCount = correctCards.length + (correctCards.includes(currentCard.id) ? 0 : 1);
      const incorrectCount = incorrectCards.length + (incorrectCards.includes(currentCard.id) ? 0 : 1);
      const accuracy = Math.round((correctCount / totalCards) * 100);
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000); // in seconds

      const result = {
        id: `flashcard-result-${Date.now()}`,
        setId: selectedSet.id,
        subject: selectedSet.subject,
        topic: selectedSet.topic,
        totalCards: totalCards,
        correctCards: correctCount,
        incorrectCards: incorrectCount,
        accuracy: accuracy,
        timeSpent: timeSpent,
        completedAt: new Date().toISOString(),
        cardsToReview: incorrectCards.length
      };

      // Save to localStorage
      const savedResults = localStorage.getItem('flashcardResults');
      const results = savedResults ? JSON.parse(savedResults) : [];
      results.push(result);
      localStorage.setItem('flashcardResults', JSON.stringify(results));

      // Track flashcard completion
      trackFlashcardCompletion(selectedSet.topic, accuracy, totalCards);

      console.log('Flashcard results saved:', result);
    } catch (error) {
      console.error('Error saving flashcard results:', error);
    }
  };

  const startStudy = (set: FlashcardSet) => {
    setSelectedSet(set);
    setCurrentFlashcards(set.flashcards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCorrectCards([]);
    setIncorrectCards([]);
    setStudyMode('study');
    setShowResults(false);
  };

  // Show results screen
  if (showResults && selectedSet) {
    const totalCards = currentFlashcards.length;
    const correctCount = correctCards.length;
    const incorrectCount = incorrectCards.length;
    const accuracy = Math.round((correctCount / totalCards) * 100);
    const excellent = accuracy >= 90;
    const good = accuracy >= 70;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
              excellent ? 'bg-green-100' : good ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <Brain className={`w-12 h-12 ${
                excellent ? 'text-green-600' : good ? 'text-blue-600' : 'text-orange-600'
              }`} />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {excellent ? 'Excellent Work! 🌟' : good ? 'Great Job! 👏' : 'Keep Practicing! 💪'}
              </h2>
              <p className="text-muted-foreground">
                {excellent 
                  ? 'You mastered this flashcard set!' 
                  : good 
                  ? 'You\'re making great progress!' 
                  : 'Review the cards you missed and try again!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-red-600">{incorrectCount}</p>
                <p className="text-sm text-muted-foreground">To Review</p>
              </div>
            </div>

            {incorrectCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>{incorrectCount} card{incorrectCount > 1 ? 's' : ''}</strong> need{incorrectCount === 1 ? 's' : ''} more practice
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setStudyMode(null);
                  setCurrentCardIndex(0);
                  setCorrectCards([]);
                  setIncorrectCards([]);
                }}
              >
                Back to Sets
              </Button>
              {incorrectCount > 0 && (
                <Button 
                  onClick={() => {
                    // Review only incorrect cards
                    const incorrectCardsList = currentFlashcards.filter(card => 
                      incorrectCards.includes(card.id)
                    );
                    setCurrentFlashcards(incorrectCardsList);
                    setShowResults(false);
                    setCurrentCardIndex(0);
                    setCorrectCards([]);
                    setIncorrectCards([]);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Review Missed Cards
                </Button>
              )}
              <Button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentCardIndex(0);
                  setCorrectCards([]);
                  setIncorrectCards([]);
                }}
                className="bg-primary"
              >
                Study Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!studyMode) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900">Flashcards</h1>
              <p className="text-slate-600">Master your knowledge with spaced repetition</p>
            </div>
          </div>
        </div>

        {/* Study Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card 
            className="group p-8 cursor-pointer hover:shadow-lg transition-all border border-slate-200 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50"
            onClick={() => setStudyMode('review')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Review</h3>
              <p className="text-slate-600 mb-4">
                Review cards that are due for revision based on spaced repetition algorithm
              </p>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                3 cards due today
              </Badge>
            </div>
          </Card>

          <Card 
            className="group p-8 cursor-pointer hover:shadow-lg transition-all border border-slate-200 hover:border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
            onClick={() => setStudyMode('study')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Study All</h3>
              <p className="text-slate-600 mb-4">
                Go through all your flashcards in any order you prefer
              </p>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                12 total cards
              </Badge>
            </div>
          </Card>
        </div>

        {/* Flashcard Sets */}
        {flashcardSets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Your Flashcard Sets</h2>
                <p className="text-sm text-slate-600">Choose a topic to start studying</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcardSets.map((set) => (
                <Card 
                  key={set.id} 
                  className="group p-6 cursor-pointer hover:shadow-lg transition-all border border-slate-200 hover:border-purple-200"
                  onClick={() => startStudy(set)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
        <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{set.topic}</h3>
                        <p className="text-sm text-slate-600">{set.subject}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <div className="font-semibold text-slate-900">{set.totalCount}</div>
                      <div className="text-xs text-slate-600">Total Cards</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <div className="font-semibold text-slate-900">{set.dueCount}</div>
                      <div className="text-xs text-slate-600">Due Today</div>
                    </div>
                  </div>
                  
                  {set.dueCount > 0 && (
                    <div className="mb-4">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        {set.dueCount} cards need review
                    </Badge>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Start Studying
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {flashcardSets.length === 0 && !isLoading && (
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">No Flashcards Available</h3>
              <p className="text-slate-600 mb-6">
                Create your first revision plan to generate personalized flashcards
              </p>
              <Button 
                onClick={() => setStudyMode('study')}
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setStudyMode(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Flashcards
          </Button>
        </div>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60">
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Generating Flashcards</h3>
            <p className="text-slate-600">Creating personalized study cards for you...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if no flashcards available
  if (!currentCard && currentFlashcards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setStudyMode(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Flashcards
          </Button>
        </div>
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Flashcards Available</h3>
            <p className="text-slate-600 mb-6">Unable to generate flashcards. Please try again or create a new revision plan.</p>
            <Button 
              onClick={() => setStudyMode(null)}
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setStudyMode(null)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Flashcards
        </Button>
        <div className="text-center">
          <div className="text-sm font-medium text-slate-900">
            {currentCardIndex + 1} of {currentFlashcards.length}
          </div>
          <div className="text-xs text-slate-600">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Study Progress</span>
          <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3 bg-slate-100" />
      </div>

      {/* Topic Info */}
      <div className="text-center">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-4">
          {selectedSet?.subject} • {selectedSet?.topic}
        </Badge>
        {currentCard && (
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              {currentCard.category}
            </Badge>
            <Badge 
              className={
                currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-200' : 
                currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                'bg-red-100 text-red-700 border-red-200'
              }
            >
              {currentCard.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {currentCard.source}
            </Badge>
          </div>
        )}
      </div>

      {/* Flashcard with 3D Flip Animation */}
      <div className="perspective-1000">
        <div 
          className={`relative w-full min-h-[400px] cursor-pointer transition-transform duration-700 ease-in-out transform-gpu ${
            isFlipped ? 'rotate-y-180' : 'rotate-y-0'
          }`}
          onClick={() => currentCard && setIsFlipped(!isFlipped)}
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Question Side (Front) */}
          <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            <Card className="min-h-[400px] hover:shadow-2xl border-2 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
              <div className="p-12 flex flex-col justify-center items-center text-center h-full min-h-[400px]">
                {!currentCard ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-600 mb-6">No Flashcards Available</h3>
                      <p className="text-xl text-slate-500">Please select a flashcard set to begin studying.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-600 mb-6">Question</h3>
                      <p className="text-2xl font-semibold text-slate-900 leading-relaxed">{currentCard.front}</p>
                    </div>
                    <p className="text-sm text-slate-500 animate-pulse">
                      Click anywhere to reveal the answer
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Answer Side (Back) */}
          <div 
            className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            style={{
              transform: 'rotateY(180deg)'
            }}
          >
            <Card className="min-h-[400px] hover:shadow-2xl border-2 hover:border-green-200 bg-gradient-to-br from-white to-green-50/30">
              <div className="p-12 flex flex-col justify-center items-center text-center h-full min-h-[400px]">
                {currentCard && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-600 mb-6">Answer</h3>
                      <p className="text-2xl font-semibold text-slate-900 leading-relaxed">{currentCard.back}</p>
                    </div>
                    <div className="flex justify-center gap-2 animate-in slide-in-from-bottom-2 duration-700">
                      <Badge 
                        className={
                          currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-200' : 
                          currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                          'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {currentCard.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-700">
                        {currentCard.source}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Response buttons (only show when answer is revealed) */}
      {isFlipped && (
        <div className="flex justify-center gap-6 animate-in slide-in-from-bottom-2 duration-500">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleResponse(false)}
            className="flex items-center gap-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-8 py-4 text-lg font-medium hover-game-button hover:scale-105"
          >
            <X className="w-5 h-5" />
            Need Review
          </Button>
          <Button
            size="lg"
            onClick={() => handleResponse(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 text-lg font-medium hover-game-button hover:scale-105 shadow-lg"
          >
            <Check className="w-5 h-5" />
            Got It!
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          className="flex items-center gap-2 hover-game-button transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-8">
          <div className="text-center animate-in slide-in-from-bottom-2 duration-500">
            <div className="text-xl font-bold text-green-600 animate-score-bounce">{correctCards.length}</div>
            <div className="text-sm text-slate-600 font-medium">Correct</div>
          </div>
          <div className="text-center animate-in slide-in-from-bottom-2 duration-700">
            <div className="text-xl font-bold text-red-600 animate-score-bounce">{incorrectCards.length}</div>
            <div className="text-sm text-slate-600 font-medium">To Review</div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentCardIndex === currentFlashcards.length - 1}
          className="flex items-center gap-2 hover-game-button transition-all duration-200"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}