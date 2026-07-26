import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, Clock, Award, AlertCircle, Download } from "lucide-react";

export function StudentAnalytics() {
  const classOverview = {
    totalStudents: 28,
    activeStudents: 24,
    averageScore: 85,
    completionRate: 78
  };

  const topPerformers = [
    { name: "Sarah Johnson", score: 96, improvement: "+8%" },
    { name: "Michael Chen", score: 94, improvement: "+12%" },
    { name: "Emma Davis", score: 92, improvement: "+5%" }
  ];

  const strugglingStudents = [
    { name: "Alex Thompson", score: 62, trend: "declining" },
    { name: "Jordan Miller", score: 58, trend: "stable" },
    { name: "Casey Wilson", score: 55, trend: "improving" }
  ];

  const subjectPerformance = [
    { subject: "Mathematics", average: 87, students: 28, trending: "up" },
    { subject: "Science", average: 82, students: 25, trending: "stable" },
    { subject: "History", average: 79, students: 22, trending: "down" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Analytics</h1>
          <p className="text-muted-foreground">Track student progress and performance</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{classOverview.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{classOverview.activeStudents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{classOverview.averageScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{classOverview.completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Class Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Progress</TabsTrigger>
          <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Top Performers
                </CardTitle>
                <CardDescription>Students excelling in their studies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Average Score: {student.score}%</p>
                      </div>
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        {student.improvement}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Students Needing Support
                </CardTitle>
                <CardDescription>Students who may need additional help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strugglingStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Average Score: {student.score}%</p>
                      </div>
                      <Badge variant={student.trend === 'improving' ? 'secondary' : 'destructive'}>
                        {student.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Individual Student Analytics</h3>
            <p className="text-muted-foreground">Detailed progress tracking for each student</p>
            <Button className="mt-4">View Student List</Button>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{subject.subject}</h3>
                      <p className="text-sm text-muted-foreground">{subject.students} students enrolled</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{subject.average}%</p>
                      <Badge variant={
                        subject.trending === 'up' ? 'default' :
                        subject.trending === 'down' ? 'destructive' : 'secondary'
                      }>
                        {subject.trending === 'up' ? '↗' : subject.trending === 'down' ? '↘' : '→'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={subject.average} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Engagement Analytics</h3>
            <p className="text-muted-foreground">Time spent, activity patterns, and participation metrics</p>
            <Button className="mt-4">View Engagement Data</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}