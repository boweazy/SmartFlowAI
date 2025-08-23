import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-dark-400 hover:text-white hover:bg-dark-700"
          onClick={onMobileMenuToggle}
          data-testid="button-mobile-menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-dark-800"></span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user ? getInitials(user.name) : 'SF'}
              </span>
            </div>
            <span className="text-sm font-medium text-white" data-testid="text-username">
              {user?.name || 'SmartFlow User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
