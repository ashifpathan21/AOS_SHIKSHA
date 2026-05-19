import { createServer } from "http";
import app from './server.js'
const server = createServer(app)

server.listen(3000, () => {
    console.log("server is running on port 3000")
})