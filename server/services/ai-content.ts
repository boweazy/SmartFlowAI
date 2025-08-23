import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentGenerationRequest {
  prompt: string;
  platform: string;
  tone?: string;
  includeHashtags?: boolean;
  includeImage?: boolean;
  maxLength?: number;
}

export interface GeneratedContent {
  text: string;
  hashtags?: string[];
  imageUrl?: string;
  imagePrompt?: string;
}

export class AIContentService {
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const textContent = await this.generateTextContent(request);
      let imageUrl: string | undefined;
      let imagePrompt: string | undefined;

      if (request.includeImage) {
        const imageGeneration = await this.generateImage(request.prompt, request.platform);
        imageUrl = imageGeneration.url;
        imagePrompt = imageGeneration.prompt;
      }

      return {
        text: textContent.text,
        hashtags: textContent.hashtags,
        imageUrl,
        imagePrompt,
      };
    } catch (error) {
      console.error("AI Content Generation Error:", error);
      throw new Error("Failed to generate AI content");
    }
  }

  private async generateTextContent(request: ContentGenerationRequest): Promise<{ text: string; hashtags?: string[] }> {
    const { prompt, platform, tone = "professional", includeHashtags = true, maxLength } = request;

    const platformSpecs = this.getPlatformSpecs(platform);
    const maxChars = maxLength || platformSpecs.maxLength;

    const systemPrompt = `You are an expert social media content creator. Generate engaging ${tone} content for ${platform}. 
    
Platform requirements:
- Max characters: ${maxChars}
- Style: ${platformSpecs.style}
- Audience: ${platformSpecs.audience}

${includeHashtags ? "Include relevant hashtags." : "Do not include hashtags."}

Respond with JSON in this format:
{
  "text": "Main content text",
  "hashtags": ["hashtag1", "hashtag2"] // only if includeHashtags is true
}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      text: result.text || "",
      hashtags: includeHashtags ? result.hashtags : undefined,
    };
  }

  private async generateImage(prompt: string, platform: string): Promise<{ url: string; prompt: string }> {
    const imagePrompt = `Create a high-quality, professional social media image for ${platform}. ${prompt}. Modern, clean design with good contrast and readability.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: platform === "instagram" ? "1024x1024" : "1024x1024",
      quality: "standard",
    });

    return {
      url: response.data[0].url || "",
      prompt: imagePrompt,
    };
  }

  private getPlatformSpecs(platform: string) {
    const specs = {
      instagram: {
        maxLength: 2200,
        style: "Visual-first, engaging, emoji-friendly",
        audience: "Visual content consumers, lifestyle-focused"
      },
      twitter: {
        maxLength: 280,
        style: "Concise, conversational, trending-aware",
        audience: "News-focused, real-time engagement"
      },
      linkedin: {
        maxLength: 3000,
        style: "Professional, thought-leadership, industry-focused",
        audience: "Business professionals, B2B audience"
      },
      facebook: {
        maxLength: 63206,
        style: "Community-focused, shareable, discussion-starter",
        audience: "Broad demographic, community-oriented"
      }
    };

    return specs[platform as keyof typeof specs] || specs.instagram;
  }

  async analyzeContentPerformance(content: string, platform: string): Promise<{
    sentiment: { rating: number; confidence: number };
    suggestions: string[];
  }> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze this ${platform} content for sentiment and provide improvement suggestions. Respond with JSON:
            {
              "sentiment": {"rating": 1-5, "confidence": 0-1},
              "suggestions": ["suggestion1", "suggestion2"]
            }`
          },
          {
            role: "user",
            content: content,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        sentiment: {
          rating: Math.max(1, Math.min(5, Math.round(result.sentiment?.rating || 3))),
          confidence: Math.max(0, Math.min(1, result.sentiment?.confidence || 0.5)),
        },
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Content analysis error:", error);
      return {
        sentiment: { rating: 3, confidence: 0.5 },
        suggestions: ["Unable to analyze content at this time"],
      };
    }
  }
}

export const aiContentService = new AIContentService();
