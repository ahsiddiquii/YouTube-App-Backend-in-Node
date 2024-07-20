import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../../models/video.model.js";


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // 1
    if (!videoId.trim()) {
        throw new ApiError("Video ID is missing!")
    };

    // 2 
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid Video ID")
    };

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
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
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscribers: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: isGuest,
                                    then: false,
                                    else: {
                                        $cond: {
                                            if: {
                                                $in: [req.user._id, "$subscribers.subscriber"],
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likes: {
                    $size: $likes
                },
                videoOwner: {
                    $arrayElemAt: ["$videoOwner", 0]
                },
                isLiked: {
                    $cond: {
                        if: isGuest,
                        then: false,
                        else: {
                            $cond: {
                                if: {
                                    $in: [req.user._id, "$likes.likedBy"]
                                },
                                then: true,
                                else: false
                            },
                        }
                    }
                }
            }
        },
        {

        }
    ]);

    if (!video) {
        throw new ApiError("Video not found!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video Successfully get by ID")
        )

});

export { getVideoById };