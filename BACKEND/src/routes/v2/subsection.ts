import { Router } from "express";
import { authenticate, isInstructor } from "../../middlewares/authmiddleware.js";
import { createSubsection, deleteSubsection, updateSubsection } from "../../controllers/subsectionController.js";

const router = Router();

// create a sub-section
router.post('/:sectionId', authenticate, isInstructor, createSubsection)

//update a section
router.patch("/:subsectionId", authenticate, isInstructor, updateSubsection)

// delete a section
router.delete("/:subsectionId", authenticate, isInstructor, deleteSubsection)


export default router;
