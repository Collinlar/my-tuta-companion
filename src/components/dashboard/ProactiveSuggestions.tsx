import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  X, 
  Clock, 
  Target, 
  TrendingUp, 
  Coffee, 
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { proactiveAI, ProactiveSuggestion } from '@/services/proactiveAI';

interface ProactiveSuggestionsProps {
  onSuggestionAction: (action: string, data?: any) => void;
  onDismiss: (suggestionId: string) => void;
}

export function ProactiveSuggestions({ onSuggestionAction, onDismiss }: ProactiveSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const newSuggestions = await proactiveAI.analyzeAndSuggest();
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (suggestionId: string) => {
    proactiveAI.dismissSuggestion(suggestionId);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    onDismiss(suggestionId);
  };

  const handleAction = (suggestion: ProactiveSuggestion) => {
    if (suggestion.action) {
      onSuggestionAction(suggestion.action.type, suggestion.action.data);
    }
    handleDismiss(suggestion.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'encouragement': return CheckCircle;
      case 'break': return Coffee;
      case 'study_plan': return BookOpen;
      case 'difficulty_adjustment': return AlertCircle;
      case 'goal_progress': return TrendingUp;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'text-orange-600';
      case 'encouragement': return 'text-green-600';
      case 'break': return 'text-blue-600';
      case 'study_plan': return 'text-purple-600';
      case 'difficulty_adjustment': return 'text-red-600';
      case 'goal_progress': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">All Caught Up!</h3>
        <p className="text-sm text-slate-600">No suggestions at the moment. Keep up the great work!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Smart Suggestions
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSuggestions}
          className="text-slate-600 hover:text-slate-900"
        >
          <Zap className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {suggestions.map((suggestion) => {
        const IconComponent = getTypeIcon(suggestion.type);
        
        return (
          <Card key={suggestion.id} className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                suggestion.type === 'encouragement' ? 'bg-green-100' :
                suggestion.type === 'reminder' ? 'bg-orange-100' :
                suggestion.type === 'break' ? 'bg-blue-100' :
                suggestion.type === 'study_plan' ? 'bg-purple-100' :
                suggestion.type === 'difficulty_adjustment' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                <IconComponent className={`w-4 h-4 ${getTypeColor(suggestion.type)}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {suggestion.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {suggestion.message}
                    </p>
                    
                    {suggestion.action && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(suggestion)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        {suggestion.action.label}
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(suggestion.id)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {suggestion.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {suggestion.expiresAt && (
                    <>
                      <span>•</span>
                      <span>
                        Expires {suggestion.expiresAt.toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
