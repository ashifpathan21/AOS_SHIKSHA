import { Router } from "express";
import UserRoutes from './v2/user.js'
import CourseRoutes from './v2/course.js'
const router = Router()

router.use('/user', UserRoutes)
router.use('/course', CourseRoutes)

export default router;