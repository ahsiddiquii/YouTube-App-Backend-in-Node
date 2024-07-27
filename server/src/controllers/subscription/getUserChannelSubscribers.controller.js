
import mongoose, { isValidObjectId } from "mongoose"
import { Subscription } from "../../models/subscription.model.js"
import { ApiError } from "../../utilities/apiError.js"
import { ApiResponse } from "../../utilities/apiResponse.js"
import { asyncHandler } from "../../utilities/asyncHandler.js"



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  };

  if (req.user?._id.toString() != channelId.toString()) {
    throw new ApiError(400, "Only user can their own subscribers")
};

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
              createdAt: 1
            },
          },
        ]
      },
    },
    {
      $addFields: {
        subscriber: {
          $arrayElemAt: ["$subscriber", 0]
        },
      }
    },
    {
      $project: {
        _id: 1,
        subscriber: 1,
        createdAt: 1,
        updatedAt: 1,
        subscriberCount: 1,
      },
    },

  ]);

  if (!channelSubscribers)
    throw new ApiError(500, "Fetching User Channel Subscribers failed");


  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscribers,
        "Subscribers fetched successfully"
      )
    )
})


export {
  getUserChannelSubscribers,
}