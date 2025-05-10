import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppListItem from "@/components/app/app-list-item";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopChartsSection() {
  const { data: apps, isLoading } = useQuery({
    queryKey: ["/api/apps/top"],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Top Charts</h2>
          <Button variant="link" className="text-primary flex items-center" asChild>
            <Link href="/apps/top">
              See all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center">
                    <Skeleton className="w-6 h-6 rounded-full mr-4" />
                    <Skeleton className="w-16 h-16 rounded-xl mr-4" />
                    <div className="flex-grow">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="w-12 h-6 mr-6" />
                    <Skeleton className="w-16 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : apps && apps.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {apps.map((app, index) => (
                <AppListItem key={app.id} app={app} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No top apps available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
