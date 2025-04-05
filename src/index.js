import dotenv from "dotenv"
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./.env"
})
const port=process.env.PORT || 4000

connectDB()
.then(()=>{
    app.listen(port,(req,res)=>{
        console.log(`server is runnign on port ${port} `)
    })
})
.catch((err)=>{
    console.log("mongodb connection eoror ")
})

app.listen(port,(req,res)=>{
    console.log(`server is runnign on port ${port} `)
})