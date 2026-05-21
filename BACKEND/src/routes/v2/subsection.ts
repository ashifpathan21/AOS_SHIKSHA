import { Router } from "express";
import { authenticate, isInstructor, isStudent } from "../../middlewares/authmiddleware.js";
import { createSubsection, deleteSubsection, updateProgress, updateSubsection } from "../../controllers/subsectionController.js";

const router = Router();

// create a sub-section
router.post('/:sectionId', authenticate, isInstructor, createSubsection)

router.patch('/progress/:subsectionId', authenticate, isStudent, updateProgress)

//update a section
router.patch("/:subsectionId", authenticate, isInstructor, updateSubsection)

// delete a section
router.delete("/:subsectionId", authenticate, isInstructor, deleteSubsection)


export default router;
