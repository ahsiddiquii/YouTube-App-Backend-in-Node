import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js";
import { Like } from "../../models/like.model.js";
import { ApiResponse } from "../../utilities/apiResponse.js";



const toggleCommentLike = asyncHandler(async () => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid Comment Id");

    const findLikedComment = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (findLikedComment) {
        await Like.findByIdAndDelete(findLikedComment._id);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, null, "Unlike Comment Successfully"
                )
            );
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
    }

});

export { toggleCommentLike };