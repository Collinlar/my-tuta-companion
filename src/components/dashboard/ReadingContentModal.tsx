import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  StickyNote,
  Save,
  Timer
} from 'lucide-react';

interface ReadingContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  estimatedTime: string;
  onComplete: (notes: string, timeSpent: number) => void;
}

export function ReadingContentModal({
  isOpen,
  onClose,
  title,
  content,
  estimatedTime,
  onComplete
}: ReadingContentModalProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [startTime] = useState(Date.now());

  // Track reading progress
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        const scrollTop = scrollArea.scrollTop;
        const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setReadingProgress(progress);
      }
    };

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }

    return () => {
      clearInterval(interval);
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isOpen, startTime]);

  const handleComplete = () => {
    onComplete(notes, timeSpent);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedMinutes = parseInt(estimatedTime.replace(/\D/g, ''));
  const isGoodPace = readingProgress > 0 && timeSpent > 0 && 
    (timeSpent / 60) < estimatedMinutes * 1.5; // Allow 50% extra time

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Progress and Stats */}
          <div className="flex-shrink-0 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {estimatedTime}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {formatTime(timeSpent)}
                </Badge>
                <Badge 
                  variant={isGoodPace ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {readingProgress.toFixed(0)}% Read
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="completed"
                  checked={isCompleted}
                  onCheckedChange={setIsCompleted}
                />
                <label htmlFor="completed" className="text-sm font-medium">
                  Mark as Complete
                </label>
              </div>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 mb-4">
            <div className="prose prose-lg max-w-none p-4 bg-muted/30 rounded-lg">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: content.replace(/\n/g, '<br/>') 
                }} 
              />
            </div>
          </ScrollArea>

          {/* Notes Section */}
          <div className="flex-shrink-0 space-y-3">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              <span className="text-sm font-medium">Your Notes</span>
            </div>
            <Textarea
              placeholder="Take notes while reading... (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Save notes without completing
                  console.log('Notes saved:', notes);
                }}
                disabled={!notes.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Notes
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!isCompleted}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Reading
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
