import { isValidObjectId } from "mongoose";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js";
import { Like } from "../../models/like.model.js";



const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id")
    }

    const findVideoLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if(findVideoLike){
        await Like.findByIdAndDelete(findVideoLike._id);
        return res
           .status(200)
           .json(
                new ApiResponse(
                    200, null, "Video Unliked successfully"
                )
            )
    }else{
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res
           .status(200)
           .json(
                new ApiResponse(
                    200, null, "Video Liked successfully"
                )
            )
    }

});
export { toggleVideoLike };