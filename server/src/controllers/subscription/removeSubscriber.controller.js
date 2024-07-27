import mongoose, { isValidObjectId } from "mongoose"
import { Subscription } from "../../models/subscription.model.js"
import { ApiError } from "../../utilities/apiError.js"
import { ApiResponse } from "../../utilities/apiResponse.js"
import { asyncHandler } from "../../utilities/asyncHandler.js"


const removeSubscriber = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    // 1
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID!")
    };

    // 2
    const isSubscribed = await Subscription.findOne(
        {
            subscriber: channelId,
            channel: req.user._id,
        }
    );

    // 5
    if (!isSubscribed) {
        throw new ApiError(400, "Subscriber not found!")
    }
    await Subscription.findByIdAndDelete(isSubscribed?._id);

    return res
    .status(200).json(new ApiResponse(200, null, "Remove Subscriber Successfully"))

})



export { removeSubscriber }