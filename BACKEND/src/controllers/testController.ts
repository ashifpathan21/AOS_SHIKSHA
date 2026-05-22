import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import { TestSchema, TestSubmissionSchema } from "../types/requestTypes/test.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import { checkQuestion } from "../utils/questionMatcher.js";

export const createTest = async (req: UserRequest, res: Response) => {
    try {
        const { sectionId } = req.params;
        const data = req.body;
        const parsedData = TestSchema.safeParse(data);
        if (!sectionId || !parsedData.success) {
            return INVALID_REQUEST(res)
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
        const existedTest = await prisma.test.findFirst({
            where: {
                sectionId: section.id,
            }
        })
        if (existedTest) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Test Already Created"
            })
        }
        const { title, guidelines, description, endTime, startTime, timeline } = parsedData.data
        const test = await prisma.test.create({
            data: {
                title,
                guidelines,
                description,
                endTime,
                sectionId: section.id,
                startTime,
                timeline,
                status: "DRAFT"
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Test Created Succesfully",
            data: test
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const updateTest = async (req: UserRequest, res: Response) => {
    try {
        const { testId } = req.params;
        const data = req.body;
        const parsedData = TestSchema.safeParse(data);
        if (!testId || !parsedData.success) {
            return  INVALID_REQUEST(res)
        }
        const { title, guidelines, description, status, endTime, startTime, timeline } = parsedData.data
        const test = await prisma.test.update({
            where: {
                id: String(testId),
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
                title,
                guidelines,
                description,
                endTime,
                startTime,
                timeline,
                status
            }
        })
        if (!test) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Test not found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Test Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const deleteTest = async (req: UserRequest, res: Response) => {
    try {
        const { testId } = req.params;
        if (!testId) {
            return  INVALID_REQUEST(res)
        }
        const test = await prisma.test.delete({
            where: {
                id: String(testId),
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
        if (!test) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Test not found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Test Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}



export const submitTest = async (req: UserRequest, res: Response) => {
    try {
        const { testId } = req.params
        const data = req.body;
        const parsedData = TestSubmissionSchema.safeParse(data);
        if (!testId || !parsedData.success) {
            return  INVALID_REQUEST(res)
        }
        const test = await prisma.test.findUnique({
            where: {
                id: String(testId),
                status: "LIVE",
                section: {
                    course: {
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
        if (!test) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Test Not Found"
            })
        }
        if ((test.startTime && new Date(test.startTime).getTime() > Date.now()) || (test.endTime && new Date(test.endTime).getTime() < Date.now())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Test is Expired"
            })
        }
        const existingSubmission = await prisma.testSubmission.findUnique({
            where: {
                testId_userId: {
                    testId: test.id,
                    userId: Number(req.user?.id)
                }
            }
        })
        if (existingSubmission) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Test Already Submitted"
            })
        }
        const testSubmission = await prisma.testSubmission.create({
            data: {
                testId: test.id,
                userId: Number(req.user?.id)
            }
        })
        for (const q of parsedData.data.answers) {
            const question = await prisma.question.findUnique({
                where: {
                    id: q.questionId,
                    testId: test.id
                }
            })
            if (question) {
                const isCorrect = await checkQuestion(q.answer, question)
                const isSubmissionExist = await prisma.questionSubmission.findFirst({
                    where: {
                        questionId: question.id,
                        testSubmissionId: testSubmission.id,
                        by: {
                            id: Number(req.user?.id),
                            email: req.user?.email
                        }
                    }
                })
                if (!isSubmissionExist) {
                    await prisma.questionSubmission.create({
                        data: {
                            testSubmissionId: testSubmission.id,
                            userId: Number(req.user?.id),
                            questionId: question.id,
                            isCorrect,
                            marks: isCorrect ? question.marks : 0
                        }
                    })
                }
            }
        }
        const finalSubmission = await prisma.testSubmission.findUnique({
            where: {
                id: testSubmission.id
            },
            select: {
                questionSubmissions: {
                    select: {
                        isCorrect: true,
                        marks: true,
                        question: {
                            select: {
                                question: true,
                                correctOption: true,
                                marks: true,
                                options: true
                            }
                        },
                    }
                }
            }
        })

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Test Submitted Success",
            data: finalSubmission
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}