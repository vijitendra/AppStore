import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppListItem from "@/components/app/app-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { App } from "@shared/schema";

export default function TopChartsSection() {
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps/top"],
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Top Charts
            </h2>
            <p className="text-gray-500 mt-1">Most popular apps this week</p>
          </div>
          <Button variant="link" className="text-indigo-600 flex items-center" asChild>
            <Link href="/apps/top">
              See all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="top" className="w-full">
          <TabsList className="mb-6 bg-white/70 p-1 backdrop-blur-sm">
            <TabsTrigger value="top" className="rounded-md py-2 px-4">Top Apps</TabsTrigger>
            <TabsTrigger value="games" className="rounded-md py-2 px-4">Games</TabsTrigger>
            <TabsTrigger value="new" className="rounded-md py-2 px-4">New Releases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="top" className="m-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {isLoading ? (
                <div className="divide-y divide-gray-100">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center">
                        <Skeleton className="w-8 h-8 rounded-full mr-4 flex-shrink-0" />
                        <Skeleton className="w-16 h-16 rounded-xl mr-4 flex-shrink-0" />
                        <div className="flex-grow mr-4">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="w-20 h-9 rounded-full flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : apps && apps.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {apps.map((app, index) => (
                    <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center">
                        <div className="w-8 flex-shrink-0 font-bold text-gray-400 text-center mr-4">
                          {index + 1}
                        </div>
                        <img 
                          src={app.iconUrl} 
                          alt={app.name} 
                          className="w-16 h-16 rounded-xl mr-4 object-cover border border-gray-200 flex-shrink-0" 
                        />
                        <div className="flex-grow mr-4">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{app.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                              <span>{app.rating ? (app.rating / 10).toFixed(1) : '4.5'}</span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-3.5 w-3.5 mr-1" />
                              <span>{app.downloads ? `${app.downloads > 1000 ? Math.floor(app.downloads/1000) + 'K+' : app.downloads}` : '10K+'}</span>
                            </div>
                            <span className="hidden sm:inline text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {app.category || 'Utilities'}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="rounded-full px-4 h-9 bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                          asChild
                        >
                          <Link href={`/app/${app.id}`}>Get</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-14">
                  <p className="text-gray-500">No top apps available at the moment.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="games" className="m-0">
            <div className="text-center py-14 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500">Game rankings coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="new" className="m-0">
            <div className="text-center py-14 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500">New releases coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
