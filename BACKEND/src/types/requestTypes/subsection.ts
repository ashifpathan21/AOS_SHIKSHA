import { z } from 'zod'

export const SubsectionSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim().optional(),
    videoUrl:z.url().trim().optional(),
    duration:z.number().optional(),
    points:z.number().optional()
})