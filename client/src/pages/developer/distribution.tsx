import StaticPage from "@/components/static-page";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Download, BarChart, Globe, Package } from "lucide-react";

export default function DistributionPage() {
  return (
    <StaticPage 
      title="App Distribution" 
      description="Learn about distributing your Android apps through AppMarket."
    >
      <p className="lead mb-8">
        AppMarket provides powerful distribution tools to help developers reach millions of users worldwide.
        Learn about our distribution options, tools, and best practices.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Global Reach</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Distribute your apps to users across 190+ countries without regional restrictions.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Easy Publishing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Simple submission process with fast review times and streamlined updates.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Detailed Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Access comprehensive metrics to understand your app's performance and user engagement.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Multiple Formats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Support for APK and AAB (Android App Bundle) file formats with automatic variant generation.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="getting-started" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="publishing">Publishing Guide</TabsTrigger>
          <TabsTrigger value="updates">App Updates</TabsTrigger>
          <TabsTrigger value="formats">File Formats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started">
          <div className="prose prose-lg max-w-none">
            <h2>Getting Started with App Distribution</h2>
            <p>
              Distributing your app on AppMarket is simple. Follow these steps to get started:
            </p>
            
            <ol>
              <li>
                <strong>Create a Developer Account</strong>
                <p>
                  Sign up for a developer account on AppMarket. You'll need to provide basic information
                  about yourself or your organization.
                </p>
              </li>
              <li>
                <strong>Set Up Your Developer Profile</strong>
                <p>
                  Complete your developer profile with a logo, website, and description. A professional
                  profile helps build trust with potential users.
                </p>
              </li>
              <li>
                <strong>Prepare Your App</strong>
                <p>
                  Ensure your app meets our technical requirements and follows our content guidelines.
                  Test thoroughly before submission.
                </p>
              </li>
              <li>
                <strong>Submit Your App</strong>
                <p>
                  Upload your APK or AAB file along with screenshots, descriptions, and other required metadata.
                </p>
              </li>
              <li>
                <strong>App Review</strong>
                <p>
                  Our team will review your app to ensure it meets our quality standards and guidelines.
                  Most reviews are completed within 24-48 hours.
                </p>
              </li>
              <li>
                <strong>Launch and Promote</strong>
                <p>
                  Once approved, your app will be available on AppMarket. Use our promotional tools to
                  increase visibility.
                </p>
              </li>
            </ol>
            
            <div className="bg-primary/10 p-6 rounded-lg my-6">
              <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
              <p className="mb-4">
                Create your developer account today and join thousands of developers already publishing
                on AppMarket.
              </p>
              <Button>Create Developer Account</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="publishing">
          <div className="prose prose-lg max-w-none">
            <h2>App Publishing Guide</h2>
            <p>
              Follow these best practices to ensure a smooth publishing process and maximize your app's success.
            </p>
            
            <h3>Preparing Your App</h3>
            <ul>
              <li>Test your app thoroughly on various devices and Android versions</li>
              <li>Ensure all app features are working properly</li>
              <li>Optimize performance and minimize crashes</li>
              <li>Check that your app complies with our content policies</li>
              <li>Review permissions to ensure you're only requesting what your app needs</li>
            </ul>
            
            <h3>Creating Compelling Listings</h3>
            <ul>
              <li>Write clear, concise, and informative descriptions</li>
              <li>Highlight key features and benefits</li>
              <li>Use high-quality screenshots and videos</li>
              <li>Select the most appropriate app category</li>
              <li>Add relevant keywords to improve discoverability</li>
            </ul>
            
            <h3>Promotional Materials</h3>
            <p>
              Prepare the following assets for your app listing:
            </p>
            <ul>
              <li>App icon (512x512 PNG)</li>
              <li>Feature graphic (1024x500 PNG)</li>
              <li>Screenshots (minimum 3, recommended 5-8)</li>
              <li>Promotional video (optional but recommended)</li>
              <li>Short description (80 characters max)</li>
              <li>Full description (4000 characters max)</li>
            </ul>
            
            <h3>Pricing and Monetization</h3>
            <p>
              AppMarket supports various monetization models:
            </p>
            <ul>
              <li>Free apps</li>
              <li>Paid apps</li>
              <li>In-app purchases</li>
              <li>Subscription models</li>
              <li>Ad-supported apps</li>
            </ul>
            <p>
              Consider your target audience and app type when choosing a monetization strategy.
            </p>
            
            <h3>Post-Launch Activities</h3>
            <ul>
              <li>Monitor user reviews and feedback</li>
              <li>Address bugs and issues promptly</li>
              <li>Analyze performance metrics through the developer dashboard</li>
              <li>Plan regular updates to keep your app fresh and engaging</li>
              <li>Engage with your user community</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="updates">
          <div className="prose prose-lg max-w-none">
            <h2>Managing App Updates</h2>
            <p>
              Keeping your app updated is essential for maintaining user satisfaction and addressing
              emerging issues. AppMarket makes the update process simple.
            </p>
            
            <h3>When to Update Your App</h3>
            <ul>
              <li>To fix bugs or crashes reported by users</li>
              <li>To add new features or improve existing ones</li>
              <li>To optimize performance or reduce resource usage</li>
              <li>To maintain compatibility with new Android versions</li>
              <li>To address security vulnerabilities</li>
              <li>To refresh content and keep users engaged</li>
            </ul>
            
            <h3>Version Numbering</h3>
            <p>
              Follow a consistent versioning scheme (e.g., semantic versioning) to help users understand
              the nature of your updates:
            </p>
            <ul>
              <li><strong>Major version</strong> (e.g., 2.0.0): Significant changes or redesigns</li>
              <li><strong>Minor version</strong> (e.g., 1.2.0): New features or enhancements</li>
              <li><strong>Patch version</strong> (e.g., 1.1.3): Bug fixes and small improvements</li>
            </ul>
            
            <h3>Update Process</h3>
            <ol>
              <li>
                <strong>Prepare Your Update</strong>
                <p>
                  Build and test the new version of your app, ensuring it works properly and maintains
                  backward compatibility where appropriate.
                </p>
              </li>
              <li>
                <strong>Log into Developer Dashboard</strong>
                <p>
                  Access your developer dashboard and navigate to the app you want to update.
                </p>
              </li>
              <li>
                <strong>Create New Release</strong>
                <p>
                  Upload the new APK or AAB file with an increased version code and version name.
                </p>
              </li>
              <li>
                <strong>Update Release Notes</strong>
                <p>
                  Provide clear release notes detailing what's new or fixed in this update.
                </p>
              </li>
              <li>
                <strong>Submit for Review</strong>
                <p>
                  Submit your update for review. Update reviews are typically faster than new app reviews.
                </p>
              </li>
            </ol>
            
            <h3>Best Practices for Updates</h3>
            <ul>
              <li>Maintain a regular update schedule to show your app is actively maintained</li>
              <li>Group multiple small changes into periodic updates rather than frequent tiny ones</li>
              <li>Write clear, user-friendly release notes</li>
              <li>Consider phased rollouts for major changes to detect issues early</li>
              <li>Test updates thoroughly before submission</li>
              <li>Monitor user feedback after updates to catch any new issues</li>
            </ul>
            
            <div className="bg-primary/10 p-6 rounded-lg my-6">
              <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
              <p>
                For significant updates, consider reaching out to users who left negative reviews to
                let them know you've addressed their concerns. This can help improve ratings and
                show responsiveness to user feedback.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="formats">
          <div className="prose prose-lg max-w-none">
            <h2>Supported File Formats</h2>
            <p>
              AppMarket supports both traditional APK files and the newer Android App Bundle (AAB) format.
              Understanding the differences can help you choose the best option for your app.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <Card>
                <CardHeader>
                  <CardTitle>APK (Android Package)</CardTitle>
                  <CardDescription>Traditional Android application package</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold">Advantages</h4>
                      <ul className="list-disc pl-5">
                        <li>Simple, widely supported format</li>
                        <li>Direct installation on devices</li>
                        <li>Complete control over the package</li>
                        <li>Easier testing and distribution outside app stores</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Limitations</h4>
                      <ul className="list-disc pl-5">
                        <li>Larger file size</li>
                        <li>Contains resources for all device configurations</li>
                        <li>May require multiple APKs for different architectures</li>
                        <li>Manual optimization required for different devices</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Best For</h4>
                      <ul className="list-disc pl-5">
                        <li>Simple apps with small resource footprints</li>
                        <li>Apps targeting specific device configurations</li>
                        <li>Apps that need distribution outside app stores</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AAB (Android App Bundle)</CardTitle>
                      <CardDescription>Google's recommended publishing format</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">Recommended</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold">Advantages</h4>
                      <ul className="list-disc pl-5">
                        <li>Smaller downloads for users (15-20% average reduction)</li>
                        <li>Dynamic delivery of only needed resources</li>
                        <li>Automatic language resources based on user settings</li>
                        <li>Support for Play Feature Delivery (on-demand modules)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Limitations</h4>
                      <ul className="list-disc pl-5">
                        <li>More complex structure</li>
                        <li>Requires app store processing to generate optimized APKs</li>
                        <li>Less direct control over final APK delivered to users</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Best For</h4>
                      <ul className="list-disc pl-5">
                        <li>Apps with large resource files</li>
                        <li>Apps targeting multiple device configurations</li>
                        <li>Apps supporting many languages</li>
                        <li>Modern Android applications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <h3>Technical Requirements</h3>
            <p>
              Regardless of the format you choose, your app must meet the following requirements:
            </p>
            
            <ul>
              <li>Target API level 30 (Android 11) or higher</li>
              <li>64-bit support for native libraries</li>
              <li>Maximum APK/AAB size: 150MB (larger apps can use expansion files)</li>
              <li>Proper app signing with a valid keystore</li>
              <li>Compliance with all AppMarket policies</li>
            </ul>
            
            <h3>Converting Between Formats</h3>
            <p>
              If you've been using APK format and want to switch to AAB, you can generally do so without code changes.
              Android Studio provides tools to build AABs from your existing project. When transitioning:
            </p>
            
            <ul>
              <li>Ensure your app handles dynamic delivery of resources</li>
              <li>Test thoroughly to verify all features work with the new format</li>
              <li>Maintain the same signing key for app continuity</li>
              <li>Consider using Android App Bundle Explorer to inspect your bundle</li>
            </ul>
            
            <div className="bg-gray-50 p-6 rounded-lg my-6">
              <h3 className="font-bold text-xl mb-2">Need Help?</h3>
              <p className="mb-4">
                Our technical support team can assist you with format questions or conversion issues.
                Reach out to developer-support@appmarket.example for assistance.
              </p>
              <Button variant="outline">Contact Developer Support</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <h2 className="text-2xl font-bold mb-6">Distribution Benefits</h2>
      
      <div className="space-y-6 mb-12">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Lower Commission Rates</h3>
            <p>
              AppMarket offers competitive commission rates starting at just 15%, significantly lower
              than other major app stores, allowing you to keep more of your revenue.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Flexible Content Policies</h3>
            <p>
              Our content policies are designed to be fair and transparent, allowing for a broader range
              of apps while still maintaining a safe environment for users.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Enhanced Discoverability</h3>
            <p>
              With less competition than major app stores, your app has a better chance of being
              discovered by users. Our personalized recommendation system also helps connect your app
              with interested users.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Developer Support</h3>
            <p>
              Our dedicated developer support team is available to assist with technical issues,
              publishing questions, and policy guidance. We're committed to your success.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">Ready to Distribute Your App?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of developers who are reaching new users and growing their businesses
          with AppMarket's distribution platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg">Create Developer Account</Button>
          <Button variant="outline" size="lg">Learn More</Button>
        </div>
      </div>
    </StaticPage>
  );
}