import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import instance from "../utils/razorpay.js";
import crypto from 'crypto'
import 'dotenv/config'
if (!process.env.RAZORPAY_SECRET) {
    throw new Error("Razorpay Secret is not defined")
}

export const capturePayment = async (req: UserRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide Course Id"
            })
        }
        const course = await prisma.course.findFirst({
            where: {
                id: Number(courseId)
            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }
        const alreadyEnrolled = await prisma.courseEnrollment.findFirst({
            where: {
                courseId: Number(courseId),
                userId: Number(req.user?.id)
            }
        })

        if (alreadyEnrolled) {
            return res.status(StatusCodes.CONFLICT).json({
                success: true,
                message: "User Already Enrolled in the Course"
            })
        }
        if (course.price === null || !course.price || course.price === 0) {
           return enrollIntoCourse(req, res, Number(courseId))
        }
        const options = {
            amount: Number(course.price) * 100,
            currency: "INR",
            receipt: Date.now().toString()
        }
        const paymentResponse = await instance.orders.create(options)
        return res.json({
            success: true,
            data: paymentResponse
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const verifyPayment = async (req: UserRequest, res: Response) => {
    try {
        const userId = req.user?.id
        const courseId = req.params
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !courseId ||
            !userId
        ) {
            return res.status(200).json({ success: false, message: "Payment Failed" })
        }
        let body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET!)
            .update(body.toString())
            .digest("hex")


        if (expectedSignature === razorpay_signature) {
            enrollIntoCourse(req, res, Number(courseId))
        }

        return res.status(200).json({ success: false, message: "Payment Failed" })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}



const enrollIntoCourse = async (req: UserRequest, res: Response, courseId: Number) => {
    try {
        const enrollment = await prisma.courseEnrollment.create({
            data: {
                courseId: Number(courseId),
                userId: Number(req.user?.id)
            }
        })
        const progress = await prisma.courseProgress.create({
            data: {
                courseId: Number(courseId),
                userId: Number(req.user?.id)
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "User Enrolled in the Course"
        })


    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}