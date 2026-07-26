import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Upload,
  BookOpen,
  HelpCircle,
  BarChart3,
  Brain,
  User
} from "lucide-react";
import { DashboardView } from "@/pages/Dashboard";

interface DashboardSidebarProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  userType: 'student' | 'teacher';
}

const studentMenuItems = [
  { 
    title: "Dashboard", 
    view: "overview" as DashboardView, 
    icon: Home,
    description: "Overview & progress"
  },
  { 
    title: "Study", 
    view: "notes" as DashboardView, 
    icon: Upload,
    description: "Notes, plans & learning"
  },
  { 
    title: "Practice", 
    view: "flashcards" as DashboardView, 
    icon: Brain,
    description: "Flashcards, quizzes & contests"
  },
  { 
    title: "Progress", 
    view: "progress" as DashboardView, 
    icon: BarChart3,
    description: "Analytics & insights"
  },
];

const teacherMenuItems = [
  { 
    title: "Dashboard", 
    view: "overview" as DashboardView, 
    icon: Home,
    description: "Teaching overview"
  },
  { 
    title: "Create", 
    view: "notes" as DashboardView, 
    icon: Upload,
    description: "Lessons & resources"
  },
  { 
    title: "Assess", 
    view: "flashcards" as DashboardView, 
    icon: Brain,
    description: "Flashcards, quizzes & tests"
  },
  { 
    title: "Analytics", 
    view: "progress" as DashboardView, 
    icon: BarChart3,
    description: "Student progress & insights"
  },
];

export function DashboardSidebar({ currentView, setCurrentView, userType }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const menuItems = userType === 'teacher' ? teacherMenuItems : studentMenuItems;

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="p-8">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              {state !== "collapsed" && (
                <div>
                  <span className="font-bold text-lg text-slate-900">mytuta</span>
                  <p className="text-xs text-slate-500">
                    {userType === 'teacher' ? 'Teaching' : 'Learning'} Platform
                  </p>
                </div>
              )}
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-6">
              {menuItems.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => setCurrentView(item.view)}
                      className={`
                        w-full cursor-pointer transition-all duration-200 rounded-xl p-5
                        ${isActive 
                          ? "bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 text-teal-700 shadow-sm" 
                          : "hover:bg-slate-50 hover:shadow-sm text-slate-600 hover:text-slate-900"
                        }
                        ${state === "collapsed" ? "justify-center" : "justify-start"}
                      `}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                          ${isActive 
                            ? "bg-gradient-to-br from-teal-500 to-blue-500 shadow-md" 
                            : "bg-slate-200 group-hover:bg-slate-300"
                          }
                        `}>
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        
                        {state !== "collapsed" && (
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-semibold text-sm">
                              {item.title}
                            </span>
                            <span className="text-xs text-slate-500 truncate">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions Section */}
        {state !== "collapsed" && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentView('notes')}
                  className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-center"
                >
                  <div className="text-xs font-medium text-slate-700">
                    {userType === 'teacher' ? 'New Lesson' : 'Add Notes'}
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView('flashcards')}
                  className="p-4 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors text-center"
                >
                  <div className="text-xs font-medium text-teal-700">
                    {userType === 'teacher' ? 'Quick Quiz' : 'Study Now'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}