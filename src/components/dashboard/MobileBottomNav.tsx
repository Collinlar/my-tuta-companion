import { Home, Upload, Brain, BarChart3 } from "lucide-react";
import { DashboardView } from "@/pages/Dashboard";

interface MobileBottomNavProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  userType: 'student' | 'teacher';
}

const studentTabs = [
  { view: 'overview' as DashboardView, icon: Home, label: 'Dashboard' },
  { view: 'notes' as DashboardView, icon: Upload, label: 'Study' },
  { view: 'flashcards' as DashboardView, icon: Brain, label: 'Practice' },
  { view: 'progress' as DashboardView, icon: BarChart3, label: 'Progress' },
];

const teacherTabs = [
  { view: 'overview' as DashboardView, icon: Home, label: 'Dashboard' },
  { view: 'notes' as DashboardView, icon: Upload, label: 'Create' },
  { view: 'flashcards' as DashboardView, icon: Brain, label: 'Assess' },
  { view: 'progress' as DashboardView, icon: BarChart3, label: 'Analytics' },
];

export function MobileBottomNav({ currentView, setCurrentView, userType }: MobileBottomNavProps) {
  const tabs = userType === 'teacher' ? teacherTabs : studentTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = currentView === tab.view;
          return (
            <button
              key={tab.view}
              onClick={() => setCurrentView(tab.view)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors duration-150 ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon
                className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
