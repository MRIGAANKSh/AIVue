import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB=async()=>{
    try{
        const connectInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        console.log("MongoDb connected")
        console.log(`\n ${connectInstance.connection.host}`)
    }
    catch(err){
        console.log("MongoDb Connection eoror ",err)
        process.exit(1)
    }
}

export default connectDB