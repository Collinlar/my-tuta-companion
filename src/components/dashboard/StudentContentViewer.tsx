import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  HelpCircle, 
  Trophy, 
  Compass,
  Play,
  CheckCircle,
  Clock,
  Star,
  Award,
  Users,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { RichContentRenderer } from './RichContentRenderer';

interface StudentContentViewerProps {
  content: {
    id: string;
    type: string;
    title: string;
    subject: string;
    grade: string;
    content: string;
    teacherName?: string;
    schoolName?: string;
  };
}

export function StudentContentViewer({ content }: StudentContentViewerProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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

  const getContentColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'blue';
      case 'flashcards': return 'purple';
      case 'quizzes': return 'orange';
      case 'contests': return 'yellow';
      case 'learning-path': return 'teal';
      default: return 'gray';
    }
  };

  const color = getContentColor(content.type);
  const IconComponent = getContentIcon(content.type);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleComplete = () => {
    // Here you would typically save progress, send completion data, etc.
    alert('Great job! You\'ve completed this content. Your progress has been saved.');
  };

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-6">
          <div className={`w-20 h-20 bg-${color}-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
            <IconComponent className={`w-10 h-10 text-${color}-600`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{content.title}</h1>
            <p className="text-lg text-slate-600">{content.subject} - {content.grade}</p>
            {content.teacherName && (
              <p className="text-sm text-slate-500 mt-1">
                Created by {content.teacherName}
                {content.schoolName && ` • ${content.schoolName}`}
              </p>
            )}
          </div>
        </div>

        {/* Content Preview Card */}
        <Card className="border-2 border-slate-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <span className={`inline-block w-2 h-2 bg-${color}-500 rounded-full`}></span>
              {content.type === 'lesson' ? 'Lesson Plan' : 
               content.type === 'flashcards' ? 'Flashcard Set' :
               content.type === 'quizzes' ? 'Quiz' :
               content.type === 'contests' ? 'Contest' :
               content.type === 'learning-path' ? 'Learning Path' :
               content.type}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">
                  {content.content.split(/\s+/).length}
                </div>
                <div className="text-sm text-slate-600">Words</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">
                  {(content.content.match(/\*\*.*?\*\*/g) || []).length}
                </div>
                <div className="text-sm text-slate-600">Sections</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">
                  {Math.ceil(content.content.split(/\s+/).length / 200)}
                </div>
                <div className="text-sm text-slate-600">Min Read</div>
              </div>
            </div>

            {/* Preview Text */}
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 text-sm leading-relaxed">
                {content.content.substring(0, 200)}...
              </p>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <Button 
                onClick={handleStart}
                size="lg"
                className={`bg-${color}-600 hover:bg-${color}-700 text-white px-8 py-3 text-lg font-semibold shadow-lg`}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Learning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learning Tips */}
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Learning Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Take Your Time</h4>
                  <p className="text-sm text-slate-600">Read through each section carefully and take notes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Practice Active Learning</h4>
                  <p className="text-sm text-slate-600">Engage with the material by asking questions and making connections.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
            <p className="text-slate-600">{content.subject} - {content.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`bg-${color}-100 text-${color}-800`}>
            In Progress
          </Badge>
        </div>
      </div>

      {/* Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <RichContentRenderer 
            content={content.content}
            contentType={content.type}
            title={content.title}
          />
        </CardContent>
      </Card>

      {/* Completion Section */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Congratulations! You've completed this content.
              </h3>
              <p className="text-green-700 mb-4">
                Great work! Your progress has been tracked and your teacher has been notified.
              </p>
              <Button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
