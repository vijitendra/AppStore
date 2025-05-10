import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Loader2, Plus, Search } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import DeveloperLayout from "@/components/developer/developer-layout";
import AppListItem from "@/components/app/app-list-item";
import { App } from "@shared/schema";

export default function DeveloperAppsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const { 
    data: apps, 
    isLoading,
    isError 
  } = useQuery<App[]>({
    queryKey: ["/api/developer/apps"],
  });
  
  const filteredApps = apps?.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedApps = [...(filteredApps || [])].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortOrder === "oldest") {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (sortOrder === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "name-desc") {
      return b.name.localeCompare(a.name);
    } else if (sortOrder === "downloads") {
      return b.downloads - a.downloads;
    } else if (sortOrder === "rating") {
      return b.rating - a.rating;
    }
    return 0;
  });

  const content = (
    <>
      <Helmet>
        <title>My Apps - Developer Dashboard</title>
        <meta 
          name="description" 
          content="Manage your apps in the AppMarket developer dashboard" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">My Apps</h1>
        <p className="text-gray-500">Manage and monitor your published applications</p>
      </div>
      
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search your apps..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select 
          value={sortOrder} 
          onValueChange={setSortOrder}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="downloads">Most Downloads</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
          </SelectContent>
        </Select>
        
        <Button asChild>
          <Link href="/developer/app/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload New App
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading your apps. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : sortedApps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Apps Found</CardTitle>
            <CardDescription>
              {searchQuery 
                ? "No apps match your search criteria." 
                : "You haven't uploaded any apps yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/developer/app/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First App
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedApps.map((app, index) => (
            <AppListItem 
              key={app.id} 
              app={app} 
              index={index} 
            />
          ))}
        </div>
      )}
    </>
  );
  
  // Return content directly since DeveloperRoute already provides the layout
  return content;
}