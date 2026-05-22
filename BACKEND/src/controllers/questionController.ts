import { StatusCodes } from "http-status-codes";
import type { UserRequest } from "../types/express/index.js";
import type { Response } from "express";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import z from "zod";
import { QuestionSchema, QuestionSubmitSchema } from "../types/requestTypes/question.js";
import prisma from "../utils/db.js";
import { checkQuestion } from "../utils/questionMatcher.js";


export const createQuestion = async (req: UserRequest, res: Response) => {
    try {
        const { testId, subsectionId } = req.params;
        const data = req.body;
        const parsedData = z.safeParse(QuestionSchema, data)
        if (!parsedData.success || (!testId && !subsectionId) || (testId && subsectionId)) {
            return INVALID_REQUEST(res)
        }

        const { question, type, correctOption, marks, options } = parsedData.data
        if (type === "MCQ" && (options?.length !== 4 || !options?.includes(correctOption))) {
            return INVALID_REQUEST(res)
        }
        let q;
        if (testId) {
            const test = await prisma.test.findFirst({
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
                    message: "Test Not Found"
                })
            }
            q = await prisma.question.create({
                data: {
                    options,
                    type,
                    correctOption,
                    marks: marks ?? 4,
                    question,
                    testId: test.id
                }
            })
        } else if (subsectionId) {
            const subsection = await prisma.subSection.findFirst({
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
                    message: "Test Not Found"
                })
            }
            q = await prisma.question.create({
                data: {
                    options,
                    type,
                    correctOption,
                    marks: marks ?? 4,
                    question,
                    subsectionId: subsection.id
                }
            })
        }
        if (!q) {
            INTERNAL_SERVER_ERROR(res, { message: "Something went wrong" })
        }
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Question Created Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const updateQuestion = async (req: UserRequest, res: Response) => {
    try {
        const questionId = Number(req.params.questionId);
        const data = req.body
        const parsedData = z.safeParse(QuestionSchema, data)
        if (!questionId || !parsedData.data) {
            return INVALID_REQUEST(res)
        }
        const { question, type, correctOption, marks, options } = parsedData.data
        if (type === "MCQ" && (options?.length !== 4 || !options?.includes(correctOption))) {
            return INVALID_REQUEST(res)
        }
        const updatedQuestion = await prisma.question.update({
            where: {
                id: questionId,
                OR: [
                    {
                        subsection: {
                            section: {
                                course: {
                                    instructor: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            }
                        }
                    },
                    {
                        test: {
                            section: {
                                course: {
                                    instructor: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            data: {
                question,
                type,
                options,
                correctOption,
                marks
            }
        })

        if (!updatedQuestion) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Question Not Found"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Question Updated Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const deleteQuestion = async (req: UserRequest, res: Response) => {
    try {
        const questionId = Number(req.params.questionId);

        if (!questionId) {
            return INVALID_REQUEST(res)
        }

        const delQ = await prisma.question.delete({
            where: {
                id: questionId,
                OR: [
                    {
                        subsection: {
                            section: {
                                course: {
                                    instructor: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            }
                        }
                    },
                    {
                        test: {
                            section: {
                                course: {
                                    instructor: {
                                        id: Number(req.user?.id),
                                        email: req.user?.email
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        })

        if (!delQ) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Question Not Found"
            })
        }
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Question Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const submitQuestion = async (req: UserRequest, res: Response) => {
    try {
        const { questionId } = req.params
        const data = req.body;
        const parsedData = QuestionSubmitSchema.safeParse(data);
        if (!parsedData.success || !questionId) {
            return INVALID_REQUEST(res)
        }
        const question = await prisma.question.findFirst({
            where: {
                id: Number(questionId),
                OR: [
                    {
                        subsection: {
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
                    },
                    {
                        test: {
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
                    },
                    {
                        quizId: {
                            not: null
                        }
                    }
                ]
            }
        })
        if (!question) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Invalid Request"
            })
        }

        const submissionExist = await prisma.questionSubmission.findFirst({
            where: {
                questionId: question.id,
                by: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                },
                testSubmissionId: null
            }
        })

        if (submissionExist) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Submission Already Exist"
            })
        }
        const isCorrect = await checkQuestion(parsedData.data.answer, question)
        const submission = await prisma.questionSubmission.create({
            data: {
                isCorrect,
                userId: Number(req.user?.id),
                questionId: question.id,
                marks: isCorrect ? question.marks : 0
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Submission Created",
            data: submission
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}



