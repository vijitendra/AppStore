import { Link } from "wouter";
import { Store, Twitter, Facebook, Instagram, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-gray-900 text-white pt-12 pb-6", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-white font-bold text-xl">AppMarket</span>
            </div>
            <p className="text-gray-400 mb-4">
              The alternative app marketplace for developers and users.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">For Users</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/apps" className="text-gray-400 hover:text-white transition-colors">
                  Browse Apps
                </Link>
              </li>
              <li>
                <Link href="/apps/top" className="text-gray-400 hover:text-white transition-colors">
                  Top Charts
                </Link>
              </li>
              <li>
                <Link href="/apps/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/apps/updates" className="text-gray-400 hover:text-white transition-colors">
                  App Updates
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy & Security
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">For Developers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/developer" className="text-gray-400 hover:text-white transition-colors">
                  Developer Console
                </Link>
              </li>
              <li>
                <Link href="/developer/distribution" className="text-gray-400 hover:text-white transition-colors">
                  Distribution
                </Link>
              </li>
              <li>
                <Link href="/developer/analytics" className="text-gray-400 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/developer/monetization" className="text-gray-400 hover:text-white transition-colors">
                  Monetization
                </Link>
              </li>
              <li>
                <Link href="/developer/support" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} AppMarket. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </Link>
            <Link href="/legal" className="text-gray-400 hover:text-white text-sm">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}