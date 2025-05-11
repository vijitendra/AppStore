import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Code, TrendingUp, Rocket, CreditCard } from "lucide-react";

export default function DeveloperCtaSection() {
  const { user } = useAuth();
  
  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Abstract shapes in background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        
        <div className="relative z-10 px-6 py-8 md:py-10 text-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Developer illustration */}
              <div className="flex-shrink-0 bg-white/20 rounded-full p-6 backdrop-blur-md">
                <Code className="h-12 w-12 md:h-16 md:w-16 text-white" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Become an AppMarket Developer</h2>
                <p className="text-base text-white/90 mb-8 max-w-xl">
                  Distribute your Android apps to millions of users and grow your business with powerful analytics and marketing tools.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                  {user?.isDeveloper ? (
                    <Button 
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg"
                      asChild
                    >
                      <Link href="/developer">Go to Developer Dashboard</Link>
                    </Button>
                  ) : user ? (
                    <Button 
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg"
                      asChild
                    >
                      <Link href="/profile/developer">Become a Developer</Link>
                    </Button>
                  ) : (
                    <Button 
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg"
                      asChild
                    >
                      <Link href="/auth?tab=register&developer=true">Create Developer Account</Link>
                    </Button>
                  )}
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                    asChild
                  >
                    <Link href="/developer/learn">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 mr-4">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Distribution</h3>
            <p className="text-sm text-gray-500">Upload your APK and reach users instantly without lengthy approval times.</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600 mr-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
            <p className="text-sm text-gray-500">Track downloads, user engagement, and other critical metrics to grow your app.</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-pink-100 p-3 rounded-lg text-pink-600 mr-4">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Revenue Opportunities</h3>
            <p className="text-sm text-gray-500">Monetize your apps with multiple payment options and subscription models.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
