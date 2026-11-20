import { z } from "zod";

export const reviewSchema = z.object({
  restaurantId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid restaurant"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  rating: z.coerce
    .number({ error: "Choose a rating from 1 to 5" })
    .int("Choose a rating from 1 to 5")
    .min(1, "Choose a rating from 1 to 5")
    .max(5, "Choose a rating from 1 to 5"),
  comment: z
    .string()
    .trim()
    .min(5, "Review must be at least 5 characters")
    .max(500, "Review must be at most 500 characters"),
  // Honeypot: field tersembunyi yang tidak boleh diisi manusia.
  website: z.string().max(0).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export type ReviewFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "rating" | "comment", string>>;
  values?: { name: string; rating: string; comment: string };
};

export const initialReviewState: ReviewFormState = { status: "idle" };
