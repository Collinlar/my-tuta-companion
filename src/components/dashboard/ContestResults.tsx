import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Clock, ChevronRight } from "lucide-react";

interface ContestResultsProps {
  contest: {
    title: string;
    totalQuestions: number;
  };
  score: number;
  answers: number[];
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    subject: string;
  }>;
  onBackToContests: () => void;
  onRetry?: () => void;
}

export function ContestResults({ contest, score, answers, questions, onBackToContests, onRetry }: ContestResultsProps) {
  const percentage = Math.round((score / contest.totalQuestions) * 100);
  const rank = Math.floor(Math.random() * 50) + 1; // Simulated rank
  const totalParticipants = Math.floor(Math.random() * 500) + 200;
  
  // Calculate bonus points for gamification
  const correctAnswers = answers.filter((answer, index) => answer === questions[index].correctAnswer);
  const streakPoints = Math.floor(correctAnswers.length * 0.1) * 50; // Streak bonus
  const speedBonus = Math.floor(Math.random() * 200) + 50; // Simulated speed bonus
  const totalGameScore = (correctAnswers.length * 100) + streakPoints + speedBonus;
  
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: "Excellent", color: "text-success", bgColor: "bg-success/10" };
    if (percentage >= 75) return { level: "Good", color: "text-primary", bgColor: "bg-primary/10" };
    if (percentage >= 60) return { level: "Average", color: "text-warning", bgColor: "bg-warning/10" };
    return { level: "Needs Improvement", color: "text-destructive", bgColor: "bg-destructive/10" };
  };

  const performance = getPerformanceLevel();

  const incorrectAnswers = answers.filter((answer, index) => answer !== questions[index].correctAnswer && answer !== -1);
  const unanswered = answers.filter(answer => answer === -1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Contest Completed!</h1>
          <p className="text-muted-foreground">{contest.title}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="text-3xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </div>
          <div>
            <div className="text-3xl font-bold animate-score-bounce">{totalGameScore}</div>
            <div className="text-sm text-muted-foreground">Game Score</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-warning">#{rank}</div>
            <div className="text-sm text-muted-foreground">Your Rank</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{totalParticipants}</div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </div>
        </div>

        <Badge className={`${performance.bgColor} ${performance.color} px-4 py-2 text-lg`}>
          {performance.level}
        </Badge>
      </Card>

      {/* Performance Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Performance Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Score</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2 animate-progress-fill" />
            </div>

            {/* Gamified Score Breakdown */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Base Points ({score} × 100)</span>
                <span className="font-semibold">{score * 100}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Streak Bonus</span>
                <span className="font-semibold text-warning">+{streakPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Speed Bonus</span>
                <span className="font-semibold text-success">+{speedBonus}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Game Score</span>
                <span className="text-primary">{totalGameScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-success/10 hover-game-button">
                <div className="text-lg font-bold text-success animate-correct-answer">{correctAnswers.length}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 hover-game-button">
                <div className="text-lg font-bold text-destructive">{incorrectAnswers.length}</div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 hover-game-button">
                <div className="text-lg font-bold text-muted-foreground">{unanswered.length}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Achievements & Milestones</h3>
          <div className="space-y-3">
            {percentage >= 90 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 animate-celebration">
                <Star className="w-6 h-6 text-yellow-500" />
                <div>
                  <div className="font-medium">Perfect Score!</div>
                  <div className="text-sm text-muted-foreground">Scored 90% or higher</div>
                </div>
              </div>
            )}
            {rank <= 10 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 animate-celebration">
                <Trophy className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium">Top 10 Finish</div>
                  <div className="text-sm text-muted-foreground">Ranked in top 10</div>
                </div>
              </div>
            )}
            {streakPoints > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 glow-streak">
                <Target className="w-6 h-6 text-warning" />
                <div>
                  <div className="font-medium">Streak Master</div>
                  <div className="text-sm text-muted-foreground">Earned streak bonus points</div>
                </div>
              </div>
            )}
            {speedBonus > 100 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                <Clock className="w-6 h-6 text-success" />
                <div>
                  <div className="font-medium">Speed Demon</div>
                  <div className="text-sm text-muted-foreground">Fast completion bonus</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-game-button">
              <Target className="w-6 h-6 text-muted-foreground" />
              <div>
                <div className="font-medium">Contest Completed</div>
                <div className="text-sm text-muted-foreground">Finished the contest</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Question Review */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Question Review</h3>
          <Badge variant="outline">{questions.length} questions</Badge>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const wasAnswered = userAnswer !== -1;
            
            return (
              <div key={question.id} className={`p-4 rounded-lg border-2 ${
                !wasAnswered ? 'border-muted bg-muted/20' :
                isCorrect ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    !wasAnswered ? 'bg-muted text-muted-foreground' :
                    isCorrect ? 'bg-success text-white' : 'bg-destructive text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-2">{question.question}</p>
                    {wasAnswered && (
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={isCorrect ? 'text-success' : 'text-destructive'}>
                            {question.options[userAnswer]}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-success">{question.options[question.correctAnswer]}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {!wasAnswered && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Not answered</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBackToContests}>
          Back to Contests
        </Button>
        {onRetry && (
          <Button onClick={onRetry}>
            <ChevronRight className="w-4 h-4 mr-2" />
            Try Another Contest
          </Button>
        )}
      </div>
    </div>
  );
}