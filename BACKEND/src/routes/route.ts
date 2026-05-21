import { Router } from "express";
import UserRoutes from './v2/user.js'
import CourseRoutes from './v2/course.js'
import SectionRoutes from './v2/section.js'
const router = Router()

router.use('/user', UserRoutes)
router.use('/course', CourseRoutes)
router.use('/course/section', SectionRoutes)

export default router;