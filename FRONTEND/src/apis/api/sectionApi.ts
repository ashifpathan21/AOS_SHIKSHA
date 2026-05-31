import { z } from 'zod'
import api from "../apiConnector";
import { SectionSchema } from '../../types/z'


const sectionAPI = {
    addSection: (courseId: number, data: z.infer<typeof SectionSchema>) => api.post(`/course/subsection/${courseId}`, data),
    getAllSubsections: (courseId: number) => api.get(`/course/subsection/${courseId}`),
    updateSection: (sectionId: number, data: z.infer<typeof SectionSchema>) => api.patch(`/course/subsection/${sectionId}`, data),
    deleteSection: (sectionId: number) => api.delete(`/course/subsection/${sectionId}`),
}

export default sectionAPI;