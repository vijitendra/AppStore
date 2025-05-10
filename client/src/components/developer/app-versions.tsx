import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppVersion } from "@shared/schema";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Check, X, Edit, Trash2, Upload, FileUp } from "lucide-react";

// Form schema for new version
const versionSchema = z.object({
  version: z.string().min(1, "Version number is required"),
  versionCode: z.coerce.number().min(1, "Version code must be greater than 0"),
  minAndroidVersion: z.string().default("5.0"),
  changeLog: z.string().min(1, "Change log is required"),
});

type VersionFormValues = z.infer<typeof versionSchema>;

interface AppVersionsProps {
  appId: number;
  currentVersion: string;
}

export default function AppVersions({ appId, currentVersion }: AppVersionsProps) {
  const { toast } = useToast();
  const [openNewVersionDialog, setOpenNewVersionDialog] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [extractedMetadata, setExtractedMetadata] = useState<{
    versionName?: string;
    versionCode?: number;
    packageName?: string;
    minSdkVersion?: number;
  } | null>(null);
  
  // Fetch app versions
  const { data: versions, isLoading, error } = useQuery<AppVersion[]>({
    queryKey: [`/api/developer/apps/${appId}/versions`],
    enabled: !!appId,
  });
  
  // Get current live version
  const currentLiveVersion = versions?.find(v => v.isLive);
  
  // Form for new/edit version
  const form = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      version: "",
      versionCode: 1,
      minAndroidVersion: "5.0",
      changeLog: "",
    },
  });
  
  // Handle setting a version as live
  const setLiveVersionMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const response = await fetch(`/api/developer/apps/${appId}/versions/${versionId}/set-live`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set version as live');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Version set as live",
        description: "Users will now see and download this version of your app.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/developer/apps/${appId}/versions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${appId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to set version as live",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle deleting a version
  const deleteVersionMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const response = await fetch(`/api/developer/apps/versions/${versionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete version');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Version deleted",
        description: "The app version has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/developer/apps/${appId}/versions`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete version",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle creating a new version
  const addVersionMutation = useMutation({
    mutationFn: async (data: VersionFormValues) => {
      const formData = new FormData();
      
      if (!apkFile) {
        throw new Error("APK file is required");
      }
      
      // Add file and form data to FormData
      formData.append('apkFile', apkFile);
      formData.append('version', data.version);
      formData.append('versionCode', String(data.versionCode));
      formData.append('minAndroidVersion', data.minAndroidVersion);
      formData.append('changeLog', data.changeLog);
      
      const response = await fetch(`/api/developer/apps/${appId}/versions`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create new version');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "New version created",
        description: "Your app has a new version available.",
      });
      
      // Reset form and close dialog
      form.reset();
      setApkFile(null);
      setOpenNewVersionDialog(false);
      
      queryClient.invalidateQueries({ queryKey: [`/api/developer/apps/${appId}/versions`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create new version",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle updating version changelog
  const updateVersionMutation = useMutation({
    mutationFn: async ({ versionId, changeLog }: { versionId: number, changeLog: string }) => {
      const response = await fetch(`/api/developer/apps/versions/${versionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changeLog }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update version');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Version updated",
        description: "The change log has been updated.",
      });
      
      // Reset form and close dialog
      form.reset();
      setSelectedVersionId(null);
      setIsEditing(false);
      
      queryClient.invalidateQueries({ queryKey: [`/api/developer/apps/${appId}/versions`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update version",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle opening the edit dialog
  const handleEditVersion = (version: AppVersion) => {
    setSelectedVersionId(version.id);
    setIsEditing(true);
    
    form.reset({
      version: version.version,
      versionCode: version.versionCode,
      minAndroidVersion: version.minAndroidVersion,
      changeLog: version.changeLog || "",
    });
  };
  
  // Handle form submission for new version
  const onSubmit = (data: VersionFormValues) => {
    if (isEditing && selectedVersionId) {
      updateVersionMutation.mutate({
        versionId: selectedVersionId,
        changeLog: data.changeLog,
      });
    } else {
      addVersionMutation.mutate(data);
    }
  };
  
  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setApkFile(file);
      
      // Extract metadata from APK file
      setIsExtractingMetadata(true);
      try {
        const formData = new FormData();
        formData.append('apkFile', file);
        
        const response = await fetch(`/api/developer/extract-apk-metadata`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (response.ok) {
          const metadata = await response.json();
          setExtractedMetadata(metadata);
          
          // Update form values with extracted metadata
          form.setValue('version', metadata.versionName || form.getValues('version'));
          form.setValue('versionCode', metadata.versionCode || form.getValues('versionCode'));
          
          // Convert SDK version to Android version if available
          if (metadata.minSdkVersion) {
            const androidVersion = sdkToAndroidVersion(metadata.minSdkVersion);
            if (androidVersion) {
              form.setValue('minAndroidVersion', androidVersion);
            }
          }
          
          toast({
            title: "APK metadata extracted",
            description: "Form has been populated with data from your APK file.",
          });
        }
      } catch (error) {
        console.error('Error extracting APK metadata:', error);
        toast({
          title: "Failed to extract APK metadata",
          description: "Please fill in the form manually.",
          variant: "destructive",
        });
      } finally {
        setIsExtractingMetadata(false);
      }
    }
  };
  
  // Helper function to convert SDK version to Android version
  const sdkToAndroidVersion = (sdkVersion: number): string | undefined => {
    const sdkToVersionMap: Record<number, string> = {
      21: "5.0", 22: "5.1", 23: "6.0", 24: "7.0", 25: "7.1",
      26: "8.0", 27: "8.1", 28: "9.0", 29: "10.0", 30: "11.0",
      31: "12.0", 32: "12.1", 33: "13.0", 34: "14.0"
    };
    return sdkToVersionMap[sdkVersion];
  };
  
  // Format file size in human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Version Management</CardTitle>
          <CardDescription>Manage your app versions</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Version Management</CardTitle>
          <CardDescription>Manage your app versions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Failed to load versions. Please refresh the page and try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Version Management</CardTitle>
            <CardDescription>Manage your app versions</CardDescription>
          </div>
          <Dialog open={openNewVersionDialog} onOpenChange={setOpenNewVersionDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Version
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Version</DialogTitle>
                <DialogDescription>
                  Create a new version of your Android app
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          The version string (e.g., 1.0.0)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="versionCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version Code</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1" 
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Integer value that increases with each version
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minAndroidVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Android Version</FormLabel>
                        <FormControl>
                          <Input placeholder="5.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          The minimum Android version required
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="changeLog"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Change Log</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What's new in this version?"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the changes and improvements in this version
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="apkFile">APK File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="apkFile"
                        type="file"
                        accept=".apk,.aab"
                        onChange={handleFileChange}
                        className="flex-1"
                        disabled={isExtractingMetadata}
                      />
                    </div>
                    {apkFile && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Selected file: {apkFile.name} ({formatFileSize(apkFile.size)})
                        </p>
                        
                        {isExtractingMetadata && (
                          <div className="flex items-center text-sm text-amber-600">
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Extracting metadata from APK...
                          </div>
                        )}
                        
                        {extractedMetadata && !isExtractingMetadata && (
                          <div className="text-sm text-green-600 space-y-1">
                            <p className="flex items-center">
                              <Check className="h-3 w-3 mr-2" />
                              Metadata extracted successfully
                            </p>
                            <ul className="text-xs text-gray-600 ml-5 space-y-1">
                              {extractedMetadata?.versionName && (
                                <li>• Version: {extractedMetadata.versionName}</li>
                              )}
                              {extractedMetadata?.versionCode && (
                                <li>• Version Code: {extractedMetadata.versionCode}</li>
                              )}
                              {extractedMetadata?.minSdkVersion && (
                                <li>• Min SDK: {extractedMetadata.minSdkVersion} (Android {sdkToAndroidVersion(extractedMetadata.minSdkVersion)})</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenNewVersionDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={addVersionMutation.isPending || isExtractingMetadata || !apkFile}
                    >
                      {addVersionMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : isExtractingMetadata ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FileUp className="h-4 w-4 mr-2" />
                          Upload Version
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Version Dialog */}
          <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Version</DialogTitle>
                <DialogDescription>
                  Update version details
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormDescription>
                          The version string cannot be changed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="versionCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version Code</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            disabled
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The version code cannot be changed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minAndroidVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Android Version</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormDescription>
                          The minimum Android version cannot be changed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="changeLog"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Change Log</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What's new in this version?"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the changes and improvements in this version
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateVersionMutation.isPending}
                    >
                      {updateVersionMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {versions && versions.length > 0 ? (
          <Table>
            <TableCaption>List of all versions of your app</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Min Android</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">
                    {version.version}
                    <div className="text-xs text-gray-500 mt-1">
                      Code: {version.versionCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(version.releaseDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{formatFileSize(version.fileSize)}</TableCell>
                  <TableCell>{version.minAndroidVersion}</TableCell>
                  <TableCell>
                    {version.isLive ? (
                      <Badge className="bg-green-600">Live</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* View Changelog Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" title="View Change Log">
                          <span className="sr-only">View Change Log</span>
                          View Changes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Log: Version {version.version}</DialogTitle>
                          <DialogDescription>
                            Released on {format(new Date(version.releaseDate), 'MMMM d, yyyy')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 whitespace-pre-wrap">
                          {version.changeLog || "No change log available."}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Edit Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditVersion(version)}
                      title="Edit Change Log"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    
                    {/* Set as Live Button */}
                    {!version.isLive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLiveVersionMutation.mutate(version.id)}
                        disabled={setLiveVersionMutation.isPending}
                        title="Set as Live Version"
                      >
                        {setLiveVersionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span className="sr-only">Set As Live</span>
                      </Button>
                    )}
                    
                    {/* Delete Button */}
                    {!version.isLive && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete Version"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Version {version.version}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this version
                              of your app from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => deleteVersionMutation.mutate(version.id)}
                              disabled={deleteVersionMutation.isPending}
                            >
                              {deleteVersionMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>Delete</>
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No versions have been added yet.</p>
            <Button
              onClick={() => setOpenNewVersionDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Version
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}