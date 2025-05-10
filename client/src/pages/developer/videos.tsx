import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
// Developer layout is provided by the protected route
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilmIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Video {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string;
  thumbnailPath: string;
  videoPath: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DeveloperVideosPage() {
  const { toast } = useToast();
  
  const { 
    data: videos, 
    isLoading, 
    isError 
  } = useQuery<Video[]>({
    queryKey: ["/api/videos/developer"],
    retry: 1
  });
  
  const handleDeleteVideo = async (id: number) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/videos/${id}`);
      
      toast({
        title: "Video deleted",
        description: "The video has been permanently removed",
      });
      
      // Invalidate and refetch videos
      queryClient.invalidateQueries({ queryKey: ["/api/videos/developer"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the video. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Videos</h1>
          <p className="text-muted-foreground">Manage your video content</p>
        </div>
        <Button asChild>
          <Link href="/developer/video-upload">
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload New Video
          </Link>
        </Button>
      </div>
      
      {isLoading && (
        <div className="text-center my-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your videos...</p>
        </div>
      )}
      
      {isError && (
        <div className="text-center my-12 p-6 border rounded-lg bg-muted">
          <p className="text-lg font-medium mb-2">Failed to load videos</p>
          <p className="text-muted-foreground mb-4">There was an error loading your videos. Please try again later.</p>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/videos/developer"] })}
          >
            Retry
          </Button>
        </div>
      )}
      
      {videos && videos.length === 0 && !isLoading && !isError && (
        <div className="text-center my-12 p-8 border rounded-lg bg-muted">
          <FilmIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-6">You haven't uploaded any videos yet. Start sharing content with your audience today.</p>
          <Button asChild>
            <Link href="/developer/video-upload">
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload Your First Video
            </Link>
          </Button>
        </div>
      )}
      
      {videos && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-muted overflow-hidden">
                {video.thumbnailPath ? (
                  <img 
                    src={video.thumbnailPath}
                    alt={video.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FilmIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{video.title}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <span>{format(new Date(video.createdAt), 'MMM d, yyyy')}</span>
                  <span className="mx-1">•</span>
                  <span>{video.viewCount} views</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link href={`/developer/video-edit/${video.id}`}>
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

// Helper function to format video duration
function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}