import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FilmIcon, UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

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

export default function VideoUploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // File preview references
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // File input references
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: "",
    },
  });
  
  // Upload video mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsUploading(true);
      
      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open("POST", "/api/videos", true);
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error("Invalid response format"));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.message || "Upload failed"));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = () => {
          reject(new Error("Network error occurred"));
        };
        
        xhr.onabort = () => {
          reject(new Error("Upload aborted"));
        };
        
        xhr.send(data);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
      setIsUploading(false);
      navigate("/developer/videos");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });
  
  // Handle video file selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid file",
          description: "Please select a valid video file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum video file size is 500MB",
          variant: "destructive",
        });
        return;
      }
      
      setVideoFile(file);
    }
  };
  
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
    }
  };
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!videoFile) {
      toast({
        title: "Missing video",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!thumbnailFile) {
      toast({
        title: "Missing thumbnail",
        description: "Please select a thumbnail image for your video",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    
    // Add form values
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("category", values.category);
    if (values.tags) formData.append("tags", values.tags);
    
    // Add files
    formData.append("videoFile", videoFile);
    formData.append("thumbnailFile", thumbnailFile);
    
    // Start upload
    uploadMutation.mutate(formData);
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Video</h1>
        <p className="text-muted-foreground">Share your content with the community</p>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel className="block mb-2">Video File</FormLabel>
                  <Card className="cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        ref={videoInputRef}
                        onChange={handleVideoFileChange}
                      />
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <FilmIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium mb-1">
                          {videoFile ? videoFile.name : "Select Video File"}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {videoFile 
                            ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` 
                            : "MP4, MOV, or WebM (max 500MB)"}
                        </p>
                        <Button type="button" variant="secondary" size="sm">
                          <UploadIcon className="h-4 w-4 mr-1" />
                          {videoFile ? "Change Video" : "Select Video"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                          <UploadIcon className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <p className="font-medium mb-1">
                          {thumbnailFile ? thumbnailFile.name : "Select Thumbnail"}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {thumbnailFile 
                            ? `${(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB` 
                            : "JPEG, PNG, or WebP (max 5MB)"}
                        </p>
                        <Button type="button" variant="secondary" size="sm">
                          <UploadIcon className="h-4 w-4 mr-1" />
                          {thumbnailFile ? "Change Thumbnail" : "Select Thumbnail"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
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
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || uploadMutation.isPending}
                >
                  Upload Video
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Upload Guidelines</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  <span>Maximum video file size is 500MB</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  <span>Supported formats: MP4, MOV, WebM</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  <span>Add a clear thumbnail image for better visibility</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                  <span>Use a descriptive title and detailed description</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                  <span>Add relevant tags to help users discover your content</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">6</span>
                  <span>Select the most appropriate category</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}