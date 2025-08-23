import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { makeAuthenticatedRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles, Image, Hash, X, Copy, Send } from "lucide-react";

interface ContentGeneratorProps {
  onClose: () => void;
  onSuccess: () => void;
}

const contentSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  platform: z.string().min(1, "Please select a platform"),
  tone: z.string().default("professional"),
  includeHashtags: z.boolean().default(true),
  includeImage: z.boolean().default(false),
  maxLength: z.number().optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface GeneratedContent {
  text: string;
  hashtags?: string[];
  imageUrl?: string;
  imagePrompt?: string;
}

const platforms = [
  { value: "instagram", label: "Instagram", maxLength: 2200 },
  { value: "twitter", label: "Twitter", maxLength: 280 },
  { value: "linkedin", label: "LinkedIn", maxLength: 3000 },
  { value: "facebook", label: "Facebook", maxLength: 63206 },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "humorous", label: "Humorous" },
  { value: "inspiring", label: "Inspiring" },
  { value: "educational", label: "Educational" },
];

export default function ContentGenerator({ onClose, onSuccess }: ContentGeneratorProps) {
  const [step, setStep] = useState<"form" | "generating" | "preview">("form");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      prompt: "",
      platform: "",
      tone: "professional",
      includeHashtags: true,
      includeImage: false,
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const response = await makeAuthenticatedRequest("/api/ai/generate-content", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to generate content");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setStep("preview");
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
      setStep("form");
    },
  });

  const savePostMutation = useMutation({
    mutationFn: async () => {
      if (!generatedContent) throw new Error("No content to save");
      
      const formData = form.getValues();
      const content = generatedContent.hashtags 
        ? `${generatedContent.text}\n\n${generatedContent.hashtags.join(" ")}`
        : generatedContent.text;

      const response = await makeAuthenticatedRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          content,
          platform: formData.platform,
          status: "draft",
          imageUrl: generatedContent.imageUrl,
          isAiGenerated: true,
          aiPrompt: formData.prompt,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save post");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI-generated post saved as draft",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContentFormData) => {
    setStep("generating");
    generateContentMutation.mutate(data);
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      const content = generatedContent.hashtags 
        ? `${generatedContent.text}\n\n${generatedContent.hashtags.join(" ")}`
        : generatedContent.text;
      navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    }
  };

  const selectedPlatform = platforms.find(p => p.value === form.watch("platform"));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-dark-800 border-dark-700 text-white max-w-2xl" data-testid="dialog-content-generator">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary-500" />
            AI Content Generator
          </DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="prompt">Content Prompt</Label>
              <Textarea
                id="prompt"
                {...form.register("prompt")}
                placeholder="Describe what you want to post about... (e.g., 'A motivational post about productivity tips for remote workers')"
                className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                data-testid="textarea-prompt"
              />
              {form.formState.errors.prompt && (
                <p className="form-error">{form.formState.errors.prompt.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select onValueChange={(value) => form.setValue("platform", value)}>
                  <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-700 border-dark-600">
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlatform && (
                  <p className="text-xs text-dark-400 mt-1">
                    Max characters: {selectedPlatform.maxLength.toLocaleString()}
                  </p>
                )}
                {form.formState.errors.platform && (
                  <p className="form-error">{form.formState.errors.platform.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select onValueChange={(value) => form.setValue("tone", value)} defaultValue="professional">
                  <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-700 border-dark-600">
                    {tones.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeHashtags"
                  {...form.register("includeHashtags")}
                  defaultChecked
                  className="border-dark-600"
                />
                <Label htmlFor="includeHashtags" className="flex items-center text-sm">
                  <Hash className="h-4 w-4 mr-1" />
                  Include relevant hashtags
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeImage"
                  {...form.register("includeImage")}
                  className="border-dark-600"
                />
                <Label htmlFor="includeImage" className="flex items-center text-sm">
                  <Image className="h-4 w-4 mr-1" />
                  Generate AI image (takes longer)
                </Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={generateContentMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700 flex-1"
                data-testid="button-generate-content"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-dark-600 text-white hover:bg-dark-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <Bot className="absolute inset-0 m-auto h-6 w-6 text-primary-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">Generating your content...</h3>
              <p className="text-dark-400">
                {form.getValues("includeImage") 
                  ? "Creating text and image content with AI"
                  : "Creating text content with AI"
                }
              </p>
            </div>
          </div>
        )}

        {step === "preview" && generatedContent && (
          <div className="space-y-4">
            <Card className="bg-dark-700 border-dark-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">Generated Content</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyContent}
                      className="border-dark-600 text-white hover:bg-dark-600"
                      data-testid="button-copy-content"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                {generatedContent.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={generatedContent.imageUrl} 
                      alt="Generated content" 
                      className="w-full max-w-md rounded-lg"
                      data-testid="generated-image"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <p className="text-white whitespace-pre-wrap" data-testid="generated-text">
                      {generatedContent.text}
                    </p>
                  </div>

                  {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                    <div>
                      <p className="text-sm text-dark-400 mb-2">Suggested hashtags:</p>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.hashtags.map((hashtag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-sm"
                            data-testid={`hashtag-${index}`}
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={() => savePostMutation.mutate()}
                disabled={savePostMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700 flex-1"
                data-testid="button-save-draft"
              >
                <Send className="mr-2 h-4 w-4" />
                {savePostMutation.isPending ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep("form")}
                className="border-dark-600 text-white hover:bg-dark-700"
                data-testid="button-generate-new"
              >
                Generate New
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-dark-600 text-white hover:bg-dark-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
