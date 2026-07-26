import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, FileText, BookOpen, Zap, Clock } from 'lucide-react';
import { Resource } from '@/types/task';

interface ResourceCardProps {
  resource: Resource;
  onResourceClick?: (resource: Resource) => void;
}

export function ResourceCard({ resource, onResourceClick }: ResourceCardProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'article':
      case 'document':
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'interactive':
        return <Zap className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'article':
      case 'document':
      case 'pdf':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interactive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'course':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResourceClick = () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
    if (onResourceClick) {
      onResourceClick(resource);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getResourceColor(resource.type)}`}>
              {getResourceIcon(resource.type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                {resource.title}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">{resource.source}</p>
            </div>
          </div>
          {resource.url && (
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {resource.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
              {resource.difficulty}
            </Badge>
            {resource.duration && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {resource.duration}
              </div>
            )}
          </div>
          
          {resource.url ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResourceClick}
              className="text-xs"
            >
              Open Resource
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="text-xs"
            >
              No Link Available
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ResourceGridProps {
  resources: Resource[];
  onResourceClick?: (resource: Resource) => void;
  title?: string;
}

export function ResourceGrid({ resources, onResourceClick, title }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No resources available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onResourceClick={onResourceClick}
          />
        ))}
      </div>
    </div>
  );
}
