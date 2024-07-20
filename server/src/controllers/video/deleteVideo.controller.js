import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../../models/video.model.js";
import { User } from "../../models/user.model.js";
import { deleteFileFromCloudinary } from "../../utilities/cloudinary.config.js";


const deleteVideo = asyncHandler(async (req, res) => {
    // 1- Get Video Id from params to delete video . ✅
    // 2- Check if video Id is valid. ✅
    // 3- Check if user is video uploader/owner. ✅
    // 4- Split thumbnail's and video's public Id to delete it from cloudiary. ✅ 
    // 5- Remove this video from watch history. ✅
    // 6- Remove this video document from Database. ✅
    // 7- Remove video and thumbnail from cloudinary. ✅
    // 8- Send response to frontend. ✅

    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const videoToDelete = await Video.findById(videoId);
    if (videoToDelete.videoUploader.toString() != req.user?._id.toString()) {
        throw new ApiError(400, "Only video owner has rights to delete this video")
    }

    const videoPublicId = videoToDelete.videoFile.split('/').slice(-1)[0].split('.')[0];
    const thumbnailPublicId = videoToDelete.thumbnail.split('/').slice(-1)[0].split('.')[0];


    const removeVideoFromWatchedHistory = await User.updateMany(
        {
            watchHistory: {
                $in: [videoToDelete._id]
            }
        },
        {
            $pull: {
                watchHistory: videoToDelete._id
            }
        });
    if (!removeVideoFromWatchedHistory) {
        throw new ApiError(500, "Failed to remove video from watched history")
    }

    const videoDeleted = await Video.findByIdAndDelete(videoId);
    if (!videoDeleted) {
        throw new ApiError(404, "Video not found");
    }

    await deleteFileFromCloudinary(videoPublicId, "video");

    await deleteFileFromCloudinary(thumbnailPublicId, "image");

    return res
        .status(200)
        .json(
            new ApiResponse(200, videoDeleted, "Video delated successfully")
        )
});

export { deleteVideo };