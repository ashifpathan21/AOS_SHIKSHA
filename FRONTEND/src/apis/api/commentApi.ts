import { z } from "zod";
import type { CommentSchema, ReplySchema, VoteSchema } from "../../types/z";
import api from "../apiConnector";


const commmentAPI = {
    addCommentOnPost: (postId: number, data: z.infer<typeof CommentSchema>) => api.post(`/comment/post/${postId}`, data),
    addCommentOnSubsection: (subsectionId: number, data: z.infer<typeof CommentSchema>) => api.post(`/comment/${subsectionId}`, data),
    updateComment: (commentId: number, data: z.infer<typeof CommentSchema>) => api.patch(`/comment/${commentId}`, data),
    deleteComment: (commentId: number) => api.delete(`/comment/${commentId}`),
    voteComment: (commentId: number, data: z.infer<typeof VoteSchema>) => api.patch(`/comment/vote/${commentId}`, data),
    unvoteComment: (commentId: number) => api.patch(`/comment/unvote/${commentId}`),
    addReply: (commentId: number, data: z.infer<typeof ReplySchema>) => api.post(`/comment/reply/${commentId}`, data),

    deleteReply: (commentId: number) => api.delete(`/comment/reply/${commentId}`),
}

export default commmentAPI;