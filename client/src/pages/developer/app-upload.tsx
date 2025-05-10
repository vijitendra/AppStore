import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, Upload, ImagePlus, PlusCircle, X, FileCode, FileArchive, Search, Download, Info as InfoIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
// Developer layout is provided by DeveloperRoute
import { appCategories, appUploadSchema } from "@shared/schema";
// No longer using APK extraction
// import { sdkToAndroidVersion, type ApkMetadata } from "@/lib/apk-extractor";
import { fetchPlayStoreInfo, downloadImageAsFile } from "@/lib/play-store-api";

type AppUploadFormValues = z.infer<typeof appUploadSchema> & {
  apkFile: FileList;
  icon: FileList;
  banner?: FileList;
  screenshots: FileList;
};

export default function AppUploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);
  const [packageNameToImport, setPackageNameToImport] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Create a base schema first without the refine method
  const baseSchema = z.object({
    name: z.string().min(1, "App name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    shortDescription: z.string().optional(),
    version: z.string().optional(),
    versionCode: z.number().optional(),
    packageName: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    minAndroidVersion: z.string().default("5.0"),
    changeLog: z.string().optional(),
  });

  const form = useForm<AppUploadFormValues>({
    resolver: zodResolver(
      z.object({
        ...baseSchema.shape,
        apkFile: z.instanceof(FileList).refine(files => files.length === 1, {
          message: "APK file is required",
        }),
        icon: z.instanceof(FileList).refine(files => files.length === 1, {
          message: "App icon is required",
        }),
        banner: z.instanceof(FileList).optional(),
        screenshots: z.instanceof(FileList).refine(files => files.length >= 1 && files.length <= 5, {
          message: "At least 1 and at most 5 screenshots are required",
        }),
      })
    ),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      version: "1.0.0",
      versionCode: 1,
      packageName: "",
      category: "",
      minAndroidVersion: "5.0",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: AppUploadFormValues) => {
      const formData = new FormData();

      // Add all form fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'apkFile' && key !== 'icon' && key !== 'banner' && key !== 'screenshots') {
          // For number fields, ensure they're sent as strings
          if (key === 'versionCode') {
            formData.append(key, String(value));
          } else {
            formData.append(key, value as string);
          }
          console.log(`Appending form field: ${key} = ${value}`); // Debug log
        }
      });

      // Add files
      formData.append('apkFile', data.apkFile[0]);
      formData.append('icon', data.icon[0]);
      
      // Add banner if provided
      if (data.banner && data.banner.length > 0) {
        formData.append('banner', data.banner[0]);
      }

      // Add screenshots
      for (let i = 0; i < data.screenshots.length; i++) {
        formData.append('screenshots', data.screenshots[i]);
      }

      const response = await fetch('/api/developer/apps', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('App upload error details:', errorData);

        // Create a more detailed error message
        let errorMessage = errorData.message || 'Failed to upload app';

        // If we have validation errors, add them to the message
        if (errorData.errors && errorData.errors.length > 0) {
          const fieldErrors = errorData.errors.map((err: any) => {
            return `${err.path.join('.')}: ${err.message}`;
          }).join(', ');

          errorMessage += `: ${fieldErrors}`;
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "App uploaded successfully",
        description: "Your app has been uploaded and is now pending review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/developer/apps"] });
      navigate("/developer");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to ensure required fields have values (used in form submission)
  const ensureRequiredFields = () => {
    // Ensure we have at least the required fields for form validation
    if (!form.getValues('name') || form.getValues('name').trim() === '') {
      const filename = form.getValues('apkFile')?.[0]?.name;
      if (filename) {
        // Extract app name from filename (remove extension and transform)
        const nameFromFile = filename.replace(/\.(apk|aab)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase words

        form.setValue('name', nameFromFile);
        console.log('Using filename as app name:', nameFromFile);
      } else {
        form.setValue('name', 'My App'); // Fallback
      }
    }

    // Ensure we have a description
    if (!form.getValues('description') || form.getValues('description').trim() === '' || 
        form.getValues('description').length < 10) {
      const desc = `Welcome to ${form.getValues('name')}. This mobile application provides users with an engaging experience.`;
      form.setValue('description', desc);
      console.log('Setting default description');
    }

    // Ensure short description
    if (!form.getValues('shortDescription') || (form.getValues('shortDescription') || '').trim() === '') {
      form.setValue('shortDescription', `Welcome to ${form.getValues('name') || 'My App'}`);
    }

    // Ensure change log
    if (!form.getValues('changeLog') || (form.getValues('changeLog') || '').trim() === '') {
      form.setValue('changeLog', `Initial release of ${form.getValues('name') || 'My App'}`);
    }

    // Ensure category
    if (!form.getValues('category') || form.getValues('category').trim() === '') {
      form.setValue('category', 'Games');
    }

    // Ensure version info is filled
    const currentVersion = form.getValues('version');
    if (!currentVersion || typeof currentVersion !== 'string' || currentVersion.trim() === '') {
      form.setValue('version', '1.0.0');
    }

    const currentVersionCode = form.getValues('versionCode');
    if (!currentVersionCode || typeof currentVersionCode !== 'number' || currentVersionCode <= 0) {
      form.setValue('versionCode', 1);
    }

    // Ensure Android version is set
    const currentAndroidVersion = form.getValues('minAndroidVersion');
    if (!currentAndroidVersion || typeof currentAndroidVersion !== 'string' || currentAndroidVersion.trim() === '') {
      form.setValue('minAndroidVersion', '5.0');
    }
  };

  // Handle importing app from Play Store
  async function importFromPlayStore(packageName: string) {
    if (!packageName.trim()) {
      setImportError('Package name is required');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      console.log('Starting Play Store import for package:', packageName);
      
      // Fetch app info from Play Store
      const appInfo = await fetchPlayStoreInfo(packageName);
      console.log('Fetched app info from Play Store:', appInfo);

      // Set form values from app info
      form.setValue('name', appInfo.name || '');
      form.setValue('description', appInfo.description || '');
      form.setValue('shortDescription', appInfo.shortDescription || '');
      form.setValue('packageName', packageName);

      // Try to match category to one in our list
      const categoryMatch = appCategories.find(cat => 
        appInfo.category.toLowerCase().includes(cat.toLowerCase())
      );
      if (categoryMatch) {
        form.setValue('category', categoryMatch);
        console.log('Set category to:', categoryMatch);
      } else {
        // Default to Games if no match
        form.setValue('category', 'Games');
        console.log('No category match found, defaulting to Games');
      }

      // Set version information
      if (appInfo.version) {
        console.log('Setting version from Play Store:', appInfo.version);
        form.setValue('version', appInfo.version);
        
        // Generate version code from version string
        const versionParts = appInfo.version.split('.');
        let versionCode = 1;
        
        if (versionParts.length >= 3) {
          // Convert version like 1.2.3 to 10203
          versionCode = parseInt(versionParts[0]) * 10000 + 
                        parseInt(versionParts[1]) * 100 + 
                        parseInt(versionParts[2]);
        } else if (versionParts.length === 2) {
          // Convert version like 1.2 to 10200
          versionCode = parseInt(versionParts[0]) * 10000 + 
                        parseInt(versionParts[1]) * 100;
        }
        
        console.log('Generated version code:', versionCode);
        form.setValue('versionCode', versionCode);
      } else {
        console.log('No version info from Play Store, using defaults');
        form.setValue('version', '1.0.0');
        form.setValue('versionCode', 10000);
      }
      
      // Set default min Android version if not already set
      if (!form.getValues('minAndroidVersion')) {
        console.log('Setting default minAndroidVersion: 5.0');
        form.setValue('minAndroidVersion', '5.0');
      }

      // Download icon
      if (appInfo.icon) {
        try {
          console.log('Downloading icon from:', appInfo.icon);
          const iconFile = await downloadImageAsFile(appInfo.icon, 'icon.png', 'image/png');
          console.log('Icon downloaded successfully, size:', iconFile.size);
          
          const iconFileList = new DataTransfer();
          iconFileList.items.add(iconFile);
          form.setValue('icon', iconFileList.files);

          // Preview the icon
          setIconPreview(URL.createObjectURL(iconFile));
        } catch (err) {
          console.error('Error downloading icon:', err);
          toast({
            title: "Warning",
            description: "Couldn't download app icon. Please upload it manually.",
          });
        }
      }

      // Download screenshots
      if (appInfo.screenshots && appInfo.screenshots.length > 0) {
        try {
          console.log(`Downloading ${Math.min(5, appInfo.screenshots.length)} screenshots`);
          const screenshotFiles = new DataTransfer();
          const previewUrls: string[] = [];

          // Only take up to 5 screenshots
          const maxScreenshots = Math.min(5, appInfo.screenshots.length);

          for (let i = 0; i < maxScreenshots; i++) {
            const screenshot = appInfo.screenshots[i];
            console.log(`Downloading screenshot ${i+1} from:`, screenshot);
            const file = await downloadImageAsFile(screenshot, `screenshot_${i}.png`, 'image/png');
            screenshotFiles.items.add(file);

            // Preview the screenshot
            previewUrls.push(URL.createObjectURL(file));
          }

          form.setValue('screenshots', screenshotFiles.files);
          setScreenshotPreviews(previewUrls);
          console.log('Screenshots downloaded and set successfully');
        } catch (err) {
          console.error('Error downloading screenshots:', err);
          toast({
            title: "Warning",
            description: "Couldn't download app screenshots. Please upload them manually.",
          });
        }
      }

      // Close the dialog
      setIsImportDialogOpen(false);

      toast({
        title: "Import Successful",
        description: "App info has been imported from Google Play Store. You still need to upload an APK file.",
      });
    } catch (error) {
      console.error('Error importing from Play Store:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import app info. Make sure the package name is correct.';
      setImportError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  }

  function onSubmit(data: AppUploadFormValues) {
    // Make sure all required fields have values before submitting
    ensureRequiredFields();
    
    console.log('Form submitted with values:', data);
    
    // Add validation for apk file existence
    if (!data.apkFile || data.apkFile.length === 0) {
      toast({
        title: "APK file required",
        description: "Please select an APK file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    // Add validation for icon existence
    if (!data.icon || data.icon.length === 0) {
      toast({
        title: "App icon required",
        description: "Please select an icon image for your app.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(data);
  }

  // Handle apk file change - simplified version without extraction
  const handleApkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    form.setValue('apkFile', files);
    
    // Try to extract information from the filename
    const filename = file.name;
    if (filename) {
      // Extract app name from filename
      const nameWithoutExt = filename.replace(/\.(apk|aab)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      
      // Only set name if it's not already set
      if (!form.getValues('name')) {
        console.log('Using filename as app name:', nameWithoutExt);
        form.setValue('name', nameWithoutExt);
      }

      // Try to extract version from filename
      const versionMatch = filename.match(/[-_]v?(\d+\.\d+(\.\d+)?)/i);
      if (versionMatch && versionMatch[1] && !form.getValues('version')) {
        console.log('Using version from filename:', versionMatch[1]);
        form.setValue('version', versionMatch[1]);
        
        // Generate a basic version code
        const versionParts = versionMatch[1].split('.');
        if (versionParts.length >= 2) {
          const major = parseInt(versionParts[0]) || 0;
          const minor = parseInt(versionParts[1]) || 0;
          const patch = versionParts.length > 2 ? (parseInt(versionParts[2]) || 0) : 0;
          
          const versionCode = major * 10000 + minor * 100 + patch;
          form.setValue('versionCode', versionCode);
        }
      }
    }
    
    toast({
      title: "APK Selected",
      description: "APK file selected successfully. Please fill out the remaining details.",
    });
  };

  // Handle icon file change
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    form.setValue('icon', files);

    const iconURL = URL.createObjectURL(file);
    setIconPreview(iconURL);
  };

  // Handle screenshots file change
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const screenshotURLs: string[] = [];

    // Only take up to 5 screenshots
    const maxScreenshots = Math.min(5, files.length);

    for (let i = 0; i < maxScreenshots; i++) {
      const file = files[i];
      const screenshotURL = URL.createObjectURL(file);
      screenshotURLs.push(screenshotURL);
    }

    form.setValue('screenshots', files);
    setScreenshotPreviews(screenshotURLs);
  };

  // Clear screenshots
  const clearScreenshots = () => {
    // Create an empty FileList-like object
    const emptyFileList = {
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {}
    } as unknown as FileList;
    
    form.setValue('screenshots', emptyFileList);
    setScreenshotPreviews([]);
  };

  return (
    <>
      <Helmet>
        <title>Upload App - Developer Dashboard - AppMarket</title>
        <meta name="description" content="Upload your Android APK or AAB file to AppMarket and start reaching users." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/developer")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Upload New App</h1>
          <p className="text-gray-500">Fill out the details below to upload your app</p>
          
          <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Need to update app metadata?</AlertTitle>
            <AlertDescription>
              You can manually enter all metadata fields below. When you upload an APK file, 
              we'll try to extract some information from the filename, but you can always 
              modify all fields before submitting.
            </AlertDescription>
          </Alert>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">App Information</h2>
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Import from Play Store
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import from Google Play Store</DialogTitle>
                      <DialogDescription>
                        Enter an Android package name to import app information automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Input
                            placeholder="com.example.app"
                            value={packageNameToImport}
                            onChange={(e) => setPackageNameToImport(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Example format: com.whatsapp
                          </p>
                        </div>

                        {importError && (
                          <Alert variant="destructive" className="py-2 text-sm">
                            <AlertDescription>{importError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsImportDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => importFromPlayStore(packageNameToImport)}
                        disabled={isImporting || !packageNameToImport.trim()}
                        className="gap-2"
                      >
                        {isImporting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Import Data
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter app name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="packageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input placeholder="com.example.app" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minAndroidVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Android Version</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Android version" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5.0">Android 5.0 (Lollipop)</SelectItem>
                            <SelectItem value="6.0">Android 6.0 (Marshmallow)</SelectItem>
                            <SelectItem value="7.0">Android 7.0 (Nougat)</SelectItem>
                            <SelectItem value="8.0">Android 8.0 (Oreo)</SelectItem>
                            <SelectItem value="9.0">Android 9.0 (Pie)</SelectItem>
                            <SelectItem value="10.0">Android 10</SelectItem>
                            <SelectItem value="11.0">Android 11</SelectItem>
                            <SelectItem value="12.0">Android 12</SelectItem>
                            <SelectItem value="13.0">Android 13</SelectItem>
                            <SelectItem value="14.0">Android 14</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description (max 80 chars)" maxLength={80} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of your app" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
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
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-4">App Files</h2>

              <div className="space-y-6">
                <div>
                  <FormItem>
                    <FormLabel>APK File</FormLabel>
                    <FormControl>
                      <div className="mt-1">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {form.getValues('apkFile')?.[0] ? (
                              <div className="flex flex-col items-center">
                                <FileArchive className="w-8 h-8 mb-2 text-primary" />
                                <p className="text-sm text-gray-700 truncate max-w-[90%]">{form.getValues('apkFile')[0].name}</p>
                                <p className="text-xs text-gray-500 mt-1">Click to change</p>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="text-sm text-gray-500">Click to upload your APK file</p>
                                <p className="text-xs text-gray-500 mt-1">APK files up to 500MB</p>
                              </>
                            )}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".apk,.aab,application/vnd.android.package-archive"
                            onChange={handleApkFileChange}
                          />
                        </label>
                      </div>
                    </FormControl>
                    {form.formState.errors.apkFile && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.apkFile.message}
                      </p>
                    )}
                  </FormItem>
                </div>

                <div>
                  <FormItem>
                    <FormLabel>App Icon</FormLabel>
                    <FormControl>
                      <div className="mt-1">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative">
                          {iconPreview ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img src={iconPreview} alt="App icon preview" className="w-32 h-32 object-contain" />
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all">
                                <div className="text-white opacity-0 hover:opacity-100">
                                  <p className="text-xs">Click to change</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImagePlus className="w-10 h-10 mb-3 text-gray-500" />
                              <p className="text-sm text-gray-500">Click to upload app icon</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (512x512px recommended)</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleIconChange}
                          />
                        </label>
                      </div>
                    </FormControl>
                    {form.formState.errors.icon && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.icon.message}
                      </p>
                    )}
                  </FormItem>
                </div>

                <div>
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Screenshots</FormLabel>
                      {screenshotPreviews.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearScreenshots}
                          type="button"
                          className="h-7 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear All
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <div className="mt-1">
                        {screenshotPreviews.length === 0 ? (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <PlusCircle className="w-10 h-10 mb-3 text-gray-500" />
                              <p className="text-sm text-gray-500">Click to upload screenshots</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (1-5 images)</p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              multiple
                              onChange={handleScreenshotsChange}
                            />
                          </label>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                              {screenshotPreviews.map((url, index) => (
                                <div key={index} className="relative aspect-[9/16] rounded-lg overflow-hidden border bg-gray-100">
                                  <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {screenshotPreviews.length < 5 && (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 aspect-[9/16]">
                                  <PlusCircle className="w-8 h-8 text-gray-500" />
                                  <p className="text-xs text-gray-500 mt-2">Add More</p>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    multiple
                                    onChange={handleScreenshotsChange}
                                  />
                                </label>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {screenshotPreviews.length} of 5 screenshots selected
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {form.formState.errors.screenshots && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.screenshots.message}
                      </p>
                    )}
                  </FormItem>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/developer")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
                className="gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload App
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}