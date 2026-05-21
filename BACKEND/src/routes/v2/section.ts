import { Router } from "express"
import { authenticate, isInstructor, isItInstructorsCourse } from "../../middlewares/authmiddleware.js"
import { createSection, deleteSection, updateSection } from "../../controllers/sectionController.js"

const router = Router()

// create a section
router.post('/:courseId', authenticate, isInstructor, isItInstructorsCourse, createSection)

//update a section
router.patch("/:sectionId", authenticate, isInstructor, updateSection)

// delete a section
router.delete("/:sectionId", authenticate, isInstructor, deleteSection)

export default router