import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { App } from "@shared/schema";
import AppCardHorizontal from "./app-card-horizontal";

export default function FeaturedAppsSection() {
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps/top"],
  });

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Top Apps</h2>
            </div>
            <Button variant="link" className="text-indigo-600 flex items-center" asChild>
              <Link href="/apps/top">
                See all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-4 flex justify-center">
                    <div className="flex items-center w-full max-w-2xl">
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
                {/* Sort apps by download count - show most downloaded apps first */}
                {[...apps]
                  .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
                  .slice(0, 5)
                  .map((app) => (
                    <div key={app.id} className="flex justify-center">
                      <div className="w-full max-w-2xl">
                        <AppCardHorizontal app={app} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-14">
                <p className="text-gray-500">No apps available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
