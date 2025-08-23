import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeAuthenticatedRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus, Clock, Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { Post } from "@shared/schema";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduledAt: string;
  status: string;
  imageUrl?: string;
}

const platforms = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { value: "twitter", label: "Twitter", icon: Twitter, color: "text-blue-400" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-500" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
];

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const schedulePostMutation = useMutation({
    mutationFn: async ({ postId, scheduledAt }: { postId: string; scheduledAt: string }) => {
      const response = await makeAuthenticatedRequest("/api/scheduler/schedule", {
        method: "POST",
        body: JSON.stringify({ postId, scheduledAt }),
      });
      if (!response.ok) {
        throw new Error("Failed to schedule post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post scheduled successfully",
      });
      setShowScheduleDialog(false);
      setSelectedPost(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule post",
        variant: "destructive",
      });
    },
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await makeAuthenticatedRequest(`/api/scheduler/cancel/${postId}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel scheduled post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Scheduled post cancelled",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel scheduled post",
        variant: "destructive",
      });
    },
  });

  const scheduledPosts = posts.filter(post => post.status === "scheduled");
  const upcomingPosts = scheduledPosts
    .filter(post => post.scheduledAt && new Date(post.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 5);

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    if (!platformData) return Clock;
    return platformData.icon;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    return platformData?.color || "text-gray-500";
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const scheduledAt = formData.get("scheduledAt") as string;

    if (!scheduledAt) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    schedulePostMutation.mutate({
      postId: selectedPost.id,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
  };

  // Calendar generation
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      post.scheduledAt && isSameDay(new Date(post.scheduledAt), date)
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 h-96 bg-dark-800 rounded-lg"></div>
            <div className="h-96 bg-dark-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="title-scheduler">Content Scheduler</h1>
          <p className="text-dark-400">Plan and schedule your social media posts</p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700 text-white" data-testid="button-schedule-post">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-800 border-dark-700 text-white">
            <DialogHeader>
              <DialogTitle>Schedule a Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="post-select">Select Post</Label>
                <Select
                  value={selectedPost?.id || ""}
                  onValueChange={(value) => {
                    const post = posts.find(p => p.id === value);
                    setSelectedPost(post || null);
                  }}
                >
                  <SelectTrigger className="bg-dark-700 border-dark-600">
                    <SelectValue placeholder="Choose a post to schedule" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-700 border-dark-600">
                    {posts.filter(post => post.status === "draft").map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.content.substring(0, 50)}... ({post.platform})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  className="bg-dark-700 border-dark-600 text-white"
                  required
                  data-testid="input-schedule-datetime"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!selectedPost || schedulePostMutation.isPending}
                  className="bg-primary-600 hover:bg-primary-700"
                  data-testid="button-confirm-schedule"
                >
                  {schedulePostMutation.isPending ? "Scheduling..." : "Schedule Post"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleDialog(false)}
                  className="border-dark-600 text-white hover:bg-dark-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar/Timeline View */}
        <div className="lg:col-span-3">
          <Card className="bg-dark-800 border-dark-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Content Calendar</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className="text-sm"
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                    className="text-sm bg-primary-600 hover:bg-primary-700"
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-dark-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
                {calendarDays.map((day) => {
                  const dayPosts = getPostsForDate(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1 border border-dark-700 rounded ${
                        isToday ? "bg-primary-600/10 border-primary-600" : ""
                      }`}
                      data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                    >
                      <div className={`text-xs mb-1 ${isToday ? "text-primary-500 font-medium" : "text-white"}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map((post, index) => {
                          const Icon = getPlatformIcon(post.platform);
                          return (
                            <div
                              key={post.id}
                              className={`w-full h-4 rounded text-xs px-1 text-white flex items-center platform-${post.platform}`}
                              title={`${post.platform} - ${post.content.substring(0, 30)}...`}
                            >
                              <Icon className="h-2 w-2 mr-1" />
                              <span className="truncate text-xs">
                                {post.platform.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          );
                        })}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-dark-400">
                            +{dayPosts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Posts Sidebar */}
        <div>
          <Card className="bg-dark-800 border-dark-700">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPosts.length > 0 ? (
                upcomingPosts.map((post) => {
                  const Icon = getPlatformIcon(post.platform);
                  const platformColor = getPlatformColor(post.platform);
                  
                  return (
                    <div
                      key={post.id}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                      data-testid={`upcoming-post-${post.platform}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
                        </span>
                        <Icon className={`h-4 w-4 ${platformColor}`} />
                      </div>
                      <p className="text-xs text-dark-400 mb-2">
                        {post.scheduledAt ? format(new Date(post.scheduledAt), "MMM d, h:mm a") : "No date"}
                      </p>
                      <p className="text-xs text-white mb-2">
                        {post.content.substring(0, 80)}...
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelScheduleMutation.mutate(post.id)}
                        className="text-xs border-dark-600 text-red-400 hover:bg-red-500/10"
                        disabled={cancelScheduleMutation.isPending}
                        data-testid={`button-cancel-schedule-${post.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-8 w-8 text-dark-400 mb-2" />
                  <p className="text-sm text-dark-400">No upcoming posts</p>
                  <p className="text-xs text-dark-500">Schedule your first post to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
