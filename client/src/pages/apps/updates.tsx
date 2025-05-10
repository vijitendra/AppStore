import { useState } from "react";
import StaticPage from "@/components/static-page";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Clock, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AppUpdatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for app updates
  const updates = [
    {
      id: 1,
      appName: "Meditation Master",
      version: "2.3.1",
      date: "May 3, 2023",
      description: "Bug fixes and performance improvements. Fixed crash when using the sleep timer feature.",
      size: "24.5 MB",
      urgent: false
    },
    {
      id: 2,
      appName: "Pixel Weather",
      version: "1.8.0",
      date: "May 2, 2023",
      description: "New feature: 14-day forecast now available. UI improvements and bug fixes.",
      size: "18.7 MB",
      urgent: false
    },
    {
      id: 3,
      appName: "Task Tracker Pro",
      version: "3.2.5",
      date: "May 1, 2023",
      description: "Security update: Fixed vulnerability in data synchronization. Please update as soon as possible.",
      size: "15.2 MB",
      urgent: true
    },
    {
      id: 4,
      appName: "Finance Calculator",
      version: "4.1.2",
      date: "April 29, 2023",
      description: "Added new tax calculation features for 2023 fiscal year. Minor UI improvements.",
      size: "12.8 MB",
      urgent: false
    },
    {
      id: 5,
      appName: "Photo Editor Plus",
      version: "5.7.3",
      date: "April 28, 2023",
      description: "New filters added. Improved export quality options. Fixed memory leak in the cropping tool.",
      size: "35.6 MB",
      urgent: false
    },
    {
      id: 6,
      appName: "Fitness Tracker",
      version: "2.9.0",
      date: "April 25, 2023",
      description: "Major update: Redesigned workout planning screen. Added integration with health apps.",
      size: "28.3 MB",
      urgent: false
    },
    {
      id: 7,
      appName: "Cooking Recipe Book",
      version: "1.5.4",
      date: "April 22, 2023",
      description: "Added 100+ new recipes. Fixed search functionality. Improved ingredient scaling.",
      size: "22.1 MB",
      urgent: false
    },
    {
      id: 8,
      appName: "Secure Messenger",
      version: "6.0.2",
      date: "April 20, 2023",
      description: "Critical security update: Patched encryption vulnerability. All users should update immediately.",
      size: "19.5 MB",
      urgent: true
    }
  ];
  
  const filteredUpdates = updates.filter(update => 
    update.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    update.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StaticPage 
      title="App Updates" 
      description="Check for the latest updates for your installed apps."
    >
      <p className="lead mb-8">
        Keep your apps up-to-date to ensure you have the latest features, improvements, and security fixes.
        Regular updates help maintain app performance and security.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Search for app updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">Check All</Button>
          <Button>Update All</Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Available Updates</h2>
        <p className="text-gray-500">
          The following updates are available for your installed apps.
        </p>
      </div>
      
      {filteredUpdates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Updates Found</h3>
              <p className="text-gray-500">
                No updates match your search criteria. Try a different search term.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map(update => (
            <Card key={update.id} className={update.urgent ? "border-red-300" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{update.appName}</CardTitle>
                      {update.urgent && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Security Update
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Version {update.version} • {update.date} • {update.size}
                    </CardDescription>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>{update.description}</p>
                <Separator className="my-4" />
                <div className="flex justify-between items-center text-sm">
                  <Button variant="link" className="p-0 h-auto">View Full Release Notes</Button>
                  <span className="text-gray-500">Auto-update: On</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="bg-primary/5 p-6 rounded-lg mt-12">
        <h3 className="text-xl font-bold mb-4">Update Settings</h3>
        <p className="mb-4">
          You can customize how AppMarket handles app updates in your account settings.
          Options include automatic updates, notification preferences, and update scheduling.
        </p>
        <Button variant="outline">Manage Update Settings</Button>
      </div>
    </StaticPage>
  );
}