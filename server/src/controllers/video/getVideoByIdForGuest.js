import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../../models/video.model.js";



const getVideoByIdForGuest = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    // const isGuest = req.query.guest === "true";

    // 1
    if (!videoId.trim()) {
        throw new ApiError("Video ID is missing!")
    };

    // 2 
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid Video ID")
    };


    // 3
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
                            isSubscribed: false,
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                            subscribersCount: 1,
                            isSubscribed: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                viewsCount: {
                    $size: "$views"
                },
                likes: {
                    $size: "$likes"
                },
                videoOwner: {
                    $arrayElemAt: ["$videoOwner", 0]
                },
                isLiked: false,
                durationInMinutesAndSeconds: {
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
            },
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                durationInMinutesAndSeconds: 1,
                viewsCount: 1,
                isPublished: 1,
                createdAt: 1,
                likes: 1,
                videoOwner: 1,
                isLiked: 1
            }
        }
    ]);

    // 4
    if (!video) {
        throw new ApiError("Video not found!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse("200", video[0], "Video successfully fetched")
        )
});

export { getVideoByIdForGuest };
