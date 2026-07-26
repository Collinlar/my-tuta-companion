import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  Brain, 
  Route, 
  ShoppingCart, 
  Clock,
  Lightbulb,
  TrendingUp,
  DollarSign
} from "lucide-react";

export const ForTeachers = () => {
  const features = [
    {
      icon: Lightbulb,
      title: "AI Lesson Planner",
      description: "Generate comprehensive lesson plans aligned with Ghanaian curriculum in minutes"
    },
    {
      icon: Brain,
      title: "Auto-generated quizzes & flashcards",
      description: "Create assessment materials instantly from your teaching content"
    },
    {
      icon: Route,
      title: "Revision pathway builder",
      description: "Design structured learning paths that guide students step-by-step"
    },
    {
      icon: ShoppingCart,
      title: "Sell in marketplace",
      description: "Monetize your expertise by selling quality resources to other educators"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl animate-pulse-slow-delayed" />
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Visual */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/10 to-blue-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
            <Card className="relative p-8 bg-white border border-slate-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <div className="space-y-6">
                {/* Mock teacher dashboard */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Teaching Dashboard</h3>
                  <span className="text-sm text-slate-600">This Week</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-teal-50 border border-teal-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <Calendar className="w-8 h-8 text-teal-600 mb-2" />
                    <p className="text-sm text-slate-600">Lessons Created</p>
                    <p className="font-semibold text-slate-900">24</p>
                  </Card>
                  
                  <Card className="p-4 bg-slate-50 border border-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 delay-100">
                    <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-sm text-slate-600">Students Reached</p>
                    <p className="font-semibold text-slate-900">156</p>
                  </Card>
                </div>
                
                <Card className="p-4 bg-teal-50 border border-teal-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-medium text-teal-700">Marketplace Earnings</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">GHS 420.50</p>
                  <p className="text-sm text-slate-600">+15% from last month</p>
                </Card>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Time Saved This Week</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">8.5 hours</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right Column - Content */}
          <div>
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium border border-teal-200">
                <Calendar className="w-4 h-4" />
                For Teachers
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Smarter lesson planning.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">More time to teach.</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-8">
              Empower your teaching with AI tools that understand the Ghanaian curriculum 
              and help you create engaging, effective learning experiences.
            </p>
            
            <div className="grid gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 group hover:-translate-x-2 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => window.location.href = '/onboarding?type=teacher'}
            >
              <Brain className="w-5 h-5 mr-2" />
              Join as Teacher
            </Button>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse-slow-delayed {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slow-delayed {
          animation: pulse-slow-delayed 4s ease-in-out infinite 2s;
        }
      `}</style>
    </section>
  );
};