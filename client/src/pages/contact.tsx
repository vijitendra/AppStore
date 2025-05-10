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
import { Mail, Phone, MapPin, MessageSquare, Check } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  inquiryType: z.string().min(1, "Please select an inquiry type."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      inquiryType: "",
      message: "",
    },
  });

  function onSubmit(data: ContactFormValues) {
    // In a real application, this would send the form data to a server
    console.log(data);
    setIsSubmitted(true);
    
    // Reset the form after submission
    setTimeout(() => {
      form.reset();
      setIsSubmitted(false);
    }, 5000);
  }

  return (
    <StaticPage 
      title="Contact Us" 
      description="Get in touch with the AppMarket team for support, partnerships, or general inquiries."
    >
      <p className="lead mb-8">
        We'd love to hear from you! Whether you have a question about our platform, need technical support,
        or want to explore partnership opportunities, our team is here to help.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Email Us</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-1">General Inquiries:</CardDescription>
            <p className="font-medium mb-3">info@appmarket.example</p>
            
            <CardDescription className="text-sm mb-1">Support:</CardDescription>
            <p className="font-medium mb-3">support@appmarket.example</p>
            
            <CardDescription className="text-sm mb-1">Developer Relations:</CardDescription>
            <p className="font-medium">developers@appmarket.example</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Call Us</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-1">Customer Support:</CardDescription>
            <p className="font-medium mb-3">+1 (555) 123-4567</p>
            
            <CardDescription className="text-sm mb-1">Developer Support:</CardDescription>
            <p className="font-medium mb-3">+1 (555) 987-6543</p>
            
            <CardDescription className="text-sm mb-1">Hours:</CardDescription>
            <p className="font-medium">Monday - Friday, 9am - 6pm PT</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Visit Us</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-1">Headquarters:</CardDescription>
            <p className="font-medium">
              123 App Street<br />
              San Francisco, CA 94105<br />
              United States
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 p-8 rounded-lg mb-12">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Send Us a Message</h2>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
            <p className="text-green-700">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="inquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inquiry Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="developer">Developer Support</SelectItem>
                          <SelectItem value="business">Business Development</SelectItem>
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
                        <Input placeholder="Subject of your inquiry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about your inquiry..."
                        className="resize-none min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Please be as specific as possible to help us assist you better.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full md:w-auto">
                Send Message
              </Button>
            </form>
          </Form>
        )}
      </div>
      
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">Need Immediate Assistance?</h3>
        <p>
          For urgent support issues, please contact our customer support team directly at{" "}
          <a href="tel:+15551234567" className="text-primary hover:underline">
            +1 (555) 123-4567
          </a>{" "}
          or visit our{" "}
          <a href="/support" className="text-primary hover:underline">
            Support Center
          </a>.
        </p>
      </div>
    </StaticPage>
  );
}