import { ApiResponse } from "../utils/apiresponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import {ApiError} from "../utils/apierror.js"
const registerUser=asynchandler(async (req,res)=>{
    //Todo
    const {Fullname,email,username,password}=req.body

    //validation
    if(
        [Fullname,username,email,password].some((field)=>field?.trim()===" ")
    ){
        throw new ApiError(400,"Fullname is required")
        
    }
})

export{
    registerUser
}