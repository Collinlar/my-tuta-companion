import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  StickyNote,
  Save,
  Timer,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface VideoLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
  duration: string;
  transcript?: string;
  onComplete: (notes: string, watchProgress: number, timeSpent: number) => void;
}

export function VideoLessonModal({
  isOpen,
  onClose,
  title,
  videoUrl,
  duration,
  transcript,
  onComplete
}: VideoLessonModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [watchProgress, setWatchProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState('video');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper function to check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Get embed URL for YouTube videos
  const getEmbedUrl = (url: string): string => {
    if (isYouTubeUrl(url)) {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
      }
    }
    return url;
  };

  // For demo purposes, we'll use a placeholder video if no URL provided
  const demoVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, startTime]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setWatchProgress(progress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleComplete = () => {
    onComplete(notes, watchProgress, timeSpent);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="flex-1 flex flex-col min-h-0">
              {/* Video Player */}
              <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4">
                {videoUrl && isYouTubeUrl(videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={demoVideoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDurationSeconds(videoRef.current.duration);
                      }
                    }}
                  />
                )}
              </div>

              {/* Video Controls - Only show for non-YouTube videos */}
              {!(videoUrl && isYouTubeUrl(videoUrl)) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Button size="sm" onClick={handlePlayPause}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => skip(-10)}>
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => skip(10)}>
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(durationSeconds)}
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button size="sm" variant="outline" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{watchProgress.toFixed(0)}% watched</span>
                      <span>{duration}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube Info */}
              {videoUrl && isYouTubeUrl(videoUrl) && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    🎥 <strong>YouTube Video:</strong> Use YouTube's built-in controls to play, pause, and navigate. 
                    Your progress will be tracked automatically.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="flex-1">
              <ScrollArea className="h-full">
                <div className="prose prose-sm max-w-none p-4">
                  <p className="text-muted-foreground">
                    {transcript || "Transcript not available for this video. This is a demo video placeholder."}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  <span className="text-sm font-medium">Video Notes</span>
                </div>
                <Textarea
                  placeholder="Take notes while watching the video... (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Progress and Completion */}
          <div className="flex-shrink-0 space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {formatTime(timeSpent)}
                </Badge>
                <Badge variant="outline">
                  {watchProgress.toFixed(0)}% Complete
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="video-completed"
                  checked={isCompleted}
                  onCheckedChange={setIsCompleted}
                />
                <label htmlFor="video-completed" className="text-sm font-medium">
                  Mark as Complete
                </label>
              </div>
            </div>
            <Progress value={watchProgress} className="h-2" />
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => console.log('Notes saved:', notes)}
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
                Complete Video
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
