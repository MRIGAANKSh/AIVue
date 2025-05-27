import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

// GET all videos with pagination, sorting and filtering
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOrder = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Video.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, { videos, total, page, totalPages: Math.ceil(total / limit) }, "Videos fetched successfully"));
});

// POST: Publish a video (upload to Cloudinary and save in DB)
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!req.files || !req.files.video) {
        throw new ApiError(400, "Video file is required");
    }

    const videoFile = req.files.video;
    const uploadResult = await uploadOnCloudinary(videoFile.tempFilePath, "video");

    if (!uploadResult || !uploadResult.secure_url) {
        throw new ApiError(500, "Video upload failed");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoUrl: uploadResult.secure_url,
        owner: req.user._id,
        isPublished: true,
    });

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

// GET: Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username email");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// PUT: Update video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    // Optional: Update thumbnail
    if (req.files && req.files.thumbnail) {
        const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail.tempFilePath, "image");
        video.thumbnail = thumbnailUpload.secure_url;
    }

    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

// DELETE: Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "Unauthorized to delete this video");
    }

    await video.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

// PATCH: Toggle publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
