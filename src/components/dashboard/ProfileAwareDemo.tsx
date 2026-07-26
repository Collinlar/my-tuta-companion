import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  User, 
  BookOpen, 
  Target, 
  Lightbulb,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { profileAwareAI } from "@/services/profileAwareAI";
import { ResourceCard, ResourceGrid } from "./ResourceCard";

interface UserProfile {
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  parentContact?: string;
  userType: 'student' | 'teacher';
}

export function ProfileAwareDemo() {
  const [notes, setNotes] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Load profile on component mount
  useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  });

  const handleGeneratePersonalizedContent = async () => {
    if (!notes.trim() || !topic.trim()) return;
    
    setIsGenerating(true);
    try {
      // Generate personalized learning path
      const learningPath = await profileAwareAI.generatePersonalizedLearningPath(notes, topic);
      
      // Generate personalized quiz questions
      const quizQuestions = await profileAwareAI.generatePersonalizedQuizQuestions(notes, topic);
      
      // Generate personalized flashcards
      const flashcards = await profileAwareAI.generatePersonalizedFlashcards(notes, topic);

      console.log('Generated content structure:', {
        learningPath,
        quizQuestions,
        flashcards
      });
      
      setGeneratedContent({
        learningPath,
        quizQuestions,
        flashcards
      });
    } catch (error) {
      console.error('Error generating personalized content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile) {
    return (
      <Card className="p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Required</h2>
        <p className="text-slate-600">Please complete your profile first to see personalized AI content.</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile-Aware AI Demo</h1>
        <p className="text-slate-600">See how your profile data personalizes AI-generated content</p>
      </div>

      {/* Profile Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Your Profile Context</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900">Personal Info</h3>
            <p className="text-sm text-slate-600">Name: {profile.name}</p>
            <p className="text-sm text-slate-600">Grade: {profile.grade}</p>
            <p className="text-sm text-slate-600">School: {profile.school}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900">Subjects</h3>
            <div className="flex flex-wrap gap-1">
              {profile.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject} className="bg-blue-100 text-blue-700 text-xs">
                  {subject}
                </Badge>
              ))}
              {profile.subjects.length > 3 && (
                <Badge className="bg-slate-100 text-slate-600 text-xs">
                  +{profile.subjects.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-slate-900">Goals</h3>
            <div className="flex flex-wrap gap-1">
              {profile.goals.slice(0, 3).map((goal) => (
                <Badge key={goal} className="bg-purple-100 text-purple-700 text-xs">
                  {goal}
                </Badge>
              ))}
              {profile.goals.length > 3 && (
                <Badge className="bg-slate-100 text-slate-600 text-xs">
                  +{profile.goals.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Input Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Test Personalization</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, Quadratic Equations, World War II"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Notes Content
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your study notes here to see how AI personalizes content based on your profile..."
              rows={6}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleGeneratePersonalizedContent}
            disabled={isGenerating || !notes.trim() || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating Personalized Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Profile-Aware Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <div className="space-y-6">
          {/* Learning Path */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Personalized Learning Path</h2>
            </div>
            
            <div className="space-y-4">
              {generatedContent.learningPath.steps && Array.isArray(generatedContent.learningPath.steps) ? 
                generatedContent.learningPath.steps.map((step: any, index: number) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Step {index + 1}: {typeof step.title === 'string' ? step.title : JSON.stringify(step.title)}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">
                    {typeof step.description === 'string' ? step.description : JSON.stringify(step.description)}
                  </p>

                  {/* Objectives */}
                  {step.objectives && step.objectives.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Learning Objectives:</h4>
                      <div className="space-y-2">
                        {step.objectives.map((objective: any, objectiveIndex: number) => (
                          <div key={objectiveIndex} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h5 className="font-medium text-green-900 mb-1">
                              {typeof objective === 'string' ? objective : objective.title || objective}
                            </h5>
                            {typeof objective === 'object' && objective.preview && (
                              <p className="text-sm text-green-700 leading-relaxed">
                                {objective.preview}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resources */}
                  {step.resources && step.resources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-3">Learning Resources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.resources.map((resource: any, resourceIndex: number) => (
                          <ResourceCard
                            key={resourceIndex}
                            resource={{
                              id: `resource-${index}-${resourceIndex}`,
                              title: resource.title || 'Untitled Resource',
                              type: resource.type || 'article',
                              url: resource.url || '',
                              description: resource.description || 'No description available',
                              duration: resource.estimatedTime || '',
                              difficulty: 'intermediate',
                              source: resource.source || 'Educational Resource',
                              thumbnail: resource.thumbnail
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {step.personalizedTips && step.personalizedTips.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Personalized Tips</span>
                      </div>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {step.personalizedTips.map((tip: string, tipIndex: number) => (
                          <li key={tipIndex}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                )) : (
                  <p className="text-slate-500 text-center py-4">No learning path steps available</p>
                )}
            </div>
          </Card>

          {/* Quiz Questions */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Personalized Quiz Questions</h2>
            </div>
            
            <div className="space-y-4">
              {generatedContent.quizQuestions && Array.isArray(generatedContent.quizQuestions) ? 
                generatedContent.quizQuestions.slice(0, 3).map((question: any, index: number) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Question {index + 1}</h3>
                  <p className="text-slate-700 mb-3">
                    {typeof question.question === 'string' ? question.question : JSON.stringify(question.question)}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {question.options.map((option: any, optIndex: number) => (
                      <div 
                        key={optIndex}
                        className={`p-2 rounded text-sm ${
                          optIndex === question.correctAnswer 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {typeof option === 'string' ? option : JSON.stringify(option)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong>Difficulty:</strong> {question.difficulty}</p>
                    <p><strong>Subject Alignment:</strong> {question.subjectAlignment}</p>
                    <p><strong>Goal Alignment:</strong> {question.goalAlignment}</p>
                  </div>
                </div>
                )) : (
                  <p className="text-slate-500 text-center py-4">No quiz questions available</p>
                )}
            </div>
          </Card>

          {/* Flashcards */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Personalized Flashcards</h2>
            </div>
            
            <div className="space-y-4">
              {generatedContent.flashcards && Array.isArray(generatedContent.flashcards) ? 
                generatedContent.flashcards.slice(0, 3).map((card: any, index: number) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-1">Front</h4>
                      <p className="text-slate-700 text-sm">
                        {typeof card.front === 'string' ? card.front : JSON.stringify(card.front)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Back</h4>
                      <p className="text-blue-800 text-sm">
                        {typeof card.back === 'string' ? card.back : JSON.stringify(card.back)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p><strong>Subject:</strong> {card.subject}</p>
                    <p><strong>Difficulty:</strong> {card.difficulty}</p>
                    {card.studyTips && card.studyTips.length > 0 && (
                      <div>
                        <p><strong>Study Tips:</strong></p>
                        <ul className="ml-4 space-y-1">
                          {card.studyTips.map((tip: string, tipIndex: number) => (
                            <li key={tipIndex}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                )) : (
                  <p className="text-slate-500 text-center py-4">No flashcards available</p>
                )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
