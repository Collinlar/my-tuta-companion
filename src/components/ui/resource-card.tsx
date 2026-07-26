import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, FileText, Calculator, Globe, BookOpen, Clock } from "lucide-react";
import { Resource } from "@/types/task";

interface ResourceCardProps {
  resource: Resource;
  onOpen: (resource: Resource) => void;
}

export function ResourceCard({ resource, onOpen }: ResourceCardProps) {
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'practice': return <Calculator className="w-4 h-4" />;
      case 'interactive': return <Globe className="w-4 h-4" />;
      case 'document': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: Resource['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {getResourceIcon(resource.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2">{resource.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpen(resource)}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {resource.description}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {resource.source}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${getDifficultyColor(resource.difficulty)}`}
            >
              {resource.difficulty}
            </Badge>
            {resource.duration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {resource.duration}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
