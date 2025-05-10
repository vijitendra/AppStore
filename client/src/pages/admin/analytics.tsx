import { Helmet } from "react-helmet";
import { Activity, Download, Users, Smartphone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Platform Analytics - Admin Dashboard</title>
        <meta 
          name="description" 
          content="View platform-wide analytics and statistics" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Track platform performance, user growth, and app statistics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Downloads</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              248,512
              <Download className="ml-2 h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+12.5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registered Users</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              65,204
              <Users className="ml-2 h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+8.3% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Apps</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              1,284
              <Smartphone className="ml-2 h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+15.2% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Countries Reached</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              154
              <MapPin className="ml-2 h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+3 new countries this month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="downloads" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Download Trends
              </CardTitle>
              <CardDescription>
                App download statistics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-muted-foreground">
                  Analytics charts will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Growth
              </CardTitle>
              <CardDescription>
                New user registration metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-muted-foreground">
                  User growth charts will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                User Engagement
              </CardTitle>
              <CardDescription>
                Platform engagement and retention metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-muted-foreground">
                  Engagement analytics will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}