import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShieldCheck, ThumbsUp, ThumbsDown, AlertCircle, User, Package } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { App } from "@shared/schema";

// Extended App type for our UI
type AppWithDeveloper = App & {
  developer?: {
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
};
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminApprovalsPage() {
  const { toast } = useToast();
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedAppForRejection, setSelectedAppForRejection] = useState<AppWithDeveloper | null>(null);
  
  // Get pending approval apps
  const {
    data: pendingApps,
    isLoading: isLoadingPendingApps
  } = useQuery<AppWithDeveloper[]>({
    queryKey: ["/api/admin/pending-approvals"],
  });
  
  // Mutation to approve app
  const approveAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest(
        "POST", 
        `/api/admin/apps/${appId}/approve`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Approved",
        description: "The app has been approved and is now live on the platform",
        variant: "default",
      });
      setApprovingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve app",
        variant: "destructive",
      });
      setApprovingId(null);
    },
  });
  
  // Mutation to reject app
  const rejectAppMutation = useMutation({
    mutationFn: async ({ appId, reason }: { appId: number; reason: string }) => {
      const res = await apiRequest(
        "POST", 
        `/api/admin/apps/${appId}/reject`,
        { reason }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App Rejected",
        description: "The app has been rejected",
        variant: "default",
      });
      setRejectingId(null);
      setRejectionReason("");
      setIsRejectDialogOpen(false);
      setSelectedAppForRejection(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject app",
        variant: "destructive",
      });
      setRejectingId(null);
    },
  });
  
  // Handle app approval
  const handleApproveApp = (appId: number) => {
    if (window.confirm("Are you sure you want to approve this app? It will become visible to all users.")) {
      setApprovingId(appId);
      approveAppMutation.mutate(appId);
    }
  };
  
  // Handle app rejection dialog
  const openRejectDialog = (app: AppWithDeveloper) => {
    setSelectedAppForRejection(app);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };
  
  // Handle app rejection submission
  const handleRejectApp = () => {
    if (!selectedAppForRejection) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    
    setRejectingId(selectedAppForRejection.id);
    rejectAppMutation.mutate({ 
      appId: selectedAppForRejection.id, 
      reason: rejectionReason 
    });
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Pending Approvals - Admin Dashboard</title>
        <meta 
          name="description" 
          content="Review and approve/reject pending app submissions" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review new app submissions and take action
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2" />
            Apps Awaiting Approval
          </CardTitle>
          <CardDescription>
            Review and moderate new app submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPendingApps ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : pendingApps && pendingApps.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  List of apps awaiting moderation and approval
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>App Name</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {'Developer ID: ' + app.developerId}
                      </TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell>
                        {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveApp(app.id)}
                            disabled={approvingId === app.id}
                            className="h-8 px-2 text-xs"
                          >
                            {approvingId === app.id ? (
                              <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                            ) : (
                              <ThumbsUp className="h-3 w-3 mr-1" />
                            )}
                            Approve
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openRejectDialog(app)}
                            disabled={rejectingId === app.id}
                            className="h-8 px-2 text-xs"
                          >
                            {rejectingId === app.id ? (
                              <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                            ) : (
                              <ThumbsDown className="h-3 w-3 mr-1" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending apps</h3>
              <p className="text-muted-foreground">
                There are no apps currently waiting for approval.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Rejection reason dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject App Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedAppForRejection?.name}". This will be shown to the developer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {!rejectionReason.trim() && (
              <p className="text-xs text-destructive mt-1">
                A reason for rejection is required
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectApp}
              disabled={!rejectionReason.trim() || rejectingId !== null}
            >
              {rejectingId !== null ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject App
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}