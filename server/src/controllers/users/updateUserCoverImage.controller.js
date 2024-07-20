import { User } from "../../models/user.model.js";
import { ApiError } from "../../utilities/apiError.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { fileUploadOnCloudinary, deleteFileFromCloudinary } from "../../utilities/cloudinary.config.js";

const updateUserCoverImage = asyncHandler(async (req, res) => {

    // 1
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image not found!")
    }

    // 2
    const updatedCoverImage = await fileUploadOnCloudinary(coverImageLocalPath);
    if (!updatedCoverImage.url) {
        throw new ApiError(400, "Error uploading cover image to cloudinary!")
    }

    // 3
    // const updatedUser = await User.findByIdAndUpdate(req.user?._id, {
    //     $set: {
    //         coverImage: updatedCoverImage.url
    //     }
    // }, { new: true }).select("-password");
    // if (!updatedUser) {
    //     throw new ApiError(500, "Error updating avatar!");
    // }
    // OR 
    const user = await User.findById(req.user?._id).select("-password");
    const userOldCoverImageURL = user.coverImage;
    const publicIdofOldCoverImage = userOldCoverImageURL.split('/').slice(-1)[0].split('.')[0];
    // console.log(publpublicIdofOldCoverImageicId);
    // console.log(userOldCoverImageURL)

    user.coverImage = updatedCoverImage.url;
    await user.save({ validateBeforeSave: false });

    //4
    await deleteFileFromCloudinary(publicIdofOldCoverImage, "image");

    // 4
    return res
        .status(200)
        .json(new ApiResponse(200, user , "Cover Image Updated Successfully"))
});

export { updateUserCoverImage }