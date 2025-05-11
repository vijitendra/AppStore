import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Trophy, Download, Package, Star, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeveloperLeaderboard() {
  const [category, setCategory] = useState<string>("engagement");
  
  const { data: developers, isLoading } = useQuery<User[]>({
    queryKey: [`/api/developers/leaderboard/${category}`],
  });
  
  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined, username: string | undefined) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return "U";
  };
  
  const formatMetric = (value: number, type: string) => {
    if (type === "downloads") {
      return value > 1000 
        ? `${(value / 1000).toFixed(1)}K` 
        : value.toString();
    } else if (type === "rating") {
      return (value / 10).toFixed(1);
    } else {
      return value.toString();
    }
  };
  
  const getBadgeColor = (index: number) => {
    switch (index) {
      case 0: return "bg-amber-500 hover:bg-amber-600"; // Gold
      case 1: return "bg-neutral-400 hover:bg-neutral-500"; // Silver
      case 2: return "bg-amber-800 hover:bg-amber-900"; // Bronze
      default: return "bg-slate-700 hover:bg-slate-800"; // Default
    }
  };
  
  const getIcon = (category: string) => {
    switch (category) {
      case "engagement":
        return <Trophy className="h-4 w-4 mr-1" />;
      case "downloads":
        return <Download className="h-4 w-4 mr-1" />;
      case "apps":
        return <Package className="h-4 w-4 mr-1" />;
      case "rating":
        return <Star className="h-4 w-4 mr-1" />;
      default:
        return <Trophy className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <section className="py-12 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <Medal className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Developer Leaderboard
            </h2>
          </div>
          <p className="text-gray-500 text-center max-w-md">
            Recognizing our top developers across different metrics in the community
          </p>
        </div>
        
        <Tabs 
          defaultValue="engagement" 
          className="max-w-4xl mx-auto"
          onValueChange={(value) => setCategory(value)}
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="engagement" className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Engagement</span>
              <span className="sm:hidden">Top</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Downloads</span>
              <span className="sm:hidden">DL</span>
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Apps</span>
              <span className="sm:hidden">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="rating" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Rating</span>
              <span className="sm:hidden">Rate</span>
            </TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Top {category === "engagement" ? "Overall" : 
                  category === "downloads" ? "by Downloads" : 
                  category === "apps" ? "by Apps Published" : 
                  "by App Ratings"} Developers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center p-2 rounded-md border border-gray-100">
                      <div className="w-10 text-center text-gray-600 font-semibold mr-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div className="flex-grow">
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : developers && developers.length > 0 ? (
                <div className="space-y-3">
                  {developers.map((developer, index) => (
                    <Link 
                      key={developer.id} 
                      href={`/apps/developer/${developer.id}`}
                      className="flex items-center p-3 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 text-center text-gray-600 font-semibold mr-3">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200">
                          {index + 1}
                        </span>
                      </div>
                      <Avatar className="h-10 w-10 mr-3">
                        {developer.profilePicture ? (
                          <AvatarImage src={developer.profilePicture} alt={developer.username || ''} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(developer.firstName, developer.lastName, developer.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-grow">
                        <div className="font-medium text-gray-900">{developer.firstName && developer.lastName ? 
                          `${developer.firstName} ${developer.lastName}` : developer.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {developer.totalApps} apps · {formatMetric(developer.totalDownloads, "downloads")} downloads
                        </div>
                      </div>
                      <Badge className={`ml-auto ${getBadgeColor(index)}`}>
                        {getIcon(category)}
                        {category === 'engagement' ? developer.engagementScore : 
                          category === 'downloads' ? formatMetric(developer.totalDownloads, "downloads") : 
                          category === 'apps' ? developer.totalApps : 
                          formatMetric(developer.averageRating, "rating")}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No developers found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </section>
  );
}