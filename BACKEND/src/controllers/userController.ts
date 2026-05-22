import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { z } from "zod"
import { ChangePasswordSchema, ProfileSchema } from "../types/requestTypes/user.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import bcrypt from 'bcrypt'


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
        const { name, gender, dob, phoneNumber, about, collegeName } = parsedData.data;

        if (!name && !gender && !dob && !phoneNumber && !about && !collegeName) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Empty Fields"
            })
        }
        await prisma.user.update({
            where: {
                id: Number(req.user?.id),
                email: req.user?.email
            },
            data: {
                name
            }
        })
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
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
                email: userEmail
            },
            select: {
                name: true,
                courseProgress: true,
                likes: true,
                questionSubmissions: true,
                receivedReplies: true,
                testSubmissions: true,
                sendReplies: true,
                votes: true,
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
            data: user
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const checkUserNameAvailability = async (req: UserRequest, res: Response) => {
    try {
        const { username } = req.params;
        if (!username) {
            return INVALID_REQUEST(res);
        }
        const user = await prisma.user.findFirst({
            where: {
                username: String(username)
            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Availability Checked",
            data: {
                isAvailable: user?.id ? false : true,
                message: user?.id ? "Not available" : "Available"
            }
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updateUsername = async (req: UserRequest, res: Response) => {
    try {
        const { username } = req.params;
        if (!username) {
            return INVALID_REQUEST(res);
        }
        const user = await prisma.user.findFirst({
            where: {
                username: String(username)
            }
        })
        if (user) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                messaeg: "Username already taken"
            })
        }
        await prisma.user.update({
            where: {
                id: Number(req.user?.id),
                email: req.user?.email
            },
            data: {
                username: String(username)
            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Username Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const changePassword = async (req: UserRequest, res: Response) => {
    try {
        const parsedData = ChangePasswordSchema.safeParse(req.body)
        if (!parsedData.success) {
            return INVALID_REQUEST(res)
        }
        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.user?.id),
                email: req.user?.email
            }
        })
        if (!user || !user.password) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Try to reset your psssword"
            })
        }
        const isMatch = await bcrypt.compare(`${req.user?.email}${parsedData.data.prevPassword}`, user.password);
        if (isMatch) {
            const encryptedPassword = await bcrypt.hash(`${req.user?.email}${parsedData.data.newPassword}`, 16)
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: encryptedPassword
                }
            })
            return res.status(StatusCodes.ACCEPTED).json({
                success: true,
                message: "Password Updated Successfully"
            })
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Password is wrong"
            })
        }
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}