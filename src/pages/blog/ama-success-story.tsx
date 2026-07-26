import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  Target,
  Calendar,
  Star,
  Award,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const AmaSuccessStory = () => {
  return (
    <>
      <Helmet>
        <title>From 45% to 87%: How Ama Transformed Her Study Habits | mytuta AI Blog</title>
        <meta name="description" content="Read about how one JHS student used mytuta AI to completely transform her academic performance. A real success story from Ghana." />
        <meta name="keywords" content="student success story, academic improvement, study transformation, Ghana education, JHS student, mytuta AI success, study habits" />
        <meta property="og:title" content="From 45% to 87%: How Ama Transformed Her Study Habits" />
        <meta property="og:description" content="Read about how one JHS student used mytuta AI to completely transform her academic performance." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://mytuta.org/blog/ama-success-story" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="From 45% to 87%: How Ama Transformed Her Study Habits" />
        <meta name="twitter:description" content="Read about how one JHS student used mytuta AI to completely transform her academic performance." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "From 45% to 87%: How Ama Transformed Her Study Habits",
            "description": "Read about how one JHS student used mytuta AI to completely transform her academic performance.",
            "author": {
              "@type": "Organization",
              "name": "Student Stories"
            },
            "publisher": {
              "@type": "Organization",
              "name": "mytuta AI",
              "logo": {
                "@type": "ImageObject",
                "url": "https://mytuta.org/logo.png"
              }
            },
            "datePublished": "2025-01-10",
            "dateModified": "2025-01-10",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://mytuta.org/blog/ama-success-story"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Article Header */}
        <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              
              <Badge variant="outline" className="border-green-600 text-green-700 mb-4">Student Success</Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                From 45% to 87%: How Ama Transformed Her Study Habits
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Read about how one JHS student used mytuta AI to completely transform her academic performance. 
                A real success story that shows the power of personalized learning and determination.
              </p>
              
              <div className="flex items-center gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Student Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>6 min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>January 10, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg prose-slate max-w-none">
              
              {/* Introduction */}
              <div className="mb-12">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Meet Ama, a 14-year-old JHS 2 student from Accra who was struggling with her studies. 
                  Like many students, she found it difficult to focus, retain information, and perform 
                  well in exams. Her average score was 45%, and she was losing confidence in her abilities.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Today, Ama is one of the top students in her class with an average of 87%. This is 
                  her incredible transformation story and how mytuta AI played a crucial role in her 
                  academic success.
                </p>
              </div>

              {/* The Challenge */}
              <Card className="p-8 mb-12 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">The Challenge: Struggling to Keep Up</h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Ama's Initial Struggles</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Academic Performance</h4>
                        <ul className="space-y-2 text-slate-700 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Average score: 45%</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Failed Mathematics twice</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Struggled with English comprehension</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Science concepts were confusing</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Study Habits</h4>
                        <ul className="space-y-2 text-slate-700 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Studied only before exams</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>No structured study plan</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Easily distracted while studying</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Didn't understand how to revise</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Ama's Own Words</h3>
                    <blockquote className="text-slate-700 italic border-l-4 border-red-300 pl-4">
                      "I felt so frustrated. No matter how hard I tried to study, I just couldn't understand 
                      the topics. My friends seemed to get it easily, but I was always behind. I thought 
                      I wasn't smart enough for school."
                    </blockquote>
                  </div>
                </div>
              </Card>

              {/* The Discovery */}
              <Card className="p-8 mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">The Discovery: Finding mytuta AI</h2>
                
                <div className="space-y-6">
                  <p className="text-slate-700">
                    Ama's older sister, who was studying at the University of Ghana, introduced her to 
                    mytuta AI. At first, Ama was skeptical about using technology for studying, but she 
                    was willing to try anything that might help.
                  </p>
                  
                  <div className="bg-white p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">How Ama Started</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full p-2">
                          <span className="text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Created Her Profile</h4>
                          <p className="text-slate-700 text-sm">Ama filled out her learning preferences, subjects, and goals</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full p-2">
                          <span className="text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Uploaded Her Notes</h4>
                          <p className="text-slate-700 text-sm">She uploaded her class notes and past exam papers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full p-2">
                          <span className="text-sm font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Generated Study Materials</h4>
                          <p className="text-slate-700 text-sm">mytuta AI created personalized flashcards, quizzes, and study guides</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full p-2">
                          <span className="text-sm font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Started Daily Practice</h4>
                          <p className="text-slate-700 text-sm">She committed to 30 minutes of daily study using the AI-generated materials</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* The Transformation */}
              <Card className="p-8 mb-12 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">The Transformation: 6 Months of Progress</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">Month 1</div>
                      <div className="text-2xl font-bold text-slate-900 mb-2">52%</div>
                      <p className="text-slate-700 text-sm">First improvement in test scores</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">Month 3</div>
                      <div className="text-2xl font-bold text-slate-900 mb-2">68%</div>
                      <p className="text-slate-700 text-sm">Consistent improvement</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">Month 6</div>
                      <div className="text-2xl font-bold text-slate-900 mb-2">87%</div>
                      <p className="text-slate-700 text-sm">Top of her class!</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">What Changed for Ama</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Study Methods</h4>
                        <ul className="space-y-2 text-slate-700 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Daily 30-minute study sessions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Interactive flashcards for memorization</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Practice quizzes to test understanding</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Personalized learning paths</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Confidence & Motivation</h4>
                        <ul className="space-y-2 text-slate-700 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Gained confidence in her abilities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Became more motivated to study</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Started helping classmates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Set higher goals for herself</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Key Strategies */}
              <Card className="p-8 mb-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Strategies That Made the Difference</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-600 text-white rounded-full p-2">
                          <Brain className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Spaced Repetition</h3>
                      </div>
                      <p className="text-slate-700 text-sm mb-3">
                        Ama used mytuta AI's spaced repetition system to review topics at optimal intervals, 
                        helping her retain information long-term.
                      </p>
                      <div className="text-xs text-slate-600">
                        "I finally understood why I kept forgetting things. The AI reminded me to review 
                        topics just when I was about to forget them."
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-600 text-white rounded-full p-2">
                          <Target className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Personalized Learning</h3>
                      </div>
                      <p className="text-slate-700 text-sm mb-3">
                        The AI adapted to Ama's learning style and pace, focusing on her weak areas 
                        while reinforcing her strengths.
                      </p>
                      <div className="text-xs text-slate-600">
                        "It felt like having a personal tutor who understood exactly what I needed to learn."
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-600 text-white rounded-full p-2">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Progress Tracking</h3>
                      </div>
                      <p className="text-slate-700 text-sm mb-3">
                        Ama could see her progress in real-time, which motivated her to keep studying 
                        and set higher goals.
                      </p>
                      <div className="text-xs text-slate-600">
                        "Seeing my scores improve every week made me want to study even more."
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-600 text-white rounded-full p-2">
                          <Award className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Gamification</h3>
                      </div>
                      <p className="text-slate-700 text-sm mb-3">
                        The AI's gamified approach made studying fun and engaging, turning learning 
                        into a rewarding experience.
                      </p>
                      <div className="text-xs text-slate-600">
                        "I actually looked forward to studying because it felt like playing a game."
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Current Status */}
              <Card className="p-8 mb-12 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Where Ama Is Now</h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-teal-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Academic Achievements</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <ul className="space-y-2 text-slate-700">
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Top 5 in her class</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>87% average score</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Passed all subjects</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Class prefect</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <ul className="space-y-2 text-slate-700">
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Helps struggling classmates</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Confident in all subjects</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Sets ambitious goals</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Plans to study science in SHS</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-teal-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Ama's Message to Other Students</h3>
                    <blockquote className="text-slate-700 italic border-l-4 border-teal-300 pl-4">
                      "Don't give up on yourself. I used to think I wasn't smart enough, but I was just 
                      studying the wrong way. mytuta AI showed me that I could learn anything if I had 
                      the right tools and methods. If I can do it, you can too!"
                    </blockquote>
                  </div>
                </div>
              </Card>

              {/* Conclusion */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Success Story Starts Here</h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Ama's story proves that with the right tools, determination, and support, any student 
                  can transform their academic performance. The key is finding a learning method that 
                  works for you and sticking with it consistently.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Whether you're struggling like Ama was or just looking to improve your grades, 
                  mytuta AI can help you achieve your academic goals through personalized, 
                  AI-powered learning.
                </p>
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Ready to Write Your Own Success Story?</h3>
                  <p className="text-slate-700 mb-4">
                    Join thousands of students like Ama who are using mytuta AI to transform their 
                    academic performance. Start your personalized learning journey today.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Start Your Transformation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default AmaSuccessStory;
