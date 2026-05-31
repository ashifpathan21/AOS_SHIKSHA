import api from "./apiConnector"
import { z } from "zod"
import type { LoginSchema, OTPSchema, ResetPasswordRequestSchema, ResetPasswordSchema, SignupSchema } from '../types/z'

const authApi = {
    googleLogin: (code: string) => api.get(`/user/google/login?code=${code}`),
    googleLoginInstructor: (code: string) => api.get(`/user/instructor/google/login?code=${code}`),
    signup: (data: z.infer<typeof SignupSchema>) => api.post('/user/signup', data),
    verifyOTP: (data: z.infer<typeof OTPSchema>) => api.post('/user/otp/verify', data),
    login: (data: z.infer<typeof LoginSchema>) => api.post('/user/login', data),
    resetPasswordRequest: (data: z.infer<typeof ResetPasswordRequestSchema>) => api.post('/user/password/reset/request', data),
    resetPassword: (data: z.infer<typeof ResetPasswordSchema>) => api.patch('/password/reset', data)
}

export default authApi;