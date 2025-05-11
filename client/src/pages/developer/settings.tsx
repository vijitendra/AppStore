import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Shield, BellRing, Mail, Bell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
// Main layout is provided by DeveloperRoute component

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  appUpdates: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
  emailDigestFrequency: z.string(),
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export default function DeveloperSettingsPage() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("security");
  
  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      appUpdates: true,
      securityAlerts: true,
      marketingEmails: false,
      emailDigestFrequency: "weekly",
    },
  });
  
  // This would be replaced with a real API mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const res = await apiRequest("PUT", "/api/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    },
  });
  
  // This would be replaced with a real API mutation
  const notificationsMutation = useMutation({
    mutationFn: async (data: NotificationsFormValues) => {
      const res = await apiRequest("PUT", "/api/user/notification-settings", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to save notification settings.",
        variant: "destructive",
      });
    },
  });
  
  function onSecuritySubmit(data: SecurityFormValues) {
    passwordMutation.mutate(data);
  }
  
  function onNotificationsSubmit(data: NotificationsFormValues) {
    notificationsMutation.mutate(data);
  }
  
  const handleDeleteAccount = () => {
    // This would show a confirmation dialog in a real implementation
    toast({
      title: "Account deletion",
      description: "This feature is not implemented in this demo.",
      variant: "destructive",
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Settings - Developer Dashboard</title>
        <meta 
          name="description" 
          content="Manage your developer account settings" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
        <p className="text-gray-500">Manage your account security and preferences</p>
      </div>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "security"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "notifications"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "account"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>
      </div>
      
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <CardTitle>Password & Security</CardTitle>
              </div>
              <CardDescription>
                Change your password and manage security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            At least 8 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-primary mr-2" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">Enable 2FA</h4>
                  <p className="text-sm text-gray-500">
                    Protect your account with two-factor authentication
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <CardTitle>Access Security</CardTitle>
              </div>
              <CardDescription>
                Manage your device history and sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-md">
                      <div>
                        <p className="font-medium">Current Device</p>
                        <p className="text-xs text-gray-500">
                          Last active: Just now
                        </p>
                      </div>
                      <Badge>Current</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">iPhone 13 Pro</p>
                        <p className="text-xs text-gray-500">
                          Last active: 2 days ago
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Log Out</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button variant="destructive">Log Out All Devices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <BellRing className="h-5 w-5 text-primary mr-2" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationsForm}>
              <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                <FormField
                  control={notificationsForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications via email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="ml-6 space-y-4">
                  <FormField
                    control={notificationsForm.control}
                    name="appUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>App Updates</FormLabel>
                          <FormDescription>
                            Notifications about app status changes and updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!notificationsForm.watch("emailNotifications")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="securityAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Security Alerts</FormLabel>
                          <FormDescription>
                            Important notifications about your account security
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!notificationsForm.watch("emailNotifications")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Marketing Emails</FormLabel>
                          <FormDescription>
                            Receive emails about new features and promotions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!notificationsForm.watch("emailNotifications")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={notificationsForm.control}
                  name="emailDigestFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Digest Frequency</FormLabel>
                      <Select
                        disabled={!notificationsForm.watch("emailNotifications")}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often you'd like to receive digest emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={notificationsMutation.isPending}
                >
                  {notificationsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {activeTab === "account" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Username</p>
                    <p className="text-gray-600">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Name</p>
                    <p className="text-gray-600">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Account Type</p>
                    <p className="text-gray-600">
                      {user?.isAdmin 
                        ? "Admin" 
                        : user?.isDeveloper 
                          ? "Developer" 
                          : "Regular User"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive border-2">
            <CardHeader className="text-destructive">
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription className="text-destructive/70">
                These actions are irreversible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Delete Account</h4>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all your data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
