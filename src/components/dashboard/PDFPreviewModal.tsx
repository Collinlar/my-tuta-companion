import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Clock, 
  FileText, 
  CheckCircle,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Timer
} from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string; // AI-generated content that will be formatted as PDF
  url?: string; // Real PDF URL for embedding
  estimatedTime: string;
  onComplete: (timeSpent: number, pagesViewed: number) => void;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  title,
  content,
  url,
  estimatedTime,
  onComplete
}: PDFPreviewModalProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3); // Simulate 3 pages
  const [zoom, setZoom] = useState(100);
  const [pagesViewed, setPagesViewed] = useState(new Set<number>());
  const [startTime] = useState(Date.now());

  // Helper function to check if URL is a PDF
  const isPDFUrl = (url: string): boolean => {
    return url.toLowerCase().includes('.pdf') || url.includes('pdf');
  };

  // Helper function to get PDF embed URL
  const getPDFEmbedUrl = (url: string): string => {
    // For Google Drive PDFs
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    // For direct PDF URLs
    return url;
  };

  // Simulate PDF pages from content
  const pages = [
    {
      title: "Introduction & Overview",
      content: content.split('\n').slice(0, Math.floor(content.split('\n').length / 3)).join('\n')
    },
    {
      title: "Key Concepts & Details", 
      content: content.split('\n').slice(
        Math.floor(content.split('\n').length / 3), 
        Math.floor(content.split('\n').length * 2 / 3)
      ).join('\n')
    },
    {
      title: "Summary & Applications",
      content: content.split('\n').slice(Math.floor(content.split('\n').length * 2 / 3)).join('\n')
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Mark current page as viewed after 5 seconds
    const viewTimer = setTimeout(() => {
      setPagesViewed(prev => new Set([...prev, currentPage]));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(viewTimer);
    };
  }, [isOpen, startTime, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const handleDownload = () => {
    if (url && isPDFUrl(url)) {
      // For real PDF URLs, open in new tab for download
      window.open(url, '_blank');
    } else {
      // For AI-generated content, download as text file
      const blob = new Blob([content], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleComplete = () => {
    onComplete(timeSpent, pagesViewed.size);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (pagesViewed.size / totalPages) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* PDF Controls */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
            {url && isPDFUrl(url) ? (
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  External PDF
                </Badge>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button size="sm" variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <Button size="sm" variant="outline" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* PDF Content */}
          <ScrollArea className="flex-1">
            {url && isPDFUrl(url) ? (
              <div className="h-full">
                <iframe
                  src={getPDFEmbedUrl(url)}
                  className="w-full h-full border-0"
                  title={title}
                />
              </div>
            ) : (
              <div 
                className="p-8 bg-white border-2 border-gray-200 mx-4 my-4 shadow-lg"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                <div className="prose prose-lg max-w-none">
                  <h1 className="text-2xl font-bold mb-4 border-b pb-2">
                    {pages[currentPage - 1].title}
                  </h1>
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: pages[currentPage - 1].content.replace(/\n/g, '<br/>') 
                    }} 
                  />
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Progress and Stats */}
          <div className="flex-shrink-0 space-y-3 p-4 border-t">
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
                <Badge variant="outline">
                  {pagesViewed.size}/{totalPages} Pages Viewed
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pdf-completed"
                  checked={isCompleted}
                  onCheckedChange={setIsCompleted}
                />
                <label htmlFor="pdf-completed" className="text-sm font-medium">
                  Mark as Complete
                </label>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
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
