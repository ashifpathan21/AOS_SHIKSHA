import { Router } from "express";
import { authenticate, isStudent } from "../../middlewares/authmiddleware.js";
import { createComment, deleteComment, unvoteComment, updateComment, voteComment } from "../../controllers/commentController.js";
import { addReply, deleteReply } from "../../controllers/replyController.js";

const router = Router();

// comment on post
router.post('/post/:postId', authenticate, createComment);

router.post('/reply/:commentId', authenticate, addReply)

router.delete('/reply/:commentId', authenticate, deleteReply)

// comment on subsection
router.post('/:subsectionId', authenticate, createComment)

router.patch('/vote/:commentId', authenticate, voteComment)

router.patch('/unvote/:commentId', authenticate, unvoteComment)

router.patch('/:commentId', authenticate, updateComment);

router.delete('/:commentId', authenticate, deleteComment)



export default router