import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Smartphone, 
  DollarSign, 
  Users,
  CheckCircle,
  Globe,
  Award,
  Heart
} from "lucide-react";

export const WhyChooseUs = () => {
  const features = [
    {
      icon: MapPin,
      title: "Tailored for Ghanaian curriculum",
      description: "Built specifically for BECE and WASSCE syllabus with local context and examples",
      color: "primary"
    },
    {
      icon: Smartphone,
      title: "Works on any device",
      description: "Seamless experience across web and mobile - study anywhere, anytime",
      color: "secondary"
    },
    {
      icon: DollarSign,
      title: "Affordable pricing",
      description: "Free tier with premium features that won't break the bank",
      color: "accent"
    },
    {
      icon: Users,
      title: "Built for students, powered by teachers",
      description: "Real educators creating content with students' success in mind",
      color: "success"
    }
  ];

  const stats = [
    {
      icon: Award,
      number: "92%",
      label: "Pass Rate Improvement",
      description: "Students using our platform"
    },
    {
      icon: Globe,
      number: "50K+",
      label: "Active Learners",
      description: "Across Ghana and beyond"
    },
    {
      icon: CheckCircle,
      number: "2,400+",
      label: "Study Resources",
      description: "Created by expert teachers"
    },
    {
      icon: Heart,
      number: "4.8/5",
      label: "Student Satisfaction",
      description: "Based on user reviews"
    }
  ];

  const iconColors = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10", 
    accent: "text-accent bg-accent/10",
    success: "text-success bg-success/10"
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Choose Us?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We understand the unique challenges of Ghanaian education and built 
            a solution that truly works for local students and teachers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[feature.color as keyof typeof iconColors]}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center bg-card border-0 shadow-soft">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">
                {stat.number}
              </h3>
              <p className="font-semibold text-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};