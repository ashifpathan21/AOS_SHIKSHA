import type { Request, Response } from "express";
import { oauthclient } from "../utils/googleConfig.js";
import { StatusCodes } from 'http-status-codes'
import axios from 'axios'
import prisma from "../utils/db.js";
import { signToken } from "../utils/jwt.js";
import { success, z } from 'zod'
import { LoginSchema, OTPSchema, SignupSchema } from "../types/requestTypes/user.js";
import otpgenerator from 'otp-generator'
import mailSender from "../utils/mailer.js";
import otpTemplate from "../mail/OTPVerification.js";
import bcrypt from 'bcrypt'

export const googleLogin = async (req: Request, res: Response) => {
    try {
        console.log("Logiin")
        const { code } = req.query;
        console.log(code)
        if (!code) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Request"
            })
        }
        const googleResponse = await oauthclient.getToken(code as string);
        oauthclient.setCredentials(googleResponse.tokens)

        const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`)
        const { email, name, picture } = userResponse.data;
        let user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        console.log(user)
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    image: picture,
                    imageId: picture
                }
            })
        }
        const token = signToken({
            userId: user.id,
            userEmail: user.email
        })
        return res.status(StatusCodes.ACCEPTED).json({
            success: true,
            message: "User Logged In",
            data: {
                ...user,
                points: Number(user.points)

            },
            token: token
        })
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const signup = async (req: Request, res: Response) => {
    try {
        const data = req.body
        const parsedData = z.safeParse(SignupSchema, data);
        if (!parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        })
        if (user) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: 'User Already Exists'
            })
        } else {
            const { name, email, password, accountType } = parsedData.data
            const generatedOTP = otpgenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                specialChars: false,
                upperCaseAlphabets: false
            })
            const encryptedPassword = await bcrypt.hash(`${email}${password}`, 16)
            const otp = await prisma.oTP.create({
                data: {
                    name: name,
                    email: email,
                    password: encryptedPassword,
                    otp: generatedOTP,
                    type: "LOGIN",
                    accountType: accountType
                }
            })
            await mailSender(email, "OTP for Sign Up on AOS-Shiksha", otpTemplate(otp.otp, 'signup'));
            return res.status(200).json({
                success: true,
                message: `OTP is sent to ${email.slice(0, 4)}XXXXXXX@${email.split('@')[1]}`
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const data = req.body
        const parsedData = z.safeParse(OTPSchema, data);
        if (!parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }
        const OTP = await prisma.oTP.findFirst({
            where: {
                email: parsedData.data.email,
                otp: parsedData.data.otp
            }
        })
        if (!OTP) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        const otpExpiryMs = 5 * 60 * 1000
        const createdAt = new Date(OTP.createdAt).getTime()
        if (Date.now() > createdAt + otpExpiryMs) {
            await prisma.oTP.deleteMany({
                where: {
                    email: OTP.email,
                    otp: OTP.otp
                }
            })
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "OTP expired"
            })
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                email: OTP.email
            }
        })
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "User already exists"
            })
        }

        const user = await prisma.user.create({
            data: {
                name: OTP.name,
                email: OTP.email,
                password: OTP.password,
                accountType: OTP.accountType
            }
        })

        await prisma.oTP.deleteMany({
            where: {
                email: OTP.email,
                otp: OTP.otp
            }
        })

        const token = signToken({
            userId: user.id,
            userEmail: user.email
        })

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "User verified and created successfully",
            data: {
                ...user,
                points: Number(user.points)
            },
            token: token
        })
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const data = req.body
        const parsedData = z.safeParse(LoginSchema, data)
        if (!parsedData.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        })
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Incorrect email or password"
            })
        }
        if (!user.password) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Try Login with Google"
            })
        }
        const isMatch = await bcrypt.compare(`${parsedData.data.email}${parsedData.data.password}`, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Incorrect email or password"
            })
        }
        const token = signToken({
            userId: user.id,
            userEmail: user.email
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Logged In successfully",
            data: {
                ...user,
                points: Number(user.points)
            },
            token: token
        })
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}