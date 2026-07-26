import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Heart, 
  ShoppingCart,
  Upload,
  DollarSign,
  BookOpen,
  FileText,
  Brain,
  HelpCircle,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  ChevronDown,
  GraduationCap,
  Layers
} from "lucide-react";

interface MarketplaceViewProps {
  userType: 'student' | 'teacher';
}

interface Resource {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subject: string;
  level: string;
  seller: string;
  rating: number;
  reviews: number;
  downloads: number;
  thumbnail: string;
  type: 'lesson-plan' | 'flashcards' | 'quiz' | 'revision-notes' | 'worksheet';
  tags: string[];
  featured: boolean;
}

const mockResources: Resource[] = [];

export const MarketplaceView = ({ userType }: MarketplaceViewProps) => {
  const [currentView, setCurrentView] = useState<'browse' | 'upload' | 'mystore'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const categories = ['all', 'Revision Pack', 'Flashcards', 'Study Guide', 'Worksheet', 'Masterclass'];
  const subjects = ['all', 'Mathematics', 'Science', 'English Language', 'Social Studies', 'Physics'];

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const featuredResources = mockResources.filter(resource => resource.featured);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson-plan': return FileText;
      case 'flashcards': return Brain;
      case 'quiz': return HelpCircle;
      case 'revision-notes': return BookOpen;
      case 'worksheet': return Calendar;
      default: return FileText;
    }
  };

  const BrowseView = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Marketplace</h1>
          <p className="text-slate-600">Discover quality educational resources from verified teachers</p>
        </div>
        {userType === 'teacher' && (
          <Button onClick={() => setCurrentView('upload')} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Sell Resource
          </Button>
        )}
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Featured Resources</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.slice(0, 3).map(resource => (
              <ResourceCard key={resource.id} resource={resource} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              All Resources ({filteredResources.length})
            </h2>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </div>
  );

  const UploadView = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Resource</h1>
        <p className="text-muted-foreground">Share your educational materials and earn from your expertise</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Resource Title</label>
              <Input placeholder="Enter descriptive title" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Price (₵)</label>
              <Input type="number" placeholder="0.00" className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea 
              className="w-full mt-1 p-3 border border-input rounded-md resize-none h-24"
              placeholder="Describe what students will learn and what's included..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.slice(1).map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Level</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jhs1">JHS 1</SelectItem>
                  <SelectItem value="jhs2">JHS 2</SelectItem>
                  <SelectItem value="jhs3">JHS 3</SelectItem>
                  <SelectItem value="shs1">SHS 1</SelectItem>
                  <SelectItem value="shs2">SHS 2</SelectItem>
                  <SelectItem value="shs3">SHS 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Upload your files</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Support for PDF, DOCX, PPTX files up to 50MB
            </p>
            <Button variant="outline">
              Choose Files
            </Button>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setCurrentView('browse')} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              Publish Resource
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const MyStoreView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Store</h1>
          <p className="text-muted-foreground">Manage your resources and track earnings</p>
        </div>
        <Button onClick={() => setCurrentView('upload')} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          New Resource
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-xl font-bold text-foreground">₵1,250</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
              <p className="text-xl font-bold text-foreground">1,870</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Published Resources</p>
              <p className="text-xl font-bold text-foreground">8</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-bold text-foreground">4.7</p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Resources */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">My Resources</h2>
        <div className="space-y-4">
          {mockResources.slice(0, 3).map(resource => (
            <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  {React.createElement(getTypeIcon(resource.type), { className: "w-6 h-6 text-muted-foreground" })}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.subject} • {resource.level}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {resource.downloads}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      {resource.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">₵{resource.price}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (userType === 'teacher') {
    return (
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="mystore">My Store</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="browse" className="mt-6">
          <BrowseView />
        </TabsContent>
        <TabsContent value="mystore" className="mt-6">
          <MyStoreView />
        </TabsContent>
        <TabsContent value="upload" className="mt-6">
          <UploadView />
        </TabsContent>
      </Tabs>
    );
  }

  return <BrowseView />;
};

const ResourceCard = ({ resource, featured = false }: { resource: Resource; featured?: boolean }) => {
  const TypeIcon = resource.type === 'lesson-plan' ? FileText :
                   resource.type === 'flashcards' ? Layers :
                   resource.type === 'quiz' ? HelpCircle :
                   resource.type === 'revision-notes' ? BookOpen :
                   resource.type === 'worksheet' ? Calendar : 
                   resource.type === 'masterclass' ? GraduationCap : FileText;

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'revision-notes': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lesson-plan': return 'bg-green-100 text-green-700 border-green-200';
      case 'masterclass': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'flashcards': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'worksheet': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'quiz': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
      <div className="relative">
        {featured && (
          <Badge className="absolute -top-2 -left-2 bg-green-500 text-white border-0">
            Featured
          </Badge>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <Badge className={`${getResourceTypeColor(resource.type)} border`}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {resource.category}
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
            <span>({resource.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{resource.downloads}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">₵{resource.price}</div>
            <div className="text-sm text-slate-600">by {resource.seller}</div>
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
  );
};