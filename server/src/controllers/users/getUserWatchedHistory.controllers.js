import { asyncHandler } from "../../utilities/asyncHandler.js";
import { User } from "../../models/user.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../../utilities/apiResponse.js";




const getUserWatchedHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchedHistory",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            videoDuration: 1,
                            viewCount: 1,
                            createdAt: 1,
                            videoUploader: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "videoUploader",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    },
                                },
                            ]
                        },
                    },
                    {
                        $addFields:{
                            videoOwner:{
                                $first: "$videoOwner"
                            },
                        },
                    },
                ]
            },
        },
        {
            $addFields: {
                watchedVideosCount: {
                    $size: "$watchedHistory"
                },
            }
        },
        {
            $project: {
                _id: 0,
                watchedHistory: 1,
                watchedVideosCount: 1
            }
        }
        
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0],
                "Fetched User Watched History Successfully"
            )
        )
});

export { getUserWatchedHistory }