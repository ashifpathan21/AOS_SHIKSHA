import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import prisma from "../utils/db.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import { canUsersInteract } from "../index.js";
import { StatusCodes } from "http-status-codes";
import { error } from "node:console";


export const sendMessage = async (req: UserRequest, res: Response) => {
    try {
        const { receiverId } = req.params;
        const { message } = req.body
        if (!receiverId || !message.trim()) {
            return INVALID_REQUEST(res)
        }
        const receiever = await prisma.user.findUnique({
            where: {
                id: Number(receiverId)
            }
        })
        if (!receiever) {
            return INVALID_REQUEST(res)
        }
        const chat = await prisma.chat.create({
            data: {
                senderId: Number(req.user?.id),
                message,
                receiverId: receiever.id
            }
        })

        return res.status(StatusCodes.CREATED).json({
            success: false,
            message: "Chat Created",
            data: chat
        })

    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const seenMessage = async (req: UserRequest, res: Response) => {
    try {
        const { receiverId } = req.params;
        if (!receiverId) {
            return INVALID_REQUEST(res)
        }
        await prisma.chat.updateMany({
            where: {
                senderId: Number(receiverId),
                receiverId: Number(req.user?.id),
                isSeen: false
            },
            data: {
                isSeen: true,
                seenAt: new Date(Date.now())
            }
        })
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Seen"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const deleteMessage = async (req: UserRequest, res: Response) => {
    try {
        const { chatId } = req.params;
        if (!chatId) {
            return INVALID_REQUEST(res)
        }
        await prisma.chat.delete({
            where: {
                senderId: Number(req.user?.id),
                id: Number(chatId)
            }
        })
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Message Deleted"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}
export const getAllChats = async (req: UserRequest, res: Response) => {
    try {
        const { receiverId } = req.params;
        const prevChats = Number(req.body.prevChats) || 0
        if (!receiverId) {
            return INVALID_REQUEST(res)
        }
        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    {
                        receiverId: Number(req.user?.id),
                        senderId: Number(receiverId)
                    },
                    {
                        senderId: Number(req.user?.id),
                        receiverId: Number(receiverId)
                    }
                ]
            },
            select: {
                message: true,
                by: {
                    select: {
                        name: true,
                        image: true,
                        id: true,
                        username: true
                    }
                },
                to: {
                    select: {
                        name: true,
                        image: true,
                        id: true,
                        username: true
                    }
                },
                createdAt: true,
                isSeen: true,
                seenAt: true,
                id: true
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: (prevChats * 50),
            take: 50,
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}