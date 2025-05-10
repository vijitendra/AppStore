import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Store, Search, Menu, X, User, LogOut, Shield } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    if (showMobileSearch) setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (showMobileMenu) setShowMobileMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/apps/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-2 lg:gap-4">
          {/* Logo - smaller on mobile, normal size on desktop */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-gray-900 font-bold text-base sm:text-xl">AppMarket</span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links - hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/apps/categories" className="text-gray-700 hover:text-primary font-medium">
              Categories
            </Link>
            <Link href="/apps/top" className="text-gray-700 hover:text-primary font-medium">
              Top Charts
            </Link>
          </div>
          
          {/* Desktop Search - takes available space */}
          <div className="hidden md:flex flex-grow max-w-md mx-2 lg:mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="Search apps..." 
                  className="w-full pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </form>
          </div>
          
          {/* Nav Items and Auth - right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden p-1.5"
              onClick={toggleMobileSearch}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            {/* Auth Buttons or User Menu */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {user.isDeveloper && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex justify-center items-center text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9" 
                    asChild
                  >
                    <Link href="/developer">Developer Dashboard</Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={user.profilePicture || ""} />
                        <AvatarFallback className="text-xs sm:text-sm">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-xs sm:text-sm font-medium">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {user.isDeveloper && (
                      <DropdownMenuItem onClick={() => navigate("/developer")}>
                        <Store className="h-4 w-4 mr-2" />
                        <span>Developer Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {user.isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:flex justify-center items-center text-xs sm:text-sm h-8 sm:h-9" 
                  asChild
                >
                  <Link href="/auth">Log in</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="hidden sm:flex justify-center items-center text-xs sm:text-sm h-8 sm:h-9 ml-2" 
                  asChild
                >
                  <Link href="/auth?tab=register">Sign up</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="sm:hidden p-1.5"
              onClick={toggleMobileMenu}
            >
              {showMobileMenu ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search */}
        {showMobileSearch && (
          <div className="md:hidden py-3 border-t mt-3 animate-in fade-in slide-in-from-top-5 duration-200">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search apps..." 
                  className="w-full pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </form>
          </div>
        )}
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden py-4 border-t mt-3 space-y-3 animate-in fade-in slide-in-from-top-5 duration-200">
            <Link href="/" className="block py-2 text-gray-700 font-medium">
              Home
            </Link>
            <Link href="/apps/categories" className="block py-2 text-gray-700 font-medium">
              Categories
            </Link>
            <Link href="/apps/top" className="block py-2 text-gray-700 font-medium">
              Top Charts
            </Link>
            {user?.isDeveloper && (
              <Link href="/developer" className="block py-2 text-gray-700 font-medium">
                Developer Dashboard
              </Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="block py-2 text-gray-700 font-medium">
                Admin Dashboard
              </Link>
            )}
            {!user && (
              <div className="pt-2 flex space-x-3">
                <Button className="flex-1 flex justify-center items-center" variant="outline" asChild>
                  <Link href="/auth">Log in</Link>
                </Button>
                <Button className="flex-1 flex justify-center items-center" asChild>
                  <Link href="/auth?tab=register">Sign up</Link>
                </Button>
              </div>
            )}
            {user && (
              <Button className="w-full flex justify-center items-center" variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
