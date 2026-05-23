import { Router } from "express"
import { authenticate, isInstructor, isItInstructorsCourse, isStudent, isStudentEnrolled } from "../../middlewares/authmiddleware.js"
import { createSection, deleteSection, getAllSections, updateSection } from "../../controllers/sectionController.js"

const router = Router()

// create a section
router.post('/:courseId', authenticate, isInstructor, isItInstructorsCourse, createSection)

//update a section
router.patch("/:sectionId", authenticate, isInstructor, updateSection)

// delete a section
router.delete("/:sectionId", authenticate, isInstructor, deleteSection)


// get all section authenticate 
router.get('/:courseId', authenticate, getAllSections)

export default router