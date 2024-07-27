import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../../models/user.model.js"
import { Subscription } from "../../models/subscription.model.js"
import { ApiError } from "../../utilities/apiError.js"
import { ApiResponse } from "../../utilities/apiResponse.js"
import { asyncHandler } from "../../utilities/asyncHandler.js"


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Id")
    }

    const channelsSubscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            avatar: 1,
                            createdAt: 1
                        }
                    },

                ]
            }
        },
        {
            $addFields: {
                channel: {
                    $arrayElemAt: ["$channel", 0]
                }
            }

        },
        {
            $project: {
                _id: 1,
                subscriber: 0
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, channelsSubscribed, "Successfully Get Channels Subscribed!")
        )
})

export { getSubscribedChannels }