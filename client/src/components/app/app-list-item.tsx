import { Link } from "wouter";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { App } from "@shared/schema";

interface AppListItemProps {
  app: App;
  index?: number;
}

export default function AppListItem({ app, index }: AppListItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-all">
      <div className="flex items-center">
        {index !== undefined && (
          <div className="w-6 flex-shrink-0 text-center">
            <span className="font-bold text-lg text-gray-400">{index + 1}</span>
          </div>
        )}
        
        <div className="w-16 h-16 rounded-xl overflow-hidden mx-4 flex-shrink-0 bg-gray-100">
          <img 
            src={app.iconUrl} 
            alt={`${app.name} icon`} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900">{app.name}</h3>
          <p className="text-sm text-gray-500">Developer Name</p>
        </div>
        
        <div className="flex items-center text-sm mr-4">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="font-medium">{app.rating || "New"}</span>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="rounded-full"
          asChild
        >
          <Link href={`/app/${app.id}`}>Get</Link>
        </Button>
      </div>
    </div>
  );
}
