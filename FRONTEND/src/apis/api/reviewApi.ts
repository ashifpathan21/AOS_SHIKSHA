import { z } from 'zod'
import api from '../apiConnector'
import type { ReviewSchema } from '../../types/z'

const reviewAPI = {
    addReview: (courseId: number, data: z.infer<typeof ReviewSchema>) => api.post(`/course/review/${courseId}`, data),
    updateReview: (reviewId: number, data: z.infer<typeof ReviewSchema>) => api.patch(`/course/review/${reviewId}`, data),
    deleteReview: (reviewId: number) => api.delete(`/course/review/${reviewId}`)
}

export default reviewAPI