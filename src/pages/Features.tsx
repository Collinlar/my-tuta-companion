import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Trophy, 
  BookOpen, 
  Target, 
  Users, 
  BarChart3, 
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Globe
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Features = () => {
  const studentFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Revision Plans",
      description: "Get personalized study plans tailored to your grade level, subjects, and learning style. AI analyzes your notes and creates structured revision guides in seconds.",
      benefits: ["Topic-specific plans", "Grade-appropriate content", "Adaptive difficulty", "Progress tracking"]
    },
    {
      icon: BookOpen,
      title: "Smart Flashcards",
      description: "Generate interactive flashcards from your notes automatically. Perfect for quick review and memory retention.",
      benefits: ["Auto-generated from notes", "Spaced repetition", "Progress analytics", "Mobile-friendly"]
    },
    {
      icon: Target,
      title: "Interactive Quizzes",
      description: "Test your knowledge with AI-generated quizzes. Get instant feedback and identify areas that need more focus.",
      benefits: ["Topic-specific questions", "Instant feedback", "Detailed explanations", "Performance tracking"]
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn XP, unlock badges, build streaks, and compete on leaderboards. Make studying fun and stay motivated.",
      benefits: ["XP points system", "Achievement badges", "Daily streaks", "Leaderboards"]
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Track your study sessions, see your improvement over time, and identify strengths and weaknesses.",
      benefits: ["Study time tracking", "Performance graphs", "Topic mastery", "Study insights"]
    },
    {
      icon: Sparkles,
      title: "Learning Paths",
      description: "Follow structured learning journeys that guide you from basics to mastery with step-by-step objectives.",
      benefits: ["Progressive learning", "Clear objectives", "Resource links", "Milestone tracking"]
    }
  ];

  const teacherFeatures = [
    {
      icon: BookOpen,
      title: "Instant Lesson Plans",
      description: "Create comprehensive lesson plans in 10 minutes. Include objectives, activities, assessments, and differentiation strategies.",
      benefits: ["Full lesson structure", "Learning objectives", "Activity suggestions", "Assessment tools"]
    },
    {
      icon: Target,
      title: "Assessment Generator",
      description: "Generate quizzes, tests, and assignments aligned with your curriculum in seconds.",
      benefits: ["Multiple question types", "Auto-grading", "Rubrics included", "Standards-aligned"]
    },
    {
      icon: Users,
      title: "Student Management",
      description: "Track individual student progress, identify struggling learners, and provide targeted support.",
      benefits: ["Progress tracking", "Performance analytics", "Intervention alerts", "Parent reports"]
    },
    {
      icon: Zap,
      title: "Resource Library",
      description: "Build and organize your teaching materials. Share resources with colleagues and access curated content.",
      benefits: ["Cloud storage", "Easy sharing", "Template library", "Version control"]
    },
    {
      icon: Globe,
      title: "Curriculum-Aligned",
      description: "All content is aligned with Ghana Education Service standards from Primary through SHS.",
      benefits: ["GES standards", "Grade-appropriate", "Subject coverage", "Local context"]
    },
    {
      icon: Clock,
      title: "Time-Saving Tools",
      description: "Automate repetitive tasks and focus on what matters - teaching and inspiring students.",
      benefits: ["Quick generation", "Template reuse", "Batch creation", "Smart suggestions"]
    }
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your data is encrypted and private. We never share your information."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate content in seconds. Optimized for Ghana's internet speeds."
    },
    {
      icon: Globe,
      title: "Works Everywhere",
      description: "Access on phone, tablet, or computer. Study or teach from anywhere."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-teal-200">
              <Sparkles className="w-4 h-4" />
              All Features
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Everything You Need to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Learn & Teach Better
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Discover all the powerful features that make mytuta AI the smartest learning companion for students and teachers.
            </p>
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">For Students</h2>
              <p className="text-xl text-slate-600">Tools to help you study smarter and achieve your goals</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentFeatures.map((feature, index) => (
                <Card key={index} className="p-8 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">For Teachers</h2>
              <p className="text-xl text-slate-600">Professional tools to enhance your teaching and save time</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teacherFeatures.map((feature, index) => (
                <Card key={index} className="p-8 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Built for Ghana</h2>
              <p className="text-xl text-slate-600">Designed with Ghanaian students and teachers in mind</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Experience All These Features?
            </h2>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Start using mytuta AI today and transform your learning experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-white text-teal-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => window.location.href = '/onboarding'}
              >
                Get Started Free
              </Button>
            </div>
            
            <p className="text-sm text-white/70">
              No credit card required • Free for students forever
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;

