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

export const INVALID_REQUEST = (res: Response) => {
    return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid Request"
    })
}