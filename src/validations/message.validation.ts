import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long")
    .trim(),
  attachmentUrl: z.url("Invalid URL").optional(),
});

export const messageListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageListQueryInput = z.infer<typeof messageListQuerySchema>;
