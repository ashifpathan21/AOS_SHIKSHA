import { Router } from "express";
import { authenticate, isInstructor, isStudent } from "../../middlewares/authmiddleware.js";
import { createQuestion, deleteQuestion, updateQuestion } from "../../controllers/questionController.js";

const router = Router();


router.post('/subsection/:subsectionId', authenticate, isInstructor, createQuestion)

router.post('/test/:testId', authenticate, isInstructor, createQuestion)

router.patch('/:questionId', authenticate, isInstructor, updateQuestion)

router.delete('/:questionId', authenticate, isInstructor, deleteQuestion)

router.patch('/submit/:questionId', authenticate, isStudent)



export default router;