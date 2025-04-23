import { ApiResponse } from "../utils/apiresponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import {ApiError} from "../utils/apierror.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const registerUser=asynchandler(async (req,res)=>{
    //Todo
    const {Fullname,email,username,password}=req.body

    //validation
    if(
        [Fullname,username,email,password].some((field)=>field?.trim()===" ")
    ){
        throw new ApiError(400,"Fullname is required")
        
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400,"Username already present or with email already present")
    }


    const avatarloacalpath=req.files?.avatar[0]?.path
     const coverloacalpath=req.files?.coverImage[0]?.path

     if(!avatarloacalpath){
         throw new ApiError(400,"Aavtar file is missing");
     }

   const avatar= await  uploadOnCloudinary(avatarloacalpath)
   let coverImage=""
   if(coverloacalpath){
    const coverImage= await  uploadOnCloudinary(coverloacalpath)
   }
   

   const user=await User.create({
    Fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()

   })

   const createdUser=await User.findById(user_id).select("-password -refreshToken");

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registring a user")

   }

   return res
        .status(200)
        .json (new ApiResponse(200,createdUser,"user created suceesfully")); 

})

export{
    registerUser
}