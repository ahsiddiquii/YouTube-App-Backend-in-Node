import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../../models/video.model.js";

const toggleVideoPublishStatus = asyncHandler(async (req, res) => {
    // 1- Get Video Id from params to toggle video status. ✅
    // 2- Check if video Id is valid. ✅
    // 3- Check if user is video uploader. ✅
    // 4- Toggle video status. ✅
    // 5- Send updated video status to frontend. ✅
    
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    };
    const videoDetails = await Video.findById(videoId);
    if (videoDetails.videoUploader.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to perform this action");
    }
   
    videoDetails.isPublished = !videoDetails.isPublished;
    await videoDetails.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { ispublished: videoDetails.isPublished }, "Video status toggled successfully")
        )
});

export { toggleVideoPublishStatus };