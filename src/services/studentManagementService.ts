export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  subjects: string[];
  joinedAt: string;
  lastActive: string;
  avatar?: string;
  performance: {
    totalAssignments: number;
    completedAssignments: number;
    averageScore: number;
    streak: number;
    totalTimeSpent: number; // in minutes
  };
}

export interface Assignment {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: 'lesson' | 'flashcards' | 'quizzes' | 'contests' | 'learning-path';
  assignedTo: string[]; // student IDs
  assignedBy: string; // teacher ID
  assignedAt: string;
  dueDate?: string;
  status: 'active' | 'completed' | 'overdue';
  instructions?: string;
  maxAttempts?: number;
  timeLimit?: number; // in minutes
}

export interface StudentProgress {
  studentId: string;
  assignmentId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  startedAt?: string;
  completedAt?: string;
  score?: number;
  attempts: number;
  timeSpent: number; // in minutes
  answers?: any[];
  feedback?: string;
}

export class StudentManagementService {
  private students: Student[] = [];
  private assignments: Assignment[] = [];
  private progress: StudentProgress[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Load students
    const savedStudents = localStorage.getItem('teacherStudents');
    if (savedStudents) {
      this.students = JSON.parse(savedStudents);
    } else {
      this.initializeSampleStudents();
    }

    // Load assignments
    const savedAssignments = localStorage.getItem('teacherAssignments');
    if (savedAssignments) {
      this.assignments = JSON.parse(savedAssignments);
    }

    // Load progress
    const savedProgress = localStorage.getItem('studentProgress');
    if (savedProgress) {
      this.progress = JSON.parse(savedProgress);
    }
  }

  private saveData() {
    localStorage.setItem('teacherStudents', JSON.stringify(this.students));
    localStorage.setItem('teacherAssignments', JSON.stringify(this.assignments));
    localStorage.setItem('studentProgress', JSON.stringify(this.progress));
  }

  private initializeSampleStudents() {
    this.students = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice.johnson@school.edu',
        grade: '8',
        subjects: ['Mathematics', 'Science', 'English'],
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        performance: {
          totalAssignments: 12,
          completedAssignments: 10,
          averageScore: 87,
          streak: 5,
          totalTimeSpent: 240
        }
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob.smith@school.edu',
        grade: '8',
        subjects: ['Mathematics', 'Science', 'History'],
        joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        performance: {
          totalAssignments: 12,
          completedAssignments: 8,
          averageScore: 92,
          streak: 3,
          totalTimeSpent: 180
        }
      },
      {
        id: '3',
        name: 'Carol Davis',
        email: 'carol.davis@school.edu',
        grade: '9',
        subjects: ['Science', 'Biology', 'Chemistry'],
        joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        performance: {
          totalAssignments: 15,
          completedAssignments: 14,
          averageScore: 95,
          streak: 7,
          totalTimeSpent: 320
        }
      },
      {
        id: '4',
        name: 'David Wilson',
        email: 'david.wilson@school.edu',
        grade: '9',
        subjects: ['Mathematics', 'Physics', 'English'],
        joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        performance: {
          totalAssignments: 15,
          completedAssignments: 11,
          averageScore: 78,
          streak: 1,
          totalTimeSpent: 200
        }
      },
      {
        id: '5',
        name: 'Eva Brown',
        email: 'eva.brown@school.edu',
        grade: '10',
        subjects: ['History', 'English', 'Geography'],
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        performance: {
          totalAssignments: 8,
          completedAssignments: 7,
          averageScore: 89,
          streak: 4,
          totalTimeSpent: 150
        }
      }
    ];
    this.saveData();
  }

  // Student Management
  getStudents(): Student[] {
    return this.students;
  }

  getStudentById(id: string): Student | undefined {
    return this.students.find(student => student.id === id);
  }

  addStudent(student: Omit<Student, 'id' | 'joinedAt' | 'performance'>): Student {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      joinedAt: new Date().toISOString(),
      performance: {
        totalAssignments: 0,
        completedAssignments: 0,
        averageScore: 0,
        streak: 0,
        totalTimeSpent: 0
      }
    };
    this.students.push(newStudent);
    this.saveData();
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const index = this.students.findIndex(student => student.id === id);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...updates };
      this.saveData();
      return this.students[index];
    }
    return null;
  }

  deleteStudent(id: string): boolean {
    const index = this.students.findIndex(student => student.id === id);
    if (index !== -1) {
      this.students.splice(index, 1);
      // Remove all assignments and progress for this student
      this.assignments = this.assignments.filter(assignment => 
        !assignment.assignedTo.includes(id)
      );
      this.progress = this.progress.filter(progress => progress.studentId !== id);
      this.saveData();
      return true;
    }
    return false;
  }

  // Assignment Management
  getAssignments(): Assignment[] {
    return this.assignments;
  }

  getAssignmentsByContentId(contentId: string): Assignment[] {
    return this.assignments.filter(assignment => assignment.contentId === contentId);
  }

  createAssignment(assignment: Omit<Assignment, 'id' | 'assignedAt'>): Assignment {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
      assignedAt: new Date().toISOString()
    };
    this.assignments.push(newAssignment);
    
    // Create progress entries for each assigned student
    assignment.assignedTo.forEach(studentId => {
      this.progress.push({
        studentId,
        assignmentId: newAssignment.id,
        status: 'not-started',
        attempts: 0,
        timeSpent: 0
      });
    });
    
    this.saveData();
    return newAssignment;
  }

  updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
    const index = this.assignments.findIndex(assignment => assignment.id === id);
    if (index !== -1) {
      this.assignments[index] = { ...this.assignments[index], ...updates };
      this.saveData();
      return this.assignments[index];
    }
    return null;
  }

  deleteAssignment(id: string): boolean {
    const index = this.assignments.findIndex(assignment => assignment.id === id);
    if (index !== -1) {
      this.assignments.splice(index, 1);
      // Remove all progress for this assignment
      this.progress = this.progress.filter(progress => progress.assignmentId !== id);
      this.saveData();
      return true;
    }
    return false;
  }

  // Progress Tracking
  getStudentProgress(studentId: string): StudentProgress[] {
    return this.progress.filter(progress => progress.studentId === studentId);
  }

  getAssignmentProgress(assignmentId: string): StudentProgress[] {
    return this.progress.filter(progress => progress.assignmentId === assignmentId);
  }

  updateProgress(progressUpdate: Partial<StudentProgress> & { studentId: string; assignmentId: string }): StudentProgress | null {
    const index = this.progress.findIndex(progress => 
      progress.studentId === progressUpdate.studentId && 
      progress.assignmentId === progressUpdate.assignmentId
    );
    
    if (index !== -1) {
      this.progress[index] = { ...this.progress[index], ...progressUpdate };
    } else {
      this.progress.push({
        studentId: progressUpdate.studentId,
        assignmentId: progressUpdate.assignmentId,
        status: 'not-started',
        attempts: 0,
        timeSpent: 0,
        ...progressUpdate
      });
    }
    
    this.saveData();
    return this.progress[index] || this.progress[this.progress.length - 1];
  }

  // Analytics
  getClassAnalytics() {
    const totalStudents = this.students.length;
    const totalAssignments = this.assignments.length;
    const completedAssignments = this.progress.filter(p => p.status === 'completed').length;
    const averageScore = this.progress
      .filter(p => p.score !== undefined)
      .reduce((sum, p) => sum + (p.score || 0), 0) / 
      this.progress.filter(p => p.score !== undefined).length || 0;
    
    const activeStudents = this.students.filter(student => {
      const lastActive = new Date(student.lastActive);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActive > oneWeekAgo;
    }).length;

    return {
      totalStudents,
      totalAssignments,
      completedAssignments,
      averageScore: Math.round(averageScore),
      activeStudents,
      completionRate: totalAssignments > 0 ? Math.round((completedAssignments / (totalStudents * totalAssignments)) * 100) : 0
    };
  }

  getStudentAnalytics(studentId: string) {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const studentProgress = this.getStudentProgress(studentId);
    const completed = studentProgress.filter(p => p.status === 'completed');
    const inProgress = studentProgress.filter(p => p.status === 'in-progress');
    const overdue = studentProgress.filter(p => p.status === 'overdue');

    const totalTimeSpent = studentProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageScore = completed.length > 0 
      ? completed.reduce((sum, p) => sum + (p.score || 0), 0) / completed.length 
      : 0;

    return {
      student,
      totalAssignments: studentProgress.length,
      completed: completed.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      completionRate: studentProgress.length > 0 ? Math.round((completed.length / studentProgress.length) * 100) : 0
    };
  }

  // Utility methods
  getStudentsByGrade(grade: string): Student[] {
    return this.students.filter(student => student.grade === grade);
  }

  getStudentsBySubject(subject: string): Student[] {
    return this.students.filter(student => student.subjects.includes(subject));
  }

  getOverdueAssignments(): Assignment[] {
    const now = new Date();
    return this.assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate);
      return dueDate < now && assignment.status === 'active';
    });
  }

  getRecentActivity(limit: number = 10) {
    const allProgress = [...this.progress];
    allProgress.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.startedAt || '');
      const dateB = new Date(b.completedAt || b.startedAt || '');
      return dateB.getTime() - dateA.getTime();
    });
    
    return allProgress.slice(0, limit).map(progress => {
      const student = this.getStudentById(progress.studentId);
      const assignment = this.assignments.find(a => a.id === progress.assignmentId);
      return {
        ...progress,
        studentName: student?.name || 'Unknown Student',
        assignmentTitle: assignment?.contentTitle || 'Unknown Assignment',
        assignmentType: assignment?.contentType || 'unknown'
      };
    });
  }
}

export const studentManagementService = new StudentManagementService();
