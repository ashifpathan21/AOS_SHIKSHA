import { Router } from "express";
import { upload } from "../../utils/cloudinaryUpload.js";
import { googleLogin, login, resetPassword, resetPasswordRequest, signup, verifyOtp } from "../../controllers/authController.js";
import { authenticate } from "../../middlewares/authmiddleware.js";
import { changePassword, checkUserNameAvailability, getUserDetails, updateImage, updateProfile, updateUsername } from "../../controllers/userController.js";
const router = Router()


router.post('/signup', signup)

router.post('/otp/verify', verifyOtp)

router.post('/login', login)

router.get('/google/login', googleLogin)

router.get('/info', authenticate, getUserDetails)

router.patch('/profile', authenticate, updateProfile)

router.patch('/image', authenticate, upload.single('file'), updateImage)

router.get('/username/:username', authenticate, checkUserNameAvailability)

router.patch('/username/:username', authenticate, updateUsername)

router.post('/password/reset/request', resetPasswordRequest)

router.patch('/password/reset', resetPassword)

router.patch('/password/change', changePassword)

export default router;