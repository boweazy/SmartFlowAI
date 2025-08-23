import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeAuthenticatedRequest } from "@/lib/api";
import PerformanceChart from "@/components/analytics/performance-chart";
import { Eye, ThumbsUp, Bot, Clock, Download, ArrowUp, TrendingUp } from "lucide-react";

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

interface PlatformPerformance {
  platform: string;
  posts: number;
  avgEngagementRate: number;
  totalReach: number;
  totalEngagement: number;
}

interface ContentInsights {
  bestPostingTimes: string[];
  topHashtags: string[];
  contentTypes: {
    text: { count: number; avgEngagement: number };
    image: { count: number; avgEngagement: number };
    ai: { count: number; avgEngagement: number };
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const platformIcons = {
  instagram: "📸",
  twitter: "🐦",
  linkedin: "💼",
  facebook: "📘",
};

const platformColors = {
  instagram: "bg-pink-500",
  twitter: "bg-blue-400",
  linkedin: "bg-blue-500",
  facebook: "bg-blue-600",
};

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview", { timeframe }],
  });

  const { data: platforms = [], isLoading: platformsLoading } = useQuery<PlatformPerformance[]>({
    queryKey: ["/api/analytics/platforms", { timeframe }],
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<ContentInsights>({
    queryKey: ["/api/analytics/insights", { timeframe }],
  });

  const handleExportReport = () => {
    // Implement report export functionality
    console.log("Exporting analytics report...");
  };

  const isLoading = overviewLoading || platformsLoading || insightsLoading;

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
        <h1 className="text-2xl font-bold text-white" data-testid="title-analytics">Analytics & Insights</h1>
        <p className="text-dark-400">Track your social media performance and AI content effectiveness</p>
      </div>

      {/* Time Range Selector */}
      <Card className="bg-dark-800 border-dark-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-white">Time Range:</span>
              <Select value={timeframe} onValueChange={(value: "7d" | "30d" | "90d") => setTimeframe(value)}>
                <SelectTrigger className="w-40 bg-dark-700 border-dark-600 text-white" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportReport}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm"
              data-testid="button-export-report"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Reach</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-total-reach">
                  {overview?.totalReach.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Eye className="text-primary-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500">+{overview?.recentGrowth.reach || 0}%</span>
              <span className="text-dark-400 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Engagement</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-total-engagement">
                  {overview?.totalEngagement.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <ThumbsUp className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-500">+{overview?.recentGrowth.engagement || 0}%</span>
              <span className="text-dark-400 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">AI Content Performance</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-ai-performance">
                  {overview?.aiContentPerformance || 0}%
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

        <Card className="bg-dark-800 border-dark-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Best Time to Post</p>
                <p className="text-2xl font-bold text-white" data-testid="stat-best-time">
                  {insights?.bestPostingTimes?.[0] || "2:00 PM"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-dark-400">Peak engagement time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="bg-dark-800 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white">Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart timeframe={timeframe} />
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card className="bg-dark-800 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white">Platform Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {platformIcons[platform.platform as keyof typeof platformIcons] || "📱"}
                  </span>
                  <span className="text-white capitalize">{platform.platform}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-dark-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${platformColors[platform.platform as keyof typeof platformColors] || "bg-gray-500"}`}
                      style={{ width: `${Math.min(platform.avgEngagementRate, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-dark-400 w-8" data-testid={`platform-rate-${platform.platform}`}>
                    {Math.round(platform.avgEngagementRate)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Insights */}
        <Card className="bg-dark-800 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white">Content Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Content Types Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">Text Posts</span>
                  <span className="text-sm text-white" data-testid="content-type-text">
                    {insights?.contentTypes.text.count || 0} posts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">Image Posts</span>
                  <span className="text-sm text-white" data-testid="content-type-image">
                    {insights?.contentTypes.image.count || 0} posts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">AI Generated</span>
                  <span className="text-sm text-white" data-testid="content-type-ai">
                    {insights?.contentTypes.ai.count || 0} posts
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-2">Top Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {insights?.topHashtags?.slice(0, 6).map((hashtag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-xs"
                    data-testid={`hashtag-${index}`}
                  >
                    {hashtag}
                  </span>
                )) || (
                  <span className="text-sm text-dark-400">No hashtags data available</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-2">Sentiment Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">Positive</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${insights?.sentimentAnalysis.positive || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white w-8" data-testid="sentiment-positive">
                      {insights?.sentimentAnalysis.positive || 0}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">Neutral</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${insights?.sentimentAnalysis.neutral || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white w-8" data-testid="sentiment-neutral">
                      {insights?.sentimentAnalysis.neutral || 0}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">Negative</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${insights?.sentimentAnalysis.negative || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white w-8" data-testid="sentiment-negative">
                      {insights?.sentimentAnalysis.negative || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Posting Times */}
        <Card className="bg-dark-800 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white">Optimal Posting Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights?.bestPostingTimes?.map((time, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-white font-medium">{time}</span>
                  </div>
                  <span className="text-sm text-green-500">High engagement</span>
                </div>
              )) || (
                <div className="text-center py-4">
                  <Clock className="mx-auto h-8 w-8 text-dark-400 mb-2" />
                  <p className="text-sm text-dark-400">No data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
