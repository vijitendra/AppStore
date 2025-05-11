import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

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
  duration: number;
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

export default function VideoPlayerPage() {
  const [, params] = useRoute<{ id: string }>("/videos/:id");
  const videoId = params?.id ? parseInt(params.id) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!videoId) {
      setError("Video ID not provided");
      setIsLoading(false);
      return;
    }

    fetch(`/api/videos/${videoId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load video (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setVideo(data);
        // Increment view count
        fetch(`/api/videos/${videoId}/view`, { method: 'POST' }).catch(e => console.error('Failed to record view:', e));
      })
      .catch(err => {
        console.error('Error loading video:', err);
        setError(err.message || "Failed to load video");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-500">Loading video...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error || "Video not found"}
            </div>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{video.title} | AppMarket</title>
        <meta name="description" content={video.description || `Watch ${video.title} on AppMarket`} />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow bg-gray-50 py-6">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4"
                asChild
              >
                <Link href="/?tab=videos">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Videos
                </Link>
              </Button>
              
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                <video 
                  src={video.videoPath} 
                  poster={video.thumbnailPath} 
                  controls 
                  autoPlay 
                  className="w-full max-h-[70vh]"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <div className="border-b pb-4 mb-4">
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4">
                  <span>{video.viewCount + 1} views</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">{video.category}</span>
                  {video.subCategory && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full">{video.subCategory}</span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="font-medium mb-2">Description</div>
                <p className="text-gray-700 whitespace-pre-line">{video.description}</p>
              </div>
              
              {video.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {video.tags.split(',').map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="font-medium mb-2">Developer</div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0">
                    {video.developer?.profilePicture ? (
                      <img 
                        src={video.developer.profilePicture} 
                        alt={video.developer.username || 'Developer'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {(video.developer?.username?.[0] || 'D').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{video.developer?.username || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">
                      {video.developer?.firstName && video.developer?.lastName 
                        ? `${video.developer.firstName} ${video.developer.lastName}` 
                        : 'Developer'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}