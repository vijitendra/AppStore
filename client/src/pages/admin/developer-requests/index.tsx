import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  UserCog, 
  ShieldCheck,
  XCircle,
  Clock,
  CalendarIcon
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
import { formatDistanceToNow } from "date-fns";
import { User } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DeveloperRequestsPage() {
  const { toast } = useToast();
  
  // Get developer requests
  const { 
    data: developerRequests, 
    isLoading: isLoadingRequests,
    refetch: refetchRequests
  } = useQuery<User[]>({
    queryKey: ["/api/admin/developer-requests"],
  });
  
  // Approve developer request mutation
  const approveDeveloperMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/make-developer`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "User has been granted developer permissions",
        variant: "default",
      });
      refetchRequests();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve developer request",
        variant: "destructive",
      });
    },
  });
  
  // Deny developer request mutation
  const denyDeveloperRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/admin/users/${userId}/deny-developer-request`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Denied",
        description: "Developer request has been denied",
        variant: "default",
      });
      refetchRequests();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deny developer request",
        variant: "destructive",
      });
    },
  });
  
  // Handle actions
  const handleApproveRequest = (userId: number) => {
    if (window.confirm("Are you sure you want to approve this developer request?")) {
      approveDeveloperMutation.mutate(userId);
    }
  };
  
  const handleDenyRequest = (userId: number) => {
    if (window.confirm("Are you sure you want to deny this developer request?")) {
      denyDeveloperRequestMutation.mutate(userId);
    }
  };
  
  // Get user initials
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Developer Requests - Admin Dashboard</title>
        <meta 
          name="description" 
          content="Manage developer access requests" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Developer Requests</h1>
        <p className="text-muted-foreground">
          Review and manage pending developer access requests
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            Pending Developer Requests
          </CardTitle>
          <CardDescription>
            Approve or deny requests from users to become developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : developerRequests && developerRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  List of pending developer requests
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {developerRequests.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profilePicture || ""} />
                            <AvatarFallback className="text-xs">{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {user.developerRequestDate 
                              ? formatDistanceToNow(new Date(user.developerRequestDate), { addSuffix: true }) 
                              : 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {user.createdAt 
                              ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) 
                              : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(user.id)}
                            disabled={approveDeveloperMutation.isPending}
                            className="h-8 px-2 text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDenyRequest(user.id)}
                            disabled={denyDeveloperRequestMutation.isPending}
                            className="h-8 px-2 text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <UserCog className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are currently no pending developer access requests to review.
                Requests will appear here when users request developer status.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}