import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, Clock, Medal, Star, Zap, BookOpen } from "lucide-react";
import { ContestDetail } from "./ContestDetail";
import { ContestQuestion } from "./ContestQuestion";
import { ContestResults } from "./ContestResults";
import { aiResourceService, ContestProblem } from "@/services/aiResourceService";
import { Task } from "@/types/task";

interface Contest {
  id: string;
  title: string;
  description: string;
  participants: number;
  timeLeft: string;
  prize: string;
  difficulty: string;
  subject: string;
  myRank?: number;
  totalParticipants: number;
  duration: number;
  questions: ContestProblem[];
  rules: string[];
  source: string;
}

interface ContestsProps {
  onComplete?: () => void;
  onBack?: () => void;
  selectedTask?: Task | null;
}

export function Contests({ onComplete, onBack, selectedTask }: ContestsProps = {}) {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'active' | 'results'>('list');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [contestScore, setContestScore] = useState<number>(0);
  const [contestAnswers, setContestAnswers] = useState<number[]>([]);
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate contests from tasks
  useEffect(() => {
    const generateContests = async (): Promise<Contest[]> => {
      const contests: Contest[] = [];
      
      try {
        // No sample contests generated for new users - keep empty
      } catch (error) {
        console.error('Error generating contest sets:', error);
      }

      return contests;
    };

    generateContests().then(contests => {
      console.log('Generated contest sets:', contests);
      setActiveContests(contests);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error generating contest sets:', error);
      setIsLoading(false);
    });
  }, [selectedTask]);

  // If a specific task is selected, generate contest for that task
  useEffect(() => {
    if (selectedTask) {
      setIsLoading(true);
      console.log('Generating contest for selected task:', selectedTask.title);
      aiResourceService.generateContestProblems(selectedTask).then(taskProblems => {
        console.log('Generated contest problems for task:', taskProblems);
        const taskContest: Contest = {
          id: `task-${selectedTask.id}-contest`,
          title: `${selectedTask.title} Challenge`,
          description: `Test your knowledge of ${selectedTask.title}`,
          participants: 0,
          timeLeft: "Unlimited",
          prize: "Knowledge + Certificate",
          difficulty: selectedTask.difficulty,
          subject: selectedTask.type,
          totalParticipants: 1,
          duration: 30,
          questions: taskProblems,
        rules: [
          "Complete all problems within the time limit",
          "Use the provided hints if needed",
          "Submit your answers when ready",
          "Review explanations after completion"
        ],
          source: "AI Generated"
        };
        setSelectedContest(taskContest);
        setCurrentView('detail');
        setIsLoading(false);
      }).catch(error => {
        console.error('Error generating contest for task:', error);
        setIsLoading(false);
      });
    }
  }, [selectedTask]);


  const leaderboard: any[] = [];

  const pastContests: any[] = [];

  // Sample questions for contest
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the value of x in the equation 2x + 5 = 13?",
      options: ["x = 3", "x = 4", "x = 5", "x = 6"],
      correctAnswer: 1,
      explanation: "2x + 5 = 13, so 2x = 8, therefore x = 4",
      subject: "Mathematics",
      difficulty: "Medium"
    },
    {
      id: 2,
      question: "Which law states that 'Every action has an equal and opposite reaction'?",
      options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Conservation"],
      correctAnswer: 2,
      explanation: "Newton's Third Law states that for every action, there is an equal and opposite reaction",
      subject: "Physics",
      difficulty: "Easy"
    },
    {
      id: 3,
      question: "What is the chemical symbol for Gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswer: 2,
      explanation: "Au comes from the Latin name 'Aurum' meaning gold",
      subject: "Chemistry",
      difficulty: "Easy"
    }
  ];

  const handleContestSelect = (contest: any) => {
    setSelectedContest(contest);
    setCurrentView('detail');
  };

  const handleStartContest = () => {
    setCurrentView('active');
  };

  const handleContestComplete = (score: number, answers: number[]) => {
    setContestScore(score);
    setContestAnswers(answers);
    setCurrentView('results');
    onComplete?.();
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedContest(null);
  };

  const handleQuitContest = () => {
    setCurrentView('detail');
  };

  if (currentView === 'results' && selectedContest) {
    // Transform ContestProblem objects to Question objects for ContestResults component
    const transformedQuestions = selectedContest.questions.map((problem, index) => ({
      id: index,
      question: problem.problem,
      options: problem.hints || ['Hint 1', 'Hint 2', 'Hint 3', 'Hint 4'], // Use hints as options for now
      correctAnswer: 0, // Default to first option since contests don't have multiple choice
      explanation: problem.solution,
      subject: problem.category || selectedContest.subject,
      difficulty: problem.difficulty
    }));

    return (
      <ContestResults
        contest={{
          title: selectedContest.title,
          totalQuestions: selectedContest.questions.length
        }}
        score={contestScore}
        answers={contestAnswers}
        questions={transformedQuestions}
        onBackToContests={handleBackToList}
      />
    );
  }

  if (currentView === 'active' && selectedContest) {
    // Transform ContestProblem objects to Question objects for ContestQuestion component
    const transformedQuestions = selectedContest.questions.map((problem, index) => ({
      id: index,
      question: problem.problem,
      options: problem.hints || ['Hint 1', 'Hint 2', 'Hint 3', 'Hint 4'], // Use hints as options for now
      correctAnswer: 0, // Default to first option since contests don't have multiple choice
      explanation: problem.solution,
      subject: problem.category || selectedContest.subject,
      difficulty: problem.difficulty
    }));

    return (
      <ContestQuestion
        contest={selectedContest}
        questions={transformedQuestions}
        onComplete={handleContestComplete}
        onQuit={handleQuitContest}
      />
    );
  }

  if (currentView === 'detail' && selectedContest) {
    // Transform Contest object to match ContestDetailProps interface
    const transformedContest = {
      id: parseInt(selectedContest.id) || 1,
      title: selectedContest.title,
      description: selectedContest.description,
      participants: selectedContest.participants,
      timeLeft: selectedContest.timeLeft,
      prize: selectedContest.prize,
      difficulty: selectedContest.difficulty,
      subject: selectedContest.subject,
      myRank: selectedContest.myRank || 0,
      totalParticipants: selectedContest.totalParticipants,
      duration: selectedContest.duration,
      questions: selectedContest.questions.length, // Convert array to number
      rules: selectedContest.rules
    };

    return (
      <ContestDetail
        contest={transformedContest}
        onBack={handleBackToList}
        onStart={handleStartContest}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/60">
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Generating Contest Problems</h3>
            <p className="text-slate-600">Creating challenging problems for you...</p>
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900">Study Contests</h1>
            <p className="text-slate-600">Compete with students and win prizes while learning</p>
          </div>
        </div>
      </div>

      {/* Contest Stats - Collapsible */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/60">
        <div className="p-6">
          <button className="flex items-center justify-between w-full group hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Your Contest Performance
                </h2>
                <p className="text-xs text-slate-600">Track your achievements and rankings</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="mt-6 pt-6 border-t border-white/40">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Contest Data Yet</h3>
              <p className="text-slate-600 mb-4">
                Start participating in contests to see your performance statistics here.
              </p>
              <button
                onClick={() => {/* Navigate to create contest or join contest */}}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Join Your First Contest
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Contests */}
      {activeContests.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Active Contests</h2>
              <p className="text-sm text-slate-600">Join these ongoing competitions</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            {activeContests.map((contest) => (
              <Card key={contest.id} className="p-6 hover:shadow-lg transition-all border border-slate-200 hover:border-purple-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{contest.title}</h3>
                      <p className="text-slate-600 mb-2">{contest.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          className={
                            contest.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' : 
                            contest.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                            'bg-red-100 text-red-700 border-red-200'
                          }
                        >
                          {contest.difficulty}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {contest.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{contest.participants} participants</div>
                      <div className="text-xs text-slate-600">Currently competing</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{contest.timeLeft}</div>
                      <div className="text-xs text-slate-600">Time remaining</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{contest.prize}</div>
                      <div className="text-xs text-slate-600">Prize pool</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">{contest.questions.length} problems</div>
                      <div className="text-xs text-slate-600">Total questions</div>
                    </div>
                  </div>
                </div>

                {contest.myRank && (
                  <div className="mb-6">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Your rank: #{contest.myRank} of {contest.totalParticipants}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-sm text-slate-600">
                    Ready to compete?
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleContestSelect(contest)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleContestSelect(contest)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Join Contest
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard and Past Contests */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Medal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Top Performers</h2>
              <p className="text-sm text-slate-600">This month's champions</p>
            </div>
          </div>
          
          <Card className="p-6 border border-slate-200">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Medal className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Leaderboard Data Yet</h3>
              <p className="text-slate-600 mb-4">
                Participate in contests to see top performers and rankings here.
              </p>
            </div>
          </Card>
        </div>

        {/* Past Contests */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Results</h2>
              <p className="text-sm text-slate-600">Your contest history</p>
            </div>
          </div>
          
          <Card className="p-6 border border-slate-200">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Contest History Yet</h3>
              <p className="text-slate-600 mb-4">
                Complete your first contest to see your results and achievements here.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Empty State */}
      {activeContests.length === 0 && !isLoading && (
        <Card className="bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">No Active Contests</h3>
            <p className="text-slate-600 mb-6">
              Check back later for new competitions and challenges
            </p>
            <Button 
              onClick={() => handleContestSelect(activeContests[0] || null)}
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
            >
              View All Contests
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}