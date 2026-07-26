import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, BookOpen, Clock, Users } from "lucide-react";

export function LessonPlanner() {
  const lessons = [
    {
      id: 1,
      title: "Quadratic Functions",
      subject: "Mathematics",
      duration: "45 mins",
      students: 28,
      date: "Today, 2:00 PM",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Cell Division",
      subject: "Biology", 
      duration: "60 mins",
      students: 25,
      date: "Tomorrow, 10:00 AM",
      status: "draft"
    },
    {
      id: 3,
      title: "World War II",
      subject: "History",
      duration: "45 mins", 
      students: 30,
      date: "Friday, 1:00 PM",
      status: "published"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lesson Planner</h1>
          <p className="text-muted-foreground">Create and manage your lesson plans</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Lesson Plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Create New Lesson</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start planning your next engaging lesson
            </p>
            <Button variant="outline">Get Started</Button>
          </CardContent>
        </Card>

        {lessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={
                  lesson.status === 'published' ? 'default' :
                  lesson.status === 'scheduled' ? 'secondary' : 'outline'
                }>
                  {lesson.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{lesson.subject}</span>
              </div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              <CardDescription>{lesson.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {lesson.students} students
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium">Import Curriculum</h3>
              <p className="text-sm text-muted-foreground">Add from standards</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium">Assign to Class</h3>
              <p className="text-sm text-muted-foreground">Share with students</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium">Schedule Lesson</h3>
              <p className="text-sm text-muted-foreground">Set date and time</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <PlusCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium">Use Template</h3>
              <p className="text-sm text-muted-foreground">Start from template</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}