import Razorpay from "razorpay";
import 'dotenv/config'

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
})

export default instance