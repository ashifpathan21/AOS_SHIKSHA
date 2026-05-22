import z from "zod";

export const ReviewSchema = z.object({
    review: z.string().trim(),
    rating: z.number().min(0).max(5)
})