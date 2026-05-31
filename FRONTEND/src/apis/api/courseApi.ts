import api from '../apiConnector'
import { CourseSchema } from '../../types/z'

const courseAPI = {
    createCourse: (formData: FormData) => {
        try {
            const rawData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                status: formData.get('status'),
                file: formData.get('file'),
                price: Number(formData.get('price')),
                outcomes: formData.getAll('outcomes'),
                instructions: formData.getAll('instructions'),
            };
            CourseSchema.parse(rawData);
            return api.post('/course/', formData);
        } catch (error) {
            return error
        }
    },
    updateCourse: (courseId: number, formData: FormData) => {
        try {
            const rawData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                status: formData.get('status'),
                file: formData.get('file'),
                price: Number(formData.get('price')),
                outcomes: formData.getAll('outcomes'),
                instructions: formData.getAll('instructions'),
            };
            CourseSchema.parse(rawData);
            return api.post(`/course/${courseId}`, formData);
        } catch (error) {
            return error
        }
    },
    deleteCourse: (courseId: number) => api.delete(`/course/${courseId}`),
    getAllCourseBasicDetails: () => api.get('/course/'),
    getACourseBasicDetails: (courseId: number) => api.get(`course/${courseId}`),
    getUserEnrolledCourse: (courseId: number) => api.get(`/course/details/student/${courseId}`),
    getInstructorCourses: () => api.get('/course/instructor'),
    getInstructorCoures: (courseId: number) => api.get(`/course/details/instructor/${courseId}`),
    enrollInCourse: (courseId: number) => api.patch(`/course/enroll/${courseId}`),
    verifyCoursePayment: (courseId: number) => api.patch(`/course/enroll/verify/${courseId}`)
}

export default courseAPI