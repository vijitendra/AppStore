import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, ImagePlus, PlusCircle, X } from "lucide-react";
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
import { appCategories, appSubCategories, appUploadSchema, App } from "@shared/schema";

type AppFormValues = z.infer<typeof appUploadSchema> & {
  apkFile?: FileList;
  icon?: FileList;
  banner?: FileList;
  screenshots?: FileList;
  keepExistingScreenshots?: boolean;
};

interface AppFormProps {
  app?: App;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export default function AppForm({ app, onSubmit, isSubmitting }: AppFormProps) {
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [keepExistingScreenshots, setKeepExistingScreenshots] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(app?.category || "");
  
  // Debug subcategories
  console.log("App subcategories:", appSubCategories);
  console.log("Video subcategories:", appSubCategories["Video"]);

  // Create a base schema without refine()
  const baseSchema = z.object({
    name: z.string().min(1, "App name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    shortDescription: z.string().optional(),
    version: z.string().optional(),
    versionCode: z.number().optional(),
    packageName: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    subCategory: z.string().optional(),
    minAndroidVersion: z.string().default("5.0"),
    changeLog: z.string().optional(),
  });

  // Initialize form with schema
  const form = useForm<AppFormValues>({
    resolver: zodResolver(
      z.object({
        ...baseSchema.shape,
        apkFile: app 
          ? z.instanceof(FileList).optional()
          : z.instanceof(FileList).refine(files => files && files.length === 1, {
              message: "APK file is required",
            }),
        icon: app
          ? z.instanceof(FileList).optional()
          : z.instanceof(FileList).refine(files => files && files.length === 1, {
              message: "App icon is required",
            }),
        banner: z.instanceof(FileList).optional(),
        screenshots: app
          ? z.instanceof(FileList).optional()
          : z.instanceof(FileList).refine(files => files && files.length >= 1 && files.length <= 5, {
              message: "At least 1 and at most 5 screenshots are required",
            }),
        keepExistingScreenshots: z.boolean().optional(),
      })
    ),
    defaultValues: {
      name: app?.name || "",
      description: app?.description || "",
      shortDescription: app?.shortDescription || "",
      version: app?.version || "1.0.0",
      packageName: app?.packageName || "",
      category: app?.category || "",
      subCategory: app?.subCategory || "",
      minAndroidVersion: app?.minAndroidVersion || "5.0",
      keepExistingScreenshots: true,
    },
  });

  // Set initial previews if app is provided
  useEffect(() => {
    if (app) {
      if (app.iconUrl) {
        setIconPreview(app.iconUrl);
      }
      if (app.bannerUrl) {
        setBannerPreview(app.bannerUrl);
      }
      if (app.screenshotUrls && app.screenshotUrls.length > 0) {
        setScreenshotPreviews(app.screenshotUrls);
      }
    }
  }, [app]);

  // Handle form submission
  const handleSubmit = (data: AppFormValues) => {
    const formData = new FormData();
    
    // Add all form fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'apkFile' && key !== 'icon' && key !== 'banner' && key !== 'screenshots' && value !== undefined) {
        formData.append(key, value as string);
      }
    });
    
    // Add keepExistingScreenshots flag
    if (app) {
      formData.append('keepExistingScreenshots', keepExistingScreenshots.toString());
    }
    
    // Add files if provided
    if (data.apkFile && data.apkFile.length > 0) {
      formData.append('apkFile', data.apkFile[0]);
    }
    
    if (data.icon && data.icon.length > 0) {
      formData.append('icon', data.icon[0]);
    }
    
    if (data.banner && data.banner.length > 0) {
      formData.append('banner', data.banner[0]);
    }
    
    // Add screenshots
    if (data.screenshots && data.screenshots.length > 0) {
      for (let i = 0; i < data.screenshots.length; i++) {
        formData.append('screenshots', data.screenshots[i]);
      }
    }
    
    onSubmit(formData);
  };

  // Handle icon file change with preview
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setIconPreview(null);
    }
  };
  
  // Handle banner file change with preview
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBannerPreview(null);
    }
  };
  
  // Handle screenshot files change with previews
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            if (app && keepExistingScreenshots) {
              setScreenshotPreviews([...screenshotPreviews, ...newPreviews]);
            } else {
              setScreenshotPreviews(newPreviews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } else if (!app) {
      setScreenshotPreviews([]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-lg font-semibold mb-4">App Information</h2>
          
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Will be automatically extracted from the APK file if not provided
                    </p>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Will be automatically extracted from the APK file if not provided
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={selectedCategory === "Video" ? "md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCategory(value);
                          // Clear subcategory when category changes
                          form.setValue("subCategory", "");
                        }} 
                        defaultValue={field.value}
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
                
                {selectedCategory === "Video" && (
                  <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appSubCategories[selectedCategory]?.map(subCategory => (
                              <SelectItem key={subCategory} value={subCategory}>
                                {subCategory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <FormField
                control={form.control}
                name="minAndroidVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Android Version</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Android version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5.0">5.0 (Lollipop)</SelectItem>
                        <SelectItem value="6.0">6.0 (Marshmallow)</SelectItem>
                        <SelectItem value="7.0">7.0 (Nougat)</SelectItem>
                        <SelectItem value="8.0">8.0 (Oreo)</SelectItem>
                        <SelectItem value="9.0">9.0 (Pie)</SelectItem>
                        <SelectItem value="10.0">10.0 (Q)</SelectItem>
                        <SelectItem value="11.0">11.0 (R)</SelectItem>
                        <SelectItem value="12.0">12.0 (S)</SelectItem>
                        <SelectItem value="13.0">13.0 (T)</SelectItem>
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
                    <Input 
                      placeholder="Brief description (shown in listings)" 
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of your app" 
                      rows={5}
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
          
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="apkFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>{app ? "New APK/AAB File (Optional)" : "APK/AAB File"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {app 
                            ? "Upload a new version, or leave empty to keep the current file"
                            : "Drag and drop your APK or AAB file, or click to browse"
                          }
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Maximum file size: 500MB
                        </p>
                        <p className="text-xs text-blue-500 mb-4">
                          Version information will be automatically extracted from the APK
                        </p>
                        <Input
                          type="file"
                          accept=".apk,.aab"
                          className="hidden"
                          id="apk-upload"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("apk-upload")?.click()}
                        >
                          Select File
                        </Button>
                        {value && value[0] && (
                          <p className="mt-2 text-sm text-green-600">
                            Selected: {value[0].name} ({Math.round(value[0].size / 1024 / 1024 * 10) / 10}MB)
                          </p>
                        )}
                        {app && !value && (
                          <p className="mt-2 text-sm text-gray-600">
                            Current file: {app.filePath.split('/').pop()} ({Math.round(app.fileSize / 1024 / 1024 * 10) / 10}MB)
                          </p>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="icon"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{app ? "New App Icon (Optional)" : "App Icon"}</FormLabel>
                    <FormControl>
                      <div className={`border-2 rounded-lg p-4 ${iconPreview ? 'border-solid' : 'border-dashed'} flex flex-col items-center justify-center`}>
                        {iconPreview ? (
                          <div className="text-center">
                            <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto mb-3">
                              <img src={iconPreview} alt="App Icon Preview" className="w-full h-full object-cover" />
                            </div>
                            {(!app || (app && value)) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIconPreview(app?.iconUrl || null);
                                  onChange(undefined);
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {app ? "Cancel Change" : "Remove"}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImagePlus className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              {app ? "Upload new app icon" : "Upload app icon"}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              512x512px recommended
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="icon-upload"
                              onChange={(e) => {
                                onChange(e.target.files);
                                handleIconChange(e);
                              }}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("icon-upload")?.click()}
                            >
                              Select Icon
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="banner"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{app ? "New App Banner (Optional)" : "App Banner"}</FormLabel>
                    <FormControl>
                      <div className={`border-2 rounded-lg p-4 ${bannerPreview ? 'border-solid' : 'border-dashed'} flex flex-col items-center justify-center`}>
                        {bannerPreview ? (
                          <div className="text-center">
                            <div className="w-full h-32 rounded-md overflow-hidden mx-auto mb-3">
                              <img src={bannerPreview} alt="App Banner Preview" className="w-full h-full object-cover" />
                            </div>
                            {(!app || (app && value)) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setBannerPreview(app?.bannerUrl || null);
                                  onChange(undefined);
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {app ? "Cancel Change" : "Remove"}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImagePlus className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              {app ? "Upload new app banner" : "Upload app banner"}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              1280x640px recommended
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="banner-upload"
                              onChange={(e) => {
                                onChange(e.target.files);
                                handleBannerChange(e);
                              }}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("banner-upload")?.click()}
                            >
                              Select Banner
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="screenshots"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{app ? "App Screenshots (Optional)" : "Screenshots (1-5)"}</FormLabel>
                    <FormControl>
                      <div className={`border-2 rounded-lg p-4 ${screenshotPreviews.length > 0 ? 'border-solid' : 'border-dashed'} flex flex-col items-center justify-center`}>
                        {screenshotPreviews.length > 0 ? (
                          <div className="w-full">
                            <div className="flex overflow-x-auto space-x-2 pb-2 mb-2">
                              {screenshotPreviews.map((preview, index) => (
                                <div key={index} className="flex-shrink-0 w-24 h-40 rounded-md overflow-hidden bg-gray-100">
                                  <img src={preview} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                            <div className="text-center">
                              {app ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center space-x-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      id="screenshots-upload"
                                      onChange={(e) => {
                                        onChange(e.target.files);
                                        handleScreenshotsChange(e);
                                      }}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById("screenshots-upload")?.click()}
                                    >
                                      Add More Screenshots
                                    </Button>
                                    {value && value.length > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setScreenshotPreviews(app?.screenshotUrls || []);
                                          onChange(undefined);
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel Changes
                                      </Button>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <input
                                      type="checkbox"
                                      id="keep-screenshots"
                                      checked={keepExistingScreenshots}
                                      onChange={(e) => setKeepExistingScreenshots(e.target.checked)}
                                      className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="keep-screenshots">
                                      Keep existing screenshots when adding new ones
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setScreenshotPreviews([]);
                                    onChange(undefined);
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove All
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <PlusCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Upload screenshots
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              Select up to 5 screenshots
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id="screenshots-upload"
                              onChange={(e) => {
                                onChange(e.target.files);
                                handleScreenshotsChange(e);
                              }}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("screenshots-upload")?.click()}
                            >
                              Select Screenshots
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : app ? "Update App" : "Upload App"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
