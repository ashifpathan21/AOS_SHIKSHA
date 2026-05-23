import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import z, { success } from "zod";
import { SectionSchema } from "../types/requestTypes/section.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";


export const createSection = async (req: UserRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return INVALID_REQUEST(res)
        }
        const data = req.body;
        const parsedData = z.safeParse(SectionSchema, data);
        if (!parsedData.success) {
            return INVALID_REQUEST(res)
        }
        const section = await prisma.section.create({
            data: {
                name: parsedData.data.name,
                courseId: Number(courseId)
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Section Created Success"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updateSection = async (req: UserRequest, res: Response) => {
    try {
        const { sectionId } = req.params;
        if (!sectionId) {
            return INVALID_REQUEST(res)
        }
        const data = req.body;
        const parsedData = z.safeParse(SectionSchema, data)
        if (!parsedData.success) {
            return INVALID_REQUEST(res)
        }
        const section = await prisma.section.update({
            where: {
                id: Number(sectionId),
                course: {
                    instructor: {
                        id: Number(req.user?.id),
                        email: req.user?.email
                    }
                }
            },
            data: {
                name: parsedData.data.name
            }
        })
        if (!section) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Section not found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Section Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const deleteSection = async (req: UserRequest, res: Response) => {
    try {
        const { sectionId } = req.params
        if (!sectionId) {
            return INVALID_REQUEST(res)
        }

        const deletedSection = await prisma.section.delete({
            where: {
                id: Number(sectionId),
                course: {
                    instructor: {
                        id: Number(req.user?.id),
                        email: req.user?.email
                    }
                }
            }
        })
        if (!deletedSection) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Section Not Found"
            })
        }
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Section Delete Success"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const getAllSections = async (req: UserRequest, res: Response) => {
    try {
        const courseId = Number(req.params?.courseId)
        if (!courseId) {
            return INVALID_REQUEST(res)
        }
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                OR: [
                    {
                        instructor: {
                            id: Number(req.user?.id),
                            email: req.user?.email
                        }
                    },
                    {
                        studentsEnrolled: {
                            some: {
                                user: {
                                    id: Number(req.user?.id),
                                    email: req.user?.email
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                _count: {
                    select: {
                        sections: true
                    }
                },
                id: true
            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }
        const sections = await prisma.section.findMany({
            where: {
                courseId: course?.id,
                course: {
                    OR: [
                        {
                            instructor: {
                                id: Number(req.user?.id),
                                email: req.user?.email
                            }
                        },
                        {
                            studentsEnrolled: {
                                some: {
                                    user: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            select: {
                id: true,
                name: true,
                subsections: {
                    select: {
                        comments: {
                            select: {
                                id: true,
                                comment: true,
                                createdAt: true,
                                commenter: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                        username: true
                                    }
                                },
                                votes: {
                                    select: {
                                        by: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                                username: true
                                            }
                                        },
                                        type: true
                                    },
                                },
                                edited: true,
                                replies: {
                                    select: {
                                        by: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                                username: true
                                            }
                                        },
                                        to: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                                username: true
                                            }
                                        },
                                        reply: true,
                                        id: true,

                                    },
                                    orderBy: {
                                        id: 'asc'
                                    }
                                }
                            },
                            orderBy: {
                                id: "desc"
                            }
                        }
                    },
                    orderBy: {
                        id: "asc"
                    }
                },
                test: {
                    select: {
                        description: true,
                        id: true,
                        createdAt: true,
                        startTime: true,
                        endTime: true,
                        guidelines: true,
                        questions: {
                            select: {
                                id: true,
                                marks: true,
                                options: true,
                                question: true,
                                type: true,

                            },
                            orderBy: {
                                id: "asc"
                            }
                        }
                    }
                },
                createdAt: true,
            },
            orderBy: {
                id: "asc"
            }
        })
        if (!sections && course._count.sections !== 0) {

            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Please Enroll into the Course to access its content"
            })

        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Sections Fetched",
            data: sections
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}