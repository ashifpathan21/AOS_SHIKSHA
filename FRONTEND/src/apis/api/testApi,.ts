import { z } from 'zod'
import type { TestSchema, TestSubmissionSchema } from '../../types/z'
import api from '../apiConnector'

const testAPI = {
    createTest: (sectionId: number, data: z.infer<typeof TestSchema>) => api.post(`/course/section/test/${sectionId}`, data),
    updateTest: (testId: string, data: z.infer<typeof TestSchema>) => api.patch(`course/section/test/${testId}`, data),
    deleteTest: (testId: string) => api.delete(`/course/section/test/${testId}`),
    submitTest: (testId: string, data: z.infer<typeof TestSubmissionSchema>) => api.patch(`course/section/test/submit/${testId}`, data),
}

export default testAPI