import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  FileText, 
  HelpCircle, 
  Users, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Star,
  Trophy
} from "lucide-react";

export const StudyMethods = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            How <span className="text-primary">Tuta</span> Makes Learning Effective
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience scientifically-proven learning methods powered by AI, 
            designed specifically for Ghanaian students.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* AI Flashcards */}
          <div>
            <div className="mb-6">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 mb-4">
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered Flashcards
              </Badge>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Smart Spaced Repetition
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our AI automatically creates flashcards from your notes and uses spaced 
                repetition to help you remember information 3x longer. Cards you struggle 
                with appear more frequently until mastered.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">300% better retention</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Auto-generated content</span>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Try Flashcards <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-medium">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">Photosynthesis</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Biology</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">The process by which plants convert...</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Next review: Tomorrow</span>
                  <div className="flex gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">Quadratic Formula</h4>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Math</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">x = (-b ± √(b²-4ac)) / 2a</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Next review: In 3 hours</span>
                  <div className="flex gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 text-gray-300" />
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Adaptive Quizzes */}
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-medium order-2 lg:order-1">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Physics Quiz: Wave Motion</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">5/10</Badge>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    What is the relationship between frequency and wavelength?
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                      ✓ They are inversely proportional
                    </div>
                    <div className="p-2 bg-gray-50 border rounded text-sm text-gray-600">
                      They are directly proportional
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Correct! +10 points</span>
                  <span>Next: Harder question</span>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="order-1 lg:order-2">
            <div className="mb-6">
              <Badge variant="secondary" className="bg-green-100 text-green-700 mb-4">
                <HelpCircle className="w-4 h-4 mr-2" />
                Adaptive Quizzing
              </Badge>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Questions That Adapt to You
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our AI creates personalized quizzes that get harder as you improve and 
                focus on your weak areas. Every question is tailored to help you learn 
                faster and retain more.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">BECE/WASSCE style</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Instant feedback</span>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Start Quiz <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Study Groups */}
          <div>
            <div className="mb-6">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-4">
                <Users className="w-4 h-4 mr-2" />
                Collaborative Learning
              </Badge>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Learn Together, Achieve More
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Join study groups with classmates, compete in friendly contests, and 
                learn from each other. Studies show group learning improves retention 
                by up to 50%.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Weekly contests</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Leaderboards</span>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Join Study Group <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-medium">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Grade 9 Science Group</h4>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">24 members</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kwame A.</p>
                      <p className="text-xs text-gray-600">1,247 points</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">#1</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Ama B.</p>
                      <p className="text-xs text-gray-600">1,156 points</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">#2</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">You</p>
                      <p className="text-xs text-gray-600">943 points</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">#3</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};