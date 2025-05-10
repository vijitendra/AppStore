import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Trash2, AlertCircle, Package, User } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Review } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  
  // Get all reviews
  const { 
    data: reviews, 
    isLoading: isLoadingReviews 
  } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
  });
  
  // Mutation to delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const res = await apiRequest(
        "DELETE", 
        `/api/admin/reviews/${reviewId}`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Deleted",
        description: "The review has been deleted successfully",
        variant: "default",
      });
      setDeletingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
      setDeletingReviewId(null);
    },
  });
  
  // Handler for deleting review
  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      setDeletingReviewId(reviewId);
      deleteReviewMutation.mutate(reviewId);
    }
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Review Management - Admin Dashboard</title>
        <meta 
          name="description" 
          content="Manage app reviews and moderate content" 
        />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Review Management</h1>
        <p className="text-muted-foreground">
          Moderate user reviews and handle inappropriate content
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            App Reviews
          </CardTitle>
          <CardDescription>
            Manage and moderate reviews across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReviews ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  List of all app reviews on the platform
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {review.app?.name || 'Unknown App'}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {review.user?.username || 'Anonymous'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{review.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.comment}
                      </TableCell>
                      <TableCell>
                        {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="h-8 px-2 text-xs"
                        >
                          {deletingReviewId === review.id ? (
                            <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                There are no app reviews to display at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}