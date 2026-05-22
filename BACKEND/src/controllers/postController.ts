import type { Request, Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import z, { file } from "zod";
import { PostSchema } from "../types/requestTypes/post.js";
import prisma from "../utils/db.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { StatusCodes } from "http-status-codes";


export const createPost = async (req: UserRequest, res: Response) => {
    try {
        const data = req.body;
        const parsedData = z.safeParse(PostSchema, data)
        const files = req.files as Express.Multer.File[] || undefined
        if ((!files && !parsedData.data?.caption) && !parsedData.success) {
            return INVALID_REQUEST(res)
        }
        const post = await prisma.post.create({
            data: {
                caption: parsedData.data?.caption ?? null,
                createdBy: Number(req.user?.id)
            }
        })
        const promises = files?.map((file: Express.Multer.File) => {
            const res = uploadToCloudinary(file);
            return res;
        })
        const results = await Promise.all(promises);
        for (const result of results) {
            await prisma.content.create({
                data: {
                    url: result.secure_url,
                    urlId: result.public_id,
                    postId: post.id
                }
            })
        }
        const finalPost = await prisma.post.update({
            where: {
                id: post.id
            },
            data: {
                status: "PUBLIC"
            },
            select: {
                caption: true,
                comments: true,
                content: {
                    select: {
                        url: true
                    }
                }
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Post Created Successfully",
            data: finalPost
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updatePost = async (req: UserRequest, res: Response) => {
    try {
        const { postId } = req.params;
        const data = req.body;
        const parsedData = PostSchema.safeParse(data);
        if (!postId || !parsedData.success) {
            return INVALID_REQUEST(res)
        }
        const updatedPost = await prisma.post.update({
            where: {
                id: Number(postId),
                status: "PUBLIC",
                creater: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            },
            data: {
                caption: parsedData.data.caption
            }
        })
        if (!updatedPost) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Post not found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Post Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const deletePost = async (req: UserRequest, res: Response) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return INVALID_REQUEST(res)
        }
        const delPost = await prisma.post.delete({
            where: {
                id: Number(postId),
                status: "PUBLIC",
                creater: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            },
            select: {
                content: true
            }
        })
        if (!delPost) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Post not found"
            })
        }
        for (const c of delPost.content) {
            await deleteFromCloudinary(c.urlId)
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Post Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const userAllPost = async (req: UserRequest, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            where: {
                status: "PUBLIC",
                creater: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            },
            select: {
                comments: {
                    select: {
                        comment: true,
                        commenter: {
                            select: {
                                id: true,
                                image: true,
                                name: true
                            }
                        },
                        edited: true,
                        replies: {
                            select: {
                                by: {
                                    select: {
                                        id: true,
                                        image: true,
                                        name: true
                                    }
                                },
                                to: {
                                    select: {
                                        id: true,
                                        image: true,
                                        name: true
                                    }
                                },
                                reply: true,
                                id: true
                            }
                        }
                    }
                }
            }
        })
        if (!posts) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "No Post Found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Post Fetched",
            data: posts
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const getAPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Post Id is missing"
            })
        }
        const post = await prisma.post.findUnique({
            where: {
                id: Number(postId),
                status: "PUBLIC"
            }
        })
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Post not Found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Post Fetched",
            data: post
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const likeAPost = async (req: UserRequest, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Post Id is missing"
            })
        }
        const post = await prisma.post.findFirst({
            where: {
                id: Number(postId),
                status: "PUBLIC"
            }
        })
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Post not Found "
            })
        }
        const like = await prisma.like.create({
            data: {
                userId: Number(req.user?.id),
                postId: Number(postId)
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Post Liked"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const unlikeAPost = async (req: UserRequest, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Post Id is missing"
            })
        }
        const post = await prisma.post.findFirst({
            where: {
                id: Number(postId),
                status: "PUBLIC"
            }
        })
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Post not Found "
            })
        }
        const like = await prisma.like.findFirst({
            where: {
                postId: Number(postId),
                userId: Number(req.user?.id)
            }
        })
        if (!like) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Like Not Found"
            })
        }
        await prisma.like.delete({
            where: {
                id: like.id
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Post Unliked"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}