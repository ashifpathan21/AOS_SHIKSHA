import z from "zod";
import { VoteType } from "../../../generated/prisma/enums.js";

export const CommentSchema = z.object({
    comment: z.string().trim()
})

export const VoteSchema = z.object({
    type: z.enum(VoteType)
})