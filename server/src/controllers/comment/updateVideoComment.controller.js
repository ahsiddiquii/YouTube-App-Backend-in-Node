import { isValidObjectId } from "mongoose";
import { ApiError } from "../../utilities/apiError.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { Comment } from "../../models/comment.model.js";
import { ApiResponse } from "../../utilities/apiResponse.js";



const updateComment = asyncHandler(async (req, res) => {
    const { updatedCommentContent } = req.body;
    const { commentId } = req.params;

    if (!updatedCommentContent) {
        throw new ApiError(400, "Comment Content is required!");
    };

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    };

    const findCommentToEdit = await Comment.findById(commentId);
    if (!findCommentToEdit) {
        throw new ApiError(400, "Sorry such Comment not found!");
    };

    if (findCommentToEdit.commentOwner.toString() !== req.user?._id.toString().trim()) {
        throw new ApiError(400, "Only comment owner can update their commnet");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                commentContent: updatedCommentContent,
            }
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(400, "Comment is not updated");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )

});

export { updateComment }