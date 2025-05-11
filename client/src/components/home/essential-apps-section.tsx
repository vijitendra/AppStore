import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { App } from "@shared/schema";

export default function EssentialAppsSection() {
  // For now we'll reuse top apps for demo
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps/top"],
  });

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold">Essential Apps</h2>
        </div>
        <Button variant="link" className="text-indigo-600 flex items-center" asChild>
          <Link href="/apps">
            More
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="w-16 h-16 rounded-xl mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-4/5 mb-2" />
                  <Skeleton className="h-4 w-3/5 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : apps && apps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {apps.slice(0, 3).map((app) => (
              <Link key={app.id} href={`/app/${app.id}`} className="group">
                <div className="flex items-start rounded-lg p-3 transition-colors duration-200 hover:bg-gray-50">
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200 flex-shrink-0 mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                      {app.shortDescription || app.description?.substring(0, 60) + '...'}
                    </p>
                    <div className="text-xs text-gray-400">
                      {app.downloads ? `${app.downloads > 1000 ? Math.floor(app.downloads/1000) + 'K+' : app.downloads} downloads` : '10K+ downloads'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No essential apps available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}