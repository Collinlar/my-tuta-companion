import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  BookOpen,
  Target,
  Calendar,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';
import { studentManagementService, Student, Assignment } from '@/services/studentManagementService';

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAssignContentOpen, setIsAssignContentOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    grade: '',
    subjects: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStudents(studentManagementService.getStudents());
    setAssignments(studentManagementService.getAssignments());
    setIsLoading(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    const matchesSubject = selectedSubject === 'all' || student.subjects.includes(selectedSubject);
    
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.email && newStudent.grade) {
      studentManagementService.addStudent(newStudent);
      setNewStudent({ name: '', email: '', grade: '', subjects: [] });
      setIsAddStudentOpen(false);
      loadData();
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student? This will also remove all their assignments and progress.')) {
      studentManagementService.deleteStudent(id);
      loadData();
    }
  };

  const handleAssignContent = (contentId: string, contentType: string, contentTitle: string) => {
    if (selectedStudents.length === 0) return;

    const assignment: Omit<Assignment, 'id' | 'assignedAt'> = {
      contentId,
      contentTitle,
      contentType: contentType as any,
      assignedTo: selectedStudents,
      assignedBy: 'teacher-1', // In a real app, this would be the current teacher's ID
      status: 'active',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    studentManagementService.createAssignment(assignment);
    setSelectedStudents([]);
    setIsAssignContentOpen(false);
    loadData();
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const analytics = studentManagementService.getClassAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Students</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.activeStudents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Assignments</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.totalAssignments}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Score</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a new student to your class
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter student's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter student's email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={newStudent.grade} onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">Grade 8</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStudent} className="bg-teal-600 hover:bg-teal-700">
                      Add Student
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const studentAnalytics = studentManagementService.getStudentAnalytics(student.id);
              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{student.name}</h3>
                          <p className="text-sm text-slate-600">Grade {student.grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.slice(0, 2).map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {student.subjects.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{student.subjects.length - 2}
                        </Badge>
                      )}
                    </div>

                    {studentAnalytics && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Assignments</span>
                          <span className="font-medium">
                            {studentAnalytics.completed}/{studentAnalytics.totalAssignments}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Average Score</span>
                          <span className={`font-medium ${getPerformanceColor(studentAnalytics.averageScore)}`}>
                            {studentAnalytics.averageScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Streak</span>
                          <span className="font-medium text-orange-600">
                            {student.performance.streak} days
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No students found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Assignments</h2>
            <Button 
              variant="outline"
              onClick={() => setIsAssignContentOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Content
            </Button>
          </div>

          <div className="space-y-4">
            {assignments.slice(0, 10).map((assignment) => {
              const progress = studentManagementService.getAssignmentProgress(assignment.id);
              const completed = progress.filter(p => p.status === 'completed').length;
              const total = progress.length;
              
              return (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{assignment.contentTitle}</h3>
                          <p className="text-sm text-slate-600">
                            {assignment.contentType} • Assigned to {assignment.assignedTo.length} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{completed}/{total} completed</p>
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-600 transition-all duration-300"
                              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <Badge 
                          className={
                            assignment.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments yet</h3>
              <p className="text-slate-600 mb-4">Assign content to students to get started</p>
              <Button 
                onClick={() => setIsAssignContentOpen(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Content
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Completion Rate</span>
                  <span className="font-semibold">{analytics.completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${analytics.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Average Score</span>
                  <span className="font-semibold">{analytics.averageScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Students</span>
                  <span className="font-semibold">{analytics.activeStudents}/{analytics.totalStudents}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentManagementService.getRecentActivity(5).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.studentName}
                        </p>
                        <p className="text-xs text-slate-600">
                          {activity.assignmentTitle}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {activity.completedAt ? 
                          new Date(activity.completedAt).toLocaleDateString() :
                          activity.startedAt ? 
                          new Date(activity.startedAt).toLocaleDateString() :
                          'Pending'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
