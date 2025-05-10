import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { 
  Loader2, 
  BarChart2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Star, 
  Users, 
  Smartphone, 
  Globe, 
  AlertTriangle 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { App, AppDailyStats, AppDeviceStats, AppGeoStats, AppAcquisitionStats } from "@shared/schema";
import DeveloperLayout from "@/components/developer/developer-layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57"];

// Helper function to format dates
const formatDate = (date: Date): string => {
  return format(date, "MMM dd, yyyy");
};

export default function DeveloperAnalyticsPage() {
  const [selectedApp, setSelectedApp] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState<string>("overview");
  // Remove timeRange state that was replaced with dateRange
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: subDays(new Date(), 30), // Default to last 30 days
    endDate: new Date(),
  });
  
  // Fetch developer's apps
  const { 
    data: apps, 
    isLoading: appsLoading 
  } = useQuery<App[]>({
    queryKey: ["/api/developer/apps"],
  });
  
  // Fetch analytics data based on selected app and date range
  const {
    data: dailyStats,
    isLoading: dailyStatsLoading
  } = useQuery<AppDailyStats[]>({
    queryKey: [
      `/api/developer/apps/${selectedApp}/analytics/daily`, 
      { startDate: dateRange.startDate.toISOString(), endDate: dateRange.endDate.toISOString() }
    ],
    enabled: selectedApp !== "all",
  });
  
  const {
    data: deviceStats,
    isLoading: deviceStatsLoading
  } = useQuery<AppDeviceStats[]>({
    queryKey: [
      `/api/developer/apps/${selectedApp}/analytics/devices`, 
      { startDate: dateRange.startDate.toISOString(), endDate: dateRange.endDate.toISOString() }
    ],
    enabled: selectedApp !== "all" && currentTab === "devices",
  });
  
  const {
    data: geoStats,
    isLoading: geoStatsLoading
  } = useQuery<AppGeoStats[]>({
    queryKey: [
      `/api/developer/apps/${selectedApp}/analytics/geo`, 
      { startDate: dateRange.startDate.toISOString(), endDate: dateRange.endDate.toISOString() }
    ],
    enabled: selectedApp !== "all" && currentTab === "geography",
  });
  
  const {
    data: acquisitionStats,
    isLoading: acquisitionStatsLoading
  } = useQuery<AppAcquisitionStats[]>({
    queryKey: [
      `/api/developer/apps/${selectedApp}/analytics/acquisition`, 
      { startDate: dateRange.startDate.toISOString(), endDate: dateRange.endDate.toISOString() }
    ],
    enabled: selectedApp !== "all" && currentTab === "acquisition",
  });
  
  // Calculate summary metrics from daily stats
  const totalDownloads = selectedApp === "all"
    ? apps?.reduce((sum, app) => sum + app.downloads, 0) || 0
    : dailyStats?.reduce((sum, stat) => sum + stat.downloads, 0) || 0;
  
  const totalActiveUsers = dailyStats?.reduce((sum, stat) => sum + stat.activeUsers, 0) || 0;
  
  const totalNewUsers = dailyStats?.reduce((sum, stat) => sum + stat.newUsers, 0) || 0;
  
  const totalSessions = dailyStats?.reduce((sum, stat) => sum + stat.sessions, 0) || 0;
  
  const avgSessionDuration = dailyStats && dailyStats.length > 0
    ? dailyStats.reduce((sum, stat) => sum + stat.avgSessionDuration, 0) / dailyStats.length
    : 0;
  
  const totalCrashes = dailyStats?.reduce((sum, stat) => sum + stat.crashCount, 0) || 0;
  
  const totalANRs = dailyStats?.reduce((sum, stat) => sum + stat.anrCount, 0) || 0;
  
  // Calculate average rating
  const selectedAppData = selectedApp !== "all" 
    ? apps?.find(app => app.id.toString() === selectedApp) 
    : undefined;
  
  const averageRating = selectedApp !== "all" && selectedAppData
    ? selectedAppData.rating
    : apps && apps.length > 0
      ? apps.reduce((sum, app) => sum + (app.reviewCount > 0 ? app.rating : 0), 0) / 
        apps.filter(app => app.reviewCount > 0).length || 0
      : 0;
  
  // Process daily stats data for charts
  const processedDailyData = dailyStats?.map(stat => ({
    date: format(new Date(stat.date), 'MMM dd'),
    downloads: stat.downloads,
    activeUsers: stat.activeUsers,
    newUsers: stat.newUsers,
    sessions: stat.sessions
  })) || [];
  
  // Process device stats for charts
  const deviceData = deviceStats ? 
    Object.entries(
      deviceStats.reduce((acc: Record<string, number>, stat) => {
        const key = `${stat.deviceModel} (${stat.androidVersion})`;
        acc[key] = (acc[key] || 0) + stat.count;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })) : [];
  
  // Process geo stats for charts
  const geoData = geoStats ? 
    Object.entries(
      geoStats.reduce((acc: Record<string, number>, stat) => {
        acc[stat.country] = (acc[stat.country] || 0) + stat.count;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })) : [];
  
  // Process acquisition stats for charts
  const acquisitionData = acquisitionStats ? 
    Object.entries(
      acquisitionStats.reduce((acc: Record<string, number>, stat) => {
        acc[stat.source] = (acc[stat.source] || 0) + stat.count;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })) : [];
  
  // Calculate app stability metrics
  const crashRate = totalSessions > 0 ? (totalCrashes / totalSessions) * 100 : 0;
  const anrRate = totalSessions > 0 ? (totalANRs / totalSessions) * 100 : 0;
  
  // Generate insights based on the data
  const generateInsights = () => {
    const insights = [];
    
    if (processedDailyData.length > 1) {
      const latestDownloads = processedDailyData[processedDailyData.length - 1].downloads;
      const prevDownloads = processedDailyData[processedDailyData.length - 2].downloads;
      
      if (latestDownloads > prevDownloads) {
        insights.push(`Downloads increased by ${Math.round((latestDownloads - prevDownloads) / prevDownloads * 100)}% on ${processedDailyData[processedDailyData.length - 1].date}`);
      }
    }
    
    if (crashRate > 2) {
      insights.push(`Your app crash rate of ${crashRate.toFixed(1)}% is above the recommended threshold of 2%`);
    } else if (crashRate <= 1) {
      insights.push(`Great job! Your app crash rate is ${crashRate.toFixed(1)}%, which is below the industry average`);
    }
    
    if (totalNewUsers > 0 && totalActiveUsers > 0) {
      const retentionRate = ((totalActiveUsers - totalNewUsers) / totalActiveUsers) * 100;
      insights.push(`Your user retention rate is approximately ${retentionRate.toFixed(1)}%`);
    }
    
    return insights.length > 0 ? insights : ["Not enough data to generate insights yet"];
  };
  
  const insights = generateInsights();
  
  return (
    <div className="p-6">
      <Helmet>
        <title>Analytics - Developer Dashboard</title>
        <meta 
          name="description" 
          content="Analytics and statistics for your apps" 
        />
      </Helmet>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
          <p className="text-gray-500">Track performance metrics for your applications</p>
        </div>
        
        {appsLoading ? (
          <div className="flex justify-center my-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* App selection and date range */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[250px]">
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select App" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apps</SelectItem>
                    {apps?.map(app => (
                      <SelectItem key={app.id} value={app.id.toString()}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
                      {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <div className="flex">
                      <div className="border-r p-2">
                        <Calendar
                          mode="single"
                          selected={dateRange.startDate}
                          onSelect={(date) => date && setDateRange({ ...dateRange, startDate: date })}
                        />
                      </div>
                      <div className="p-2">
                        <Calendar
                          mode="single"
                          selected={dateRange.endDate}
                          onSelect={(date) => date && setDateRange({ ...dateRange, endDate: date })}
                        />
                      </div>
                    </div>
                    <div className="p-2 border-t flex gap-2 justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDateRange({
                          startDate: subDays(new Date(), 7),
                          endDate: new Date()
                        })}
                      >
                        Last Week
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDateRange({
                          startDate: subDays(new Date(), 30),
                          endDate: new Date()
                        })}
                      >
                        Last Month
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDateRange({
                          startDate: subDays(new Date(), 90),
                          endDate: new Date()
                        })}
                      >
                        Last 3 Months
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="mb-6" onValueChange={setCurrentTab}>
              <TabsList className="grid w-full md:w-[600px] grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="geography">Geography</TabsTrigger>
                <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="pt-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                          <h3 className="text-2xl font-bold">{totalDownloads.toLocaleString()}</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Download className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Active Users</p>
                          <h3 className="text-2xl font-bold">{totalActiveUsers.toLocaleString()}</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Average Rating</p>
                          <h3 className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Star className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Crash Rate</p>
                          <h3 className="text-2xl font-bold">{crashRate.toFixed(2)}%</h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                      <CardTitle>Daily Active Users</CardTitle>
                      <CardDescription>User activity over the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {dailyStatsLoading ? (
                          <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : processedDailyData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={processedDailyData}
                              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="activeUsers" 
                                stroke="#8884d8" 
                                activeDot={{ r: 8 }} 
                                name="Active Users"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="newUsers" 
                                stroke="#82ca9d" 
                                name="New Users"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            No data available for the selected time period
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                      <CardTitle>Downloads Trend</CardTitle>
                      <CardDescription>Daily downloads over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {dailyStatsLoading ? (
                          <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : processedDailyData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={processedDailyData}
                              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar
                                dataKey="downloads"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                                name="Downloads"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            No data available for the selected time period
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Session Metrics</CardTitle>
                    <CardDescription>User engagement statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                        <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Avg. Session Duration</h3>
                        <p className="text-2xl font-bold">{Math.round(avgSessionDuration)}s</p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Sessions Per User</h3>
                        <p className="text-2xl font-bold">
                          {totalActiveUsers > 0 ? (totalSessions / totalActiveUsers).toFixed(1) : '0'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Devices Tab */}
              <TabsContent value="devices" className="pt-4">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>Breakdown of user devices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      {deviceStatsLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : deviceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deviceData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(1)}%)`
                              }
                              outerRadius={130}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {deviceData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          No device data available for the selected time period
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>App Stability</CardTitle>
                    <CardDescription>Crash and ANR statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Crash Rate</h3>
                        <p className="text-2xl font-bold">{crashRate.toFixed(2)}%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {totalCrashes} crashes / {totalSessions} sessions
                        </p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">ANR Rate</h3>
                        <p className="text-2xl font-bold">{anrRate.toFixed(2)}%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {totalANRs} ANRs / {totalSessions} sessions
                        </p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Total Crashes</h3>
                        <p className="text-2xl font-bold">{totalCrashes}</p>
                      </div>
                    </div>
                    
                    {dailyStats && dailyStats.length > 0 && (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={processedDailyData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="crashCount" 
                              stroke="#FF8042" 
                              name="Crashes"
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="anrCount" 
                              stroke="#FFBB28" 
                              name="ANRs"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Geography Tab */}
              <TabsContent value="geography" className="pt-4">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>User Geography</CardTitle>
                    <CardDescription>Distribution of users by country</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      {geoStatsLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : geoData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={geoData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(1)}%)`
                              }
                              outerRadius={130}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {geoData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          No geographic data available for the selected time period
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Acquisition Tab */}
              <TabsContent value="acquisition" className="pt-4">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Acquisition Sources</CardTitle>
                    <CardDescription>How users are finding your app</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      {acquisitionStatsLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : acquisitionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={acquisitionData}
                            layout="vertical"
                            margin={{ top: 5, right: 5, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" />
                            <RechartsTooltip />
                            <Bar
                              dataKey="value"
                              fill="var(--primary)"
                              radius={[0, 4, 4, 0]}
                              barSize={30}
                              name="Acquisitions"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          No acquisition data available for the selected time period
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytics Insights</CardTitle>
                <CardDescription>
                  AI-powered insights about your app performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
                {selectedApp === "all" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                    <p className="font-medium">Pro Tip</p>
                    <p>Select a specific app to see more detailed analytics and personalized insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
}