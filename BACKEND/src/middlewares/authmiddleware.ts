import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { decodeToken } from "../utils/jwt.js";
import { success } from "zod";
import prisma from "../utils/db.js";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";


export const authenticate = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = (req.headers as Record<string, string | undefined>)["authorization"];
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Token is Missing"
            })
        }
        const data = decodeToken(token);
        if (!data || !data.userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Token"
            })
        }

        const user = await prisma.user.findFirst({
            where: {
                id: data.userId,
                email: data.userEmail
            }
        })
        if (!user || !user.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Token"
            })
        }

        req.user = {
            id: user.id,
            email: user.email
        };
        next()
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const isStudent = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        const userEmail = req.user?.email
        if (!userId || !userEmail) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized Access"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                id: Number(userId),
                email: userEmail
            }
        })
        if (!user || user.accountType !== 'STUDENT') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized Access"
            })
        }
        next()
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}



export const isInstructor = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        const userEmail = req.user?.email
        if (!userId || !userEmail) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized Access"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                id: Number(userId),
                email: userEmail
            }
        })
        if (!user || user.accountType !== 'INSTRUCTOR') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized Access"
            })
        }
        next()
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}