import { Router } from "express";
import { authenticate, isStudent, isStudentEnrolled } from "../../middlewares/authmiddleware.js";
import { addReview, deleteReview, updateReview } from "../../controllers/reviewController.js";

const router = Router()

router.post("/:courseId", authenticate, isStudent, isStudentEnrolled, addReview);

router.patch('/:reviewId', authenticate, isStudent, updateReview)

router.delete('/:reviewId', authenticate, isStudent, deleteReview)

export default router;
