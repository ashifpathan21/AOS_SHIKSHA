import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import z from "zod";
import { CommentSchema, VoteSchema } from "../types/requestTypes/comment.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";


export const createComment = async (req: UserRequest, res: Response) => {
    try {
        const { postId, subsectionId } = req.params;
        const data = req.body;
        const parsedData = z.safeParse(CommentSchema, data)
        if (!parsedData.success || (!postId && !subsectionId) || (postId && subsectionId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request"
            })
        }
        let comment;
        if (postId) {
            const post = await prisma.post.findFirst({
                where: {
                    id: Number(postId)
                }
            })
            if (!post) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid Request"
                })
            }
            comment = await prisma.comment.create({
                data: {
                    postId: post.id,
                    comment: parsedData.data.comment,
                    commenterId: Number(req.user?.id),
                }
            })
        } else if (subsectionId) {
            const subs = await prisma.subSection.findFirst({
                where: {
                    section: {
                        course: {
                            OR: [
                                {
                                    studentsEnrolled: {
                                        some: {
                                            user: {
                                                id: Number(req.user?.id),
                                                email: req.user?.email
                                            }
                                        }
                                    }
                                },
                                {
                                    instructor: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            ]
                        }
                    }
                }
            })
            if (!subs) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid Request"
                })
            }
            comment = await prisma.comment.create({
                data: {
                    subsectionId: subs.id,
                    comment: parsedData.data.comment,
                    commenterId: Number(req.user?.id),
                }
            })
        }
        if (!comment) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong"
            })
        }
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Comment added Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const updateComment = async (req: UserRequest, res: Response) => {
    try {
        const data = req.body
        const parsedData = z.safeParse(CommentSchema, data)
        const commentId = Number(req.params.commentId);
        if (!commentId || !parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request"
            })
        }
        const updatedComment = await prisma.comment.update({
            where: {
                id: commentId,
                commenter: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            },
            data: {
                comment: parsedData.data.comment,
                edited: true
            }
        })
        if (!updatedComment) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Comment Not Found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Comment Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const deleteComment = async (req: UserRequest, res: Response) => {
    try {
        const commentId = Number(req.params.commentId);
        if (!commentId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request"
            })
        }
        const deletedComment = await prisma.comment.delete({
            where: {
                id: commentId,
                OR: [
                    {
                        commenter: {
                            id: Number(req.user?.id),
                            email: req.user?.email
                        }
                    },
                    {
                        subsection: {
                            section: {
                                course: {
                                    instructor: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        })
        if (!deleteComment) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Comment Not Found"
            })
        }
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Comment Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const voteComment = async (req: UserRequest, res: Response) => {
    try {
        const data = req.body
        const parsedData = z.safeParse(VoteSchema, data)
        const commentId = Number(req.params.commentId)
        if (!commentId || !parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request"
            })
        }
        const comment = await prisma.comment.findFirst({
            where: {
                id: commentId
            }
        })
        if (!comment) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request"
            })
        }
        const vote = await prisma.vote.create({
            data: {
                userId: Number(req.user?.id),
                commentId: comment.id,
                type: parsedData.data.type
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Voted to Comment"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

