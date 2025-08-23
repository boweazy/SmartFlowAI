import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Send, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Bot
} from "lucide-react";

interface PostCardProps {
  post: Post;
  onAction: (action: string, post: Post) => void;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

const platformColors = {
  instagram: "text-pink-500",
  twitter: "text-blue-400",
  linkedin: "text-blue-500",
  facebook: "text-blue-600",
};

const statusColors = {
  published: "bg-green-500",
  scheduled: "bg-yellow-500",
  draft: "bg-gray-500",
  failed: "bg-red-500",
};

export default function PostCard({ post, onAction }: PostCardProps) {
  const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons] || Instagram;
  const platformColor = platformColors[post.platform as keyof typeof platformColors] || "text-gray-500";
  const statusColor = statusColors[post.status as keyof typeof statusColors] || "bg-gray-500";

  const formatTime = (date: string | Date | null) => {
    if (!date) return "No date";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Mock engagement data - in a real app this would come from analytics
  const mockEngagement = {
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 50) + 5,
    shares: Math.floor(Math.random() * 25) + 2,
  };

  return (
    <Card className="bg-dark-800 border-dark-700 overflow-hidden hover:border-dark-600 transition-colors" data-testid={`post-card-${post.id}`}>
      <div className="relative">
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Hide image if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
        <div className="absolute top-2 right-2">
          <Badge className={`${statusColor} text-white text-xs font-medium`} data-testid={`badge-status-${post.status}`}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
        </div>
        {post.isAiGenerated && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-purple-500/80 text-white text-xs font-medium flex items-center" data-testid="badge-ai-generated">
              <Bot className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <PlatformIcon className={`h-4 w-4 ${platformColor}`} />
            <span className="text-sm text-dark-400 capitalize">{post.platform}</span>
          </div>
          <span className="text-sm text-dark-400" data-testid={`post-time-${post.status}`}>
            {post.status === "scheduled" && post.scheduledAt 
              ? formatTime(post.scheduledAt)
              : post.status === "published" && post.publishedAt
              ? formatTime(post.publishedAt)
              : formatTime(post.createdAt)
            }
          </span>
        </div>

        <p className="text-sm mb-3 text-white" data-testid="post-content">
          {truncateContent(post.content)}
        </p>

        <div className="flex items-center justify-between">
          {post.status === "published" ? (
            <div className="flex items-center space-x-4 text-sm text-dark-400">
              <span className="flex items-center" data-testid="post-likes">
                <Heart className="h-3 w-3 mr-1" />
                {mockEngagement.likes}
              </span>
              <span className="flex items-center" data-testid="post-comments">
                <MessageCircle className="h-3 w-3 mr-1" />
                {mockEngagement.comments}
              </span>
              <span className="flex items-center" data-testid="post-shares">
                <Share className="h-3 w-3 mr-1" />
                {mockEngagement.shares}
              </span>
            </div>
          ) : post.status === "scheduled" ? (
            <div className="flex items-center text-sm text-yellow-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Scheduled</span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-dark-400">
              <span>{post.status === "draft" ? "Draft" : "Failed"}</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-dark-400 hover:text-white hover:bg-dark-700"
                data-testid={`button-post-actions-${post.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-dark-700 border-dark-600 text-white" align="end">
              <DropdownMenuItem 
                onClick={() => onAction("edit", post)}
                className="hover:bg-dark-600 cursor-pointer"
                data-testid="action-edit"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onAction("duplicate", post)}
                className="hover:bg-dark-600 cursor-pointer"
                data-testid="action-duplicate"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {post.status === "draft" && (
                <DropdownMenuItem 
                  onClick={() => onAction("publish", post)}
                  className="hover:bg-dark-600 cursor-pointer text-green-400"
                  data-testid="action-publish"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </DropdownMenuItem>
              )}
              {(post.status === "draft" || post.status === "scheduled") && (
                <DropdownMenuItem 
                  onClick={() => onAction("schedule", post)}
                  className="hover:bg-dark-600 cursor-pointer"
                  data-testid="action-schedule"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {post.status === "scheduled" ? "Reschedule" : "Schedule"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onAction("delete", post)}
                className="hover:bg-dark-600 cursor-pointer text-red-400"
                data-testid="action-delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
