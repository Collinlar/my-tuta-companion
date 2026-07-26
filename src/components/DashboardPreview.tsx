import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  Star,
  Zap
} from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Your Personal <span className="text-primary">Learning Dashboard</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your progress, celebrate achievements, and stay motivated with 
            detailed insights into your learning journey.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-success text-white border-0">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm opacity-90">Points Earned</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-accent text-white border-0">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-sm opacity-90">Quiz Average</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-primary text-white border-0">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm opacity-90">Day Streak</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-purple-500 text-white border-0">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm opacity-90">Topics Mastered</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Study Plan */}
            <Card className="p-6 lg:col-span-2 bg-white shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Today's Study Plan
                </h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  3 of 5 Complete
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">Mathematics - Quadratic Equations</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">Physics - Wave Motion Quiz</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-blue-800">Chemistry - Flashcards Review</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">In Progress</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-700">Biology - Practice Questions</span>
                  </div>
                  <Button size="sm" variant="outline">Start</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-700">English - Reading Comprehension</span>
                  </div>
                  <Button size="sm" variant="outline">Start</Button>
                </div>
              </div>
            </Card>
            
            {/* Progress & Achievements */}
            <div className="space-y-6">
              {/* Subject Progress */}
              <Card className="p-6 bg-white shadow-soft">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Subject Progress
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Mathematics</span>
                      <span className="text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Physics</span>
                      <span className="text-muted-foreground">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Chemistry</span>
                      <span className="text-muted-foreground">93%</span>
                    </div>
                    <Progress value={93} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Biology</span>
                      <span className="text-muted-foreground">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                </div>
              </Card>
              
              {/* Recent Achievements */}
              <Card className="p-6 bg-white shadow-soft">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  Recent Badges
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-yellow-800">Quiz Master</p>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-blue-800">15 Day Streak</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};