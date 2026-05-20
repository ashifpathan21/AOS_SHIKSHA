import { z } from "zod";
import { Status } from "../../../generated/prisma/enums.js";

export const CourseSchema = z.object({
    name: z.string().trim().nonempty(),
    description: z.string().trim(),
    outcomes: z.string().array(),
    price: z.number().min(0).default(0),
    category: z.string().trim(),
    instructions: z.string().array(),
    status: z.enum(Status)
})




