import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import z from "zod";
import { SubsectionSchema } from "../types/requestTypes/subsection.js";
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