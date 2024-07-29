import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js";
import { Comment } from "../../models/comment.model.js";
import { ApiResponse } from "../../utilities/apiResponse.js";

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentID");
    }

    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
        throw new ApiError(400, "Comment not found!");
    };

    if (commentToDelete.commentOwner.toString() !== req.user?._id.toString().trim()) {
        throw new ApiError(400, "Only comment owner can update their commnet");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentToDelete);

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200, deletedComment, "Comment deleted successfully"
        )
    )

});

export { deleteComment }


