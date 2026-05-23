import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import { ReplySchema } from "../types/requestTypes/comment.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import { io } from "../index.js";

// reply event

export const addReply = async (req: UserRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const data = req.body;
        const parsedData = ReplySchema.safeParse(data);
        if (!parsedData.success || !commentId) {
            return INVALID_REQUEST(res)
        }
        const { userId, reply } = parsedData.data
        const comment = await prisma.comment.findUnique({
            where: {
                id: Number(commentId)
            }
        })
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!comment || !user) {
            return INVALID_REQUEST(res)
        }
        const replied = await prisma.reply.create({
            data: {
                reply,
                commenterId: Number(req.user?.id),
                commentId: Number(commentId),
                userId: user.id
            },
            select: {
                id: true,
                by: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                reply: true,
                comment: {
                    select: {
                        comment: true,
                        commenter: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })
        io.to(`user:${user.id}`).emit("reply",
            replied
        )
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Replied Successfully",
            data: replied
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const deleteReply = async (req: UserRequest, res: Response) => {
    try {
        const { replyId } = req.params;
        if (!replyId) {
            return INVALID_REQUEST(res)
        }
        const deletedReply = await prisma.reply.delete({
            where: {
                id: Number(replyId),
                by: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            }
        })
        if (!deletedReply) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Reply Not Found"
            })
        }
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Reply Deleted"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}