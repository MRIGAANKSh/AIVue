import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)

//middlewares common 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//import routes
import healthcheckrouter from "./routes/healthcheck.routes.js"
import { healthcheck } from "./controllers/healthcheck.controller.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js"

//routes
app.use("/api/v1/healthcheck",healthcheckrouter)
app.use("/api/v1/users",userRouter)



app.use(errorHandler)

export {app}