import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { makeAuthenticatedRequest } from "@/lib/api";
import { FileText, Heart, Clock, Bot, ArrowUp, Check, Calendar } from "lucide-react";

interface AnalyticsOverview {
  totalPosts: number;
  totalReach: number;
  totalEngagement: number;
  engagementRate: number;
  topPlatform: string;
  aiContentPerformance: number;
  recentGrowth: {
    posts: number;
    engagement: number;
    reach: number;
  };
}

const quickActions = [
  {
    title: "Generate AI Content",
    icon: Bot,
    action: "generateContent",
    color: "bg-primary-600 hover:bg-primary-700"
  },
  {
    title: "Schedule Post",
    icon: Calendar,
    action: "schedulePost",
    color: "bg-dark-700 hover:bg-dark-600"
  },
  {
    title: "View Analytics",
    icon: ArrowUp,
    action: "viewAnalytics",
    color: "bg-dark-700 hover:bg-dark-600"
  }
];

const recentActivities = [
  {
    id: 1,
    type: "published",
    title: "Post published successfully",
    platform: "Instagram",
    time: "2 minutes ago",
    icon: Check,
    color: "bg-green-500/10 text-green-500"
  },
  {
    id: 2,
    type: "ai_generated",
    title: "AI content generated",
    platform: "Twitter thread",
    time: "15 minutes ago",
    icon: Bot,
    color: "bg-primary-500/10 text-primary-500"
  },
  {
    id: 3,
    type: "scheduled",
    title: "Post scheduled",
    platform: "LinkedIn",
    time: "1 hour ago",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-500"
  }
];

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
  });

  const handleQuickAction = (action: string) => {
    // Handle quick actions
    switch (action) {
      case "generateContent":
        // Navigate to content generation
        window.location.href = "/feed?generate=true";
        break;
      case "schedulePost":
        // Navigate to scheduler
        window.location.href = "/scheduler";
        break;
      case "viewAnalytics":
        // Navigate to analytics
        window.location.href = "/analytics";
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" data-testid="title-dashboard">Dashboard</h1>
        <p className="text-dark-400">Overview of your social media automation</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-total-posts">
                  {analytics?.totalPosts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <FileText className="text-primary-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500">+{analytics?.recentGrowth.posts || 0}%</span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Reach</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-total-reach">
                  {analytics?.totalReach.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Heart className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500">+{analytics?.recentGrowth.reach || 0}%</span>
              <span className="text-dark-400 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Engagement Rate</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-engagement-rate">
                  {analytics?.engagementRate || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Calendar className="text-dark-400 mr-1 h-4 w-4" />
              <span className="text-dark-400">Next: in 2 hours</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">AI Performance</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-ai-performance">
                  {analytics?.aiContentPerformance || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Bot className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-500">vs manual content</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-dark-800 border-dark-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-dark-700 rounded-lg transition-colors"
                  data-testid={`activity-${activity.type}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <p className="text-xs text-dark-400 mt-1">
                      {activity.platform} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-dark-800 border-dark-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium transition-colors ${action.color}`}
                  data-testid={`button-${action.action.toLowerCase().replace(/([A-Z])/g, '-$1')}`}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
