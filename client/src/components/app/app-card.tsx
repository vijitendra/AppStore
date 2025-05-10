import { Link } from "wouter";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { App } from "@shared/schema";

interface AppCardProps {
  app: App;
}

export default function AppCard({ app }: AppCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
      {app.screenshotUrls && app.screenshotUrls.length > 0 ? (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={app.screenshotUrls[0]} 
            alt={`${app.name} screenshot`} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No screenshot</span>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start mb-2">
          <div className="w-12 h-12 rounded-xl overflow-hidden mr-3 flex-shrink-0 bg-gray-100">
            <img 
              src={app.iconUrl} 
              alt={`${app.name} icon`} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{app.name}</h3>
            <p className="text-xs text-gray-500">
              {(app as any).developer?.username || 
               (app as any).developer?.firstName && (app as any).developer?.lastName 
                ? `${(app as any).developer.firstName} ${(app as any).developer.lastName}` 
                : "Developer"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{app.rating || "New"}</span>
          </div>
          <Button 
            size="sm" 
            className="rounded-full px-3 py-1.5 h-auto text-sm"
            asChild
          >
            <Link href={`/app/${app.id}`}>Get</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
