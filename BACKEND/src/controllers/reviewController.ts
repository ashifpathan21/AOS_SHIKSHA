import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import { ReviewSchema } from "../types/requestTypes/review.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import { io } from "../index.js";

// review event


export const addReview = async (req: UserRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const parsedData = ReviewSchema.safeParse(req.body);
        if (!parsedData.success || !courseId) {
            return INVALID_REQUEST(res)
        }
        const course = await prisma.course.findFirst({
            where: {
                id: Number(courseId),
                studentsEnrolled: {
                    some: {
                        user: {
                            id: Number(req.user?.id),
                            email: req.user?.email
                        }
                    }
                }
            }
        })

        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }
        const reviewed = await prisma.ratingAndReview.findUnique({
            where: {
                userId_courseId: {
                    userId: Number(req.user?.id),
                    courseId: course.id
                }
            }
        })
        if (reviewed) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Already Reviewed"
            })
        }
        const { review, rating } = parsedData.data;
        const rev = await prisma.ratingAndReview.create({
            data: {
                review,
                rating,
                courseId: course.id,
                userId: Number(req.user?.id)
            },
            select: {
                id: true,
                course: {
                    select: {
                        name: true,
                        thumbnail: true,
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                },
                rating: true,
                review: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }

            }
        })

        io.to(`user:${rev.course.instructor.id}`).emit("review", rev)

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Thanks for Review",
            data: rev
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updateReview = async (req: UserRequest, res: Response) => {
    try {
        const { reviewId } = req.params;
        const parsedData = ReviewSchema.safeParse(req.body);
        if (!parsedData.success || !reviewId) {
            return INVALID_REQUEST(res)
        }

        const { review, rating } = parsedData.data;
        const rev = await prisma.ratingAndReview.update({
            where: {
                id: Number(reviewId),
                user: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                },
                course: {
                    studentsEnrolled: {
                        some: {
                            user: {
                                id: Number(req.user?.id),
                                email: req.user?.email
                            }
                        }
                    }
                }
            },
            data: {
                review,
                rating
            }
        })

        if (!rev) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Review Not Found"
            })
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Review Updated",
            data: rev
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const deleteReview = async (req: UserRequest, res: Response) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId) {
            return INVALID_REQUEST(res)
        }

        const rev = await prisma.ratingAndReview.delete({
            where: {
                id: Number(reviewId),
                user: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                },
                course: {
                    studentsEnrolled: {
                        some: {
                            user: {
                                id: Number(req.user?.id),
                                email: req.user?.email
                            }
                        }
                    }
                }
            }
        })

        if (!rev) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Review Not Found"
            })
        }

        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Review Deleted",
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}