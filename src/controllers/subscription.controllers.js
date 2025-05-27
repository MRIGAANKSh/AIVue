import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

// Toggle subscribe/unsubscribe to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (String(subscriberId) === String(channelId)) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
});

// Get list of subscribers to a specific channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username email");

    res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Get list of channels the user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username email");

    res.status(200).json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
