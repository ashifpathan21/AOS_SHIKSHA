import { Router } from "express";
import { authenticate, isInstructor, isItInstructorsCourse, isStudent, isStudentEnrolled } from "../../middlewares/authmiddleware.js";
import { createCourse, deleteCourse, getAllCourseBasicDetails, getAllCoursesForInstructor, getCourseBasicDetails, getCourseDetailsForInstructor, getCourseDetailsForStudent, updateCourse } from "../../controllers/courseController.js";
import { upload } from "../../utils/cloudinaryUpload.js";
import { capturePayment, verifyPayment } from "../../controllers/paymentController.js";
const router = Router()

// create course
router.post('/', authenticate, isInstructor, upload.single("file"), createCourse)

//update course
router.patch('/:courseId', authenticate, isInstructor, isItInstructorsCourse, upload.single("file"), updateCourse)

//delete course
router.delete('/:courseId', authenticate, isInstructor, isItInstructorsCourse, deleteCourse)

// get all course basic details 
router.get('/', getAllCourseBasicDetails)


// get a authenticated course details for student
router.get('/details/student/:courseId', authenticate, isStudent, isStudentEnrolled, getCourseDetailsForStudent)

// get a authenticated course details for instructor
router.get('/details/instructor/:courseId', authenticate, isInstructor, isItInstructorsCourse, getCourseDetailsForInstructor)

// get all instructor course 
router.get('/instructor', authenticate, isInstructor, getAllCoursesForInstructor)

//enroll into a course is price === 0 or create a payment instance 
router.patch('/enroll/:courseId', authenticate, isStudent, capturePayment)

// verify the payment
router.patch('/enroll/verify/:courseId', authenticate, isStudent, verifyPayment)


// get a single course basic details 
router.get('/:coureId', getCourseBasicDetails)

export default router