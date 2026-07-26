import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Brain, 
  HelpCircle, 
  Route,
  Star,
  Users,
  Download,
  ArrowRight,
  Search,
  Filter,
  Heart,
  Eye,
  ShoppingCart,
  ChevronDown,
  Sparkles,
  FileText,
  GraduationCap,
  Layers
} from "lucide-react";
import { useState } from "react";

export const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");

  const featuredResources = [
    {
      id: 1,
      title: "Complete Mathematics Revision Pack - JHS 3",
      description: "Comprehensive revision materials covering all JHS 3 mathematics topics with practice questions and solutions.",
      type: "Revision Pack",
      typeIcon: FileText,
      price: "₵25",
      author: "Mr. Kwaku Asante",
      rating: 4.8,
      reviewCount: 127,
      downloads: 450,
      subject: "Mathematics",
      level: "JHS 3",
      isFeatured: true
    },
    {
      id: 2,
      title: "English Language Essay Writing Guide",
      description: "Step-by-step guide to mastering essay writing with examples and practice exercises.",
      type: "Study Guide",
      typeIcon: BookOpen,
      price: "₵20",
      author: "Mr. Kofi Baah",
      rating: 4.9,
      reviewCount: 89,
      downloads: 320,
      subject: "English",
      level: "SHS 1-3",
      isFeatured: true
    },
    {
      id: 3,
      title: "Physics Problem Solving Masterclass",
      description: "Advanced problem-solving techniques for physics with detailed explanations and practice problems.",
      type: "Masterclass",
      typeIcon: GraduationCap,
      price: "₵30",
      author: "Dr. Emmanuel Nkrumah",
      rating: 4.7,
      reviewCount: 156,
      downloads: 280,
      subject: "Physics",
      level: "SHS 2-3",
      isFeatured: true
    }
  ];

  const allResources = [
    ...featuredResources,
    {
      id: 4,
      title: "Interactive Science Flashcards - SHS 1",
      description: "Digital flashcards covering all SHS 1 science topics with interactive features.",
      type: "Flashcards",
      typeIcon: Layers,
      price: "₵15",
      author: "Ms. Akosua Mensah",
      rating: 4.6,
      reviewCount: 73,
      downloads: 190,
      subject: "Science",
      level: "SHS 1",
      isFeatured: false
    }
  ];

  const categories = ["All Categories", "Revision Packs", "Study Guides", "Masterclasses", "Flashcards"];
  const subjects = ["All Subjects", "Mathematics", "English", "Science", "Physics", "Chemistry", "Biology"];

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "Revision Pack": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Study Guide": return "bg-green-100 text-green-700 border-green-200";
      case "Masterclass": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Flashcards": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Marketplace</h1>
        <p className="text-slate-600">
          Discover quality educational resources from verified teachers
        </p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-6 border border-slate-200 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search resources, subjects, or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 h-12 text-slate-700 focus:border-blue-500 focus:ring-blue-500 min-w-[160px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 h-12 text-slate-700 focus:border-blue-500 focus:ring-blue-500 min-w-[140px]"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Featured Resources */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Featured Resources</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredResources.map((resource) => (
            <Card key={resource.id} className="p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
              <div className="relative">
                {resource.isFeatured && (
                  <Badge className="absolute -top-2 -left-2 bg-green-500 text-white border-0">
                    Featured
                  </Badge>
                )}
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`${getResourceTypeColor(resource.type)} border`}>
                    <resource.typeIcon className="w-3 h-3 mr-1" />
                    {resource.type}
                  </Badge>
                  <Heart className="w-5 h-5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {resource.description}
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
                    {resource.subject}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
                    {resource.level}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{resource.rating}</span>
                    <span>({resource.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{resource.downloads}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-slate-900">{resource.price}</div>
                    <div className="text-sm text-slate-600">by {resource.author}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="h-9 bg-green-500 hover:bg-green-600 text-white">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* All Resources */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">All Resources ({allResources.length})</h2>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allResources.map((resource) => (
            <Card key={resource.id} className="p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
              <div className="relative">
                {resource.isFeatured && (
                  <Badge className="absolute -top-2 -left-2 bg-green-500 text-white border-0">
                    Featured
                  </Badge>
                )}
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`${getResourceTypeColor(resource.type)} border`}>
                    <resource.typeIcon className="w-3 h-3 mr-1" />
                    {resource.type}
                  </Badge>
                  <Heart className="w-5 h-5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {resource.description}
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
                    {resource.subject}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
                    {resource.level}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{resource.rating}</span>
                    <span>({resource.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{resource.downloads}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-slate-900">{resource.price}</div>
                    <div className="text-sm text-slate-600">by {resource.author}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="h-9 bg-green-500 hover:bg-green-600 text-white">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};