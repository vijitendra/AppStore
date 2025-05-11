import React, { useRef, useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FilmIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Developer layout is provided by the protected route
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100, { message: "Title must be less than 100 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(5000, { message: "Description must be less than 5000 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  tags: z.string().optional(),
});

// Define the video categories
const videoCategories = [
  "Tutorial",
  "Review",
  "Walkthrough",
  "Gameplay",
  "Unboxing",
  "Guide",
  "News",
  "Entertainment",
  "Other"
];

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

export default function VideoEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // File preview references
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // File input reference
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch video data
  console.log("Fetching video with ID:", id);
  const { data: video, isLoading, error } = useQuery<Video>({
    queryKey: ["/api/videos", id],
    enabled: !!id,
    queryFn: async () => {
      console.log("Making API request for video:", id);
      const response = await fetch(`/api/videos/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching video:", response.status, errorText);
        throw new Error(`Failed to fetch video: ${errorText}`);
      }
      const data = await response.json();
      console.log("Received video data:", data);
      return data;
    }
  });
  
  // Set thumbnail preview when data is loaded
  useEffect(() => {
    if (video?.thumbnailPath) {
      setThumbnailPreview(video.thumbnailPath);
    }
  }, [video]);
  
  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video?.title || "",
      description: video?.description || "",
      category: video?.category || "Other",
      tags: video?.tags || "",
    }
  });
  
  // Update form values when video data is loaded
  useEffect(() => {
    if (video) {
      form.reset({
        title: video.title,
        description: video.description,
        category: video.category,
        tags: video.tags || "",
      });
      
      if (video.thumbnailPath) {
        setThumbnailPreview(video.thumbnailPath);
      }
    }
  }, [video, form]);
  
  // Upload updated video metadata mutation
  const updateVideoMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      console.log("Making API request to update video:", id);
      console.log("With data:", values);
      
      // Make the API request directly using fetch for more control
      const response = await fetch(`/api/videos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", response.status, errorText);
        throw new Error(`Update failed: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Update response:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Video updated successfully:", data);
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      // Invalidate all relevant cache entries
      queryClient.invalidateQueries({ queryKey: ["/api/videos", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/developer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      navigate("/developer/videos");
    },
    onError: (error: Error) => {
      console.error("Video update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update video",
        variant: "destructive",
      });
    },
  });
  
  // Upload new thumbnail mutation
  const uploadThumbnailMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      
      // Use apiRequest with FormData flag
      return apiRequest("POST", `/api/videos/${id}/thumbnail`, formData, true).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Thumbnail updated successfully",
      });
      setIsUploading(false);
      setThumbnailPreview(data.thumbnailPath);
      // Invalidate all relevant queries to update the UI everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/videos", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/developer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error: Error) => {
      console.error("Thumbnail upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload thumbnail",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });
  
  // Handle thumbnail file selection
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum thumbnail file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setThumbnailFile(file);
      
      // Create thumbnail preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload thumbnail immediately
      const formData = new FormData();
      formData.append("thumbnailFile", file);
      uploadThumbnailMutation.mutate(formData);
    }
  };
  
  // Handle form submission with detailed logging
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Form submitted with values:", values);
      
      // Validate that we have actual values
      if (!values.title || !values.category) {
        console.error("Missing required values:", values);
        toast({
          title: "Validation Error",
          description: "Please fill out all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Send the update
      console.log("Starting video update mutation");
      await updateVideoMutation.mutateAsync(values);
      
      console.log("Video update completed successfully");
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };
  
  if (isLoading) {
    console.log("Loading video data for ID:", id);
    return (
      <>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <Loader2Icon className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading video data for ID: {id || 'unknown'}...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (error || !video) {
    console.error("Video loading error:", error);
    return (
      <>
        <div className="text-center my-12 p-6 border rounded-lg bg-muted">
          <p className="text-lg font-medium mb-2">Failed to load video</p>
          <p className="text-muted-foreground mb-4">
            We couldn't find the video with ID: {id || 'unknown'}.
            {error && (
              <span className="block mt-2 text-sm text-red-500">
                Error: {error instanceof Error ? error.message : String(error)}
              </span>
            )}
          </p>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/developer/videos")}
            >
              Back to videos
            </Button>
            <div className="text-xs text-muted-foreground mt-4">
              <p>If this issue persists, please try refreshing the page</p>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Video</h1>
        <p className="text-muted-foreground">Update your video information</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear title helps users find your video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your video content" 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide detailed information about your video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {videoCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the most appropriate category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="gaming, tutorial, android" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel className="block mb-2">Thumbnail Image</FormLabel>
                <Card className="cursor-pointer" onClick={() => thumbnailInputRef.current?.click()}>
                  <CardContent className="flex flex-col items-center justify-center py-6 relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailFileChange}
                    />
                    
                    {thumbnailPreview ? (
                      <div className="w-full aspect-video bg-muted overflow-hidden flex items-center justify-center mb-4">
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <FilmIcon className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="font-medium mb-2">
                        {thumbnailFile ? "New Thumbnail Selected" : "Change Thumbnail"}
                      </p>
                      <Button type="button" variant="secondary" size="sm">
                        <UploadIcon className="h-4 w-4 mr-1" />
                        {thumbnailFile ? "Change Again" : "Upload New Thumbnail"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading thumbnail...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/developer/videos")}
                  disabled={isUploading || updateVideoMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || updateVideoMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Video Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Video ID</p>
                  <p>{video.id}</p>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Upload Date</p>
                  <p>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Duration</p>
                  <p>{typeof video.duration === 'number' ? formatDuration(video.duration) : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Views</p>
                  <p>{typeof video.viewCount === 'number' ? video.viewCount.toLocaleString() : '0'}</p>
                </div>
                
                <div className="pt-2">
                  <div className="h-px bg-border mb-4"></div>
                  <h4 className="font-medium mb-2">Video Link</h4>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={`${window.location.origin}/videos/${video.id}`} 
                      readOnly 
                      onClick={(e) => {
                        e.currentTarget.select();
                        console.log("Video link selected:", `${window.location.origin}/videos/${video.id}`);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const videoLink = `${window.location.origin}/videos/${video.id}`;
                        navigator.clipboard.writeText(videoLink);
                        console.log("Copied video link to clipboard:", videoLink);
                        toast({
                          title: "Copied to clipboard",
                          description: "Video link has been copied",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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