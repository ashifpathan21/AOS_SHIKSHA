import { z } from "zod";
import type { ProgressSchema, SubsectionSchema } from "../../types/z";
import api from "../apiConnector";


const subsectionAPI = {
    addSubsection: (sectionId: number, data: z.infer<typeof SubsectionSchema>) => api.post(`/course/section/subsection/${sectionId}`, data),
    updateSubsection: (subsectionId: number, data: z.infer<typeof SubsectionSchema>) => api.patch(`/course/section/subsection/${subsectionId}`, data),
    deleteSubsection: (subsectionId: number) => api.delete(`/course/section/subsection/${subsectionId}`),
    updateProgress: (subsectionId: number, data: z.infer<typeof ProgressSchema>) => api.patch(`/course/section/subsection/progress/${subsectionId}`, data),
}

export default subsectionAPI;
