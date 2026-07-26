import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle,
  Sparkles
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const FAQs = () => {
  const faqCategories = [
    {
      category: "Getting Started",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click 'I'm a Student' or 'I'm a Teacher' on the homepage, then follow the simple onboarding process. It takes less than 60 seconds!"
        },
        {
          question: "Do I need to download anything?",
          answer: "No! mytuta AI works in your web browser on any device - phone, tablet, or computer. Just visit mytuta.org."
        },
        {
          question: "Is mytuta really free for students?",
          answer: "Yes! 100% free forever for students. No credit card required. We believe every student deserves access to great learning tools."
        },
        {
          question: "Can I use mytuta on my mobile phone?",
          answer: "Absolutely! mytuta is fully optimized for mobile devices and works great on phones, tablets, and computers."
        }
      ]
    },
    {
      category: "For Students",
      faqs: [
        {
          question: "How do I create a revision plan?",
          answer: "Simply upload or paste your notes, choose 'Revision Plan', and mytuta AI will generate a personalized study guide in seconds."
        },
        {
          question: "What subjects does mytuta cover?",
          answer: "All subjects from Primary through SHS - English, Mathematics, Science, Social Studies, ICT, and more. Everything aligned with the Ghana Education Service curriculum."
        },
        {
          question: "How do I earn XP and badges?",
          answer: "Complete study sessions, finish quizzes, maintain daily streaks, and achieve learning milestones. The more you study, the more you earn!"
        },
        {
          question: "Can I study offline?",
          answer: "Currently, you need an internet connection to use mytuta. Offline mode is coming soon!"
        },
        {
          question: "How do flashcards work?",
          answer: "Upload your notes, choose 'Flashcards', and mytuta AI automatically generates study cards. You can review them anytime, track your progress, and focus on cards you find challenging."
        }
      ]
    },
    {
      category: "For Teachers",
      faqs: [
        {
          question: "How long does it take to create a lesson plan?",
          answer: "About 5-10 minutes from start to finish. You can review and customize the AI-generated plan to match your teaching style."
        },
        {
          question: "Can I edit the AI-generated content?",
          answer: "Yes! You have full control to edit, customize, and adapt all content to fit your needs and teaching approach."
        },
        {
          question: "How do I share resources with students?",
          answer: "Share links, export as PDF, or use our sharing features (coming soon) to distribute materials directly to your students."
        },
        {
          question: "Is my content private?",
          answer: "Absolutely! Your lesson plans and materials are private to you unless you choose to share them. We never share your content without permission."
        },
        {
          question: "What happens after my free trial?",
          answer: "After 14 days, you'll be asked to subscribe at GH₵50/month. You can cancel anytime before the trial ends with no charges."
        }
      ]
    },
    {
      category: "Technical",
      faqs: [
        {
          question: "What browsers does mytuta support?",
          answer: "mytuta works best on Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser."
        },
        {
          question: "How fast is the AI generation?",
          answer: "Most content (flashcards, quizzes) generates in 20-60 seconds. Lesson plans take 5-10 minutes. Speed depends on content complexity and internet connection."
        },
        {
          question: "Does mytuta work with slow internet?",
          answer: "Yes! We've optimized mytuta to work well even on slower connections common in Ghana."
        },
        {
          question: "Is my data secure?",
          answer: "Yes! We use industry-standard encryption to protect your data. We never share your personal information or study materials with third parties."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account at any time from your profile settings. All your data will be permanently removed."
        }
      ]
    },
    {
      category: "Pricing & Payment",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), Visa, Mastercard, and bank transfers."
        },
        {
          question: "Can I get a refund?",
          answer: "Yes! If you're not satisfied within the first 7 days of your paid subscription, contact us for a full refund."
        },
        {
          question: "Do you offer discounts for schools?",
          answer: "Yes! We offer special institutional pricing for schools and learning centers. Contact us at support@mytuta.org for details."
        },
        {
          question: "Will the price increase?",
          answer: "Your subscription price is locked in when you sign up. Any future price changes won't affect existing subscribers."
        }
      ]
    },
    {
      category: "Features",
      faqs: [
        {
          question: "What's the difference between revision plans and learning paths?",
          answer: "Revision plans help you study existing material for exams. Learning paths guide you through learning new topics from scratch with step-by-step lessons."
        },
        {
          question: "How accurate is the AI?",
          answer: "Our AI is trained on educational content and Ghana's curriculum. While very accurate, we recommend teachers and students review generated content for accuracy."
        },
        {
          question: "Can I collaborate with other students?",
          answer: "Study groups and collaboration features are coming soon! Currently, you can share resources via links."
        },
        {
          question: "What's coming next?",
          answer: "We're working on offline mode, student-teacher classroom features, voice notes, video integration, and more! Follow us for updates."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-teal-200">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Frequently Asked
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Questions
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Find answers to common questions about mytuta AI. Can't find what you're looking for? Contact us at support@mytuta.org
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{catIndex + 1}</span>
                  </div>
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <Card key={faqIndex} className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="w-12 h-12 text-teal-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              We're here to help! Reach out to our support team and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = 'mailto:support@mytuta.org'}
              >
                Contact Support
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQs;

