import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import CategoriesSection from "@/components/home/categories-section";
import FeaturedAppsSection from "@/components/home/featured-apps-section";
import TopChartsSection from "@/components/home/top-charts-section";
import DeveloperCtaSection from "@/components/home/developer-cta-section";

export default function HomePage() {
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
        
        <main className="flex-grow">
          <HeroSection />
          <CategoriesSection />
          <FeaturedAppsSection />
          <TopChartsSection />
          <DeveloperCtaSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
