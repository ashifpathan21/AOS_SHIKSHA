import type { Request, Response } from "express";
import { oauthclient } from "../utils/googleConfig.js";
import { StatusCodes } from 'http-status-codes'
import axios from 'axios'
import prisma from "../utils/db.js";
import { signToken } from "../utils/jwt.js";
import { email, success, z } from 'zod'
import { LoginSchema, OTPSchema, ResetPasswordRequestSchema, ResetPasswordSchema, SignupSchema } from "../types/requestTypes/user.js";
import otpgenerator, { generate } from 'otp-generator'
import mailSender from "../utils/mailer.js";
import otpTemplate from "../mail/OTPVerification.js";
import bcrypt from 'bcrypt'
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import crypto from 'crypto'

const otpExpiryMs = 5 * 60 * 1000
const otpLimitMs = 60 * 1000

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
            token: token
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
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
            let otp = await prisma.oTP.findFirst({
                where: {
                    name: name,
                    email: email,
                    type: 'LOGIN',
                    accountType: accountType
                }
            })

            if (otp && new Date(otp.createdAt).getTime() + otpExpiryMs < Date.now()) {
                await prisma.oTP.deleteMany({
                    where: {
                        email: otp.email,
                    }
                })
                otp = await prisma.oTP.create({
                    data: {
                        name: name,
                        email: email,
                        password: encryptedPassword,
                        otp: generatedOTP,
                        type: "LOGIN",
                        accountType: accountType
                    }
                })
            } else if (!otp) {
                otp = await prisma.oTP.create({
                    data: {
                        name: name,
                        email: email,
                        password: encryptedPassword,
                        otp: generatedOTP,
                        type: "LOGIN",
                        accountType: accountType
                    }
                })
            } else if (otp.createdAt != otp.lastSend && Date.now() - new Date(otp.lastSend).getTime() < otpLimitMs) {
                return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                    success: false,
                    message: "Please Try Again After Some Time !"
                })
            }
            await prisma.oTP.update({
                where: {
                    id: otp.id
                },
                data: {
                    lastSend: new Date(Date.now())
                }
            })

            await mailSender(email, "OTP for Sign Up on AOS-Shiksha", otpTemplate(otp.otp, 'signup'));
            return res.status(200).json({
                success: true,
                message: `OTP is sent to ${email.slice(0, 4)}XXXXXXX@${email.split('@')[1]}`
            })
        }

    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
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
        const profile = await prisma.profile.create({
            data: {
                userId: user.id
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
            token: token
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
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
            token: token
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const resetPasswordRequest = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const parsedData = z.safeParse(ResetPasswordRequestSchema, data);
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
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User Not Found"
            })
        }
        let OTP = await prisma.oTP.findFirst({
            where: {
                email: parsedData.data.email,
                type: "RESET"
            }
        })
        const generatedOTP = otpgenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            specialChars: false,
            upperCaseAlphabets: false
        })
        const token = crypto.randomBytes(20).toString("hex");
        if (OTP && new Date(OTP.createdAt).getTime() + otpExpiryMs < Date.now()) {
            await prisma.oTP.deleteMany({
                where: {
                    email: OTP.email,
                    name: user.name,
                    type: "RESET"
                }
            })
            OTP = await prisma.oTP.create({
                data: {
                    email: user.email,
                    password: token,
                    type: 'RESET',
                    otp: generatedOTP,
                    name: user.name
                }
            })

        } else if (!OTP) {
            OTP = await prisma.oTP.create({
                data: {
                    email: user.email,
                    password: token,
                    type: 'RESET',
                    otp: generatedOTP,
                    name: user.name
                }
            })
        } else if (OTP.createdAt != OTP.lastSend && Date.now() - new Date(OTP.lastSend).getTime() < otpLimitMs) {
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                success: false,
                message: "Please Try Again After Some Time !"
            })
        }
        await prisma.oTP.update({
            where: {
                id: OTP.id
            },
            data: {
                lastSend: new Date(Date.now())
            }
        })
        await mailSender(OTP.email, "OTP For Password Reset on AOS-Shiksha ", otpTemplate(OTP.otp, "reset_password", token))
        return res.status(200).json({
            success: true,
            message: `OTP is sent to ${OTP.email.slice(0, 4)}XXXXXXX@${OTP.email.split('@')[1]}`
        })

    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const resetPassword = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const parsedData = z.safeParse(ResetPasswordSchema, data);
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
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User Not Found"
            })
        }
        const OTP = await prisma.oTP.findFirst({
            where: {
                email: parsedData.data.email,
                password: parsedData.data.token,
                type: 'RESET',
                otp: parsedData.data.otp
            }
        })
        if (!OTP || new Date(OTP.createdAt).getTime() + otpExpiryMs < Date.now()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "OTP is Invalid or Expired"
            })
        }
        const encryptedPassword = await bcrypt.hash(`${user.email}${parsedData.data.password}`, 16)
        await prisma.user.update({
            where: {
                id: user.id,
                email: user.email
            },
            data: {
                password: encryptedPassword
            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Password Reset Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}