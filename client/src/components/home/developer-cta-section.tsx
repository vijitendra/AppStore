import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function DeveloperCtaSection() {
  const { user } = useAuth();
  
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Are you a developer?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join our marketplace and distribute your apps to millions of users
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user?.isDeveloper ? (
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                asChild
              >
                <Link href="/developer">Go to Developer Dashboard</Link>
              </Button>
            ) : user ? (
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                asChild
              >
                <Link href="/profile/developer">Become a Developer</Link>
              </Button>
            ) : (
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                asChild
              >
                <Link href="/auth?tab=register&developer=true">Create Developer Account</Link>
              </Button>
            )}
            <Button 
              size="lg"
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              asChild
            >
              <Link href="/developer/learn">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
