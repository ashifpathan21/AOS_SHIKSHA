import { createServer } from "http";
import 'dotenv/config'
import app from './server.js'

const server = createServer(app)
const PORT = process.env.PORT || 3000;



server.listen(PORT, () => {
    console.log(`Server is running on PORT=${PORT}`)
})