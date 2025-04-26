import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deletefromCloudinary } from "../utils/cloudinary.js";

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

export {
    registerUser
};
