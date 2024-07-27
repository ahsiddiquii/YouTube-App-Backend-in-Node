import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js"
import { ApiResponse } from "../../utilities/apiResponse.js"
import { Like } from "../../models/like.model.js"
import mongoose from "mongoose";


const getUserLikedVideos = asyncHandler(async (req, res) => {


    try {

        const getLikedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline: [
                        {
                            $match: {
                                isPublished: true, // to filter only published videos
                            },
                        },
                        {
                            $project: {
                                description: 0,
                                isPublished: 0
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
                                            username: 1,
                                            title: 1
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            $addFields: {
                                views: {
                                    $size: "$views"
                                },
                                duration: {
                                    $concat: [
                                        {
                                            $toString: {
                                                $floor: {
                                                    $divide: ["$duration", 60]
                                                }
                                            }
                                        },
                                        ":",
                                        {
                                            $toString: {
                                                $floor: {
                                                    $mod: ["$duration", 60]
                                                }
                                            }
                                        }
                                    ]
                                },
                                videoUploader: {
                                    $arrayElemAt: ["$videoOwner", 0]
                                },
                            },
                        },
                    ]
                },
            },
            {
                $addFields: {
                    video: {
                        $arrayElemAt: ["$video", 0]
                    },
                },
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    likedBy: 0,
                    video: {
                        videoOwner: 0
                    }
                }
            }
        ])


        return res
            .status(200)
            .json(
                new ApiResponse(200, getLikedVideos, "Get liked videos successfully")
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to get liked videos");
    }


});

export { getUserLikedVideos }