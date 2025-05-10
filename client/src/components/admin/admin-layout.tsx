import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  UserCog, 
  Package, 
  LogOut, 
  ShieldCheck,
  Star,
  Settings,
  Activity,
  AlertCircle,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Check if a path is active
  const isActive = (path: string) => {
    return location === path;
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
          variant: "default",
        });
        navigate("/");
      }
    });
  };
  
  if (!user || !user.isAdmin) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile header - visible only on small screens */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div>
                <div className="flex flex-col">
                  <h5 className="font-semibold text-lg">Admin Dashboard</h5>
                  <p className="text-sm text-gray-600">{user?.username}</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Admin action buttons */}
          <div className="flex gap-2 mb-3">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 py-5"
              onClick={() => navigate("/admin/approvals")}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Approvals
            </Button>
            
            <Button 
              variant="secondary"
              size="sm"
              className="flex-1 py-5"
              onClick={() => navigate("/admin/apps")}
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Apps
            </Button>
          </div>
          
          {/* Mobile navigation */}
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
            <Button
              variant={isActive("/admin") ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin")}
            >
              <UserCog className="h-4 w-4 mr-1" />
              Users
            </Button>
            
            <Button
              variant={isActive("/admin/developer-requests") ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin/developer-requests")}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Dev Requests
            </Button>
            
            <Button
              variant={isActive("/admin/apps") ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin/apps")}
            >
              <Package className="h-4 w-4 mr-1" />
              Apps
            </Button>
            
            <Button
              variant={isActive("/admin/approvals") ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin/approvals")}
            >
              <ShieldCheck className="h-4 w-4 mr-1" />
              Approvals
            </Button>
            
            <Button
              variant={isActive("/admin/reviews") ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin/reviews")}
            >
              <Star className="h-4 w-4 mr-1" />
              Reviews
            </Button>
            
            <Button
              variant={isActive("/admin/analytics") ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => navigate("/admin/analytics")}
            >
              <Activity className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            
            {user.isMasterAdmin && (
              <>
                <Button
                  variant={isActive("/admin/settings") ? "secondary" : "ghost"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => navigate("/admin/settings")}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
                
                <Button
                  variant={isActive("/admin/logs") ? "secondary" : "ghost"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => navigate("/admin/logs")}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Logs
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Desktop sidebar - visible only on medium screens and up */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-card sticky top-0 h-screen">
          <ScrollArea className="flex-1">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your platform
              </p>
              
              <nav className="space-y-1">
                <Button
                  variant={isActive("/admin") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate("/admin")}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  User Management
                </Button>
                
                <Button
                  variant={isActive("/admin/developer-requests") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/developer-requests")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Developer Requests
                </Button>
                
                <Button
                  variant={isActive("/admin/apps") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/apps")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  App Management
                </Button>
                
                <Button
                  variant={isActive("/admin/approvals") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/approvals")}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Pending Approvals
                </Button>
                
                <Button
                  variant={isActive("/admin/reviews") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/reviews")}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Review Management
                </Button>
                
                <Button
                  variant={isActive("/admin/analytics") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/analytics")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Platform Analytics
                </Button>
                
                {user.isMasterAdmin && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-xs font-semibold text-muted-foreground mb-2 pl-2">
                      MASTER ADMIN
                    </p>
                    
                    <Button
                      variant={isActive("/admin/settings") ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                    
                    <Button
                      variant={isActive("/admin/logs") ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/logs")}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      System Logs
                    </Button>
                  </>
                )}
              </nav>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <div className="md:block hidden">
        <Footer />
      </div>
    </div>
  );
}