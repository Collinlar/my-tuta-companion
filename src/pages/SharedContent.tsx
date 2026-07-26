import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  HelpCircle, 
  Trophy, 
  Compass,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { RichContentRenderer } from '@/components/dashboard/RichContentRenderer';
import { InteractiveFlashcards } from '@/components/dashboard/InteractiveFlashcards';
import { InteractiveQuiz } from '@/components/dashboard/InteractiveQuiz';
import { InteractiveContest } from '@/components/dashboard/InteractiveContest';
import { InteractiveLearningPath } from '@/components/dashboard/InteractiveLearningPath';
import { copyToClipboard } from '@/lib/shareLinks';

interface SharedContentData {
  id: string;
  type: string;
  title: string;
  subject: string;
  grade: string;
  createdAt: string;
  content?: any;
}

export default function SharedContent() {
  const { contentType, contentId } = useParams<{ contentType: string; contentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<SharedContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadSharedContent = () => {
      try {
        // In a real application, this would fetch from a database/API
        // For now, we'll try to load from localStorage
        const savedContent = localStorage.getItem('teacherContent');
        
        if (savedContent) {
          const allContent = JSON.parse(savedContent);
          const foundContent = allContent.find((item: any) => item.id === contentId);
          
          if (foundContent) {
            setContent(foundContent);
            setError(null);
          } else {
            setError('Content not found. It may have been deleted or is no longer available.');
          }
        } else {
          setError('Content not found. It may have been deleted or is no longer available.');
        }
      } catch (err) {
        console.error('Error loading shared content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedContent();
  }, [contentId]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'flashcards': return Brain;
      case 'quizzes': return HelpCircle;
      case 'contests': return Trophy;
      case 'learning-path': return Compass;
      default: return BookOpen;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson': return 'Lesson Plan';
      case 'flashcards': return 'Flashcards';
      case 'quizzes': return 'Quiz';
      case 'contests': return 'Contest';
      case 'learning-path': return 'Learning Path';
      default: return 'Content';
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const renderContent = () => {
    if (!content) return null;

    switch (content.type) {
      case 'lesson':
        return <RichContentRenderer content={content.content} />;
      case 'flashcards':
        return <InteractiveFlashcards flashcards={content.content} />;
      case 'quizzes':
        return <InteractiveQuiz quiz={content.content} />;
      case 'contests':
        return <InteractiveContest contest={content.content} />;
      case 'learning-path':
        return <InteractiveLearningPath path={content.content} />;
      default:
        return <RichContentRenderer content={content.content} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
            <p className="text-lg text-slate-600">Loading shared content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Content Not Found</h2>
                <p className="text-slate-600">{error}</p>
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => navigate('/')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Button>
                  <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                    Sign Up to Create Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const ContentIcon = getContentIcon(content.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ContentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{getContentTypeLabel(content.type)}</Badge>
                      <Badge variant="outline">{content.subject}</Badge>
                      <Badge variant="outline">{content.grade}</Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
                    <p className="text-sm text-slate-600">
                      Shared on {new Date(content.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyLink}
                  className="ml-4"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-6 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Want to create your own content?</h3>
                <p className="text-teal-50">
                  Join mytuta AI and create personalized learning materials with AI assistance
                </p>
              </div>
              <Button 
                onClick={() => navigate('/signup')}
                className="bg-white text-teal-600 hover:bg-teal-50"
              >
                Get Started Free
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

