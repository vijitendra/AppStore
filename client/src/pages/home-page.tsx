import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import CategoriesSection from "@/components/home/categories-section";
import FeaturedAppsSection from "@/components/home/featured-apps-section";
import AppTabSection from "@/components/home/app-tab-section";
import VideoContentSection from "@/components/home/video-content-section";
import DeveloperCtaSection from "@/components/home/developer-cta-section";
import DeveloperLeaderboard from "@/components/home/developer-leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Gamepad2, Zap, TrendingUp, Film } from "lucide-react";

export default function HomePage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("for-you");
  
  // Check for tab parameter in URL
  useEffect(() => {
    // Check if we should activate the videos tab
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get("tab");
    
    if (tabParam === "videos") {
      setActiveTab("videos");
    }
  }, [location]);
  return (
    <>
      <Helmet>
        <title>AppMarket - Alternative Android App Marketplace</title>
        <meta name="description" content="Download Android apps directly from developers. AppMarket is the alternative app store where developers can upload APK/AAB files and users can browse, download, and share apps." />
        <meta property="og:title" content="AppMarket - Alternative Android App Marketplace" />
        <meta property="og:description" content="Download Android apps directly from developers. AppMarket is the alternative app store where developers can upload APK/AAB files and users can browse, download, and share apps." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow bg-gray-50 pb-12">
          {/* Main Navigation Tabs */}
          <div className="container mx-auto px-4 mt-6 mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                <TabsList className="bg-white rounded-md h-12 shadow-md w-full flex p-1 min-w-max">
                  <TabsTrigger value="for-you" className="rounded-md flex-1 whitespace-nowrap px-4">For You</TabsTrigger>
                  <TabsTrigger value="top-charts" className="rounded-md flex-1 whitespace-nowrap px-4">Top Charts</TabsTrigger>
                  <TabsTrigger value="categories" className="rounded-md flex-1 whitespace-nowrap px-4">Categories</TabsTrigger>
                  <TabsTrigger value="videos" className="rounded-md flex-1 whitespace-nowrap px-4">Videos</TabsTrigger>
                  <TabsTrigger value="children" className="rounded-md flex-1 whitespace-nowrap px-4">Children</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="for-you" className="mt-6 space-y-8">
                {/* Featured Apps with scroll - Latest apps on top */}
                <FeaturedAppsSection />
                
                {/* Top Charts - Most downloaded apps */}
                <AppTabSection 
                  title="Top Charts" 
                  icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
                  tabs={[
                    { id: "top-free", label: "Top Free" },
                    { id: "top-paid", label: "Top Paid" },
                    { id: "trending", label: "Trending" }
                  ]}
                  href="/apps/top"
                />
                
                {/* Top Games - Most downloaded games */}
                <AppTabSection 
                  title="Top Games" 
                  icon={<Gamepad2 className="h-5 w-5 text-indigo-600" />}
                  tabs={[
                    { id: "action", label: "Action" },
                    { id: "arcade", label: "Arcade" },
                    { id: "puzzle", label: "Puzzle" }
                  ]}
                  href="/apps/category/Games"
                />
                
                {/* Essential Apps */}
                <AppTabSection 
                  title="Essential Apps" 
                  icon={<Zap className="h-5 w-5 text-indigo-600" />}
                  tabs={[
                    { id: "productivity", label: "Productivity" },
                    { id: "social", label: "Social" },
                    { id: "tools", label: "Tools" }
                  ]}
                  href="/apps"
                />
                
                {/* Developer CTA */}
                <DeveloperCtaSection />
              </TabsContent>
              
              <TabsContent value="top-charts" className="mt-6 space-y-8">
                {/* Only show Top Charts section with most downloaded apps first */}
                <AppTabSection 
                  title="Top Charts" 
                  icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
                  tabs={[
                    { id: "top-free", label: "Top Free" },
                    { id: "top-paid", label: "Top Paid" },
                    { id: "top-grossing", label: "Top Grossing" },
                    { id: "trending", label: "Trending" }
                  ]}
                  href="/apps/top"
                />
                
                {/* Top Games by downloads */}
                <AppTabSection 
                  title="Top Games" 
                  icon={<Gamepad2 className="h-5 w-5 text-indigo-600" />}
                  tabs={[
                    { id: "action", label: "Action" },
                    { id: "arcade", label: "Arcade" },
                    { id: "puzzle", label: "Puzzle" }
                  ]}
                  href="/apps/category/Games"
                />
              </TabsContent>
              
              <TabsContent value="categories" className="mt-6">
                <CategoriesSection />
              </TabsContent>
              
              <TabsContent value="videos" className="mt-6">
                <VideoContentSection />
              </TabsContent>
              
              <TabsContent value="children" className="mt-6 text-center p-8 bg-white rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold mb-3">Kids Section Coming Soon</h2>
                <p className="text-gray-500">Content for children will be available soon.</p>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Developer Leaderboard */}
          <DeveloperLeaderboard />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
