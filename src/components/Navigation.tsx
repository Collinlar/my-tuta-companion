import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, User, GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleStudentSignUp = () => {
    navigate('/signup?type=student');
  };

  const handleTeacherSignUp = () => {
    navigate('/signup?type=teacher');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Brain className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-200">
              mytuta
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/features" 
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Features
            </Link>
            <Link 
              to="/about" 
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              About Us
            </Link>
            <Link 
              to="/pricing" 
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link 
              to="/faqs" 
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              FAQs
            </Link>
            <Link 
              to="/blog" 
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className="text-slate-600 hover:text-teal-600 hover:bg-teal-50 font-medium px-6 py-2 transition-all duration-200"
            >
              Sign In
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Join free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <Link 
                  to="/features" 
                  className="block text-slate-600 hover:text-teal-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/about" 
                  className="block text-slate-600 hover:text-teal-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link 
                  to="/pricing" 
                  className="block text-slate-600 hover:text-teal-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/faqs" 
                  className="block text-slate-600 hover:text-teal-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQs
                </Link>
                <Link 
                  to="/blog" 
                  className="block text-slate-600 hover:text-teal-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-slate-600 hover:text-teal-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-slate-200/50 space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-slate-600 hover:text-teal-600 hover:bg-teal-50 font-medium py-3"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      handleStudentSignUp();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium py-3 shadow-lg"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    I'm a Student
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleTeacherSignUp();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-medium py-3"
                  >
                    <User className="w-4 h-4 mr-2" />
                    I'm a Teacher
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
