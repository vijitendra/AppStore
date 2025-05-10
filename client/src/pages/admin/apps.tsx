import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, Ban, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { App } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminAppsPage() {
  const { toast } = useToast();
  const [suspendingAppId, setSuspendingAppId] = useState<number | null>(null);
  const [unsuspendingAppId, setUnsuspendingAppId] = useState<number | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<number | null>(null);
  
  // Get all apps
  const { 
    data: apps, 
    isLoading: isLoadingApps 
  } = useQuery<App[]>({
    queryKey: ["/api/admin/apps"],
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
        description: "The app has been suspended successfully",
        variant: "default",
      });
      setSuspendingAppId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend app",
        variant: "destructive",
      });
      setSuspendingAppId(null);
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
        title: "App Restored",
        description: "The app has been restored successfully",
        variant: "default",
      });
      setUnsuspendingAppId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore app",
        variant: "destructive",
      });
      setUnsuspendingAppId(null);
    },
  });
  
  // Mutation to delete app
  const deleteAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest(
        "DELETE", 
        `/api/admin/apps/${appId}`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Deleted",
        description: "The app has been deleted successfully",
        variant: "default",
      });
      setDeletingAppId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete app",
        variant: "destructive",
      });
      setDeletingAppId(null);
    },
  });
  
  // Handlers for app actions
  const handleSuspendApp = (appId: number) => {
    if (window.confirm("Are you sure you want to suspend this app? It will be hidden from users.")) {
      setSuspendingAppId(appId);
      suspendAppMutation.mutate(appId);
    }
  };
  
  const handleUnsuspendApp = (appId: number) => {
    if (window.confirm("Are you sure you want to restore this app? It will become visible to users again.")) {
      setUnsuspendingAppId(appId);
      unsuspendAppMutation.mutate(appId);
    }
  };
  
  const handleDeleteApp = (appId: number) => {
    if (window.confirm("Are you sure you want to permanently delete this app? This action cannot be undone.")) {
      setDeletingAppId(appId);
      deleteAppMutation.mutate(appId);
    }
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>App Management - Admin Dashboard</title>
        <meta 
          name="description" 
          content="Manage apps, suspend or delete problematic applications" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">App Management</h1>
        <p className="text-muted-foreground">
          View all apps and take administrative actions
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Platform Apps
          </CardTitle>
          <CardDescription>
            Manage apps published on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApps ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : apps && apps.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  List of all apps on the platform
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.developer?.username || 'Unknown'}</TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell>
                        {app.isSuspended ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{app.downloads.toLocaleString()}</TableCell>
                      <TableCell>
                        {app.updatedAt ? formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!app.isSuspended ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspendApp(app.id)}
                              disabled={suspendingAppId === app.id}
                              className="h-8 px-2 text-xs"
                            >
                              {suspendingAppId === app.id ? (
                                <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                              ) : (
                                <Ban className="h-3 w-3 mr-1" />
                              )}
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnsuspendApp(app.id)}
                              disabled={unsuspendingAppId === app.id}
                              className="h-8 px-2 text-xs"
                            >
                              {unsuspendingAppId === app.id ? (
                                <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Restore
                            </Button>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteApp(app.id)}
                            disabled={deletingAppId === app.id}
                            className="h-8 px-2 text-xs"
                          >
                            {deletingAppId === app.id ? (
                              <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No apps found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}