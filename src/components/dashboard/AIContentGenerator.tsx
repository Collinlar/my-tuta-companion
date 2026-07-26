import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Upload, 
  Brain, 
  Edit, 
  Save, 
  Share2, 
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  Download,
  Loader2,
  BookOpen,
  Target,
  HelpCircle,
  Trophy,
  Compass
} from 'lucide-react';
import { groqApiService } from '@/services/groqApiService';
import { profileAwareAI } from '@/services/profileAwareAI';
import { ResourceCard, ResourceGrid } from './ResourceCard';
import { generateShareLink, generateContentId, copyToClipboard } from '@/lib/shareLinks';
import { trackContentGeneration } from '@/lib/analytics';

interface AIContentGeneratorProps {
  contentType: 'lesson' | 'flashcards' | 'quizzes' | 'contests' | 'learning-path' | 'upload' | 'topic';
  onBack: () => void;
  onSave: (content: any) => void;
}

export function AIContentGenerator({ contentType, onBack, onSave }: AIContentGeneratorProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'editing' | 'sharing'>('input');
  const [inputData, setInputData] = useState({
    topic: '',
    subject: '',
    grade: '',
    notes: '',
    difficulty: 'medium',
    duration: 45,
    objectives: [] as string[],
    questionCount: 10,
    timeLimit: 30
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const contentTypeConfig = {
    lesson: {
      title: 'Lesson Planner',
      icon: BookOpen,
      description: 'Create structured lesson plans with objectives, activities, and outcomes'
    },
    'learning-path': {
      title: 'Learning Path',
      icon: Compass,
      description: 'Design comprehensive learning journeys for students'
    },
    flashcards: {
      title: 'Flashcards',
      icon: Brain,
      description: 'Generate interactive study cards for any topic'
    },
    quizzes: {
      title: 'Quizzes',
      icon: HelpCircle,
      description: 'Create assessments and tests with multiple question types'
    },
    contests: {
      title: 'Contests',
      icon: Trophy,
      description: 'Build competitive learning games and challenges'
    },
    upload: {
      title: 'Upload Notes',
      icon: Upload,
      description: 'Upload your teaching materials to generate content'
    },
    topic: {
      title: 'Enter Topic',
      icon: Target,
      description: 'Enter a topic to generate educational content'
    }
  };

  const config = contentTypeConfig[contentType];

  const handleGenerate = async () => {
    setStep('generating');
    
    try {
      let prompt = '';
      
      switch (contentType) {
        case 'lesson':
          prompt = `Create a comprehensive lesson plan for "${inputData.topic}" for ${inputData.grade}th grade ${inputData.subject} students. Duration: ${inputData.duration} minutes. Difficulty: ${inputData.difficulty}. Include objectives, activities, materials, and assessment methods.`;
          break;
        case 'learning-path':
          prompt = `Design a learning path for "${inputData.topic}" in ${inputData.subject} for ${inputData.grade}th grade. Include milestones, activities, and progress tracking. Duration: ${inputData.duration} minutes.`;
          break;
      case 'flashcards':
        prompt = `Generate ${inputData.questionCount} flashcards for "${inputData.topic}" in ${inputData.subject} for ${inputData.grade}th grade. Difficulty: ${inputData.difficulty}. Return as JSON array with each card having "front", "back", and "difficulty" properties.`;
        break;
        case 'quizzes':
          prompt = `Create a ${inputData.questionCount}-question quiz on "${inputData.topic}" for ${inputData.grade}th grade ${inputData.subject} students. Difficulty: ${inputData.difficulty}. Time limit: ${inputData.timeLimit} minutes. Include multiple choice, true/false, and short answer questions.`;
          break;
        case 'contests':
          prompt = `Design a competitive learning contest for "${inputData.topic}" in ${inputData.subject} for ${inputData.grade}th grade. Duration: ${inputData.duration} minutes. Include rules, scoring system, and prizes.`;
          break;
        case 'upload':
        case 'topic':
          prompt = `Based on the topic "${inputData.topic}" in ${inputData.subject} for ${inputData.grade}th grade, generate educational content. ${inputData.notes ? `Use these notes as reference: ${inputData.notes}` : ''}`;
          break;
      }

      let response;
      
      // Use specific Groq API methods for structured content
      switch (contentType) {
        case 'flashcards':
          response = await groqApiService.generateFlashcards(inputData.topic, inputData.notes || '');
          setGeneratedContent({
            type: contentType,
            title: `${inputData.topic} - ${config.title}`,
            content: {
              cards: response,
              timeLimit: inputData.timeLimit || 10
            },
            metadata: {
              subject: inputData.subject,
              grade: inputData.grade,
              difficulty: inputData.difficulty,
              duration: inputData.duration,
              createdAt: new Date().toISOString()
            }
          });
          break;
          
        case 'quizzes':
          response = await groqApiService.generateQuizQuestions(inputData.topic, inputData.questionCount, inputData.difficulty);
          setGeneratedContent({
            type: contentType,
            title: `${inputData.topic} - ${config.title}`,
            content: {
              questions: response,
              timeLimit: inputData.timeLimit || 15
            },
            metadata: {
              subject: inputData.subject,
              grade: inputData.grade,
              difficulty: inputData.difficulty,
              duration: inputData.duration,
              createdAt: new Date().toISOString()
            }
          });
          break;
          
        case 'contests':
          response = await groqApiService.generateContestProblems(inputData.topic, inputData.questionCount, inputData.difficulty);
          setGeneratedContent({
            type: contentType,
            title: `${inputData.topic} - ${config.title}`,
            content: {
              problems: response,
              totalTimeLimit: inputData.duration || 30
            },
            metadata: {
              subject: inputData.subject,
              grade: inputData.grade,
              difficulty: inputData.difficulty,
              duration: inputData.duration,
              createdAt: new Date().toISOString()
            }
          });
          break;
          
        case 'learning-path':
          // Use ProfileAwareAI for learning paths with web resources
          response = await profileAwareAI.generateLearningPath(inputData.notes || '', inputData.topic);
          setGeneratedContent({
            type: contentType,
            title: `${inputData.topic} - ${config.title}`,
            content: response,
            metadata: {
              subject: inputData.subject,
              grade: inputData.grade,
              difficulty: inputData.difficulty,
              duration: inputData.duration,
              createdAt: new Date().toISOString()
            }
          });
          break;
          
        default:
          // For lessons and other content types, use the generic makeRequest
          response = await groqApiService.makeRequest([
            { role: 'system', content: 'You are an expert educational content creator. Generate high-quality, engaging educational materials.' },
            { role: 'user', content: prompt }
          ]);
          
          setGeneratedContent({
            type: contentType,
            title: `${inputData.topic} - ${config.title}`,
            content: response,
            metadata: {
              subject: inputData.subject,
              grade: inputData.grade,
              difficulty: inputData.difficulty,
              duration: inputData.duration,
              createdAt: new Date().toISOString()
            }
          });
          break;
      }

      // Debug: Log the AI response
      console.log('AIContentGenerator - AI Response:', {
        contentType,
        response,
        responseType: typeof response,
        responseLength: response?.length,
        first100Chars: response?.substring ? response.substring(0, 100) : 'Non-string response'
      });
      
      setStep('editing');
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to mock content
      setGeneratedContent(generateMockContent(contentType, inputData));
      setStep('editing');
    }
  };

  const generateMockContent = (type: string, data: any) => {
    switch (type) {
      case 'lesson':
        return {
          type: 'lesson',
          title: `${data.topic} - Lesson Plan`,
          content: {
            objectives: [
              `Students will understand the basic concepts of ${data.topic}`,
              `Students will be able to apply ${data.topic} in real-world scenarios`,
              `Students will demonstrate mastery through practical exercises`
            ],
            activities: [
              {
                name: 'Introduction (10 minutes)',
                description: `Introduce ${data.topic} and its importance`,
                materials: ['Whiteboard', 'Presentation slides']
              },
              {
                name: 'Main Activity (25 minutes)',
                description: `Hands-on practice with ${data.topic}`,
                materials: ['Worksheets', 'Computers']
              },
              {
                name: 'Conclusion (10 minutes)',
                description: `Review and Q&A session`,
                materials: ['Whiteboard']
              }
            ],
            assessment: `Students will complete a practical exercise demonstrating their understanding of ${data.topic}`
          },
          metadata: {
            subject: data.subject,
            grade: data.grade,
            difficulty: data.difficulty,
            duration: data.duration,
            createdAt: new Date().toISOString()
          }
        };
      case 'flashcards':
        return {
          type: 'flashcards',
          title: `${data.topic} - Flashcards`,
          content: {
            cards: [
              { front: `What is ${data.topic}?`, back: `A fundamental concept in ${data.subject}`, difficulty: 'beginner' },
              { front: `Why is ${data.topic} important?`, back: `It helps students understand key principles`, difficulty: 'intermediate' },
              { front: `How do you apply ${data.topic}?`, back: `Through practical exercises and real-world examples`, difficulty: 'advanced' }
            ],
            timeLimit: 10
          },
          metadata: {
            subject: data.subject,
            grade: data.grade,
            difficulty: data.difficulty,
            createdAt: new Date().toISOString()
          }
        };
      case 'quizzes':
        return {
          type: 'quizzes',
          title: `${data.topic} - Quiz`,
          content: {
            questions: [
              {
                question: `What is the main purpose of ${data.topic}?`,
                type: 'multiple-choice',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
                points: 1
              },
              {
                question: `True or False: ${data.topic} is essential for understanding ${data.subject}`,
                type: 'true-false',
                correctAnswer: true,
                points: 1
              }
            ],
            timeLimit: 15
          },
          metadata: {
            subject: data.subject,
            grade: data.grade,
            difficulty: data.difficulty,
            timeLimit: data.timeLimit,
            createdAt: new Date().toISOString()
          }
        };
      default:
        return {
          type: contentType,
          title: `${data.topic} - ${config.title}`,
          content: `Generated content for ${data.topic}`,
          metadata: {
            subject: data.subject,
            grade: data.grade,
            difficulty: data.difficulty,
            createdAt: new Date().toISOString()
          }
        };
    }
  };

  const handleSave = () => {
    // Debug: Log what we're saving
    console.log('AIContentGenerator - Saving content:', {
      generatedContent,
      contentType,
      contentToSave: generatedContent?.content,
      hasContent: !!generatedContent?.content
    });

    // Generate a unique content ID
    const contentId = generateContentId();

    // Transform the content to match the ContentItem interface expected by TeacherDashboard
    const contentToSave = {
      id: contentId,
      type: generatedContent?.type || contentType,
      title: generatedContent?.title || `${inputData.topic} - ${config.title}`,
      subject: generatedContent?.metadata?.subject || inputData.subject,
      grade: generatedContent?.metadata?.grade ? `Grade ${generatedContent.metadata.grade}` : `Grade ${inputData.grade}`,
      status: 'draft' as const,
      createdAt: generatedContent?.metadata?.createdAt || new Date().toISOString(),
      students: 0,
      content: generatedContent?.content || inputData.notes // The AI response is stored in generatedContent.content
    };
    
    // Track content generation
    trackContentGeneration(contentType, inputData.subject || contentToSave.subject);
    
    // Don't save to localStorage here - let the parent component (UnifiedView) handle it
    // This prevents duplicate saves
    // The parent's handleTeacherContentSave will save to localStorage and dispatch the update event
    
    onSave(contentToSave);
    
    // Generate share link using the actual domain
    const shareUrl = generateShareLink(contentType, contentId);
    setShareLink(shareUrl);
    console.log('Generated share link:', shareUrl);
    
    setStep('sharing');
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      const success = await copyToClipboard(shareLink);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputData(prev => ({ ...prev, notes: e.target?.result as string }));
      };
      reader.readAsText(file);
    }
  };

  const renderInputStep = () => {
    const IconComponent = config.icon;
    
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <IconComponent className="w-6 h-6 text-teal-600" />
            {config.title}
          </CardTitle>
          <p className="text-slate-600">{config.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={inputData.topic}
                onChange={(e) => setInputData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Enter the topic or subject matter"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={inputData.subject} onValueChange={(value) => setInputData(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade Level *</Label>
              <Input
                id="grade"
                value={inputData.grade}
                onChange={(e) => setInputData(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="e.g., 8, 9, 10"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={inputData.difficulty} onValueChange={(value) => setInputData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(contentType === 'lesson' || contentType === 'learning-path') && (
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={inputData.duration}
                onChange={(e) => setInputData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="mt-1"
              />
            </div>
          )}

          {(contentType === 'quizzes' || contentType === 'contests') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  value={inputData.questionCount}
                  onChange={(e) => setInputData(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={inputData.timeLimit}
                  onChange={(e) => setInputData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {contentType === 'upload' && (
            <div>
              <Label htmlFor="file">Upload Notes</Label>
              <Input
                id="file"
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="mt-1"
              />
              {uploadedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {uploadedFile.name} uploaded successfully
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={inputData.notes}
              onChange={(e) => setInputData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any specific requirements or context..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={!inputData.topic || !inputData.subject || !inputData.grade}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGeneratingStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Generating Your {config.title}...
        </h3>
        <p className="text-slate-600 text-center">
          Our AI is creating personalized content based on your requirements.
        </p>
      </CardContent>
    </Card>
  );

  const renderEditingStep = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Your {config.title}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('input')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
              <Save className="w-4 h-4 mr-2" />
              Save & Share
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={generatedContent?.title || ''}
              onChange={(e) => setGeneratedContent(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            {contentType === 'learning-path' && generatedContent?.content?.steps ? (
              <div className="space-y-4">
                {generatedContent.content.steps.map((step: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                      
                      {step.resources && step.resources.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Resources:</h5>
                          <ResourceGrid 
                            resources={step.resources.map((resource: any, resourceIndex: number) => ({
                              id: `resource-${index}-${resourceIndex}`,
                              title: resource.title || 'Untitled Resource',
                              type: resource.type || 'article',
                              url: resource.url || '',
                              description: resource.description || 'No description available',
                              duration: resource.estimatedTime || '',
                              difficulty: 'intermediate',
                              source: resource.source || 'Educational Resource',
                              thumbnail: resource.thumbnail
                            }))}
                            title=""
                          />
                        </div>
                      )}
                      
                      {step.personalizedTips && step.personalizedTips.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="font-medium text-blue-900 mb-2">Personalized Tips:</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {step.personalizedTips.map((tip: string, tipIndex: number) => (
                              <li key={tipIndex}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Textarea
                id="content"
                value={typeof generatedContent?.content === 'string' ? generatedContent.content : JSON.stringify(generatedContent?.content, null, 2)}
                onChange={(e) => setGeneratedContent(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="mt-1 font-mono text-sm"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSharingStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Content Ready to Share!</CardTitle>
        <p className="text-center text-slate-600">
          Your {config.title.toLowerCase()} has been saved and is ready to share with students.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {generatedContent?.title}
          </h3>
          <p className="text-sm text-slate-600">
            {generatedContent?.metadata?.subject} - Grade {generatedContent?.metadata?.grade}
          </p>
        </div>

        <div>
          <Label htmlFor="shareLink">Share Link</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="shareLink"
              value={shareLink || ''}
              readOnly
              className="flex-1"
            />
            <Button onClick={handleCopyLink} variant="outline" size="icon">
              {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share via mytuta
          </Button>
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share via WhatsApp
          </Button>
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share via Email
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">
            Students who click this link will be automatically added to your class and their performance will be tracked.
          </p>
          <Button onClick={onBack} className="w-full">
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {step === 'input' && renderInputStep()}
        {step === 'generating' && renderGeneratingStep()}
        {step === 'editing' && renderEditingStep()}
        {step === 'sharing' && renderSharingStep()}
      </div>
    </div>
  );
}