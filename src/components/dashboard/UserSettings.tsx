import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  Trash2, 
  Download,
  Mail,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { AuthService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserSettingsProps {
  userType: 'student' | 'teacher';
}

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    studyReminders: boolean;
    progressUpdates: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showProgress: boolean;
    allowMessages: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  study: {
    studySessionLength: number;
    breakLength: number;
    dailyGoal: number;
    reminderTime: string;
  };
}

export function UserSettings({ userType }: UserSettingsProps) {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      studyReminders: true,
      progressUpdates: true,
      weeklyReports: false,
    },
    privacy: {
      profileVisibility: 'private',
      showProgress: true,
      allowMessages: false,
    },
    appearance: {
      theme: 'system',
      language: 'en',
      fontSize: 'medium',
    },
    study: {
      studySessionLength: 25,
      breakLength: 5,
      dailyGoal: 60,
      reminderTime: '18:00',
    },
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage or default values
    const savedSettings = localStorage.getItem('mytuta_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      localStorage.setItem('mytuta_settings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved!",
        description: "Your preferences have been updated."
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      const { error } = await AuthService.updatePassword(newPassword);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully."
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error changing password",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      // Note: Supabase doesn't have a direct delete account method
      // You would need to implement this on your backend
      toast({
        title: "Account deletion requested",
        description: "Please contact support to complete account deletion.",
      });
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: "Please contact support",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportData = () => {
    const profile = localStorage.getItem('userProfile');
    const settings = localStorage.getItem('mytuta_settings');
    
    const exportData = {
      profile: profile ? JSON.parse(profile) : null,
      settings: settings ? JSON.parse(settings) : null,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mytuta-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data exported!",
      description: "Your data has been downloaded successfully."
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">
            Manage your account preferences and privacy
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p className="text-sm text-slate-600">Receive updates via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.notifications.email}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="study-reminders">Study reminders</Label>
              <p className="text-sm text-slate-600">Get reminded about study sessions</p>
            </div>
            <Switch
              id="study-reminders"
              checked={settings.notifications.studyReminders}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, studyReminders: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="progress-updates">Progress updates</Label>
              <p className="text-sm text-slate-600">Weekly progress summaries</p>
            </div>
            <Switch
              id="progress-updates"
              checked={settings.notifications.progressUpdates}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, progressUpdates: checked }
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="profile-visibility">Profile visibility</Label>
            <Select
              value={settings.privacy.profileVisibility}
              onValueChange={(value: 'public' | 'private') =>
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, profileVisibility: value }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-progress">Show progress publicly</Label>
              <p className="text-sm text-slate-600">Allow others to see your learning progress</p>
            </div>
            <Switch
              id="show-progress"
              checked={settings.privacy.showProgress}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, showProgress: checked }
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Appearance
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.appearance.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') =>
                setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, theme: value }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select
              value={settings.appearance.language}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, language: value }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="tw">Twi</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Study Preferences */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Study Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="session-length">Study session length (minutes)</Label>
            <Select
              value={settings.study.studySessionLength.toString()}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  study: { ...settings.study, studySessionLength: parseInt(value) }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="daily-goal">Daily study goal (minutes)</Label>
            <Select
              value={settings.study.dailyGoal.toString()}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  study: { ...settings.study, dailyGoal: parseInt(value) }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
                <SelectItem value="180">180 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <div className="relative mt-1">
              <Input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="new-password">New password</Label>
            <div className="relative mt-1">
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative mt-1">
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button onClick={handlePasswordChange} disabled={isChangingPassword || !newPassword || !confirmPassword}>
            {isChangingPassword ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Change Password
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export your data</Label>
              <p className="text-sm text-slate-600">Download a copy of your profile and settings</p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-red-600">Delete account</Label>
              <p className="text-sm text-slate-600">Permanently delete your account and all data</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Account
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting your account will permanently remove all your data, including notes, progress, and settings. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    </div>
  );
}

