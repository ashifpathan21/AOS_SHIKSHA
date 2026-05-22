import type { Request, Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR } from "../utils/functionality.js";
import { StatusCodes } from "http-status-codes";
import { z } from 'zod'
import { CourseSchema } from "../types/requestTypes/course.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import prisma from "../utils/db.js";

export const createCourse = async (req: UserRequest, res: Response) => {
    try {
        console.log(req.body)
        const data = req.body;

        const parsedData = z.safeParse(CourseSchema, { ...data, price: Number(data.price || 0) });
        const file = req.file
        if (!parsedData.success || !file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }

        const { name, description, outcomes, price, category, instructions, status } = parsedData.data
        const result = await uploadToCloudinary(file);
        const course = await prisma.course.create({
            data: {
                name,
                description,
                outcomes,
                price,
                instructions,
                category,
                status,
                userId: Number(req.user?.id),
                thumbnail: result.secure_url,
                thumbnailId: result.public_id
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Course Created Successfully",
            data: course
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const updateCourse = async (req: UserRequest, res: Response) => {
    try {
        const { courseId: id } = req.params
        const data = req.body;
        const parsedData = z.safeParse(CourseSchema, { ...data, price: Number(data.price || 0) });
        const file = req.file
        if (!parsedData.success || !id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
                message: "Incomplete Fields"
            })
        }
        const { name, description, outcomes, price, category, instructions, status } = parsedData.data
        const course = await prisma.course.findFirst({
            where: {
                id: Number(id),
                instructor: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }

        if (file) {
            const public_id = course.thumbnailId;
            const result = await uploadToCloudinary(file)
            const updatedCourse = await prisma.course.update({
                where: {
                    id: course.id
                },
                data: {
                    name,
                    description,
                    outcomes,
                    price,
                    instructions,
                    category,
                    status,
                    thumbnail: result.secure_url,
                    thumbnailId: result.public_id
                }
            })
            await deleteFromCloudinary(public_id)
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Course Updated Successfully",
                data: updatedCourse
            })
        } else {
            const updatedCourse = await prisma.course.update({
                where: {
                    id: course.id
                },
                data: {
                    name,
                    description,
                    outcomes,
                    price,
                    instructions,
                    category,
                    status
                }
            })
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Course Updated Successfully",
                data: updatedCourse
            })
        }
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const deleteCourse = async (req: UserRequest, res: Response) => {
    try {
        const { courseId: id } = req.params
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide Course Id "
            })
        }
        const course = await prisma.course.findFirst({
            where: {
                id: Number(id),
                instructor: {
                    id: Number(req.user?.id),
                    email: req.user?.email
                }
            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found"
            })
        }
        await deleteFromCloudinary(course.thumbnailId)
        await prisma.course.delete({
            where: {
                id: course.id,
                userId: Number(req.user?.id)
            }
        })
        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Course Deleted Successfully"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const getCourseBasicDetails = async (req: Request, res: Response) => {
    try {
        const { courseId: id } = req.params;
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please Provide Course Id "
            })
        }
        const course = await prisma.course.findFirst({
            where: {
                id: Number(id),
                status: "PUBLIC"
            },
            select: {
                id: true,
                category: true,
                createdAt: true,
                description: true,
                instructions: true,
                instructor: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                ratingAndReviews: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                name: true,
                outcomes: true,
                thumbnail: true,
                price: true,
                sections: {
                    select: {
                        name: true,
                        subsections: {
                            select: {
                                title: true,
                                duration: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        studentsEnrolled: true
                    }
                },

            }
        })
        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course Not Found "
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Course Fetched",
            data: course
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const getAllCourseBasicDetails = async (req: Request, res: Response) => {
    try {

        const courses = await prisma.course.findMany({
            where: {
                status: "PUBLIC"
            },
            select: {
                id: true,
                category: true,
                createdAt: true,
                description: true,
                instructions: true,
                instructor: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                ratingAndReviews: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                name: true,
                outcomes: true,
                thumbnail: true,
                price: true,
                sections: {
                    select: {
                        name: true,
                        subsections: {
                            select: {
                                title: true,
                                duration: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        studentsEnrolled: true
                    }
                },

            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Courses Fetched",
            data: courses
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const getCourseDetailsForStudent = async (
    req: UserRequest,
    res: Response
) => {
    try {
        const courseId = Number(req.params.courseId);

        if (!courseId || Number.isNaN(courseId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Valid Course Id is required",
            });
        }

        const userId = req.user?.id;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                status: "PUBLIC",

                studentsEnrolled: {
                    some: {
                        user: {
                            id: Number(userId),
                            email: req.user?.email
                        }
                    },
                },
            },

            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                thumbnail: true,
                price: true,
                outcomes: true,
                instructions: true,
                createdAt: true,

                instructor: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },

                ratingAndReviews: {
                    select: {
                        id: true,
                        rating: true,
                        review: true,

                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },

                sections: {
                    orderBy: {
                        id: "asc",
                    },

                    select: {
                        id: true,
                        name: true,

                        test: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                timeline: true,
                                startTime: true,
                                endTime: true,
                            },
                        },

                        subsections: {
                            orderBy: {
                                id: "asc",
                            },

                            select: {
                                id: true,
                                title: true,
                                description: true,
                                duration: true,
                                points: true,
                                videoUrl: true,

                                completions: {
                                    where: {
                                        courseProgress: {
                                            userId: Number(userId),
                                        },
                                    },

                                    select: {
                                        isFinished: true,
                                        watchTime: true,
                                    },
                                },

                                questions: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        type: true,
                                        marks: true,
                                    },
                                },

                                comments: {
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                    select: {
                                        id: true,
                                        comment: true,
                                        createdAt: true,

                                        commenter: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                            },
                                        },

                                        replies: {
                                            orderBy: {
                                                createdAt: "asc",
                                            },

                                            select: {
                                                by: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                },
                                                reply: true,
                                                to: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        studentsEnrolled: true,
                    },
                },
            },
        });

        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course not found or access denied",
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Course fetched successfully",
            data: course
        });
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error);
    }
};



export const getCourseDetailsForInstructor = async (
    req: UserRequest,
    res: Response
) => {
    try {
        const courseId = Number(req.params.courseId);

        if (!courseId || Number.isNaN(courseId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Valid Course Id is required",
            });
        }

        const userId = req.user?.id;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                instructor: {
                    id: Number(userId),
                    email: req.user?.email
                }
            },

            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                thumbnail: true,
                thumbnailId: true,
                price: true,
                outcomes: true,
                instructions: true,
                status: true,
                createdAt: true,
                updatedAt: true,

                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },

                ratingAndReviews: {
                    select: {
                        id: true,
                        rating: true,
                        review: true,

                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },

                sections: {
                    orderBy: {
                        id: "asc",
                    },

                    select: {
                        id: true,
                        name: true,

                        test: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                guidelines: true,
                                timeline: true,
                                startTime: true,
                                endTime: true,
                                createdAt: true,

                                questions: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        correctOption: true,
                                        type: true,
                                        marks: true,
                                    },
                                },
                            },
                        },

                        subsections: {
                            orderBy: {
                                id: "asc",
                            },

                            select: {
                                id: true,
                                title: true,
                                description: true,
                                duration: true,
                                points: true,
                                videoUrl: true,
                                createdAt: true,
                                updatedAt: true,

                                completions: {
                                    select: {
                                        id: true,
                                        isFinished: true,
                                        watchTime: true,

                                        courseProgress: {
                                            select: {
                                                userId: true,
                                            },
                                        },
                                    },
                                },

                                questions: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        correctOption: true,
                                        type: true,
                                        marks: true,
                                    },
                                },

                                comments: {
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                    select: {
                                        id: true,
                                        comment: true,
                                        createdAt: true,

                                        commenter: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                            },
                                        },

                                        replies: {
                                            orderBy: {
                                                createdAt: "asc",
                                            },

                                            select: {
                                                by: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                },
                                                reply: true,
                                                to: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        studentsEnrolled: true,
                        sections: true,
                    },
                },
            },
        });

        if (!course) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Course not found or unauthorized",
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Instructor course fetched successfully",
            data: course
        });
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error);
    }
};



export const getAllCoursesForInstructor = async (
    req: UserRequest,
    res: Response
) => {
    try {

        const userId = req.user?.id;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const courses = await prisma.course.findMany({
            where: {
                instructor: {
                    id: Number(userId),
                    email: req.user?.email
                }
            },

            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                thumbnail: true,
                thumbnailId: true,
                price: true,
                outcomes: true,
                instructions: true,
                status: true,
                createdAt: true,
                updatedAt: true,

                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },

                ratingAndReviews: {
                    select: {
                        id: true,
                        rating: true,
                        review: true,

                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },

                sections: {
                    orderBy: {
                        id: "asc",
                    },

                    select: {
                        id: true,
                        name: true,

                        test: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                guidelines: true,
                                timeline: true,
                                startTime: true,
                                endTime: true,
                                createdAt: true,

                                questions: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        correctOption: true,
                                        type: true,
                                        marks: true,
                                    },
                                },
                            },
                        },

                        subsections: {
                            orderBy: {
                                id: "asc",
                            },

                            select: {
                                id: true,
                                title: true,
                                description: true,
                                duration: true,
                                points: true,
                                videoUrl: true,
                                createdAt: true,
                                updatedAt: true,

                                completions: {
                                    select: {
                                        id: true,
                                        isFinished: true,
                                        watchTime: true,

                                        courseProgress: {
                                            select: {
                                                userId: true,
                                            },
                                        },
                                    },
                                },

                                questions: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        correctOption: true,
                                        type: true,
                                        marks: true,
                                    },
                                },

                                comments: {
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                    select: {
                                        id: true,
                                        comment: true,
                                        createdAt: true,

                                        commenter: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                            },
                                        },

                                        replies: {
                                            orderBy: {
                                                createdAt: "asc",
                                            },

                                            select: {
                                                by: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                },
                                                reply: true,
                                                to: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        studentsEnrolled: true,
                        sections: true,
                    },
                },
            },
        });


        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Instructor's courses fetched successfully",
            data: courses
        });
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error);
    }
};