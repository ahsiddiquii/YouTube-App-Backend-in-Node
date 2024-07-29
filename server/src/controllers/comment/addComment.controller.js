import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js"
import { ApiResponse } from "../../utilities/apiResponse.js"
import { Comment } from "../../models/comment.model.js";
import { Video } from "../../models/video.model.js";



const addComment = asyncHandler(async (req, res) => {
    const { commentContent } = req.body;
    const { videoId } = req.params;

    if (!commentContent) {
        throw new ApiError(400, "Comment content is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    };

    const isVideoFound = await Video.findById(videoId);
    if (!isVideoFound) {
        throw new ApiError(400, "Such Video Not Found!")
    }

    const commentAdded = await Comment.create({
        commentContent: commentContent,
        videoId: videoId,
        commentOwner: req.user?._id
    });

    if (!commentAdded) {
        throw new ApiError(400, "Error occured while commenting on that video!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, commentAdded, `Comment Successfully Added on Video ${videoId}`
            )
        )

});

export { addComment }