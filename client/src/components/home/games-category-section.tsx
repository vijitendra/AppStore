import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { App } from "@shared/schema";

export default function GamesCategorySection() {
  // Here we'd ideally filter by Games category, but we'll reuse featured apps for demo
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps/featured"],
  });

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <Gamepad2 className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold">Top Games</h2>
        </div>
        <Button variant="link" className="text-indigo-600 flex items-center" asChild>
          <Link href="/apps/category/Games">
            More
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="w-full aspect-square rounded-2xl mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : apps && apps.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {apps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`} className="group">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 transition-transform group-hover:scale-105 duration-200">
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-full aspect-square object-cover rounded-2xl shadow-sm"
                    />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">{app.name}</h3>
                  <p className="text-xs text-gray-500">
                    {app.rating ? (app.rating / 10).toFixed(1) : '4.5'} ★
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No games available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}