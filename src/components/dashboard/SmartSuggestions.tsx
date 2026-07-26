import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Target, TrendingUp, BookOpen, Zap, Sparkles } from "lucide-react";

interface SmartSuggestionsProps {
  currentView: string;
  userType: 'student' | 'teacher';
  userActivity?: any;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'tip' | 'reminder' | 'achievement';
  priority: 'high' | 'medium' | 'low';
  icon: any;
  action?: () => void;
  metadata?: any;
}

export function SmartSuggestions({ currentView, userType, userActivity }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    generateSuggestions();
  }, [currentView, userType, userActivity]);

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based suggestions
    if (hour >= 6 && hour <= 9) {
      newSuggestions.push({
        id: 'morning-study',
        title: 'Good morning! Ready to study?',
        description: userType === 'teacher' 
          ? 'Start your day by reviewing today\'s lesson plans'
          : 'Perfect time for a focused study session',
        type: 'tip',
        priority: 'medium',
        icon: Clock,
        metadata: { timeBased: true }
      });
    }

    if (hour >= 18 && hour <= 22) {
      newSuggestions.push({
        id: 'evening-review',
        title: 'Evening review time',
        description: userType === 'teacher'
          ? 'Review today\'s student progress and plan for tomorrow'
          : 'Great time to review flashcards and consolidate learning',
        type: 'tip',
        priority: 'medium',
        icon: TrendingUp,
        metadata: { timeBased: true }
      });
    }

    // Context-based suggestions
    switch (currentView) {
      case 'overview':
        // Check if user is new (no activity data)
        const isNewUser = !userActivity || (
          !userActivity.hasUploadedNotes && 
          !userActivity.hasSelectedGoals && 
          userActivity.flashcardStreak === 0 && 
          userActivity.averageScore === 0
        );
        
        if (isNewUser) {
          newSuggestions.push({
            id: 'welcome-message',
            title: `Welcome to mytuta AI, ${userType === 'teacher' ? 'Educator' : 'Learner'}! 🎉`,
            description: userType === 'teacher'
              ? 'Start by uploading your lesson materials to create comprehensive lesson plans with AI assistance.'
              : 'Begin your learning journey by uploading your notes to get personalized study materials and flashcards.',
            type: 'welcome',
            priority: 'high',
            icon: Sparkles,
            action: () => {
              // Navigate to notes upload
              console.log('Navigate to notes upload');
            }
          });
        } else {
          newSuggestions.push({
            id: 'first-notes',
            title: 'Ready to get started?',
            description: userType === 'teacher'
              ? 'Upload your lesson materials to create comprehensive lesson plans'
              : 'Upload your notes to get personalized study materials',
            type: 'action',
            priority: 'high',
            icon: BookOpen,
            action: () => {
              // Navigate to notes upload
              console.log('Navigate to notes upload');
            }
          });
        }
        break;

      case 'notes':
        if (!userActivity?.hasUploadedNotes) {
          newSuggestions.push({
            id: 'upload-notes',
            title: 'Upload your first notes',
            description: 'Start by uploading your study materials to unlock AI-powered features',
            type: 'action',
            priority: 'high',
            icon: Target
          });
        } else if (!userActivity?.hasSelectedGoals) {
          newSuggestions.push({
            id: 'select-goals',
            title: 'Choose your learning goals',
            description: 'Select what you want to achieve to get personalized recommendations',
            type: 'action',
            priority: 'high',
            icon: Target
          });
        }
        break;

      case 'flashcards':
        if (userActivity?.flashcardStreak === 0) {
          newSuggestions.push({
            id: 'start-flashcards',
            title: 'Start your flashcard journey',
            description: 'Begin studying with flashcards to build your knowledge base',
            type: 'action',
            priority: 'medium',
            icon: Zap
          });
        } else if (userActivity?.flashcardStreak >= 3) {
          newSuggestions.push({
            id: 'streak-achievement',
            title: `Amazing! ${userActivity.flashcardStreak} day streak!`,
            description: 'Keep up the great work! Consistency is key to learning',
            type: 'achievement',
            priority: 'medium',
            icon: Sparkles
          });
        }
        break;

      case 'progress':
        if (userActivity?.averageScore < 70) {
          newSuggestions.push({
            id: 'improve-scores',
            title: 'Boost your performance',
            description: 'Try reviewing flashcards more regularly to improve your quiz scores',
            type: 'tip',
            priority: 'medium',
            icon: TrendingUp
          });
        } else if (userActivity?.averageScore >= 85) {
          newSuggestions.push({
            id: 'excellent-progress',
            title: 'Excellent progress!',
            description: 'You\'re performing really well. Consider challenging yourself with contests',
            type: 'achievement',
            priority: 'low',
            icon: Sparkles
          });
        }
        break;
    }

    // Filter out dismissed suggestions
    const filteredSuggestions = newSuggestions.filter(
      suggestion => !dismissedSuggestions.includes(suggestion.id)
    );

    setSuggestions(filteredSuggestions);
  };

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tip': return 'bg-green-100 text-green-700 border-green-200';
      case 'reminder': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'achievement': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      {suggestions.slice(0, 3).map((suggestion) => {
        const Icon = suggestion.icon;
        return (
          <Card
            key={suggestion.id}
            className={`p-4 border-l-4 transition-all hover:shadow-md ${
              suggestion.type === 'action' 
                ? 'border-l-blue-500 bg-blue-50/50' 
                : suggestion.type === 'achievement'
                ? 'border-l-purple-500 bg-purple-50/50'
                : 'border-l-green-500 bg-green-50/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  suggestion.type === 'action' 
                    ? 'bg-blue-100 text-blue-600' 
                    : suggestion.type === 'achievement'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-900">{suggestion.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTypeColor(suggestion.type)}`}
                    >
                      {suggestion.type}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(suggestion.priority)}`} />
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
                  {suggestion.action && (
                    <Button
                      size="sm"
                      onClick={suggestion.action}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      Take Action
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissSuggestion(suggestion.id)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
              >
                ×
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
