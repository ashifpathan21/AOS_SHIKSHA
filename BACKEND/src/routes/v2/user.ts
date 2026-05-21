import { Router } from "express";
import { upload } from "../../utils/cloudinaryUpload.js";
import { googleLogin, login, resetPassword, resetPasswordRequest, signup, verifyOtp } from "../../controllers/authController.js";
import { authenticate } from "../../middlewares/authmiddleware.js";
import { getUserDetails, updateImage, updateProfile } from "../../controllers/userController.js";
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

router.get('/info', authenticate, getUserDetails)

router.patch('/profile', authenticate, updateProfile)

router.patch('/image', authenticate, upload.single('file'), updateImage)

router.post('/password/reset/request', resetPasswordRequest)

router.patch('/password/reset', resetPassword)

export default router;