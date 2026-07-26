import { Star } from "lucide-react";

export const SocialProof = () => {
  const stats = [
    { label: "Students", value: "500+" },
    { label: "Teachers", value: "50+" },
    { label: "Sessions", value: "10,000+" },
    { label: "Rating", value: "4.9", icon: true }
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-teal-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl md:text-4xl font-bold text-slate-900">
                  {stat.value}
                </span>
                {stat.icon && <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />}
              </div>
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

