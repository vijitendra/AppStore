import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  UserCog, 
  Package, 
  Star, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck,
  Ban,
  XCircle,
  Eye,
  Check,
  User as UserIcon,
  Lock,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { User, App, Review } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs as FormTabs, TabsList as FormTabsList, TabsTrigger as FormTabsTrigger, TabsContent as FormTabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Form schemas for the master admin profile settings
const usernameFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UsernameFormValues = z.infer<typeof usernameFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Master Admin Profile Settings Component
function MasterAdminProfileSettings({ user }: { user: User }) {
  const { toast } = useToast();
  const [activeSettingsTab, setActiveSettingsTab] = useState("username");
  
  // Username form
  const usernameForm = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      username: user.username,
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Mutation to update username
  const updateUsernameMutation = useMutation({
    mutationFn: async (data: UsernameFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", {
        username: data.username,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Username updated",
        description: "Your username has been updated successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update username. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update password
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PUT", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle username form submission
  const onUsernameSubmit = (data: UsernameFormValues) => {
    if (data.username === user.username) {
      toast({
        title: "No changes",
        description: "The username is the same as your current one.",
        variant: "default",
      });
      return;
    }
    
    updateUsernameMutation.mutate(data);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };
  
  return (
    <FormTabs defaultValue={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
      <FormTabsList className="grid w-full grid-cols-2">
        <FormTabsTrigger value="username" className="flex items-center">
          <UserIcon className="h-4 w-4 mr-2" />
          Update Username
        </FormTabsTrigger>
        <FormTabsTrigger value="password" className="flex items-center">
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </FormTabsTrigger>
      </FormTabsList>
      
      {/* Username Update Form */}
      <FormTabsContent value="username" className="space-y-4 mt-4">
        <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-md mb-4">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Changing your username will update how you appear across the system. You will need to log in with the new username afterwards.
          </p>
        </div>
        
        <Form {...usernameForm}>
          <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
            <FormField
              control={usernameForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a unique username between 3-30 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateUsernameMutation.isPending}
            >
              {updateUsernameMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Username
            </Button>
          </form>
        </Form>
      </FormTabsContent>
      
      {/* Password Change Form */}
      <FormTabsContent value="password" className="space-y-4 mt-4">
        <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-md mb-4">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            For security reasons, you need to enter your current password before setting a new one. Choose a strong password to protect your master admin account.
          </p>
        </div>
        
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Password
            </Button>
          </form>
        </Form>
      </FormTabsContent>
    </FormTabs>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("developers");
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isDeletingDemoApps, setIsDeletingDemoApps] = useState(false);
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
          variant: "default",
        });
        setLocation("/");
      }
    });
  };
  
  // Redirect if not logged in as admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Check master admin status
  const {
    data: masterAdminStatus,
    isLoading: isLoadingMasterAdmin
  } = useQuery({
    queryKey: ["/api/master-admin"],
    enabled: !!user?.isAdmin && user?.isMasterAdmin === true
  });

  // Get all developers
  const { 
    data: developers, 
    isLoading: isLoadingDevelopers 
  } = useQuery<User[]>({
    queryKey: ["/api/admin/developers"],
    enabled: !!user?.isAdmin,
  });
  
  // Get pending approval apps
  const {
    data: pendingApps,
    isLoading: isLoadingPendingApps
  } = useQuery<App[]>({
    queryKey: ["/api/admin/pending-approvals"],
    enabled: !!user?.isAdmin && activeTab === "pending",
  });

  // Get all apps
  const { 
    data: apps, 
    isLoading: isLoadingApps 
  } = useQuery<App[]>({
    queryKey: ["/api/admin/apps"],
    enabled: !!user?.isAdmin && activeTab === "apps",
  });
  
  // Get all reviews
  const { 
    data: reviews, 
    isLoading: isLoadingReviews 
  } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: !!user?.isAdmin && activeTab === "reviews",
  });
  
  // Mutation to make user admin
  const makeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/make-admin`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been granted admin privileges",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user privileges",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to make user developer
  const makeDeveloperMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/make-developer`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been granted developer privileges",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user privileges",
        variant: "destructive",
      });
    },
  });
  
  // Master admin promotion mutation
  const promoteUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: 'admin' | 'developer' }) => {
      const res = await apiRequest(
        "PUT",
        `/api/master-admin/users/${userId}/promote`,
        { role }
      );
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "User has been promoted successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Promotion Failed",
        description: error.message || "Failed to promote user",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to block user
  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/block`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Blocked",
        description: "User has been blocked successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to unblock user
  const unblockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/unblock`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Unblocked",
        description: "User has been unblocked successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unblock user",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to remove admin role
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/remove-admin`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Removed",
        description: "Admin role has been removed successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin role",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to remove developer role
  const removeDeveloperMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/remove-developer`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Removed",
        description: "Developer role has been removed successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/developers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove developer role",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to approve app
  const approveAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/apps/${appId}/approval`,
        { approve: true }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Approved",
        description: "App has been approved and published successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve app",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to reject app
  const rejectAppMutation = useMutation({
    mutationFn: async ({ appId, reason }: { appId: number; reason: string }) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/apps/${appId}/approval`,
        { approve: false, reason }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Rejected",
        description: "App has been rejected successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject app",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to suspend app
  const suspendAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/apps/${appId}/suspend`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Suspended",
        description: "App has been suspended successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend app",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to unsuspend app
  const unsuspendAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/apps/${appId}/unsuspend`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Unsuspended",
        description: "App has been unsuspended successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unsuspend app",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to permanently delete app
  const deleteAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest(
        "DELETE", 
        `/api/admin/apps/${appId}`
      );
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "App Deleted",
        description: data.message || "App has been permanently deleted",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps/top"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete app",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to delete all demo apps
  const deleteDemoAppsMutation = useMutation({
    mutationFn: async () => {
      setIsDeletingDemoApps(true);
      
      try {
        const res = await apiRequest("POST", "/api/admin/delete-demo-apps");
        return await res.json();
      } finally {
        setIsDeletingDemoApps(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Apps Deleted",
        description: data.message || `Successfully deleted ${data.deletedCount || 0} demo apps`,
        variant: "default",
      });
      
      // Invalidate all app-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps/top"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps/pending"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete demo apps",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - AppMarket</title>
        <meta 
          name="description" 
          content="Admin dashboard for AppMarket" 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                {user.isMasterAdmin ? (
                  <Badge className="bg-purple-600">Master Admin Access</Badge>
                ) : (
                  <Badge className="bg-red-500">Admin Access</Badge>
                )}
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </Button>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Welcome, {user.firstName || user.username}</CardTitle>
                <CardDescription>
                  {user.isMasterAdmin 
                    ? "You have master administrator access with full control of user roles and permissions."
                    : "This dashboard provides administrative access to manage developers, apps, and reviews."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.isMasterAdmin ? (
                  <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md border-l-4 border-purple-500">
                    <ShieldCheck className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Master Administrator
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You can promote users to admin or developer roles and have complete system access.
                        Use these privileges with caution.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    You have administrative privileges. Please use this access responsibly.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Master Admin Profile Settings */}
            {user.isMasterAdmin && (
              <Card className="mb-8 border-purple-200">
                <CardHeader className="border-b">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-purple-600 mr-3" />
                    <CardTitle>Master Admin Profile Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Update your master admin account credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-4">
                  <MasterAdminProfileSettings user={user} />
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setLocation("/admin/app-approval")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    App Approval Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Review and manage submitted app approval requests from developers.
                  </p>
                </CardContent>
              </Card>
              
              {/* Demo Apps Management Card for Master Admin */}
              {user.isMasterAdmin && (
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <XCircle className="h-5 w-5 mr-2 text-red-500" />
                      Demo Apps Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Remove all demo applications from the database to clean up the marketplace.
                    </p>
                    <Button 
                      variant="destructive"
                      className="w-full"
                      disabled={isDeletingDemoApps || deleteDemoAppsMutation.isPending}
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete all demo apps? This action cannot be undone.")) {
                          deleteDemoAppsMutation.mutate();
                        }
                      }}
                    >
                      {isDeletingDemoApps || deleteDemoAppsMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting Demo Apps...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Delete All Demo Apps
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList>
                <TabsTrigger value="pending">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Pending Approval
                </TabsTrigger>
                <TabsTrigger value="developers">
                  <UserCog className="h-4 w-4 mr-2" />
                  Developers
                </TabsTrigger>
                <TabsTrigger value="apps">
                  <Package className="h-4 w-4 mr-2" />
                  Apps
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <Star className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                {isLoadingPendingApps ? (
                  <div className="flex justify-center my-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : pendingApps && pendingApps.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-amber-500" />
                        Apps Pending Approval
                      </CardTitle>
                      <CardDescription>
                        Review and approve or reject developer app submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {pendingApps.map(app => {
                          const [isRejecting, setIsRejecting] = useState(false);
                          const [rejectionReason, setRejectionReason] = useState("");
                          
                          return (
                            <div key={app.id} className="border rounded-lg overflow-hidden">
                              <div className="flex items-start p-4 border-b">
                                <div className="flex-shrink-0 mr-4">
                                  <img 
                                    src={app.iconUrl} 
                                    alt={app.name} 
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <div className="flex justify-between">
                                    <div>
                                      <h3 className="text-lg font-semibold">{app.name}</h3>
                                      <p className="text-sm text-gray-500">
                                        Developer ID: {app.developerId}
                                      </p>
                                      <p className="text-sm text-gray-700 mt-1">
                                        {app.shortDescription || app.description?.substring(0, 100)}...
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="outline">{app.category}</Badge>
                                        <Badge variant="outline">Version {app.version}</Badge>
                                        <Badge variant="outline">{app.packageName}</Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setLocation(`/app/${app.id}`)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-gray-50">
                                {app.rejectionReason && (
                                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <h4 className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</h4>
                                    <p className="text-sm text-red-600">{app.rejectionReason}</p>
                                  </div>
                                )}
                                
                                {isRejecting ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center mb-2">
                                      <h4 className="font-medium text-red-600">Rejection Reason (Required)</h4>
                                    </div>
                                    <textarea
                                      className="w-full p-2 border rounded-md text-sm" 
                                      rows={3}
                                      placeholder="Provide a reason for rejecting this application..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setIsRejecting(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        disabled={!rejectionReason.trim() || rejectAppMutation.isPending}
                                        onClick={() => {
                                          rejectAppMutation.mutate({ 
                                            appId: app.id, 
                                            reason: rejectionReason 
                                          });
                                        }}
                                      >
                                        {rejectAppMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                          <ThumbsDown className="h-4 w-4 mr-1" />
                                        )}
                                        Confirm Rejection
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        Submitted {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      {!app.rejectionReason && (
                                        <>
                                          <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => setIsRejecting(true)}
                                          >
                                            <ThumbsDown className="h-4 w-4 mr-1" />
                                            Reject
                                          </Button>
                                          <Button 
                                            variant="default" 
                                            size="sm"
                                            onClick={() => approveAppMutation.mutate(app.id)}
                                            disabled={approveAppMutation.isPending}
                                          >
                                            {approveAppMutation.isPending ? (
                                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            ) : (
                                              <ThumbsUp className="h-4 w-4 mr-1" />
                                            )}
                                            Approve
                                          </Button>
                                        </>
                                      )}
                                      {app.rejectionReason && (
                                        <Button 
                                          variant="default" 
                                          size="sm"
                                          onClick={() => approveAppMutation.mutate(app.id)}
                                          disabled={approveAppMutation.isPending}
                                        >
                                          {approveAppMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          ) : (
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                          )}
                                          Approve Despite Rejection
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="text-center py-8">
                      <CardTitle className="flex flex-col items-center justify-center">
                        <ShieldCheck className="h-10 w-10 mb-2 text-green-500" />
                        No Apps Pending Approval
                      </CardTitle>
                      <CardDescription>
                        All submitted apps have been reviewed. Check back later for new submissions.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="developers">
                {isLoadingDevelopers ? (
                  <div className="flex justify-center my-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Developer Accounts</CardTitle>
                      <CardDescription>
                        Manage developer accounts and permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableCaption>List of all developer accounts</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Account Type</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {developers && developers.map(developer => (
                            <TableRow key={developer.id}>
                              <TableCell>{developer.id}</TableCell>
                              <TableCell>{developer.username}</TableCell>
                              <TableCell>{developer.email}</TableCell>
                              <TableCell>
                                {developer.firstName} {developer.lastName}
                              </TableCell>
                              <TableCell>
                                {developer.isMasterAdmin && (
                                  <Badge className="bg-purple-600 mr-2">Master Admin</Badge>
                                )}
                                {developer.isAdmin && !developer.isMasterAdmin && (
                                  <Badge className="bg-red-500 mr-2">Admin</Badge>
                                )}
                                {developer.isDeveloper && (
                                  <Badge className="mr-2">Developer</Badge>
                                )}
                                {!developer.isDeveloper && !developer.isAdmin && (
                                  <Badge variant="outline">User</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(developer.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 flex-wrap">
                                  {/* Display badge if user is blocked */}
                                  {developer.isBlocked && (
                                    <Badge variant="destructive" className="mb-2 w-full text-center justify-center">
                                      <Ban className="h-3 w-3 mr-1" />
                                      Blocked Account
                                    </Badge>
                                  )}
                                
                                  {/* Regular admin actions */}
                                  {!user.isMasterAdmin && !developer.isAdmin && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => makeAdminMutation.mutate(developer.id)}
                                      disabled={makeAdminMutation.isPending || developer.isBlocked}
                                    >
                                      {makeAdminMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : null}
                                      Make Admin
                                    </Button>
                                  )}
                                  
                                  {!user.isMasterAdmin && developer.isAdmin && !developer.isMasterAdmin && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-red-200 hover:bg-red-50 text-red-600"
                                      onClick={() => removeAdminMutation.mutate(developer.id)}
                                      disabled={removeAdminMutation.isPending || developer.isBlocked}
                                    >
                                      {removeAdminMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      Remove Admin
                                    </Button>
                                  )}
                                  
                                  {!user.isMasterAdmin && !developer.isDeveloper && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => makeDeveloperMutation.mutate(developer.id)}
                                      disabled={makeDeveloperMutation.isPending || developer.isBlocked}
                                    >
                                      {makeDeveloperMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : null}
                                      Make Developer
                                    </Button>
                                  )}
                                  
                                  {!user.isMasterAdmin && developer.isDeveloper && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-blue-200 hover:bg-blue-50 text-blue-600"
                                      onClick={() => removeDeveloperMutation.mutate(developer.id)}
                                      disabled={removeDeveloperMutation.isPending || developer.isBlocked}
                                    >
                                      {removeDeveloperMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      Remove Developer
                                    </Button>
                                  )}
                                  
                                  {/* Block/Unblock actions */}
                                  {!developer.isBlocked ? (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => blockUserMutation.mutate(developer.id)}
                                      disabled={blockUserMutation.isPending || developer.isMasterAdmin}
                                      title={developer.isMasterAdmin ? "Cannot block Master Admin" : ""}
                                    >
                                      {blockUserMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Ban className="h-3 w-3 mr-1" />
                                      )}
                                      Block User
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => unblockUserMutation.mutate(developer.id)}
                                      disabled={unblockUserMutation.isPending}
                                    >
                                      {unblockUserMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Check className="h-3 w-3 mr-1" />
                                      )}
                                      Unblock User
                                    </Button>
                                  )}
                                  
                                  {/* Master admin actions */}
                                  {user.isMasterAdmin && !developer.isAdmin && !developer.isMasterAdmin && (
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      className="bg-red-500 hover:bg-red-600"
                                      onClick={() => promoteUserMutation.mutate({ 
                                        userId: developer.id, 
                                        role: 'admin' 
                                      })}
                                      disabled={promoteUserMutation.isPending || developer.isBlocked}
                                    >
                                      {promoteUserMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <ShieldAlert className="h-3 w-3 mr-1" />
                                      )}
                                      Promote to Admin
                                    </Button>
                                  )}
                                  
                                  {user.isMasterAdmin && developer.isAdmin && !developer.isMasterAdmin && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-red-200 hover:bg-red-50 text-red-600"
                                      onClick={() => removeAdminMutation.mutate(developer.id)}
                                      disabled={removeAdminMutation.isPending || developer.isBlocked}
                                    >
                                      {removeAdminMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      Remove Admin
                                    </Button>
                                  )}
                                  
                                  {user.isMasterAdmin && !developer.isDeveloper && !developer.isMasterAdmin && (
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      className="bg-blue-500 hover:bg-blue-600"
                                      onClick={() => promoteUserMutation.mutate({ 
                                        userId: developer.id, 
                                        role: 'developer' 
                                      })}
                                      disabled={promoteUserMutation.isPending || developer.isBlocked}
                                    >
                                      {promoteUserMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Package className="h-3 w-3 mr-1" />
                                      )}
                                      Promote to Developer
                                    </Button>
                                  )}
                                  
                                  {user.isMasterAdmin && developer.isDeveloper && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-blue-200 hover:bg-blue-50 text-blue-600"
                                      onClick={() => removeDeveloperMutation.mutate(developer.id)}
                                      disabled={removeDeveloperMutation.isPending || developer.isBlocked}
                                    >
                                      {removeDeveloperMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      Remove Developer
                                    </Button>
                                  )}
                                  
                                  {developer.isMasterAdmin && (
                                    <Badge 
                                      className="bg-purple-600 hover:bg-purple-700"
                                      title="This is the master administrator account with full system access"
                                    >
                                      Master Admin
                                    </Badge>
                                  )}
                                  
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setLocation(`/apps/developer/${developer.id}`)}
                                  >
                                    View Apps
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="apps">
                {isLoadingApps ? (
                  <div className="flex justify-center my-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Applications</CardTitle>
                      <CardDescription>
                        Review and manage applications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableCaption>List of all applications in the platform</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>App Name</TableHead>
                            <TableHead>Developer ID</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {apps && apps.map(app => (
                            <TableRow key={app.id}>
                              <TableCell>{app.id}</TableCell>
                              <TableCell className="font-medium">{app.name}</TableCell>
                              <TableCell>{app.developerId}</TableCell>
                              <TableCell>{app.category}</TableCell>
                              <TableCell>
                                {app.rating}/5 ({app.reviewCount})
                              </TableCell>
                              <TableCell>{app.downloads.toLocaleString()}</TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 flex-wrap">
                                  {/* Display badge if app is suspended */}
                                  {app.isSuspended && (
                                    <Badge variant="destructive" className="mb-2 w-full text-center justify-center">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Suspended
                                    </Badge>
                                  )}
                                  
                                  {/* Suspend/Unsuspend actions */}
                                  {!app.isSuspended ? (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => suspendAppMutation.mutate(app.id)}
                                      disabled={suspendAppMutation.isPending}
                                    >
                                      {suspendAppMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      Suspend
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => unsuspendAppMutation.mutate(app.id)}
                                      disabled={unsuspendAppMutation.isPending}
                                    >
                                      {unsuspendAppMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Check className="h-3 w-3 mr-1" />
                                      )}
                                      Unsuspend
                                    </Button>
                                  )}
                                  
                                  {/* View App Button */}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      setLocation(`/app/${app.id}`);
                                    }}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  
                                  {/* Delete App Button - Only show for master admin */}
                                  {user.isMasterAdmin && (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to permanently delete "${app.name}"? This action cannot be undone.`)) {
                                          deleteAppMutation.mutate(app.id);
                                        }
                                      }}
                                      disabled={deleteAppMutation.isPending}
                                    >
                                      {deleteAppMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Trash2 className="h-3 w-3 mr-1" />
                                      )}
                                      Remove
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="reviews">
                {isLoadingReviews ? (
                  <div className="flex justify-center my-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>User Reviews</CardTitle>
                      <CardDescription>
                        Monitor and moderate user reviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableCaption>List of all reviews</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>App ID</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reviews && reviews.map(review => (
                            <TableRow key={review.id}>
                              <TableCell>{review.id}</TableCell>
                              <TableCell>{review.appId}</TableCell>
                              <TableCell>{review.userId}</TableCell>
                              <TableCell>{review.rating}/5</TableCell>
                              <TableCell>
                                {review.comment ? (
                                  <span className="line-clamp-2">{review.comment}</span>
                                ) : (
                                  <span className="text-gray-400 italic">No comment</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    console.log("Navigating to app details from review:", review.appId);
                                    setLocation(`/app/${review.appId}`);
                                  }}
                                >
                                  View App
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}