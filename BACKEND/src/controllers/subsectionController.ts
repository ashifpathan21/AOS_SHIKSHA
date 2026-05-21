import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import z from "zod";
import { ProgressSchema, SubsectionSchema } from "../types/requestTypes/subsection.js";
import { getYoutubeVideoDuration } from "../utils/youtube.js";

export const createSubsection = async (req: UserRequest, res: Response) => {
    try {
        const { sectionId } = req.params;
        const data = req.body
        const parsedData = z.safeParse(SubsectionSchema, data)
        if (!sectionId || !parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide SectionId"
            })
        }
        const section = await prisma.section.findFirst({
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
        if (!section) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Section not found"
            })
        }
        const { title, description, videoUrl, duration, points } = parsedData.data;
        let finalDuration = (!duration || duration < 0) ? null : duration;
        if (videoUrl && !finalDuration) {
            finalDuration = await getYoutubeVideoDuration(videoUrl)
        }
        const subsection = await prisma.subSection.create({
            data: {
                title: title,
                description: description,
                videoUrl: videoUrl || null,
                duration: finalDuration,
                points: points || 2,
                sectionId: section.id
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Subsection Created Success",
            data: subsection
        })

    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const updateSubsection = async (req: UserRequest, res: Response) => {
    try {
        const { subsectionId } = req.params;
        const data = req.body
        const parsedData = z.safeParse(SubsectionSchema, data)
        if (!subsectionId || !parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide SectionId"
            })
        }
        const { title, description, videoUrl, duration, points } = parsedData.data;
        let finalDuration = (!duration || duration < 0) ? null : duration;
        if (videoUrl && !finalDuration) {
            finalDuration = await getYoutubeVideoDuration(videoUrl)
        }
        const subsection = await prisma.subSection.update({
            where: {
                id: Number(subsectionId),
                section: {
                    course: {
                        instructor: {
                            id: Number(req.user?.id),
                            email: req.user?.email
                        }
                    }
                }
            },
            data: {
                title: title,
                description: description,
                videoUrl: videoUrl || null,
                duration: finalDuration,
                points: points || 2,
            }
        })
        if (!subsection) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Subsection Not Found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: false,
            message: "Subsection Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const deleteSubsection = async (req: UserRequest, res: Response) => {
    try {
        const { subsectionId } = req.params;
        if (!subsectionId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide SectionId"
            })
        }
        const subsection = await prisma.subSection.delete({
            where: {
                id: Number(subsectionId),
                section: {
                    course: {
                        instructor: {
                            id: Number(req.user?.id),
                            email: req.user?.email
                        }
                    }
                }
            }
        })
        if (!subsection) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Subsection Not Found"
            })
        }
        return res.status(StatusCodes.NO_CONTENT).json({
            success: false,
            message: "Subsection Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updateProgress = async (req: UserRequest, res: Response) => {
    try {
        const { subsectionId } = req.params
        const data = req.body
        const parsedData = z.safeParse(ProgressSchema, data)
        if (!subsectionId || !parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide SectionId"
            })
        }
        const subsection = await prisma.subSection.findFirst({
            where: {
                id: Number(subsectionId),
                section: {
                    course: {
                        status: "PUBLIC",
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
            }
        })

        const courseProgress = await prisma.courseProgress.findFirst({
            where: {
                user: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                },
                course: {
                    status: "PUBLIC",
                    studentsEnrolled: {
                        some: {
                            user: {
                                id: Number(req.user?.id),
                                email: req.user?.email
                            }
                        }
                    },
                    sections: {
                        some: {
                            subsections: {
                                some: {
                                    id: Number(subsectionId)
                                }
                            }
                        }
                    }
                }
            }
        })
        if (!subsection || !courseProgress) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Subsection Not Found"
            })
        }
        const progress = await prisma.subSectionCompletion.findFirst({
            where: {
                courseProgressId: courseProgress.id,
                subSectionId: Number(subsectionId)
            }
        })
        if (!progress) {
            const watchTime = parsedData.data.watchTime
            const isFinished = subsection.duration && (watchTime > subsection.duration - (subsection.duration / 10))
            await prisma.subSectionCompletion.create({
                data: {
                    courseProgressId: courseProgress.id,
                    subSectionId: Number(subsectionId),
                    watchTime,
                    isFinished: Boolean(isFinished)
                }
            })
            if (isFinished) {
                await prisma.user.update({
                    where: {
                        id: Number(req.user?.id),
                        email: req.user?.email
                    },
                    data: {
                        points: {
                            increment: subsection.points
                        }
                    }
                })
            }
        } else {
            const watchTime = progress.watchTime + parsedData.data.watchTime
            const isFinished = subsection.duration && (watchTime > subsection.duration - (subsection.duration / 10))
            await prisma.subSectionCompletion.update({
                where: {
                    id: progress.id
                },
                data: {
                    watchTime,
                    isFinished: Boolean(isFinished)
                }
            })
            if (isFinished && !progress.isFinished) {
                await prisma.user.update({
                    where: {
                        id: Number(req.user?.id),
                        email: req.user?.email
                    },
                    data: {
                        points: {
                            increment: subsection.points
                        }
                    }
                })
            }
        }
        await prisma.courseProgress.update({
            where: {
                id: courseProgress.id,
                completions: {
                    every: {
                        isFinished: true
                    }
                }
            },
            data: {
                isCompleted: true
            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Progress Saved"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}