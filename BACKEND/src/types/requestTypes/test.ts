import z from "zod";
import { TestStatus } from "../../../generated/prisma/enums.js";

export const TestSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim().optional(),
    guidelines: z.string().trim().array(),
    timeline: z.number().optional(),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    status: z.enum(TestStatus)
})


export const TestSubmissionSchema = z.object({
    answers: z.object({
        questionId: z.number(),
        answer: z.string().trim()
    }).array()
})