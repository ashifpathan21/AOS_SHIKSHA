import { Router } from "express";
import UserRoutes from './v2/user.js'
import CourseRoutes from './v2/course.js'
import SectionRoutes from './v2/section.js'
import SubsectionRoutes from './v2/subsection.js'
const router = Router()

router.use('/user', UserRoutes)
router.use('/course/section/subsection', SubsectionRoutes)
router.use('/course/section', SectionRoutes)
router.use('/course', CourseRoutes)
export default router;