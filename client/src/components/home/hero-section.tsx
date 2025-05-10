import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary to-blue-400 text-white">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 tracking-tight leading-tight">
              Download Apps <span className="block">Directly</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 text-white/90 max-w-xl">
              The alternative app marketplace for developers and users. Share and discover amazing apps!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                variant="default" 
                className="bg-white text-primary hover:bg-gray-100 shadow-lg font-medium"
                asChild
              >
                <Link href="/apps">Explore Apps</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm text-white border-white/50 hover:bg-white/30 font-medium"
                asChild
              >
                <Link href="/developer">For Developers</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-2xl w-full max-w-md lg:max-w-lg">
              <img 
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="App marketplace showcase" 
                className="w-full h-auto" 
              />
              {/* Optional overlay gradient for better text visibility if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
