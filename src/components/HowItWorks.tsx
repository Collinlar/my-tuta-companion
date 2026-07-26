import { FileText, Target, Sparkles, GraduationCap, ArrowRight } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    { icon: FileText, title: "Add Notes", number: "1" },
    { icon: Target, title: "Choose Learning Goals", number: "2" },
    { icon: Sparkles, title: "Create with AI", number: "3" },
    { icon: GraduationCap, title: "Start Learning", number: "4" }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Steps */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Step {step.number}</div>
                    <div className="font-semibold text-slate-900">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />
                )}
              </div>
            ))}
          </div>
          
          {/* Subtext */}
          <p className="text-center text-slate-600 text-sm">
            Takes 60 seconds • Works on any device
          </p>
        </div>
      </div>
    </section>
  );
};