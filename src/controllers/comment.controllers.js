import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

// Get all comments for a video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.find({ video: videoId })
        .populate("user", "username avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))

    const total = await Comment.countDocuments({ video: videoId })

    res.status(200).json(new ApiResponse(200, {
        comments,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    }, "Comments fetched successfully"))
})

// Add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { text } = req.body
    const userId = req.user._id

    if (!text) {
        throw new ApiError(400, "Comment text is required")
    }

    const newComment = await Comment.create({
        user: userId,
        video: videoId,
        text
    })

    res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"))
})

// Update an existing comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { text } = req.body
    const userId = req.user._id

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only edit your own comments")
    }

    comment.text = text || comment.text
    await comment.save()

    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"))
})

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own comments")
    }

    await comment.deleteOne()

    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
