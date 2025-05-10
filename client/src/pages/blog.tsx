import { useState } from "react";
import { Link } from "wouter";
import StaticPage from "@/components/static-page";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

export default function BlogPage() {
  // In a real implementation, these would be fetched from an API
  const blogPosts = [
    {
      id: 1,
      title: "Announcing AppMarket 2.0: A New Era for App Distribution",
      excerpt: "We're excited to announce the release of AppMarket 2.0, featuring a completely redesigned interface, improved developer tools, and enhanced security features.",
      author: "AppMarket Team",
      date: "May 1, 2023",
      category: "Announcements",
      image: "/placeholder-blog-1.jpg"
    },
    {
      id: 2,
      title: "How to Optimize Your Android App for Better Performance",
      excerpt: "Learn the best practices for optimizing your Android application to ensure fast loading times, smooth performance, and efficient battery usage.",
      author: "Jane Smith",
      date: "April 15, 2023",
      category: "Developer Tips",
      image: "/placeholder-blog-2.jpg"
    },
    {
      id: 3,
      title: "The Future of Mobile App Development in 2023",
      excerpt: "Explore the emerging trends and technologies that will shape the mobile app development landscape in the coming year.",
      author: "John Davis",
      date: "April 5, 2023",
      category: "Trends",
      image: "/placeholder-blog-3.jpg"
    },
    {
      id: 4,
      title: "Case Study: How Game Developer XYZ Increased Downloads by 300%",
      excerpt: "Read about how independent game developer XYZ implemented key strategies to dramatically increase their game's visibility and download numbers.",
      author: "Sarah Johnson",
      date: "March 27, 2023",
      category: "Case Studies",
      image: "/placeholder-blog-4.jpg"
    },
    {
      id: 5,
      title: "Understanding App Store Optimization for Alternative Marketplaces",
      excerpt: "Discover specific techniques for optimizing your app listings on alternative app marketplaces to maximize visibility and downloads.",
      author: "Michael Brown",
      date: "March 15, 2023",
      category: "Marketing",
      image: "/placeholder-blog-5.jpg"
    },
    {
      id: 6,
      title: "The Impact of Privacy Regulations on Mobile App Development",
      excerpt: "An in-depth look at how recent privacy regulations like GDPR and CCPA are changing the way developers build and maintain mobile applications.",
      author: "Lisa Chen",
      date: "March 1, 2023",
      category: "Policy",
      image: "/placeholder-blog-6.jpg"
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaticPage 
      title="Blog" 
      description="Latest news, updates, and insights from the AppMarket team."
    >
      <div className="mb-8">
        <p className="lead mb-6">
          Stay up-to-date with the latest news, developer tips, industry trends, and announcements
          from the AppMarket team.
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="developer">Developer Tips</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="developer">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts
              .filter(post => post.category === "Developer Tips")
              .map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="announcements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts
              .filter(post => post.category === "Announcements")
              .map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts
              .filter(post => post.category === "Trends")
              .map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-12">
        <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
        <p className="text-gray-600 mb-6">
          Get the latest updates and insights delivered directly to your inbox.
        </p>
        <div className="flex max-w-md mx-auto">
          <Input placeholder="Your email address" className="rounded-r-none" />
          <Button className="rounded-l-none">Subscribe</Button>
        </div>
      </div>
    </StaticPage>
  );
}

interface BlogPostCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    image: string;
  };
}

function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 relative">
        {/* This would be an actual image in a production site */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Featured Image</span>
        </div>
      </div>
      
      <CardHeader>
        <div className="space-y-1">
          <Badge variant="outline">{post.category}</Badge>
          <CardTitle className="text-xl">{post.title}</CardTitle>
        </div>
        <CardDescription>{post.date} • By {post.author}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600">{post.excerpt}</p>
      </CardContent>
      
      <CardFooter>
        <Button variant="link" asChild className="p-0">
          <Link href={`/blog/${post.id}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}