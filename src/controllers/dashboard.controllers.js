import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

// Get channel statistics: views, likes, subscribers, videos
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    // 1. Total videos uploaded
    const videos = await Video.find({ owner: channelId })

    const totalVideos = videos.length
    const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0)

    // 2. Total likes on videos
    const videoIds = videos.map(video => video._id)
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } })

    // 3. Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId })

    const stats = {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    }

    res.status(200).json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

// Get all videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 })

    res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}
