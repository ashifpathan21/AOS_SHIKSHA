import { Router } from "express";
import { authenticate } from "../../middlewares/authmiddleware.js";
import { upload } from "../../utils/cloudinaryUpload.js";
import { createPost, deletePost, getAPost, likeAPost, unlikeAPost, updatePost, userAllPost } from "../../controllers/postController.js";

const router = Router()

//create a post
router.post('/', authenticate, upload.array("file", 4), createPost)

// like a post 
router.patch('/like/:postId', authenticate, likeAPost)

// unlike a post 
router.patch('/unlike/:postId', authenticate, unlikeAPost)

// update post's caption 
router.patch('/:postId', authenticate, updatePost)

// user get its all post 
router.get("/all", authenticate, userAllPost)

// get a post by id 
router.get('/:postId', getAPost)

//delete a post 
router.delete("/:postId", authenticate, deletePost)

export default router