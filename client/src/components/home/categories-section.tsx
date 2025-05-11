import { Link } from "wouter";
import { appCategories, appSubCategories } from "@shared/schema";
import { 
  Gamepad2, 
  Camera, 
  Briefcase, 
  Music, 
  Utensils, 
  MoreHorizontal,
  Book,
  MessageCircle,
  Pencil,
  Heart,
  Newspaper,
  BarChart3,
  CircleDollarSign,
  Film,
  Play,
  VideoIcon,
  PanelTop,
  ShoppingCart,
  Map,
  Palette,
  CloudSun,
  Flame,
  Truck,
  LineChart
} from "lucide-react";

// Map categories to icons and colors
const categoryInfo: Record<string, { icon: React.ReactNode; color: string }> = {
  "Games": { 
    icon: <Gamepad2 className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-red-500 to-pink-500" 
  },
  "Social": { 
    icon: <MessageCircle className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-blue-500 to-indigo-500" 
  },
  "Communication": { 
    icon: <MessageCircle className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-green-500 to-teal-500" 
  },
  "Productivity": { 
    icon: <Briefcase className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-indigo-500 to-purple-500" 
  },
  "Education": { 
    icon: <Book className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-amber-500 to-orange-500" 
  },
  "Entertainment": { 
    icon: <Pencil className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-violet-500 to-fuchsia-500" 
  },
  "Music": { 
    icon: <Music className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-purple-500 to-pink-500" 
  },
  "Photography": { 
    icon: <Camera className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-blue-500 to-cyan-500" 
  },
  "Tools": { 
    icon: <Briefcase className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-slate-600 to-slate-800" 
  },
  "Finance": { 
    icon: <CircleDollarSign className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-emerald-500 to-green-600" 
  },
  "Health & Fitness": { 
    icon: <Heart className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-red-500 to-orange-500" 
  },
  "Books & Reference": { 
    icon: <Book className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-stone-500 to-stone-700" 
  },
  "News & Magazines": { 
    icon: <Newspaper className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-gray-700 to-gray-900" 
  },
  "Video": { 
    icon: <Film className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-red-600 to-rose-700" 
  },
  "Food": { 
    icon: <Utensils className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-yellow-500 to-amber-600" 
  },
  "Shopping": { 
    icon: <ShoppingCart className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-teal-500 to-cyan-600" 
  },
  "Travel": { 
    icon: <Map className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-sky-500 to-blue-600" 
  },
  "Art & Design": { 
    icon: <Palette className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-fuchsia-500 to-purple-700" 
  },
  "Weather": { 
    icon: <CloudSun className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-blue-400 to-indigo-500" 
  },
  "Sports": { 
    icon: <Flame className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-orange-500 to-red-600" 
  },
  "Business": { 
    icon: <LineChart className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-gray-700 to-slate-800" 
  },
  "More": { 
    icon: <MoreHorizontal className="h-8 w-8" />, 
    color: "bg-gradient-to-br from-gray-400 to-gray-600" 
  }
};

// Map subcategory info
const subCategoryInfo: Record<string, { icon: React.ReactNode; color: string }> = {
  "Movies": { 
    icon: <Film className="h-6 w-6" />, 
    color: "bg-gradient-to-br from-red-500 to-orange-600" 
  },
  "Short Videos": { 
    icon: <Play className="h-6 w-6" />, 
    color: "bg-gradient-to-br from-pink-500 to-rose-600" 
  },
  "Videos": { 
    icon: <VideoIcon className="h-6 w-6" />, 
    color: "bg-gradient-to-br from-purple-500 to-indigo-600" 
  }
};

export default function CategoriesSection() {
  // Add some more diverse categories even if they're not in the real schema yet
  const allCategories = [
    ...appCategories,
    "Shopping",
    "Travel",
    "Art & Design",
    "Weather",
    "Sports",
    "Business"
  ];
  
  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold">Categories</h2>
      </div>
      
      <div className="p-6">
        {/* Top Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {["Games", "Social", "Productivity", "Entertainment"].map((category) => (
            <Link
              key={category}
              href={`/apps/category/${category}`}
              className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-sm transition-transform hover:scale-[1.02] duration-200"
            >
              <div className={`absolute inset-0 ${categoryInfo[category]?.color || "bg-gradient-to-br from-gray-600 to-gray-800"}`}></div>
              <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-4">
                <div className="text-white mb-2">
                  {categoryInfo[category]?.icon || <BarChart3 className="h-8 w-8" />}
                </div>
                <h3 className="font-semibold text-white text-lg">{category}</h3>
              </div>
            </Link>
          ))}
        </div>
        
        {/* All Categories */}
        <h3 className="text-lg font-semibold mb-4">All Categories</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-y-6">
          {allCategories.map((category) => (
            <Link
              key={category}
              href={`/apps/category/${category}`}
              className="flex flex-col items-center justify-center text-center group"
            >
              <div className={`w-12 h-12 ${categoryInfo[category]?.color || "bg-gradient-to-br from-gray-600 to-gray-800"} rounded-full flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform duration-200`}>
                {categoryInfo[category]?.icon || <BarChart3 className="h-6 w-6" />}
              </div>
              <span className="text-xs font-medium text-gray-700 line-clamp-2 px-1">{category}</span>
            </Link>
          ))}
        </div>
        
        {/* Featured Category Showcase */}
        <div className="mt-10">
          <div className="flex items-center space-x-2 mb-4">
            <Film className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Video</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {appSubCategories["Video"].map(subCategory => (
              <Link
                key={`Video-${subCategory}`}
                href={`/apps/category/Video?subcategory=${encodeURIComponent(subCategory)}`}
                className="bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg p-3 transition-all flex items-center"
              >
                <div className={`w-10 h-10 ${subCategoryInfo[subCategory]?.color || "bg-indigo-500"} rounded-full flex items-center justify-center text-white mr-3`}>
                  {subCategoryInfo[subCategory]?.icon || <Film className="h-5 w-5" />}
                </div>
                <span className="font-medium">{subCategory}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
