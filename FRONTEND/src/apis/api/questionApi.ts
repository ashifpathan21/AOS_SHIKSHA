import { z } from 'zod'
import type { QuestionSchema, QuestionSubmitSchema } from '../../types/z'
import api from '../apiConnector'


const questionAPI = {
    addQuestionInSubsection: (subsectionId: number, data: z.infer<typeof QuestionSchema>) => api.post(`/course/question/subsection/${subsectionId}`, data),
    addQuestionInTest: (testId: number, data: z.infer<typeof QuestionSchema>) => api.post(`/course/question/test/${testId}`, data),
    updateQuestion: (questionId: number, data: z.infer<typeof QuestionSchema>) => api.patch(`/course/question/${questionId}`, data),
    submitQuestion: (questionId: number, data: z.infer<typeof QuestionSubmitSchema>) => api.patch(`/course/question/submit/${questionId}`, data),
    deleteQuestion: (questionId: number) => api.delete(`/course/question/${questionId}`)
}

export default questionAPI;