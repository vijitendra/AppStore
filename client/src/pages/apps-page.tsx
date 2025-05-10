import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { App } from "@shared/schema";
import AppCard from "@/components/app/app-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [location] = useLocation();
  const params = useParams();
  const category = params?.category;
  const subcategory = params?.subcategory;
  const developerId = params?.developerId;
  const query = new URLSearchParams(location.split("?")[1] || "").get("q");
  
  // Get all apps
  const { 
    data: allApps, 
    isLoading: isLoadingAllApps 
  } = useQuery<App[]>({
    queryKey: ["/api/apps"],
    enabled: activeTab === "all" && !query && !category,
  });
  
  // Get top apps
  const { 
    data: topApps, 
    isLoading: isLoadingTopApps 
  } = useQuery<App[]>({
    queryKey: ["/api/apps/top"],
    enabled: activeTab === "top" && !query && !category,
  });
  
  // Get featured apps
  const { 
    data: featuredApps, 
    isLoading: isLoadingFeaturedApps 
  } = useQuery<App[]>({
    queryKey: ["/api/apps/featured"],
    enabled: activeTab === "featured" && !query && !category,
  });
  
  // Search apps
  const { 
    data: searchResults, 
    isLoading: isLoadingSearch 
  } = useQuery<App[]>({
    queryKey: ["/api/apps/search", query],
    enabled: !!query && !category,
  });
  
  // Get apps by category and subcategory
  const { 
    data: categoryApps, 
    isLoading: isLoadingCategory 
  } = useQuery<App[]>({
    queryKey: [
      `/api/apps/category/${category}`, 
      subcategory ? { subcategory } : undefined
    ],
    queryFn: async ({ queryKey }) => {
      // Check if we have a subcategory from path param
      let subCat = subcategory;
      
      // If not from path, check URL query parameters
      if (!subCat) {
        const urlParams = new URLSearchParams(location.split("?")[1] || "");
        subCat = urlParams.get("subcategory") || undefined;
        console.log("Subcategory from query params:", subCat);
      }
      
      // If subcategory is present, add it as a query parameter
      const url = subCat 
        ? `${queryKey[0]}?subcategory=${encodeURIComponent(subCat)}` 
        : queryKey[0] as string;
        
      console.log("Fetching category apps from:", url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch category apps');
      }
      return await response.json();
    },
    enabled: !!category && !developerId,
  });
  
  // Get apps by developer
  const { 
    data: developerData, 
    isLoading: isLoadingDeveloper 
  } = useQuery<{developer: {username: string, firstName?: string, lastName?: string}, apps: App[]}>({
    queryKey: [`/api/apps/developer/${developerId}`],
    enabled: !!developerId,
  });

  useEffect(() => {
    if (query) setActiveTab("search");
  }, [query]);

  const renderApps = () => {
    // If developer is set, it takes precedence
    if (developerId && developerData) {
      return developerData.apps;
    }
    
    // If category is set, it takes precedence
    if (category && categoryApps) {
      return categoryApps;
    }
    
    // Then check for search
    if (query && searchResults) {
      return searchResults;
    }
    
    // Otherwise use the tabs
    switch (activeTab) {
      case "all":
        return allApps || [];
      case "top":
        return topApps || [];
      case "featured":
        return featuredApps || [];
      default:
        return [];
    }
  };

  const isLoading = developerId
    ? isLoadingDeveloper
    : category
      ? isLoadingCategory
      : query 
        ? isLoadingSearch 
        : activeTab === "all" 
          ? isLoadingAllApps 
          : activeTab === "top" 
            ? isLoadingTopApps 
            : isLoadingFeaturedApps;

  // Get subcategory from URL params if not in path params
  const urlSubcategory = 
    subcategory || new URLSearchParams(location.split("?")[1] || "").get("subcategory") || undefined;

  return (
    <>
      <Helmet>
        <title>
          {developerId && developerData
            ? `Apps by ${developerData.developer.firstName && developerData.developer.lastName 
                ? `${developerData.developer.firstName} ${developerData.developer.lastName}` 
                : developerData.developer.username} - AppMarket`
            : category && urlSubcategory
              ? `${urlSubcategory} ${category} Apps - AppMarket`
              : category
                ? `${category} Apps - AppMarket`
                : query 
                  ? `Search: ${query} - AppMarket` 
                  : activeTab === "top" 
                    ? "Top Apps - AppMarket" 
                    : activeTab === "featured" 
                      ? "Featured Apps - AppMarket" 
                      : "All Apps - AppMarket"}
        </title>
        <meta 
          name="description" 
          content="Browse and download Android apps directly from developers. AppMarket is the alternative app store where you can find the best Android applications." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">
              {developerId && developerData
                ? `Apps by ${developerData.developer.firstName && developerData.developer.lastName 
                    ? `${developerData.developer.firstName} ${developerData.developer.lastName}` 
                    : developerData.developer.username}`
                : category && urlSubcategory
                  ? `${urlSubcategory} ${category} Apps`
                  : category
                    ? `${category} Apps`
                    : query 
                      ? `Search Results: ${query}` 
                      : activeTab === "top" 
                        ? "Top Apps" 
                        : activeTab === "featured" 
                          ? "Featured Apps" 
                          : "All Apps"}
            </h1>
            
            {developerId && developerData ? (
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <div className="flex items-center">
                  <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {developerData.developer.firstName?.charAt(0) || developerData.developer.username.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-xl">
                      {developerData.developer.firstName && developerData.developer.lastName 
                        ? `${developerData.developer.firstName} ${developerData.developer.lastName}` 
                        : developerData.developer.username}
                    </h2>
                    <p className="text-sm text-gray-500">Developer on AppMarket</p>
                  </div>
                </div>
              </div>
            ) : !query && !category && !developerId && (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList>
                  <TabsTrigger value="all">All Apps</TabsTrigger>
                  <TabsTrigger value="top">Top Charts</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {isLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : renderApps().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {renderApps().map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            ) : (
              <div className="text-center my-12">
                <h3 className="text-xl font-medium mb-2">No apps found</h3>
                <p className="text-gray-500">
                  {query 
                    ? `No results found for "${query}". Try a different search term.`
                    : "There are no apps available in this category yet."}
                </p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}