import { useState, useCallback } from 'react';

interface GameState {
  streak: number;
  combo: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeBonus: number;
  achievements: string[];
  multiplier: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first_correct',
    name: 'First Blood',
    description: 'Got your first question right!',
    icon: '🎯',
    condition: (state) => state.correctAnswers === 1
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Answer 5 questions correctly in a row',
    icon: '🔥',
    condition: (state) => state.streak >= 5
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Answer 10 questions correctly in a row',
    icon: '⚡',
    condition: (state) => state.streak >= 10
  },
  {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Answer all questions correctly',
    icon: '👑',
    condition: (state) => state.correctAnswers === state.totalQuestions && state.totalQuestions > 0
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Earned significant time bonus',
    icon: '💨',
    condition: (state) => state.timeBonus > 50
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Answer 3 correct after 3 incorrect',
    icon: '💪',
    condition: (state) => state.streak >= 3 && state.incorrectAnswers >= 3
  }
];

export function useGameification(totalQuestions: number) {
  const [gameState, setGameState] = useState<GameState>({
    streak: 0,
    combo: 0,
    score: 0,
    totalQuestions,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeBonus: 0,
    achievements: [],
    multiplier: 1
  });

  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [showCombo, setShowCombo] = useState(false);

  const calculateMultiplier = (streak: number): number => {
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    if (streak >= 3) return 1.5;
    return 1;
  };

  const calculateScore = (isCorrect: boolean, timeLeft: number, maxTime: number): number => {
    if (!isCorrect) return 0;
    
    const basePoints = 100;
    const timeBonus = Math.floor((timeLeft / maxTime) * 50);
    const multiplier = calculateMultiplier(gameState.streak);
    
    return Math.floor((basePoints + timeBonus) * multiplier);
  };

  const checkAchievements = useCallback((newState: GameState) => {
    const newAchievements = achievements.filter(
      achievement => 
        !newState.achievements.includes(achievement.id) &&
        achievement.condition(newState)
    );

    if (newAchievements.length > 0) {
      setRecentAchievements(newAchievements);
      return newAchievements.map(a => a.id);
    }
    return [];
  }, []);

  const answerQuestion = useCallback((isCorrect: boolean, timeLeft: number, maxTime: number = 120) => {
    setGameState(prevState => {
      const newStreak = isCorrect ? prevState.streak + 1 : 0;
      const newCombo = isCorrect ? prevState.combo + 1 : 0;
      const questionScore = calculateScore(isCorrect, timeLeft, maxTime);
      const timeBonus = isCorrect ? Math.floor((timeLeft / maxTime) * 50) : 0;
      
      const newState = {
        ...prevState,
        streak: newStreak,
        combo: newCombo,
        score: prevState.score + questionScore,
        correctAnswers: isCorrect ? prevState.correctAnswers + 1 : prevState.correctAnswers,
        incorrectAnswers: !isCorrect ? prevState.incorrectAnswers + 1 : prevState.incorrectAnswers,
        timeBonus: prevState.timeBonus + timeBonus,
        multiplier: calculateMultiplier(newStreak)
      };

      // Check for achievements
      const newAchievementIds = checkAchievements(newState);
      newState.achievements = [...prevState.achievements, ...newAchievementIds];

      return newState;
    });

    // Show combo animation for streaks
    if (isCorrect && gameState.streak >= 2) {
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 2000);
    }

    return {
      isCorrect,
      score: calculateScore(isCorrect, timeLeft, maxTime),
      streak: isCorrect ? gameState.streak + 1 : 0,
      multiplier: calculateMultiplier(isCorrect ? gameState.streak + 1 : 0)
    };
  }, [gameState.streak, checkAchievements]);

  const resetGame = useCallback(() => {
    setGameState({
      streak: 0,
      combo: 0,
      score: 0,
      totalQuestions,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeBonus: 0,
      achievements: [],
      multiplier: 1
    });
    setRecentAchievements([]);
    setShowCombo(false);
  }, [totalQuestions]);

  const dismissAchievement = useCallback((achievementId: string) => {
    setRecentAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  return {
    gameState,
    recentAchievements,
    showCombo,
    answerQuestion,
    resetGame,
    dismissAchievement,
    calculateScore: (timeLeft: number, maxTime: number = 120) => 
      calculateScore(true, timeLeft, maxTime)
  };
}