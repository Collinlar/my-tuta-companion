import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, ArrowLeft, Check, X, Lightbulb, Sparkles, Target, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotesUploadProps {
  onNotesSubmit?: (notes: string, fileName?: string) => void;
  onBack?: () => void;
}

export function NotesUpload({ onNotesSubmit, onBack }: NotesUploadProps) {
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTips, setShowTips] = useState(false);
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
      onNotesSubmit?.(notes, fileName || undefined);
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Notes</h1>
          <p className="text-slate-600">Upload or paste your study notes to get started.</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full w-1/5 transition-all duration-500"></div>
        </div>
        <span className="text-sm font-medium text-slate-600">20%</span>
      </div>

      {/* Main Content */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Upload Your Notes</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Upload your study notes or paste them directly to create a personalized revision plan
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* File Upload */}
        <Card className="p-8 border-2 border-dashed border-slate-200 hover:border-teal-300 transition-colors">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-teal-600" />
              <h3 className="text-xl font-semibold text-slate-900">Upload File</h3>
            </div>
            
            <div
              className={`
                border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all duration-200
                ${isDragOver 
                  ? 'border-teal-400 bg-teal-50' 
                  : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                <div>
                  <p className="text-slate-600 font-medium mb-2">
                    Drag and drop your notes file here, or click to browse
                  </p>
                  <Button variant="outline" className="bg-white">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <p className="text-sm text-slate-500">
              Supports .txt and .md files up to 5MB
            </p>
            
            {fileName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{fileName}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Paste Notes */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-teal-600" />
              <h3 className="text-xl font-semibold text-slate-900">Paste Notes</h3>
            </div>
            
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your study notes here... 

Example:
- Quadratic equations have the form ax² + bx + c = 0
- The discriminant is b² - 4ac
- If discriminant > 0, there are 2 real roots
- If discriminant = 0, there is 1 real root
- If discriminant < 0, there are no real roots"
              className="min-h-[300px] resize-none border-slate-200 focus:border-teal-400 focus:ring-teal-400"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">
                {notes.length} characters
              </span>
              {notes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearNotes}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Tips for Better Results - Collapsible */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/60">
        <div className="p-6">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center justify-between w-full group hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Tips for Better Results
                </h3>
                <p className="text-xs text-slate-600">Help AI create the perfect study plan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {showTips ? 'Hide tips' : 'Show tips'}
              </span>
              {showTips ? (
                <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
              )}
            </div>
          </button>
          
          {showTips && (
            <div className="mt-6 pt-6 border-t border-white/40 animate-in slide-in-from-top-2 duration-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Include Key Concepts</h4>
                      <p className="text-sm text-slate-600">Add formulas, definitions, and important theories to get comprehensive study materials.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-3 h-3 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Add Examples & Problems</h4>
                      <p className="text-sm text-slate-600">Include practice problems and real-world examples for better AI-generated content.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Organize with Headings</h4>
                      <p className="text-sm text-slate-600">Use clear headings, bullet points, and structure for easier AI analysis.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Be Detailed</h4>
                      <p className="text-sm text-slate-600">The more detailed your notes, the better the AI can personalize your study experience.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Example Preview */}
              <div className="mt-6 p-4 bg-white/60 rounded-lg border border-white/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Example Structure</span>
                </div>
                <div className="text-sm text-slate-600 font-mono bg-slate-50 p-3 rounded border">
                  <div className="text-slate-800 font-semibold"># Mathematics - Quadratic Equations</div>
                  <div className="ml-4 mt-2 space-y-1">
                    <div>• <span className="text-slate-700">General form: ax² + bx + c = 0</span></div>
                    <div>• <span className="text-slate-700">Discriminant: b² - 4ac</span></div>
                    <div>• <span className="text-slate-700">Example: x² - 5x + 6 = 0 → (x-2)(x-3) = 0</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={clearNotes}
            disabled={!notes && !fileName}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!notes.trim() || isProcessing}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-2 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}