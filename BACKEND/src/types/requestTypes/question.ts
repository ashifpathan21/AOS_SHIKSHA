import z from "zod";
import { QuestionType } from "../../../generated/prisma/enums.js";

export const QuestionSchema = z.object({
    question:z.string().trim(),
    options:z.string().trim().array().length(4).optional(),
    correctOption:z.string().trim(),
    marks:z.number().optional(),
    type:z.enum(QuestionType)
})