import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotesInputProps {
  onNotesSubmit: (notes: string, fileName?: string) => void;
  onBack?: () => void;
}

export function NotesInput({ onNotesSubmit, onBack }: NotesInputProps) {
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .md file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setNotes(content);
      setFileName(file.name);
      toast({
        title: "File uploaded successfully",
        description: `Loaded ${file.name} with ${content.length} characters`
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast({
        title: "No notes provided",
        description: "Please enter or upload your notes",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      onNotesSubmit(notes, fileName || undefined);
      setIsProcessing(false);
    }, 1500);
  };

  const clearNotes = () => {
    setNotes("");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Your Notes</h1>
        <p className="text-muted-foreground">
          Upload your study notes or paste them directly to create a personalized revision plan
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* File Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload File
          </h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your notes file here, or click to browse
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Supports .txt and .md files up to 5MB
            </p>
          </div>

          {fileName && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotes}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </Card>

        {/* Text Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paste Notes
          </h3>
          
          <Textarea
            placeholder="Paste your study notes here...&#10;&#10;Example:&#10;- Quadratic equations have the form ax² + bx + c = 0&#10;- The discriminant is b² - 4ac&#10;- If discriminant > 0, there are 2 real roots&#10;- If discriminant = 0, there is 1 real root&#10;- If discriminant < 0, there are no real roots"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{notes.length} characters</span>
            {notes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotes}
                className="h-6 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Notes Preview */}
      {notes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Notes Preview</h3>
          <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {notes.length > 500 ? `${notes.substring(0, 500)}...` : notes}
            </pre>
          </div>
          {notes.length > 500 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing first 500 characters. Full content will be processed.
            </p>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        )}
        
        <div className="flex gap-3 ml-auto">
          <Button variant="outline" onClick={clearNotes} disabled={!notes}>
            Clear All
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!notes.trim() || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Continue
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Tips for Better Results</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include key concepts, formulas, and definitions</li>
              <li>• Add examples and practice problems if available</li>
              <li>• Organize your notes with clear headings and bullet points</li>
              <li>• The more detailed your notes, the better the AI can help you</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
