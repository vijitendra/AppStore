import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  AlertTriangle, 
  Package, 
  Download,
  Calendar, 
  Tag,
  User
} from "lucide-react";
import { AdminRoute } from "@/lib/protected-route";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { App } from "@shared/schema";

function AppApprovalPage() {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  // Fetch pending apps
  const { data: pendingApps = [], isLoading, error, refetch } = useQuery<App[]>({
    queryKey: ['/api/admin/apps/pending'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation for approving an app
  const approveMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest('POST', `/api/admin/apps/${appId}/approve`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App approved",
        description: "The app is now available in the marketplace.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/apps/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      setSelectedApp(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve app",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for rejecting an app
  const rejectMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest('POST', `/api/admin/apps/${appId}/reject`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "App rejected",
        description: "The app has been removed from the platform.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/apps/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      setSelectedApp(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject app",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle approving an app
  const handleApprove = (appId: number) => {
    if (confirm("Are you sure you want to approve this app?")) {
      approveMutation.mutate(appId);
    }
  };

  // Handle rejecting an app
  const handleReject = (appId: number) => {
    if (confirm("Are you sure you want to reject this app? This cannot be undone.")) {
      rejectMutation.mutate(appId);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin App Approval | AppMarket</title>
        <meta name="description" content="Approve or reject apps submitted by developers" />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">App Approval Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Apps</CardTitle>
                  <CardDescription>Apps waiting for approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 p-4 flex items-center">
                      <AlertTriangle className="mr-2" /> Error loading apps
                    </div>
                  ) : pendingApps.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No pending apps to review
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {pendingApps.map((app: App) => (
                        <li 
                          key={app.id}
                          className={`p-3 rounded-md cursor-pointer ${selectedApp?.id === app.id ? 'bg-primary/10' : 'hover:bg-gray-100'}`}
                          onClick={() => setSelectedApp(app)}
                        >
                          <div className="font-medium">{app.name}</div>
                          <div className="text-sm text-gray-500">
                            {app.category} • v{app.version}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    Refresh
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedApp ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedApp.name}</CardTitle>
                    <CardDescription>Review app details before approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={selectedApp.iconUrl} 
                          alt={`${selectedApp.name} icon`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center text-sm">
                          <Tag className="h-4 w-4 mr-2" />
                          <span className="text-gray-500 mr-2">Category:</span>
                          <span>{selectedApp.category}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Package className="h-4 w-4 mr-2" />
                          <span className="text-gray-500 mr-2">Package:</span>
                          <span>{selectedApp.packageName}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-gray-500 mr-2">Submitted:</span>
                          <span>{new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-gray-500 mr-2">Developer ID:</span>
                          <span>{selectedApp.developerId}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Download className="h-4 w-4 mr-2" />
                          <span className="text-gray-500 mr-2">File Size:</span>
                          <span>{(selectedApp.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Description</h3>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {selectedApp.description}
                      </p>
                    </div>
                    
                    {selectedApp.screenshotUrls.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-3">Screenshots</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {selectedApp.screenshotUrls.map((url, index) => (
                            <div key={index} className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`${selectedApp.name} screenshot ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedApp(null)}
                    >
                      Cancel
                    </Button>
                    
                    <div className="space-x-2">
                      <Button 
                        variant="destructive" 
                        onClick={() => handleReject(selectedApp.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" /> 
                        Reject
                      </Button>
                      
                      <Button 
                        variant="default" 
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" /> 
                        Approve
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>App Details</CardTitle>
                    <CardDescription>Select an app to review its details</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-64 text-center p-8">
                    <Package className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      Select an app from the list to review its details and make an approval decision.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Wrap with AdminRoute to ensure only admins can access this page
export default function ProtectedAppApprovalPage() {
  return <AdminRoute path="/admin/app-approval" component={AppApprovalPage} />;
}