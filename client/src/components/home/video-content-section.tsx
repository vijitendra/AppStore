import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Film, Play, Video, Film as FilmIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

// Define Video interface based on our schema
interface Video {
  id: number;
  title: string;
  description: string;
  videoPath: string;
  thumbnailPath: string;
  category: string;
  subCategory?: string;
  tags?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string | number;
  developerId: number;
  createdAt: string;
  updatedAt: string;
  developer?: {
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

export default function VideoContentSection() {
  // Fetch videos from our API
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Define video-specific responsive card styles
  const cardClasses = "relative overflow-hidden rounded-lg aspect-video group";
  const imgClasses = "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105";
  const overlayClasses = "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-2 sm:p-3 md:p-4";
  const titleClasses = "text-white font-semibold text-xs sm:text-sm md:text-base mb-1 line-clamp-1";
  const metaClasses = "text-white/70 text-[10px] sm:text-xs md:text-sm flex items-center";

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <FilmIcon className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold">Videos & Movies</h2>
        </div>
        <Button variant="link" className="text-indigo-600 flex items-center" asChild>
          <Link href="#videos" onClick={(e) => {
            e.preventDefault();
            // Find videos tab and click it programmatically
            document.querySelector('[value="videos"]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }}>
            See all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="p-6">
        <Tabs defaultValue="movies" className="w-full">
          <div className="overflow-x-auto mb-6 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <TabsList className="bg-gray-100/70 p-1 backdrop-blur-sm min-w-max inline-flex rounded-md">
              <TabsTrigger value="movies" className="rounded-sm py-2 px-4 flex-shrink-0 whitespace-nowrap">
                <Film className="h-4 w-4 mr-2" />
                <span>Movies</span>
              </TabsTrigger>
              <TabsTrigger value="shorts" className="rounded-sm py-2 px-4 flex-shrink-0 whitespace-nowrap">
                <Play className="h-4 w-4 mr-2" />
                <span>Short Videos</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-sm py-2 px-4 flex-shrink-0 whitespace-nowrap">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-sm py-2 px-4 flex-shrink-0 whitespace-nowrap">
                <Video className="h-4 w-4 mr-2" />
                <span>New Releases</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Movies Tab */}
          <TabsContent value="movies" className="m-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="aspect-video w-full rounded-lg" />
                ))}
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {videos.filter(video => video.category === "Gameplay" || video.category === "Movie").slice(0, 3).map((video) => (
                  <Link key={video.id} href={`/videos/${video.id}`}>
                    <div className={cardClasses}>
                      <img 
                        src={video.thumbnailPath} 
                        alt={video.title}
                        className={imgClasses}
                      />
                      <div className={overlayClasses}>
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                          {video.category}
                        </div>
                        <div className={titleClasses}>{video.title}</div>
                        <div className={metaClasses}>
                          <span className="mr-2 sm:mr-3">{video.viewCount} views</span>
                          <span>{video.duration || "1:30"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No movies available at the moment.</p>
              </div>
            )}
          </TabsContent>

          {/* Short Videos Tab */}
          <TabsContent value="shorts" className="m-0">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
                ))}
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {videos.slice(0, 5).map((video) => (
                  <Link key={video.id} href={`/videos/${video.id}`}>
                    <div className="relative overflow-hidden rounded-lg aspect-[9/16] group">
                      <img 
                        src={video.thumbnailPath} 
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2 sm:p-3">
                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-white text-indigo-600 rounded-full p-1 sm:p-1.5">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                        </div>
                        <div className="text-white text-[10px] sm:text-xs font-medium line-clamp-2">{video.title}</div>
                        <div className="text-white/70 text-[10px] sm:text-xs mt-0.5">{video.viewCount} views</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No short videos available at the moment.</p>
              </div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="m-0">
            <div className="text-center py-10">
              <p className="text-gray-500">Trending videos coming soon.</p>
            </div>
          </TabsContent>

          {/* New Releases Tab */}
          <TabsContent value="new" className="m-0">
            <div className="text-center py-10">
              <p className="text-gray-500">New releases coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}