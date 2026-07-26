import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  Zap,
  Users,
  Shield
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const faqs: FAQ[] = [
    {
      question: "How do I create an account?",
      answer: "Click 'I'm a Student' or 'I'm a Teacher' on the homepage, then follow the simple onboarding process. It takes less than 60 seconds!",
      category: "Getting Started"
    },
    {
      question: "Do I need to download anything?",
      answer: "No! mytuta works entirely in your web browser. Just visit our website and start learning immediately.",
      category: "Getting Started"
    },
    {
      question: "Is mytuta really free for students?",
      answer: "Yes! Students get full access to all features completely free, forever. No hidden fees, no credit card required.",
      category: "Pricing"
    },
    {
      question: "How does the AI work?",
      answer: "Our AI analyzes your study materials to create personalized revision plans, flashcards, and quizzes. It learns from your progress to make better recommendations.",
      category: "Features"
    },
    {
      question: "Can teachers and students collaborate?",
      answer: "Yes! Teachers can share resources with students. Full classroom features are coming soon.",
      category: "Features"
    },
    {
      question: "What subjects does mytuta support?",
      answer: "mytuta supports all subjects taught in Ghanaian schools, from JHS to SHS. Our AI adapts to any subject content you upload.",
      category: "Features"
    },
    {
      question: "How do I upload my notes?",
      answer: "Simply drag and drop your files or click the upload button. We support PDF, Word, and text files. Our AI will process them automatically.",
      category: "How to Use"
    },
    {
      question: "Is my data safe?",
      answer: "Absolutely! We use enterprise-grade security to protect your data. Your study materials are encrypted and never shared without your permission.",
      category: "Privacy & Security"
    },
    {
      question: "Can I use mytuta on my phone?",
      answer: "Yes! mytuta works perfectly on phones, tablets, and computers. Study anywhere, anytime.",
      category: "Accessibility"
    },
    {
      question: "How do I get help if I'm stuck?",
      answer: "You can contact our support team at team@mytuta.org, use this chatbot, or check our comprehensive FAQ section.",
      category: "Support"
    }
  ];

  const quickQuestions = [
    "How do I create flashcards?",
    "What subjects are supported?",
    "Is mytuta free?",
    "How does the AI work?",
    "Can I use it on mobile?",
    "How do I upload notes?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findBestAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Direct FAQ matching
    for (const faq of faqs) {
      if (faq.question.toLowerCase().includes(lowerQuestion) || 
          lowerQuestion.includes(faq.question.toLowerCase().split(' ')[0])) {
        return faq.answer;
      }
    }

    // Keyword-based responses
    if (lowerQuestion.includes('free') || lowerQuestion.includes('cost') || lowerQuestion.includes('price')) {
      return "Yes! mytuta is completely free for students forever. Teachers have affordable plans starting at just $5/month. No hidden fees!";
    }
    
    if (lowerQuestion.includes('mobile') || lowerQuestion.includes('phone') || lowerQuestion.includes('app')) {
      return "mytuta works perfectly on all devices - phones, tablets, and computers. Just visit our website in your browser, no app download needed!";
    }
    
    if (lowerQuestion.includes('ai') || lowerQuestion.includes('artificial intelligence')) {
      return "Our AI analyzes your study materials to create personalized revision plans, flashcards, and quizzes. It learns from your progress to make better recommendations over time.";
    }
    
    if (lowerQuestion.includes('upload') || lowerQuestion.includes('notes') || lowerQuestion.includes('file')) {
      return "Simply drag and drop your files or click the upload button. We support PDF, Word, and text files. Our AI will process them automatically to create study materials.";
    }
    
    if (lowerQuestion.includes('flashcard') || lowerQuestion.includes('quiz')) {
      return "Flashcards and quizzes are automatically generated from your uploaded notes. The AI creates questions based on your content and tracks your progress to improve over time.";
    }
    
    if (lowerQuestion.includes('help') || lowerQuestion.includes('support') || lowerQuestion.includes('contact')) {
      return "You can get help by:\n• Using this chatbot for instant answers\n• Emailing our support team at team@mytuta.org\n• Checking our FAQ section\n• Contacting us through our contact page";
    }
    
    if (lowerQuestion.includes('account') || lowerQuestion.includes('sign up') || lowerQuestion.includes('register')) {
      return "Creating an account is easy! Click 'I'm a Student' or 'I'm a Teacher' on our homepage, then follow the simple onboarding process. It takes less than 60 seconds!";
    }

    // Default response
    return "I understand you're asking about: \"" + question + "\". While I don't have a specific answer for that, I can help you with:\n\n• Account creation and setup\n• Using mytuta features\n• Pricing and plans\n• Technical support\n• General questions about our platform\n\nTry asking about one of these topics, or contact our support team at team@mytuta.org for more specific help!";
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = findBestAnswer(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-0 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">mytuta Assistant</h3>
              <p className="text-xs text-white/80">Online now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <Bot className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Hi! I'm your mytuta Assistant</h4>
                <p className="text-sm text-slate-600 mb-4">
                  I can help you with questions about mytuta, our features, pricing, and more!
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Quick questions:</p>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full justify-start text-left text-xs h-auto py-2 px-3 border-slate-200 hover:border-teal-300 hover:bg-teal-50"
                    >
                      <HelpCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600'
                      : 'bg-slate-100'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-slate-600" />
                </div>
                <div className="bg-slate-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about mytuta..."
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;
