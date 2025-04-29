import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError } from "../utils/apierror";

import { asynchandler } from "../utils/asynchandler";
import { ApiResponse } from "../utils/apiresponse";


export const verfiyjwt=asynchandler(async (req,_,next)=>{
const token=req.cookies.accessToken || req.header("Authoriztaion ")?.replace("Bearer","")
if(!token){
    throw new ApiError(401,"unauthorised")
}
try {
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(401,"unauthorised")
    }


    req.user=user
    next()
} catch (error) {
    throw new ApiError(401,error?.message|| "invalid acess token")
}
})