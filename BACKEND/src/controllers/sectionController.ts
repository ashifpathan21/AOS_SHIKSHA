import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import z from "zod";
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
            return  INVALID_REQUEST(res)
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
            return  INVALID_REQUEST(res)
        }
        const data = req.body;
        const parsedData = z.safeParse(SectionSchema, data)
        if (!parsedData.success) {
            return  INVALID_REQUEST(res)
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
            return  INVALID_REQUEST(res)
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