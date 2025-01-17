import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../../models/video.model.js";
import { User } from "../../models/user.model.js";


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // const isGuest = req.query.guest === "true";

    // 1
    if (!videoId.trim()) {
        throw new ApiError(400, "Video ID is missing!")
    };

    // 2 
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    };

    // 3
    await User.findByIdAndUpdate(req.user._id,
        {
            $addToSet: {
                watchHistory: videoId
            }
        }, { new: true }
    )
    // NOTE: 
    
    // $addToSet: This MongoDB update operator adds a value to an array only if the value doesn't already exist in the array. It ensures there are no duplicate entries in the watchHistory array.

    // OR 
    // const user = await User.findById(req.user._id);
    // const isAddedInWatchedHistory = user.watchHistory.includes(videoId);
    // if (!isAddedInWatchedHistory) {
    //     user.watchHistory.push(videoId);
    //     await user.save({ validateBeforeSave: false });
    // }

    // 4 
    await Video.findByIdAndUpdate(videoId,
        {
            $addToSet: {
                views: req.user?._id
            }
        }, { new: true }
    )
    // OR 
    // const videoClicked = await Video.findById(videoId);
    // console.log(videoClicked.views);
    // if (!videoClicked.views.includes(req.user?._id)) {
    //     videoClicked.views.push(req.user?._id);
    //     await videoClicked.save({ validateBeforeSave: false });
    // }


    // 5
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
                                    if: !req.user,
                                    then: false,
                                    else: {
                                        $cond: {
                                            if: {
                                                $in: [req.user?._id, "$subscribers.subscriber"],
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
                isLiked: {
                    $cond: {
                        if: !req.user,
                        then: false,
                        else: {
                            $cond: {
                                if: {
                                    $in: [req.user?._id, "$likes.likedBy"]
                                },
                                then: true,
                                else: false
                            },
                        }
                    }
                },
                durationInMinutesAndSecond: {
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
            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                durationInMinutesAndSecond: 1,
                viewsCount: 1,
                isPublished: 1,
                createdAt: 1,
                likes: 1,
                videoOwner: 1,
                isLiked: 1
            }
        }
    ]);

    // 6
    if (!video) {
        throw new ApiError(400, "Video not found!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video[0], "Video Successfully get by ID")
        )

});

export { getVideoById };