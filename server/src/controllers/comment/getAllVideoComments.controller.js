import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js";
import { Comment } from "../../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {

    // TODO: Implement logic to fetch video comments from the database
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    };

    const getComments = await Comment.aggregate([
        {
            $match: {
                videoId: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "commentOwner",
                foreignField: "_id",
                as: "commentOwner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "commentLikes"
            }
        },
        {
            $addFields: {
                isLiked: {
                    $cond: {
                        if: !req.user,
                        then: false,
                        else: {
                            $cond: {
                                if: {
                                    $in: [req.user?._id, "$commentLikes.likedBy"]
                                },
                                then: true,
                                else: false
                            },
                        }
                    }
                },
                commentLikes: { $size: "$commentLikes" },
                commentOwner: {
                    $arrayElemAt: ["$commentOwner", 0]
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
    ])



    return res
        .status(200)
        .json(
            new ApiResponse(200, getComments, "Get All Comments Successfully")
        )
});

export { getVideoComments };