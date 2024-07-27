import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { Like } from "../../models/like.model.js";
import { ApiError } from "../../utilities/apiError.js";
import { ApiResponse } from "../../utilities/apiResponse.js";

const toggleTweetLike = asyncHandler(async ()=> {

const {tweetId} = req.params;

if(!isValidObjectId(tweetId)){
    throw new ApiError(400, "Invalid tweetId");
};

const findLikedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id
});

if (findLikedTweet) {
    await Like.findByIdAndDelete(findLikedTweet._id);
    return res 
    .status(200)
    .json(
        new ApiResponse(200, null, "Unliked the tweet successfully")
    )
} else {
    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });
    return res 
    .status(200)
    .json(
        new ApiResponse(200, null, "Liked the tweet successfully")
    )
}


});

export {toggleTweetLike}