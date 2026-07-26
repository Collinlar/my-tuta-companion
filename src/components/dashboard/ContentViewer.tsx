import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichContentRenderer } from './RichContentRenderer';
import { InteractiveFlashcards } from './InteractiveFlashcards';
import { InteractiveQuiz } from './InteractiveQuiz';
import { InteractiveContest } from './InteractiveContest';
import { InteractiveLearningPath } from './InteractiveLearningPath';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Eye, 
  Share2, 
  Users, 
  Calendar, 
  BookOpen,
  Brain,
  HelpCircle,
  Trophy,
  Compass,
  Target,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { generateShareLink, copyToClipboard } from '@/lib/shareLinks';

interface ContentViewerProps {
  content: {
    id: string;
    type: string;
    title: string;
    subject: string;
    grade: string;
    status: 'draft' | 'shared' | 'published';
    createdAt: string;
    students: number;
    content?: any;
  };
  onBack: () => void;
  onEdit?: () => void;
  onAssign?: () => void;
  studentMode?: boolean;
}

export function ContentViewer({ content, onBack, onEdit, onAssign, studentMode = false }: ContentViewerProps) {
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate share link on mount or when content changes
  useEffect(() => {
    const link = generateShareLink(content.type, content.id);
    setShareLink(link);
  }, [content.type, content.id]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'shared': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const renderContentPreview = () => {
    // Debug: Log the content structure
    console.log('ContentViewer - Content structure:', {
      content: content.content,
      contentType: typeof content.content,
      hasContent: !!content.content
    });

    if (!content.content) {
      return (
        <div className="text-center py-8 text-slate-500">
          <Eye className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p>Content preview not available</p>
          <p className="text-xs mt-2">Debug: content.content is {typeof content.content}</p>
        </div>
      );
    }

    const IconComponent = getContentIcon(content.type);

    // For interactive content types, render appropriate interactive components
    if (content.type === 'flashcards' && typeof content.content === 'object' && content.content.cards) {
      return (
        <InteractiveFlashcards 
          flashcards={content.content.cards}
          title={content.title}
          studentMode={studentMode}
          onComplete={(results) => {
            console.log('Flashcard results:', results);
            // Here you would typically save results to backend
          }}
        />
      );
    }

    if (content.type === 'quizzes' && typeof content.content === 'object' && content.content.questions) {
      return (
        <InteractiveQuiz 
          questions={content.content.questions}
          title={content.title}
          timeLimit={content.content.timeLimit}
          studentMode={studentMode}
          onComplete={(results) => {
            console.log('Quiz results:', results);
            // Here you would typically save results to backend
          }}
        />
      );
    }

    if (content.type === 'contests' && typeof content.content === 'object' && content.content.problems) {
      return (
        <InteractiveContest 
          problems={content.content.problems}
          title={content.title}
          totalTimeLimit={content.content.totalTimeLimit}
          studentMode={studentMode}
          onComplete={(results) => {
            console.log('Contest results:', results);
            // Here you would typically save results to backend
          }}
        />
      );
    }

    if (content.type === 'learning-path' && typeof content.content === 'object' && content.content.milestones) {
      return (
        <InteractiveLearningPath 
          milestones={content.content.milestones}
          title={content.title}
          description={content.content.description}
          estimatedDuration={content.content.estimatedDuration}
          studentMode={studentMode}
          onComplete={(results) => {
            console.log('Learning path results:', results);
            // Here you would typically save results to backend
          }}
        />
      );
    }

    // If content is a string (from AI generation), use RichContentRenderer
    if (typeof content.content === 'string' && content.content.trim().length > 0) {
      return (
        <RichContentRenderer 
          content={content.content}
          contentType={content.type}
          title={content.title}
        />
      );
    }

    // If content is an object, try to extract the text content
    if (typeof content.content === 'object' && content.content !== null) {
      const textContent = content.content.content || content.content.text || content.content.description || JSON.stringify(content.content);
      if (textContent && typeof textContent === 'string') {
        return (
          <RichContentRenderer 
            content={textContent}
            contentType={content.type}
            title={content.title}
          />
        );
      }
    }

    switch (content.type) {
      case 'lesson':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Lesson Plan</h2>
                <p className="text-slate-600">{content.title}</p>
              </div>
            </div>
            
            {content.content.objectives && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  {content.content.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.content.activities && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Activities</h3>
                <div className="space-y-4">
                  {content.content.activities.map((activity: any, index: number) => (
                    <Card key={index} className="border border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{activity.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {activity.duration || 'N/A'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{activity.description}</p>
                        {activity.materials && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Materials: </span>
                            <span className="text-xs text-slate-600">{activity.materials.join(', ')}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {content.content.assessment && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Assessment</h3>
                <p className="text-slate-700">{content.content.assessment}</p>
              </div>
            )}
          </div>
        );

      case 'flashcards':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Flashcard Set</h2>
                <p className="text-slate-600">{content.title}</p>
              </div>
            </div>

            {content.content.cards && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Flashcards ({content.content.cards.length} cards)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.content.cards.slice(0, 6).map((card: any, index: number) => (
                    <Card key={index} className="border border-slate-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-medium text-slate-500">Front</span>
                            <p className="text-slate-900 font-medium">{card.front}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-500">Back</span>
                            <p className="text-slate-700">{card.back}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {content.content.cards.length > 6 && (
                  <p className="text-center text-slate-500 mt-4">
                    ... and {content.content.cards.length - 6} more cards
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'quizzes':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Quiz</h2>
                <p className="text-slate-600">{content.title}</p>
              </div>
            </div>

            {content.content.questions && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Questions ({content.content.questions.length} questions)
                </h3>
                <div className="space-y-4">
                  {content.content.questions.slice(0, 3).map((question: any, index: number) => (
                    <Card key={index} className="border border-slate-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-medium text-slate-500">Question {index + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {question.type}
                            </Badge>
                          </div>
                          <p className="text-slate-900 font-medium">{question.question}</p>
                          {question.options && (
                            <div className="space-y-1">
                              {question.options.map((option: string, optIndex: number) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500 w-6">{String.fromCharCode(65 + optIndex)}.</span>
                                  <span className="text-slate-700 text-sm">{option}</span>
                                  {optIndex === question.correct && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Correct</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {question.type === 'true-false' && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Answer:</span>
                              <Badge className={question.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {question.correct ? 'True' : 'False'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {content.content.questions.length > 3 && (
                  <p className="text-center text-slate-500 mt-4">
                    ... and {content.content.questions.length - 3} more questions
                  </p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{content.type}</h2>
                <p className="text-slate-600">{content.title}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
              <pre className="whitespace-pre-wrap text-slate-700 text-sm">
                {typeof content.content === 'string' ? content.content : JSON.stringify(content.content, null, 2)}
              </pre>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
            <p className="text-slate-600">{content.subject} - {content.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Content
            </Button>
          )}
          {onAssign && (
            <Button onClick={onAssign} className="bg-teal-600 hover:bg-teal-700">
              <Users className="w-4 h-4 mr-2" />
              Assign to Students
            </Button>
          )}
        </div>
      </div>

      {/* Content Metadata */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Badge className={getStatusColor(content.status)}>
                  {content.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-medium capitalize">{content.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Students</p>
                <p className="font-medium">{content.students}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="font-medium">{formatDate(content.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Share Link</p>
                <div className="flex items-center gap-1">
                  <input 
                    value={shareLink} 
                    readOnly 
                    className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 flex-1"
                  />
                  <Button size="sm" variant="ghost" onClick={handleCopyLink} className="h-6 w-6 p-0">
                    {copySuccess ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Content Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContentPreview()}
        </CardContent>
      </Card>
    </div>
  );
}
