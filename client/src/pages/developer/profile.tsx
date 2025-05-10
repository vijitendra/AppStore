import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle2, Code2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Type augmentation for user object in profile page
interface ExtendedUserProfile {
  companyName?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  github?: string;
}

// Note: Developer layout is provided by the protected route
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  twitter: z.string().optional(),
  github: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function DeveloperProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Developer request mutation
  const developerRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/request-developer");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request submitted",
        description: "Your developer account request has been submitted for approval.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to submit developer request. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const requestDeveloperStatus = () => {
    if (window.confirm("Are you sure you want to request developer account status?")) {
      developerRequestMutation.mutate();
    }
  };
  
  // Cast user to have extended profile fields
  const extendedUser = user as typeof user & ExtendedUserProfile;
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: extendedUser?.firstName || "",
      lastName: extendedUser?.lastName || "",
      email: extendedUser?.email || "",
      companyName: extendedUser?.companyName || "",
      bio: extendedUser?.bio || "",
      website: extendedUser?.website || "",
      twitter: extendedUser?.twitter || "",
      github: extendedUser?.github || "",
    },
  });
  
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: ProfileFormValues) {
    profileMutation.mutate(data);
  }
  
  // Get initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  
  return (
    <div className="p-6">
      <Helmet>
        <title>Developer Profile - AppMarket</title>
        <meta name="description" content="Manage your developer profile" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Developer Profile</h1>
        <p className="text-gray-500">Manage your public developer profile information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>How others see you</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-semibold mb-1">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-500 mb-2">{user?.email}</p>
            
            {extendedUser?.companyName && (
              <p className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
                {extendedUser.companyName}
              </p>
            )}
            
            <div className="w-full pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Username</span>
                <span>{user?.username}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Developer Status</span>
                {user?.isDeveloper ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Active
                  </span>
                ) : user?.hasDeveloperRequest ? (
                  <span className="flex items-center text-yellow-600">
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Pending Approval
                  </span>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => requestDeveloperStatus()}
                    disabled={developerRequestMutation.isPending}
                  >
                    {developerRequestMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    Become Developer
                  </Button>
                )}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Account Type</span>
                <span>{user?.isAdmin ? "Admin" : "Developer"}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Member Since</span>
                <span>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your developer details</CardDescription>
              </div>
              <Button 
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your first name" 
                            disabled={!isEditing}
                            {...field} 
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your last name" 
                            disabled={!isEditing}
                            {...field} 
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
                          placeholder="yourname@example.com" 
                          type="email"
                          disabled={!isEditing}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This is your contact email for developer communications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company or Organization (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your company or organization name" 
                          disabled={!isEditing}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell users about yourself and your apps..." 
                          disabled={!isEditing}
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This bio will be shown on your developer page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yourwebsite.com" 
                            disabled={!isEditing}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="@yourusername" 
                            disabled={!isEditing}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Username (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your-github-username" 
                          disabled={!isEditing}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isEditing && (
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={profileMutation.isPending}
                  >
                    {profileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}