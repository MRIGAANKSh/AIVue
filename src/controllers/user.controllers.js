import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deletefromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"



const generateAccessandRefreshToken=async (userId)=>{
    try {
        const user=await User.findById(userId)
        
        if(!user){
            throw new ApiError(500,"user not found");
        }
    
        const acesstoken=user.generateAcessToken()
        const refreshtoken=user.generateRefreshToken()
    
    
        user.refreshtoken=refreshtoken
        await user.save({validateBeforeSave:false})
        return {acesstoken,refreshtoken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating acess token");
    }

}


const registerUser = asynchandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    // Validation for empty or missing fields
    if (!fullname || !username || !email || !password ||
        [fullname, username, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(400, "Username or email already exists");
    }

    // Multer file paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    let avatar, coverImage;

    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded avatar:", avatar.url);
    } catch (error) {
        console.error("Error uploading avatar:", error.message || error);
        throw new ApiError(500, "Failed to upload avatar");
    }

    if (coverLocalPath) {
        try {
            coverImage = await uploadOnCloudinary(coverLocalPath);
            console.log("Uploaded cover image:", coverImage.url);
        } catch (error) {
            console.error("Error uploading cover image:", error.message || error);
            throw new ApiError(500, "Failed to upload cover image");
        }
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverimage: coverImage?.url || "", // Note: matches your model's field name
            email,
            password,
            username: username.toLowerCase()
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User created successfully"));

    } catch (error) {
        console.error("User creation failed:", error.message || error);

        // Clean up uploaded files from Cloudinary
        if (avatar?.public_id) await deletefromCloudinary(avatar.public_id);
        if (coverImage?.public_id) await deletefromCloudinary(coverImage.public_id);

        throw new ApiError(500, "Registration failed. Uploaded images have been deleted.");
    }
});



const loginuser=asynchandler(async (req,res)=>{
    //get a data from body
    const {email,username,password}=req.body

    //validation
    if(!email){
        throw new ApiError(500,"Email is not there");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(!user){
        throw new ApiError(500,"user not found")
    }

    //validte password
   const isPasswordValid= await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401,"invalid credentials")
   }


   const {acesstoken,refreshtoken}=await generateAccessandRefreshToken(user._id)


   const loggedInUser=await user.findById(user._id).select("-password -refreshToken");


   const options={
    httpOnly:true,
    secure:process.env.NODE_ENV==="production"

   }

   return res
   .status(200)
   .cookie("acessToken",acesstoken,options)
   .cookie("refreshToken",refreshtoken,options)
   .json(new ApiResponse(200,{loggedInUser,acesstoken,refreshtoken},"User logged in sucessfully"))

})

const logoutuser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        //need to back
        req.user._id,
        

    )
})

const refreshAcessToken=asynchandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshtoken || req.body.refreshtoken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token is correct");
    }

    try {
       const decodedToken= jwt.verify(
            incomingRefreshToken.process.env.REFRESH_TOKEN_SECRET
        )
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"user not found");
        }
        if( user.refreshtoken!==incomingRefreshToken){
            throw new ApiError(401,"invalid");
        }



        const options ={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production"
        }

       const {acesstoken,refreshtoken:newRefreshToken}= await generateAccessandRefreshToken(user._id)
       return res
            .status(200)
            .cookie("accessToken",acesstoken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(new ApiResponse(200,{acesstoken,refreshtoken:newRefreshToken},"Acess token refreshed succsfully"))


    } catch (error) {
        throw new ApiError(500,"error refresh token ")
    }
})

export {
    registerUser,
    loginuser,
    refreshAcessToken
};
