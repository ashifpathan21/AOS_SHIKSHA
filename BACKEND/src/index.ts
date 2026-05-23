import { createServer } from "http";
import "dotenv/config";
import app from "./server.js";
import { Server, Socket } from "socket.io";
import { decodeToken } from "./utils/jwt.js";
import prisma from "./utils/db.js";
import { VoteType } from "../generated/prisma/enums.js";

const server = createServer(app);

const PORT = process.env.PORT || 3000;

interface UserSocket extends Socket {
    userId?: number;
    userEmail?: string;
}

interface MessagePayload {
    to: number;
    message: string;
}

interface TypingPayload {
    to: number;
}

interface LikePostPayload {
    postId: number;
    ownerId: number;
}

interface CommentPayload {
    postId?: number;
    subsectionId?: number;
    comment: string;
    ownerId: number;
}

interface ReplyPayload {
    commentId: number;
    userId: number;
    reply: string;
}

interface VotePayload {
    commentId: number;
    ownerId: number;
}

interface SeenPayload {
    to: number;
}

export const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const canUsersInteract = async (
    senderId: number,
    receiverId: number
) => {

    const count = await prisma.follow.count({
        where: {
            OR: [
                {
                    followerId: senderId,
                    followingId: receiverId,
                    messageAllowed: true
                },
                {
                    followerId: receiverId,
                    followingId: senderId,
                    messageAllowed: true
                }
            ]
        }
    });

    return count === 2;
};

const getFriendIds = async (
    userId: number
) => {

    const follows =
        await prisma.follow.findMany({
            where: {
                followerId: userId,
                messageAllowed: true
            },
            select: {
                followingId: true
            }
        });

    const followingIds =
        follows.map(
            (f) => f.followingId
        );

    if (
        followingIds.length === 0
    ) {
        return [];
    }

    const mutualFollows =
        await prisma.follow.findMany({
            where: {
                followerId: {
                    in: followingIds
                },
                followingId: userId,
                messageAllowed: true
            },
            select: {
                followerId: true
            }
        });

    return mutualFollows.map(
        (f) => f.followerId
    );
};

io.use(
    async (
        socket: UserSocket,
        next
    ) => {

        try {

            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers
                    ?.authorization;

            const t =
                token?.split(" ")[1];

            if (!t) {
                return next(
                    new Error(
                        "Unauthorized"
                    )
                );
            }

            const user =
                decodeToken(t);

            if (
                !user?.userId
            ) {
                return next(
                    new Error(
                        "Unauthorized"
                    )
                );
            }

            const dbUser =
                await prisma.user.findUnique({
                    where: {
                        id: Number(
                            user.userId
                        ),
                        email:
                            user.userEmail
                    }
                });

            if (!dbUser) {
                return next(
                    new Error(
                        "Unauthorized"
                    )
                );
            }

            socket.userId =
                dbUser.id;

            socket.userEmail =
                dbUser.email;

            next();

        } catch (err) {

            next(
                new Error(
                    "Unauthorized"
                )
            );

        }
    }
);

io.on(
    "connection",
    async (
        socket: UserSocket
    ) => {

        try {

            if (
                !socket.userId
            ) {
                socket.disconnect();
                return;
            }

            socket.join(
                `user:${socket.userId}`
            );

            await prisma.socketSession.create({
                data: {
                    socketId:
                        socket.id,
                    userId:
                        socket.userId
                }
            });

            const friendIds =
                await getFriendIds(
                    socket.userId
                );

            friendIds.forEach(
                (id) => {

                    io.to(
                        `user:${id}`
                    ).emit(
                        "active",
                        {
                            userId:
                                socket.userId
                        }
                    );

                }
            );

            socket.on(
                "typing",
                async (
                    data: TypingPayload
                ) => {

                    try {

                        const senderId =
                            socket.userId;

                        if (
                            !senderId
                        ) {
                            return;
                        }

                        const allowed =
                            await canUsersInteract(
                                senderId,
                                data.to
                            );

                        if (
                            !allowed
                        ) {
                            return;
                        }

                        io.to(
                            `user:${data.to}`
                        ).emit(
                            "typing",
                            {
                                from:
                                    senderId
                            }
                        );

                    } catch (err) {

                        console.log(
                            err
                        );

                    }
                }
            );

            socket.on(
                "stop-typing",
                async (
                    data: TypingPayload
                ) => {

                    try {

                        const senderId =
                            socket.userId;

                        if (
                            !senderId
                        ) {
                            return;
                        }

                        const allowed =
                            await canUsersInteract(
                                senderId,
                                data.to
                            );

                        if (
                            !allowed
                        ) {
                            return;
                        }

                        io.to(
                            `user:${data.to}`
                        ).emit(
                            "stop-typing",
                            {
                                from:
                                    senderId
                            }
                        );

                    } catch (err) {

                        console.log(
                            err
                        );

                    }
                }
            ); 

           

            

            socket.on(
                "disconnect",
                async () => {

                    try {

                        await prisma.socketSession.deleteMany({
                            where: {
                                socketId:
                                    socket.id
                            }
                        });

                        const friendIds =
                            await getFriendIds(
                                Number(
                                    socket.userId
                                )
                            );

                        friendIds.forEach(
                            (id) => {

                                io.to(
                                    `user:${id}`
                                ).emit(
                                    "inactive",
                                    {
                                        userId:
                                            socket.userId
                                    }
                                );

                            }
                        );

                    } catch (err) {

                        console.log(
                            err
                        );

                    }
                }
            );

        } catch (err) {

            console.log(err);
            socket.disconnect();

        }
    }
);




server.listen(
    PORT,
    () => {
        console.log(
            `Server running on PORT=${PORT}`
        );
    }
);