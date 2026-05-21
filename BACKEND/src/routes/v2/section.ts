import { Router } from "express"
import { authenticate, isInstructor, isItInstructorsCourse } from "../../middlewares/authmiddleware.js"

const router = Router()

// create a section
router.post('/:courseId', authenticate, isInstructor, isItInstructorsCourse)

//update a section
router.patch("/:sectionId", authenticate, isInstructor)

// delete a section
router.delete("/:sectionId", authenticate, isInstructor)

export default router