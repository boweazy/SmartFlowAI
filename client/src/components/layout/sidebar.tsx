import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/tenant-context";
import { useAuth } from "@/contexts/auth-context";
import { 
  LayoutDashboard, 
  Rss, 
  Calendar, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Bot
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Content Rss",
    href: "/feed",
    icon: Rss,
  },
  {
    name: "Scheduler",
    href: "/scheduler",
    icon: Calendar,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

const secondaryNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { branding } = useTenant();
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-dark-800 border-r border-dark-700">
      <div className="flex items-center justify-center h-16 px-4 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">SmartFlow AI</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1" data-testid="sidebar-navigation">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "text-primary-500 bg-primary-500/10 sidebar-nav-active"
                  : "text-dark-300 hover:bg-dark-700 hover:text-white"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-dark-700">
          <div className="px-2 mb-2">
            <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
              Account
            </span>
          </div>
          {secondaryNavigation.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary-500 bg-primary-500/10"
                    : "text-dark-300 hover:bg-dark-700 hover:text-white"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
