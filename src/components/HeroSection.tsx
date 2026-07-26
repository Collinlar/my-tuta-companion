import { useNavigate } from "react-router-dom";
import { Brain, CheckCircle2 } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0A0E1A] overflow-hidden pt-20">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — typographic content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="text-xs font-semibold tracking-widest text-teal-400 uppercase">
                Built for BECE and WASSCE students
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              The study app<br />
              Ghana's schools<br />
              <span className="text-teal-400">actually need.</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Upload your notes. Get a revision plan matched to your exam date.
              Practice with Ghana curriculum questions. Free for every student, starting today.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/signup?type=student')}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-colors duration-200 text-base"
              >
                Start studying free
              </button>
              <button
                onClick={() => navigate('/signup?type=teacher')}
                className="px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-colors duration-200 text-base"
              >
                I'm a teacher
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {[
                "Free for students, always",
                "Ghana curriculum — Primary through SHS",
                "Revision plans, flashcards, and practice quizzes in one place",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-400">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — study card mockup */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Background card */}
              <div className="absolute top-4 left-4 right-0 bottom-0 bg-slate-800/50 rounded-2xl border border-slate-700/50" />

              {/* Main card */}
              <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Flashcard Review</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-md">
                    8 of 24
                  </span>
                </div>

                <div className="bg-slate-900 rounded-xl p-5 mb-4 min-h-[120px] flex items-center">
                  <p className="text-white font-medium leading-relaxed">
                    Explain the role of the Legislative branch in Ghana's government under the 1992 Constitution.
                  </p>
                </div>

                <div className="flex gap-2 mb-5">
                  <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-1 rounded-md">Social Studies</span>
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-md">BECE Prep</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
                    Review again
                  </button>
                  <button className="py-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-medium hover:bg-teal-500/20 transition-colors">
                    Got it
                  </button>
                </div>
              </div>

              {/* Progress pill floating above */}
              <div className="absolute -top-4 right-6 bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                73% mastered
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
