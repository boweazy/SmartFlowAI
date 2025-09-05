import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Calendar, Sparkles, LogOut, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    setLocation("/login");
    return null;
  }

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await apiRequest("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    retry: false,
    onError: () => {
      localStorage.removeItem("token");
      setLocation("/login");
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await apiRequest("/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    setLocation("/login");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900" data-testid="text-app-title">
                SmartFlow AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700" data-testid="text-user-email">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-stats-posts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-posts">
                {postsLoading ? "..." : (posts?.length || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-scheduled">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-scheduled-posts">
                {postsLoading ? "..." : (posts?.filter((p: any) => p.status === "scheduled").length || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to publish
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-published">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-published-posts">
                {postsLoading ? "..." : (posts?.filter((p: any) => p.status === "published").length || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Live content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList data-testid="tabs-dashboard">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-recent-posts">
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Your latest social media content</CardDescription>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : posts?.length > 0 ? (
                    <div className="space-y-3">
                      {posts.slice(0, 3).map((post: any) => (
                        <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`post-item-${post.id}`}>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 truncate">{post.content}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {post.platform}
                              </Badge>
                              <Badge variant={post.status === "published" ? "default" : "outline"} className="text-xs ml-2">
                                {post.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No posts yet</p>
                      <Button className="mt-2" data-testid="button-create-first-post">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-quick-actions">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with these common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" data-testid="button-generate-ai-content">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-schedule-post">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule a Post
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-view-analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <Card data-testid="card-all-posts">
              <CardHeader>
                <CardTitle>All Posts</CardTitle>
                <CardDescription>Manage your social media content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Posts management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-generate">
            <Card data-testid="card-ai-generate">
              <CardHeader>
                <CardTitle>AI Content Generation</CardTitle>
                <CardDescription>Create engaging content with AI assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">AI content generation coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card data-testid="card-schedule">
              <CardHeader>
                <CardTitle>Content Scheduler</CardTitle>
                <CardDescription>Plan and schedule your posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Scheduling interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card data-testid="card-analytics">
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Track your social media performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}