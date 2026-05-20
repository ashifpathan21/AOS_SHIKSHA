import express from "express";
import V2Routes from "./routes/route.js";
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/api/v2', V2Routes)
app.get('/', (req, res) => {
    res.send('AOS-Shiksha 2.0 is now live !!')
})

export default app
