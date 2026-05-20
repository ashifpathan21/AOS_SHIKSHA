import { Router, type Request, type Response } from "express";
import { upload, uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { googleLogin, login, signup, verifyOtp } from "../../controllers/authController.js";
import { authenticate } from "../../middlewares/authmiddleware.js";
const router = Router()

/**
 * -------------------------------------------------------------------------------
 * |                           USER ROUTES                                       |
 * |(SIGNUP , LOGIN , OTP_VERIFY  , GOOGLE_LOGIN , UPDATE_PROFILE , UPDATE_IMAGE)|                                                          |
 * -------------------------------------------------------------------------------
 */

router.post('/signup', signup)

router.post('/otp/verify', verifyOtp)

router.post('/login', login)

router.get('/google/login', googleLogin)

router.patch('/profile', authenticate, (req: Request, res: Response) => { })

router.patch('/image', authenticate, upload.single('file'), (req: Request, res: Response) => { })

export default router;