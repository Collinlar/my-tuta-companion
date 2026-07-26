import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, Clock, Users, BarChart3, CheckCircle, Edit, Eye } from "lucide-react";

export function AssessmentBuilder() {
  const assessments = [
    {
      id: 1,
      title: "Midterm Algebra Test",
      type: "test",
      subject: "Mathematics",
      questions: 25,
      duration: "90 mins",
      studentsAssigned: 28,
      completed: 15,
      status: "active",
      dueDate: "Dec 15, 2024"
    },
    {
      id: 2,
      title: "Cell Structure Quiz",
      type: "quiz",
      subject: "Biology",
      questions: 10,
      duration: "20 mins",
      studentsAssigned: 25,
      completed: 25,
      status: "completed",
      dueDate: "Dec 8, 2024"
    },
    {
      id: 3,
      title: "History Essay Assignment",
      type: "assignment",
      subject: "History",
      questions: 3,
      duration: "2 weeks",
      studentsAssigned: 22,
      completed: 8,
      status: "active",
      dueDate: "Dec 20, 2024"
    }
  ];

  const templates = [
    { name: "Multiple Choice Quiz", questions: 15, time: "30 mins" },
    { name: "True/False Test", questions: 20, time: "25 mins" },
    { name: "Essay Questions", questions: 5, time: "60 mins" },
    { name: "Mixed Format Test", questions: 30, time: "90 mins" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Builder</h1>
          <p className="text-muted-foreground">Create and manage tests, quizzes, and assignments</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Assessment
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Assessments</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {assessments.filter(a => a.status === 'active').map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">
                      {assessment.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{assessment.subject}</span>
                  </div>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <CardDescription>Due: {assessment.dueDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{assessment.questions}</div>
                      <div className="text-sm text-muted-foreground">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{assessment.duration}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{assessment.completed}/{assessment.studentsAssigned} completed</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((assessment.completed / assessment.studentsAssigned) * 100)}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(assessment.completed / assessment.studentsAssigned) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No draft assessments</h3>
            <p className="text-muted-foreground">Create a new assessment to get started</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {assessments.filter(a => a.status === 'completed').map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                    <span className="text-sm text-muted-foreground">{assessment.subject}</span>
                  </div>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <CardDescription>Completed: {assessment.dueDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{assessment.studentsAssigned} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">View Analytics</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    View Results & Analytics
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {templates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{template.questions} questions</p>
                    <p>{template.time} duration</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}