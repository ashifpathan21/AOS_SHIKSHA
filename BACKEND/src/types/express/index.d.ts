import type { Request } from "express"

export interface UserRequest extends Request {
    user?: {
        id: Number,
        email: string
    }
}