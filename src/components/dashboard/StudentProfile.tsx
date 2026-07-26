import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Target, 
  Edit3, 
  Save, 
  X,
  Mail,
  Phone,
  School,
  Calendar,
  Award,
  TrendingUp,
  Brain,
  ArrowRight
} from "lucide-react";
import { ProfileAwareDemo } from "./ProfileAwareDemo";

interface UserProfile {
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  parentContact?: string;
  userType: 'student' | 'teacher';
}

interface StudentProfileProps {
  onBack?: () => void;
}

export function StudentProfile({ onBack }: StudentProfileProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [showDemo, setShowDemo] = useState(false);

  const grades = [
    "Grade 7", "Grade 8", "Grade 9",
    "Grade 10", "Grade 11", "Grade 12"
  ];

  const subjects = [
    "Mathematics", "English Language", "Science", "Social Studies",
    "Physics", "Chemistry", "Biology", "History", "Geography", 
    "Economics", "Government", "Literature", "French", "ICT",
    "Business Studies", "Visual Arts", "Music", "Physical Education"
  ];

  const studyGoals = [
    "Pass BECE with distinction",
    "Excel in WASSCE",
    "Improve in Mathematics",
    "Enhance English skills",
    "Prepare for university",
    "Build study habits",
    "Join study groups",
    "Participate in competitions"
  ];

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const userData = JSON.parse(profile);
      setUserProfile(userData);
      setEditData(userData);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (userProfile && editData) {
      const updatedProfile = { ...userProfile, ...editData };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData(userProfile || {});
    setIsEditing(false);
  };

  const handleSubjectToggle = (subject: string) => {
    if (!editData.subjects) return;
    
    setEditData(prev => ({
      ...prev,
      subjects: prev.subjects!.includes(subject)
        ? prev.subjects!.filter(s => s !== subject)
        : [...prev.subjects!, subject]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    if (!editData.goals) return;
    
    setEditData(prev => ({
      ...prev,
      goals: prev.goals!.includes(goal)
        ? prev.goals!.filter(g => g !== goal)
        : [...prev.goals!, goal]
    }));
  };

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600">Please complete the onboarding process first.</p>
        </Card>
      </div>
    );
  }

  // Show demo if requested
  if (showDemo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowDemo(false)}>
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Profile
          </Button>
          <h1 className="text-xl font-semibold text-slate-900">AI Personalization Demo</h1>
        </div>
        <ProfileAwareDemo />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600">Manage your learning preferences and personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={editData.name || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-slate-900">{userProfile.name}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentContact">Parent/Guardian Contact</Label>
            {isEditing ? (
              <Input
                id="parentContact"
                value={editData.parentContact || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, parentContact: e.target.value }))}
                placeholder="Phone number or email"
              />
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-slate-900">{userProfile.parentContact || 'Not provided'}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Academic Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Academic Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            {isEditing ? (
              <Input
                id="school"
                value={editData.school || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, school: e.target.value }))}
                placeholder="Enter your school name"
              />
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-slate-900">{userProfile.school}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade Level</Label>
            {isEditing ? (
              <Select
                value={editData.grade || ''}
                onValueChange={(value) => setEditData(prev => ({ ...prev, grade: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-slate-900">{userProfile.grade}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Subjects */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Subjects You Study</h2>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Select all subjects you're currently studying:</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    editData.subjects?.includes(subject)
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userProfile.subjects.map((subject) => (
              <Badge key={subject} className="bg-blue-100 text-blue-700 border-blue-200">
                {subject}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Study Goals */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Study Goals</h2>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Select your learning goals:</p>
            <div className="flex flex-wrap gap-2">
              {studyGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    editData.goals?.includes(goal)
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userProfile.goals.map((goal) => (
              <Badge key={goal} className="bg-purple-100 text-purple-700 border-purple-200">
                {goal}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Learning Statistics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Learning Statistics</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{userProfile.subjects.length}</div>
            <div className="text-sm text-slate-600">Subjects</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{userProfile.goals.length}</div>
            <div className="text-sm text-slate-600">Goals</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-sm text-slate-600">Study Plans</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-sm text-slate-600">Flashcards</div>
          </div>
        </div>
      </Card>

      {/* AI Personalization Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">AI Personalization</h2>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900">How Your Profile Enhances AI</h3>
          </div>
          <p className="text-sm text-slate-700 mb-4">
            Your profile data helps our AI create more personalized and effective study content:
          </p>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Class Level:</strong> Content difficulty matches your {userProfile.class} level</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Subjects:</strong> AI references your subjects ({userProfile.subjects.slice(0, 2).join(', ')}) when relevant</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Goals:</strong> Study plans align with your objectives ({userProfile.goals.slice(0, 2).join(', ')})</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <span><strong>School Context:</strong> Examples and references match your academic environment</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowDemo(true)}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Brain className="w-4 h-4 mr-2" />
            See AI Personalization in Action
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3 justify-end">
          <Button onClick={handleCancel} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
