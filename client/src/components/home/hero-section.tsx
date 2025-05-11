import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden relative">
      {/* Abstract shapes in the background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/3 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-28 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16">
          <div className="md:w-1/2 mb-6 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 tracking-tight leading-none">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Discover Amazing Apps
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-xl mx-auto md:mx-0 leading-relaxed">
              Download directly from developers. The smarter way to find your next favorite app.
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-md mx-auto md:mx-0 mb-8">
              <Input 
                placeholder="Search for apps..." 
                className="h-14 pl-12 pr-4 rounded-full text-base text-gray-800 placeholder:text-gray-500 shadow-xl border-0 w-full"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start">
              <Button 
                size="lg" 
                variant="default" 
                className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg font-semibold rounded-full h-14 px-8 text-lg"
                asChild
              >
                <Link href="/apps">Explore Apps</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold rounded-full h-14 px-8 text-lg"
                asChild
              >
                <Link href="/developer">For Developers</Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
            {/* Phone mockup with app screenshots */}
            <div className="relative w-full max-w-md">
              {/* Phone frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 aspect-[9/19]">
                {/* Screen content */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                  <div className="relative h-full w-full bg-gradient-to-br from-indigo-100 to-white">
                    {/* App icons grid */}
                    <div className="grid grid-cols-4 gap-3 p-6">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex items-center justify-center">
                          <div className="w-1/2 h-1/2 bg-white/30 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bottom dock */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                      <div className="bg-gray-200/50 backdrop-blur-md rounded-full h-12 w-3/4 flex items-center justify-around px-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reflection */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/20 blur-md rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
