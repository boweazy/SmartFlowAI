import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeAuthenticatedRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/content/post-card";
import ContentGenerator from "@/components/content/content-generator";
import { Plus } from "lucide-react";
import { Post } from "@shared/schema";

export default function Feed() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contentFilter, setContentFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await makeAuthenticatedRequest(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const duplicatePostMutation = useMutation({
    mutationFn: async (post: Post) => {
      const response = await makeAuthenticatedRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          content: post.content + " (Copy)",
          platform: post.platform,
          status: "draft",
          imageUrl: post.imageUrl,
          isAiGenerated: post.isAiGenerated,
          aiPrompt: post.aiPrompt,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to duplicate post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post duplicated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate post",
        variant: "destructive",
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await makeAuthenticatedRequest(`/api/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "published",
          publishedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to publish post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post published successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish post",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts.filter((post) => {
    const platformMatch = platformFilter === "all" || post.platform === platformFilter;
    const statusMatch = statusFilter === "all" || post.status === statusFilter;
    const contentMatch = contentFilter === "all" || 
      (contentFilter === "ai" && post.isAiGenerated) ||
      (contentFilter === "manual" && !post.isAiGenerated);
    
    return platformMatch && statusMatch && contentMatch;
  });

  const handlePostAction = (action: string, post: Post) => {
    switch (action) {
      case "delete":
        deletePostMutation.mutate(post.id);
        break;
      case "duplicate":
        duplicatePostMutation.mutate(post);
        break;
      case "publish":
        publishPostMutation.mutate(post.id);
        break;
      case "edit":
        // Navigate to edit page or open edit modal
        console.log("Edit post:", post.id);
        break;
      case "schedule":
        // Navigate to scheduler with this post
        window.location.href = `/scheduler?postId=${post.id}`;
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-dark-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="title-content-feed">Content Feed</h1>
          <p className="text-dark-400">Manage your social media content</p>
        </div>
        <Button
          onClick={() => setShowGenerator(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white"
          data-testid="button-create-post"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-dark-800 border-dark-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4" data-testid="filters-section">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40 bg-dark-700 border-dark-600 text-white">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-dark-700 border-dark-600 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className="w-36 bg-dark-700 border-dark-600 text-white">
                <SelectValue placeholder="All Content" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="ai">AI Generated</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="posts-grid">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onAction={handlePostAction}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-12 text-center">
            <div className="text-dark-400 mb-4">
              {posts.length === 0 ? (
                <>
                  <Plus className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                  <p>Create your first post to get started with social media automation.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-white mb-2">No posts match your filters</h3>
                  <p>Try adjusting your filters to see more content.</p>
                </>
              )}
            </div>
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Create New Post
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content Generator Modal */}
      {showGenerator && (
        <ContentGenerator
          onClose={() => setShowGenerator(false)}
          onSuccess={() => {
            setShowGenerator(false);
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
          }}
        />
      )}
    </div>
  );
}
