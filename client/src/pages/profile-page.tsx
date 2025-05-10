import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Camera, Upload } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Developer request mutation
  const developerRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/request-developer");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Submitted",
        description: "Your developer access request has been submitted for review.",
        variant: "default",
      });
      
      // Update user data in the cache with the developer request flag
      const currentUser = queryClient.getQueryData<any>(["/api/user"]);
      if (currentUser) {
        queryClient.setQueryData(["/api/user"], {
          ...currentUser,
          hasDeveloperRequest: true,
          developerRequestDate: new Date().toISOString()
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit developer request",
        variant: "destructive",
      });
    },
  });
  
  // Handle developer request
  const handleDeveloperRequest = () => {
    if (window.confirm("Are you sure you want to request developer access? This will be reviewed by an administrator.")) {
      developerRequestMutation.mutate();
    }
  };
  
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [authLoading, user, setLocation]);
  
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    },
  });
  
  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/user/profile`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
      queryClient.setQueryData(["/api/user"], data);
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  // Profile picture upload mutation
  const profilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload profile picture");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
        variant: "default",
      });
      
      // Update user data in the cache with the new profile picture
      const currentUser = queryClient.getQueryData<any>(["/api/user"]);
      if (currentUser) {
        queryClient.setQueryData(["/api/user"], {
          ...currentUser,
          profilePicture: data.profilePicture
        });
      }
      
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };
  
  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else {
      return user.username.substring(0, 2).toUpperCase();
    }
  };
  
  // Handle profile picture upload
  const handleProfilePictureUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      profilePictureMutation.mutate(file);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile - AppMarket</title>
        <meta 
          name="description" 
          content="Manage your AppMarket profile settings" 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.profilePicture || ""} />
                      <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={handleProfilePictureUpload}
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  
                  {/* Hidden file input for profile picture upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleProfilePictureUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </>
                    )}
                  </Button>
                  
                  <div className="flex flex-col w-full mt-6 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Account Type:</span>
                      <span className="font-medium">
                        {user.isAdmin && "Admin"}
                        {!user.isAdmin && user.isDeveloper && "Developer"}
                        {!user.isAdmin && !user.isDeveloper && "User"}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Username:</span>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {user.isDeveloper && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Developer Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setLocation("/developer")}
                    >
                      Go to Developer Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {!user.isDeveloper && !user.hasDeveloperRequest && (
                <Card className="mt-6 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle>Become a Developer</CardTitle>
                    <CardDescription>
                      Request developer access to publish apps on our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={handleDeveloperRequest}
                      disabled={developerRequestMutation.isPending}
                    >
                      {developerRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>Request Developer Access</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {!user.isDeveloper && user.hasDeveloperRequest && (
                <Card className="mt-6 border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 text-yellow-600 animate-spin" />
                      Request Pending
                    </CardTitle>
                    <CardDescription>
                      Your developer access request is pending approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-700">
                      An administrator will review your request soon. You'll be notified when your request is approved.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {user.isAdmin && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Admin Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setLocation("/admin")}
                    >
                      Go to Admin Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="md:col-span-8">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your account settings
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form 
                      onSubmit={form.handleSubmit(onSubmit)} 
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  disabled={!isEditing}
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Doe" 
                                  disabled={!isEditing}
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="johnDoe@example.com" 
                                disabled={!isEditing}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              We'll never share your email with anyone else.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="johndoe" 
                                disabled={!isEditing}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {isEditing && (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              form.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={profileMutation.isPending}
                          >
                            {profileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto"
                    onClick={() => toast({
                      title: "Coming soon",
                      description: "This feature will be available in a future update.",
                    })}
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}