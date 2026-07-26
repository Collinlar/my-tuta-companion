import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export const CallToAction = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-teal-600 to-blue-600 relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ready to Transform Your Learning?
          </h2>
          
          <p className="text-xl text-white/90 leading-relaxed">
            Join 500+ students and 50+ teachers who are already succeeding with mytuta AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-white text-teal-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => window.location.href = '/signup'}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => {/* Handle watch demo */}}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch 2-Min Demo
            </Button>
          </div>
          
          <p className="text-sm text-white/70">
            No credit card required • Works on any device • Free for students forever
          </p>
        </div>
      </div>
    </section>
  );
};