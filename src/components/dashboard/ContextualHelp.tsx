import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, HelpCircle, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";

interface ContextualHelpProps {
  context: string;
  isVisible: boolean;
  onDismiss: () => void;
}

interface HelpContent {
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  actionText?: string;
  actionUrl?: string;
}

const helpContent: Record<string, HelpContent> = {
  'notes-upload': {
    title: "Upload Your Notes",
    description: "Start by uploading your study materials. The AI will analyze them to create personalized learning content.",
    steps: [
      "Drag and drop your .txt or .md files, or click to browse",
      "Alternatively, paste your notes directly in the text area",
      "Include key concepts, formulas, and examples for better results",
      "Click 'Continue' to let AI analyze your content"
    ],
    tips: [
      "Organize your notes with clear headings and bullet points",
      "Include examples and practice problems for better AI generation",
      "The more detailed your notes, the better the personalized content"
    ],
    actionText: "Upload Notes",
    actionUrl: "#upload"
  },
  'goal-selection': {
    title: "Choose Your Learning Goals",
    description: "Select what you want to achieve with your study materials. AI will customize the experience based on your goals.",
    steps: [
      "Review your uploaded notes",
      "Select one or more learning goals that interest you",
      "Each goal will create a different type of study experience",
      "You can always add more goals later"
    ],
    tips: [
      "Revision Plans create structured study schedules",
      "Learning Paths provide guided learning with resources",
      "Flashcards are great for memorization",
      "Quizzes help test your understanding",
      "Contests add gamification to your learning"
    ]
  },
  'flashcards': {
    title: "Study with Flashcards",
    description: "Flashcards use spaced repetition to help you remember information more effectively.",
    steps: [
      "Review each flashcard carefully",
      "Rate how well you knew the answer",
      "Cards you know well will appear less frequently",
      "Cards you struggle with will appear more often"
    ],
    tips: [
      "Be honest about your knowledge level for better scheduling",
      "Try to recall the answer before flipping the card",
      "Regular practice is more effective than cramming"
    ]
  },
  'quizzes': {
    title: "Take Practice Quizzes",
    description: "Test your knowledge with AI-generated quiz questions based on your study materials.",
    steps: [
      "Read each question carefully",
      "Select your answer from the options provided",
      "Review the explanation after each question",
      "Track your progress and identify areas for improvement"
    ],
    tips: [
      "Don't rush - take time to think through each question",
      "Review explanations even for correct answers",
      "Use wrong answers as learning opportunities"
    ]
  },
  'progress': {
    title: "Track Your Progress",
    description: "Monitor your learning journey and see how you're improving over time.",
    steps: [
      "View your overall progress and statistics",
      "Check your performance in different subjects",
      "Identify areas where you need more practice",
      "Celebrate your achievements and milestones"
    ],
    tips: [
      "Regular progress tracking helps maintain motivation",
      "Focus on improvement rather than perfection",
      "Use insights to adjust your study strategy"
    ]
  }
};

export function ContextualHelp({ context, isVisible, onDismiss }: ContextualHelpProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const content = helpContent[context];

  useEffect(() => {
    if (isVisible) {
      setIsMinimized(false);
    }
  }, [isVisible]);

  if (!isVisible || !content) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <Card className={`bg-white shadow-lg border border-slate-200 transition-all duration-300 ${
        isMinimized ? 'p-2' : 'p-6'
      }`}>
        {isMinimized ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="w-full flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <HelpCircle className="w-4 h-4" />
            Need help?
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{content.title}</h3>
                  <p className="text-sm text-slate-600">{content.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {content.steps && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900">Steps:</h4>
                <ul className="space-y-1">
                  {content.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.tips && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900">Pro Tips:</h4>
                <ul className="space-y-1">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.actionText && content.actionUrl && (
              <Button
                size="sm"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => {
                  // Handle action
                  onDismiss();
                }}
              >
                {content.actionText}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="w-full text-slate-500 hover:text-slate-700"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
