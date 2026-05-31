import { z } from 'zod'
import api from '../apiConnector'
import type { ChangePasswordSchema, ProfileSchema } from '../../types/z'


const userAPI = {
    getUserInfo: () => api.get('/user/info'),
    updateProfile: (data: z.infer<typeof ProfileSchema>) => api.patch('/user/profile', data),
    updateImage: (file: FormData) => api.patch('/user/image', file),
    checkUsernameAvailability: (username: string) => api.get(`/user/username/${username}`),
    changeUsername: (username: string) => api.patch(`/user/username/${username}`),
    passwordChange: (data: z.infer<typeof ChangePasswordSchema>) => api.patch('/user/password/change', data)
}


export default userAPI ;