import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { App } from "@shared/schema";

export default function EditorChoiceSection() {
  // We'll reuse featured apps for the editor's choice for now
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps/featured"],
  });

  // Take just the first 3 apps for editor's choice
  const editorApps = apps?.slice(0, 3);

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <Award className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold">Editor's Choice</h2>
        </div>
        <Button variant="link" className="text-indigo-600 flex items-center" asChild>
          <Link href="/apps">
            More
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex items-start">
                <Skeleton className="w-16 h-16 rounded-xl mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-4/5 mb-2" />
                  <Skeleton className="h-4 w-3/5 mb-3" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : editorApps && editorApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {editorApps.map((app) => (
            <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start">
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200 flex-shrink-0"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {app.shortDescription || app.description?.substring(0, 60) + '...'}
                  </p>
                  <Button
                    size="sm"
                    className="rounded-full px-4 h-8 bg-indigo-600 hover:bg-indigo-700"
                    asChild
                  >
                    <Link href={`/app/${app.id}`}>Get</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No editor's choice apps available at the moment.</p>
        </div>
      )}
    </section>
  );
}