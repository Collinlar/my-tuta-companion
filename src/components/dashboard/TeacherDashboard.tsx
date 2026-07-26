import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Compass, 
  Brain, 
  HelpCircle, 
  Trophy,
  Upload,
  Share2,
  Plus,
  Edit,
  Eye,
  Download,
  Trash2,
  Users
} from 'lucide-react';
import { smartStorage } from '@/services/smartStorageService';
import type { UserProfile } from '@/types/storage';
import { generateShareLink, copyToClipboard } from '@/lib/shareLinks';

interface TeacherDashboardProps {
  onContentAction?: (type: string, action: string, contentData?: any) => void;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  subject: string;
  grade: string;
  status: 'draft' | 'shared' | 'published';
  createdAt: string;
  students: number;
  content?: any;
}

export function TeacherDashboard({ onContentAction }: TeacherDashboardProps) {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('Teacher');

  // Load user profile
  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const profile = smartStorage.getUserProfile();
        if (profile && profile.name) {
          // Extract first name or use full name
          const firstName = profile.name.split(' ')[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserName('Teacher');
      }
    };

    loadUserProfile();
  }, []);

  // Load content from localStorage
  useEffect(() => {
    const loadContent = () => {
      const savedContent = localStorage.getItem('teacherContent');
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        // Sort by creation date (newest first) and take first 6
        const sorted = parsed.sort((a: ContentItem, b: ContentItem) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentContent(sorted.slice(0, 6));
      } else {
        // Initialize with empty array for new users
        setRecentContent([]);
      }
      setIsLoading(false);
    };

    loadContent();

    // Listen for content updates
    const handleContentUpdate = () => {
      loadContent();
    };

    window.addEventListener('contentUpdated', handleContentUpdate);
    return () => window.removeEventListener('contentUpdated', handleContentUpdate);
  }, []);

  const contentTypes = [
    {
      id: 'lesson',
      title: 'Lesson Planner',
      icon: BookOpen,
      description: 'Create structured lesson plans with AI assistance',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'learning-path',
      title: 'Learning Path',
      icon: Compass,
      description: 'Design comprehensive learning journeys',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      icon: Brain,
      description: 'Generate interactive study cards',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 'quizzes',
      title: 'Quizzes',
      icon: HelpCircle,
      description: 'Create assessments and tests',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      id: 'contests',
      title: 'Contests',
      icon: Trophy,
      description: 'Build competitive learning games',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'shared':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = contentTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.icon : BookOpen;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleDeleteContent = (id: string) => {
    const updatedContent = recentContent.filter(item => item.id !== id);
    setRecentContent(updatedContent);
    
    // Update localStorage
    const allContent = JSON.parse(localStorage.getItem('teacherContent') || '[]');
    const filteredContent = allContent.filter((item: ContentItem) => item.id !== id);
    localStorage.setItem('teacherContent', JSON.stringify(filteredContent));
  };

  const handleShareContent = async (item: ContentItem) => {
    const shareLink = generateShareLink(item.type, item.id);
    const success = await copyToClipboard(shareLink);
    if (success) {
      alert('Share link copied to clipboard!');
    } else {
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleViewAll = () => {
    // Navigate to a dedicated content management view
    // For now, we'll show all content in the same view by increasing the limit
    const savedContent = localStorage.getItem('teacherContent');
    if (savedContent) {
      const allContent = JSON.parse(savedContent);
      const sorted = allContent.sort((a: ContentItem, b: ContentItem) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentContent(sorted); // Show all content instead of just 6
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">👨‍🏫</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900">
              Hello {userName}, what do you want to create today?
            </h1>
            <p className="text-slate-600">
              Choose a content type to get started with AI-powered creation
            </p>
          </div>
        </div>
      </div>

      {/* Content Creation CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card 
              key={type.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 group"
              onClick={() => onContentAction?.(type.id, 'create')}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {type.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    className={`${type.bgColor} ${type.textColor} hover:opacity-80 border-0`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                  <Button size="sm" variant="outline" className="group-hover:border-teal-300">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Recent Content</h2>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentContent.map((content) => {
              const IconComponent = getTypeIcon(content.type);
              return (
                <Card key={content.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{content.title}</h3>
                        <p className="text-xs text-slate-600">{content.subject} - {content.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => onContentAction?.(content.type, 'edit')}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                        {content.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Students</span>
                      <span className="font-medium">{content.students}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Created</span>
                      <span className="text-slate-500">{formatTimeAgo(content.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onContentAction?.(content.type, 'view', content)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onContentAction?.(content.type, 'assign')}
                      title="Assign to students"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    {content.status === 'shared' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShareContent(content)}
                        title="Share link"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && recentContent.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No content yet</h3>
            <p className="text-slate-600 mb-4">Create your first educational content to get started</p>
            <Button onClick={() => onContentAction?.('lesson', 'create')} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Need Help Getting Started?
          </h3>
          <p className="text-slate-600 mb-4">
            Upload your notes or enter a topic to let AI generate content for you
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              onClick={() => onContentAction?.('upload', 'upload')}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Notes
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => onContentAction?.('topic', 'enter')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Enter Topic
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
