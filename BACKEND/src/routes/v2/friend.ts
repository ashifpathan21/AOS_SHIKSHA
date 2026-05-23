import { Router } from "express";
import { authenticate } from "../../middlewares/authmiddleware.js";
import { allowToMessage, searchUsersByUsername, follow, unfollow, findAUser } from "../../controllers/friendshipController.js";
import { deleteMessage, getAllChats, seenMessage, sendMessage } from "../../controllers/chatController.js";
import { de } from "zod/locales";

const router = Router()
router.post('/chat/:receiverId', authenticate, sendMessage)
router.patch('/chat/:receiverId', authenticate, seenMessage)
router.delete('/chat/:chatId', authenticate, deleteMessage)
router.get('/chat/:receiverId', authenticate, getAllChats)
router.get('/search/:username', authenticate, searchUsersByUsername)
router.post('/:userId', authenticate, follow);
router.patch('/:userId', authenticate, allowToMessage)
router.delete('/:userId', authenticate, unfollow);

router.get('/:userId', authenticate, findAUser)

export default router;