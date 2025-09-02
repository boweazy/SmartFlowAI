import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
