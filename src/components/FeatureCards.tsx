import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Calendar, 
  Brain, 
  HelpCircle, 
  BarChart3, 
  Trophy,
  Smartphone,
  Users
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Smart Note Upload",
    description: "Upload photos of your notes or type them in. Our AI instantly processes and organizes your content.",
    color: "bg-blue-500"
  },
  {
    icon: Calendar,
    title: "AI Revision Plans",
    description: "Get personalized daily study schedules that adapt to your learning pace and exam dates.",
    color: "bg-purple-500"
  },
  {
    icon: Brain,
    title: "Smart Flashcards",
    description: "Auto-generated flashcards with spaced repetition to boost memory retention by 300%.",
    color: "bg-green-500"
  },
  {
    icon: HelpCircle,
    title: "Interactive Quizzes",
    description: "Practice with BECE/WASSCE-style questions that adapt to your weak areas.",
    color: "bg-orange-500"
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visual dashboards showing your learning progress, scores, and improvement areas.",
    color: "bg-red-500"
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description: "Earn badges, maintain streaks, and compete in contests to stay motivated.",
    color: "bg-yellow-500"
  },
  {
    icon: Smartphone,
    title: "Offline Mode",
    description: "Download your revision plans and flashcards to study anywhere, anytime.",
    color: "bg-indigo-500"
  },
  {
    icon: Users,
    title: "Study Groups",
    description: "Connect with classmates, form study groups, and learn together.",
    color: "bg-pink-500"
  }
];

export const FeatureCards = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Everything You Need to <span className="text-primary">Excel</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tuta combines the latest in AI technology with proven learning methods 
            to give you the ultimate study experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {feature.description}
              </p>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary">
                Learn More →
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};