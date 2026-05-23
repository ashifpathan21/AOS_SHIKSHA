import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../utils/db.js";
import type { UserRequest } from "../types/express/index.js";

const getUserInterests = async (
    userId: number
): Promise<string[]> => {

    const interests = new Set<string>();

    const enrolledCourses =
        await prisma.courseEnrollment.findMany({
            where: {
                userId
            },
            include: {
                course: {
                    select: {
                        category: true,
                        name: true
                    }
                }
            }
        });

    for (const enrollment of enrolledCourses) {

        const category =
            enrollment.course.category;

        const courseName =
            enrollment.course.name;

        if (category) {
            interests.add(
                category.toLowerCase()
            );
        }

        if (courseName) {
            interests.add(
                courseName.toLowerCase()
            );
        }
    }

    const likedPosts =
        await prisma.like.findMany({
            where: {
                userId
            },
            include: {
                post: {
                    select: {
                        caption: true
                    }
                }
            },
            take: 50
        });

    for (const like of likedPosts) {

        const caption =
            like.post.caption;

        if (!caption) continue;

        caption
            .toLowerCase()
            .split(/\s+/)
            .forEach(word => {

                const cleaned =
                    word.replace(
                        /[^a-zA-Z0-9]/g,
                        ""
                    );

                if (cleaned.length > 3) {
                    interests.add(cleaned);
                }
            });
    }

    return [...interests];
};

const getFollowingSet = async (
    userId: number
): Promise<Set<number>> => {

    const following =
        await prisma.follow.findMany({
            where: {
                followerId: userId
            },
            select: {
                followingId: true
            }
        });

    return new Set(
        following.map(
            follow => follow.followingId
        )
    );
};

const getCandidatePosts = async (
    userId?: number
) => {

    return prisma.post.findMany({
        where: {
            status: "PUBLIC",
            ...(userId
                ? {
                    createdBy: {
                        not: userId
                    }
                }
                : {})
        },
        include: {
            content: true,
            likes: {
                select: {
                    userId: true
                }
            },
            comments: {
                select: {
                    id: true
                }
            },
            creater: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 100
    });
};

const calculateScore = (
    post: any,
    interests: string[],
    followingSet: Set<number>
): number => {

    let score = 0;

    score += post.likes.length * 2;

    score += post.comments.length * 4;

    if (
        post.creater?.id &&
        followingSet.has(post.creater.id)
    ) {
        score += 20;
    }

    const caption =
        (post.caption || "")
            .toLowerCase();

    for (const interest of interests) {

        if (
            interest &&
            caption.includes(interest)
        ) {
            score += 10;
        }
    }

    const hoursOld =
        (
            Date.now() -
            new Date(post.createdAt).getTime()
        ) / (1000 * 60 * 60);

    score += Math.max(
        40 - hoursOld,
        0
    );

    return score;
};

const shuffleArray = <T>(
    array: T[]
): T[] => {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
};

export const getExploreFeed = async (
    req: UserRequest,
    res: Response
) => {

    try {

        const userId =
            req.user?.id
                ? Number(req.user.id)
                : null;

        if (userId === null) {

            const posts =
                await prisma.post.findMany({
                    where: {
                        status: "PUBLIC"
                    },
                    include: {
                        content: true,
                        likes: true,
                        comments: true,
                        creater: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 30
                });

            const rankedPosts = posts
                .map(post => {

                    const hoursOld =
                        (
                            Date.now() -
                            new Date(
                                post.createdAt
                            ).getTime()
                        ) /
                        (1000 * 60 * 60);

                    const score =
                        (post.likes.length * 2) +
                        (post.comments.length * 4) +
                        Math.max(
                            30 - hoursOld,
                            0
                        );

                    return {
                        ...post,
                        score
                    };
                })
                .sort(
                    (a, b) =>
                        b.score - a.score
                );

            return res
                .status(StatusCodes.OK)
                .json({
                    success: true,
                    posts: rankedPosts
                });
        }

        const [
            interests,
            followingSet,
            posts
        ] = await Promise.all([
            getUserInterests(userId),
            getFollowingSet(userId),
            getCandidatePosts(userId)
        ]);

        const rankedPosts = posts
            .map(post => ({
                ...post,
                score: calculateScore(
                    post,
                    interests,
                    followingSet
                )
            }))
            .sort(
                (a, b) =>
                    b.score - a.score
            );

        const personalized =
            rankedPosts.slice(0, 15);

        const trending =
            [...rankedPosts]
                .sort((a, b) => {

                    const aEngagement =
                        a.likes.length +
                        a.comments.length;

                    const bEngagement =
                        b.likes.length +
                        b.comments.length;

                    return (
                        bEngagement -
                        aEngagement
                    );
                })
                .slice(0, 5);

        const randomPosts =
            shuffleArray(
                rankedPosts.slice(20)
            ).slice(0, 5);

        const finalFeed = [
            ...personalized,
            ...trending,
            ...randomPosts
        ];

        const uniquePosts =
            Array.from(
                new Map(
                    finalFeed.map(
                        post => [
                            post.id,
                            post
                        ]
                    )
                ).values()
            );

        return res
            .status(StatusCodes.OK)
            .json({
                success: true,
                posts: uniquePosts
            });

    } catch (error) {

        console.log(error);

        if (res.headersSent) {
            return;
        }

        return res
            .status(
                StatusCodes.INTERNAL_SERVER_ERROR
            )
            .json({
                success: false,
                message:
                    "Internal Server Error"
            });
    }
};

export const searchPosts = async (
    req: UserRequest,
    res: Response
) => {

    try {

        const query =
            String(req.query.q || "")
                .trim()
                .toLowerCase();

        if (!query) {

            return res
                .status(
                    StatusCodes.BAD_REQUEST
                )
                .json({
                    success: false,
                    message:
                        "Search query is required"
                });
        }

        const posts =
            await prisma.post.findMany({
                where: {
                    status: "PUBLIC",
                    OR: [
                        {
                            caption: {
                                contains: query,
                                mode: "insensitive"
                            }
                        },
                        {
                            creater: {
                                username: {
                                    contains: query,
                                    mode: "insensitive"
                                }
                            }
                        },
                        {
                            creater: {
                                name: {
                                    contains: query,
                                    mode: "insensitive"
                                }
                            }
                        }
                    ]
                },
                include: {
                    content: true,
                    likes: {
                        select: {
                            userId: true
                        }
                    },
                    comments: {
                        select: {
                            id: true
                        }
                    },
                    creater: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 50
            });

        const rankedPosts = posts
            .map(post => {

                let score = 0;

                const caption =
                    (
                        post.caption || ""
                    ).toLowerCase();

                const username =
                    (
                        post.creater
                            ?.username || ""
                    ).toLowerCase();

                const name =
                    (
                        post.creater
                            ?.name || ""
                    ).toLowerCase();

                if (
                    caption.includes(query)
                ) {
                    score += 20;
                }

                if (
                    username.includes(query)
                ) {
                    score += 30;
                }

                if (
                    name.includes(query)
                ) {
                    score += 25;
                }

                score +=
                    post.likes.length * 2;

                score +=
                    post.comments.length * 4;

                return {
                    ...post,
                    score
                };
            })
            .sort(
                (a, b) =>
                    b.score - a.score
            );

        return res
            .status(StatusCodes.OK)
            .json({
                success: true,
                posts: rankedPosts
            });

    } catch (error) {

        console.log(error);

        if (res.headersSent) {
            return;
        }

        return res
            .status(
                StatusCodes.INTERNAL_SERVER_ERROR
            )
            .json({
                success: false,
                message:
                    "Internal Server Error"
            });
    }
};