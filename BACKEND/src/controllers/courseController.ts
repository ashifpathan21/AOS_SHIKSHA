import type { Request, Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import { StatusCodes } from "http-status-codes";
import { z } from 'zod'
import { CourseSchema } from "../types/requestTypes/course.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import prisma from "../utils/db.js";

export const createCourse = async (req: UserRequest, res: Response) => {
    try {
        const data = req.body;
        const parsedData = z.safeParse(CourseSchema, data);
        const file = req.file
        if (!parsedData.success || !file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }

        const { name, description, outcomes, price, category, instructions, status } = parsedData.data
        const result = await uploadToCloudinary(file);
        const course = await prisma.course.create({
            data: {
                name,
                description,
                outcomes,
                price,
                instructions,
                category,
                status,
                userId: Number(req.user?.id),
                thumbnail: result.secure_url,
                thumbnailId: result.public_id
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Course Created Successfully",
            data: course
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updateCourse = async (req: UserRequest, res: Response) => {
    try {
        const { id } = req.params
        const data = req.body;
        const parsedData = z.safeParse(CourseSchema, data);
        const file = req.file
        if (!parsedData.success || !id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }
        const { name, description, outcomes, price, category, instructions, status } = parsedData.data
        const course = await prisma.course.findFirst({
            where: {
                id: Number(id),
                userId: Number(req.user?.id)
            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }

        if (file) {
            const public_id = course.thumbnailId;
            const result = await uploadToCloudinary(file)
            const updatedCourse = await prisma.course.update({
                where: {
                    id: course.id
                },
                data: {
                    name,
                    description,
                    outcomes,
                    price,
                    instructions,
                    category,
                    status,
                    thumbnail: result.secure_url,
                    thumbnailId: result.public_id
                }
            })
            await deleteFromCloudinary(public_id)
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Course Updated Successfully",
                data: updatedCourse
            })
        } else {
            const updatedCourse = await prisma.course.update({
                where: {
                    id: course.id
                },
                data: {
                    name,
                    description,
                    outcomes,
                    price,
                    instructions,
                    category,
                    status
                }
            })
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Course Updated Successfully",
                data: updatedCourse
            })
        }
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const deleteCourse = async (req: UserRequest, res: Response) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide Course Id "
            })
        }
        const course = await prisma.course.findFirst({
            where: {
                id: Number(id),
                userId: Number(req.user?.id)
            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }
        await deleteFromCloudinary(course.thumbnailId)
        await prisma.course.delete({
            where: {
                id: course.id,
                userId: Number(req.user?.id)
            }
        })
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Course Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const getCourseBasicDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide Course Id "
            })
        }
        const course = await prisma.course.findFirst({
            where: {
                id: Number(id),
                status: "PUBLIC"
            },
            select: {
                category: true,
                createdAt: true,
                description: true,
                instructions: true,
                instructor: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                ratingAndReviews: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                name: true,
                outcomes: true,
                thumbnail: true,
                price: true,
                sections: {
                    select: {
                        name: true,
                        subsections: {
                            select: {
                                title: true,
                                duration: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        studentsEnrolled: true
                    }
                },

            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found "
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Course Fetched",
            data: course
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const getAllCourseBasicDetails = async (req: Request, res: Response) => {
    try {

        const courses = await prisma.course.findMany({
            where: {
                status: "PUBLIC"
            },
            select: {
                category: true,
                createdAt: true,
                description: true,
                instructions: true,
                instructor: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                ratingAndReviews: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                name: true,
                outcomes: true,
                thumbnail: true,
                price: true,
                sections: {
                    select: {
                        name: true,
                        subsections: {
                            select: {
                                title: true,
                                duration: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        studentsEnrolled: true
                    }
                },

            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Course Fetched",
            data: courses
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

