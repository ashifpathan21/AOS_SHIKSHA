import { z } from "zod";
import api from "../apiConnector";
import type { PostSchema } from "../../types/z";

const postAPI = {
    createPost: (data: FormData) => api.post('/post', data),
    updatePost: (postId: number, data: z.infer<typeof PostSchema>) => api.patch(`/post/${postId}`, data),
    deletePost: (postId: number) => api.delete(`/post/${postId}`),
    getAPostById: (postId: number) => api.get(`/post/${postId}`),
    getUserAllPost: () => api.get('/post/all'),
    searchPosts: (query: string) => api.get(`/post/search?q=${query}`),
    getFeed: () => api.get('/post/feed'),
    likePost: (postId: number) => api.patch(`/post/like/${postId}`),
    unlikePost: (postId: number) => api.patch(`/post/unlike/${postId}`)
}

export default postAPI