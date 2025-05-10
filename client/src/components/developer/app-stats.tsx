import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { App } from "@shared/schema";

interface AppStatsProps {
  apps: App[];
}

export default function AppStats({ apps }: AppStatsProps) {
  // Prepare data for downloads chart
  const downloadsData = apps.slice(0, 5).map(app => ({
    name: app.name,
    downloads: app.downloads
  }));
  
  // Prepare data for ratings chart
  const ratingsData = apps
    .filter(app => app.rating > 0)
    .slice(0, 5)
    .map(app => ({
      name: app.name,
      rating: app.rating
    }));
  
  // Calculate total downloads by category
  const downloadsByCategory = apps.reduce((acc, app) => {
    const category = app.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += app.downloads;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(downloadsByCategory)
    .map(([name, downloads]) => ({ name, downloads }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);
  
  const chartHeight = 300;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Apps by Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          {downloadsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={downloadsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} downloads`, "Downloads"]}
                  labelStyle={{ color: "#0f172a" }}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem"
                  }}
                />
                <Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No download data available
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Downloads by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} downloads`, "Downloads"]}
                  labelStyle={{ color: "#0f172a" }}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem"
                  }}
                />
                <Bar dataKey="downloads" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>App Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {ratingsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={ratingsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip 
                  formatter={(value) => [`${value} stars`, "Rating"]}
                  labelStyle={{ color: "#0f172a" }}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem"
                  }}
                />
                <Bar dataKey="rating" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No rating data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
