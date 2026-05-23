import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import prisma from "../utils/db.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import { io } from "../index.js";
import { StatusCodes } from "http-status-codes";

// message and message-seen events

export const sendMessage = async (req: UserRequest, res: Response) => {
    try {
        const { receiverId } = req.params;
        const message = req.body?.message
        if (!receiverId || !message?.trim()) {
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
                message: true
            }
        })
        io.to(`user:${receiever.id}`).emit(
            "message",
            chat
        );

        return res.status(StatusCodes.CREATED).json({
            success: true,
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
        io.to(`user:${receiverId}`).emit("message-seen", {
            by: Number(req.user?.id)
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
        const prevChats = Number(req.body?.prevChats) || 0
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

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Chats Fetched",
            data: chats
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}