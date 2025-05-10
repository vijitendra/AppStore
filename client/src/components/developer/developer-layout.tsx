import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  AppWindow, 
  Film, 
  Home, 
  LogOut, 
  Settings, 
  Upload,
  User,
  BarChart3,
  Video,
  Package
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

type NavItem = 
  | { icon: React.ReactNode; label: string; href: string; type?: undefined }
  | { heading: string; type: "separator"; icon?: undefined; label?: undefined; href?: undefined };

export default function DeveloperLayout({ children }: DeveloperLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Navigation items
  const navItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/developer" },
    { icon: <Package className="h-5 w-5" />, label: "My Apps", href: "/developer/apps" },
    { icon: <Upload className="h-5 w-5" />, label: "Upload New App", href: "/developer/app/upload" },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Analytics", href: "/developer/analytics" },
    { heading: "Videos", type: "separator" },
    { icon: <Film className="h-5 w-5" />, label: "My Videos", href: "/developer/videos" },
    { icon: <Video className="h-5 w-5" />, label: "Upload Video", href: "/developer/video-upload" },
    { heading: "Account", type: "separator" },
    { icon: <User className="h-5 w-5" />, label: "Profile", href: "/developer/profile" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/developer/settings" },
  ];
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === "/developer" && location === "/developer") {
      return true;
    }
    if (href !== "/developer" && location.startsWith(href)) {
      return true;
    }
    return false;
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header - visible only on small screens */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
                <AvatarImage src={user.profilePicture || ""} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-col">
                  <h5 className="font-semibold text-base sm:text-lg">Developer Dashboard</h5>
                  <p className="text-xs sm:text-sm text-gray-600">{user?.username || "Developer"}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 p-1 sm:p-2"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, "", "/");
                  const event = new PopStateEvent('popstate');
                  window.dispatchEvent(event);
                }}
              >
                <AppWindow className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 p-1 sm:p-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Upload buttons row */}
          <div className="flex gap-2 mb-3">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 h-auto text-xs sm:text-sm"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/developer/app/upload");
                const event = new PopStateEvent('popstate');
                window.dispatchEvent(event);
              }}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Upload App</span>
            </Button>
            
            <Button 
              variant="secondary"
              size="sm"
              className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 h-auto text-xs sm:text-sm"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/developer/video-upload");
                const event = new PopStateEvent('popstate');
                window.dispatchEvent(event);
              }}
            >
              <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Upload Video</span>
            </Button>
          </div>
          
          {/* Mobile navigation */}
          <div className="flex overflow-x-auto pb-2 gap-1.5 no-scrollbar">
            {navItems
              .filter(item => item.type !== "separator")
              .map((item) => (
                <Button
                  key={item.href}
                  variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="whitespace-nowrap py-1 px-2 h-auto text-xs sm:text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, "", item.href);
                    const event = new PopStateEvent('popstate');
                    window.dispatchEvent(event);
                  }}
                >
                  {item.icon}
                  <span className="ml-1 truncate">{item.label.replace("Upload ", "")}</span>
                </Button>
              ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Sidebar - visible only on large screens and up */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 bg-gray-50 border-r border-gray-200 h-screen sticky top-0 shrink-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Avatar className="h-9 w-9 xl:h-10 xl:w-10 mr-3">
                <AvatarImage src={user.profilePicture || ""} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h5 className="font-semibold truncate">{user?.username || "Developer"}</h5>
                <p className="text-xs text-gray-500">Developer Account</p>
              </div>
            </div>
          </div>
          
          <nav className="p-3 xl:p-4 flex-grow overflow-y-auto">
            <ul className="space-y-1.5 xl:space-y-2">
              {navItems.map((item, index) => (
                item.type === "separator" ? (
                  <li key={`separator-${index}`} className="pt-2 xl:pt-3 pb-1">
                    <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.heading}</p>
                    <Separator className="mt-1" />
                  </li>
                ) : (
                  <li key={item.href}>
                    <a 
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, "", item.href);
                        const event = new PopStateEvent('popstate');
                        window.dispatchEvent(event);
                      }}
                      className={cn(
                        "flex items-center text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors text-sm",
                        isActiveRoute(item.href) && "text-primary font-medium bg-primary/10"
                      )}
                    >
                      <span className="w-5 mr-2 flex-shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </a>
                  </li>
                )
              ))}
            </ul>
          </nav>
          
          <div className="p-3 xl:p-4 border-t border-gray-200">
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full justify-start text-sm" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
            <div className="mt-3 xl:mt-4 pt-3 xl:pt-4 border-t border-gray-200">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-gray-600 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, "", "/");
                  const event = new PopStateEvent('popstate');
                  window.dispatchEvent(event);
                }}
              >
                <AppWindow className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                <span className="truncate">Return to App Market</span>
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Custom styles are added via CSS classes */}
    </div>
  );
}