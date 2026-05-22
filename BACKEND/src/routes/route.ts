import { Router } from "express";
import UserRoutes from './v2/user.js'
import CourseRoutes from './v2/course.js'
import SectionRoutes from './v2/section.js'
import SubsectionRoutes from './v2/subsection.js'
import QuestionRoutes from './v2/question.js'
import CommentRoutes from './v2/comment.js'
import PostRoutes from './v2/post.js'
const router = Router()

router.use('/user', UserRoutes)
router.use('/comment', CommentRoutes)
router.use('/post', PostRoutes)
router.use('/course/section/subsection', SubsectionRoutes)
router.use('/course/section', SectionRoutes)
router.use('/course/question', QuestionRoutes)
router.use('/course', CourseRoutes)
export default router;