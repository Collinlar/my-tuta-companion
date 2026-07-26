import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Target, 
  Lightbulb, 
  Users, 
  Flag,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Student-Centered",
      description: "Every feature we build starts with one question: How does this help students learn better?"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We leverage the latest AI technology to create learning experiences that were impossible before."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Your data is private and secure. We're committed to protecting student and teacher information."
    },
    {
      icon: Users,
      title: "Community",
      description: "We're building a community of learners and educators who support each other's growth."
    }
  ];

  const milestones = [
    { year: "2025", title: "mytuta Launch", description: "Launched mytuta AI to help Ghanaian students and teachers" },
    { year: "2025", title: "500+ Students", description: "Reached our first 500 active student users" },
    { year: "2025", title: "50+ Teachers", description: "50+ teachers using mytuta to save time and enhance lessons" },
    { year: "Future", title: "Your Story", description: "Join us in transforming education across Ghana" }
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
              About Us
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              We're on a Mission to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Transform Learning in Ghana
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              mytuta AI was born from a simple belief: every student deserves access to personalized, high-quality learning tools, and every teacher deserves technology that makes their job easier.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                  <p>
                    We saw students struggling with piles of notes, not knowing how to study effectively. We saw teachers spending hours on lesson planning instead of focusing on their students.
                  </p>
                  <p>
                    We knew AI could help, but existing tools weren't built for the Ghanaian context. They didn't understand our curriculum, our challenges, or our needs.
                  </p>
                  <p>
                    So we built mytuta AI - a learning platform designed specifically for Ghanaian students and teachers. One that understands the Ghana Education Service curriculum, works on slower internet connections, and puts learning first.
                  </p>
                </div>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Our Mission</h3>
                      <p className="text-slate-600">Empower every learner to succeed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <Flag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Our Vision</h3>
                      <p className="text-slate-600">AI-powered education for all of Ghana</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Our Goal</h3>
                      <p className="text-slate-600">Help 100,000+ students by 2026</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
              <p className="text-xl text-slate-600">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-8 text-center bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Journey</h2>
              <p className="text-xl text-slate-600">Key milestones in our mission</p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <Card key={index} className="p-8 bg-white border-l-4 border-teal-600 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{milestone.year}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
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
              Join Us on This Journey
            </h2>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Whether you're a student, teacher, or education enthusiast, you're part of the mytuta family. Let's transform learning together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-white text-teal-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => window.location.href = '/onboarding'}
              >
                Get Started Today
              </Button>
            </div>
            
            <p className="text-sm text-white/70">
              Join 500+ students and 50+ teachers already using mytuta
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

