import { Link, useLocation } from "wouter";
import { Home, Package, Upload, BarChart3, User, Settings, LogOut, Film, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type NavItem = 
  | { icon: JSX.Element; label: string; href: string; type?: undefined }
  | { heading: string; type: "separator"; icon?: undefined; label?: undefined; href?: undefined };

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

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

  const isActiveRoute = (href: string) => {
    if (href === "/developer" && location === "/developer") {
      return true;
    }
    if (href !== "/developer" && location.startsWith(href)) {
      return true;
    }
    return false;
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="" />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-semibold">{user?.username || "Developer"}</h5>
            <p className="text-xs text-gray-500">Developer Account</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            item.type === "separator" ? (
              <li key={`separator-${index}`} className="pt-3 pb-1">
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.heading}</p>
                <Separator className="mt-1" />
              </li>
            ) : (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors",
                    isActiveRoute(item.href) && "text-primary font-medium bg-primary/10"
                  )}
                >
                  <span className="w-5 mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="destructive" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Logout</span>
        </Button>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-600"
            asChild
          >
            <Link href="/">
              Return to App Market
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
