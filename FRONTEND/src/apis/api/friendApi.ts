import { z } from "zod";
import api from "../apiConnector";


const friendAPI = {
    follow: (userId: number) => api.post(`/user/friend/${userId}`),
    unfollow: (userId: number) => api.delete(`/user/friend/${userId}`),
    allowToMessage: (userId: number) => api.patch(`/user/friend/${userId}`),
    searchUser: (username: string) => api.get(`/user/friend/search/${username}`),
    sendMessage: (receiverId: number, data: {
        message: string
    }) => api.post(`/user/friend/chat/${receiverId}`, data),
    seenMessage: (receiverId: number) => api.patch(`/user/friend/chat/${receiverId}`),
    deleteMessage:(chatId: number) => api.delete(`/user/friend/chat/${chatId}`),
    getAllChats:(receiverId: number) => api.get(`/user/friend/chat/${receiverId}`),
}

export default friendAPI;