import { Router } from "express";
import { authenticate } from "../../middlewares/authmiddleware.js";
import { allowToMessage, searchUsersByUsername, follow, unfollow, findAUser } from "../../controllers/friendshipController.js";

const router = Router()

router.post('/:userId', authenticate, follow);
router.patch('/:userId', authenticate, allowToMessage)
router.delete('/:userId', authenticate, unfollow);

router.get('/search/:username', authenticate, searchUsersByUsername)
router.get('/:userId', authenticate, findAUser)

export default router;