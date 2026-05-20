import { Router } from "express";
import UserRoutes from './v2/user.js'
const router = Router()

router.use('/user', UserRoutes)


export default router;