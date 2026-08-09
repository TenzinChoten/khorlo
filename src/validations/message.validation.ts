import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long")
    .trim(),
  attachmentUrl: z.url("Invalid URL").optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
