import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen,
  Clock,
  User,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      category: "Study Tips",
      title: "5 Proven Study Techniques That Actually Work",
      excerpt: "Discover evidence-based study methods that will help you retain more information and ace your exams.",
      author: "mytuta Team",
      date: "Jan 15, 2025",
      readTime: "5 min read",
      image: "study-tips",
      featured: true,
      slug: "5-proven-study-techniques"
    },
    {
      category: "For Teachers",
      title: "How to Create Engaging Lesson Plans in 10 Minutes",
      excerpt: "Learn how AI can help you create comprehensive, engaging lesson plans that save time and improve student outcomes.",
      author: "Mr. Owusu",
      date: "Jan 12, 2025",
      readTime: "4 min read",
      image: "lesson-planning",
      slug: "engaging-lesson-plans"
    },
    {
      category: "Student Success",
      title: "From 45% to 87%: How Ama Transformed Her Study Habits",
      excerpt: "Read about how one JHS student used mytuta AI to completely transform her academic performance.",
      author: "Student Stories",
      date: "Jan 10, 2025",
      readTime: "6 min read",
      image: "success-story",
      slug: "ama-success-story"
    },
    {
      category: "AI & Education",
      title: "The Future of Learning: AI in Ghanaian Classrooms",
      excerpt: "Explore how artificial intelligence is transforming education in Ghana and what it means for students and teachers.",
      author: "mytuta Team",
      date: "Jan 8, 2025",
      readTime: "7 min read",
      image: "ai-education",
      slug: "ai-education-ghana"
    },
    {
      category: "Study Tips",
      title: "Mastering Flashcards: A Complete Guide",
      excerpt: "Everything you need to know about using flashcards effectively for better memory retention and exam preparation.",
      author: "mytuta Team",
      date: "Jan 5, 2025",
      readTime: "5 min read",
      image: "flashcards",
      slug: "mastering-flashcards"
    },
    {
      category: "For Teachers",
      title: "Differentiation Made Easy with AI",
      excerpt: "Learn how to quickly adapt your lessons for different learning levels using mytuta AI's smart tools.",
      author: "Ms. Adjei",
      date: "Jan 3, 2025",
      readTime: "4 min read",
      image: "differentiation",
      slug: "differentiation-made-easy"
    }
  ];

  const categories = [
    { name: "All Posts", count: 12, icon: BookOpen },
    { name: "Study Tips", count: 5, icon: Lightbulb },
    { name: "For Teachers", count: 4, icon: User },
    { name: "Student Success", count: 3, icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-teal-200">
              <BookOpen className="w-4 h-4" />
              Learning Resources
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Study Tips, Teaching
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Strategies & More
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Articles, guides, and success stories to help you learn better and teach smarter.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar - Categories */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className="w-4 h-4 text-teal-600" />
                        <span className="text-slate-700 font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content - Blog Posts */}
              <div className="lg:col-span-3">
                {/* Featured Post */}
                {blogPosts.filter(post => post.featured).map((post, index) => (
                  <Card key={index} className="p-8 mb-12 bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 shadow-lg">
                    <Badge className="bg-teal-600 text-white mb-4">Featured</Badge>
                    <div className="space-y-4">
                      <Badge variant="outline" className="border-teal-600 text-teal-700">
                        {post.category}
                      </Badge>
                      
                      <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                        {post.title}
                      </h2>
                      
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-600 pt-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                        <span>{post.date}</span>
                      </div>
                      
                      <Button 
                        asChild
                        className="mt-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                      >
                        <Link to={`/blog/${post.slug}`}>
                          Read Article
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts.filter(post => !post.featured).map((post, index) => (
                    <Card key={index} className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="space-y-4">
                        <Badge variant="outline" className="border-teal-600 text-teal-700">
                          {post.category}
                        </Badge>
                        
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-600 leading-relaxed">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        
                        <Button 
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 border-teal-600 text-teal-700 hover:bg-teal-50"
                        >
                          <Link to={`/blog/${post.slug}`}>
                            Read More
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Load More Articles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Sparkles className="w-12 h-12 text-white mx-auto" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Want to Contribute?
            </h2>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Have a study tip or teaching strategy to share? We'd love to feature your story on our blog.
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-white text-teal-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => window.location.href = 'mailto:blog@mytuta.org'}
            >
              Submit Your Article
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;

