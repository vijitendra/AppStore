import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Share2, 
  Download, 
  Flag, 
  ArrowLeft, 
  Star, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import VersionHistory from "@/components/app/version-history";

export default function AppDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("about");
  
  // Fetch app details
  const { data: app, isLoading, error } = useQuery({
    queryKey: [`/api/apps/${id}`],
    enabled: !!id,
  });
  
  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/apps/${id}/reviews`],
    enabled: !!id,
  });
  
  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/apps/${id}/download`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Downloading",
        description: "Your APK download has started.",
      });
      
      // Use the direct download URL that triggers auto-installation on Android
      if (data.downloadUrl) {
        try {
          console.log("Starting APK download from:", data.downloadUrl);
          
          // For APK files, we need to ensure the browser downloads rather than opens
          // Open in a new window/tab to initiate the download without affecting navigation
          const sanitizedAppName = (app?.name || 'application').replace(/[^a-zA-Z0-9]/g, '_');
          const filename = `${sanitizedAppName}_v${app?.version || '1.0'}.apk`;
          
          // Log the download attempt
          console.log(`Attempting to download ${filename}`);
          
          // Create a direct download without changing the page navigation
          window.open(data.downloadUrl, '_blank');
          
          // Additional toast to guide user
          toast({
            title: "Download Started",
            description: "Check your browser's download manager if the download doesn't start automatically",
          });
        } catch (error) {
          console.error("Download error:", error);
          toast({
            title: "Download failed",
            description: "Could not start the download. Please try again or check your browser settings.",
            variant: "destructive",
          });
        }
      } else if (app?.filePath) {
        // Fallback to the old method if downloadUrl is not provided
        toast({
          title: "Using fallback download method",
          description: "Opening APK file in a new tab"
        });
        window.open(app.filePath, "_blank");
      }
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: app?.name,
        text: app?.shortDescription || app?.description,
        url: window.location.href,
      }).catch(err => {
        toast({
          title: "Sharing failed",
          description: "Could not share this app.",
          variant: "destructive",
        });
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied",
          description: "App link copied to clipboard!",
        });
      });
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 px-4 container mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center mb-4">
                <Skeleton className="h-20 w-20 rounded-xl mr-4" />
                <div>
                  <Skeleton className="h-7 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-xl mb-4" />
              <Skeleton className="h-10 w-full rounded-full mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-1/2 rounded-full" />
                <Skeleton className="h-10 w-1/2 rounded-full" />
              </div>
            </div>
            
            <div className="md:w-2/3">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !app) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 px-4 container mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
            <p className="text-gray-600 mb-6">The app you're looking for could not be found.</p>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{app.name} - AppMarket</title>
        <meta name="description" content={app.shortDescription || app.description.substring(0, 160)} />
        <meta property="og:title" content={`${app.name} - AppMarket`} />
        <meta property="og:description" content={app.shortDescription || app.description.substring(0, 160)} />
        <meta property="og:image" content={app.iconUrl} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 px-4 container mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column */}
            <div className="md:w-1/3">
              <div className="flex items-center mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden mr-4 bg-gray-100">
                  <img src={app.iconUrl} alt={`${app.name} icon`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{app.name}</h1>
                  <p className="text-gray-500">
                    {app.developer?.firstName && app.developer?.lastName 
                      ? `${app.developer.firstName} ${app.developer.lastName}`
                      : app.developer?.username || "Unknown Developer"}
                  </p>
                  
                  {/* Show app approval status */}
                  <div className="mt-2 flex items-center gap-2">
                    {app.isApproved ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    )}
                    
                    {app.isSuspended && (
                      <Badge variant="destructive">
                        <Ban className="h-3 w-3 mr-1" />
                        Suspended
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Show rejection reason if app was rejected */}
              {app.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</h4>
                  <p className="text-sm text-red-600">{app.rejectionReason}</p>
                </div>
              )}
              
              {app.screenshotUrls && app.screenshotUrls.length > 0 && (
                <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={app.screenshotUrls[0]} 
                    alt={`${app.name} screenshot`} 
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{app.rating || "New"}</span>
                  {app.reviewCount > 0 && (
                    <span className="text-gray-500 text-sm ml-1">({app.reviewCount} reviews)</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{app.downloads.toLocaleString()} downloads</div>
              </div>
              
              <Button 
                className="w-full mb-3" 
                onClick={() => downloadMutation.mutate()}
                disabled={downloadMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadMutation.isPending ? "Starting Download..." : "Download APK"}
              </Button>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="flex-1">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
            
            {/* Right column */}
            <div className="md:w-2/3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="versions">Version History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about">
                  <div className="mb-6">
                    <h2 className="font-bold text-lg mb-2">About</h2>
                    <p className="text-gray-700 mb-4">{app.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{app.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="font-bold text-lg mb-2">Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm">Size</p>
                        <p className="font-medium">{formatFileSize(app.fileSize)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Version</p>
                        <p className="font-medium">{app.version}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Updated</p>
                        <p className="font-medium">{new Date(app.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Android</p>
                        <p className="font-medium">{app.minAndroidVersion} and up</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="font-bold text-lg mb-2">Developer</h2>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={app.developer?.profilePicture || ""} />
                          <AvatarFallback>
                            {app.developer?.firstName && app.developer?.lastName 
                              ? `${app.developer.firstName[0]}${app.developer.lastName[0]}`.toUpperCase()
                              : app.developer?.username?.substring(0, 2).toUpperCase() || "DEV"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {app.developer?.firstName && app.developer?.lastName 
                              ? `${app.developer.firstName} ${app.developer.lastName}`
                              : app.developer?.username || "Unknown Developer"}
                          </h3>
                          <p className="text-sm text-gray-500">Developer since {new Date(app.createdAt).getFullYear()}</p>
                        </div>
                      </div>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm" 
                        onClick={() => navigate(`/apps/developer/${app.developerId}`)}
                      >
                        <span className="flex items-center">
                          View all apps by this developer
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div>
                    <h2 className="font-bold text-lg mb-4">Reviews</h2>
                    
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <p className="text-gray-500 mb-2">No reviews yet</p>
                        <p className="text-sm text-gray-400">Be the first to leave a review</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={review.user?.profilePicture || ""} />
                                <AvatarFallback>
                                  {review.user?.firstName && review.user?.lastName 
                                    ? `${review.user.firstName[0]}${review.user.lastName[0]}`.toUpperCase()
                                    : review.user?.username?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {review.user?.firstName && review.user?.lastName 
                                    ? `${review.user.firstName} ${review.user.lastName}`
                                    : review.user?.username || "User"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="ml-auto flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span>{review.rating}</span>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="versions">
                  <div>
                    <h2 className="font-bold text-lg mb-4">Version History</h2>
                    <VersionHistory appId={id} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
