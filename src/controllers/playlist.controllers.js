import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const ownerId = req.user._id

    if (!name) throw new ApiError(400, "Playlist name is required")

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: ownerId,
        videos: []
    })

    res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"))
})

// Get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")

    const playlists = await Playlist.find({ owner: userId }).populate("videos")

    res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

// Get playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if (!playlist) throw new ApiError(404, "Playlist not found")

    res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) throw new ApiError(404, "Playlist not found")

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"))
})

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) throw new ApiError(404, "Playlist not found")

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId.toString()
    )

    await playlist.save()

    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"))
})

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")

    const deleted = await Playlist.findByIdAndDelete(playlistId)

    if (!deleted) throw new ApiError(404, "Playlist not found")

    res.status(200).json(new ApiResponse(200, deleted, "Playlist deleted successfully"))
})

// Update playlist details
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    )

    if (!updatedPlaylist) throw new ApiError(404, "Playlist not found")

    res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
