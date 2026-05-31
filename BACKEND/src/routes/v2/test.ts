import { Router } from "express";
import { authenticate, isInstructor, isStudent } from "../../middlewares/authmiddleware.js";
import { createTest, deleteTest, submitTest, updateTest } from "../../controllers/testController.js";


const router = Router()

router.post('/:sectionId', authenticate, isInstructor, createTest);

router.patch('/submit/:testId', authenticate, isStudent, submitTest)

router.patch('/:testId', authenticate, isInstructor, updateTest)

router.delete('/:testId', authenticate, isInstructor, deleteTest)

export default router