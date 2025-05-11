import { Link } from "wouter";
import { Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type App } from "@shared/schema";

interface AppCardHorizontalProps {
  app: App;
  rank?: number;
}

export default function AppCardHorizontal({ app, rank }: AppCardHorizontalProps) {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 rounded-lg">
      {rank && (
        <div className="w-8 flex-shrink-0 font-bold text-gray-400 text-center mr-4">
          {rank}
        </div>
      )}
      <img
        src={app.iconUrl}
        alt={app.name}
        className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0 mr-4"
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
  );
}