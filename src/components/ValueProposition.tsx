import { Card } from "@/components/ui/card";
import { Brain, Trophy, Flag } from "lucide-react";

export const ValueProposition = () => {
  const values = [
    {
      icon: Brain,
      title: "AI-Powered",
      description: "60 seconds to create revision plans, flashcards, quizzes, and learning paths tailored to you.",
      gradient: "from-teal-500 to-teal-600"
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn XP, unlock badges, build streaks. Make studying addictive (in a good way).",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Flag,
      title: "Ghana Curriculum",
      description: "Aligned with GES standards. Primary through SHS. All subjects covered.",
      gradient: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className="p-8 text-center bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md`}>
                <value.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {value.title}
              </h3>
              
              <p className="text-slate-600 leading-relaxed">
                {value.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

