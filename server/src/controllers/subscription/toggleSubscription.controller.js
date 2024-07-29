import mongoose, { isValidObjectId } from "mongoose"
import { Subscription } from "../../models/subscription.model.js"
import { ApiError } from "../../utilities/apiError.js"
import { ApiResponse } from "../../utilities/apiResponse.js"
import { asyncHandler } from "../../utilities/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    // 1
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID!")
    };

    
    // 3
    if (req.user?._id.toString() == channelId.toString()) {
        throw new ApiError(400, "Self Subscription is not allow")
    };


    // 4
    const isSubscribed = await Subscription.findOne(
        {
            subscriber: req.user._id,
            channel: channelId,
        }
    );

    // 5
    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id);
        return res
            .status(200).json(new ApiResponse(200, null, "Channel Unsubscribed Successfully"))
    }
    else {
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Channel Successfully"))

    }

    
})



export { toggleSubscription }