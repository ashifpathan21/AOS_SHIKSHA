import { Router, type NextFunction, type Response } from "express";
import { authenticate } from "../../middlewares/authmiddleware.js";
import { upload } from "../../utils/cloudinaryUpload.js";
import { createPost, deletePost, getAPost, likeAPost, unlikeAPost, updatePost, userAllPost } from "../../controllers/postController.js";
import { getExploreFeed, searchPosts } from "../../controllers/exploreFeedController.js";
import type { UserRequest } from "../../types/express/index.js";
import { decodeToken } from "../../utils/jwt.js";
import prisma from "../../utils/db.js";

const router = Router()

//create a post
router.post('/', authenticate, upload.array("file", 4), createPost)

// like a post 
router.patch('/like/:postId', authenticate, likeAPost)

// unlike a post 
router.patch('/unlike/:postId', authenticate, unlikeAPost)

// update post's caption 
router.patch('/:postId', authenticate, updatePost)


//search feed 
router.get('/search', authenticate, searchPosts)


//feed 
router.get("/feed", async (req: UserRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
        const data = decodeToken(token)
        if (!data || !data.userId || !data.userEmail) {
            return next()
        }
        const user = await prisma.user.findFirst({
            where: {
                id: data?.userId,
                email: data?.userEmail
            }
        })
        if (user) {
            req.user = {
                id: user?.id,
                email: user?.email
            }
        }
    }
    return next()
}, getExploreFeed)


// user get its all post 
router.get("/all", authenticate, userAllPost)

// get a post by id 
router.get('/:postId', getAPost)

//delete a post 
router.delete("/:postId", authenticate, deletePost)

export default router