import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  HelpCircle, 
  Trophy, 
  Compass, 
  Target, 
  Clock, 
  Users, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  FileText,
  List,
  Hash
} from 'lucide-react';

interface RichContentRendererProps {
  content: string;
  contentType: string;
  title: string;
}

export function RichContentRenderer({ content, contentType, title }: RichContentRendererProps) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'flashcards': return Brain;
      case 'quizzes': return HelpCircle;
      case 'contests': return Trophy;
      case 'learning-path': return Compass;
      default: return FileText;
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

  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let currentSection: ReactNode[] = [];
    let sectionTitle = '';
    let isInList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 ml-6">
            {listItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{item.trim()}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        isInList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        if (currentSection.length > 0) {
          elements.push(
            <div key={`section-${elements.length}`} className="space-y-3">
              {currentSection}
            </div>
          );
          currentSection = [];
        }
        return;
      }

      // Detect section headers (bold text or titles)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        flushList();
        const headerText = trimmedLine.slice(2, -2);
        elements.push(
          <div key={`header-${elements.length}`} className="mt-6 first:mt-0">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              {headerText}
            </h3>
          </div>
        );
        return;
      }

      // Detect numbered lists
      if (/^\d+\./.test(trimmedLine)) {
        flushList();
        const itemText = trimmedLine.replace(/^\d+\.\s*/, '');
        elements.push(
          <div key={`numbered-${elements.length}`} className="flex items-start gap-3 ml-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs font-mono w-6 h-6 flex items-center justify-center p-0 flex-shrink-0 mt-0.5">
              {trimmedLine.match(/^\d+/)?.[0]}
            </Badge>
            <span className="text-slate-700">{itemText}</span>
          </div>
        );
        return;
      }

      // Detect bullet points or list items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        if (!isInList) {
          flushList();
          isInList = true;
        }
        listItems.push(trimmedLine.replace(/^[-•]\s*/, ''));
        return;
      }

      // Regular paragraph
      flushList();
      if (trimmedLine.length > 0) {
        elements.push(
          <p key={`para-${elements.length}`} className="text-slate-700 leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
    });

    flushList();
    if (currentSection.length > 0) {
      elements.push(
        <div key={`section-${elements.length}`} className="space-y-3">
          {currentSection}
        </div>
      );
    }

    return elements;
  };

  const color = getContentColor(contentType);
  const IconComponent = getContentIcon(contentType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 bg-${color}-100 rounded-xl flex items-center justify-center shadow-sm`}>
          <IconComponent className={`w-7 h-7 text-${color}-600`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {contentType === 'lesson' ? 'Lesson Plan' : 
             contentType === 'flashcards' ? 'Flashcard Set' :
             contentType === 'quizzes' ? 'Quiz' :
             contentType === 'contests' ? 'Contest' :
             contentType === 'learning-path' ? 'Learning Path' :
             contentType}
          </h2>
          <p className="text-slate-600 font-medium">{title}</p>
        </div>
      </div>

      {/* Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            {parseContent(content)}
          </div>
        </CardContent>
      </Card>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Content Type</span>
            </div>
            <Badge className={`bg-${color}-100 text-${color}-800 capitalize`}>
              {contentType}
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Hash className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Word Count</span>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {content.split(/\s+/).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <List className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Sections</span>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {(content.match(/\*\*.*?\*\*/g) || []).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
