import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  Ear, 
  Hand, 
  Book, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react';
import { 
  learningStyleDetection, 
  LearningStyleProfile, 
  LearningStyleRecommendation,
  LearningBehavior 
} from '@/services/learningStyleDetection';
import { aiCompanionService } from '@/services/aiCompanionService';

interface LearningStyleAssessmentProps {
  onComplete?: (profile: LearningStyleProfile) => void;
  onBack?: () => void;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  category: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  options: {
    text: string;
    behavior: keyof LearningBehavior['behaviors'];
    weight: number;
  }[];
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    question: 'When learning a new concept, I prefer to:',
    category: 'visual',
    options: [
      { text: 'Look at diagrams and charts', behavior: 'viewedDiagrams', weight: 3 },
      { text: 'Listen to explanations', behavior: 'listenedToAudio', weight: 1 },
      { text: 'Try it out hands-on', behavior: 'handsOnActivity', weight: 1 },
      { text: 'Read detailed instructions', behavior: 'readText', weight: 1 }
    ]
  },
  {
    id: '2',
    question: 'I remember information best when:',
    category: 'reading',
    options: [
      { text: 'I write it down in notes', behavior: 'tookNotes', weight: 3 },
      { text: 'I see it in pictures', behavior: 'viewedDiagrams', weight: 1 },
      { text: 'I hear it explained', behavior: 'listenedToAudio', weight: 1 },
      { text: 'I do it myself', behavior: 'handsOnActivity', weight: 1 }
    ]
  },
  {
    id: '3',
    question: 'During study breaks, I like to:',
    category: 'kinesthetic',
    options: [
      { text: 'Move around or stretch', behavior: 'movedWhileLearning', weight: 3 },
      { text: 'Look at something visual', behavior: 'viewedDiagrams', weight: 1 },
      { text: 'Listen to music', behavior: 'usedMusic', weight: 1 },
      { text: 'Read something light', behavior: 'readText', weight: 1 }
    ]
  },
  {
    id: '4',
    question: 'I learn most effectively when I:',
    category: 'auditory',
    options: [
      { text: 'Discuss concepts with others', behavior: 'hadDiscussions', weight: 3 },
      { text: 'Create visual representations', behavior: 'createdMaps', weight: 1 },
      { text: 'Use physical materials', behavior: 'tactileMaterials', weight: 1 },
      { text: 'Read and take notes', behavior: 'tookNotes', weight: 1 }
    ]
  },
  {
    id: '5',
    question: 'When solving problems, I typically:',
    category: 'visual',
    options: [
      { text: 'Draw diagrams or sketches', behavior: 'createdMaps', weight: 3 },
      { text: 'Talk through the problem', behavior: 'verbalExplanation', weight: 1 },
      { text: 'Try different approaches physically', behavior: 'handsOnActivity', weight: 1 },
      { text: 'Write out the steps', behavior: 'tookNotes', weight: 1 }
    ]
  },
  {
    id: '6',
    question: 'I prefer learning materials that:',
    category: 'reading',
    options: [
      { text: 'Have detailed written explanations', behavior: 'followedWrittenInstructions', weight: 3 },
      { text: 'Include lots of images and diagrams', behavior: 'viewedDiagrams', weight: 1 },
      { text: 'Come with audio explanations', behavior: 'listenedToAudio', weight: 1 },
      { text: 'Allow hands-on interaction', behavior: 'interactiveContent', weight: 1 }
    ]
  },
  {
    id: '7',
    question: 'When I need to remember something, I:',
    category: 'auditory',
    options: [
      { text: 'Repeat it out loud', behavior: 'readAloud', weight: 3 },
      { text: 'Create a visual image', behavior: 'viewedDiagrams', weight: 1 },
      { text: 'Write it down multiple times', behavior: 'tookNotes', weight: 1 },
      { text: 'Act it out or demonstrate', behavior: 'physicalDemonstration', weight: 1 }
    ]
  },
  {
    id: '8',
    question: 'I enjoy learning activities that involve:',
    category: 'kinesthetic',
    options: [
      { text: 'Building or creating things', behavior: 'handsOnActivity', weight: 3 },
      { text: 'Watching demonstrations', behavior: 'watchedVideos', weight: 1 },
      { text: 'Listening to stories or examples', behavior: 'listenedToAudio', weight: 1 },
      { text: 'Reading case studies', behavior: 'readText', weight: 1 }
    ]
  }
];

export function LearningStyleAssessment({ onComplete, onBack }: LearningStyleAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [learningStyleProfile, setLearningStyleProfile] = useState<LearningStyleProfile | null>(null);
  const [recommendations, setRecommendations] = useState<LearningStyleRecommendation[]>([]);

  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const question = assessmentQuestions[currentQuestion];

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeAssessment = () => {
    // Convert answers to learning behaviors
    const behaviors: LearningBehavior[] = Object.entries(answers).map(([questionId, answerIndex]) => {
      const question = assessmentQuestions.find(q => q.id === questionId)!;
      const selectedOption = question.options[answerIndex];
      
      // Create a behavior object based on the selected option
      const behavior: LearningBehavior = {
        sessionId: `assessment-${Date.now()}`,
        timestamp: new Date(),
        subject: 'Assessment',
        topic: 'Learning Style',
        behaviors: {
          viewedDiagrams: selectedOption.behavior === 'viewedDiagrams',
          usedColors: false,
          createdMaps: selectedOption.behavior === 'createdMaps',
          watchedVideos: selectedOption.behavior === 'watchedVideos',
          usedCharts: false,
          listenedToAudio: selectedOption.behavior === 'listenedToAudio',
          hadDiscussions: selectedOption.behavior === 'hadDiscussions',
          usedMusic: selectedOption.behavior === 'usedMusic',
          verbalExplanation: selectedOption.behavior === 'verbalExplanation',
          soundEffects: false,
          handsOnActivity: selectedOption.behavior === 'handsOnActivity',
          movedWhileLearning: selectedOption.behavior === 'movedWhileLearning',
          tactileMaterials: selectedOption.behavior === 'tactileMaterials',
          interactiveContent: selectedOption.behavior === 'interactiveContent',
          physicalDemonstration: selectedOption.behavior === 'physicalDemonstration',
          readText: selectedOption.behavior === 'readText',
          tookNotes: selectedOption.behavior === 'tookNotes',
          followedWrittenInstructions: selectedOption.behavior === 'followedWrittenInstructions',
          readAloud: selectedOption.behavior === 'readAloud',
          summarizedText: false
        },
        effectiveness: 8, // High effectiveness for assessment
        engagement: 9, // High engagement for assessment
        retention: 8 // High retention for assessment
      };
      
      return behavior;
    });

    // Record behaviors in learning style detection
    behaviors.forEach(behavior => {
      learningStyleDetection.recordLearningBehavior(behavior);
    });

    // Get the updated learning style profile
    const profile = learningStyleDetection.getLearningStyleProfile();
    const recs = learningStyleDetection.getRecommendations();
    
    setLearningStyleProfile(profile);
    setRecommendations(recs);
    setIsCompleted(true);
    
    onComplete?.(profile!);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visual': return Eye;
      case 'auditory': return Ear;
      case 'kinesthetic': return Hand;
      case 'reading': return Book;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'visual': return 'text-blue-600 bg-blue-100';
      case 'auditory': return 'text-green-600 bg-green-100';
      case 'kinesthetic': return 'text-orange-600 bg-orange-100';
      case 'reading': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isCompleted && learningStyleProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete!</h2>
          <p className="text-slate-600">Here are your learning style results and personalized recommendations.</p>
        </Card>

        {/* Learning Style Results */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Your Learning Style Profile</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {Object.entries(learningStyleProfile).filter(([key]) => !['dominant', 'confidence', 'lastUpdated', 'evidence'].includes(key)).map(([style, data]: [string, any]) => {
              const IconComponent = getCategoryIcon(style);
              const isDominant = style === learningStyleProfile.dominant;
              
              return (
                <div key={style} className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isDominant ? 'bg-purple-100 ring-4 ring-purple-200' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${getCategoryColor(style).split(' ')[0]}`} />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 capitalize mb-1">
                    {style}
                    {isDominant && <Star className="w-4 h-4 inline ml-1 text-purple-500" />}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">{data.score}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        style === 'visual' ? 'bg-blue-500' :
                        style === 'auditory' ? 'bg-green-500' :
                        style === 'kinesthetic' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {data.confidence}% confidence
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-lg px-4 py-2">
              Your Dominant Style: {learningStyleProfile.dominant.charAt(0).toUpperCase() + learningStyleProfile.dominant.slice(1)}
            </Badge>
            <p className="text-sm text-slate-600 mt-2">
              Overall Confidence: {learningStyleProfile.confidence}%
            </p>
          </div>
        </Card>

        {/* Evidence */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Evidence for Your Learning Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(learningStyleProfile).filter(([key]) => !['dominant', 'confidence', 'lastUpdated', 'evidence'].includes(key)).map(([style, data]: [string, any]) => {
              if (data.evidence.length === 0) return null;
              
              return (
                <div key={style} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getCategoryColor(style)}`}>
                      {React.createElement(getCategoryIcon(style), { className: "w-3 h-3" })}
                    </div>
                    <h4 className="font-medium text-slate-900 capitalize">{style} Learning</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {data.evidence.map((evidence: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Personalized Recommendations</h2>
            </div>
            
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getCategoryColor(recommendation.style)}`}>
                      {React.createElement(getCategoryIcon(recommendation.style), { className: "w-4 h-4" })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
                        <Badge className={recommendation.priority === 'high' ? 'bg-red-100 text-red-800' : recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
                      
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-medium text-slate-900 mb-2">Implementation Steps:</h4>
                        <ol className="text-xs text-slate-600 space-y-1">
                          {recommendation.implementation.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-slate-400">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          <span>Time: {recommendation.implementation.estimatedTime}</span>
                          <span className="mx-2">•</span>
                          <span>Difficulty: {recommendation.implementation.difficulty}</span>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                          Apply Recommendation
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Target className="w-4 h-4 mr-2" />
            Start Using Recommendations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Learning Style Assessment</h1>
        <p className="text-slate-600 mb-4">
          Discover your preferred learning style to get personalized study recommendations.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Progress value={progress} className="w-64" />
          <span className="text-sm text-slate-600">
            {currentQuestion + 1} of {assessmentQuestions.length}
          </span>
        </div>
      </Card>

      {/* Question */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(question.category)}`}>
            {React.createElement(getCategoryIcon(question.category), { className: "w-5 h-5" })}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Question {currentQuestion + 1}</h2>
            <p className="text-sm text-slate-600 capitalize">{question.category} Learning Preference</p>
          </div>
        </div>

        <h3 className="text-xl font-medium text-slate-900 mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[question.id] === index
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[question.id] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}>
                  {answers[question.id] === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={answers[question.id] === undefined}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          {currentQuestion === assessmentQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
