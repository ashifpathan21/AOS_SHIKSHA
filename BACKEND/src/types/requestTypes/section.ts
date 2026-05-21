import { z } from "zod"
export const SectionSchema = z.object({
    name: z.string().trim()
})