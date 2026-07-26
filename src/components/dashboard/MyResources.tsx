import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, BookOpen, FileText, Video, Image, Download, Share } from "lucide-react";

export function MyResources() {
  const resources = [
    {
      id: 1,
      title: "Algebra Basics Worksheet",
      type: "worksheet",
      subject: "Mathematics",
      grade: "Grade 9",
      downloads: 156,
      shared: true,
      date: "2 days ago"
    },
    {
      id: 2,
      title: "Photosynthesis Video Tutorial",
      type: "video",
      subject: "Biology",
      grade: "Grade 10",
      downloads: 89,
      shared: false,
      date: "1 week ago"
    },
    {
      id: 3,
      title: "Renaissance Art Presentation",
      type: "presentation",
      subject: "History",
      grade: "Grade 11",
      downloads: 234,
      shared: true,
      date: "3 days ago"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worksheet':
        return FileText;
      case 'video':
        return Video;
      case 'presentation':
        return Image;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Resources</h1>
          <p className="text-muted-foreground">Manage your teaching materials and resources</p>
        </div>
        <Button className="gap-2">
          <BookOpen className="h-4 w-4" />
          Upload Resource
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="presentations">Presentations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => {
              const IconComponent = getTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      {resource.shared && (
                        <Share className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>
                      {resource.subject} • {resource.grade}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {resource.downloads} downloads
                      </div>
                      <span>{resource.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="worksheets">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No worksheets yet</h3>
            <p className="text-muted-foreground">Upload your first worksheet to get started</p>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="text-center py-8">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground">Upload your first video to get started</p>
          </div>
        </TabsContent>

        <TabsContent value="presentations">
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No presentations yet</h3>
            <p className="text-muted-foreground">Upload your first presentation to get started</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}