import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { User } from "../../models/user.model.js";



const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params
    if (!username.trim()) {
        throw new ApiError(404, "Channel username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "channelsSubscribed"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelsSubscribedCount: { $size: "$channelsSubscribed" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubscribedCount: 1,
                isSubscribed: 1
            }
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel doesn't exist")
    }



    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

})

export { getUserChannelProfile }