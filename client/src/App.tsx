import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, DeveloperRoute, AdminRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AppsPage from "@/pages/apps-page";
import AppDetailsPage from "@/pages/app-details-page";
import VideoPlayerPage from "@/pages/video-player-page";
import AboutPage from "@/pages/about";
import CareersPage from "@/pages/careers";
import BlogPage from "@/pages/blog";
import PressPage from "@/pages/press";
import ContactPage from "@/pages/contact";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import AppUpdatesPage from "@/pages/apps/updates";
import ProfilePage from "@/pages/profile-page";

// Developer pages
import DeveloperDashboard from "@/pages/developer/dashboard";
import DeveloperAppsPage from "@/pages/developer/apps";
import DeveloperAnalyticsPage from "@/pages/developer/analytics";
import DeveloperProfilePage from "@/pages/developer/profile";
import DeveloperSettingsPage from "@/pages/developer/settings";
import DeveloperDistributionPage from "@/pages/developer/distribution";
import DeveloperSupportPage from "@/pages/developer/support";
import AppUploadPage from "@/pages/developer/app-upload";
import AppEditPage from "@/pages/developer/app-edit";
import DeveloperVideosPage from "@/pages/developer/videos";
import VideoUploadPage from "@/pages/developer/video-upload";
import VideoEditPage from "@/pages/developer/video-edit";

// Admin pages
import AdminUserManagementPage from "@/pages/admin/index";
import AdminAppsPage from "@/pages/admin/apps";
import AdminApprovalsPage from "@/pages/admin/approvals";
import AdminReviewsPage from "@/pages/admin/reviews";
import AdminAnalyticsPage from "@/pages/admin/analytics";
import AppApprovalPage from "@/pages/admin/app-approval-page";
import DeveloperRequestsPage from "@/pages/admin/developer-requests";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/app/:id" component={AppDetailsPage} />
      <Route path="/videos/:id" component={VideoPlayerPage} />
      <Route path="/apps" component={AppsPage} />
      <Route path="/apps/categories" component={AppsPage} />
      <Route path="/apps/category/:category/:subcategory?" component={AppsPage} />
      <Route path="/apps/developer/:developerId" component={AppsPage} />
      <Route path="/apps/top" component={AppsPage} />
      <Route path="/apps/search" component={AppsPage} />
      {/* Static pages */}
      <Route path="/about" component={AboutPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/press" component={PressPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookies" component={NotFound} />
      <Route path="/legal" component={NotFound} />
      <Route path="/apps/updates" component={AppUpdatesPage} />
      
      {/* User profile route */}
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Developer routes */}
      <DeveloperRoute path="/developer" component={DeveloperDashboard} />
      <DeveloperRoute path="/developer/apps" component={DeveloperAppsPage} />
      <DeveloperRoute path="/developer/analytics" component={DeveloperAnalyticsPage} />
      <DeveloperRoute path="/developer/profile" component={DeveloperProfilePage} />
      <DeveloperRoute path="/developer/settings" component={DeveloperSettingsPage} />
      <DeveloperRoute path="/developer/distribution" component={DeveloperDistributionPage} />
      <DeveloperRoute path="/developer/support" component={DeveloperSupportPage} />
      <DeveloperRoute path="/developer/app/upload" component={AppUploadPage} />
      <DeveloperRoute path="/developer/app/:id" component={AppEditPage} />
      <DeveloperRoute path="/developer/videos" component={DeveloperVideosPage} />
      <DeveloperRoute path="/developer/video-upload" component={VideoUploadPage} />
      <DeveloperRoute path="/developer/video-edit/:id" component={VideoEditPage} />
      
      {/* Admin routes */}
      <AdminRoute path="/admin" component={AdminUserManagementPage} />
      <AdminRoute path="/admin/developer-requests" component={DeveloperRequestsPage} />
      <AdminRoute path="/admin/apps" component={AdminAppsPage} />
      <AdminRoute path="/admin/approvals" component={AdminApprovalsPage} />
      <AdminRoute path="/admin/reviews" component={AdminReviewsPage} />
      <AdminRoute path="/admin/analytics" component={AdminAnalyticsPage} />
      <AdminRoute path="/admin/app-approval" component={AppApprovalPage} />
      
      {/* Default 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="appmarket-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
