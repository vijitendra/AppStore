import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  UserCog, 
  ShieldAlert, 
  ShieldCheck,
  Ban,
  XCircle,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { User } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminUserManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeletingDemoApps, setIsDeletingDemoApps] = useState(false);
  
  // Get all developers
  const { 
    data: developers, 
    isLoading: isLoadingDevelopers 
  } = useQuery<User[]>({
    queryKey: ["/api/admin/developers"],
    enabled: !!user?.isAdmin,
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
  
  // Mutation to delete demo apps
  const deleteDemoAppsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "DELETE", 
        `/api/master-admin/demo-apps`
      );
      return await res.json();
    },
    onSuccess: (data) => {
      setIsDeletingDemoApps(false);
      toast({
        title: "Success",
        description: `Deleted ${data.deletedCount} demo apps successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      setIsDeletingDemoApps(false);
      toast({
        title: "Error",
        description: error.message || "Failed to delete demo apps",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteDemoApps = () => {
    if (window.confirm("Are you sure you want to delete all demo apps? This action cannot be undone.")) {
      setIsDeletingDemoApps(true);
      deleteDemoAppsMutation.mutate();
    }
  };
  
  // Handlers for user actions
  const handleMakeAdmin = (userId: number) => {
    if (window.confirm("Are you sure you want to grant admin privileges to this user?")) {
      if (user?.isMasterAdmin) {
        promoteUserMutation.mutate({ userId, role: 'admin' });
      } else {
        makeAdminMutation.mutate(userId);
      }
    }
  };
  
  const handleMakeDeveloper = (userId: number) => {
    if (window.confirm("Are you sure you want to grant developer privileges to this user?")) {
      if (user?.isMasterAdmin) {
        promoteUserMutation.mutate({ userId, role: 'developer' });
      } else {
        makeDeveloperMutation.mutate(userId);
      }
    }
  };
  
  const handleRemoveAdmin = (userId: number) => {
    if (window.confirm("Are you sure you want to remove admin privileges from this user?")) {
      removeAdminMutation.mutate(userId);
    }
  };
  
  const handleRemoveDeveloper = (userId: number) => {
    if (window.confirm("Are you sure you want to remove developer privileges from this user?")) {
      removeDeveloperMutation.mutate(userId);
    }
  };
  
  const handleBlockUser = (userId: number) => {
    if (window.confirm("Are you sure you want to block this user? They will no longer be able to access the platform.")) {
      blockUserMutation.mutate(userId);
    }
  };
  
  const handleUnblockUser = (userId: number) => {
    if (window.confirm("Are you sure you want to unblock this user? They will regain access to the platform.")) {
      unblockUserMutation.mutate(userId);
    }
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>User Management - Admin Dashboard</title>
        <meta 
          name="description" 
          content="Manage users, developers and permissions" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, assign roles, and control platform access
        </p>
      </div>
      
      {user?.isMasterAdmin && (
        <Card className="mb-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle>Master Admin Controls</CardTitle>
            <CardDescription>
              Special controls available only to the master administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive"
              onClick={handleDeleteDemoApps}
              disabled={isDeletingDemoApps}
              className="gap-2"
            >
              {isDeletingDemoApps ? <AlertCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              Delete All Demo Apps
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            Platform Users
          </CardTitle>
          <CardDescription>
            Manage users and their permissions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDevelopers ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : developers && developers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  List of all platform users and their roles
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {developers.map((dev) => (
                    <TableRow key={dev.id}>
                      <TableCell className="font-medium">{dev.username}</TableCell>
                      <TableCell>{dev.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {dev.isMasterAdmin && (
                            <Badge variant="secondary" className="bg-purple-600 text-white">
                              Master Admin
                            </Badge>
                          )}
                          {dev.isAdmin && !dev.isMasterAdmin && (
                            <Badge variant="secondary" className="bg-red-500 text-white">
                              Admin
                            </Badge>
                          )}
                          {dev.isDeveloper && (
                            <Badge variant="secondary" className="bg-blue-500 text-white">
                              Developer
                            </Badge>
                          )}
                          {!dev.isDeveloper && !dev.isAdmin && !dev.isMasterAdmin && (
                            <Badge variant="outline">
                              User
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dev.isBlocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {dev.createdAt ? formatDistanceToNow(new Date(dev.createdAt), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(!dev.isAdmin && !dev.isMasterAdmin) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeAdmin(dev.id)}
                              disabled={makeAdminMutation.isPending}
                              className="h-8 px-2 text-xs"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Make Admin
                            </Button>
                          )}
                          
                          {dev.isAdmin && !dev.isMasterAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAdmin(dev.id)}
                              disabled={removeAdminMutation.isPending}
                              className="h-8 px-2 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Remove Admin
                            </Button>
                          )}
                          
                          {!dev.isDeveloper && !dev.isMasterAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeDeveloper(dev.id)}
                              disabled={makeDeveloperMutation.isPending}
                              className="h-8 px-2 text-xs"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Make Developer
                            </Button>
                          )}
                          
                          {dev.isDeveloper && !dev.isMasterAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveDeveloper(dev.id)}
                              disabled={removeDeveloperMutation.isPending}
                              className="h-8 px-2 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Remove Developer
                            </Button>
                          )}
                          
                          {!dev.isMasterAdmin && !dev.isBlocked && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBlockUser(dev.id)}
                              disabled={blockUserMutation.isPending}
                              className="h-8 px-2 text-xs"
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Block
                            </Button>
                          )}
                          
                          {!dev.isMasterAdmin && dev.isBlocked && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUnblockUser(dev.id)}
                              disabled={unblockUserMutation.isPending}
                              className="h-8 px-2 text-xs"
                            >
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              Unblock
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}