import z from "zod";


export const PostSchema = z.object({
    caption: z.string().trim()
})