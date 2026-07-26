import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Target, Crown, Wind, Dumbbell } from 'lucide-react';

interface GameifiedFeedbackProps {
  isCorrect: boolean;
  streak: number;
  score: number;
  multiplier: number;
  combo: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  onDismiss?: () => void;
}

const achievementIcons = {
  '🎯': Target,
  '🔥': Flame,
  '⚡': Zap,
  '👑': Crown,
  '💨': Wind,
  '💪': Dumbbell,
};

export function GameifiedFeedback({
  isCorrect,
  streak,
  score,
  multiplier,
  combo,
  achievements,
  onDismiss
}: GameifiedFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    if (isCorrect !== null) {
      setShowFeedback(true);
      const timer = setTimeout(() => {
        setShowFeedback(false);
        onDismiss?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, onDismiss]);

  useEffect(() => {
    if (achievements.length > 0) {
      setShowAchievements(true);
      const timer = setTimeout(() => {
        setShowAchievements(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievements]);

  if (!showFeedback && !showAchievements) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Answer Feedback */}
      {showFeedback && (
        <div className={`absolute ${isCorrect ? 'animate-correct-answer glow-correct' : 'animate-incorrect-answer glow-incorrect'}`}>
          <Card className={`p-6 text-center pointer-events-auto ${
            isCorrect 
              ? 'bg-success/20 border-success text-success-foreground' 
              : 'bg-destructive/20 border-destructive text-destructive-foreground'
          }`}>
            <div className="text-4xl mb-2">
              {isCorrect ? '✓' : '✗'}
            </div>
            <div className="text-xl font-bold mb-2">
              {isCorrect ? 'Correct!' : 'Wrong Answer'}
            </div>
            {isCorrect && (
              <div className="space-y-2">
                <div className="text-lg font-semibold">+{score} points</div>
                {multiplier > 1 && (
                  <Badge className="animate-combo-pop glow-combo">
                    {multiplier}x Multiplier!
                  </Badge>
                )}
                {streak >= 3 && (
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">{streak} Streak!</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Combo Display */}
      {streak >= 5 && showFeedback && isCorrect && (
        <div className="absolute top-20 animate-streak-glow">
          <Card className="p-4 bg-warning/20 border-warning">
            <div className="flex items-center gap-2 text-warning-foreground">
              <Flame className="w-6 h-6" />
              <span className="text-xl font-bold">ON FIRE!</span>
              <Flame className="w-6 h-6" />
            </div>
          </Card>
        </div>
      )}

      {/* Achievement Notifications */}
      {showAchievements && achievements.length > 0 && (
        <div className="absolute top-32 space-y-3 pointer-events-auto">
          {achievements.map((achievement) => {
            const IconComponent = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Target;
            return (
              <Card 
                key={achievement.id}
                className="p-4 bg-accent/20 border-accent animate-celebration glow-streak"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    <IconComponent className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-accent-foreground">
                      Achievement Unlocked!
                    </div>
                    <div className="font-semibold">{achievement.name}</div>
                    <div className="text-sm opacity-80">{achievement.description}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Particle Effects for Streaks */}
      {streak >= 10 && isCorrect && showFeedback && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-particle-burst"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}