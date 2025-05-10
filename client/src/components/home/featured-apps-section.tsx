import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppCard from "@/components/app/app-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedAppsSection() {
  const { data: apps, isLoading } = useQuery({
    queryKey: ["/api/apps/featured"],
  });

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Apps</h2>
          <Button variant="link" className="text-primary flex items-center" asChild>
            <Link href="/apps">
              See all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Skeleton className="w-full h-32" />
                <div className="p-4">
                  <div className="flex items-start mb-2">
                    <Skeleton className="w-12 h-12 rounded-xl mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : apps && apps.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl">
            <p className="text-gray-500">No featured apps available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
