import type { Response } from "express"
import { StatusCodes } from "http-status-codes"


export const INTERNAL_SERVER_ERROR = (res: Response, error: unknown) => {
    console.log(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
        error: error
    })
}