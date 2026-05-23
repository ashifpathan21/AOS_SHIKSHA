import type { Response } from "express";
import type { UserRequest } from "../types/express/index.js";
import { INTERNAL_SERVER_ERROR, INVALID_REQUEST } from "../utils/functionality.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";

export const follow = async (req: UserRequest, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return INVALID_REQUEST(res)
        }
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })
        if (!user || user.id === req.user?.id) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User Not Found"
            })
        }
        const fol = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: Number(req.user?.id),
                    followingId: Number(userId)
                }
            }
        })
        if (fol) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Already Followed"
            })
        }
        const isUserFollowsMe = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: Number(userId),
                    followingId: Number(req.user?.id)
                }
            }
        })

        const messageAllowed = Boolean(isUserFollowsMe?.id)
        if (isUserFollowsMe)
            await prisma.follow.update({
                where: {
                    followerId_followingId: {
                        followerId: Number(userId),
                        followingId: Number(req.user?.id)
                    }
                },
                data: {
                    messageAllowed: true
                }
            })
        await prisma.follow.create({
            data: {
                followerId: Number(req.user?.id),
                followingId: Number(userId),
                messageAllowed
            }
        })
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Followed the User"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const unfollow = async (req: UserRequest, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return INVALID_REQUEST(res)
        }
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),

            }
        })
        if (!user || user.id === req.user?.id) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User Not Found"
            })
        }
        const fol = await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: Number(req.user?.id),
                    followingId: Number(userId)
                }
            }
        })
        if (!fol) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Not Followed"
            })
        }

        return res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: "Unfollowed the User"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}

export const allowToMessage = async (req: UserRequest, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return INVALID_REQUEST(res)
        }
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "User Not Found"
            })
        }
        const isUserFollowsMe = await prisma.follow.update({
            where: {
                followerId_followingId: {
                    followerId: Number(userId),
                    followingId: Number(req.user?.id)
                }
            },
            data: {
                messageAllowed: true
            }
        })
        if (!isUserFollowsMe) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "User not follows you"
            })
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Request Approved"
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}


export const searchUsersByUsername = async (req: UserRequest, res: Response) => {
    try {
        const { username } = req.params;
        if (!username) {
            return INVALID_REQUEST(res)
        }
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: String(username)
                }
            }
            ,
            select: {
                id: true,
                name: true,
                image: true,
                enrolledCourses: {
                    select: {
                        course: {
                            select: {
                                name: true,
                                category: true,
                                description: true,
                                id: true,
                                thumbnail: true,
                                price: true
                            }
                        }
                    }
                },
                createdCourses: {
                    where: {
                        status: "PUBLIC"
                    },
                    select: {
                        name: true,
                        category: true,
                        description: true,
                        id: true,
                        thumbnail: true,
                        price: true
                    }
                },
                posts: {
                    select: {
                        id: true,
                        caption: true,
                        content: {
                            select: {
                                url: true
                            }
                        },
                        likes: {
                            select: {
                                by: {
                                    select: {
                                        name: true,
                                        image: true,
                                        id: true,
                                        username: true
                                    }
                                }
                            }
                        },
                        comments: {
                            select: {
                                comment: true,
                                votes: {
                                    select: {
                                        by: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                                username: true
                                            }
                                        },
                                        type: true
                                    }
                                },
                                _count: {
                                    select: {
                                        votes: true,
                                        replies: true
                                    }
                                }
                            }
                        }
                        ,
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        }
                    }
                },
                questionSubmissions: {
                    select: {
                        question: true,
                        isCorrect: true,
                        marks: true
                    }
                },
                testSubmissions: {
                    select: {
                        test: {
                            select: {
                                title: true,
                                _count: {
                                    select: {
                                        questions: true
                                    }
                                }
                            }
                        },
                        questionSubmissions: {
                            select: {
                                question: true,
                                isCorrect: true,
                                marks: true
                            }
                        },
                        _count: {
                            select: {
                                questionSubmissions: true
                            }
                        }
                    }
                },
                followers: {
                    select: {
                        follower: {
                            select: {
                                name: true,
                                image: true,
                                id: true,
                                username: true

                            }
                        }
                    }
                },
                followings: {
                    select: {
                        following: {
                            select: {
                                name: true,
                                image: true,
                                id: true,
                                username: true

                            }
                        }
                    }
                }
                ,
                _count: {
                    select: {
                        followers: true,
                        followings: true
                    }
                },
                username: true
            }
        })
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Users Fetched",
            data: users
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}



export const findAUser = async (req: UserRequest, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return INVALID_REQUEST(res)
        }
        const user = await prisma.user.findFirst({
            where: {
                id: Number(userId)

            }
            ,
            select: {
                id: true,
                name: true,
                image: true,
                enrolledCourses: {
                    select: {
                        course: {
                            select: {
                                name: true,
                                category: true,
                                description: true,
                                id: true,
                                thumbnail: true,
                                price: true
                            }
                        }
                    }
                },
                createdCourses: {
                    where: {
                        status: "PUBLIC"
                    },
                    select: {
                        name: true,
                        category: true,
                        description: true,
                        id: true,
                        thumbnail: true,
                        price: true
                    }
                },
                posts: {
                    select: {
                        id: true,
                        caption: true,
                        content: {
                            select: {
                                url: true
                            }
                        },
                        likes: {
                            select: {
                                by: {
                                    select: {
                                        name: true,
                                        image: true,
                                        id: true,
                                        username: true
                                    }
                                }
                            }
                        },
                        comments: {
                            select: {
                                comment: true,
                                votes: {
                                    select: {
                                        by: {
                                            select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                                username: true
                                            }
                                        },
                                        type: true
                                    }
                                },
                                _count: {
                                    select: {
                                        votes: true,
                                        replies: true
                                    }
                                }
                            }
                        }
                        ,
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        }
                    }
                },
                questionSubmissions: {
                    select: {
                        question: true,
                        isCorrect: true,
                        marks: true
                    }
                },
                testSubmissions: {
                    select: {
                        test: {
                            select: {
                                title: true,
                                _count: {
                                    select: {
                                        questions: true
                                    }
                                }
                            }
                        },
                        questionSubmissions: {
                            select: {
                                question: true,
                                isCorrect: true,
                                marks: true
                            }
                        },
                        _count: {
                            select: {
                                questionSubmissions: true
                            }
                        }
                    }
                },
                followers: {
                    select: {
                        follower: {
                            select: {
                                name: true,
                                image: true,
                                id: true,
                                username: true

                            }
                        }
                    }
                },
                followings: {
                    select: {
                        following: {
                            select: {
                                name: true,
                                image: true,
                                id: true,
                                username: true

                            }
                        }
                    }
                }
                ,
                _count: {
                    select: {
                        followers: true,
                        followings: true
                    }
                },
                username: true
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
            message: "User Fetched",
            data: user
        })
    } catch (error) {
        INTERNAL_SERVER_ERROR(res, error)
    }
}