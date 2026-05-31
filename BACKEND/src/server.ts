import express, { type Request, type Response } from "express";
import V2Routes from "./routes/route.js";
import cors from 'cors'
import 'dotenv/config'


const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [process.env.FRONTEND_URI || "http://localhost:5173"]
}))
app.use('/api/v2', V2Routes)
app.get('/api/v2', (req: Request, res: Response) => {
    res.send("Api V2 is Live")
})
app.get('/', (req, res) => {
    res.send('AOS-Shiksha 2.0 is now live !!')
})

export default app
