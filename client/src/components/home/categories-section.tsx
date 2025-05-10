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
  VideoIcon
} from "lucide-react";

// Map categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  "Games": <Gamepad2 className="h-8 w-8" />,
  "Social": <MessageCircle className="h-8 w-8" />,
  "Communication": <MessageCircle className="h-8 w-8" />,
  "Productivity": <Briefcase className="h-8 w-8" />,
  "Education": <Book className="h-8 w-8" />,
  "Entertainment": <Pencil className="h-8 w-8" />,
  "Music": <Music className="h-8 w-8" />,
  "Photography": <Camera className="h-8 w-8" />,
  "Tools": <Briefcase className="h-8 w-8" />,
  "Finance": <CircleDollarSign className="h-8 w-8" />,
  "Health & Fitness": <Heart className="h-8 w-8" />,
  "Books & Reference": <Book className="h-8 w-8" />,
  "News & Magazines": <Newspaper className="h-8 w-8" />,
  "Video": <Film className="h-8 w-8" />,
  "Food": <Utensils className="h-8 w-8" />,
  "More": <MoreHorizontal className="h-8 w-8" />
};

// Map subcategory icons
const subCategoryIcons: Record<string, React.ReactNode> = {
  "Movies": <Film className="h-6 w-6" />,
  "Short Videos": <Play className="h-6 w-6" />,
  "Videos": <VideoIcon className="h-6 w-6" />
};

export default function CategoriesSection() {
  // Filter out Video category from regular display
  const regularCategories = appCategories.filter(cat => cat !== "Video").slice(0, 10);
  const displayCategories = [...regularCategories, "More"];
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
        
        {/* Video Category with Subcategories */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Film className="h-6 w-6 mr-2 text-primary" /> 
            <Link href="/apps/category/Video" className="hover:underline">Video</Link>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {appSubCategories["Video"].map(subCategory => (
              <Link
                key={`Video-${subCategory}`}
                href={`/apps/category/Video?subcategory=${encodeURIComponent(subCategory)}`}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-all flex items-center"
              >
                <div className="text-primary mr-3">
                  {subCategoryIcons[subCategory]}
                </div>
                <span className="font-medium">{subCategory}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Other Categories */}
        <h3 className="text-xl font-semibold mb-4">Other Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayCategories.map((category) => (
            <div key={category} className="flex flex-col">
              <Link
                href={category === "More" ? "/apps/categories" : `/apps/category/${category}`}
                className="bg-gray-100 hover:bg-gray-200 rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center"
              >
                <div className="text-primary mb-2">
                  {categoryIcons[category] || <BarChart3 className="h-8 w-8" />}
                </div>
                <h3 className="font-medium">{category}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
