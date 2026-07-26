import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Mail, 
  School, 
  GraduationCap, 
  BookOpen, 
  Target,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  Loader2
} from "lucide-react";
import { AuthService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  userType: 'student' | 'teacher';
}

interface ProfileData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'teacher';
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  parentContact?: string;
  teachingExperience?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const availableSubjects = [
  "Mathematics", "English Language", "Science", "Social Studies",
  "Physics", "Chemistry", "Biology", "History", "Geography", 
  "Economics", "Government", "Literature", "French", "ICT",
  "Business Studies", "Visual Arts", "Music", "Physical Education"
];

const studentGoals = [
  "Pass BECE with distinction",
  "Excel in WASSCE", 
  "Improve weak subjects",
  "Build consistent study habits",
  "Join study competitions",
  "Prepare for university"
];

const teacherGoals = [
  "Create engaging lesson plans faster",
  "Generate quality assessment materials", 
  "Track student progress effectively",
  "Build a resource library",
  "Sell educational content",
  "Improve student outcomes",
  "Collaborate with other teachers",
  "Use AI to enhance teaching"
];

export function UserProfile({ userType }: UserProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<ProfileData>({} as ProfileData);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const { user } = await AuthService.getCurrentUser();
      
      if (user) {
        const { profile: dbProfile } = await AuthService.getUserProfile(user.id);
        
        const profileData: ProfileData = {
          id: user.id,
          firstName: dbProfile?.first_name || user.user_metadata?.first_name || '',
          lastName: dbProfile?.last_name || user.user_metadata?.last_name || '',
          email: user.email || '',
          userType: dbProfile?.user_type || userType,
          school: dbProfile?.school || '',
          grade: dbProfile?.grade || '',
          subjects: dbProfile?.subjects || [],
          goals: dbProfile?.goals || [],
          parentContact: dbProfile?.parent_contact || '',
          teachingExperience: dbProfile?.teaching_experience || '',
          bio: dbProfile?.bio || '',
          avatarUrl: dbProfile?.avatar_url || '',
          createdAt: dbProfile?.created_at || user.created_at,
          updatedAt: dbProfile?.updated_at
        };
        
        setProfile(profileData);
        setEditData(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please refresh the page and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!profile?.id) return;

      const { error } = await AuthService.updateProfile(profile.id, {
        first_name: editData.firstName,
        last_name: editData.lastName,
        school: editData.school,
        grade: editData.grade,
        subjects: editData.subjects,
        goals: editData.goals,
        parent_contact: editData.parentContact || null,
        teaching_experience: editData.teachingExperience || null,
        bio: editData.bio || null
      });

      if (error) {
        throw error;
      }

      // Update local profile
      setProfile(editData);
      setIsEditing(false);
      
      // Update localStorage
      const updatedProfile = {
        name: `${editData.firstName} ${editData.lastName}`,
        school: editData.school,
        grade: editData.grade,
        subjects: editData.subjects,
        goals: editData.goals,
        parentContact: editData.parentContact,
        userType: editData.userType
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile || {} as ProfileData);
    setIsEditing(false);
  };

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = editData.subjects.includes(subject)
      ? editData.subjects.filter(s => s !== subject)
      : [...editData.subjects, subject];
    setEditData({ ...editData, subjects: newSubjects });
  };

  const handleGoalToggle = (goal: string) => {
    const newGoals = editData.goals.includes(goal)
      ? editData.goals.filter(g => g !== goal)
      : [...editData.goals, goal];
    setEditData({ ...editData, goals: newGoals });
  };

  const getInitials = () => {
    if (editData.firstName && editData.lastName) {
      return `${editData.firstName[0]}${editData.lastName[0]}`.toUpperCase();
    }
    return userType === 'teacher' ? 'TR' : 'ST';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={userType === 'student' ? 'bg-teal-600' : 'bg-blue-600'}>
            {userType === 'student' ? 'Student' : 'Teacher'}
          </Badge>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-6">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-slate-200">
              <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white text-2xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    placeholder="First name"
                    className="text-center"
                  />
                  <Input
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    placeholder="Last name"
                    className="text-center"
                  />
                </div>
              ) : (
                `${profile.firstName} ${profile.lastName}`
              )}
            </h2>
            
            <p className="text-slate-600 mt-1">
              {isEditing ? (
                <Input
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="Email"
                  type="email"
                  className="text-center"
                />
              ) : (
                profile.email
              )}
            </p>

            {profile.createdAt && (
              <p className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Details</h3>
          
          <div className="space-y-6">
            {/* School */}
            <div>
              <Label className="flex items-center gap-2">
                <School className="w-4 h-4" />
                {userType === 'teacher' ? 'Teaching at' : 'School'}
              </Label>
              {isEditing ? (
                <Input
                  value={editData.school}
                  onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                  placeholder={userType === 'teacher' ? 'School name' : 'Your school'}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-slate-900">{profile.school || 'Not specified'}</p>
              )}
            </div>

            {/* Grade/Level */}
            <div>
              <Label className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {userType === 'teacher' ? 'Teaching Level' : 'Grade'}
              </Label>
              {isEditing ? (
                <Select 
                  value={editData.grade} 
                  onValueChange={(value) => setEditData({ ...editData, grade: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={userType === 'teacher' ? 'Select level' : 'Select grade'} />
                  </SelectTrigger>
                  <SelectContent>
                    {userType === 'teacher' ? (
                      <>
                        <SelectItem value="Primary School">Primary School</SelectItem>
                        <SelectItem value="Grade 7-9 (Junior High)">Grade 7-9 (Junior High)</SelectItem>
                        <SelectItem value="Grade 10-12 (Senior High)">Grade 10-12 (Senior High)</SelectItem>
                        <SelectItem value="Tertiary">Tertiary</SelectItem>
                        <SelectItem value="Mixed Levels">Mixed Levels</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Grade 7">Grade 7</SelectItem>
                        <SelectItem value="Grade 8">Grade 8</SelectItem>
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-slate-900">{profile.grade || 'Not specified'}</p>
              )}
            </div>

            {/* Contact Info */}
            {userType === 'student' && (
              <div>
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Parent/Guardian Contact
                </Label>
                {isEditing ? (
                  <Input
                    value={editData.parentContact || ''}
                    onChange={(e) => setEditData({ ...editData, parentContact: e.target.value })}
                    placeholder="Phone or email"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-slate-900">{profile.parentContact || 'Not provided'}</p>
                )}
              </div>
            )}

            {userType === 'teacher' && (
              <div>
                <Label className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Teaching Experience
                </Label>
                {isEditing ? (
                  <Input
                    value={editData.teachingExperience || ''}
                    onChange={(e) => setEditData({ ...editData, teachingExperience: e.target.value })}
                    placeholder="e.g., 5 years, New teacher"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-slate-900">{profile.teachingExperience || 'Not specified'}</p>
                )}
              </div>
            )}

            {/* Bio */}
            <div>
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Bio
              </Label>
              {isEditing ? (
                <Textarea
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-slate-900">{profile.bio || 'No bio added yet'}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Subjects */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {userType === 'teacher' ? 'Subjects You Teach' : 'Subjects You Study'}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {availableSubjects.map((subject) => (
            <button
              key={subject}
              onClick={() => isEditing && handleSubjectToggle(subject)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                editData.subjects.includes(subject)
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {subject}
            </button>
          ))}
        </div>
      </Card>

      {/* Goals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          {userType === 'teacher' ? 'Teaching Goals' : 'Study Goals'}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {(userType === 'teacher' ? teacherGoals : studentGoals).map((goal) => (
            <button
              key={goal}
              onClick={() => isEditing && handleGoalToggle(goal)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                editData.goals.includes(goal)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {goal}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

