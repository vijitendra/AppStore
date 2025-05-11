import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { App } from "@shared/schema";
import AppCardHorizontal from "./app-card-horizontal";
import { Skeleton } from "@/components/ui/skeleton";

interface AppTabSectionProps {
  title: string;
  icon?: React.ReactNode;
  tabs: { id: string; label: string }[];
  defaultTab?: string;
  href?: string;
}

export default function AppTabSection({ title, icon, tabs, defaultTab, href }: AppTabSectionProps) {
  // Use different API endpoints based on section title
  const endpoint = title === "Top Charts" || title === "Top Games" 
    ? "/api/apps/top"   // Use top endpoint for download-based sorting
    : "/api/apps/featured";  // Use featured endpoint for latest-based sorting
    
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: [endpoint],
  });

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          {icon && <div className="mr-2">{icon}</div>}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {href && (
          <Button variant="link" className="text-indigo-600 flex items-center" asChild>
            <Link href={href}>
              See all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>

      <div className="p-6">
        <Tabs defaultValue={defaultTab || tabs[0].id} className="w-full">
          <div className="overflow-x-auto mb-6 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <TabsList className="bg-gray-100/70 p-1 backdrop-blur-sm min-w-max inline-flex rounded-md">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="rounded-sm py-2 px-4 whitespace-nowrap">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="m-0 space-y-1">
              {isLoading ? (
                <div className="space-y-4">
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
                  {/* Sort apps based on the section title */}
                  {(title === "Top Charts" || title === "Top Games" 
                    // Sort by downloads for "Top" sections (most downloaded first)
                    ? [...apps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
                    // Sort by creation date for featured sections (latest first)
                    : [...apps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  ).slice(0, 5).map((app, index) => (
                    <AppCardHorizontal key={app.id} app={app} rank={index + 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-14">
                  <p className="text-gray-500">No apps available at the moment.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}