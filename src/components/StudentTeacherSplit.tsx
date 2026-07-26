import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export const StudentTeacherSplit = () => {
  const studentFeatures = [
    "Smart revision plans that actually work",
    "Flashcards & quizzes in seconds",
    "Track your progress with every study session",
    "Learn at your own pace, anytime, anywhere"
  ];

  const teacherFeatures = [
    "Complete lesson plans in 10 minutes",
    "Generate assessments instantly",
    "Track student progress effortlessly",
    "Save 5-10 hours every week"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* For Students */}
          <Card className="p-10 bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 hover:shadow-xl transition-all duration-300">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">
                For Students
              </h2>
              
              <p className="text-xl text-teal-800 font-semibold">
                Stop Stressing. Start Succeeding.
              </p>
              
              <ul className="space-y-4">
                {studentFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="w-full text-lg py-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/signup?type=student'}
              >
                Start Learning Free →
              </Button>
            </div>
          </Card>

          {/* For Teachers */}
          <Card className="p-10 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">
                For Teachers
              </h2>
              
              <p className="text-xl text-blue-800 font-semibold">
                Stop Planning. Start Teaching.
              </p>
              
              <ul className="space-y-4">
                {teacherFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/signup?type=teacher'}
              >
                Try Free for 14 Days →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

