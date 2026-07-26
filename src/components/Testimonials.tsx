import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Sparkles } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Ama K.",
      role: "JHS 3 Student",
      content: "Before mytuta, I just read my notes over and over. Now I have a clear plan. My last test? 87%! 🎉",
      rating: 5,
      avatar: "AK"
    },
    {
      name: "Mr. Owusu",
      role: "SHS Maths Teacher",
      content: "Lesson planning used to take 2-3 hours. Now it takes 10 minutes, and the quality is better. Game changer.",
      rating: 5,
      avatar: "MO"
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              {/* Background Quote Icon */}
              <div className="absolute top-4 right-4 opacity-5">
                <Quote className="w-20 h-20 text-slate-400" />
              </div>
              
              <div className="relative">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Quote Content */}
                <blockquote className="text-base text-slate-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};