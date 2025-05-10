import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/developer/sidebar";
import AppForm from "@/components/developer/app-form";
import AppVersions from "@/components/developer/app-versions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppEditPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch app details
  const { data: app, isLoading, error } = useQuery({
    queryKey: [`/api/apps/${id}`],
    enabled: !!id,
  });
  
  // Update app mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/developer/apps/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update app');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "App updated successfully",
        description: "Your app has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/developer/apps"] });
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${id}`] });
      navigate("/developer");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete app mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/developer/apps/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Provide more detailed error information
          throw new Error(data.message || 'Failed to delete app');
        }
        
        return data;
      } catch (err) {
        // Handle any JSON parsing errors or network issues
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error('An unexpected error occurred while deleting the app');
        }
      }
    },
    onSuccess: (data) => {
      toast({
        title: "App deleted successfully",
        description: data.message || "Your app has been removed from the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/developer/apps"] });
      navigate("/developer");
    },
    onError: (error: Error) => {
      console.error("App deletion error:", error);
      toast({
        title: "Deletion failed",
        description: error.message.includes("foreign key constraint") 
          ? "This app cannot be deleted because it has associated reviews or other related data."
          : error.message,
        variant: "destructive",
        duration: 5000, // Show for a longer time so user can read the message
      });
    },
  });
  
  const handleSubmit = (formData: FormData) => {
    updateMutation.mutate(formData);
  };
  
  const handleDelete = () => {
    deleteMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !app) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/developer")} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
              <p className="text-gray-500 mb-6">The app you're trying to edit could not be found or you don't have permission to edit it.</p>
              <Button onClick={() => navigate("/developer")}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Edit {app.name} - Developer Dashboard - AppMarket</title>
        <meta name="description" content={`Edit your app ${app.name} on AppMarket. Update app information, screenshots, and APK file.`} />
      </Helmet>
      
      <div className="min-h-screen flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/developer")} className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">Edit App: {app.name}</h1>
                <p className="text-gray-500">Update your app information and manage versions</p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete App
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The app will be permanently removed from the marketplace.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Tabs defaultValue="app-info" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="app-info">App Info</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="app-info">
                <AppForm 
                  app={app} 
                  onSubmit={handleSubmit} 
                  isSubmitting={updateMutation.isPending} 
                />
              </TabsContent>
              
              <TabsContent value="versions">
                <AppVersions 
                  appId={Number(id)} 
                  currentVersion={app.version}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
