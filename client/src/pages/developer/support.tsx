import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import StaticPage from "@/components/static-page";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Search, HelpCircle, BookOpen, MessageSquare, FileText } from "lucide-react";

const supportFormSchema = z.object({
  appName: z.string().min(1, "Please select your app."),
  supportCategory: z.string().min(1, "Please select a support category."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  description: z.string().min(20, "Please provide more details (minimum 20 characters)."),
  email: z.string().email("Please enter a valid email address."),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export default function DeveloperSupportPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      appName: "",
      supportCategory: "",
      subject: "",
      description: "",
      email: "",
    },
  });

  function onSubmit(data: SupportFormValues) {
    // In a real application, this would send the form data to a server
    console.log(data);
    setIsSubmitted(true);
    
    // Reset the form after submission
    setTimeout(() => {
      form.reset();
      setIsSubmitted(false);
    }, 5000);
  }

  // Mock list of developer apps
  const developerApps = [
    { id: 1, name: "Meditation Master" },
    { id: 2, name: "Pixel Weather" },
    { id: 3, name: "Task Tracker Pro" },
  ];

  // Common developer FAQs with answers
  const faqItems = [
    {
      question: "How long does the app review process take?",
      answer: "Our app review process typically takes 24-48 hours for new apps and 12-24 hours for updates. During high volume periods, reviews may take slightly longer. You can check the status of your submission in the Developer Dashboard."
    },
    {
      question: "Why was my app rejected?",
      answer: "Apps may be rejected for various reasons, including policy violations, technical issues, or content concerns. You should have received an email with specific reasons for the rejection. Address those issues and resubmit your app. If you need clarification, you can contact our developer support team."
    },
    {
      question: "How do I respond to user reviews?",
      answer: "You can respond to user reviews through the Developer Dashboard. Navigate to your app, select the 'Reviews' tab, and click on 'Reply' next to any review. Responding to reviews shows users that you're actively engaged and care about their feedback."
    },
    {
      question: "Can I transfer my app to another developer account?",
      answer: "Yes, app transfers between developer accounts are possible. Both the current owner and the new owner must approve the transfer. To initiate a transfer, go to your Developer Dashboard, select the app, and choose 'Transfer app' from the options menu. Then follow the instructions provided."
    },
    {
      question: "How do I implement in-app purchases?",
      answer: "To implement in-app purchases, you'll need to use our AppMarket Billing API. We provide SDKs for various development environments. Detailed integration guides and sample code are available in our developer documentation."
    },
    {
      question: "What are the commission rates for app sales and in-app purchases?",
      answer: "AppMarket charges a 15% commission on app sales and in-app purchases, significantly lower than other major app stores. For subscription products, the rate drops to 10% after the first year of a user's subscription."
    },
    {
      question: "How can I optimize my app listing for better visibility?",
      answer: "To improve your app's visibility, focus on optimizing your app title, description, and keywords with relevant search terms. Use high-quality screenshots and videos that showcase your app's features. Encourage satisfied users to leave positive reviews, and regularly update your app to improve its ranking."
    },
    {
      question: "How do I get featured on AppMarket?",
      answer: "There's no direct application process for getting featured. Our editorial team regularly reviews the marketplace for high-quality apps to feature. To increase your chances, focus on creating a polished, innovative app with excellent user experience, maintain regular updates, and engage with your user community."
    }
  ];

  return (
    <StaticPage 
      title="Developer Support" 
      description="Get help with app development, publishing, and managing your apps on AppMarket."
    >
      <p className="lead mb-8">
        Our developer support resources are designed to help you succeed on AppMarket. Find answers to common
        questions, access documentation, or contact our support team for personalized assistance.
      </p>
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input 
          className="pl-10" 
          placeholder="Search developer help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Documentation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Comprehensive guides and reference materials for developing and publishing apps on AppMarket.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary hover:underline">Getting Started Guide</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Publishing Requirements</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">API References</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">SDK Documentation</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">View All Documentation →</a>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Policies & Guidelines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Important policies and guidelines for app developers on the AppMarket platform.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary hover:underline">Developer Program Policies</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Content Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">App Quality Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Brand Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Additional resources to help you develop and promote your apps.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary hover:underline">Developer Blog</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Video Tutorials</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Sample Projects</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Community Forums</a>
              </li>
              <li>
                <a href="#" className="text-primary hover:underline">Design Resources</a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="faq" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Common Developer Questions</CardTitle>
              <CardDescription>
                Find answers to frequently asked questions about developing and publishing on AppMarket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Contact Developer Support</CardTitle>
              </div>
              <CardDescription>
                Need personalized assistance? Our developer support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Support Request Sent!</h3>
                  <p className="text-green-700">
                    Thank you for contacting us. One of our developer support representatives will
                    respond to your inquiry within 24 hours.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="appName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select App</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an app" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {developerApps.map(app => (
                                <SelectItem key={app.id} value={app.name}>{app.name}</SelectItem>
                              ))}
                              <SelectItem value="general">General Question (Not App Specific)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="supportCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Category</FormLabel>
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
                              <SelectItem value="publishing">App Publishing</SelectItem>
                              <SelectItem value="review">App Review Process</SelectItem>
                              <SelectItem value="policy">Policy Questions</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="account">Account Management</SelectItem>
                              <SelectItem value="payments">Payments & Monetization</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Subject of your support request" {...field} />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please describe your issue in detail..."
                              className="resize-none min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include any relevant details, error messages, or steps to reproduce issues.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Your email address" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            We'll send our response to this email address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full md:w-auto">
                      Submit Support Request
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-primary/5 p-8 rounded-lg mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Developer Community</h2>
          <p className="mb-6">
            Connect with other AppMarket developers, share your experiences, ask questions,
            and discover best practices in our developer community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">Join Developer Forum</Button>
            <Button variant="outline">GitHub Repository</Button>
            <Button variant="outline">Discord Channel</Button>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Support Tiers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Standard Support</CardTitle>
            <CardDescription>Included with all developer accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Email support with 2 business day response time</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Access to documentation and self-help resources</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Community forum access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Basic publishing assistance</span>
              </li>
            </ul>
            <p className="text-lg font-bold">Free</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex justify-between items-center">
              <CardTitle>Premium Support</CardTitle>
              <Badge>Popular</Badge>
            </div>
            <CardDescription>For growing developers</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Priority email support with 1 business day response time</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Chat support during business hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Expedited app reviews</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Advanced publishing assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Monthly performance insights</span>
              </li>
            </ul>
            <p className="text-lg font-bold">$49/month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Enterprise Support</CardTitle>
            <CardDescription>For established developers</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>24/7 priority support with 4-hour response time</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Phone support hotline</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Technical consultations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Promotional opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <span>Custom solutions</span>
              </li>
            </ul>
            <p className="text-lg font-bold">Contact for pricing</p>
          </CardContent>
        </Card>
      </div>
    </StaticPage>
  );
}