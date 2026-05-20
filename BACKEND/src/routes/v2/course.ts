import { Router } from "express";
import { authenticate, isInstructor } from "../../middlewares/authmiddleware.js";
import { createCourse, deleteCourse, getAllCourseBasicDetails, getCourseBasicDetails, updateCourse } from "../../controllers/courseController.js";
const router = Router()

// create course
router.post('/', authenticate, isInstructor, createCourse)

//update course
router.patch('/:id', authenticate, isInstructor, updateCourse)

//delete course
router.delete('/:id', authenticate, isInstructor, deleteCourse)

// get all course basic details 
router.get('/', getAllCourseBasicDetails)

// get a single course basic details 
router.get('/:id', getCourseBasicDetails)

// get a authenticated course details for student
router.get('/details/student/:id')

// get a authenticated course details for instructor
router.get('/details/instructor/:id')

// get all instructor course 
router.get('/instructor')

//enroll into a course 
router.patch('/enroll/:id')



export default router