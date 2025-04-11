import express from "express"
import cors from "cors"


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

//import routes
import healthcheckrouter from "./routes/healthcheck.routes.js"
import { healthcheck } from "./controllers/healthcheck.controller.js"


//routes
app.use("/api/v1/healthcheck",healthcheckrouter)




export {app}