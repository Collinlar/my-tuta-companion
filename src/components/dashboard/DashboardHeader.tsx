import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, Sun, Moon, LogOut, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  userType?: 'student' | 'teacher';
  setCurrentView?: (view: string) => void;
}

export function DashboardHeader({ userType = 'student', setCurrentView }: DashboardHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const loadUserProfile = async () => {
      const { user } = await AuthService.getCurrentUser();
      if (user) {
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        setUserName(firstName && lastName ? `${firstName} ${lastName}` : user.email || 'User');
      }
    };
    loadUserProfile();
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', next ? 'dark' : 'light');
  };

  const handleSignOut = async () => {
    const { error } = await AuthService.signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Signed out successfully",
      description: "See you next time!"
    });

    navigate('/');
  };

  return (
    <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left Section - Sidebar Trigger */}
        <div className="flex items-center">
          <SidebarTrigger className="hover:bg-slate-100 rounded-lg transition-colors" />
        </div>
        
        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-slate-600" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="h-4 w-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-3 py-4 text-sm text-slate-500 text-center">
                No notifications yet
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView?.('settings')}
            className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4 text-slate-600" />
          </Button>
          
          {/* Profile Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="ml-2">
                <Avatar className="h-9 w-9 border-2 border-slate-200 hover:border-teal-300 transition-colors cursor-pointer">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white text-sm font-semibold">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || (userType === 'teacher' ? 'TR' : 'ST')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">{userType}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCurrentView?.('profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView?.('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}