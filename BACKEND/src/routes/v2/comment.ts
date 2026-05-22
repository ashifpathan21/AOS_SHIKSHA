import { Router } from "express";
import { authenticate, isStudent } from "../../middlewares/authmiddleware.js";
import { createComment, deleteComment, updateComment, voteComment } from "../../controllers/commentController.js";

const router = Router();

// comment on post
router.post('/:postId', authenticate, createComment);

// comment on subsection
router.post('/:subsectionId', authenticate, createComment)

router.patch('/vote/:commentId', authenticate, voteComment)

router.patch('/:commentId', authenticate, updateComment);

router.delete('/:commentId', authenticate, deleteComment)



export default router