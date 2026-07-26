// Example component demonstrating revision plan feedback storage
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRevisionPlans } from "@/hooks/useSmartStorage";
import { useToast } from "@/hooks/use-toast";
import type { RevisionFeedback } from "@/types/storage";

interface RevisionFeedbackDialogProps {
  revisionPlanId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RevisionFeedbackDialog({ revisionPlanId, isOpen, onClose }: RevisionFeedbackDialogProps) {
  const { addFeedback } = useRevisionPlans();
  const { toast } = useToast();
  
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [questionsNeedingReview, setQuestionsNeedingReview] = useState('');

  const handleSubmit = () => {
    // Create feedback object
    const feedback: RevisionFeedback = {
      date: new Date().toISOString(),
      confidence,
      notes,
      questionsNeedingReview: questionsNeedingReview
        .split('\n')
        .filter(q => q.trim() !== '')
    };

    // Save feedback to storage
    addFeedback(revisionPlanId, feedback);

    // Show success message
    toast({
      title: "Feedback Saved",
      description: "Your revision feedback has been recorded successfully.",
    });

    // Reset form and close
    setConfidence('medium');
    setNotes('');
    setQuestionsNeedingReview('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revision Session Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Confidence Level */}
          <div className="space-y-2">
            <Label>How confident do you feel about this topic?</Label>
            <RadioGroup value={confidence} onValueChange={(value) => setConfidence(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="cursor-pointer">Low - Need more practice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">Medium - Getting there</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="cursor-pointer">High - Confident & ready</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Observations</Label>
            <Textarea
              id="notes"
              placeholder="What went well? What needs more work? Any key insights..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Questions Needing Review */}
          <div className="space-y-2">
            <Label htmlFor="questions">Questions Needing More Review</Label>
            <Textarea
              id="questions"
              placeholder="List questions or topics you struggled with (one per line)"
              value={questionsNeedingReview}
              onChange={(e) => setQuestionsNeedingReview(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">Enter each question on a new line</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

