import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import {  z } from "zod"
import { ProfileSchema } from "../types/requestTypes/user.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";

export const updateProfile = async (req: UserRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unautorized Access"
            })
        }
        const data = req.body
        const parsedData = z.safeParse(ProfileSchema, data);
        if (!parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }
        const { gender, dob, phoneNumber, about, collegeName } = parsedData.data;
        if (!gender && !dob && !phoneNumber && !about && !collegeName) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Empty Fields"
            })
        }
        const profile = await prisma.profile.update({
            where: {
                userId: Number(req.user.id)
            },
            data: {
                about: about,
                collegeName: collegeName,
                dob: dob,
                gender: gender,
                phoneNumber: phoneNumber
            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Profile Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const updateImage = async (req: UserRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unautorized Access"
            })
        }
        const file = req.file;
        if (!file) return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "No Image is selected"
        });

        const result = await uploadToCloudinary(file);
        if (!result) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something Went Wrong"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                id: Number(req.user.id)
            }
        })
        if (user?.image && user.imageId && user.imageId != user.image) {
            await deleteFromCloudinary(user.imageId)
        }
        await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                image: result.secure_url,
                imageId: result.public_id
            }
        })
        return res.status(StatusCodes.ACCEPTED).json({
            success: true,
            message: "Image Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const getUserDetails = async (req: UserRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userEmail = req.user?.email;
        if (!userId || !userEmail) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unautorized Access"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                id: Number(userId),
                email: userEmail
            },
            select: {
                name: true,
                courseProgress: true,
                createdCourses: true,
                enrolledCourses: true,
                points: true,
                followers: true,
                followings: true,
                email: true,
                image: true,
                posts: true,
                profile: true,
                username: true,
                accountType: true,
                comments: true,
                ratingAndReviews: true
            }
        })
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User Not Found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User Data Fetched",
            data:user
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


