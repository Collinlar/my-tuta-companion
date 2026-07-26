import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database, Users, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your name, email address, grade level (for students), subject areas (for teachers), and school information (optional)."
        },
        {
          subtitle: "Study Materials",
          text: "We collect and store the notes, study materials, and content you upload to generate revision plans, flashcards, quizzes, and other learning resources."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you use mytuta, including study sessions, time spent, features used, and performance metrics to improve our services."
        },
        {
          subtitle: "Device Information",
          text: "We collect device type, browser type, IP address, and operating system to optimize your experience and ensure security."
        }
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Provide Services",
          text: "We use your information to generate personalized learning content, track your progress, and deliver the core features of mytuta AI."
        },
        {
          subtitle: "Improve Our Platform",
          text: "We analyze usage patterns to enhance our AI algorithms, add new features, and improve user experience."
        },
        {
          subtitle: "Communication",
          text: "We may send you service updates, educational tips, and important notifications about your account. You can opt out of marketing emails anytime."
        },
        {
          subtitle: "Support",
          text: "We use your information to provide customer support and respond to your inquiries."
        }
      ]
    },
    {
      icon: Shield,
      title: "Data Protection & Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols."
        },
        {
          subtitle: "Storage Security",
          text: "Your data is stored on secure servers with restricted access, regular backups, and industry-standard security measures."
        },
        {
          subtitle: "Access Control",
          text: "Only authorized personnel with legitimate business needs have access to user data, and all access is logged and monitored."
        },
        {
          subtitle: "Data Retention",
          text: "We retain your data as long as your account is active. You can request data deletion at any time from your profile settings."
        }
      ]
    },
    {
      icon: Users,
      title: "Data Sharing & Disclosure",
      content: [
        {
          subtitle: "We Do NOT Share Your Study Materials",
          text: "Your notes, study content, and learning materials are private and will never be shared with third parties or other users without your explicit consent."
        },
        {
          subtitle: "Service Providers",
          text: "We may share limited data with trusted service providers (hosting, analytics, payment processing) who are contractually obligated to protect your information."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, court order, or to protect the rights, property, or safety of mytuta, our users, or the public."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, user information may be transferred, but we will notify you and ensure data protection continues."
        }
      ]
    },
    {
      icon: Eye,
      title: "Your Privacy Rights",
      content: [
        {
          subtitle: "Access & Download",
          text: "You can access and download all your personal data and study materials at any time from your account settings."
        },
        {
          subtitle: "Correction",
          text: "You can update or correct your personal information directly in your profile settings."
        },
        {
          subtitle: "Deletion",
          text: "You can request complete account deletion, which will permanently remove all your data from our systems within 30 days."
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of marketing communications while still receiving important service updates and security notifications."
        },
        {
          subtitle: "Data Portability",
          text: "You can export your data in a machine-readable format for transfer to another service."
        }
      ]
    },
    {
      icon: Users,
      title: "Children's Privacy",
      content: [
        {
          subtitle: "Student Protection",
          text: "We take special care to protect the privacy of students under 18. We do not knowingly collect more information than necessary to provide our educational services."
        },
        {
          subtitle: "Parental Rights",
          text: "Parents and guardians have the right to review, modify, or delete their child's information. Contact us at support@mytuta.org for assistance."
        },
        {
          subtitle: "COPPA Compliance",
          text: "For students under 13, we require parental consent and strictly limit data collection to what is necessary for educational purposes."
        }
      ]
    },
    {
      icon: Mail,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use essential cookies to maintain your login session and remember your preferences."
        },
        {
          subtitle: "Analytics",
          text: "We use analytics tools to understand how users interact with mytuta and identify areas for improvement. This data is anonymized."
        },
        {
          subtitle: "Your Control",
          text: "You can control cookie settings through your browser. However, disabling essential cookies may affect platform functionality."
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
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Your Privacy
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Matters to Us
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              We're committed to protecting your privacy and being transparent about how we collect, use, and protect your data.
            </p>
            
            <p className="text-sm text-slate-500">
              Last Updated: January 15, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Privacy Principles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200">
                <Lock className="w-10 h-10 text-teal-600 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Privacy First</h3>
                <p className="text-sm text-slate-600">Your study materials are private and never shared without your consent</p>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <Shield className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Secure by Design</h3>
                <p className="text-sm text-slate-600">Industry-standard encryption and security measures protect your data</p>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                <Eye className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Full Transparency</h3>
                <p className="text-sm text-slate-600">We're open about what data we collect and how we use it</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
                </div>
                
                <div className="space-y-6 ml-16">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="w-12 h-12 text-teal-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Questions About Privacy?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              We're here to help. Contact our privacy team with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = 'mailto:privacy@mytuta.org'}
              >
                Contact Privacy Team
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

export default Privacy;

