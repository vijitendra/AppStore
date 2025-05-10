import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, ChevronRight, Download, Star, Calendar, Package, Film, Video, Play, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppStats from "@/components/developer/app-stats";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import DeveloperLayout from "@/components/developer/developer-layout";

export default function DeveloperDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch developer's apps
  const { data: apps = [], isLoading: appsLoading } = useQuery<any[]>({
    queryKey: ["/api/developer/apps"],
  });
  
  // Fetch developer's videos
  const { data: videos = [], isLoading: videosLoading } = useQuery<any[]>({
    queryKey: ["/api/videos/developer"],
  });
  
  // Calculate total downloads
  const totalDownloads = apps.reduce((sum: number, app: any) => sum + app.downloads, 0);
  
  // Calculate average rating
  const avgRating = apps.length 
    ? (apps.reduce((sum: number, app: any) => sum + (app.rating || 0), 0) / apps.length).toFixed(1) 
    : "N/A";
  
  const isLoading = appsLoading || videosLoading;
  
  const dashboardContent = (
    <>
      <Helmet>
        <title>Developer Dashboard - AppMarket</title>
        <meta name="description" content="Manage your apps, track downloads and user engagement in the AppMarket developer dashboard." />
      </Helmet>
      
      {/* Only show header on desktop screens, hidden on mobile */}
      <div className="hidden lg:block">{/* Hide on mobile/tablet */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl xl:text-2xl font-bold">Developer Dashboard</h1>
            <p className="text-gray-500 text-sm xl:text-base">Welcome, {user?.firstName || user?.username}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              onClick={() => navigate("/developer/video-upload")} 
              variant="outline"
              size="sm"
              className="text-sm"
            >
              <Film className="h-4 w-4 mr-1.5" />
              Upload Video
            </Button>
            <Button 
              onClick={() => navigate("/developer/app/upload")}
              size="sm"
              className="text-sm"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Upload App
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:inline-flex h-auto overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-1.5 px-2 sm:px-3">Overview</TabsTrigger>
          <TabsTrigger value="apps" className="text-xs sm:text-sm py-1.5 px-2 sm:px-3">My Apps</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs sm:text-sm py-1.5 px-2 sm:px-3">My Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-3 sm:p-4 sm:pt-5">
                    <div className="flex items-center">
                      <div className="rounded-full p-2 sm:p-3 bg-blue-100">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Published Apps</p>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{apps.length}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="p-3 sm:p-4 sm:pt-5">
                    <div className="flex items-center">
                      <div className="rounded-full p-2 sm:p-3 bg-green-100">
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Total Downloads</p>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{totalDownloads.toLocaleString()}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-yellow-50 to-white">
                  <CardContent className="p-3 sm:p-4 sm:pt-5">
                    <div className="flex items-center">
                      <div className="rounded-full p-2 sm:p-3 bg-yellow-100">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Average Rating</p>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{avgRating}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {videos.length > 0 && (
                  <Card className="bg-gradient-to-br from-indigo-50 to-white">
                    <CardContent className="p-3 sm:p-4 sm:pt-5">
                      <div className="flex items-center">
                        <div className="rounded-full p-2 sm:p-3 bg-indigo-100">
                          <Film className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-indigo-600" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <p className="text-gray-500 text-xs sm:text-sm">Published Videos</p>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{videos.length}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {videos.length === 0 && (
                  <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-3 sm:p-4 sm:pt-5">
                      <div className="flex items-center">
                        <div className="rounded-full p-2 sm:p-3 bg-purple-100">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <p className="text-gray-500 text-xs sm:text-sm">Latest Update</p>
                          <h3 className="text-sm sm:text-base md:text-lg font-bold truncate">
                            {apps.length ? formatDistanceToNow(new Date(apps[0].updatedAt), { addSuffix: true }) : "N/A"}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
          
          {!isLoading && (
            <>
              {/* Dynamic welcome message based on content */}
              {apps.length === 0 && videos.length === 0 ? (
                <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">Welcome to your Developer Dashboard</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Get started by uploading your first app or video to the marketplace.</CardDescription>
                  </CardHeader>
                  {/* Show buttons on all devices */}
                  <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button 
                      onClick={() => navigate("/developer/app/upload")}
                      size="sm"
                      className="sm:flex-1 text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                    >
                      <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Upload Your First App</span>
                    </Button>
                    <Button 
                      onClick={() => navigate("/developer/video-upload")} 
                      variant="outline"
                      size="sm" 
                      className="sm:flex-1 text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                    >
                      <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Upload Your First Video</span>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">Performance Overview</h2>
                  {apps.length > 0 ? (
                    <AppStats apps={apps} />
                  ) : (
                    <Card className="p-4 sm:p-6">
                      <div className="text-center p-2 sm:p-4">
                        <LayoutGrid className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No App Performance Data Yet</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Upload an app to start tracking performance metrics</p>
                        <Button 
                          onClick={() => navigate("/developer/app/upload")}
                          size="sm"
                          className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                        >
                          <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="truncate">Upload App</span>
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Recent Apps Section */}
                <div>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-bold">Recent Apps</h2>
                    {apps.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab("apps")} 
                        className="text-primary text-xs sm:text-sm h-auto py-1 sm:py-1.5 px-2 sm:px-3"
                      >
                        View All
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                  
                  {apps.length === 0 ? (
                    <Card className="p-4 sm:p-6 text-center">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">You haven't uploaded any apps yet.</p>
                      <Button 
                        onClick={() => navigate("/developer/app/upload")} 
                        size="sm"
                        className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                      >
                        <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Upload App</span>
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {apps.slice(0, 3).map(app => (
                        <Card key={app.id} className="cursor-pointer hover:bg-gray-50 transition-colors" 
                          onClick={() => navigate(`/developer/app/${app.id}`)}>
                          <CardContent className="p-3 sm:p-4 flex items-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 mr-3 sm:mr-4 flex-shrink-0">
                              <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="font-medium text-sm sm:text-base truncate">{app.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">Last updated {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}</p>
                            </div>
                            <div className="flex flex-col items-end ml-2 sm:ml-3 flex-shrink-0">
                              <div className="flex items-center mb-1 sm:mb-2">
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                                <span className="text-xs sm:text-sm text-gray-600">{app.downloads.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
                                <span className="text-xs sm:text-sm text-gray-600">{app.rating || "N/A"}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Recent Videos Section */}
                <div>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-bold">Recent Videos</h2>
                    {videos.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab("videos")} 
                        className="text-primary text-xs sm:text-sm h-auto py-1 sm:py-1.5 px-2 sm:px-3"
                      >
                        View All
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                  
                  {videos.length === 0 ? (
                    <Card className="p-4 sm:p-6 text-center">
                      <Film className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">You haven't uploaded any videos yet.</p>
                      <Button 
                        onClick={() => navigate("/developer/video-upload")} 
                        size="sm"
                        className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                      >
                        <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Upload Video</span>
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {videos.slice(0, 3).map((video: any) => (
                        <Card key={video.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => navigate(`/developer/video-edit/${video.id}`)}>
                          <CardContent className="p-3 sm:p-4 flex items-center">
                            <div className="w-16 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden bg-gray-100 mr-3 sm:mr-4 flex items-center justify-center relative flex-shrink-0">
                              {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                  <Play className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="font-medium text-sm sm:text-base truncate">{video.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">
                                Created {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="apps">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold">Your Apps</h2>
              <Button 
                onClick={() => navigate("/developer/app/upload")} 
                size="sm"
                className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
              >
                <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Upload New App</span>
              </Button>
            </div>
            
            {apps.length === 0 ? (
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">You haven't uploaded any apps yet.</p>
                  <Button 
                    onClick={() => navigate("/developer/app/upload")}
                    size="sm"
                    className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                  >
                    <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Upload Your First App</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {apps.map(app => (
                  <Card key={app.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/developer/app/${app.id}`)}>
                    <CardContent className="p-3 sm:p-4 flex items-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 mr-3 sm:mr-4 flex-shrink-0">
                        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{app.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{app.shortDescription || app.category}</p>
                        <div className="mt-1 flex flex-wrap items-center text-xs sm:text-sm text-gray-500">
                          <span className="mr-2 sm:mr-3 truncate">v{app.version}</span>
                          <span className="truncate">Updated {new Date(app.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-2 sm:ml-3 flex-shrink-0">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                          <span className="text-xs sm:text-sm text-gray-600">{app.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
                          <span className="text-xs sm:text-sm text-gray-600">{app.rating || "N/A"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold">Your Videos</h2>
              <Button 
                onClick={() => navigate("/developer/video-upload")}
                size="sm"
                className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
              >
                <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Upload New Video</span>
              </Button>
            </div>
            
            {videos.length === 0 ? (
              <Card>
                <CardContent className="p-4 sm:p-6 text-center">
                  <Film className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">You haven't uploaded any videos yet.</p>
                  <Button 
                    onClick={() => navigate("/developer/video-upload")}
                    size="sm"
                    className="text-xs sm:text-sm h-auto py-1.5 sm:py-2"
                  >
                    <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Upload Your First Video</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {videos.map((video: any) => (
                  <Card key={video.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/developer/video-edit/${video.id}`)}>
                    <CardContent className="p-3 sm:p-4 flex items-center">
                      <div className="w-16 h-10 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-gray-100 mr-3 sm:mr-4 flex items-center justify-center relative flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <Play className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{video.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{video.description || ''}</p>
                        <div className="mt-1 flex items-center text-xs sm:text-sm text-gray-500">
                          <span className="truncate">Created {new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-2 sm:ml-3 flex-shrink-0">
                        <div className="flex items-center">
                          <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                          <span className="text-xs sm:text-sm text-gray-600">{video.tags?.length || 0} tags</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
  
  // Return content directly since DeveloperRoute already provides the layout
  return dashboardContent;
}