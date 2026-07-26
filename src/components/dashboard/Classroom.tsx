import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, MessageSquare, Calendar, BookOpen, Award, Clock, Plus } from "lucide-react";

export function Classroom() {
  const classes = [
    {
      id: 1,
      name: "Advanced Mathematics",
      grade: "Grade 11",
      students: 28,
      subject: "Mathematics",
      schedule: "Mon, Wed, Fri - 10:00 AM",
      nextClass: "Today, 10:00 AM",
      progress: 65
    },
    {
      id: 2,
      name: "Biology Fundamentals", 
      grade: "Grade 10",
      students: 25,
      subject: "Biology",
      schedule: "Tue, Thu - 2:00 PM",
      nextClass: "Tomorrow, 2:00 PM", 
      progress: 42
    },
    {
      id: 3,
      name: "World History",
      grade: "Grade 9",
      students: 22,
      subject: "History", 
      schedule: "Mon, Wed, Fri - 1:00 PM",
      nextClass: "Friday, 1:00 PM",
      progress: 78
    }
  ];

  const recentActivity = [
    {
      student: "Sarah Johnson",
      action: "submitted assignment",
      subject: "Mathematics",
      time: "2 hours ago",
      avatar: "SJ"
    },
    {
      student: "Michael Chen",
      action: "completed quiz",
      subject: "Biology",
      time: "4 hours ago", 
      avatar: "MC"
    },
    {
      student: "Emma Davis",
      action: "asked question",
      subject: "History",
      time: "6 hours ago",
      avatar: "ED"
    }
  ];

  const announcements = [
    {
      title: "Midterm Exams Schedule",
      message: "Exam schedules have been posted for all classes.",
      time: "1 day ago",
      priority: "high"
    },
    {
      title: "New Study Materials",
      message: "Additional resources uploaded for Biology unit 3.",
      time: "2 days ago",
      priority: "medium"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classroom</h1>
          <p className="text-muted-foreground">Manage your classes and student interactions</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Class
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="classes" className="w-full">
            <TabsList>
              <TabsTrigger value="classes">My Classes</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="mt-6">
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <Card key={classItem.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{classItem.name}</h3>
                          <p className="text-sm text-muted-foreground">{classItem.grade} • {classItem.subject}</p>
                        </div>
                        <Badge variant="outline">{classItem.students} students</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                          <p className="text-sm">{classItem.schedule}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Next Class</p>
                          <p className="text-sm">{classItem.nextClass}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Course Progress</span>
                          <span>{classItem.progress}%</span>
                        </div>
                        <Progress value={classItem.progress} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Messages
                        </Button>
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Materials
                        </Button>
                        <Button size="sm">
                          View Class
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Class Schedule</h3>
                <p className="text-muted-foreground">View your weekly teaching schedule</p>
                <Button className="mt-4">View Full Schedule</Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{activity.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.student}</span>{" "}
                            {activity.action} in {activity.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                  <div>
                    <p className="font-medium text-sm">Advanced Math</p>
                    <p className="text-xs text-muted-foreground">Grade 11</p>
                  </div>
                  <span className="text-sm font-medium">10:00 AM</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded">
                  <div>
                    <p className="font-medium text-sm">World History</p>
                    <p className="text-xs text-muted-foreground">Grade 9</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Students</span>
                  <span className="font-semibold">75</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Classes</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Attendance</span>
                  <span className="font-semibold">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pending Reviews</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.map((announcement, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <Badge 
                        variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{announcement.message}</p>
                    <p className="text-xs text-muted-foreground">{announcement.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}